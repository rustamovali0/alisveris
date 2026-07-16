"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { CategoryMegaMenu } from "@/components/layout/category-mega-menu";
import { cities } from "@/lib/mock-data";
import { showSweetToast } from "@/lib/sweet-alert";
import { useAccount } from "@/components/providers/account-provider";
import {
  readSiteSettings,
  siteSettingsChangedEvent,
  type SiteSettings,
} from "@/lib/site-settings";

export function Header() {
  const { account, ready } = useAccount();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readSiteSettings());
  const [headerCity, setHeaderCity] = useState("Bakı");

  useEffect(() => {
    function syncSettings(event?: Event) {
      setSiteSettings(
        event instanceof CustomEvent
          ? (event.detail as SiteSettings)
          : readSiteSettings(),
      );
    }
    window.addEventListener(siteSettingsChangedEvent, syncSettings);
    window.addEventListener("storage", syncSettings);
    return () => {
      window.removeEventListener(siteSettingsChangedEvent, syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  const listingHref =
    account?.accountType === "store" && !account.store ? "/magaza-yarat" : "/elan-yerlesdir";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center gap-3">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 md:shrink-0">
          {siteSettings.identity.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={siteSettings.identity.siteName}
              className="h-9 w-9 shrink-0 rounded-lg object-cover md:h-10 md:w-10"
              src={siteSettings.identity.logoUrl}
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-lg font-black text-white md:h-10 md:w-10">
              a
            </span>
          )}
          {siteSettings.identity.showSiteName ? (
            <span className="max-w-[118px] truncate text-base font-black tracking-tight sm:max-w-none sm:text-xl">
              {siteSettings.identity.siteName}
            </span>
          ) : null}
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <CategoryMegaMenu />
          <Button asChild variant="ghost">
            <Link href="/elanlar?sort=views">Populyar</Link>
          </Button>
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
          <label className="relative min-w-44">
            <span className="sr-only">Şəhər</span>
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input name="city" type="hidden" value={headerCity} />
            <CustomSelect
              ariaLabel="Şəhər"
              buttonClassName="h-11 min-w-44 pl-10 pr-8"
              options={cities.map((city) => ({ label: city, value: city }))}
              value={headerCity}
              onChange={setHeaderCity}
            />
          </label>
          <Button className="sr-only" type="submit">
            Axtar
          </Button>
        </form>
        {ready && account ? (
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
          <Button
            aria-label="Bildirişlər"
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => void showSweetToast("Yeni bildiriş yoxdur", "info")}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button asChild size="icon" variant="ghost">
            <Link href="/profil" aria-label="Profil">
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild className="!text-white">
            <Link className="!text-white" href={listingHref}>
              <Plus className="h-4 w-4" />
              Elan yerləşdir
            </Link>
          </Button>
        </div>
        ) : ready ? (
          <div className="ml-auto flex items-center gap-1">
            <Button asChild size="sm" variant="ghost">
              <Link href="/giris">Giriş</Link>
            </Button>
            <Button asChild className="!text-white" size="sm">
              <Link className="!text-white" href="/qeydiyyat">Qeydiyyat</Link>
            </Button>
          </div>
        ) : (
          <div className="ml-auto h-9 w-28 animate-pulse rounded-lg bg-background" />
        )}
        {ready && account ? (
        <Button asChild className="ml-auto !text-white md:hidden" size="sm">
          <Link className="!text-white" href={listingHref}>
            <Plus className="h-4 w-4" />
            Elan
          </Link>
        </Button>
        ) : null}
      </div>
    </header>
  );
}
