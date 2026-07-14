create extension if not exists "pgcrypto";

create type public.app_role as enum (
  'guest',
  'user',
  'store_owner',
  'moderator',
  'admin',
  'super_admin'
);

create type public.listing_status as enum (
  'draft',
  'pending',
  'active',
  'rejected',
  'expired',
  'sold',
  'disabled'
);

create type public.transaction_status as enum (
  'pending',
  'completed',
  'failed',
  'cancelled',
  'refunded'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  status text not null default 'active',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.app_role not null unique,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.category_attributes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  input_type text not null check (input_type in ('text', 'number', 'select', 'multi_select', 'boolean')),
  is_required boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table public.category_attribute_options (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references public.category_attributes(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order int not null default 0,
  unique (attribute_id, value)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.locations(id) on delete cascade,
  name text not null,
  slug text not null,
  type text not null check (type in ('city', 'district')),
  created_at timestamptz not null default now(),
  unique (parent_id, slug)
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,
  phone text,
  address text,
  verified_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table public.store_followers (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  category_id uuid not null references public.categories(id),
  location_id uuid references public.locations(id),
  title text not null check (char_length(title) between 8 and 120),
  slug text not null unique,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  currency char(3) not null default 'AZN',
  condition text not null check (condition in ('new', 'used')),
  status public.listing_status not null default 'draft',
  is_premium boolean not null default false,
  is_vip boolean not null default false,
  delivery_available boolean not null default false,
  phone text,
  whatsapp text,
  address text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references public.profiles(id)
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.listing_attribute_values (
  listing_id uuid not null references public.listings(id) on delete cascade,
  attribute_id uuid not null references public.category_attributes(id) on delete cascade,
  value text not null,
  primary key (listing_id, attribute_id)
);

create table public.listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id uuid references public.profiles(id),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.listing_contacts (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid references public.profiles(id),
  channel text not null check (channel in ('phone', 'whatsapp', 'message')),
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  image_url text,
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (reviewer_id, reviewed_user_id, listing_id)
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price numeric(10,2) not null,
  duration_days int not null,
  features jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.packages(id),
  amount numeric(10,2) not null,
  currency char(3) not null default 'AZN',
  status public.transaction_status not null default 'pending',
  provider text not null default 'mock',
  provider_reference text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  invoice_number text unique,
  status public.transaction_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.listing_promotions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  package_id uuid not null references public.packages(id),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent int check (discount_percent between 1 and 100),
  max_uses int,
  used_count int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null,
  title text not null,
  image_url text not null,
  target_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  views_count bigint not null default 0,
  clicks_count bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  query text not null,
  filters jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  query text not null,
  filters jsonb not null default '{}',
  notify_on_match boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  ip_hash text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index listings_search_idx on public.listings
  using gin (to_tsvector('simple', title || ' ' || description));
create index listings_status_created_idx on public.listings (status, created_at desc);
create index listings_category_idx on public.listings (category_id);
create index listings_location_idx on public.listings (location_id);
create index listing_views_listing_idx on public.listing_views (listing_id, created_at desc);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.category_attributes enable row level security;
alter table public.category_attribute_options enable row level security;
alter table public.locations enable row level security;
alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.store_followers enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_attribute_values enable row level security;
alter table public.listing_views enable row level security;
alter table public.listing_contacts enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.reviews enable row level security;
alter table public.packages enable row level security;
alter table public.transactions enable row level security;
alter table public.payments enable row level security;
alter table public.listing_promotions enable row level security;
alter table public.promo_codes enable row level security;
alter table public.banners enable row level security;
alter table public.search_history enable row level security;
alter table public.saved_searches enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;

create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = required_role
  );
$$;

create policy "profiles_select_public" on public.profiles for select using (deleted_at is null);
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

create policy "categories_read" on public.categories for select using (deleted_at is null and is_active = true);
create policy "locations_read" on public.locations for select using (true);
create policy "packages_read" on public.packages for select using (is_active = true);
create policy "banners_read" on public.banners for select using (is_active = true);

create policy "listings_read_active" on public.listings
for select using (status = 'active' and deleted_at is null);

create policy "listings_insert_own" on public.listings
for insert with check (seller_id = auth.uid());

create policy "listings_update_own" on public.listings
for update using (seller_id = auth.uid());

create policy "listings_admin_moderate" on public.listings
for all using (public.has_role('admin') or public.has_role('moderator') or public.has_role('super_admin'));

create policy "favorites_own" on public.favorites
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications_own" on public.notifications
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "messages_members" on public.messages
for select using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

create policy "messages_insert_members" on public.messages
for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = messages.conversation_id
      and cm.user_id = auth.uid()
  )
);

create policy "admin_read_all_audit" on public.audit_logs
for select using (public.has_role('admin') or public.has_role('super_admin'));
