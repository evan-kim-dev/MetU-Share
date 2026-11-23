"use client";

import { useRef } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ProfileAccountActions } from "@/components/profile/ProfileAccountActions";
import { ProfileAppSettings } from "@/components/profile/ProfileAppSettings";
import { ProfileCommunityLinks } from "@/components/profile/ProfileCommunityLinks";
import { ProfileHeroCard } from "@/components/profile/ProfileHeroCard";
import { ProfileLegalSection } from "@/components/profile/ProfileLegalSection";
import { ProfileStyleSection } from "@/components/profile/ProfileStyleSection";
import { useProfileContent } from "@/components/profile/useProfileContent";
import { PetCursorFollower } from "@/components/ui/PetCursorFollower";
import {
  detectCursorPetsFromBio,
  hasDogBuddyInBio,
} from "@/lib/easter/pet-buddy";

/** 내 정보 화면 — 섹션 컴포넌트를 조립해요. */
export function ProfileContent() {
  const {
    fileInputRef,
    logout,
    provider,
    profile,
    selectedStyles,
    styleInsight,
    styleInsightLoading,
    currency,
    setCurrency,
    isEditing,
    setIsEditing,
    draftName,
    setDraftName,
    draftBio,
    setDraftBio,
    draftHomeCity,
    setDraftHomeCity,
    avatarError,
    isUploadingAvatar,
    hasCustomAvatar,
    toggleStyle,
    handleSaveProfile,
    handleCancelEdit,
    handleAvatarSelect,
    handleRemoveAvatar,
    isDeletingAccount,
    deleteError,
    deleteConfirmOpen,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteAccount,
  } = useProfileContent();

  const profilePageRef = useRef<HTMLDivElement | null>(null);
  const bioText = isEditing ? draftBio : profile.bio;
  const dogBuddyActive = hasDogBuddyInBio(bioText);
  const catBuddyActive = detectCursorPetsFromBio(bioText).includes("cat");

  return (
    <MobileShell>
      <div
        ref={profilePageRef}
        className="relative flex flex-col gap-8 px-4 pb-6 pt-6"
      >
        <PetCursorFollower
          containerRef={profilePageRef}
          active={catBuddyActive}
        />
        <header>
          <h1 className="text-[22px] font-bold leading-7 tracking-tight text-mu-fg">
            내 프로필
          </h1>
        </header>

        <div className="flex flex-col gap-4">
          <ProfileHeroCard
            provider={provider}
            name={profile.name}
            email={profile.email}
            bio={profile.bio ?? ""}
            homeCity={profile.homeCity ?? ""}
            avatarUrl={profile.avatarUrl}
            hasCustomAvatar={hasCustomAvatar}
            avatarError={avatarError}
            isUploadingAvatar={isUploadingAvatar}
            isEditing={isEditing}
            draftName={draftName}
            draftBio={draftBio}
            draftHomeCity={draftHomeCity}
            dogBuddyActive={dogBuddyActive}
            fileInputRef={fileInputRef}
            onDraftNameChange={setDraftName}
            onDraftBioChange={setDraftBio}
            onDraftHomeCityChange={setDraftHomeCity}
            onStartEdit={() => {
              setDraftName(profile.name);
              setDraftBio(profile.bio ?? "");
              setDraftHomeCity(profile.homeCity ?? "");
              setIsEditing(true);
            }}
            onCancelEdit={handleCancelEdit}
            onSave={handleSaveProfile}
            onRemoveAvatar={handleRemoveAvatar}
            onAvatarSelect={handleAvatarSelect}
          />

          <ProfileStyleSection
            selectedStyles={selectedStyles}
            styleInsight={styleInsight}
            styleInsightLoading={styleInsightLoading}
            onToggle={toggleStyle}
          />

          <ProfileAppSettings
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          <ProfileCommunityLinks />
          <ProfileLegalSection />

          {provider !== "guest" ? (
            <ProfileAccountActions
              isDeletingAccount={isDeletingAccount}
              deleteError={deleteError}
              deleteConfirmOpen={deleteConfirmOpen}
              onLogout={logout}
              onOpenDeleteConfirm={openDeleteConfirm}
              onCloseDeleteConfirm={closeDeleteConfirm}
              onDeleteAccount={() => {
                void handleDeleteAccount();
              }}
            />
          ) : null}
        </div>
      </div>
    </MobileShell>
  );
}
