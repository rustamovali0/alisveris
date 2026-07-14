import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { popularSearches } from "@/lib/mock-data";

export function HeroSearch() {
  return (
    <section className="overflow-hidden bg-card">
      <div className="container-shell grid min-h-[520px] items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-primary-dark dark:text-purple-100">
            <Sparkles className="h-4 w-4 text-warning" />
            Premium marketplace təcrübəsi
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            Al, sat və axtardığını asanlıqla tap
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Minlərlə elan arasından ehtiyacın olan məhsulu tap və ya öz elanını
            bir neçə dəqiqəyə yerləşdir.
          </p>
          <form className="mt-7 rounded-lg border border-border bg-background p-2 soft-shadow">
            <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
              <label className="relative">
                <span className="sr-only">Axtarış</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  className="border-transparent bg-card pl-9"
                  placeholder="Məhsul, marka və kateqoriya"
                  type="search"
                />
              </label>
              <Button type="button" variant="secondary">
                <MapPin className="h-4 w-4" />
                Bakı
              </Button>
              <Button asChild>
                <Link href="/elanlar">Axtar</Link>
              </Button>
            </div>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <Link
                key={search}
                href={`/elanlar?q=${encodeURIComponent(search)}`}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted transition hover:border-primary/40 hover:text-primary"
              >
                {search}
              </Link>
            ))}
          </div>
          <div className="mt-7 grid max-w-xl grid-cols-3 gap-3 text-sm">
            {[
              ["42k+", "aktiv elan"],
              ["5k+", "təsdiqli mağaza"],
              ["99.9%", "RLS qoruması"],
            ].map(([value, label]) => (
              <div className="rounded-lg border border-border bg-background p-3" key={label}>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-3 top-5 z-10 rounded-lg bg-card p-3 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-5 w-5 text-success" />
              Təsdiqlənmiş satıcı
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-slate-100 soft-shadow">
            <Image
              src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=85"
              alt="alışveriş.az marketplace alıcı və satıcı təcrübəsi"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 right-5 rounded-lg bg-primary p-4 text-white shadow-xl">
            <p className="text-sm opacity-90">Bu gün yeni elan</p>
            <p className="text-3xl font-black">1 284</p>
          </div>
        </div>
      </div>
    </section>
  );
}
