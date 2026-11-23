"use client";

import Link from "next/link";
import { ChevronRight, Footprints, MessageSquareText, Users } from "lucide-react";
import { HomeNotificationBell } from "@/components/home/HomeNotificationBell";

export function ProfileCommunityLinks() {
  return (
    <section
      aria-label="커뮤니티"
      className="rounded-xl2 bg-mu-card p-6 shadow-soft"
    >
      <h3 className="mb-1 text-xl font-semibold text-mu-fg">커뮤니티</h3>
      <p className="mb-4 text-sm text-mu-fg-3">
        여행 본 흐름 밖 부가 기능이에요.
      </p>
      <ul className="flex flex-col">
        <li>
          <HomeNotificationBell variant="row" />
        </li>
        <li>
          <Link
            href="/steps"
            className="flex min-h-[44px] items-center justify-between border-t border-membership py-4 transition-colors active:bg-mu-sunken"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-membership">
                <Footprints
                  className="h-4 w-4 text-mu-fg-2"
                  strokeWidth={2.2}
                />
              </span>
              <span className="text-sm font-semibold tracking-wide text-mu-fg">
                만보기 포인트
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-line-muted" />
          </Link>
        </li>
        <li>
          <Link
            href="/opod"
            className="flex min-h-[44px] items-center justify-between border-t border-membership py-4 transition-colors active:bg-mu-sunken"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-membership">
                <MessageSquareText
                  className="h-4 w-4 text-mu-fg-2"
                  strokeWidth={2.2}
                />
              </span>
              <span className="text-sm font-semibold tracking-wide text-mu-fg">
                멧톡
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-line-muted" />
          </Link>
        </li>
        <li>
          <Link
            href="/board"
            className="flex min-h-[44px] items-center justify-between border-t border-membership py-4 transition-colors active:bg-mu-sunken"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-membership">
                <Users className="h-4 w-4 text-mu-fg-2" strokeWidth={2.2} />
              </span>
              <span className="text-sm font-semibold tracking-wide text-mu-fg">
                여행 보드
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-line-muted" />
          </Link>
        </li>
      </ul>
    </section>
  );
}
