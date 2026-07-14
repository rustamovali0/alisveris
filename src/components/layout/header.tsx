import Link from "next/link";
import {
  Bell,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, cities } from "@/lib/mock-data";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center gap-3">
        <Button
          aria-label="Menyu"
          className="md:hidden"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-lg font-black text-white">
            a
          </span>
          <span className="hidden text-xl font-black tracking-tight sm:block">
            alışveriş.az
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Button asChild variant="ghost">
            <Link href="/elanlar">Kateqoriyalar</Link>
          </Button>
          <div className="group relative">
            <Button type="button" variant="ghost">
              Populyar
            </Button>
            <div className="invisible absolute left-0 top-full grid w-[620px] grid-cols-2 gap-2 rounded-lg border border-border bg-card p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/elanlar?category=${category.slug}`}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-primary-soft/50"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <form
          action="/elanlar"
          className="hidden flex-1 items-center gap-2 md:flex"
          method="get"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              name="q"
              placeholder="Məhsul, marka və ya kateqoriya axtar"
              type="search"
            />
          </div>
          <label className="relative">
            <span className="sr-only">Şəhər</span>
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <select
              className="h-11 rounded-lg border border-border bg-card px-10 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              name="city"
              defaultValue="Bakı"
            >
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </label>
          <Button className="sr-only" type="submit">
            Axtar
          </Button>
        </form>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          <Button asChild size="icon" variant="ghost">
            <Link href="/secilmisler" aria-label="Seçilmişlər">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost">
            <Link href="/mesajlar" aria-label="Mesajlar">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>
          <Button aria-label="Bildirişlər" size="icon" type="button" variant="ghost">
            <Bell className="h-5 w-5" />
          </Button>
          <Button asChild size="icon" variant="ghost">
            <Link href="/profil" aria-label="Profil">
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/elan-yerlesdir">
              <Plus className="h-4 w-4" />
              Elan yerləşdir
            </Link>
          </Button>
        </div>
        <Button asChild className="ml-auto md:hidden" size="sm">
          <Link href="/elan-yerlesdir">
            <Plus className="h-4 w-4" />
            Elan
          </Link>
        </Button>
      </div>
    </header>
  );
}
