# 패키지 관리 가이드

## 구조 요약

| 위치 | 역할 | 의존성 |
|------|------|--------|
| **루트** `package.json` | 워크스페이스 정의 + 공통 스크립트 | **없음** (의존성 설치 안 함) |
| **shared** | 공유 라이브러리 (`@qknou/shared`) | `peerDependencies`만 (react, react-query 등은 “요구만”) |
| **apps/web** | Next.js 웹 앱 | 실제 런타임/빌드 의존성 전부 |

---

## 1. 루트 (맨 바깥) `package.json`

- **하는 일**: `workspaces`로 `apps/*`, `shared`를 하나의 저장소로 묶음.
- **의존성**: 넣지 않음. `npm install`은 루트에서 한 번만 실행하면, 워크스페이스 안 패키지들이 같이 설치됨.
- **스크립트**: 각 앱/패키지 스크립트를 대신 실행하는 “진입점”만 둠.
  - 예: `npm run dev` → `apps/web`의 `dev` 실행.

---

## 2. shared `package.json`

- **하는 일**: `@qknou/shared` 패키지 정의. features(exam, subject 등) export.
- **의존성**:
  - **peerDependencies**: `react`, `react-dom`, `@tanstack/react-query` (버전만 명시, 직접 설치 안 함).
  - **devDependencies**: 타입/빌드용 (`typescript`, `@types/react` 등)만.
- **원칙**: 런타임 라이브러리는 앱(web/mobile)이 설치하고, shared는 “이 버전 쓰세요”만 요구.

---

## 3. apps/web `package.json`

- **하는 일**: Next.js 앱. 실제 서비스 코드와 빌드/실행에 필요한 모든 패키지.
- **의존성**:
  - `@qknou/shared`: `file:../../shared` (또는 pnpm이면 `workspace:*`).
  - `@tanstack/react-query`, `react`, `next` 등 **실제 설치**되는 패키지 전부 여기 선언.

---

## 일상적인 작업 흐름

1. **의존성 추가**
   - 앱용 패키지 → `apps/web/package.json`의 `dependencies` / `devDependencies`에 추가.
   - shared 전용 타입/도구 → `shared/package.json`의 `devDependencies`에 추가.

2. **설치**
   - 항상 **루트**에서 한 번만:
   ```bash
   npm install
   ```

3. **실행**
   - 루트에서:
   ```bash
   npm run dev    # 웹 앱 개발 서버
   npm run build  # 웹 앱 빌드
   npm run lint   # 웹 앱 린트
   ```
   - 또는 앱 폴더에서 직접:
   ```bash
   cd apps/web && npm run dev
   ```

---

## 정리

- **루트**: “어떤 패키지들이 있는지” + “공통 실행 스크립트”만 관리.
- **shared**: “무엇을 export하는지” + “어떤 peer를 요구하는지”만 관리.
- **apps/web**: “실제로 설치할 패키지”와 “앱 전용 스크립트” 관리.

새 패키지(예: `apps/mobile`)를 추가할 때는 루트 `workspaces`에 이미 `apps/*`가 있으므로, `apps/mobile/package.json`만 만들면 자동으로 워크스페이스에 포함됩니다.
