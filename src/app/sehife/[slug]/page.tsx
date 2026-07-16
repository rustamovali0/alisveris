"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/site-shell";
import {
  defaultSiteSettings,
  readSiteSettings,
  siteSettingsChangedEvent,
  syncSiteSettingsFromCloud,
  type FooterLink,
  type SiteSettings,
} from "@/lib/site-settings";

function slugFromHref(link: FooterLink) {
  const parts = link.href.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function paragraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CmsFooterPage() {
  const params = useParams<{ slug: string }>();
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

  const currentPage = useMemo(() => {
    return (
      settings.footer.links.find((link) => slugFromHref(link) === params.slug) ??
      settings.footer.links[0]
    );
  }, [params.slug, settings.footer.links]);

  return (
    <SiteShell>
      <section className="container-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Card className="h-fit overflow-hidden p-2">
            {settings.footer.links.map((link) => {
              const isActive = slugFromHref(link) === slugFromHref(currentPage);

              return (
                <Link
                  className={`block rounded-md px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-secondary hover:text-foreground"
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </Card>

          <Card className="p-6 md:p-8">
            <h1 className="text-3xl font-black md:text-4xl">{currentPage.label}</h1>
            <div className="mt-6 space-y-4 text-base leading-8 text-muted">
              {paragraphs(currentPage.content).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
