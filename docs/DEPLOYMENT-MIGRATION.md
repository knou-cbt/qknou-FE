# 배포 방식 전환 계획 — GitHub Actions/EC2 → GitLab CI/CD/사내 서버

마지막 업데이트: 2026-09-24

## 1. 배경 및 목적

- 기존 EC2 + GitHub Actions 배포 파이프라인(`.github/workflows/deploy.yml`)은 2026-09-24 커밋(`1fd13e0`)으로 삭제됨. 더 이상 사용하지 않는 파이프라인이었음.
- 인프라를 **사내 서버**로 옮기고, 배포 자동화는 **GitLab CI/CD**로 전환한다.
- 소스 저장소는 계속 **GitHub**(`knou-cbt/qknou-FE`)를 사용하고, 사내 GitLab에는 CI/CD 파이프라인만 연동한다. (결정됨: GitHub 유지 + GitLab CI 연동)
- 배포 아티팩트는 **Docker 이미지**로 빌드해서 사내 서버에 배포한다. (결정됨: Docker 이미지 빌드 후 배포)
- 사내 서버에는 **프론트/백엔드/DB를 하나의 docker-compose 스택**으로 묶고, 그 앞에 **nginx**를 리버스 프록시로 둔다. compose·nginx 정의는 FE/BE 각각의 저장소가 아닌 **별도 인프라 저장소**(예: `qknou-infra`, 가칭)에 둔다. (결정됨)
- DB 엔진은 **PostgreSQL**을 사용한다. (결정됨)

---

## 2. 기존 배포 방식 정리 (AS-IS)

### 2-1. GitHub Actions → EC2 SSH 배포 (삭제됨)

`.github/workflows/deploy.yml` (커밋 `1fd13e0`에서 제거):

- 트리거: `main` 브랜치 push
- 방식: `appleboy/ssh-action`으로 EC2에 직접 SSH 접속
- 절차: `git pull origin main` → `npm run build` → `pm2 restart ecosystem.config.js --env production --update-env`
- 특징: 빌드가 **서버 위에서 직접** 일어남(별도 빌드 서버/아티팩트 없음), 롤백 수단 없음, 시크릿은 GitHub Secrets(`EC2_HOST`, `EC2_USER`, `EC2_KEY`)로 관리

### 2-2. 로컬/수동 PM2 배포 스크립트 (현재도 존재)

- [scripts/deploy.sh](scripts/deploy.sh): `npm ci` → `npm run build` → `node scripts/verify-build.mjs` → `pm2 restart` (없으면 `pm2 start`) → `pm2 save`
- [ecosystem.config.cjs](ecosystem.config.cjs): PM2 프로세스 정의 (fork 모드, 단일 인스턴스, `PORT=3000`)
- `package.json`의 `deploy:pm2` 스크립트로 실행. 현재는 사람이 서버에서 직접 실행하는 수동 배포 경로로 보임 → GitLab CI 전환 시 이 스크립트의 로직(빌드 검증, PM2 재시작 흐름)을 Docker 기반으로 대체할지, 유지할지 결정 필요.

### 2-3. Cloudflare Workers 배포 경로 (별도 존재, 용도 확인 필요)

- `wrangler.jsonc`, `open-next.config.ts`, `@opennextjs/cloudflare` 의존성 존재
- `package.json`의 `deploy`/`preview`/`build:worker` 스크립트로 Cloudflare Workers에 배포 가능한 상태
- 이 경로가 실제 운영에 쓰이고 있는지(예: 스테이징, CDN 프론트, 별도 환경) 확인 필요. 사내 서버 전환과 별개로 유지할지, 정리할지는 이번 전환 범위에 포함할지 팀 논의 필요.

### 2-4. 정리 요약

| 항목 | 기존 상태 |
|---|---|
| 소스 저장소 | GitHub (`knou-cbt/qknou-FE`) |
| CI/CD | GitHub Actions (삭제됨) |
| 배포 대상 | AWS EC2 |
| 실행 방식 | Node 프로세스 + PM2 (fork, 단일 인스턴스) |
| 빌드 위치 | 배포 대상 서버 위에서 직접 빌드 |
| 롤백 | 없음 (git pull 기반, 이전 빌드 보존 안 됨) |
| 시크릿 관리 | GitHub Secrets |

---

## 3. 새로운 배포 방식 (TO-BE)

### 3-1. 저장소 ↔ 사내 GitLab 연동 구조

