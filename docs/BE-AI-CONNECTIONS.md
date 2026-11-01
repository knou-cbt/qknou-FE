# 사용자 AI 연결(BYOK) — 백엔드 구현 문서

> FE 저장소(`qknou-FE`)의 마이페이지 **AI 연결** 탭(`/mypage?tab=ai`)이 호출하는 API의 백엔드 구현 명세다.
> 사용자가 자기 AI 제공사 API 키를 등록하면, AI 학습 도우미(튜터 채팅)가 그 키로 답변한다.
> 백엔드 언어/프레임워크와 무관하게 쓸 수 있도록 데이터 모델, API 계약, 처리 순서 위주로 적었다.

---

## 1. 범위

| 구분 | 내용 |
|---|---|
| 이번에 필요한 것 | 키 저장/조회/삭제, 사용할 AI 선택 API (§3) + 키 암호화 저장 (§4) + 키 검증 (§5) |
| 이어서 필요한 것 | `/api/tutor/chat`이 사용자가 선택한 AI로 답변하도록 변경 (§6) |
| 범위 밖 | 모델 선택(제공사별 기본 모델은 서버 설정값으로 고정), 사용량 대시보드 |

지원 제공사(`provider`) — FE와 문자열이 정확히 같아야 한다.

| provider | 이름 | FE 연결 방식 | 비고 |
|---|---|---|---|
| `openrouter` | OpenRouter | 브라우저 로그인(OAuth PKCE)으로 FE가 키를 받아 PUT으로 전달 | 무료 모델 사용 |
| `gemini` | Google Gemini | 사용자가 키를 붙여넣음 | 무료 티어 |
| `openai` | OpenAI | 사용자가 키를 붙여넣음 | 사용자 계정에 종량 과금 |
| `anthropic` | Anthropic (Claude) | 사용자가 키를 붙여넣음 | 사용자 계정에 종량 과금 |

OpenRouter OAuth는 FE가 끝까지 처리하고(code → key 교환), 백엔드는 다른 제공사와 똑같이 `PUT`으로 키만 받는다. 백엔드에서 OpenRouter 앱 등록이나 별도 키 발급은 필요 없다.

---

## 2. 데이터 모델

### 2-1. `user_ai_connections` (신규)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | PK | |
| `user_id` | FK → users.id | `ON DELETE CASCADE` (회원 탈퇴 시 키도 삭제) |
| `provider` | varchar(20) | `openrouter` \| `gemini` \| `openai` \| `anthropic` |
| `encrypted_key` | text / bytea | AES-256-GCM 암호문 (§4) |
| `iv` | bytea(12) | GCM nonce, 저장할 때마다 새로 생성 |
| `auth_tag` | bytea(16) | GCM 인증 태그 (암호문에 붙여 저장하는 구현이면 생략 가능) |
| `key_version` | smallint | 마스터 키 교체 대비. 기본 1 |
| `masked_key` | varchar(32) | 화면 표시용. 예: `sk-...a1b2` (§4-3) |
| `created_at` | timestamp | FE의 `connectedAt` |
| `updated_at` | timestamp | |

- 유니크 제약: `(user_id, provider)` — 같은 제공사는 1개만. 재등록 시 덮어쓴다(upsert).

```sql
CREATE TABLE user_ai_connections (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      VARCHAR(20)  NOT NULL,
  encrypted_key BYTEA        NOT NULL,
  iv            BYTEA        NOT NULL,
  auth_tag      BYTEA        NOT NULL,
  key_version   SMALLINT     NOT NULL DEFAULT 1,
  masked_key    VARCHAR(32)  NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_ai_connections UNIQUE (user_id, provider),
  CONSTRAINT ck_user_ai_connections_provider
    CHECK (provider IN ('openrouter', 'gemini', 'openai', 'anthropic'))
);
```

### 2-2. `users.active_ai_provider` (컬럼 추가)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `active_ai_provider` | varchar(20) NULL | 튜터가 쓸 제공사. `NULL`이면 **큐노 기본 AI**(지금처럼 운영자 키) |

```sql
ALTER TABLE users ADD COLUMN active_ai_provider VARCHAR(20) NULL;
```

불변식: `active_ai_provider`가 NULL이 아니면 같은 사용자의 `user_ai_connections`에 그 provider 행이 반드시 있어야 한다. 연결 삭제 시 함께 NULL로 되돌린다(§3-3).

