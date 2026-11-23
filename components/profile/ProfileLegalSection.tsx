"use client";

import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { LEGAL_LINKS } from "@/lib/legal/documents";

export function ProfileLegalSection() {
  return (
    <section className="rounded-xl2 bg-mu-card p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-mu-fg-2" strokeWidth={2.2} />
        <h3 className="text-xl font-semibold text-mu-fg">약관 및 정책</h3>
      </div>
      <ul className="flex flex-col">
        {LEGAL_LINKS.map((item, index) => (
          <li key={item.slug}>
            <Link
              href={`/legal/${item.slug}`}
              className={`flex items-center justify-between py-4 transition-colors active:bg-mu-sunken ${
                index > 0 ? "border-t border-membership" : ""
              }`}
            >
              <span className="text-sm font-semibold tracking-wide text-mu-fg">
                {item.title}
              </span>
              <ChevronRight className="h-4 w-4 text-line-muted" />
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/about"
            className="flex min-h-[44px] items-center justify-between border-t border-membership py-4 transition-colors active:bg-mu-sunken"
          >
            <span className="text-sm font-semibold tracking-wide text-mu-fg">
              MetU 소개
            </span>
            <ChevronRight className="h-4 w-4 text-line-muted" />
          </Link>
        </li>
      </ul>
    </section>
  );
}
