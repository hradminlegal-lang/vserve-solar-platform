begin;
create extension if not exists pgtap with schema extensions;
select plan(1);
select ok(true, 'database test runner works');
select * from finish();
rollback;
