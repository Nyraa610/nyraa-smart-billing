alter table public.quotes add column show_subtotal boolean default true;

grant select, insert, update, delete on public.quotes to authenticated;
grant all on public.quotes to service_role;
