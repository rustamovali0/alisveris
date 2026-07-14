-- Run after 0001_initial_schema.sql in Supabase SQL Editor.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type public.account_type as enum ('individual', 'store');
  end if;
end $$;

alter table public.profiles
  add column if not exists account_type public.account_type;

alter table public.locations drop constraint if exists locations_type_check;
alter table public.locations
  add constraint locations_type_check check (type in ('city', 'district', 'metro'));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_type public.account_type;
  default_role public.app_role;
begin
  selected_type := case
    when new.raw_user_meta_data ->> 'account_type' in ('individual', 'store')
      then (new.raw_user_meta_data ->> 'account_type')::public.account_type
    else null
  end;

  insert into public.profiles (id, full_name, account_type)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    selected_type
  )
  on conflict (id) do nothing;

  default_role := case when selected_type = 'store' then 'store_owner' else 'user' end;
  insert into public.user_roles (user_id, role_id)
  select new.id, roles.id from public.roles where roles.name = default_role
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.guard_account_type_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.account_type is not null
     and new.account_type is distinct from old.account_type
     and not (
       public.has_role('admin')
       or public.has_role('super_admin')
     ) then
    raise exception 'Hesab tipi yalnız admin tərəfindən dəyişdirilə bilər';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_account_type on public.profiles;
create trigger guard_profile_account_type
  before update of account_type on public.profiles
  for each row execute function public.guard_account_type_change();

create policy "profiles_admin_update" on public.profiles
for update using (
  public.has_role('admin') or public.has_role('super_admin')
) with check (
  public.has_role('admin') or public.has_role('super_admin')
);

create policy "stores_read_public" on public.stores
for select using (deleted_at is null);

create policy "stores_insert_owner" on public.stores
for insert with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.account_type = 'store'
  )
);

create policy "stores_update_owner" on public.stores
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.validate_listing_account_type()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller_type public.account_type;
begin
  select account_type into seller_type from public.profiles where id = new.seller_id;
  if seller_type = 'individual' and new.store_id is not null then
    raise exception 'Fərdi hesab mağaza elanı yarada bilməz';
  end if;
  if seller_type = 'store' and not exists (
    select 1 from public.stores s where s.id = new.store_id and s.owner_id = new.seller_id
  ) then
    raise exception 'Mağaza hesabı yalnız öz mağazasına məhsul əlavə edə bilər';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_listing_seller_type on public.listings;
create trigger validate_listing_seller_type
  before insert or update of seller_id, store_id on public.listings
  for each row execute function public.validate_listing_account_type();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-logos',
  'store-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "store_logos_public_read" on storage.objects
for select using (bucket_id = 'store-logos');

create policy "store_logos_owner_insert" on storage.objects
for insert to authenticated with check (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "store_logos_owner_update" on storage.objects
for update to authenticated using (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

insert into public.system_settings (key, value)
values
  ('site_identity', '{"siteName":"alışveriş.az","browserTitle":"alışveriş.az - Al, sat və axtardığını tap","logoUrl":"","faviconUrl":""}'::jsonb),
  ('mobile_app_label', '"Tezliklə"'::jsonb)
on conflict (key) do nothing;

-- Full city/district/metro seed remains idempotent.
insert into public.locations (name, slug, type)
values
  ('Sumqayıt', 'sumqayit', 'city'), ('Gəncə', 'gence', 'city'),
  ('Xırdalan', 'xirdalan', 'city'), ('Mingəçevir', 'mingecevir', 'city'),
  ('Naxçıvan', 'naxcivan', 'city'), ('Lənkəran', 'lenkeran', 'city'),
  ('Şəki', 'seki', 'city'), ('Quba', 'quba', 'city'),
  ('Şamaxı', 'samaxi', 'city'), ('Qəbələ', 'qebele', 'city'),
  ('Masallı', 'masalli', 'city'), ('Xaçmaz', 'xacmaz', 'city'),
  ('Şəmkir', 'semkir', 'city'), ('Tovuz', 'tovuz', 'city'),
  ('Qusar', 'qusar', 'city'), ('Zaqatala', 'zaqatala', 'city'),
  ('Bərdə', 'berde', 'city'), ('Şirvan', 'sirvan', 'city')
on conflict (parent_id, slug) do nothing;

with baki as (
  select id from public.locations where slug = 'baki' and type = 'city' limit 1
)
insert into public.locations (parent_id, name, slug, type)
select baki.id, station.name, station.slug, 'metro'
from baki
cross join (values
  ('İçərişəhər', 'iceriseher'), ('Sahil', 'sahil'), ('28 May', '28-may'),
  ('Gənclik', 'genclik'), ('Nəriman Nərimanov', 'neriman-nerimanov'),
  ('Ulduz', 'ulduz'), ('Koroğlu', 'koroglu'), ('Qara Qarayev', 'qara-qarayev'),
  ('Neftçilər', 'neftciler'), ('Xalqlar Dostluğu', 'xalqlar-dostlugu'),
  ('Əhmədli', 'ehmedli'), ('Həzi Aslanov', 'hezi-aslanov'),
  ('Cəfər Cabbarlı', 'cefer-cabbarli'), ('Xətai', 'xetai'), ('Nizami', 'nizami'),
  ('Elmlər Akademiyası', 'elmler-akademiyasi'), ('İnşaatçılar', 'insaatcilar'),
  ('20 Yanvar', '20-yanvar'), ('Memar Əcəmi', 'memar-ecemi'), ('Nəsimi', 'nesimi'),
  ('Azadlıq prospekti', 'azadliq-prospekti'), ('Dərnəgül', 'dernegul'),
  ('Avtovağzal', 'avtovagzal'), ('8 Noyabr', '8-noyabr'),
  ('Xocəsən', 'xocesen'), ('Bakmil', 'bakmil')
) as station(name, slug)
on conflict (parent_id, slug) do nothing;
