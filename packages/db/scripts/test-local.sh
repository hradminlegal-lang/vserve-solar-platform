#!/usr/bin/env bash
# Runs the database migrations and pgTAP tests against a plain local Postgres (with PostGIS and
# pgTAP installed), for machines where `supabase start` is not available. CI uses real Supabase.
#   PGHOST=/tmp/pg PGPORT=54329 PGUSER=postgres packages/db/scripts/test-local.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DB="vserve_test_$$"
createdb "$DB"
trap 'dropdb --if-exists "$DB" >/dev/null 2>&1 || true' EXIT
run() { psql -v ON_ERROR_STOP=1 -q -d "$DB" "$@"; }
run -c "alter database \"$DB\" set search_path = \"\$user\", public, extensions;" >/dev/null
run -f "$ROOT/packages/db/test-harness/supabase-stub.sql" >/dev/null
for f in "$ROOT"/supabase/migrations/*.sql; do run -f "$f" >/dev/null; done
run -c "create extension if not exists pgtap with schema extensions;" >/dev/null
pg_prove -d "$DB" --ext .sql -r "$ROOT/supabase/tests"