---

## 3. API

공통 사항

- 모두 로그인 필수. `Authorization: Bearer <JWT>`, 토큰이 없거나 만료되면 `401`.
- 응답은 기존 규칙대로 `{ "success": true, "data": ... }`로 감싼다. FE `authorizedFetch`가 `data`만 꺼내 쓴다.
- 경로의 `:provider`가 지원 목록에 없으면 `400`.
- **어떤 응답에도 평문 키를 넣지 않는다.**

### 3-1. 연결 목록 조회

`GET /api/users/me/ai-connections`

```json
{
  "success": true,
  "data": {
    "activeProvider": "gemini",
    "connections": [
      {
        "provider": "gemini",
        "maskedKey": "AIza...x9Qk",
        "connectedAt": "2026-10-30T09:00:00Z"
      }
    ]
  }
}
```

- 연결이 하나도 없으면 `{ "activeProvider": null, "connections": [] }`.
- `connectedAt`은 ISO 8601 문자열(`created_at`).

### 3-2. 키 저장(연결)

`PUT /api/users/me/ai-connections/:provider`

요청:

```json
{ "apiKey": "sk-..." }
```

처리 순서:

1. `apiKey` 앞뒤 공백을 제거한다. 빈 값이거나 길이가 비정상적이면(예: 10자 미만, 512자 초과) `400`.
2. 제공사에 키를 검증한다(§5). 무효 키면 `400`, 제공사 장애나 타임아웃이면 `502`.
3. 암호화(§4)해서 `(user_id, provider)`로 upsert한다. `created_at`은 새로 연결할 때만 갱신한다.
4. **사용자가 처음 연결한 키라면**(`active_ai_provider`가 NULL이면) `active_ai_provider`를 이 provider로 설정해도 된다. FE는 어느 쪽이든 동작한다. 자동 전환을 원치 않으면 생략한다.

응답 `200`:

```json
{
  "success": true,
  "data": { "provider": "openai", "maskedKey": "sk-...a1b2", "connectedAt": "2026-10-30T09:00:00Z" }
}
```

| 상태 | 언제 | FE 표시 |
|---|---|---|
| `400` | 키 형식 오류 또는 제공사가 무효 키로 응답 | "키가 올바르지 않아요. 키 전체를 다시 복사해 붙여넣어 주세요." |
| `429` | 아래 요청 제한 초과 | "연결하지 못했어요. 잠시 후 다시 시도해 주세요." |
| `502` | 제공사 장애, 타임아웃 | 위와 같음 |

> 이 API는 호출할 때마다 외부 제공사로 요청이 나가므로 **사용자당 요청 제한**을 둔다(예: 1분에 5회).

### 3-3. 연결 해제

`DELETE /api/users/me/ai-connections/:provider`

- 해당 행을 **물리 삭제**한다(soft delete 금지: 키를 남기지 않는다).
- `active_ai_provider`가 이 provider였다면 같은 트랜잭션에서 `NULL`로 되돌린다.
- 이미 없는 연결이어도 `200`(멱등). 응답 본문은 비워도 된다(FE는 빈 본문을 허용).

### 3-4. 사용할 AI 선택

`PATCH /api/users/me/ai-connections`

```json
{ "activeProvider": "openai" }
```

- `null`이면 큐노 기본 AI로 되돌린다.
- 값이 있는데 그 provider 연결이 없으면 `400`.
- 응답: 3-1과 같은 형태(`activeProvider`, `connections`).

---

## 4. 키 암호화와 마스킹

### 4-1. 방식

- **AES-256-GCM**, 마스터 키는 환경변수 `AI_KEY_ENCRYPTION_KEY`(32바이트, base64)로 주입한다. DB나 코드 저장소에 두지 않는다.
- 저장할 때마다 12바이트 랜덤 `iv`를 새로 만든다. iv를 재사용하면 안 된다.
- AAD(추가 인증 데이터)에 `user_id:provider`를 넣으면, 다른 사용자 행으로 암호문을 옮겨 붙여도 복호화가 실패한다(권장).

마스터 키 생성 예:

```bash
openssl rand -base64 32
```

Node.js 예시(다른 언어도 같은 구조):

