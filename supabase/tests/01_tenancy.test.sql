-- Prompt 03: tenancy and RLS tests. Company A and company B must never see or change each
-- other's data; customers control who sees their profile; privileged columns are server-only.
begin;
create extension if not exists pgtap with schema extensions;
select plan(37);

-- ------------------------------------------------------------------ fixtures (as postgres)
insert into auth.users (id, email, phone) values
  ('11111111-1111-1111-1111-111111111111', 'a-owner@example.test', '639170000001'),
  ('22222222-2222-2222-2222-222222222222', 'b-owner@example.test', '639170000002'),
  ('33333333-3333-3333-3333-333333333333', 'cust-c@example.test', null),
  ('44444444-4444-4444-4444-444444444444', 'cust-d@example.test', null),
  ('55555555-5555-5555-5555-555555555555', 'admin@example.test', null),
  ('66666666-6666-6666-6666-666666666666', 'a-sales@example.test', null);
update public.profiles set is_admin = true where id = '55555555-5555-5555-5555-555555555555';

insert into public.companies (id, type, legal_name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'installer', 'Company A Inc.', 'company-a'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'installer', 'Company B Inc.', 'company-b');
insert into public.company_members (company_id, profile_id, role) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'sales'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner');
insert into public.verifications (company_id, doc_type, file_path) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'business_permit', 'a/permit.pdf');

insert into public.customer_profiles (id, owner_id, city) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Bacoor'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Imus');
insert into public.bills (customer_profile_id, image_path, kwh, amount_centavos) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'c/bill.jpg', 398, 600000);
insert into public.profile_shares (customer_profile_id, company_id) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
insert into public.profile_shares (customer_profile_id, company_id, expires_at) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '1 day');

insert into public.lender_products (lender, product_name, product_type, annual_rate_pct, term_years_options, min_loan_centavos, max_loan_centavos, source_url, checked_on) values
  ('Fresh Bank', 'Solar loan', 'green_solar', 9, '{5}', 5000000, 50000000, 'https://example.test/fresh', current_date - 10),
  ('Stale Bank', 'Old loan', 'personal', 14, '{3}', 5000000, 100000000, 'https://example.test/stale', current_date - 90);

-- ------------------------------------------------------------------ company B owner looks at company A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select is((select count(*) from public.companies where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 0::bigint, 'B cannot read company A');
select is((select count(*) from public.company_members where company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 0::bigint, 'B cannot read A members');
select is((select count(*) from public.verifications where company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 0::bigint, 'B cannot read A verifications');
select throws_ok(
  $$insert into public.verifications (company_id, doc_type, file_path) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'insurance', 'x.pdf')$$,
  '42501', null, 'B cannot add documents to A');
select throws_ok(
  $$insert into public.company_members (company_id, profile_id, role) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'admin')$$,
  '42501', null, 'B cannot add itself to A');
update public.companies set legal_name = 'Hijacked' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
delete from public.company_members where company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
select is((select count(*) from public.customer_profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 0::bigint, 'B cannot read a profile shared only with A');
select is((select count(*) from public.profile_shares where company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 0::bigint, 'B cannot see shares made to A');

reset role;
select is((select legal_name from public.companies where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'Company A Inc.', 'B update of A changed nothing');
select is((select count(*) from public.company_members where company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 2::bigint, 'B delete of A members changed nothing');

-- ------------------------------------------------------------------ company A sales member
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666","role":"authenticated"}', true);

select is((select count(*) from public.companies where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 1::bigint, 'A member reads own company');
select is((select count(*) from public.customer_profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 1::bigint, 'A member reads a profile shared with A');
select is((select count(*) from public.customer_profiles where id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'), 0::bigint, 'An expired share gives no access');
select is((select count(*) from public.bills), 0::bigint, 'Bills stay private to their owner even when the profile is shared');
select throws_ok(
  $$insert into public.verifications (company_id, doc_type, file_path) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'insurance', 'x.pdf')$$,
  '42501', null, 'A sales member cannot submit verification documents');
select throws_ok(
  $$update public.companies set verification_level = 'pro' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  '42501', null, 'Nobody but the server can change verification_level');
select throws_ok(
  $$update public.profiles set is_admin = true where id = '66666666-6666-6666-6666-666666666666'$$,
  '42501', null, 'Users cannot make themselves admin');

-- ------------------------------------------------------------------ company A owner
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$insert into public.verifications (company_id, doc_type, file_path) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'insurance', 'a/ins.pdf')$$,
  'A owner submits a pending document');
select throws_ok(
  $$insert into public.verifications (company_id, doc_type, file_path, status) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dti_sec', 'a/dti.pdf', 'approved')$$,
  '42501', null, 'A owner cannot submit an already-approved document');
select throws_ok(
  $$update public.verifications set status = 'approved' where company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  '42501', null, 'A owner cannot approve its own documents');
select lives_ok($$update public.companies set trade_name = 'SunRise' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'A owner edits normal company fields');
select throws_ok($$insert into public.audit_log (action, entity) values ('fake', 'x')$$, '42501', null, 'Clients cannot write the audit log');
select throws_ok($$select public.set_setting('calc.ratePhpPerKwh', '1')$$, '42501', null, 'Non-admins cannot change settings');
select isnt(public.create_company('distributor', 'A Parts Trading', 'a-parts'), null, 'Any signed-in user can create a company');
select is((select role::text from public.company_members m join public.companies c on c.id = m.company_id where c.slug = 'a-parts'), 'owner', 'The creator becomes its owner');
select is((select count(*) from public.audit_log), 0::bigint, 'Non-admins cannot read the audit log');

-- ------------------------------------------------------------------ customers
select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select is((select count(*) from public.customer_profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 0::bigint, 'Customers cannot read other customers');
select is((select count(*) from public.bills), 0::bigint, 'Customers cannot read other customers bills');

select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select is((select count(*) from public.bills), 1::bigint, 'Customers read their own bills');
update public.profile_shares set revoked_at = now() where customer_profile_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

select set_config('request.jwt.claims', '{"sub":"66666666-6666-6666-6666-666666666666","role":"authenticated"}', true);
select is((select count(*) from public.customer_profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 0::bigint, 'Revoking a share removes company access at once');

-- ------------------------------------------------------------------ admin
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select lives_ok($$select public.set_setting('calc.ratePhpPerKwh', '15.25')$$, 'Admins change settings');
select is((select count(*) from public.settings_history where key = 'calc.ratePhpPerKwh' and new_value = '15.25'), 1::bigint, 'Setting changes are kept in history');
select is((select count(*) from public.audit_log where action = 'setting.update'), 1::bigint, 'Setting changes are audited');
select throws_ok($$delete from public.audit_log$$, '42501', null, 'Not even admins can delete audit entries');

-- ------------------------------------------------------------------ anonymous visitors
reset role;
update public.companies set verification_level = 'basic' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((public.get_calc_config() ->> 'ratePhpPerKwh')::numeric, 15.25, 'Calculator config is public and reflects settings');
select is((select count(*) from public.lender_products), 1::bigint, 'Lender products not checked in 60 days are hidden');
select is((select count(*) from public.companies_public), 1::bigint, 'The public directory lists only verified companies');
select throws_ok($$select * from public.profiles$$, '42501', null, 'Anonymous visitors cannot read profiles');

select * from finish();
rollback;
