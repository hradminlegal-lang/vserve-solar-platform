-- Prompt 03: core tables, tenancy helpers and row-level security.
-- Spec: docs/data-model.md (Platform and identity, Customers), docs/trust.md, docs/financing.md.
-- Rules: money in bigint centavos, times in timestamptz (UTC), RLS on every table,
-- privileged columns (is_admin, verification_level) writable only by the service role.

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------- types
create type public.company_type as enum ('installer', 'epc', 'distributor');
create type public.verification_level as enum ('unverified', 'basic', 'verified', 'pro');
create type public.member_role as enum ('owner', 'admin', 'sales', 'engineer', 'installer', 'viewer');
create type public.verification_status as enum ('pending', 'approved', 'rejected', 'expired');
create type public.roof_check_source as enum ('solar_api', 'manual');

-- ---------------------------------------------------------------- updated_at helper
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone_e164 text check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  email text,
  is_admin boolean not null default false,
  privacy_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- A profile row for every new auth user.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, phone_e164, email)
  values (new.id, case when new.phone is null or new.phone = '' then null else '+' || ltrim(new.phone, '+') end, new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- tenancy helpers
-- security definer so policies can call them without recursive RLS checks.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------- companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  type public.company_type not null,
  legal_name text not null check (length(legal_name) between 2 and 200),
  trade_name text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  dti_sec_no text,
  permit_path text,
  service_area extensions.geography(MultiPolygon, 4326),
  cities text[] not null default '{}',
  verification_level public.verification_level not null default 'unverified',
  rating_avg numeric(3, 2),
  rating_count integer not null default 0,
  median_response_hours numeric(6, 1),
  plan text not null default 'free',
  vat_registered boolean not null default false,
  default_margin_pct numeric(5, 2) check (default_margin_pct is null or default_margin_pct between 0 and 95),
  default_setbacks jsonb not null default '{"edge_m": 0.4, "ridge_m": 0.6}',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index companies_service_area_gix on public.companies using gist (service_area);
create trigger companies_touch before update on public.companies for each row execute function public.touch_updated_at();

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null,
  prc_licence_no text,
  licence_type text check (licence_type is null or licence_type in ('PRC REE', 'PRC RME', 'TESDA')),
  licence_expiry date,
  created_at timestamptz not null default now(),
  unique (company_id, profile_id)
);
create index company_members_profile_idx on public.company_members (profile_id);

create or replace function public.is_member(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.company_members m where m.company_id = target and m.profile_id = auth.uid());
$$;

