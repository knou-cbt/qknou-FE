#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
npm ci

echo "==> Building Next.js app"
npm run build

echo "==> Verifying build artifacts"
node scripts/verify-build.mjs

echo "==> Restarting PM2"
if pm2 describe qknou-fe >/dev/null 2>&1; then
  pm2 restart qknou-fe
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "==> Deploy complete"
pm2 status qknou-fe
