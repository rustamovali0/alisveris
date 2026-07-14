insert into public.roles (name)
values
  ('guest'),
  ('user'),
  ('store_owner'),
  ('moderator'),
  ('admin'),
  ('super_admin')
on conflict (name) do nothing;

insert into public.categories (name, slug, icon, sort_order)
values
  ('Nəqliyyat', 'neqliyyat', 'car', 1),
  ('Daşınmaz əmlak', 'dasinmaz-emlak', 'building', 2),
  ('Telefonlar', 'telefonlar', 'smartphone', 3),
  ('Kompüter və elektronika', 'komputer-elektronika', 'laptop', 4),
  ('Məişət texnikası', 'meiset-texnikasi', 'washing-machine', 5),
  ('Ev və bağ', 'ev-bag', 'sofa', 6),
  ('Geyim və moda', 'geyim-moda', 'shirt', 7),
  ('Uşaq məhsulları', 'usaq-mehsullari', 'baby', 8),
  ('Hobbi və istirahət', 'hobbi-istirahet', 'gamepad', 9),
  ('Heyvanlar', 'heyvanlar', 'paw', 10),
  ('İş elanları', 'is-elanlari', 'briefcase', 11),
  ('Xidmətlər', 'xidmetler', 'tool', 12),
  ('Biznes və avadanlıq', 'biznes-avadanliq', 'cpu', 13),
  ('Digər', 'diger', 'home', 14),
  ('Gözəllik və sağlamlıq', 'gozellik-saglamliq', 'sparkles', 15)
on conflict (slug) do nothing;

with parent_categories as (
  select id, slug from public.categories
),
subcategory_seed(name, slug, parent_slug) as (
  values
    ('Avtomobillər', 'avtomobiller', 'neqliyyat'),
    ('Motosikletlər', 'motosikletler', 'neqliyyat'),
    ('Ehtiyat hissələri', 'ehtiyat-hisseleri', 'neqliyyat'),
    ('Avtobuslar', 'avtobuslar', 'neqliyyat'),
    ('Yük maşınları', 'yuk-masinlari', 'neqliyyat'),
    ('Mənzillər', 'menziller', 'dasinmaz-emlak'),
    ('Həyət evləri', 'heyet-evleri', 'dasinmaz-emlak'),
    ('Torpaq', 'torpaq', 'dasinmaz-emlak'),
    ('Ofislər', 'ofisler', 'dasinmaz-emlak'),
    ('Obyektlər', 'obyektler', 'dasinmaz-emlak'),
    ('Apple', 'apple', 'telefonlar'),
    ('Samsung', 'samsung', 'telefonlar'),
    ('Xiaomi', 'xiaomi', 'telefonlar'),
    ('Honor', 'honor', 'telefonlar'),
    ('Noutbuklar', 'noutbuklar', 'komputer-elektronika'),
    ('Monitorlar', 'monitorlar', 'komputer-elektronika'),
    ('Oyun konsolları', 'oyun-konsollari', 'komputer-elektronika'),
    ('Foto və video', 'foto-video', 'komputer-elektronika'),
    ('Audio avadanlıq', 'audio-avadanliq', 'komputer-elektronika'),
    ('Soyuducular', 'soyuducular', 'meiset-texnikasi'),
    ('Paltaryuyanlar', 'paltaryuyanlar', 'meiset-texnikasi'),
    ('Kondisionerlər', 'kondisionerler', 'meiset-texnikasi'),
    ('Mebel', 'mebel', 'ev-bag'),
    ('Dekor', 'dekor', 'ev-bag'),
    ('Bağ alətləri', 'bag-aletleri', 'ev-bag'),
    ('Qadın geyimi', 'qadin-geyimi', 'geyim-moda'),
    ('Kişi geyimi', 'kisi-geyimi', 'geyim-moda'),
    ('Ayaqqabı', 'ayaqqabi', 'geyim-moda'),
    ('Oyuncaqlar', 'oyuncaqlar', 'usaq-mehsullari'),
    ('Uşaq arabaları', 'usaq-arabalari', 'usaq-mehsullari'),
    ('İdman', 'idman', 'hobbi-istirahet'),
    ('Kitablar', 'kitablar', 'hobbi-istirahet'),
    ('İtlər', 'itler', 'heyvanlar'),
    ('Pişiklər', 'pisikler', 'heyvanlar'),
    ('Tam ştat', 'tam-stat', 'is-elanlari'),
    ('Yarım ştat', 'yarim-stat', 'is-elanlari'),
    ('Təmir', 'temir', 'xidmetler'),
    ('Daşıma', 'dasima', 'xidmetler'),
    ('Mağaza avadanlığı', 'magaza-avadanligi', 'biznes-avadanliq'),
    ('Ofis avadanlığı', 'ofis-avadanligi', 'biznes-avadanliq')
)
insert into public.categories (name, slug, parent_id)
select ss.name, ss.slug, pc.id
from subcategory_seed ss
join parent_categories pc on pc.slug = ss.parent_slug
on conflict (slug) do nothing;

insert into public.locations (name, slug, type)
values
  ('Bakı', 'baki', 'city'),
  ('Sumqayıt', 'sumqayit', 'city'),
  ('Gəncə', 'gence', 'city'),
  ('Şəki', 'seki', 'city'),
  ('Lənkəran', 'lenkeran', 'city')
on conflict (parent_id, slug) do nothing;

insert into public.packages (name, slug, price, duration_days, features)
values
  ('Pulsuz elan', 'free', 0, 30, '["standart görünmə"]'),
  ('Premium elan', 'premium', 9.90, 14, '["slider", "axtarışda üstünlük"]'),
  ('VIP elan', 'vip', 19.90, 7, '["ana səhifədə vurğu", "premium badge"]'),
  ('İrəli çək', 'boost', 4.90, 3, '["siyahıda yeniləmə"]')
on conflict (slug) do nothing;

-- Demo auth.users are created by Supabase auth in real environments.
-- The application mock-data file mirrors 20 users, 5 stores, 100 listings,
-- 30 messages, 20 notifications and 10 reviews for local UI development.
