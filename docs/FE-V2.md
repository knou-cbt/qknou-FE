# QKNOU FE 고도화 설계 (최종)

백엔드 API 문서 v2 대응 프론트 작업 계획서. **관리자 전용 API(#24~28, #30~31)는 범위 밖.**

### 최종 기능

| 기능 | 세부 | 관련 API |
| --- | --- | --- |
| 피드백 모달 | 전역(푸터) + 암기모드 문항 이상 제보 | #21 |
| 시험지 등록 | PDF 업로드, 사전 중복 확인 | #22, #23 *(미구현)* |
| 업데이트 알림 | 활성 공지 모달 (기존 하드코딩 모달 교체) | #29 |
| 마이페이지 | 시험 풀이 내역 및 정오표 / 북마크 내역 | #32, #33 |
| 암기모드 페이지 | 문항 공유 · 북마크 · 문항 이상 제보 | #36, #34, #35, #21 |
| (기존 변경) 시험 제출 | 로그인 시 풀이 결과 자동 저장 | #11 |

### FE가 보는 API

| 번호 | 기능 | 세부 | 상태 |
| --- | --- | --- | --- |
| #11 | 시험 제출 | 로그인 시 자동 저장으로 동작 변경 | 구현 완료 |
| #21 | 피드백 | 피드백 제출 (GitHub Issue 자동 생성, 제출 횟수 제한 없음) | 구현 완료 (GitHub/Discord 실 연동은 미설정) |
| #22~28 | 시험지 등록 | 사용자 업로드, 사전 중복 확인, 관리자 검수/수정/게시/반려 | 설계만 (미구현) |
| #29~31 | 업데이트 알림 | 활성 공지 조회, 내역 적재(관리자), 공지 발행(관리자) | 구현 완료 |
| #32 | 마이페이지 | 최근 시험 풀이 기록 조회 (+ 기존 #11 제출 API 동작 변경) | 구현 완료 |
| #33~35 | 북마크 | 목록 조회, 등록, 해제 | 구현 완료 |
| #36 | 문항 | 문항 단건 공개 조회 (암기모드 공유 진입점) | 구현 완료 |

> #22~28(시험지 등록 관리자 파트), #30·#31(공지 내역 적재/발행)은 백엔드 구현 완료 여부와 무관하게 **관리자 전용이라 FE 범위 밖**. FE가 실제로 호출하는 것은 #22·#23(사용자 업로드/중복확인, P2)과 #29(활성 공지 조회)뿐.

- 스택: Next.js 16 App Router / React 19 / TanStack Query v5 / Tailwind v4
- 기존 컨벤션 유지: `src/constants/apiPaths`, `src/constants/queryKeys`, 기능 폴더(`hooks/api` + `hooks/service` + `interface`)
- 응답 공통 포맷 `{ success, data }` — api 함수는 `data`만 반환

---

## 0. 우선순위

| Phase | 대상 | 비고 |
| --- | --- | --- |
| **P0** 공통 인프라 | 인증 fetch 헬퍼, 401 정책, apiPaths/queryKeys, 토스트 | 나머지 전부의 선행 작업 |
| **P1** 즉시 반영 | #29 공지 → #21 피드백 → #34·#35 북마크 → #36 문항 공유 → #11 제출 변경 → #32·#33 마이페이지 | 백엔드 구현 완료. 권장 순서 |
| **P2** 백엔드 대기 | #22·#23 시험지 등록 | BE 완료 전 **머지 금지**, 화면 골격만 선설계(§7) |

권장 순서 근거: #29는 기존 모달 교체라 리스크 최소, 마이페이지는 #11 제출 API 동작 변경이 얽혀 가장 무거움 → 마지막.

---

## 1. 공통 인프라 (P0)

### 1-1. 인증 토큰 접근 유틸

현재 토큰은 `AuthContext`가 `localStorage["qknou_auth_token"]`로만 관리하고, 인증 헤더는 [`ChatbotPanel`](../src/components/chatbot/ChatbotPanel.tsx)에서 `...(token ? { Authorization: 'Bearer ...' } : {})`로 **산발적으로** 붙이고 있다. v2에서 인증 API가 늘어나므로 단일 진입점을 만든다.

```
src/lib/auth-token.ts
```

```ts
export const TOKEN_KEY = "qknou_auth_token"; // AuthContext의 로컬 상수를 이 파일로 이전

/** 브라우저 localStorage에서 access token 읽기 (없으면 null) */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
```

- `AuthContext`의 `TOKEN_KEY` 로컬 상수를 이 파일 것으로 교체(중복 제거).
- 인증 API는 전부 클라이언트에서 호출한다(SSR엔 토큰 없음). 기존 `hooks/api` 패턴 유지.

### 1-2. `authorizedFetch` 래퍼

```
src/lib/api-client.ts
```

```ts
import { getAuthToken } from "./auth-token";

export class ApiError extends Error {
  constructor(public status: number, public payload?: unknown) {
    super(`API ${status}`);
  }
}

interface AuthorizedFetchOptions extends RequestInit {
  /** true(기본): 토큰 없으면 요청 자체를 막고 ApiError(401) throw */
  requireAuth?: boolean;
}

export async function authorizedFetch<T>(
  url: string,
  { requireAuth = true, headers, ...init }: AuthorizedFetchOptions = {}
): Promise<T> {
  const token = getAuthToken();
  if (requireAuth && !token) throw new ApiError(401);

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers, // FormData 업로드 시 호출부에서 Content-Type을 넘기지 않는다
    },
  });

  if (res.status === 401) {
    handleUnauthorized(); // §1-3
    throw new ApiError(401);
  }
  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => undefined));
  }

  // 본문이 없거나(204, 빈 200) JSON이 아니면 undefined 반환 — #34/#35 대비
  const text = await res.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text) as { success: boolean; data: T };
  return json.data;
}
```

- 기존 비인증 조회(과목/시험 목록 등)는 손대지 않는다. 신규/변경 인증 API만 이 래퍼 사용.
- `#36`, `#11`처럼 "헤더 있으면 인증, 없으면 게스트"인 엔드포인트는 `requireAuth: false`로 호출하되, 응답 401(만료·위조 토큰)은 여전히 `handleUnauthorized`로 흐르게 한다. **무효 토큰을 게스트로 조용히 처리하지 않는다(백엔드 문서 명시).**

### 1-3. 401 공통 처리

```ts
// api-client.ts
let unauthorizedHandler: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) { unauthorizedHandler = fn; }
function handleUnauthorized() { unauthorizedHandler(); }
```

- `AuthProvider` 마운트 시 `setUnauthorizedHandler(() => { logout(); /* 안내 */ })` 등록.
- 동작: 토큰 제거(`logout`) → "다시 로그인해 주세요" 안내(토스트/모달) → 현재 경로를 `sessionStorage["qknou_post_login_redirect"]`에 저장(기존 키 재사용).

### 1-4. 비로그인 가드 패턴

인증이 필요한 액션(피드백 제출, 북마크 토글, 마이페이지 진입, 시험지 등록)에서 재사용.

```
src/lib/useRequireAuth.ts
```

```ts
/** 로그인돼 있으면 action 실행, 아니면 로그인 유도(현재 경로 저장 후 /auth/login) */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  return useCallback((action: () => void) => {
    if (isAuthenticated) return action();
    sessionStorage.setItem("qknou_post_login_redirect", location.pathname + location.search);
    router.push("/auth/login");
  }, [isAuthenticated, router]);
}
```

- 페이지 단위 가드(마이페이지)는 `isLoading` 완료 후 `!isAuthenticated`면 `/auth/login`으로 `replace`.

### 1-5. 토스트

현재 가벼운 알림 수단이 `AlertModal`(모달)뿐이라 "제출 완료"·"링크 복사됨"에 과하다.

- 신규 `src/components/ui/toast.tsx` + `ToastProvider`(layout 추가) 자체 구현 vs `sonner` 의존성 추가 중 택1. **결정 필요(§10-1).**
- 미결정 시 `AlertModal` 재사용으로도 진행 가능(스펙상 필수 아님).

### 1-6. apiPaths / queryKeys 신설

`src/constants/apiPaths/`에 파일 추가하고 `index.ts`에서 `export *`. (`API_URL`은 브라우저 프로덕션에서 `/api-proxy` → `next.config.ts` rewrite로 `api.qknou.kr` 전달. 인증 헤더는 rewrite에서 그대로 전달되므로 별도 route handler 불필요.)

```ts
// FeedbackApiPaths.ts
export const FeedbackApiPaths = { create: `${API_URL}/api/feedbacks` } as const;

// NoticeApiPaths.ts
export const NoticeApiPaths = { active: `${API_URL}/api/notices/active` } as const;

// BookmarkApiPaths.ts
const BM = `${API_URL}/api/bookmarks`;
export const BookmarkApiPaths = {
  list: BM,
  item: (questionId: number | string) => `${BM}/${questionId}`,
} as const;

// UserApiPaths.ts
export const UserApiPaths = { examHistory: `${API_URL}/api/users/me/exam-history` } as const;

// QuestionApiPaths.ts
export const QuestionApiPaths = {
  detail: (id: number | string) => `${API_URL}/api/questions/${id}`,
} as const;

// ExamSubmissionApiPaths.ts (P2)
const ES = `${API_URL}/api/exam-submissions`;
export const ExamSubmissionApiPaths = { create: ES, check: `${ES}/check` } as const;
```

```ts
// queryKeys
export const NoticeQueryKeys = { active: ["notice", "active"] as const };
export const BookmarkQueryKeys = {
  all: ["bookmark"] as const,
  list: () => [...BookmarkQueryKeys.all, "list"] as const,
};
export const UserQueryKeys = {
  all: ["user"] as const,
  examHistory: () => [...UserQueryKeys.all, "exam-history"] as const,
};
export const QuestionQueryKeys = {
  all: ["question"] as const,
  detail: (id: number | string) => [...QuestionQueryKeys.all, "detail", id] as const,
};
```

---

## 2. 피드백 모달 (#21) — P1

### 진입점
페이지 신설 없음. 전역 모달 1개 + 진입 버튼.

| 위치 | 프리필 | 비고 |
| --- | --- | --- |
| Footer "피드백 보내기" | `type` 미선택 | 기존 구글폼 링크([footer.tsx:34](../src/components/footer.tsx#L34)) 교체 |
| 암기모드 문항 카드 "이 문항 오류 제보" | `type=question_bug`, `questionId` 자동 | 암기모드 + 문항 공유 화면(#36) |

> 시험모드 문항 카드 진입점은 이번 범위에서 제외(암기모드 중심). 필요 시 후속.

### 파일
```
src/components/feedback/
  FeedbackModal.tsx
  hooks/api/index.ts       # postFeedback
  hooks/service/index.ts   # useFeedbackMutation
  interface/index.ts
```

### 폼 스펙
| 필드 | UI | 검증 |
| --- | --- | --- |
| `type` | 라디오/셀렉트 4종 (`question_bug` 문항 오류 / `site_bug` 사이트 오류 / `suggestion` 기능 제안 / `other` 기타) | 필수 |
| `content` | textarea | 필수, 1~5000자, 실시간 카운터 |
| `questionId` | 히든(프리필 시) | 문항 진입점에서만 자동 채움 |
| `pageUrl` | 히든 | `location.href` 자동, 2000자 컷 |

- 제출은 로그인 필수 → `useRequireAuth`로 감싼다. 비로그인 클릭 시 로그인 유도.
- 제출 버튼 중복 클릭 방지(`isPending`).

### API
```ts
export const postFeedback = (body: IFeedbackRequest) =>
  authorizedFetch<IFeedbackResponse>(FeedbackApiPaths.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

interface IFeedbackRequest {
  type: "question_bug" | "site_bug" | "suggestion" | "other";
  content: string;
  questionId?: number;
  pageUrl?: string;
}
interface IFeedbackResponse {
  id: number;
  type: string;
  githubIssueUrl: string | null;
  integrationStatus: "created" | "merged" | "failed";
  createdAt: string;
}
```

### 결과 처리 (`integrationStatus`)
| 값 | 사용자 노출 |
| --- | --- |
| `created` / `merged` | "제보가 접수되었습니다. 확인 후 반영하겠습니다." (동일 문구, 병합 여부는 사용자에게 불필요) |
| `failed` | **동일하게 성공 처리** — 접수(DB)는 됨. 에러 토스트 금지 (§10-6 확인) |

- `githubIssueUrl`은 사용자에게 노출하지 않는다(운영용).
- 실패 케이스: `400`(형식 → 필드 에러), `401`(가드 선처리), `404`(`questionId` 없음 → "해당 문항 정보를 찾을 수 없습니다").

---

## 3. 업데이트 알림 (#29) — P1

### 교체 대상
[`src/app/components/main/SubjectUpdateNoticeModal.tsx`](../src/app/components/main/SubjectUpdateNoticeModal.tsx) — 하드코딩 + localStorage만 사용, [`MainContainer`](../src/app/components/main/MainContainer.tsx)에서 주석 처리 상태. API 연동 버전으로 대체.

### 파일
```
src/components/notice/
  UpdateNoticeModal.tsx
  hooks/api/index.ts       # getActiveNotices
  hooks/service/index.ts   # useActiveNoticesQuery
  interface/index.ts
```

### 동작
- `GET /api/notices/active` (비인증). `data: []`면 렌더 안 함.
- 여러 건 가능 → 최신순 세로 스택 또는 캐러셀. `content`는 마크다운(`react-markdown` + `remark-gfm` 이미 의존성) 렌더, 개행(`\n`) 유지.
- **다시 보지 않기**: 기존 "하루 동안 안 보기" UX 유지하되 공지 식별자 기반.
  - `localStorage["qknou:notice:dismissed"]` = `{ [noticeId]: <다음 로컬 자정 ms> }`.
  - 렌더 대상 = `active` 응답 중 `dismissed[id]` 없거나 만료된 것. 전부 dismiss면 모달 닫힘.
- 노출 위치: **메인 페이지 유지** 권장(기존 동일). 시험/암기모드 방해 금지. **결정 필요(§10-2).**
- 마운트: 첫 페인트 후(CLS 방지), `staleTime` 5분 정도.

```ts
interface INotice {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
}
```

> 공지 발행/내역 적재(#30·#31)는 관리자 API — FE 범위 밖.

---

## 4. 시험 제출 자동 저장 (#11) — P1

현재 [`postExamSubmit`](../src/app/exam/[subjectId]/[yearId]/test-mode/hooks/api/index.ts)는 **인증 헤더 없이** 호출한다. 백엔드가 "헤더 있으면 채점 결과를 최신 1건으로 저장(덮어쓰기), 없으면 기존대로"로 바뀐다.

```ts
export const postExamSubmit = async (examId: string, data: IExamSubmitRequest) => {
  const token = getAuthToken();
  const response = await fetch(ExamApiPaths.submit(examId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // 추가
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) { handleUnauthorized(); throw new ApiError(401); }
  if (!response.ok) throw new Error("시험 제출 실패");
  // ... 기존 결과 매핑 유지
};
```

- 비로그인 사용자: 지금과 100% 동일(저장 없음, 채점 결과만).
- 로그인 사용자: 제출 시 자동으로 "최근 풀이 기록" 갱신 → 별도 저장 버튼/호출 없음.
- 토큰 만료 상태 제출 시 `401` → 채점도 실패. `handleUnauthorized` 후 "다시 로그인 후 제출해 주세요". (기존엔 조용히 게스트 채점됐음 — 회귀처럼 보이지 않게 카피 주의, §10-7.)
- [`TestModePage`](../src/app/exam/[subjectId]/[yearId]/test-mode/components/TestModePage.tsx) 제출 에러 핸들링([:154](../src/app/exam/[subjectId]/[yearId]/test-mode/components/TestModePage.tsx#L154) 부근)에 401 분기 추가.
- 제출 성공 시 `queryClient.invalidateQueries(UserQueryKeys.examHistory())`.
- 동시성(더블클릭)은 백엔드 advisory lock으로 직렬화 → FE는 `isPending` 가드만 유지.

---

## 5. 마이페이지 (#32, #33) — P1

### 라우트
```
src/app/mypage/
  page.tsx                       # 클라이언트 가드 + 탭
  components/
    ExamHistorySection.tsx       # #32 풀이 내역 + 정오표
    BookmarkListSection.tsx      # #33 북마크 내역
  hooks/api/index.ts             # getExamHistory
  hooks/service/index.ts         # useExamHistoryQuery
  interface/index.ts
```

- 진입: [`UserMenu`](../src/components/ui/user-menu.tsx#L88)의 주석 처리된 "마이페이지" 항목 활성화 → `/mypage`.
- 가드: `useAuth().isLoading` 끝나고 `!isAuthenticated` → `router.replace("/auth/login")` + redirect 저장.
- 탭: `/mypage?tab=history|bookmarks`.

### 5-1. 시험 풀이 내역 및 정오표 (#32)

```ts
export const getExamHistory = () =>
  authorizedFetch<IExamHistory | null>(UserApiPaths.examHistory);

export const useExamHistoryQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: UserQueryKeys.examHistory(),
    queryFn: getExamHistory,
    enabled: isAuthenticated,
  });
};
```

```ts
interface IExamHistory {
  exam: { id: number; subject: string; year: number; examType: number };
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  submittedAt: string;
  answers: {
    questionId: number;
    questionNumber: number;
    questionText: string;
    userAnswer: number | null;   // 미선택
    correctAnswers: number[];     // 복수 정답
    isCorrect: boolean;
  }[];
}
```

UI:
- `data === null` → "아직 제출한 시험이 없어요" 빈 상태 + 과목 목록 CTA.
- 요약 카드: 과목/연도 + `examType` 라벨(1 1학기 기말 · 2 2학기 기말 · 3 하계 계절 · 4 동계 계절 — 기존 매핑 재사용), 점수(`correctCount/totalQuestions`), 제출 시각.
- **정오표**: 문항 번호 · 지문 · 내 답 · 정답 · 정오 뱃지. `userAnswer === null` → "미선택". `correctAnswers.length > 1` → 복수 표기.
- "이 시험 다시 풀기" → `/exam/{subjectId}/{examId}/test-mode`. 응답에 `subjectId`가 없음 → **§10-3.**
- 항상 최신 1건만 존재(누적 아님).

### 5-2. 북마크 내역 (#33)

```ts
export const getBookmarks = () =>
  authorizedFetch<IBookmarkItem[]>(BookmarkApiPaths.list);

export const useBookmarkListQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: BookmarkQueryKeys.list(),
    queryFn: getBookmarks,
    enabled: isAuthenticated,
  });
};

interface IBookmarkItem {
  questionId: number;
  questionNumber: number;
  questionText: string;
  examId: number;
  examTitle: string;
  subjectName: string;
  bookmarkedAt: string;
}
```

- 기본 정렬 `bookmarkedAt DESC`(백엔드 제안값). 과목순/시험순 옵션은 미정 → 단일 정렬로 시작(§10-4).
- 항목 클릭 → 문항 공유 화면 `/memorize/{questionId}` (§6).
- 각 항목에 북마크 해제 버튼(§6 `BookmarkButton` 재사용) → 해제 시 목록에서 제거(낙관적).

---

## 6. 암기모드 페이지 고도화 — P1

대상: [`MemorizeModePage`](../src/app/exam/[subjectId]/[yearId]/memorize-mode/components/MemorizeModePage.tsx) + 신규 문항 공유 화면.

### 6-1. 문항 공유 기능 (#36)

**신규 라우트**
```
src/app/memorize/[questionId]/
  page.tsx                      # generateMetadata (OG: 과목/시험 제목)
  components/SharedQuestionPage.tsx
  hooks/api/index.ts            # getQuestion
  hooks/service/index.ts        # useQuestionQuery
  interface/index.ts
```

- 공유 링크 진입점. 비로그인 접근 가능.
- `GET /api/questions/:id` — `requireAuth: false`(토큰 있으면 자동 첨부되어 `isBookmarked` 채워짐).
- 렌더는 기존 [`QuestionCard`](../src/components/ui/question-card.tsx) + 해설 영역 재사용(암기모드 단일 문항 뷰).
- 정답/해설 항상 포함(백엔드 가정). "공유받은 비로그인 사용자에게 정답까지 보여줄지"는 **§10-5** — 필요 시 토글/파라미터로 가림.
- `404` → `not-found`. `401`(무효 토큰) → `handleUnauthorized` 후 게스트 재조회.
- 챗봇(`ChatbotPanel`) `questionId` 전달해 재사용 가능(선택). `useCopyProtection()`은 암기모드와 동일 정책 유지.

```ts
interface ISharedQuestion {
  id: number;
  questionNumber: number;
  text: string;
  example?: string | null;
  sharedExample?: string | null;
  imageUrls?: string[] | null;
  choices: IChoice[];              // #10과 동일 구조 → 기존 IChoice 재사용
  correctAnswers: number[];
  explanation?: string | null;
  exam: { id: number; title: string; subject: string };
  isBookmarked: boolean | null;    // 비로그인 시 null
}
```

**공유 버튼 (암기모드 → 링크 생성)**
- `MemorizeModePage` 현재 문항 영역에 "공유" 버튼 추가.
- 클릭 시 `${SITE_URL}/memorize/${currentQuestion.id}` 클립보드 복사 + "링크 복사됨" 피드백.
- `navigator.share` 지원 시 모바일 네이티브 공유 시트 우선.

### 6-2. 북마크 (#34, #35)

```
src/components/bookmark/
  BookmarkButton.tsx
  hooks/api/index.ts       # addBookmark, removeBookmark
  hooks/service/index.ts   # useToggleBookmarkMutation
```

```ts
export const addBookmark = (questionId: number) =>
  authorizedFetch<void>(BookmarkApiPaths.item(questionId), { method: "POST" });
export const removeBookmark = (questionId: number) =>
  authorizedFetch<void>(BookmarkApiPaths.item(questionId), { method: "DELETE" });
```

- POST idempotent(이미 있으면 200), DELETE도 없어도 200 → 성공/실패만 처리.
- 배치 위치: 암기모드 문항 카드 헤더 우측, 문항 공유 화면(#36), 마이페이지 북마크 항목.
- **낙관적 업데이트**:
  ```ts
  useMutation({
    mutationFn: ({ id, next }) => (next ? addBookmark(id) : removeBookmark(id)),
    onMutate: async ({ id, next }) => { /* 로컬 active 즉시 반영 + 관련 쿼리 취소 */ },
    onError: rollback,
    onSettled: () => queryClient.invalidateQueries(BookmarkQueryKeys.list()),
  });
  ```
- 비로그인 클릭 → `useRequireAuth` 로그인 유도.

**초기 `active` 상태 확보**
| 화면 | 방법 |
| --- | --- |
| 문항 공유(#36) | 응답 `isBookmarked` 그대로 사용 |
| 마이페이지 북마크 탭 | 목록에 있으면 곧 `active` |
| 암기모드 문항 목록(`GET /api/exams/:id/questions?mode=study`) | 응답에 북마크 플래그 **없음** → 로그인 시 진입 때 `getBookmarks()` 1회 호출해 `Set<questionId>`로 각 문항 초기값 계산 ← **권장**. 대안: 백엔드가 `mode=study` 응답에 `isBookmarked` 추가(§10-8) |

### 6-3. 문항 이상 제보

§2 `FeedbackModal`을 `type=question_bug` + `questionId=currentQuestion.id` 프리필로 오픈. 암기모드 문항 카드 및 공유 화면에 "문항 오류 제보" 버튼.

---

## 7. 시험지 등록 (#22, #23) — P2 (백엔드 미구현, 골격만)

> 호출 시 404. BE 완료 전까지 **머지 금지**, 화면 흐름만 확정.

### 진입점
- 연도 목록 화면([`ExamYearPage`](../src/app/exam/[subjectId]/year/components/ExamYearPage.tsx)) 등에 "찾는 시험지가 없나요? 등록하기" 링크. **위치 결정 필요(§10-9).**

### 사용자 플로우
```
/exam-submissions/new  (로그인 필요)
  1) 과목 / 연도 / 시험종류(1~4) 선택
  2) 선택 완료 시 GET /api/exam-submissions/check  (비인증)
       → blocked=true 면 업로드 차단 + reason별 안내
         (already_published / already_in_review)
  3) PDF 업로드 (multipart/form-data)
       클라이언트 사전검증: MIME application/pdf + 매직바이트 %PDF- + 20MB
  4) POST /api/exam-submissions  → 201 { id, status: "pending", createdAt }
  5) "접수됨, 검수 후 반영" 완료 화면. 이후 OCR/검수는 비동기 — FE 폴링/추적 없음
```

### 파일(예정)
```
src/app/exam-submissions/new/
  page.tsx
  components/ExamSubmissionForm.tsx
  hooks/api/index.ts       # checkDuplicate, uploadSubmission
  hooks/service/index.ts
  interface/index.ts
```

```ts
export const checkDuplicate = (p: { subjectId: number; year: number; examType: number }) =>
  fetch(`${ExamSubmissionApiPaths.check}?${new URLSearchParams({
    subjectId: String(p.subjectId), year: String(p.year), examType: String(p.examType),
  })}`).then(r => r.json()).then(j => j.data as { blocked: boolean; reason?: "already_published" | "already_in_review" });

export const uploadSubmission = (form: FormData) =>
  authorizedFetch<{ id: number; status: string; createdAt: string }>(
    ExamSubmissionApiPaths.create, { method: "POST", body: form }
  ); // FormData → Content-Type 수동 지정 금지(브라우저가 boundary 설정)
```

- `check.blocked` → 제출 버튼 비활성 + `reason`별 카피. `rejected`/`failed` 이력은 백엔드가 차단 대상에서 제외.
- 400 세분화: 중복 / 유효성 / 파일형식(PDF 아님) / 크기초과(20MB).
- 업로드 진행률: `fetch`는 progress 미지원 → 필요하면 `XMLHttpRequest`. 20MB면 스피너로 충분할 수도. **§10-10.**

---

## 8. 라우팅 / 신규 모듈 요약

| 경로 | 유형 | 인증 | API |
| --- | --- | --- | --- |
| `/mypage` | 신규 페이지 | 필요(가드) | #32, #33 |
| `/memorize/[questionId]` | 신규 페이지 | 선택(게스트 허용) | #36, #34/#35 |
| `/exam-submissions/new` | 신규 페이지(P2) | 필요 | #22, #23 |
| (전역) 피드백 모달 | 컴포넌트 | 제출 시 필요 | #21 |
| (메인) 업데이트 공지 모달 | 컴포넌트, 기존 교체 | 불필요 | #29 |
| 암기모드 공유·북마크·제보 버튼 | `MemorizeModePage` 내 | 북마크/제보 시 필요 | #34/#35, #21 |

```
src/lib/auth-token.ts          # getAuthToken, TOKEN_KEY
src/lib/api-client.ts          # authorizedFetch, ApiError, setUnauthorizedHandler
src/lib/useRequireAuth.ts
src/components/ui/toast.tsx     # (§10-1 결정 시)
src/components/feedback/*       # #21
src/components/notice/*         # #29
src/components/bookmark/*       # #34/#35
src/constants/apiPaths/{Feedback,Notice,Bookmark,User,Question,ExamSubmission}ApiPaths.ts
src/constants/queryKeys/*       # Notice/Bookmark/User/Question
```

---

## 9. 캐시 무효화 정책

| 액션 | 무효화 대상 |
| --- | --- |
| 시험 제출 성공(로그인) | `UserQueryKeys.examHistory()` |
| 북마크 등록/해제 | `BookmarkQueryKeys.list()` + 해당 `QuestionQueryKeys.detail(id)`(있으면) |
| 피드백 제출 | 없음 |
| 공지 dismiss | localStorage만 (쿼리 무효화 불필요) |

---

## 10. 확인 필요 항목

1. **토스트 도입 방식** — 자체 `ui/toast` vs `sonner` 추가 vs `AlertModal` 유지.
2. **공지 노출 범위** — 메인 전용(현행) vs 전 페이지. 시험/암기모드 제외는 확정.
3. **마이페이지 "다시 풀기" 링크** — `exam-history` 응답에 `subjectId` 없음. 응답에 추가할지, `examId`만으로 진입 가능한 라우트를 둘지.
4. **북마크 목록 정렬** — `bookmarkedAt DESC` 확정? 과목순/시험순 옵션이 필요하면 쿼리 파라미터 스펙 협의.
5. **#36 공유 화면 정답/해설 노출** — 공유받은 비로그인 사용자에게 정답까지 보여줄지. 가리는 옵션 필요 시 응답/파라미터 협의.
6. **#21 `failed` 카피** — `integrationStatus: "failed"`도 사용자에겐 완전 성공으로 노출하는 게 맞는지 최종 확인.
7. **401 UX** — 만료 감지 시 자동 로그아웃 + 안내 vs 조용히 `/auth/login`. 시험 제출 도중 만료 시나리오 카피 포함.
8. **암기모드 목록 응답에 `isBookmarked`** — `GET /api/exams/:id/questions?mode=study`에 플래그 추가 가능한지. 불가 시 FE가 `GET /api/bookmarks` 병행 호출.
9. **시험지 등록 진입점 위치** — 연도 목록 / 헤더 / 마이페이지 중 어디.
10. **#22 업로드 진행률 UI 필요 여부** — 필요 시 `XMLHttpRequest` 전환.

---

## 11. 체크리스트

### P0
- [ ] `auth-token.ts` / `api-client.ts` / `useRequireAuth.ts` 추가, `AuthContext` `TOKEN_KEY` 공유로 이전
- [ ] `AuthProvider`에서 `setUnauthorizedHandler` 등록
- [ ] apiPaths 6종 + queryKeys 4종 추가, `constants/index` 배럴 갱신
- [ ] 토스트 방식 결정 및 도입(§10-1)

### P1
- [ ] #29 `UpdateNoticeModal` — API 연동, dismiss 로직, `SubjectUpdateNoticeModal` 치환, `MainContainer` 연결
- [ ] #21 `FeedbackModal` + Footer/암기모드 진입점, `integrationStatus` 분기, 구글폼 링크 제거
- [ ] #34/#35 `BookmarkButton` + 낙관적 토글, 암기모드 목록은 `getBookmarks` 병행으로 초기 상태 구성
- [ ] #36 `/memorize/[questionId]` 라우트 + `generateMetadata` + 암기모드 공유 버튼
- [ ] #11 `postExamSubmit` 인증 헤더 추가 + 401 분기, 제출 성공 시 `examHistory` invalidate
- [ ] #32 `/mypage` 라우트 + 가드 + 풀이 내역/정오표, `UserMenu` 마이페이지 링크 활성화
- [ ] #33 마이페이지 북마크 탭 + 항목별 해제
- [ ] 회귀 확인: 비로그인 시험 제출/채점 흐름 동일, 암기모드 기존 동작 유지

### P2 (BE 완료 후)
- [ ] #23 `checkDuplicate` — 조합 선택 시 호출, `blocked` 시 업로드 차단
- [ ] #22 업로드 폼 + 클라이언트 사전검증(PDF 매직바이트/20MB) + 완료 화면
