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

function TextFallback({ banner }: { banner: AdBannerSettings }) {
  return (
    <div className="flex h-full flex-col justify-end bg-card p-5">
      <p className="text-xs font-bold uppercase text-primary">{banner.brand}</p>
      <p className="mt-2 text-lg font-black leading-6">{banner.title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{banner.subtitle}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
        {banner.cta}
        <ExternalLink className="h-4 w-4" />
      </span>
    </div>
  );
}

function DesktopBanner({
  banner,
  side,
}: {
  banner: AdBannerSettings;
  side: "left" | "right";
}) {
  if (!banner.enabled) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-0 top-16 z-30 hidden w-[min(300px,calc((100vw-1212px)/2))] 2xl:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
      data-testid={`${side}-ad-banner`}
    >
      <Link
        aria-label={`${banner.brand}: ${banner.title}`}
        className="pointer-events-auto block h-full overflow-hidden border-x border-border bg-card shadow-xl animate-fade-in"
        href={banner.href}
        rel="sponsored noopener noreferrer"
        target="_blank"
      >
        {banner.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${banner.brand} reklam banneri`}
            className="h-full w-full object-cover object-top transition duration-300 hover:scale-[1.01]"
            src={banner.imageUrl}
          />
        ) : (
          <TextFallback banner={banner} />
        )}
      </Link>
    </div>
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

  const mobileBanner = banners[0];

  return (
    <>
      <DesktopBanner banner={settings.ads.left} side="left" />
      <DesktopBanner banner={settings.ads.right} side="right" />

      <div className="bg-card md:hidden">
        <Link
          className="block aspect-[4/1] max-h-28 w-full overflow-hidden"
          href={mobileBanner.href}
          rel="sponsored noopener noreferrer"
          target="_blank"
        >
          {mobileBanner.mobileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${mobileBanner.brand} mobil reklam banneri`}
              className="h-full w-full object-cover"
              src={mobileBanner.mobileImageUrl}
            />
          ) : (
            <TextFallback banner={mobileBanner} />
          )}
        </Link>
      </div>

      <div className="container-shell hidden pt-3 md:block 2xl:hidden">
        <Link
          className="relative flex min-h-24 items-end overflow-hidden rounded-lg border border-border bg-card p-3 shadow-sm animate-slide-up"
          href={mobileBanner.href}
          rel="sponsored noopener noreferrer"
          target="_blank"
        >
          {mobileBanner.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
              src={mobileBanner.imageUrl}
            />
          ) : null}
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative flex w-full items-end justify-between gap-3 text-white">
            <div>
              <p className="text-[11px] font-bold uppercase">Sponsor · {mobileBanner.brand}</p>
              <p className="mt-1 text-sm font-black">{mobileBanner.title}</p>
            </div>
            <span className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-black">
              {mobileBanner.cta}
            </span>
          </div>
        </Link>
      </div>
    </>
  );
}
