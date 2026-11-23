"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function isDataUrl(src: string): boolean {
  return src.startsWith("data:");
}

function isRemoteUrl(src: string): boolean {
  return /^https?:\/\//i.test(src.trim());
}

function normalizeAvatarSrc(src: string): string {
  return src.trim().replace(/^http:\/\//i, "https://");
}

export function ProfileAvatar({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const value = src.trim();

  useEffect(() => {
    setFailed(false);
  }, [value]);

  if (!value || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-mu-sunken text-3xl">
        👤
      </div>
    );
  }

  // 카카오 CDN 등 외부 아바타는 next/image 호스트 제한에 자주 걸려 일반 img 사용
  if (isDataUrl(value) || isRemoteUrl(value)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalizeAvatarSrc(value)}
        alt={alt}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image src={value} alt={alt} fill sizes="96px" className="object-cover" />
  );
}
