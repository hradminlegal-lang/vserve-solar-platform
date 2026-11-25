# @vserve/db

Database schema for VServe Solar Platform. Migrations live in `/supabase/migrations`, tests in `/supabase/tests` (pgTAP).

## Run the tests

- With Docker and the Supabase CLI: `npx supabase@2.48.3 start`, then `npx supabase@2.48.3 db reset` and `npx supabase@2.48.3 test db`. CI does this in the `database` job.
- Without Supabase (plain Postgres 16 + PostGIS + pgTAP): `PGHOST=… PGPORT=… PGUSER=postgres pnpm db:test:local`. It loads a small stand-in for Supabase's roles and `auth` schema (`test-harness/supabase-stub.sql`), applies every migration to a throwaway database and runs the same tests.

## Generated types

`types.ts` is generated, never edited by hand: `npx supabase@2.48.3 gen types typescript --local > packages/db/types.ts` (needs `supabase start`). It isn't generated yet because the local Supabase images can't be pulled in the environment that wrote prompt 03; run it once on a machine with Docker and commit the result.

## Rules every table follows

- RLS enabled, with explicit policies, and a test for each policy.
- Table privileges narrowed with `revoke` / column-level `grant`, so RLS is not the only guard.
- Money is `bigint` centavos (`*_centavos`); times are `timestamptz`.
- Privileged changes (verification level, admin flag, settings, statuses) go through `security definer` functions that check the caller and write `audit_log`.

## Adding a company-owned table (template)

```sql
create table public.example_things (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  -- … columns …
  created_at timestamptz not null default now()
);
create index example_things_company_idx on public.example_things (company_id);
alter table public.example_things enable row level security;

create policy example_select on public.example_things for select to authenticated
  using (public.is_member(company_id) or public.is_admin());
create policy example_write on public.example_things for all to authenticated
  using (public.has_role(company_id, array['owner', 'admin']::public.member_role[]))
  with check (public.has_role(company_id, array['owner', 'admin']::public.member_role[]));

revoke all on public.example_things from anon, authenticated;
grant select, insert, update, delete on public.example_things to authenticated;
```

Then add to `supabase/tests/` a tenancy test that, signed in as company B, proves it cannot select, insert, update or delete company A's rows (copy the pattern in `01_tenancy.test.sql`), and a test for each role that should or shouldn't write.
