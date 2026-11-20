#!/usr/bin/env node
/**
 * Rotate MetU off legacy anon/service_role JWTs onto new sb_publishable / sb_secret keys,
 * then sync .env.local → Vercel and optionally disable legacy keys.
 * Never prints secret values.
 *
 * Usage: node scripts/rotate-supabase-keys.mjs
 */
import { execFileSync, execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  mkdtempSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF = "jlcdewbwbtfwasnpqfcj";
const environments = "production,preview,development";

function shJson(cmd) {
  const out = execSync(cmd, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });
  const start = out.search(/[\[{]/);
  if (start < 0) throw new Error("no-json-in-cli-output");
  const parsed = JSON.parse(out.slice(start));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.keys)) return parsed.keys;
  if (Array.isArray(parsed?.data)) return parsed.data;
  throw new Error(`unexpected-cli-json:${typeof parsed}`);
}

function upsertLocalEnv(path, updates) {
  const raw = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = raw.length ? raw.split(/\r?\n/) : [];
  const seen = new Set();
  const out = lines.map((line) => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (!m || !(m[1] in updates)) return line;
    seen.add(m[1]);
    return `${m[1]}=${updates[m[1]]}`;
  });
  for (const [k, v] of Object.entries(updates)) {
    if (!seen.has(k)) out.push(`${k}=${v}`);
  }
  while (out.length && out[out.length - 1] === "") out.pop();
  writeFileSync(path, `${out.join("\n")}\n`, { mode: 0o600 });
}

function readWindowsSupabaseToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  // Credential blob is UTF-8 (sbp_…), not UTF-16. Never print value.
  const ps1 = join(root, "scripts", "_read-supabase-token.ps1");
  writeFileSync(
    ps1,
    `Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class CredUtf8 {
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool CredRead(string target, int type, int flags, out IntPtr cred);
  [DllImport("advapi32.dll")] public static extern void CredFree(IntPtr cred);
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct CREDENTIAL {
    public int Flags; public int Type; public IntPtr TargetName; public IntPtr Comment;
    public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob;
    public int Persist; public int AttributeCount; public IntPtr Attributes;
    public IntPtr TargetAlias; public IntPtr UserName;
  }
  public static string Read(string target) {
    IntPtr p;
    if (!CredRead(target, 1, 0, out p)) return "";
    var c = (CREDENTIAL)Marshal.PtrToStructure(p, typeof(CREDENTIAL));
    var bytes = new byte[c.CredentialBlobSize];
    Marshal.Copy(c.CredentialBlob, bytes, 0, c.CredentialBlobSize);
    CredFree(p);
    return Encoding.UTF8.GetString(bytes).TrimEnd((char)0).Trim();
  }
}
"@
[Console]::Out.Write([CredUtf8]::Read('Supabase CLI:supabase'))
`,
    { mode: 0o600 }
  );
  try {
    const token = execFileSync(
      "powershell.exe",
      ["-NoProfile", "-File", ps1],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();
    if (!token || !/^sbp_/.test(token)) return null;
    return token;
  } catch {
    return null;
  } finally {
    try {
      unlinkSync(ps1);
    } catch {
      /* ignore */
    }
  }
}

async function api(token, method, path, body) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }
  );
  const text = await res.text();
  let parsed = null;
  if (text.trim()) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`bad-json-status:${res.status}`);
    }
  }
  if (!res.ok) {
    const msg =
      typeof parsed?.message === "string"
        ? parsed.message
        : typeof parsed?.error === "string"
          ? parsed.error
          : `HTTP ${res.status}`;
    throw new Error(`api-failed:${msg}`);
  }
  return parsed;
}

function pickApiKey(res) {
  if (!res) return null;
  if (typeof res.api_key === "string") return res.api_key;
  if (typeof res.apiKey === "string") return res.apiKey;
  if (typeof res.key === "string") return res.key;
  if (Array.isArray(res) && typeof res[0]?.api_key === "string") {
    return res[0].api_key;
  }
  return null;
}

