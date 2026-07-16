import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

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

export type FooterLink = {
  label: string;
  href: string;
  content: string;
};

export type FooterSettings = {
  brand: string;
  description: string;
  appLabel: string;
  links: FooterLink[];
  socials: FooterSocialKey[];
  copyright: string;
  disclaimer: string;
};

export type AdBannerSettings = {
  enabled: boolean;
  imageUrl: string;
  mobileImageUrl: string;
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
    showSiteName: boolean;
    browserTitle: string;
    logoUrl: string;
    faviconUrl: string;
  };
  home: {
    heroImageUrl: string;
    safetyLabel: string;
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
    {
      label: "Top 10 sual",
      href: "/sehife/top-10-sual",
      content:
        "Ən çox verilən suallar: elan yerləşdirmə, düzəliş, silmə, bərpa, elan nömrəsi, mağaza hesabı və ödənişli xidmətlər.",
    },
    {
      label: "İstifadəçi razılaşması",
      href: "/sehife/istifadeci-razilasmasi",
      content:
        "Bu səhifədə platformadan istifadə, elan yerləşdirmə, məsuliyyət, mesajlaşma və hesab qaydaları göstərilir.",
    },
    {
      label: "İctimai oferta",
      href: "/sehife/ictimai-oferta",
      content:
        "İctimai oferta ödənişli xidmətlərin, paketlərin və platforma xidmətlərinin ümumi şərtlərini müəyyən edir.",
    },
    {
      label: "Kateqoriyalar üzrə limitlər",
      href: "/sehife/kateqoriyalar-uzre-limitler",
      content:
        "Hər kateqoriya üzrə 30 günlük elan limitləri və limit dolduqda istifadə oluna bilən xidmətlər burada idarə olunur.",
    },
    {
      label: "Ödənişli xidmətlər",
      href: "/sehife/odenisli-xidmetler",
      content:
        "Premium, VIP və irəli çək xidmətləri elanların daha çox görünməsi üçün nəzərdə tutulub.",
    },
    {
      label: "Paketlər",
      href: "/sehife/paketler",
      content:
        "Mağaza və aktiv satıcılar üçün elan paketləri, limitlər və bonuslar admin panelindən idarə olunur.",
    },
    {
      label: "Haqqımızda",
      href: "/sehife/haqqimizda",
      content:
        "alışveriş.az fərdi satıcılar, mağazalar və alıcılar üçün təhlükəsiz elan platformasıdır.",
    },
    {
      label: "Əlaqə",
      href: "/sehife/elaqe",
      content:
        "Bizimlə əlaqə üçün dəstək forması, e-poçt və sosial kanallardan istifadə edə bilərsiniz.",
    },
    {
      label: "İstifadə qaydaları",
      href: "/sehife/istifade-qaydalari",
      content:
        "Elan yerləşdirərkən düzgün kateqoriya, real şəkil və dəqiq əlaqə məlumatı qeyd olunmalıdır.",
    },
    {
      label: "Məxfilik siyasəti",
      href: "/sehife/mexfilik-siyaseti",
      content:
        "İstifadəçi məlumatları yalnız platformanın təhlükəsiz işləməsi və hesab idarəetməsi üçün istifadə olunur.",
    },
    {
      label: "Təhlükəsizlik",
      href: "/sehife/tehlukesizlik",
      content:
        "Ödəniş etməzdən əvvəl məhsulu yoxlayın, şübhəli hesabları və elanları moderasiyaya bildirin.",
    },
    {
      label: "Reklam",
      href: "/sehife/reklam",
      content:
        "Banner, premium, VIP və irəli çək xidmətləri admin panelindən idarə olunur.",
    },
    {
      label: "Mağaza hesabı",
      href: "/sehife/magaza-hesabi",
      content:
        "Mağaza hesabı yaratmaqla məhsulları vahid vitrin altında idarə edə bilərsiniz.",
    },
    {
      label: "Dəstək",
      href: "/sehife/destek",
      content:
        "Dəstək komandası elan, hesab, ödəniş və təhlükəsizlik mövzularında kömək edir.",
    },
    {
      label: "Tez-tez verilən suallar",
      href: "/sehife/faq",
      content:
        "Ən çox verilən suallar: elan yerləşdirmə, mağaza hesabı, premium xidmətlər və təhlükəsiz alış-veriş.",
    },
  ],
  socials: ["instagram", "tiktok", "share"],
  copyright: "© 2026 alışveriş.az. Bütün hüquqlar qorunur.",
  disclaimer:
    "Saytın Administrasiyası reklam bannerlərinin və yerləşdirilmiş elanların məzmununa görə məsuliyyət daşımır.",
};