create or replace function public.has_role(target uuid, roles public.member_role[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = target and m.profile_id = auth.uid() and m.role = any (roles)
  );
$$;

-- Creating a company also makes the caller its owner; there is no direct insert.
create or replace function public.create_company(p_type public.company_type, p_legal_name text, p_slug text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'sign in to create a company' using errcode = '42501';
  end if;
  insert into public.companies (type, legal_name, slug, created_by)
  values (p_type, p_legal_name, p_slug, auth.uid())
  returning id into new_id;
  insert into public.company_members (company_id, profile_id, role) values (new_id, auth.uid(), 'owner');
  return new_id;
end $$;

-- Public directory columns only, and only for companies that passed at least basic verification.
create view public.companies_public with (security_invoker = false) as
select id, type, trade_name, legal_name, slug, cities, verification_level, rating_avg, rating_count, median_response_hours
from public.companies
where verification_level <> 'unverified';

-- ---------------------------------------------------------------- verifications
create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  doc_type text not null check (doc_type in ('owner_id', 'dti_sec', 'business_permit', 'prc_licence', 'insurance', 'portfolio')),
  file_path text not null,
  status public.verification_status not null default 'pending',
  reviewer_id uuid references public.profiles (id),
  reason text,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index verifications_company_idx on public.verifications (company_id, status);
create trigger verifications_touch before update on public.verifications for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- settings
create table public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

create table public.settings_history (
  id bigint generated always as identity primary key,
  key text not null,
  old_value jsonb,
  new_value jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by uuid
);

create or replace function public.record_settings_history() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.settings_history (key, old_value, new_value, changed_by)
  values (new.key, case when tg_op = 'UPDATE' then old.value end, new.value, auth.uid());
  new.updated_at := now();
  return new;
end $$;
create trigger settings_history_trg before insert or update on public.settings for each row execute function public.record_settings_history();

-- ---------------------------------------------------------------- audit log (insert-only)
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity, entity_id, created_at);

create or replace function public.log_audit(p_action text, p_entity text, p_entity_id text, p_data jsonb default '{}')
returns void
language sql security definer set search_path = '' as $$
  insert into public.audit_log (actor_id, action, entity, entity_id, data) values (auth.uid(), p_action, p_entity, p_entity_id, p_data);
$$;

-- Admin-only change to a setting, with history (trigger) and audit.
create or replace function public.set_setting(p_key text, p_value jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'only admins can change settings' using errcode = '42501';
  end if;
  update public.settings set value = p_value, updated_by = auth.uid() where key = p_key;
  if not found then
    raise exception 'unknown setting %', p_key using errcode = 'P0002';
  end if;
  perform public.log_audit('setting.update', 'settings', p_key, jsonb_build_object('value', p_value));
end $$;

-- Calculator defaults as one JSON object (shape of CalcConfig in packages/calc).
create or replace function public.get_calc_config() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(replace(key, 'calc.', ''), value), '{}'::jsonb)
  from public.settings
  where key like 'calc.%';
$$;

-- ---------------------------------------------------------------- customers
create table public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  address text,
  location extensions.geography(Point, 4326),
  barangay text,
  city text,
  province text,
  property_type text check (property_type is null or property_type in ('house', 'townhouse', 'condo', 'commercial')),
  roof_type text,
  utility text,
  rate_php_per_kwh numeric(8, 4),
  monthly_kwh numeric(10, 2)[] check (monthly_kwh is null or array_length(monthly_kwh, 1) <= 12),
  daytime_share_pct numeric(5, 2) check (daytime_share_pct is null or daytime_share_pct between 0 and 100),
  goals jsonb not null default '{}',
  budget_centavos bigint check (budget_centavos is null or budget_centavos >= 0),
  financing_interest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customer_profiles_owner_idx on public.customer_profiles (owner_id);
create index customer_profiles_location_gix on public.customer_profiles using gist (location);
create trigger customer_profiles_touch before update on public.customer_profiles for each row execute function public.touch_updated_at();

create table public.profile_shares (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references public.customer_profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  scope text not null default 'full' check (scope in ('full', 'summary')),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (customer_profile_id, company_id)
);
create index profile_shares_company_idx on public.profile_shares (company_id);

-- True when the caller belongs to a company with an active share of this customer profile.
create or replace function public.can_read_shared_profile(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.profile_shares s
    join public.company_members m on m.company_id = s.company_id and m.profile_id = auth.uid()
    where s.customer_profile_id = target
      and s.revoked_at is null
      and (s.expires_at is null or s.expires_at > now())
  );
$$;

create or replace function public.owns_customer_profile(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.customer_profiles c where c.id = target and c.owner_id = auth.uid());
$$;

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references public.customer_profiles (id) on delete cascade,
  image_path text not null,
  utility text,
  period_start date,
  period_end date,
  kwh numeric(10, 2) check (kwh is null or kwh >= 0),
  amount_centavos bigint check (amount_centavos is null or amount_centavos >= 0),
  rate_php_per_kwh numeric(8, 4),
  account_last4 text check (account_last4 is null or account_last4 ~ '^[0-9]{4}$'),
  confidence jsonb not null default '{}',
  confirmed_by_user boolean not null default false,
  created_at timestamptz not null default now()
);
create index bills_profile_idx on public.bills (customer_profile_id);

