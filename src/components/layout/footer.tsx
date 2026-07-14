"use client";

import Link from "next/link";
import { Camera, Music2, Share2, Smartphone, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  defaultSiteSettings,
  readSiteSettings,
  siteSettingsChangedEvent,
  type FooterSocialKey,
  type SiteSettings,
} from "@/lib/site-settings";

const socialIcons: Record<FooterSocialKey, { label: string; icon: LucideIcon }> = {
  instagram: { label: "Instagram", icon: Camera },
  tiktok: { label: "TikTok", icon: Music2 },
  share: { label: "Paylaş", icon: Share2 },
};

export function Footer() {
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

  const footer = settings.footer;

  return (
    <footer className="border-t border-border bg-card pb-20 md:pb-0">
      <div className="container-shell grid gap-8 py-10 lg:grid-cols-[1.2fr_2fr_1fr]">
        <div>
          <Link href="/" className="text-2xl font-black">
            {footer.brand}
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            {footer.description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {footer.links.map((link) => (
            <Link
              className="text-sm text-muted transition hover:text-primary"
              href="#"
              key={link}
            >
              {link}
            </Link>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold">Mobil tətbiq</p>
          <Button className="mt-3 w-full justify-start" variant="secondary">
            <Smartphone className="h-4 w-4" />
            {footer.appLabel}
          </Button>
          <div className="mt-4 flex gap-2">
            {footer.socials.map((social) => {
              const item = socialIcons[social];
              const Icon = item.icon;

              return (
              <Button
                aria-label={item.label}
                key={social}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Icon className="h-4 w-4" />
              </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <div className="container-shell text-sm text-muted">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