export const defaultSiteSettings: SiteSettings = {
  theme: "default",
  identity: {
    siteName: "alışveriş.az",
    showSiteName: true,
    browserTitle: "alışveriş.az - Al, sat və axtardığını tap",
    logoUrl: "",
    faviconUrl: "",
  },
  home: {
    heroImageUrl:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=85",
    safetyLabel: "təhlükəsiz əməliyyat",
  },
  footer: defaultFooterSettings,
  ads: {
    left: {
      enabled: true,
      imageUrl: "/ads/kemer-store-vertical.png",
      mobileImageUrl: "/ads/kemer-store-mobile.png",
      brand: "kemer.store",
      title: "Kəmərlər və aksesuarlar",
      subtitle: "Premium dəri modellər, gündəlik çatdırılma.",
      cta: "Kemer.store",
      href: "https://kemer.store",
    },
    right: {
      enabled: true,
      imageUrl: "/ads/kemer-store-vertical.png",
      mobileImageUrl: "/ads/kemer-store-mobile.png",
      brand: "kemer.store",
      title: "Yeni kolleksiya",
      subtitle: "Klassik və casual kəmərlər bir vitrində.",
      cta: "Reklama bax",
      href: "https://kemer.store",
    },
  },
};

function normalizeSiteSettings(parsed: Partial<SiteSettings>): SiteSettings {
  const parsedFooterLinks = parsed.footer?.links as Array<FooterLink | string> | undefined;
  const footerLinks =
    Array.isArray(parsedFooterLinks) && parsedFooterLinks.length
      ? parsedFooterLinks.map((link) =>
          typeof link === "string"
            ? {
                label: link,
                href: `/sehife/${link
                  .toLocaleLowerCase("az")
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/ə/g, "e")
                  .replace(/ı/g, "i")
                  .replace(/ş/g, "s")
                  .replace(/ç/g, "c")
                  .replace(/ö/g, "o")
                  .replace(/ü/g, "u")
                  .replace(/ğ/g, "g")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")}`,
                content: `${link} səhifəsinin məzmunu admin panelindən idarə olunur.`,
              }
            : {
                label: link.label,
                href: link.href || "#",
                content: link.content || `${link.label} səhifəsinin məzmunu admin panelindən idarə olunur.`,
              },
        )
      : defaultFooterSettings.links;

  return {
    theme: parsed.theme ?? defaultSiteSettings.theme,
    identity: {
      ...defaultSiteSettings.identity,
      ...parsed.identity,
    },
    home: {
      ...defaultSiteSettings.home,
      ...parsed.home,
    },
    footer: {
      ...defaultFooterSettings,
      ...parsed.footer,
      links: footerLinks,
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
}

export function readSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSiteSettings;

  try {
    const raw = window.localStorage.getItem(siteSettingsStorageKey);
    if (!raw) return defaultSiteSettings;
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;

    return normalizeSiteSettings(parsed);
  } catch {
    return defaultSiteSettings;
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  window.localStorage.setItem(siteSettingsStorageKey, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(siteSettingsChangedEvent, { detail: settings }));
}

export async function syncSiteSettingsFromCloud() {
  if (!isSupabaseConfigured) return readSiteSettings();
  const { data, error } = await createSupabaseBrowserClient()
    .from("system_settings")
    .select("value")
    .eq("key", "site_settings")
    .maybeSingle();
  if (error || !data?.value || Object.keys(data.value as object).length === 0) {
    return readSiteSettings();
  }
  const settings = normalizeSiteSettings(data.value as Partial<SiteSettings>);
  saveSiteSettings(settings);
  return settings;
}
