-- Run this migration in the shared Supabase SQL Editor before deploying a
-- frontend that consumes deployment-time CMS redirects.
begin;

-- PostgreSQL cannot change a function's return type with CREATE OR REPLACE.
-- This drops only the existing RPC signature inside the same transaction.
drop function if exists public.list_public_redirects(text);

create or replace function public.list_public_redirects(domain text)
returns table (
  from_path text,
  to_url text,
  redirect_type integer
)
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  with active_redirects as (
    select
      case
        when r.from_path = '/' then '/'
        else coalesce(nullif(regexp_replace(r.from_path, '/+$', ''), ''), '/')
      end as from_path,
      r.to_url,
      case when r.redirect_type::text = '302' then 302 else 301 end as redirect_type
    from public.cms_redirects r
    where r.website_id = public.cms_public_website_id(domain)
      and r.is_active = true
      and r.from_path is not null
      and r.from_path ~ '^/'
      and r.from_path !~ '[?#]'
      and r.to_url is not null
      and btrim(r.to_url) <> ''
  )
  select from_path, to_url, redirect_type
  from active_redirects
  order by from_path;
$function$;

revoke all on function public.list_public_redirects(text) from public;
grant execute on function public.list_public_redirects(text) to anon, authenticated;

commit;