```ts
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const MASTER_KEY = Buffer.from(process.env.AI_KEY_ENCRYPTION_KEY!, "base64"); // 32 bytes

export function encryptApiKey(plain: string, aad: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  cipher.setAAD(Buffer.from(aad));
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return { encrypted, iv, authTag: cipher.getAuthTag() };
}

export function decryptApiKey(encrypted: Buffer, iv: Buffer, authTag: Buffer, aad: string) {
  const decipher = createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
```

### 4-2. 다루는 규칙

- 복호화는 **튜터가 제공사를 호출하기 직전**에만 하고, 평문을 캐시나 로그에 남기지 않는다.
- 요청/응답 로깅 미들웨어에서 `apiKey` 필드와 `Authorization`, `x-api-key`, `x-goog-api-key` 헤더를 가린다.
- 에러 추적 도구(Sentry 등)로 보내는 이벤트에도 키가 들어가지 않게 한다.

### 4-3. 마스킹

`masked_key = 앞 4자 + "..." + 뒤 4자` (키가 12자 이하이면 `"..." + 뒤 4자`).

| 원본 예 | masked_key |
|---|---|
| `sk-proj-abcd...wxyz1234` | `sk-p...1234` |
| `AIzaSyD...x9Qk` | `AIza...x9Qk` |

---

## 5. 키 검증

PUT 시 제공사에 가벼운 요청을 보내 키가 유효한지 확인한다. **토큰을 쓰는 생성 요청 대신 목록/정보 조회**를 써서 사용자에게 요금이 나가지 않게 한다. 타임아웃은 5초 정도로 둔다.

| provider | 요청 | 유효 | 무효(→ 400) |
|---|---|---|---|
| `openai` | `GET https://api.openai.com/v1/models`<br>`Authorization: Bearer <key>` | 200 | 401 |
| `anthropic` | `GET https://api.anthropic.com/v1/models`<br>`x-api-key: <key>`<br>`anthropic-version: 2023-06-01` | 200 | 401 |
| `gemini` | `GET https://generativelanguage.googleapis.com/v1beta/models`<br>`x-goog-api-key: <key>` | 200 | 400, 403 |
| `openrouter` | `GET https://openrouter.ai/api/v1/key`<br>`Authorization: Bearer <key>` | 200 | 401 |

- 그 밖의 상태(5xx, 429)와 네트워크 오류는 `502`로 돌려준다. 이 경우 키가 무효라고 단정하지 않는다.
- 제공사 엔드포인트는 바뀔 수 있으니, 구현할 때 각 제공사 공식 문서로 한 번 더 확인한다.

---

## 6. 튜터 채팅 연동 (후속 작업)

현재 FE 챗봇 흐름:

1. `POST /api/tutor/chat` (백엔드 튜터, 운영자 키, `remaining-count`로 횟수 제한)
2. 실패하면 FE의 Next 라우트 `/api/chatbot`(OpenAI, 운영자 키)로 대체 호출

사용자 키를 쓰려면 **백엔드 `/api/tutor/chat`** 에서 분기한다.

```
tutorChat(user, request):
  provider = user.active_ai_provider
  if provider is null:
      return 기존 로직 (운영자 키 + remaining-count 차감)

  conn = user_ai_connections[user.id, provider]   # 없으면 active_ai_provider를 NULL로 고치고 기존 로직
  apiKey = decrypt(conn)
  model  = DEFAULT_MODEL[provider]                  # 서버 설정값 (§6-1)
  reply  = callProvider(provider, apiKey, model, systemPrompt, history, message)
  # 사용자 키로 답한 요청은 remaining-count를 차감하지 않는다
  return reply
```

### 6-1. 제공사별 기본 모델 (서버 설정값)

모델 이름은 자주 바뀌므로 코드에 박지 않고 환경변수로 둔다.

| 환경변수 | 설명 |
|---|---|
| `AI_DEFAULT_MODEL_OPENAI` | 예: 저비용 범용 모델 |
| `AI_DEFAULT_MODEL_ANTHROPIC` | 예: Haiku 계열 저비용 모델 |
| `AI_DEFAULT_MODEL_GEMINI` | 무료 티어에서 쓸 수 있는 Flash 계열 모델 |
| `AI_DEFAULT_MODEL_OPENROUTER` | 이름이 `:free`로 끝나는 무료 모델 |

