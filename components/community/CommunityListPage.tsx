"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/layout/MobileShell";
import { CommunityGatedLayout } from "@/components/auth/AuthGateOverlay";
import { WritePostSheet } from "@/components/community/WritePostSheet";
import { CommunityChatRoomsSection } from "@/components/community/CommunityChatRoomsSection";
import { CommunityFriendsSection } from "@/components/community/CommunityFriendsSection";
import { CommunityListHeader } from "@/components/community/CommunityListHeader";
import { CommunityPostListSection } from "@/components/community/CommunityPostListSection";
import { CommunityPostListToolbar } from "@/components/community/CommunityPostListToolbar";
import { CommunityWriteFab } from "@/components/community/CommunityWriteFab";
import { useCommunityListState } from "@/components/community/useCommunityListState";
import type { CommunityListPageProps } from "@/components/community/community-list-page.types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { requiresCommunityLogin } from "@/lib/auth/community-access";
import { useFriends } from "@/lib/friends/FriendsProvider";

export type { CommunityListPageProps } from "@/components/community/community-list-page.types";

export function CommunityListPage({
  title,
  heading,
  description = "",
  featureName,
  basePath,
  categories,
  defaultCategory,
  defaultWriteCategory,
  showChatRooms = false,
  showPostList = true,
}: CommunityListPageProps) {
  const router = useRouter();
  const { user, provider, isReady: isAuthReady, isAnonymous } = useAuth();
  const { friends, isReady: friendsReady } = useFriends();
  const canWritePost = !isAnonymous && provider !== "guest";
  const gated =
    isAuthReady && requiresCommunityLogin(user, provider);
  const {
    isReady,
    addPost,
    canEdit,
    isPartyHost,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    sortMenuOpen,
    setSortMenuOpen,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    writeOpen,
    setWriteOpen,
    writeCategory,
    chatMenuOpen,
    setChatMenuOpen,
    chatManageMode,
    selectedChatIds,
    postManageMode,
    selectedPostIds,
    filteredPosts,
    chatRoomPosts,
    lastMessageByPostId,
    lastTimeByPostId,
    unreadCountByPostId,
    resolveWriteCategory,
    openWrite,
    openChatManage,
    exitChatManage,
    toggleChatSelection,
    handleLeaveSelected,
    openPostManage,
    exitPostManage,
    togglePostSelection,
    handleDeleteSelectedPosts,
  } = useCommunityListState({
    defaultCategory,
    defaultWriteCategory,
    showChatRooms,
  });

  const listBody = (
    <div className="flex flex-col gap-5 px-5 pb-20 pt-5">
      <CommunityListHeader
        heading={heading}
        description={description}
        postManageMode={postManageMode}
        showPostList={showPostList}
        showManageActions={!gated && canWritePost}
        onExitPostManage={exitPostManage}
        onOpenPostManage={openPostManage}
      />

      {showChatRooms ? (
        <CommunityChatRoomsSection
          basePath={basePath}
          isReady={isReady}
          chatRoomPosts={chatRoomPosts}
          chatManageMode={chatManageMode}
          chatMenuOpen={chatMenuOpen}
          selectedChatIds={selectedChatIds}
          lastMessageByPostId={lastMessageByPostId}
          lastTimeByPostId={lastTimeByPostId}
          unreadCountByPostId={unreadCountByPostId}
          isPartyHost={isPartyHost}
          onSetChatMenuOpen={setChatMenuOpen}
          onOpenChatManage={openChatManage}
          onExitChatManage={exitChatManage}
          onToggleChatSelection={toggleChatSelection}
          onLeaveSelected={handleLeaveSelected}
        />
      ) : null}

      {showChatRooms ? (
        <CommunityFriendsSection
          friendsReady={friendsReady}
          friends={friends}
        />
      ) : null}

      {showPostList ? (
        <>
          <CommunityPostListToolbar
            categories={categories}
            activeCategory={activeCategory}
            sortBy={sortBy}
            sortMenuOpen={sortMenuOpen}
            searchOpen={searchOpen}
            searchQuery={searchQuery}
            onSetActiveCategory={setActiveCategory}
            onSetSortBy={setSortBy}
            onSetSortMenuOpen={setSortMenuOpen}
            onSetSearchOpen={setSearchOpen}
            onSetSearchQuery={setSearchQuery}
          />

          <CommunityPostListSection
            basePath={basePath}
            isReady={isReady}
            filteredPosts={filteredPosts}
            searchQuery={searchQuery}
            postManageMode={postManageMode}
            selectedPostIds={selectedPostIds}
            canEdit={canEdit}
            onOpenWrite={openWrite}
            resolveWriteCategory={resolveWriteCategory}
            onTogglePostSelection={togglePostSelection}
            onDeleteSelectedPosts={handleDeleteSelectedPosts}
          />
        </>
      ) : null}
    </div>
  );

  return (
    <MobileShell title={title}>
      {gated ? (
        <CommunityGatedLayout featureName={featureName}>
          {listBody}
        </CommunityGatedLayout>
      ) : (
        listBody
      )}

      {showPostList && !gated && !postManageMode && canWritePost ? (
        <CommunityWriteFab
          onOpenWrite={openWrite}
          resolveWriteCategory={resolveWriteCategory}
        />
      ) : null}

      {!gated && canWritePost ? (
        <WritePostSheet
          open={writeOpen}
          initialCategory={writeCategory}
          onClose={() => setWriteOpen(false)}
          onSubmit={async (input) => {
            const created = await addPost(input);
            setWriteOpen(false);
            router.push(`${basePath}/${created.id}`);
          }}
        />
      ) : null}
    </MobileShell>
  );
}