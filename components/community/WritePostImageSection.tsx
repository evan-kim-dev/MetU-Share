"use client";

import { type RefObject } from "react";
import { ImagePlus, X } from "lucide-react";
import { MAX_POST_IMAGES } from "@/lib/community/post-images";
import type { DraftImage } from "@/components/community/write-post-sheet.types";

interface WritePostImageSectionProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  images: DraftImage[];
  uploading: boolean;
  onPickImages: (files: FileList | null) => void;
  onRemoveImage: (id: string) => void;
}

export function WritePostImageSection({
  fileInputRef,
  images,
  uploading,
  onPickImages,
  onRemoveImage,
}: WritePostImageSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-caption">사진</span>
        <span className="text-xs text-ink-caption">
          {images.length}/{MAX_POST_IMAGES}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        disabled={uploading || images.length >= MAX_POST_IMAGES}
        onChange={(e) => {
          onPickImages(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {images.length < MAX_POST_IMAGES ? (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line-muted bg-surface-soft text-ink-caption transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-2xs font-semibold">추가</span>
          </button>
        ) : null}

        {images.map((image) => (
          <div
            key={image.id}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line-soft"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.previewUrl}
              alt="첨부 사진 미리보기"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="사진 삭제"
              disabled={uploading}
              onClick={() => onRemoveImage(image.id)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-surface-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}