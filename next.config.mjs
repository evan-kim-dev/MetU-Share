import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * 서버리스 함수 NFT 에서 빼는 경로.
 * 테스트·스크립트·에이전트 스킬·큰 public 에셋이 실수로 묶이면
 * 배포마다 함수 저장소가 불어나요. (Vercel Function Storage)
 */
const TRACE_EXCLUDES = [
  "./.agents/**/*",
  "./.cursor/**/*",
  "./.claude/**/*",
  "./.github/**/*",
  "./docs/**/*",
  "./eval/**/*",
  "./scripts/**/*",
  "./tests/**/*",
  "./backend/**/*",
  "./supabase/migrations/**/*",
  "./supabase/verify/**/*",
  "./**/*.test.ts",
  "./**/*.test.tsx",
  "./**/*.spec.ts",
  "./**/*.spec.tsx",
  "./public/easter/**/*",
  "./public/brand/*.mp4",
  "./public/brand/*.png",
  "./README.md",
  "./CLAUDE.md",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid picking a parent-directory lockfile as the workspace root.
  outputFileTracingRoot: projectRoot,
  outputFileTracingExcludes: {
    "/*": TRACE_EXCLUDES,
    "next-server": TRACE_EXCLUDES,
  },
  // OpenAI SDK 는 서버 라우트에서만 쓰므로 번들러가 잘못 끌어오지 않게 외부화.
  serverExternalPackages: ["openai", "web-push"],
  env: {
    NEXT_PUBLIC_BUILD_TAG:
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_BUILD_TAG ?? "",
  },
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA ?? `local-${Date.now()}`;
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "**.wikipedia.org",
      },
      {
        protocol: "https",
        hostname: "**.kakaocdn.net",
      },
      {
        protocol: "http",
        hostname: "**.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "**.kakao.co.kr",
      },
      {
        protocol: "http",
        hostname: "**.kakao.co.kr",
      },
      {
        protocol: "https",
        hostname: "t1.kakaocdn.net",
      },
      {
        protocol: "http",
        hostname: "t1.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "img1.kakaocdn.net",
      },
      {
        protocol: "http",
        hostname: "img1.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "p.kakaocdn.net",
      },
      {
        protocol: "http",
        hostname: "p.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "http",
        hostname: "k.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "yfpvgxbmxgpjuzmpnbia.supabase.co",
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Keep filesystem watch polling on Windows/OneDrive; prod webpack cache stays on.
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
