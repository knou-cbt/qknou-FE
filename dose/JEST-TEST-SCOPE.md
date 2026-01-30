# Jest 테스트에서 확인하는 것 (검증 범위)

시험 모드(TestModePage)와 암기 모드(MemorizeModePage) 관련 Jest 테스트가 **무엇을 검증하는지** 정리한 문서입니다.

---

## 1. TestModePage (시험 모드) — Unit 테스트

**파일:** `apps/web/src/app/components/exam/__tests__/TestModePage.test.tsx`

| 테스트 케이스 | 확인하는 것 |
|---------------|-------------|
| **renders loading UI** | API 로딩 중일 때 "문제를 불러오는 중..." 문구가 화면에 보이는지 |
| **renders error UI** | API 에러 시 "문제를 불러오는데 실패했습니다" 문구가 보이는지 |
| **renders missing examId warning** | `yearId`가 없을 때 "시험 정보가 올바르지 않습니다" 문구가 보이는지 |
| **selecting an answer updates state** | 답안 선택 시 해당 보기에 `aria-checked="true"`가 적용되는지(선택 상태 반영) |
| **prev/next navigation works and disables correctly** | 첫 문제에서 이전 버튼 비활성화, 다음으로 이동 후 이전 활성화, 마지막 문제에서 다음 버튼 비활성화가 맞는지 |
| **handleSubmit sends correct payload and shows result UI** | 시험 종료 시 제출 payload(문제별 선택 답)가 올바른지, 제출 후 "시험 결과"·"획득 점수" 화면이 노출되는지 |
| **empty question list shows error UI** | 문제 목록이 비어 있을 때 에러 메시지가 보이는지 |
| **rapid clicking prev/next does not corrupt state** | 이전/다음 버튼을 빠르게 연타해도 인덱스가 깨지지 않고, 첫 문제에서 이전이 비활성화 상태로 유지되는지 |

---

## 2. TestModePage (시험 모드) — Integration 테스트

**파일:** `apps/web/src/app/components/exam/__tests__/TestModePage.integration.test.tsx`

| 테스트 케이스 | 확인하는 것 |
|---------------|-------------|
| **submitting exam shows result screen** | 여러 문제에 답을 선택한 뒤 시험 종료 시 "시험 결과"·"획득 점수" 화면이 나타나는지(제출 → 결과 화면 전환 흐름) |
| **question navigator reflects current state after submit** | 제출 후 결과 화면에서 문제 네비게이터(1, 2번 등)가 노출되고, 제출이 완료된 상태가 반영되는지 |

---

## 3. MemorizeModePage (암기 모드) — Unit 테스트

**파일:** `apps/web/src/app/components/exam/__tests__/MemorizeModePage.test.tsx`

| 테스트 케이스 | 확인하는 것 |
|---------------|-------------|
| **renders loading UI** | 문제 로딩 중 "문제를 불러오는 중..." 문구가 보이는지 |
| **renders error UI** | API 에러 시 "문제를 불러오는데 실패했습니다" 문구가 보이는지 |
| **selects answer updates selectedAnswer state** | 답안 선택 시 해당 보기에 `aria-checked="true"`가 적용되는지 |
| **showResult button reveals explanation** | 답 선택 후 "정답 보기" 버튼 클릭 시 "해설" 영역이 노출되는지 |
| **prev navigation stores and restores state** | 다음 문제로 갔다가 이전으로 돌아왔을 때, 해당 문제의 정답 보기 상태가 복원되어 해설이 다시 보이고 정답 버튼이 비활성화되는지 |
| **reset button clears answer and result** | "문제 다시 풀기" 클릭 시 선택 해제·해설 숨김(초기 상태로 복귀)되는지 |
| **breadcrumb shows correct subject/year** | Breadcrumb에 mock 과목명(수학)·연도(2023)가 올바르게 표시되는지 |

---

## 4. MemorizeModePage (암기 모드) — Integration 테스트

**파일:** `apps/web/src/app/components/exam/__tests__/MemorizeModePage.integration.test.tsx`

| 테스트 케이스 | 확인하는 것 |
|---------------|-------------|
| **answer button disables after result shown** | 답 선택 후 "정답 보기"를 누르면 정답 버튼이 비활성화되고 해설이 보이는지 |
| **prev/next preserves remembered answers** | 정답 보기 한 뒤 다음 → 이전으로 이동했을 때, 이전 문제의 해설·정답 보기 상태가 유지되는지(기억된 답/결과 복원) |

---

## 5. 공통으로 쓰는 것

- **Mock:** `@/modules/exam` → `__mocks__/exam.ts` (시험 데이터·훅 mock)
- **data-testid:**  
  `prev-button`, `answer-button`, `next-button`, `answer-1` / `answer-2`, `reset-button` 등으로 클릭·상태 검증
- **검증 포인트:**  
  로딩/에러/경고 문구, 답 선택 상태(aria-checked), 이전/다음 비활성화, 제출 payload·결과 화면, 해설 노출·숨김·복원, Breadcrumb

이 문서는 위 테스트들이 **어떤 동작/상태를 확인하려고 작성되었는지**를 요약한 것입니다.