function vercelAdd(key, value, sensitive) {
  const tmp = join(tmpdir(), `vercel-env-${randomBytes(8).toString("hex")}`);
  writeFileSync(tmp, value, { mode: 0o600 });
  try {
    const flags = [
      "vercel",
      "env",
      "add",
      key,
      "--environment",
      environments,
      "--force",
      "--yes",
      sensitive ? "--sensitive" : "--no-sensitive",
    ].join(" ");
    execSync(`Get-Content -Raw -LiteralPath '${tmp}' | npx ${flags}`, {
      cwd: root,
      shell: "powershell.exe",
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });
    console.log(`vercel ← ${key} ok`);
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

console.log("1) listing current api keys (metadata only)…");
const listed = shJson(
  "npx supabase projects api-keys --output-format json"
);
for (const k of listed) {
  console.log(
    `  - type=${k.type} name=${k.name || k.description || "-"} id=${(k.id || "").slice(0, 8)}…`
  );
}

const token = readWindowsSupabaseToken();
if (!token) {
  console.error(
    "Supabase access token not found. Run `npx supabase login` or set SUPABASE_ACCESS_TOKEN."
  );
  process.exit(1);
}
console.log("2) access token loaded (not printed)");

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const secretName = `rotated_secret_${stamp}`;
const pubName = `rotated_publishable_${stamp}`;

console.log(`3) creating ${secretName} + ${pubName}…`);
let secretKey;
let publishableKey;
try {
  const secretRes = await api(token, "POST", "/api-keys?reveal=true", {
    type: "secret",
    name: secretName,
  });
  const pubRes = await api(token, "POST", "/api-keys?reveal=true", {
    type: "publishable",
    name: pubName,
  });
  secretKey = pickApiKey(secretRes);
  publishableKey = pickApiKey(pubRes);
  console.log("   created new keys (values not printed)");
} catch (e) {
  console.log(`   create failed (${String(e?.message || e).slice(0, 120)})`);
  console.log("   falling back to existing default publishable/secret…");
  const revealed = shJson(
    "npx supabase projects api-keys --reveal --output-format json"
  );
  publishableKey = revealed.find(
    (k) => k.type === "publishable" && k.name === "default"
  )?.api_key;
  secretKey = revealed.find(
    (k) => k.type === "secret" && k.name === "default"
  )?.api_key;
}
if (!secretKey || !publishableKey) {
  console.error("failed to obtain sb_publishable / sb_secret keys");
  process.exit(1);
}
if (
  !String(secretKey).startsWith("sb_") ||
  !String(publishableKey).startsWith("sb_")
) {
  console.error("unexpected key format");
  process.exit(1);
}

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jlcdewbwbtfwasnpqfcj.supabase.co";

const updates = {
  NEXT_PUBLIC_SUPABASE_URL: url,
  SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: publishableKey,
  SUPABASE_SERVICE_ROLE_KEY: secretKey,
};

console.log("4) writing .env.local + backend/.env (no print)…");
upsertLocalEnv(join(root, ".env.local"), updates);
upsertLocalEnv(join(root, "backend", ".env"), {
  SUPABASE_URL: url,
  SUPABASE_SERVICE_ROLE_KEY: secretKey,
});

console.log("5) syncing to Vercel…");
vercelAdd("NEXT_PUBLIC_SUPABASE_URL", url, false);
vercelAdd("SUPABASE_URL", url, true);
vercelAdd("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishableKey, false);
vercelAdd("NEXT_PUBLIC_SUPABASE_ANON_KEY", publishableKey, false);
vercelAdd("SUPABASE_SERVICE_ROLE_KEY", secretKey, true);

console.log("6) disabling legacy anon/service_role JWTs…");
try {
  const legacy = await api(token, "PUT", "/api-keys/legacy?enabled=false");
  console.log(
    `   legacy enabled=${legacy?.enabled === false ? "false" : String(legacy?.enabled)}`
  );
} catch (e) {
  console.error(
    "   legacy disable failed — new keys are live; disable manually in Dashboard → API Keys"
  );
  console.error(String(e?.message || e).slice(0, 200));
}

console.log("");
console.log("Done. Redeploy production so Vercel picks up new keys.");
console.log("Existing user sessions may need re-login after legacy disable.");
