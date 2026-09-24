# syntax=docker/dockerfile:1

# ---- deps: 전체 의존성 설치 (devDependencies 포함, 빌드에 필요) ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: next build ----
FROM node:20-alpine AS builder
WORKDIR /app

# 브라우저에서 직접 쓰이는 값 → next build 시점에 고정되므로 ARG로 받아 빌드에 반영
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
  && rm -rf .next/cache

# ---- prod-deps: 프로덕션 의존성만 설치 ----
FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runner: next start ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

USER nextjs
EXPOSE 3000

# API_PROXY_TARGET: 런타임 전용 서버 사이드 env (예: http://app:9000)로 docker compose에서 주입
CMD ["npm", "start"]
