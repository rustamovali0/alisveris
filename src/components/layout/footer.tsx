"use client";

import Link from "next/link";
import { Share2, Smartphone } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  defaultSiteSettings,
  readSiteSettings,
  siteSettingsChangedEvent,
  syncSiteSettingsFromCloud,
  type FooterSocialKey,
  type SiteSettings,
} from "@/lib/site-settings";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="16" rx="5" stroke="currentColor" strokeWidth="2" width="16" x="4" y="4" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" fill="currentColor" r="1.1" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M14 4v10.2a4.8 4.8 0 1 1-4.8-4.8c.5 0 1 .08 1.45.22v3.02a2.05 2.05 0 1 0 1.35 1.93V4h2Z"
        fill="currentColor"
      />
      <path
        d="M14 4c.5 2.9 2.08 4.6 5 4.95v2.78c-1.88-.08-3.56-.72-5-1.9V4Z"
        fill="currentColor"
      />
    </svg>
  );
}

type SocialIcon = ComponentType<{ className?: string }>;

const socialIcons: Record<FooterSocialKey, { label: string; icon: SocialIcon }> = {
  instagram: { label: "Instagram", icon: InstagramIcon },
  tiktok: { label: "TikTok", icon: TikTokIcon },
  share: { label: "Paylaş", icon: Share2 },
};

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    setSettings(readSiteSettings());
    void syncSiteSettingsFromCloud().then(setSettings).catch(() => undefined);

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
    <footer className="site-footer border-t border-border bg-card pb-20 md:pb-0">
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
              href={link.href}
              key={link.href}
            >
              {link.label}
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
          <p>{footer.copyright}</p>
          <p className="mt-2 text-xs leading-5">{footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
