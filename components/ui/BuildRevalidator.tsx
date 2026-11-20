"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const BUILD_TAG = process.env.NEXT_PUBLIC_BUILD_TAG ?? "";
const STORAGE_KEY = "metu-build-tag";

function isLoginCriticalPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/auth/") ||
    pathname === "/update-password"
  );
}

/**
 * 배포 커밋이 바뀌었는데 브라우저/PWA가 예전 JS를 붙잡고 있을 때
 * 한 번만 하드 리로드한다. (빈 태그·동일 태그는 무시 → 무한 새로고침 방지)
 * 로그인/콜백 화면에서는 입력 중 리로드를 막기 위해 건너뛰어요.
 */
export function BuildRevalidator() {
  const pathname = usePathname();

  useEffect(() => {
    if (!BUILD_TAG || BUILD_TAG.length < 7) return;
    if (isLoginCriticalPath(pathname)) return;

    let previous: string | null = null;
    try {
      previous = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }

    if (previous === BUILD_TAG) return;

    try {
      localStorage.setItem(STORAGE_KEY, BUILD_TAG);
    } catch {
      return;
    }

    // 첫 방문은 저장만 하고 끝
    if (!previous) return;

    const reloadKey = `metu-reloaded:${BUILD_TAG}`;
    try {
      if (sessionStorage.getItem(reloadKey)) return;
      sessionStorage.setItem(reloadKey, "1");
    } catch {
      return;
    }

    if ("caches" in window) {
      void caches.keys().then((keys) => {
        for (const key of keys) void caches.delete(key);
      });
    }

    // 쿼리에 _b 를 붙이면 searchParams 가 바뀌며 로그인 폼이 리마운트될 수 있어요.
    window.location.reload();
  }, [pathname]);

  return null;
}
