#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-test-preview}"
PR_NUM="${2:-42}"
SECRETS_FILE="${3:-}"
HOST="$SLUG.trackfootball.dev"
WORKER="trackfootball-preview-$PR_NUM"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Deploying preview: https://$HOST (worker: $WORKER)"

cd "$REPO_ROOT/packages/rw-app"
RWSDK_DEPLOY=1 pnpm run build

node "$REPO_ROOT/scripts/gen-preview-config.cjs" "$HOST"

if [ ! -f dist/worker/wrangler.json ]; then
  echo "ERROR: dist/worker/wrangler.json not found after build" >&2
  exit 1
fi

if [ -z "$SECRETS_FILE" ]; then
  SECRETS_FILE="$REPO_ROOT/secrets.json"
  echo "WARNING: No secrets file argument provided; defaulting to $SECRETS_FILE" >&2
fi
if [ ! -f "$SECRETS_FILE" ]; then
  echo "ERROR: secrets file not found: $SECRETS_FILE" >&2
  exit 1
fi

# Bootstrap: deploy a stub worker so secrets can be set before the real deploy.
# The real worker code uses tiny-invariant checks that fail without secrets.
STUB=$(mktemp /tmp/stub-XXXXXX.js)
echo 'export default { fetch() { return new Response("initializing", { status: 503 }) } }' > "$STUB"
npx wrangler deploy "$STUB" \
  --name "$WORKER" \
  --no-bundle \
  --compatibility-date "2025-08-21" \
  --compatibility-flags "nodejs_compat"
rm -f "$STUB"

npx wrangler secret bulk "$SECRETS_FILE" --name "$WORKER"

npx wrangler deploy \
  --config dist/worker/wrangler.json \
  --name "$WORKER" \
  --var "BACKEND_API:https://$HOST/api" \
  --var "HOMEPAGE_URL:https://$HOST" \
  --var "AUTH0_BASE_URL:https://$HOST"

echo "Done: https://$HOST"
