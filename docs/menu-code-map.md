# MetU 메뉴별 코드 맵

화면은 `app/` 라우트, UI는 `components/<메뉴>/`, 도메인 로직은 `lib/<메뉴>/`에 둡니다.

## 하단 탭

| 메뉴 | 라우트 | UI | 로직 |
|------|--------|----|------|
| 홈 | `app/page.tsx` | `components/home/*` | `lib/mock/loaders` 등 |
| 여행 | `app/trips/**` | `components/trips/*` | `lib/trips/*` |
| 확인함 | `app/agent/inbox` | `components/agent/*` | `lib/agent/*` |

## 주요 화면

| 화면 | 라우트 | UI |
|------|--------|-----|
| 가계부 | `app/trips/[id]/ledger/**` | `components/ledger/*` |
| 내 정보 | `app/profile` | `components/profile/*` (`ProfileContent`가 섹션 조립) |
| 로그인 | `app/login` | `components/auth/*` |
| 온보딩 | `app/onboarding/**` | `components/onboarding/*`, `components/recommend/*` |
| 커뮤니티 | `app/board/**`, `app/opod/**` | `components/community/*` |
| 알림 | `app/notifications` | `components/notifications/*` |

## 내 정보 섹션 파일 (`components/profile/`)

- `ProfileContent.tsx` — 조립
- `ProfileHeroCard.tsx` — 아바타·닉네임
- `ProfileStyleSection.tsx` — 여행 취향
- `ProfileAppSettings.tsx` — 통화·언어·알림
- `ProfileCommunityLinks.tsx` — 멧톡·보드 등
- `ProfileLegalSection.tsx` — 약관
- `ProfileAccountActions.tsx` — 로그아웃·탈퇴
- `ProfileAvatar.tsx` — 아바타 렌더

## 확인함 (`components/agent/`)

- `AgentInbox.tsx` — 조립·액션
- `agent-inbox-types.ts` / `agent-inbox-helpers.ts`
- `AgentInboxEventCard.tsx`, `AgentInboxEmpty.tsx`, `AgentInboxGuestPrompt.tsx`, `AgentInboxEditSheet.tsx`

## 커뮤니티 (`components/community/`)

- 목록: `CommunityListPage.tsx` + `Community*Section` / `useCommunityListState.ts`
- 글쓰기: `WritePostSheet.tsx` + `WritePost*` 섹션
- 상세: `PostDetailContent.tsx` + `PostDetail*` 섹션
- DM: `DmChatPageContent.tsx` + `DmChat*` / `useDmChatThread.ts`

## 가계부·여정 (`components/ledger/`)

- `LedgerShell.tsx` + `LedgerShell*` / `ledger-shell-*`
- `PayStep` / `SettleStep` / `RecordStep` → 각 `*Header`·`*Summary`·섹션 파일
- `ExpenseConfirmSheet` / `SplitChatRoom` → 형제 타입·섹션

## 기타

- 온보딩 연결: `ConnectFlow.tsx` + `useConnectFlow.ts` + `ConnectFlow*`
- 로그인 이메일: `EmailAuthForm.tsx` + `useEmailAuthForm.ts` + `ConfirmEmailView` 등
- 여행 상세: `TripDetailContent.tsx` + `TripDetail*` / schedule 섹션
- 추천 결과: `RecommendResult.tsx` + `RecommendResult*` / `useRecommendResultPlan.ts`
- 카드 실습: `CardBenefitLab.tsx` + `CardBenefitLab*`
- DM: `DmChatPageContent.tsx` + `DmChat*` / `useDmChatThread.ts`

## 가계부·여행 (`components/ledger/`, `components/trips/`)

- `LedgerShell*` / `SplitChatRoom*` / `ExpenseConfirm*` / `PayStep*` / `SettleStep*` / `RecordStep*`
- `TripDetail*` / `TripDetailSchedule*`

## 로그인·온보딩·추천

- `components/auth/EmailAuthForm` + `useEmailAuthForm` / `ConfirmEmailView` 등
- `components/onboarding/connect/ConnectFlow` + `useConnectFlow`
- `components/recommend/RecommendResult*` + `useRecommendResultPlan`