GitHub을 소스 오브 트루스로 유지하면서 사내 GitLab의 CI/CD만 사용하는 구조이므로, **GitHub → 사내 GitLab으로 커밋을 전달할 방법**을 먼저 정해야 한다. 후보:

1. **GitLab Repository Mirroring (Pull mirror)** — 사내 GitLab 프로젝트가 주기적으로(또는 webhook 트리거로) GitHub 저장소를 pull해서 동기화. GitLab 쪽 CI/CD가 그 미러 저장소에서 실행됨. (가장 표준적인 방식, Recommended)
2. **GitHub Webhook → GitLab Pipeline Trigger API** — GitHub push 이벤트를 감지해 GitLab의 [Pipeline Trigger API](https://docs.gitlab.com/ee/ci/triggers/)를 호출. GitHub Actions를 다시 쓰지 않는다는 원칙과 다소 배치될 수 있어 검토 필요(가벼운 webhook relay는 GitHub Actions가 아니어도 구현 가능 — 예: GitLab의 "외부 pull mirroring" 대신 별도 relay 서버/서비스 필요).
3. **GitLab CI External Pipeline (project 없이 트리거만)** — 사내 GitLab에 코드 없이 파이프라인 정의만 두고, 외부에서 트리거 시 GitHub에서 체크아웃하는 커스텀 파이프라인 구성.

> **결정 필요**: 위 세 가지 중 어떤 연동 방식을 쓸지 인프라 담당자와 확인. 이 문서는 1번(Pull mirroring)을 기본 전제로 이후 내용을 작성함.

### 3-2. 빌드: Docker 이미지

- 현재 저장소에는 `Dockerfile`이 없음 → **신규 작성 필요**
- Next.js를 컨테이너로 돌리기 위해 `next.config.ts`에 `output: "standalone"` 추가 검토 (이미지 크기/빌드 시간 최적화). 현재는 `next start` 기반 실행이므로 standalone 없이도 동작은 하지만, 전체 `node_modules`가 이미지에 포함되어 무거워짐.
- 멀티스테이지 빌드 권장: `deps` → `builder`(`npm run build`) → `runner`(런타임 최소 이미지)
- `scripts/verify-build.mjs`의 빌드 검증 로직은 Docker 빌드 스테이지 안에서도 재사용 가능한지 확인

### 3-3. 이미지 저장소 (Registry)

- 사내 GitLab을 쓰는 경우 **GitLab Container Registry**를 기본 후보로 사용 (별도 구축 불필요, 프로젝트에 내장)
- 대안: 사내 자체 구축 Harbor/Nexus 등 프라이빗 레지스트리
> **결정 필요**: 레지스트리 종류 및 이미지 태깅 전략(예: `main-<commit sha>`, `latest`)

### 3-4. 전체 스택 토폴로지: nginx + FE + BE + DB (단일 docker-compose)

```
사내 서버
└─ docker-compose 스택 (인프라 저장소에서 정의)
   ├─ nginx        : 80/443 노출, / → frontend, /api-proxy(or /api) → backend 로 라우팅, TLS 종료
   ├─ frontend      : qknou-FE 이미지 (Next.js, 내부 포트 3000)
   ├─ backend       : 백엔드 이미지 (내부 포트는 백엔드 쪽 정의에 따름)
   └─ db (postgres) : PostgreSQL, 명명된 볼륨으로 데이터 영속화
   (모두 같은 docker network에 묶여 서비스명으로 상호 통신)
```

- **저장소 구조**: FE 저장소(`qknou-FE`)는 프론트 이미지 빌드/푸시까지만 책임진다. `docker-compose.yml`과 `nginx.conf`는 별도 인프라 저장소(가칭 `qknou-infra`)에서 관리하고, 그 저장소가 FE/BE 각 저장소가 만든 이미지를 레지스트리에서 pull해서 조립한다. (FE/BE 각자의 배포 로직과 전체 스택 오케스트레이션을 분리하는 목적)
- **DB**: 공식 `postgres` 이미지 사용, 명명된 볼륨(`pgdata` 등)으로 데이터 영속화. 백업 정책(예: `pg_dump` cron)은 별도로 필요.
- **nginx**: 정적 리버스 프록시 역할(요청 라우팅 + TLS 종료). 인증서는 사내 CA/Let's Encrypt 등 발급 주체 확인 필요.
- **네트워크**: FE의 기존 `next.config.ts` rewrite(`/api-proxy/:path*` → `API_PROXY_TARGET`)는 그대로 두되, `API_PROXY_TARGET`을 nginx가 아니라 compose 네트워크 내부의 `http://backend:<port>`로 향하게 할지, 혹은 nginx가 `/api-proxy`를 백엔드로 라우팅하게 할지 결정 필요 (아래 §5 Open Questions 참고).

### 3-5. 배포 실행: GitLab Runner + 사내 서버

- 사내 서버에 **GitLab Runner**를 등록(shell 또는 docker executor)해서, 인프라 저장소 파이프라인의 `deploy` 스테이지가 그 러너에서 직접 `docker compose pull && docker compose up -d`를 실행 (SSH 액션 방식 대신 러너가 서버에 상주)
- 환경변수(`.env.production.example` 참고: `PORT`, `API_PROXY_TARGET`, `NEXT_PUBLIC_API_URL` 등, 백엔드/DB 자격증명 포함)는 GitLab CI/CD Variables(Protected + Masked)로 관리하거나, 사내 서버에 이미 존재하는 `.env` 파일을 compose가 읽도록 구성

### 3-6. 파이프라인 구성 (안) — 저장소 2개로 분리

**① `qknou-FE` (이 저장소) — 이미지 빌드/푸시만 담당**

```yaml
stages:
  - install
  - test
  - build

install:
  stage: install
  script:
    - npm ci

test:
  stage: test
  script:
    - npm run lint
    - npm run test

build:
  stage: build
  script:
    - docker build -t $REGISTRY_IMAGE/frontend:$CI_COMMIT_SHORT_SHA .
    - docker push $REGISTRY_IMAGE/frontend:$CI_COMMIT_SHORT_SHA
    - docker tag $REGISTRY_IMAGE/frontend:$CI_COMMIT_SHORT_SHA $REGISTRY_IMAGE/frontend:latest
    - docker push $REGISTRY_IMAGE/frontend:latest
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

**② `qknou-infra` (별도 저장소) — docker-compose 스택 배포 담당**

```yaml
# docker-compose.yml (발췌)
services:
  nginx:
    image: nginx:stable
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [frontend, backend]

  frontend:
    image: $REGISTRY_IMAGE/frontend:latest
    env_file: .env.frontend
    expose: ["3000"]

  backend:
    image: $REGISTRY_IMAGE/backend:latest
    env_file: .env.backend
    expose: ["<backend-port>"]
    depends_on: [db]

  db:
    image: postgres:16
    env_file: .env.db
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```yaml
# .gitlab-ci.yml (발췌)
stages:
  - deploy

deploy:
  stage: deploy
  tags:
    - onprem-runner   # 사내 서버에 등록된 러너
  script:
    - docker compose pull
    - docker compose up -d
    - docker compose ps
  when: manual   # 초기에는 수동 승인, 안정화 후 자동 트리거 검토
```

- **저장소 간 트리거**: FE 이미지가 새로 push된 뒤 인프라 저장소의 deploy 파이프라인을 어떻게 실행할지 결정 필요 — (a) 수동 실행, (b) FE 파이프라인 마지막에 [GitLab Multi-project pipeline trigger](https://docs.gitlab.com/ee/ci/pipelines/downstream_pipelines.html)로 인프라 저장소 파이프라인 호출, (c) 인프라 저장소에서 스케줄(cron) 파이프라인으로 주기적 pull. 초기에는 (a)로 시작해 안정화 후 (b)/(c) 검토 권장.

위 예시들은 초안이며, 실제 백엔드 이미지 이름/포트, nginx 라우팅 규칙, DB 자격증명 관리 방식에 맞춰 조정 필요.

---

## 4. 결정이 필요한 사항 (Open Questions)

- [ ] GitHub → 사내 GitLab 연동 방식 확정 (3-1의 1/2/3 중 선택)
- [ ] 컨테이너 이미지 레지스트리: GitLab Container Registry vs 사내 자체 레지스트리
- [ ] 사내 서버 스펙 및 접근 권한 (GitLab Runner 설치 권한 보유자 확인)
- [ ] 인프라 저장소(`qknou-infra`) 실제 생성 및 소유/권한 주체 확정
- [ ] 백엔드도 이번 기회에 GitLab CI로 이미지 빌드하는지, 아니면 기존 방식대로 별도 관리하는지 (인프라 저장소가 pull할 백엔드 이미지의 출처)
- [ ] FE 이미지 push 이후 인프라 저장소 deploy 파이프라인을 트리거하는 방식 (수동 / downstream pipeline trigger / 스케줄) — §3-6 참고
- [ ] nginx 라우팅 규칙 확정: `/` → frontend, API 경로(`/api-proxy` 등) → backend 매핑 및 기존 `next.config.ts`의 `API_PROXY_TARGET` rewrite와의 역할 분담
- [ ] HTTPS 인증서 발급/갱신 주체 (사내 CA vs Let's Encrypt, nginx에서 갱신 자동화 여부)
- [ ] PostgreSQL 볼륨 백업/복구 정책 (백업 주기, 보관 위치, 복구 리허설 여부)
- [ ] DB 자격증명 및 백엔드/프론트 시크릿 관리 방식 (GitLab CI/CD Variables vs 사내 서버 `.env` 파일 vs Vault 등)
- [ ] 컨테이너 재시작 정책 및 모니터링/로그 수집 방법 (기존 PM2의 `autorestart`, `max_restarts`를 Docker에서 어떻게 대체할지 — 예: `restart: always` + 헬스체크)
- [ ] Cloudflare Workers 배포 경로(2-3)를 이번 전환과 별개로 유지할지 여부
- [ ] 배포 대상 브랜치/승인 절차 (main push 시 자동 배포 유지 vs 수동 승인(manual job) 추가)
- [ ] 롤백 전략 (이전 이미지 태그로 재배포하는 수동 파이프라인 job 구성 여부, DB 마이그레이션이 얽힌 롤백을 어떻게 다룰지)

---

## 5. 마이그레이션 단계 (제안)

1. **사전 조사**: 위 Open Questions 확정 (인프라 담당자와 협의)
2. **`qknou-infra` 저장소 생성**: `docker-compose.yml`, `nginx.conf`, 각 서비스별 `.env.*` 템플릿 작성
3. **FE Dockerfile 작성 및 로컬 검증**: 로컬에서 이미지 빌드/실행 테스트, 기존 `npm run build` 결과와 동일하게 동작하는지 확인
4. **로컬에서 전체 스택(nginx+FE+BE+DB) `docker compose up` 검증**: 사내 서버 배포 전, 로컬/스테이징 환경에서 4개 서비스가 함께 정상 기동하는지, nginx 라우팅이 의도대로 동작하는지 확인
5. **GitHub ↔ 사내 GitLab 연동 구성**: FE 저장소 Repository Mirroring 설정, 최초 동기화 확인
6. **GitLab Runner 등록**: 사내 서버에 러너 설치, 태그(`onprem-runner` 등) 부여
7. **FE `.gitlab-ci.yml` 작성**: install/test/build(이미지 push) 단계까지, 테스트 브랜치로 검증
8. **`qknou-infra` `.gitlab-ci.yml` 작성**: `docker compose pull && up -d` deploy job, 처음엔 `when: manual`
9. **시크릿/환경변수 이관**: GitLab CI/CD Variables 등록, 사내 서버의 `.env.frontend`/`.env.backend`/`.env.db` 준비
10. **1차 수동 배포 리허설**: 인프라 저장소 deploy job을 수동 실행해 사내 서버에 4개 컨테이너가 모두 정상 기동하는지, nginx를 통한 실제 접속이 되는지 확인
11. **DB 백업 스크립트/정책 적용**
12. **main 자동 배포 활성화 여부 결정 및 적용** (저장소 간 트리거 방식 포함)
13. **정리**: 더 이상 쓰지 않는 `scripts/deploy.sh`, `ecosystem.config.cjs` 등 PM2 관련 파일 삭제 여부 결정, `.env.production.example` 문구 업데이트

---

## 6. 참고: 이번 전환에서 유지/폐기 대상

| 파일/설정 | 처리 방향 (안) |
|---|---|
| `scripts/deploy.sh` | Docker 배포로 완전히 전환되면 삭제, 과도기에는 유지 |
| `ecosystem.config.cjs` (PM2) | 컨테이너 내부에서도 PM2를 쓸지, `next start` 단일 프로세스로 갈지 결정 후 처리 |
| `wrangler.jsonc`, `open-next.config.ts` | Cloudflare 경로 유지 여부 결정에 따름 (§4 참고) |
| `.env.production.example` | 사내 서버/Docker 기준 값으로 갱신 (compose 환경변수 이름과 맞추기) |

신규로 생기는 것: FE 저장소에 `Dockerfile`(+`.dockerignore`), `qknou-infra` 저장소에 `docker-compose.yml` / `nginx.conf` / `.gitlab-ci.yml` / 서비스별 `.env.*` 템플릿.
