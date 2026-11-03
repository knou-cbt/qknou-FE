# syntax=docker/dockerfile:1

# ---- deps: 전체 의존성 설치 (devDependencies 포함, 빌드에 필요) ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: next build ----
FROM node:22-alpine AS builder
WORKDIR /app

# 브라우저에서 직접 쓰이는 값 → next build 시점에 고정되므로 ARG로 받아 빌드에 반영
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG API_PROXY_TARGET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NODE_ENV=production \
    API_PROXY_TARGET=$API_PROXY_TARGET
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
  && rm -rf .next/cache

# ---- prod-deps: 프로덕션 의존성만 설치 ----
FROM node:22-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runner: next start ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# root 대신 node 사용자로 실행. next start가 런타임에 .next/cache(이미지 최적화·fetch revalidate 캐시)를
# 만들고 쓰므로 /app과 .next 소유권도 넘김
RUN chown node:node /app

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/next.config.ts ./next.config.ts
COPY --chown=node:node --from=builder /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=builder /app/src ./src
COPY --chown=node:node --from=builder /app/scripts ./scripts
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next ./.next

USER node
EXPOSE 3000

# API_PROXY_TARGET: 런타임 전용 서버 사이드 env (예: http://app:9000)로 docker compose에서 주입
CMD ["npm", "start"]
