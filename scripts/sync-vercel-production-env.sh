#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.production"
VERCEL=(npx vercel)

cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "Project not linked. Run this first:"
  echo "  cd goalaxify && npx vercel link"
  exit 1
fi

echo "==> Removing existing Production environment variables..."
existing_names="$(
  "${VERCEL[@]}" env ls production 2>/dev/null \
    | awk 'NR>1 && $1 != "" && $1 != "name" { print $1 }' \
    | sort -u
)"

if [[ -z "$existing_names" ]]; then
  echo "No existing production variables found."
else
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    echo "  - removing $name"
    "${VERCEL[@]}" env rm "$name" production --yes >/dev/null || true
  done <<< "$existing_names"
fi

echo
echo "==> Adding variables from .env.production..."
added=0
skipped=0

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"

  [[ -z "$line" || "$line" == \#* ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  key="${key#"${key%%[![:space:]]*}"}"
  key="${key%"${key##*[![:space:]]}"}"

  if [[ -z "$key" ]]; then
    continue
  fi

  if [[ -z "$value" ]]; then
    echo "  - skipping empty value: $key"
    skipped=$((skipped + 1))
    continue
  fi

  echo "  + adding $key"
  printf '%s' "$value" | "${VERCEL[@]}" env add "$key" production --force >/dev/null
  added=$((added + 1))
done < "$ENV_FILE"

echo
echo "Done. Added $added variables, skipped $skipped empty values."
echo
echo "Add these manually if needed:"
echo "  - CONVEX_DEPLOY_KEY (from Convex dashboard -> Settings -> Deploy Key)"
echo "  - VAPI_WEBHOOK_SECRET (if you use Vapi webhooks)"
echo
echo "Redeploy when ready:"
echo "  npx vercel --prod"
