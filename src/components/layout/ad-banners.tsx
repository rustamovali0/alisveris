"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import {
  defaultSiteSettings,
  readSiteSettings,
  siteSettingsChangedEvent,
  type AdBannerSettings,
  type SiteSettings,
} from "@/lib/site-settings";

function BannerContent({ banner }: { banner: AdBannerSettings }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        {banner.brand}
      </p>
      <p className="mt-2 text-sm font-black leading-5">{banner.title}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{banner.subtitle}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
        {banner.cta}
        <ExternalLink className="h-3 w-3" />
      </span>
    </>
  );
}

export function AdBanners() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    setSettings(readSiteSettings());

    function handleSettingsChange(event: Event) {
      setSettings((event as CustomEvent<SiteSettings>).detail ?? readSiteSettings());
    }

    function handleStorageChange() {
      setSettings(readSiteSettings());
    }

    window.addEventListener(siteSettingsChangedEvent, handleSettingsChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(siteSettingsChangedEvent, handleSettingsChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const banners = [settings.ads.left, settings.ads.right].filter((banner) => banner.enabled);

  if (!banners.length) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-y-24 left-3 z-30 hidden w-32 xl:block">
        {settings.ads.left.enabled ? (
          <Link
            className="pointer-events-auto block rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur hover-lift animate-fade-in"
            href={settings.ads.left.href}
            target="_blank"
          >
            <BannerContent banner={settings.ads.left} />
          </Link>
        ) : null}
      </div>
      <div className="pointer-events-none fixed inset-y-24 right-3 z-30 hidden w-32 xl:block">
        {settings.ads.right.enabled ? (
          <Link
            className="pointer-events-auto block rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur hover-lift animate-fade-in"
            href={settings.ads.right.href}
            target="_blank"
          >
            <BannerContent banner={settings.ads.right} />
          </Link>
        ) : null}
      </div>
      <div className="container-shell pt-3 xl:hidden">
        <Link
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm animate-slide-up"
          href={banners[0].href}
          target="_blank"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Sponsor · {banners[0].brand}
            </p>
            <p className="mt-1 text-sm font-black">{banners[0].title}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
            {banners[0].cta}
          </span>
        </Link>
      </div>
    </>
  );
}
