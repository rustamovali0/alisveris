-- Run after 0002_account_types_branding_and_locations.sql.

create policy "roles_admin_read" on public.roles
for select using (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "user_roles_admin_manage" on public.user_roles
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "categories_admin_manage" on public.categories
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "category_attributes_admin_manage" on public.category_attributes
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "category_options_admin_manage" on public.category_attribute_options
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "stores_admin_manage" on public.stores
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "reports_admin_manage" on public.reports
for all using (
  public.has_role('admin') or public.has_role('moderator') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('moderator') or public.has_role('super_admin')
);

create policy "transactions_admin_manage" on public.transactions
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "payments_admin_manage" on public.payments
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "banners_admin_manage" on public.banners
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "system_settings_public_read" on public.system_settings
for select using (
  key in ('site_settings', 'site_identity', 'mobile_app_label')
);

create policy "system_settings_admin_manage" on public.system_settings
for all using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "audit_logs_admin_insert" on public.audit_logs
for insert with check (
  actor_id = auth.uid()
  and (public.has_role('admin') or public.has_role('moderator') or public.has_role('super_admin'))
);

create or replace function public.admin_set_user_role(
  target_user uuid,
  new_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.has_role('admin') or public.has_role('super_admin')) then
    raise exception 'Bu əməliyyat üçün admin səlahiyyəti lazımdır';
  end if;

  if target_user = auth.uid() and new_role not in ('admin', 'super_admin') then
    raise exception 'Aktiv admin öz admin səlahiyyətini silə bilməz';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = target_user and r.name = 'super_admin'
  ) and not public.has_role('super_admin') then
    raise exception 'Super admin rolunu yalnız super admin dəyişə bilər';
  end if;

  delete from public.user_roles ur
  using public.roles r
  where ur.user_id = target_user
    and ur.role_id = r.id
    and r.name <> 'super_admin';

  insert into public.user_roles (user_id, role_id)
  select target_user, id from public.roles where name = new_role
  on conflict (user_id, role_id) do nothing;
end;
$$;

insert into public.system_settings (key, value)
values ('site_settings', '{}'::jsonb)
on conflict (key) do nothing;
