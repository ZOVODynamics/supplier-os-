#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is required. Install with: npm i -g vercel" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

git add .

if ! git diff --cached --quiet; then
  git commit -m "Deploy ZOVO Supplier OS MVP"
fi

branch="$(git branch --show-current)"

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin "${branch}"
else
  echo "No git remote named origin is configured; skipping git push." >&2
fi

vercel deploy
