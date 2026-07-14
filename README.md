# alışveriş.az

Modern Azərbaycan dilli elan və alış-veriş platforması. Layihə Next.js 15,
TypeScript, Tailwind CSS, shadcn/ui prinsipləri, Lucide ikonları, Framer Motion,
Supabase, PostgreSQL, React Hook Form, Zod, TanStack Query və Zustand üzərində
qurulub.

## Hazır olan əsaslar

- App Router əsaslı responsive marketplace UI
- Ana səhifə, `/elanlar`, `/elan/[slug]`, `/elan-yerlesdir`, `/profil`,
  `/mesajlar`, `/secilmisler`, `/admin`
- Premium elanlar, listing kartları, store showcase və empty state-lər
- React Hook Form + Zod ilə elan yerləşdirmə wizard-ı
- Zustand localStorage seçilmişlər store-u
- Supabase client, PostgreSQL migration və seed faylları
- RLS policy-ləri, index-lər, soft delete sahələri və audit log cədvəli
- Unit və Playwright E2E test konfiqləri
- SEO metadata, sitemap, robots və JSON-LD product schema

## Lokal işə salma

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sayt: [http://localhost:3000](http://localhost:3000)

Supabase girişləri üçün `.env.local` faylında `NEXT_PUBLIC_SUPABASE_URL` və
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dəyişənlərini doldurun. Köhnə Supabase
layihələrində publishable key əvəzinə `NEXT_PUBLIC_SUPABASE_ANON_KEY` istifadə
oluna bilər. `SUPABASE_SERVICE_ROLE_KEY` və `sb_secret_...` açarlarını heç vaxt
`NEXT_PUBLIC_` prefiksi ilə client-ə ötürməyin.

## Yoxlama

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

E2E:

```bash
npm run e2e
```

## Supabase

Migration:

```bash
supabase db reset
```

Əsas schema `supabase/migrations/0001_initial_schema.sql` faylındadır. Demo
kateqoriyalar, alt kateqoriyalar, lokasiyalar və paketlər `supabase/seed/seed.sql`
faylında saxlanılır.

## Arxitektura

- `src/app` - App Router route-ları və SEO endpoint-ləri
- `src/components` - layout, UI atomları və listing komponentləri
- `src/features` - domain flow-ları, məsələn elan wizard-ı
- `src/lib` - helper-lər, mock data və Supabase client
- `src/schemas` - Zod validation schema-ları
- `src/stores` - Zustand state
- `src/types` - marketplace TypeScript modelləri
- `supabase` - migration və seed faylları
- `tests` - unit və end-to-end testlər
