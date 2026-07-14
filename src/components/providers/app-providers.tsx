"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  readSiteSettings,
  siteSettingsChangedEvent,
  syncSiteSettingsFromCloud,
  type SiteSettings,
} from "@/lib/site-settings";
import { AccountProvider } from "@/components/providers/account-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    function applyTheme(settings?: SiteSettings) {
      const nextSettings = settings ?? readSiteSettings();
      document.documentElement.dataset.siteTheme = nextSettings.theme;
      document.title = nextSettings.identity.browserTitle;

      let favicon = document.querySelector<HTMLLinkElement>('link[data-managed-favicon="true"]');
      if (nextSettings.identity.faviconUrl) {
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          favicon.dataset.managedFavicon = "true";
          document.head.appendChild(favicon);
        }
        favicon.href = nextSettings.identity.faviconUrl;
      } else if (favicon) {
        favicon.remove();
      }
    }

    applyTheme();
    void syncSiteSettingsFromCloud().then(applyTheme);

    function handleSettingsChange(event: Event) {
      applyTheme((event as CustomEvent<SiteSettings>).detail);
    }

    function handleStorageChange() {
      applyTheme();
    }

    window.addEventListener(siteSettingsChangedEvent, handleSettingsChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(siteSettingsChangedEvent, handleSettingsChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AccountProvider>{children}</AccountProvider>
    </QueryClientProvider>
  );
}
