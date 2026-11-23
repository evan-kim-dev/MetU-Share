"use client";

import type { ChangeEvent, RefObject } from "react";
import { Camera, MapPin, X } from "lucide-react";
import { LoginMethodList } from "@/components/auth/LoginMethodList";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileDogBuddy } from "@/components/ui/ProfileDogBuddy";
import type { AuthProviderKind } from "@/lib/auth/types";

interface ProfileHeroCardProps {
  provider: AuthProviderKind;
  name: string;
  email: string;
  bio: string;
  homeCity: string;
  avatarUrl: string;
  hasCustomAvatar: boolean;
  avatarError: string | null;
  isUploadingAvatar: boolean;
  isEditing: boolean;
  draftName: string;
  draftBio: string;
  draftHomeCity: string;
  dogBuddyActive: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDraftNameChange: (value: string) => void;
  onDraftBioChange: (value: string) => void;
  onDraftHomeCityChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onRemoveAvatar: () => void;
  onAvatarSelect: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeroCard({
  provider,
  name,
  email,
  bio,
  homeCity,
  avatarUrl,
  hasCustomAvatar,
  avatarError,
  isUploadingAvatar,
  isEditing,
  draftName,
  draftBio,
  draftHomeCity,
  dogBuddyActive,
  fileInputRef,
  onDraftNameChange,
  onDraftBioChange,
  onDraftHomeCityChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onRemoveAvatar,
  onAvatarSelect,
}: ProfileHeroCardProps) {
  return (
    <section className="relative overflow-hidden rounded-xl2 bg-mu-card p-6 shadow-soft">
      <div className="relative z-[1] flex flex-col items-center">
        <div className="relative mb-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-surface-base shadow-sm">
            <ProfileAvatar src={avatarUrl} alt={`${name} 프로필`} />
          </div>
          {hasCustomAvatar ? (
            <button
              type="button"
              aria-label="프로필 사진 삭제"
              onClick={onRemoveAvatar}
              disabled={provider === "guest"}
              className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-white bg-ink-heading text-mu-on-accent shadow-soft disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
          ) : null}
          <button
            type="button"
            aria-label="프로필 사진 변경"
            disabled={provider === "guest" || isUploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-mu-accent text-mu-on-accent shadow-soft disabled:opacity-50"
          >
            <Camera className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploadingAvatar}
            onChange={onAvatarSelect}
          />
        </div>

        {avatarError ? (
          <p className="mb-2 text-center text-xs text-mu-err">{avatarError}</p>
        ) : null}

        {isEditing ? (
          <div className="flex w-full flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-mu-fg-3">닉네임</span>
              <input
                autoFocus
                value={draftName}
                onChange={(e) => onDraftNameChange(e.target.value)}
                className="w-full rounded-lg border border-mu-accent bg-mu-card px-3 py-2.5 text-center text-lg font-semibold text-mu-fg focus:outline-none focus:ring-4 focus:ring-mu-accent"
                aria-label="닉네임 입력"
                placeholder="여행자"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-mu-fg-3">
                여행 한마디
              </span>
              <textarea
                value={draftBio}
                onChange={(e) => onDraftBioChange(e.target.value)}
                rows={2}
                maxLength={80}
                className="w-full resize-none rounded-lg border border-mu-line bg-mu-card px-3 py-2.5 text-sm text-mu-fg-2 focus:border-mu-accent focus:outline-none focus:ring-4 focus:ring-mu-accent"
                placeholder="예: 예산 안에서 최대한 즐기는 여행을 좋아해요."
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-mu-fg-3">
                자주 출발하는 도시
              </span>
              <input
                value={draftHomeCity}
                onChange={(e) => onDraftHomeCityChange(e.target.value)}
                className="w-full rounded-lg border border-mu-line bg-mu-card px-3 py-2.5 text-sm text-mu-fg-2 focus:border-mu-accent focus:outline-none focus:ring-4 focus:ring-mu-accent"
                placeholder="예: 서울"
              />
            </label>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-mu-fg">{name}</h2>
            <p className="mt-1 text-sm text-mu-fg-2">{email}</p>
            {bio ? (
              <p className="mt-3 text-center text-sm leading-6 text-mu-fg-2">
                {bio}
              </p>
            ) : null}
            {homeCity ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-mu-fg-3">
                <MapPin className="h-3.5 w-3.5" />
                출발 도시 · {homeCity}
              </p>
            ) : null}
          </>
        )}

        <ProfileDogBuddy active={dogBuddyActive} />

        {provider === "guest" ? (
          <LoginMethodList
            collapsible
            className={dogBuddyActive ? "mt-0" : "mt-4"}
          />
        ) : isEditing ? (
          <div
            className={[
              "grid w-full grid-cols-2 gap-2",
              dogBuddyActive ? "mt-0" : "mt-4",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-mu-line bg-mu-card py-3 text-sm font-semibold text-mu-fg-2"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg border border-mu-accent bg-mu-accent py-3 text-sm font-semibold text-mu-on-accent"
            >
              저장
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className={[
              "w-full rounded-lg border border-mu-line bg-mu-card py-3 text-sm font-semibold tracking-wide text-mu-accent",
              dogBuddyActive ? "mt-0" : "mt-4",
            ].join(" ")}
          >
            프로필 수정
          </button>
        )}
      </div>
    </section>
  );
}
