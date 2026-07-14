export const siteSettingsStorageKey = "alisveris-site-settings";
export const siteSettingsChangedEvent = "alisveris-site-settings-changed";

export type SiteThemeId =
  | "default"
  | "emerald"
  | "ocean"
  | "sunset"
  | "rose"
  | "graphite"
  | "citrus"
  | "midnight"
  | "sky"
  | "mono";

export type SiteTheme = {
  id: SiteThemeId;
  name: string;
  description: string;
  swatches: string[];
};

export type FooterSocialKey = "instagram" | "tiktok" | "share";

export type FooterSettings = {
  brand: string;
  description: string;
  appLabel: string;
  links: string[];
  socials: FooterSocialKey[];
  copyright: string;
};

export type AdBannerSettings = {
  enabled: boolean;
  brand: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

export type SiteSettings = {
  theme: SiteThemeId;
  identity: {
    siteName: string;
    browserTitle: string;
    logoUrl: string;
    faviconUrl: string;
  };
  footer: FooterSettings;
  ads: {
    left: AdBannerSettings;
    right: AdBannerSettings;
  };
};

export const siteThemes: SiteTheme[] = [
  {
    id: "default",
    name: "Default",
    description: "Hazır alışveriş.az bənövşəyi dizaynı.",
    swatches: ["#6d28d9", "#f3e8ff", "#f8fafc"],
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Təmiz, yaşıl və güvən hissi verən marketplace.",
    swatches: ["#059669", "#d1fae5", "#f7fee7"],
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Mavi tonlu, texnologiya və elan kataloqu üçün sakit tema.",
    swatches: ["#0ea5e9", "#e0f2fe", "#f8fafc"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Narıncı və qırmızı vurğulu canlı satış teması.",
    swatches: ["#ea580c", "#ffedd5", "#fff7ed"],
  },
  {
    id: "rose",
    name: "Rose",
    description: "Moda, şəxsi əşyalar və lifestyle üçün isti çəhrayı tema.",
    swatches: ["#e11d48", "#ffe4e6", "#fff1f2"],
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Premium mağazalar üçün ciddi, qrafit rəngli tema.",
    swatches: ["#334155", "#e2e8f0", "#f8fafc"],
  },
  {
    id: "citrus",
    name: "Citrus",
    description: "Sarı-yaşıl vurğulu enerjili vitrin.",
    swatches: ["#65a30d", "#ecfccb", "#fefce8"],
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Qaranlıq fonlu modern premium görünüş.",
    swatches: ["#7c3aed", "#1e1b4b", "#0f172a"],
  },
  {
    id: "sky",
    name: "Sky",
    description: "Açıq mavi, yüngül və mobil tətbiq hissli tema.",
    swatches: ["#2563eb", "#dbeafe", "#f0f9ff"],
  },
  {
    id: "mono",
    name: "Mono",
    description: "Minimal, ağ-qara fokuslu işgüzar tema.",
    swatches: ["#111827", "#f3f4f6", "#ffffff"],
  },
];

export const defaultFooterSettings: FooterSettings = {
  brand: "alışveriş.az",
  description:
    "Azərbaycan üçün təhlükəsiz, sürətli və müasir elan platforması. Fərdi satıcılar, mağazalar və biznes hesabları üçün vahid bazar.",
  appLabel: "Tezliklə",
  links: [
    "Haqqımızda",
    "Əlaqə",
    "İstifadə qaydaları",
    "Məxfilik siyasəti",
    "Təhlükəsizlik",
    "Reklam",
    "Mağaza hesabı",
    "Dəstək",
    "Tez-tez verilən suallar",
  ],
  socials: ["instagram", "tiktok", "share"],
  copyright: "© 2026 alışveriş.az. Bütün hüquqlar qorunur.",
};

export const defaultSiteSettings: SiteSettings = {
  theme: "default",
  identity: {
    siteName: "alışveriş.az",
    browserTitle: "alışveriş.az - Al, sat və axtardığını tap",
    logoUrl: "",
    faviconUrl: "",
  },
  footer: defaultFooterSettings,
  ads: {
    left: {
      enabled: true,
      brand: "kemer.store",
      title: "Kəmərlər və aksesuarlar",
      subtitle: "Premium dəri modellər, gündəlik çatdırılma.",
      cta: "Kemer.store",
      href: "https://kemer.store",
    },
    right: {
      enabled: true,
      brand: "kemer.store",
      title: "Yeni kolleksiya",
      subtitle: "Klassik və casual kəmərlər bir vitrində.",
      cta: "Reklama bax",
      href: "https://kemer.store",
    },
  },
};

export function readSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSiteSettings;

  try {
    const raw = window.localStorage.getItem(siteSettingsStorageKey);
    if (!raw) return defaultSiteSettings;
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;

    return {
      theme: parsed.theme ?? defaultSiteSettings.theme,
      identity: {
        ...defaultSiteSettings.identity,
        ...parsed.identity,
      },
      footer: {
        ...defaultFooterSettings,
        ...parsed.footer,
        links: parsed.footer?.links?.length
          ? parsed.footer.links
          : defaultFooterSettings.links,
        socials: parsed.footer?.socials?.length
          ? parsed.footer.socials
          : defaultFooterSettings.socials,
      },
      ads: {
        left: {
          ...defaultSiteSettings.ads.left,
          ...parsed.ads?.left,
        },
        right: {
          ...defaultSiteSettings.ads.right,
          ...parsed.ads?.right,
        },
      },
    };
  } catch {
    return defaultSiteSettings;
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  window.localStorage.setItem(siteSettingsStorageKey, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(siteSettingsChangedEvent, { detail: settings }));
}
