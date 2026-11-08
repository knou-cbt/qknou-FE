# 트러블슈팅: 애드센스 "게시자 콘텐츠가 없는 화면" 거절

애드센스 사이트 검토에서 거절된 원인과 수정 내용, 재발 방지 체크리스트를 정리한 문서입니다.

- 발생: 2026-11-07, `qknou.kr` 애드센스 사이트 검토 거절
- 수정: 브랜치 `fix/adsense-content-ssr` (커밋 `d7d89df`), 릴리스 `20261108-1`
- 상태: 배포 후 애드센스 재검토 요청 필요

---

## 1. 증상

애드센스 **사이트** 메뉴에서 `qknou.kr`이 거절되고 아래 사유가 표시됐습니다.

> 게시자 콘텐츠가 없는 화면에 Google 게재 광고
> - 콘텐츠가 없거나 가치가 낮은 콘텐츠를 포함한 화면
> - 아직 준비 중인 화면
> - 알림, 이동 또는 기타 행동 목적으로 사용되는 화면

브라우저로 보면 기출문제가 정상적으로 나오기 때문에 처음에는 원인이 잘 보이지 않습니다.

---

## 2. 원인

### 2.1 크롤러가 받는 HTML에 본문이 없었음

과목 목록·시험 목록·문항을 모두 **브라우저에서 React Query로 나중에 불러오는** 구조였습니다.
서버가 보내는 HTML에는 로딩 문구만 있었고, 크롤러는 이 HTML을 기준으로 페이지를 판단합니다.

| 페이지 | 사이트맵 URL 수 | 크롤러가 받은 본문 (수정 전) |
|---|---|---|
| `/exam/:과목/:시험/memorize-mode` | 3,232 | "문제를 불러오는 중..." + 푸터 |
| `/exam/:과목/:시험/test-mode` | 3,232 | "25:00 시험 종료 문제를 불러오는 중..." + 푸터 |
| `/exam/:과목/year` | 547 | "시험 목록을 불러오는 중..." + 푸터 |
| `/` | 1 | 소개 문구만, 과목 표 없음 |

사이트맵 7,012개 URL 중 99% 이상이 크롤러에게는 **빈 화면**으로 보였습니다.

### 2.2 애드센스 스크립트가 모든 페이지에 로드됨

`src/app/layout.tsx`(루트 레이아웃)에 애드센스 스크립트가 있어서, 거절 사유에 해당하는 화면에도 모두 로드됐습니다.

- 로그인 완료(`/auth/success`): "잠시 후 자동으로 이동해요" → **이동 목적 화면**
- 점검(`/maintenance`): "서비스 준비 중입니다" → **준비 중인 화면**
- 마이페이지(`/mypage`): "불러오는 중..." → **콘텐츠 없는 화면**
- 404, 로그인 화면

### 2.3 시험모드가 암기모드와 중복

시험모드는 암기모드와 같은 문항에서 정답만 가린 페이지입니다. 사이트맵에 3,232개가 따로 올라가 있어
**가치가 낮은 중복 페이지**가 대량으로 있는 것으로 보였습니다.

---

## 3. 확인 방법

크롤러 기준으로 HTML을 받아 `<script>`·`<style>`을 뺀 본문 텍스트를 봅니다.

```bash
curl -sL -A "Mediapartners-Google" https://www.qknou.kr/exam/540/3245/memorize-mode \
  | python3 -c "import re,sys;t=sys.stdin.read();t=re.sub(r'<(script|style)[^>]*>.*?</\1>','',t,flags=re.S);print(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',t))[:300])"
```

- 본문에 문항·과목명이 보이면 정상, "불러오는 중..."만 보이면 이 문제입니다.
- 애드센스 스크립트 로드 여부: 같은 HTML에서 `adsbygoogle.js` 검색

---

## 4. 해결

### 4.1 본문을 서버에서 렌더링 (React Query prefetch + HydrationBoundary)

화면 컴포넌트는 그대로 두고, **페이지 파일(서버 컴포넌트)이 같은 쿼리를 먼저 실행해** 클라이언트에 넘깁니다.
클라이언트의 `useQuery`가 같은 `queryKey`의 데이터를 이미 가지고 있으므로 서버 렌더 때부터 본문이 그려집니다.

```tsx
// src/app/exam/[subjectId]/[yearId]/memorize-mode/page.tsx
const queryClient = new QueryClient();
await queryClient.prefetchQuery({
  queryKey: ExamQueryKeys.questions(yearId, "study"),
  queryFn: () => getExamQuestionsWithAnswers(yearId, { next: { revalidate: 3600 } }),
});

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <AdSenseScript />
    <MemorizeModePage subjectId={subjectId} yearId={yearId} />
  </HydrationBoundary>
);
```

| 페이지 | 미리 조회하는 쿼리 |
|---|---|
| `/` | `SubjectQueryKeys.list({ page: 1, limit: 10 })` |
| `/exam/:과목/year` | `SubjectQueryKeys.detail`, `SubjectQueryKeys.exams` |
| `/exam/:과목/:시험/memorize-mode` | `ExamQueryKeys.questions(examId, "study")` |

주의할 점:

- **`queryKey`가 클라이언트 훅과 정확히 같아야 합니다.** 다르면 서버 데이터가 버려지고 다시 "불러오는 중"이 됩니다.
  메인 페이지는 `MainContainer`의 첫 조회 조건과 같은 `INITIAL_SUBJECT_LIST_PARAMS`를 씁니다.
- 공용 조회 함수(`getSubjectList`, `getSubjectDetail`, `getExamListBySubject`, `getExamQuestionsWithAnswers`)에
  선택 인자 `init?: RequestInit`를 추가해, 서버에서는 `{ next: { revalidate: 3600 } }`로 1시간 캐시합니다.
- 조회가 실패하면 `prefetchQuery`는 에러를 삼키고, 클라이언트가 기존처럼 다시 조회합니다.

### 4.2 메인 페이지는 `force-dynamic`

메인 페이지는 원래 빌드 시점에 정적으로 만들어졌습니다(ISR 3600초). 그런데 `docker build` 중에는
백엔드(`API_PROXY_TARGET=http://app:9000`)에 닿지 않아 **과목 표 없이 굳은 HTML**이 배포됩니다.
그래서 `export const dynamic = "force-dynamic"`으로 요청 시 렌더하고, 데이터는 fetch 캐시(1시간)에 맡깁니다.

### 4.3 애드센스 스크립트를 본문 있는 페이지에만 로드

루트 레이아웃에서 스크립트를 빼고 `src/components/ads/AdSenseScript.tsx`로 옮겼습니다.

| 로드함 | 로드 안 함 |
|---|---|
| `/`, `/about`, `/exam/:과목/year`, `/exam/:과목/:시험/memorize-mode` | 로그인, 로그인 완료, 점검, 마이페이지, 404, 시험모드, 공유 문항 |

- `google-adsense-account` 메타 태그(사이트 소유 확인용)는 루트 레이아웃에 그대로 둡니다.
- React 19가 async 스크립트를 `<head>`로 올리고 `src` 기준으로 중복을 제거하므로 여러 번 렌더해도 한 번만 로드됩니다.

### 4.4 시험모드 noindex, 사이트맵 정리

- 시험모드 메타데이터에 `robots: { index: false, follow: true }`
- `sitemap.ts`에서 시험모드 URL 제거, `/about` 추가

### 4.5 함께 고친 버그: 암기/시험모드 제목

`/api/subjects/:id/exams`는 시험 `id`를 **숫자**로 주는데, URL의 `yearId`(문자열)와 `===`로 비교해 항상 실패했습니다.
그래서 제목이 늘 "기출 암기모드"로 나왔습니다. `String(e.id) === yearId`로 고쳐
"C++프로그래밍 2019년 기출 암기모드"처럼 나옵니다.

---

## 5. 수정 후 확인 결과 (로컬 프로덕션 빌드, 운영 API)

| 페이지 | 크롤러가 받는 본문 | 애드센스 |
|---|---|---|
| `/` | 과목 10개 + 페이지 이동 | 있음 |
| `/exam/540/year` | 2019년, 2018년 … 시험 목록 | 있음 |
| `/exam/540/3245/memorize-mode` | 1번 문항, 공통 보기, 선택지 | 있음 |
| `/exam/540/3245/test-mode` | 변화 없음, `noindex, follow` | 없음 |
| 로그인 · 로그인 완료 · 점검 · 마이페이지 · 404 | 변화 없음 | 없음 |

- 헤드리스 브라우저(Playwright)로 위 페이지를 열어 hydration 오류·콘솔 오류 없음 확인
- 테스트 63개 통과, 빌드 통과

---

## 6. 남은 위험

- **암기모드는 현재 문항 1개만 HTML에 들어갑니다.** 다시 거절되면 페이지에 전체 문항 목록(문제·선택지, 정답 제외)을 추가하는 것이 다음 단계입니다.
- **SPA 이동:** 로그인 화면에서 앱 안으로 이동해 메인에 가면 그때 스크립트가 로드되고, 이후 화면에도 남아 있습니다. 자동 광고를 켜면 이후 화면에도 광고가 뜰 수 있습니다.
- **속도 제한:** www에 IP당 속도 제한(초당 30회)이 있어, 크롤러가 몰려 들어오면 429를 받을 수 있습니다. 서버 렌더링으로 영향은 줄었지만, 필요하면 구글 크롤러를 제한에서 빼 달라고 관리자에게 요청합니다.

---

## 7. 재발 방지 체크리스트

- [ ] 광고가 붙는 새 페이지는 서버 렌더 HTML에 본문이 있는지 `curl`로 확인 (3장)
- [ ] 로딩·안내·이동 목적 화면(로그인 완료, 점검, 에러 등)에는 `AdSenseScript`를 넣지 않기
- [ ] 같은 내용을 다른 형태로 보여주는 페이지는 `noindex`로 두고 사이트맵에서 빼기
- [ ] 서버 prefetch를 추가할 때 `queryKey`가 클라이언트 훅과 같은지 확인
- [ ] 빌드 시점에 외부 API를 부르는 정적 페이지가 생기지 않았는지 빌드 출력(`○`/`ƒ`) 확인

---

## 참고

- [애드센스 프로그램 정책](https://support.google.com/adsense/answer/48182?hl=ko) — 거절 사유 원문은 애드센스 **정책 센터**의 사이트 항목에서 확인
- [TanStack Query: Advanced Server Rendering](https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr)