### 6-2. 제공사 호출 형식 요약

| provider | 엔드포인트 | 인증 헤더 |
|---|---|---|
| `openai` | `POST https://api.openai.com/v1/responses` (또는 `/v1/chat/completions`) | `Authorization: Bearer` |
| `anthropic` | `POST https://api.anthropic.com/v1/messages` | `x-api-key`, `anthropic-version` |
| `gemini` | `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | `x-goog-api-key` |
| `openrouter` | `POST https://openrouter.ai/api/v1/chat/completions` (OpenAI 호환) | `Authorization: Bearer` |

OpenRouter 호출 시 `HTTP-Referer: https://www.qknou.kr`, `X-Title: QKNOU` 헤더를 붙이면 OpenRouter 대시보드에 앱 이름이 표시된다(선택).

### 6-3. 사용자 키 호출이 실패했을 때

- **운영자 키로 몰래 대체하지 않는다.** 사용자는 자기 AI로 답한다고 알고 있다.
- 응답 본문에 구분 가능한 에러 코드를 담아 FE가 안내할 수 있게 한다.

| 제공사 응답 | 튜터 응답 | 의미 |
|---|---|---|
| 401/403 | `409` + `{ "code": "AI_KEY_INVALID" }` | 키가 삭제·만료됨 → 마이페이지에서 다시 연결 |
| 429 | `429` + `{ "code": "AI_QUOTA_EXCEEDED" }` | 무료 한도 소진 또는 사용량 한도 도달 |
| 402, 크레딧 부족 | `402` + `{ "code": "AI_BILLING_REQUIRED" }` | 유료 제공사 크레딧/결제 필요 |
| 5xx, 타임아웃 | `502` + `{ "code": "AI_PROVIDER_ERROR" }` | 제공사 장애 |

> FE 챗봇에서 위 코드를 처리하는 작업은 백엔드 배포 후 FE에서 이어서 한다. 지금은 튜터가 실패하면 FE가 `/api/chatbot`(운영자 키)로 넘어가므로, 사용자 키 사용자에게는 이 대체 호출을 막아야 한다. 이 부분도 FE 후속 작업이다.

---

## 7. 보안 체크리스트

- [ ] 평문 키가 응답, 로그, 에러 추적, 분석 이벤트 어디에도 남지 않는다
- [ ] `AI_KEY_ENCRYPTION_KEY`는 서버 환경변수로만 주입하고 저장소에 커밋하지 않는다
- [ ] 저장할 때마다 새 iv를 쓰고, AAD에 `user_id:provider`를 넣는다
- [ ] 모든 API가 **자기 자신(`me`)의 행만** 다룬다 (다른 user_id 접근 불가)
- [ ] PUT 요청 제한(사용자당 분당 N회)
- [ ] 회원 탈퇴 시 `user_ai_connections` 삭제(CASCADE)
- [ ] 연결 해제는 물리 삭제

## 8. 테스트 체크리스트

- [ ] 연결 없음 → GET이 `{ activeProvider: null, connections: [] }`
- [ ] 유효 키 PUT → 200, 응답과 GET에 `maskedKey`만 있고 평문 없음
- [ ] 무효 키 PUT → 400 / 제공사 타임아웃 → 502
- [ ] 같은 provider 재등록 → 행 1개 유지, 키 교체
- [ ] 사용 중인 provider DELETE → `activeProvider`가 null로 바뀜
- [ ] 연결 없는 provider로 PATCH → 400
- [ ] 지원하지 않는 provider 경로 → 400
- [ ] 다른 사용자의 토큰으로는 서로의 연결이 보이지 않음
- [ ] DB의 `encrypted_key`를 다른 사용자 행으로 복사하면 복호화 실패(AAD)

---

## 부록: FE 참고 파일

| 파일 | 내용 |
|---|---|
| `src/constants/apiPaths/UserApiPaths.ts` | `aiConnections`, `aiConnection(provider)` 경로 |
| `src/app/mypage/interface/index.ts` | `TAiProvider`, `IAiConnection`, `IAiConnectionsResponse` 타입 |
| `src/app/mypage/hooks/api/index.ts` | 4개 API 호출 함수 |
| `src/app/mypage/components/ai-connect/` | 화면, OpenRouter PKCE 처리(`openrouterOAuth.ts`) |