create table public.roof_checks (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid references public.customer_profiles (id) on delete cascade,
  location extensions.geography(Point, 4326) not null,
  source public.roof_check_source not null,
  imagery_quality text check (imagery_quality is null or imagery_quality in ('HIGH', 'MEDIUM', 'BASE')),
  imagery_date date,
  segments jsonb not null default '[]',
  max_panels integer check (max_panels is null or max_panels >= 0),
  est_kwp numeric(8, 3),
  est_annual_kwh numeric(12, 1),
  fetched_at timestamptz not null default now()
);
create index roof_checks_profile_idx on public.roof_checks (customer_profile_id);

-- ---------------------------------------------------------------- lender products (table only; prompt 16 adds the flow)
create table public.lender_products (
  id uuid primary key default gen_random_uuid(),
  lender text not null,
  product_name text not null,
  product_type text not null check (product_type in ('housing_top_up', 'home_improvement', 'personal', 'salary', 'green_solar', 'government_fund')),
  annual_rate_pct numeric(6, 3) not null check (annual_rate_pct >= 0),
  rate_type text not null default 'fixed',
  term_years_options integer[] not null,
  min_loan_centavos bigint not null check (min_loan_centavos >= 0),
  max_loan_centavos bigint not null check (max_loan_centavos >= min_loan_centavos),
  min_down_pct numeric(5, 2) not null default 0,
  fees_pct numeric(5, 2) not null default 0,
  borrower_types text[] not null default '{}',
  required_documents text[] not null default '{}',
  membership_required text,
  source_url text not null,
  checked_on date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger lender_products_touch before update on public.lender_products for each row execute function public.touch_updated_at();

-- ================================================================ row-level security
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.verifications enable row level security;
alter table public.settings enable row level security;
alter table public.settings_history enable row level security;
alter table public.audit_log enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.profile_shares enable row level security;
alter table public.bills enable row level security;
alter table public.roof_checks enable row level security;
alter table public.lender_products enable row level security;

-- profiles: own row; admins read all. is_admin is not client-writable (column grants below).
create policy profiles_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- companies: members read their company; owners/admins edit non-privileged columns; admins read all.
create policy companies_select on public.companies for select to authenticated using (public.is_member(id) or public.is_admin());
create policy companies_update on public.companies for update to authenticated
  using (public.has_role(id, array['owner', 'admin']::public.member_role[]))
  with check (public.has_role(id, array['owner', 'admin']::public.member_role[]));

-- company_members: visible to the same company; managed by owners/admins of that company.
create policy members_select on public.company_members for select to authenticated using (public.is_member(company_id) or public.is_admin());
create policy members_insert on public.company_members for insert to authenticated
  with check (public.has_role(company_id, array['owner', 'admin']::public.member_role[]) and role <> 'owner');
create policy members_update on public.company_members for update to authenticated
  using (public.has_role(company_id, array['owner', 'admin']::public.member_role[]))
  with check (public.has_role(company_id, array['owner', 'admin']::public.member_role[]) and role <> 'owner');
create policy members_delete on public.company_members for delete to authenticated
  using (public.has_role(company_id, array['owner', 'admin']::public.member_role[]) and role <> 'owner');

-- verifications: members read and submit pending documents; only admins decide (service role / admin functions).
create policy verifications_select on public.verifications for select to authenticated using (public.is_member(company_id) or public.is_admin());
create policy verifications_insert on public.verifications for insert to authenticated
  with check (public.has_role(company_id, array['owner', 'admin']::public.member_role[]) and status = 'pending' and reviewer_id is null and reason is null);

-- settings: everyone reads; changes only through set_setting().
create policy settings_select on public.settings for select to anon, authenticated using (true);
create policy settings_history_select on public.settings_history for select to authenticated using (public.is_admin());

-- audit_log: admins read; nobody updates or deletes; inserts only through security-definer functions.
create policy audit_select on public.audit_log for select to authenticated using (public.is_admin());

-- customer_profiles: owner full access; companies read only through an active share.
create policy cp_owner_all on public.customer_profiles for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy cp_shared_select on public.customer_profiles for select to authenticated using (public.can_read_shared_profile(id));

-- profile_shares: owner creates and revokes; the company sees shares made to it.
create policy shares_owner_all on public.profile_shares for all to authenticated
  using (public.owns_customer_profile(customer_profile_id)) with check (public.owns_customer_profile(customer_profile_id));
create policy shares_company_select on public.profile_shares for select to authenticated using (public.is_member(company_id));

-- bills: owner only.
create policy bills_owner_all on public.bills for all to authenticated
  using (public.owns_customer_profile(customer_profile_id)) with check (public.owns_customer_profile(customer_profile_id));

-- roof_checks: written by the server; owner and sharing companies read.
create policy roof_checks_select on public.roof_checks for select to authenticated
  using (customer_profile_id is not null and (public.owns_customer_profile(customer_profile_id) or public.can_read_shared_profile(customer_profile_id)));

-- lender_products: everyone reads active products checked in the last 60 days; admins read all.
create policy lender_products_public on public.lender_products for select to anon, authenticated
  using (active and checked_on >= current_date - 60);
create policy lender_products_admin on public.lender_products for select to authenticated using (public.is_admin());

-- ================================================================ privileges
-- Supabase grants table privileges broadly by default; narrow them so RLS is not the only guard.
revoke all on public.profiles, public.companies, public.company_members, public.verifications, public.settings,
  public.settings_history, public.audit_log, public.customer_profiles, public.profile_shares, public.bills,
  public.roof_checks, public.lender_products from anon, authenticated;

grant select on public.settings, public.lender_products, public.companies_public to anon, authenticated;
grant select on public.profiles, public.companies, public.company_members, public.verifications, public.settings_history,
  public.audit_log, public.customer_profiles, public.profile_shares, public.bills, public.roof_checks to authenticated;

grant update (full_name, phone_e164, email, privacy_consent_at) on public.profiles to authenticated;
grant update (legal_name, trade_name, dti_sec_no, permit_path, service_area, cities, vat_registered, default_margin_pct, default_setbacks)
  on public.companies to authenticated;
grant insert, update, delete on public.company_members to authenticated;
grant insert on public.verifications to authenticated;
grant insert, update, delete on public.customer_profiles, public.profile_shares, public.bills to authenticated;

revoke execute on function public.create_company(public.company_type, text, text) from public, anon;
grant execute on function public.create_company(public.company_type, text, text) to authenticated;
revoke execute on function public.set_setting(text, jsonb) from public, anon;
grant execute on function public.set_setting(text, jsonb) to authenticated;
revoke execute on function public.log_audit(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.get_calc_config() to anon, authenticated;

-- ================================================================ seed data that production needs
insert into public.settings (key, value, description) values
  ('calc.ratePhpPerKwh', '15.06', 'Meralco residential rate, Oct 2026 (₱/kWh)'),
  ('calc.yieldKwhPerKwpDay', '4.0', 'Planning yield for quick estimates (kWh per kWp per day)'),
  ('calc.panelWatts', '600', 'Default panel size (W)'),
  ('calc.panelAreaM2', '2.6', 'Roof area per panel incl. spacing (m²)'),
  ('calc.priceLowPerKwp', '50000', 'Grid-tied installed price, low (₱ per kWp)'),
  ('calc.priceHighPerKwp', '70000', 'Grid-tied installed price, high (₱ per kWp)'),
  ('calc.exportCreditPhpPerKwh', '5.5', 'Net-metering export credit (₱/kWh)'),
  ('calc.daysPerMonth', '30', 'Days per month used in monthly estimates'),
  ('finance.degradationPct', '0.5', 'Panel output loss per year (%)'),
  ('finance.escalationPct', '2', 'Electricity price rise per year (%)'),
  ('finance.omInflationPct', '3', 'Upkeep cost rise per year (%)'),
  ('finance.discountPct', '8', 'Discount rate for NPV and LCOE (%)'),
  ('finance.maxDtiPct', '35', 'Indicative maximum debt-to-income (%)');
