"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeDollarSign,
  Ban,
  CheckCircle2,
  FileText,
  Flag,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { dashboardMetrics, listings, stores } from "@/lib/mock-data";
import {
  type AdBannerSettings,
  readSiteSettings,
  saveSiteSettings,
  siteThemes,
  type FooterSocialKey,
  type SiteSettings,
} from "@/lib/site-settings";
import { formatCurrency } from "@/lib/utils";

const adminNav = [
  ["Dashboard", LayoutDashboard],
  ["Elanların idarəsi", Activity],
  ["İstifadəçilər", Users],
  ["Kateqoriyalar", Settings],
  ["Moderasiya", Flag],
  ["Mağazalar", Store],
  ["Ödənişlər", BadgeDollarSign],
  ["CMS", FileText],
] as const;

type AdminSection = (typeof adminNav)[number][0];
type ListingReviewStatus = "Gözləmədə" | "Təsdiqləndi" | "Rədd edildi";
type UserStatus = "aktiv" | "bloklandı";
type StoreStatus = "gözləyir" | "təsdiqləndi";
type TransactionStatus = "pending" | "completed" | "failed" | "refunded";

const initialUsers = [
  { id: "usr-1", name: "Rauf Məmmədov", role: "store_owner", accountType: "store", status: "aktiv" as UserStatus, ads: "37 elan" },
  { id: "usr-2", name: "Nigar Əliyeva", role: "store_owner", accountType: "store", status: "aktiv" as UserStatus, ads: "86 elan" },
  { id: "usr-3", name: "Elvin Həsənli", role: "user", accountType: "individual", status: "aktiv" as UserStatus, ads: "4 elan" },
  { id: "usr-4", name: "Aysel Rəhimova", role: "user", accountType: "individual", status: "bloklandı" as UserStatus, ads: "2 elan" },
];

const initialTransactions = [
  { id: "TX-1001", product: "Premium elan", status: "completed" as TransactionStatus, amount: "9.90 AZN" },
  { id: "TX-1002", product: "VIP elan", status: "pending" as TransactionStatus, amount: "19.90 AZN" },
  { id: "TX-1003", product: "Balans artırma", status: "refunded" as TransactionStatus, amount: "50 AZN" },
  { id: "TX-1004", product: "İrəli çək", status: "failed" as TransactionStatus, amount: "4.90 AZN" },
];

const moderationQueues = ["Şikayətlər", "Spam elanlar", "Şübhəli hesablar", "Qadağan sözlər", "IP fəaliyyəti", "Audit log"];
const cmsPages = ["Haqqımızda", "Qaydalar", "FAQ", "SEO metadata", "Footer", "Sosial şəbəkələr", "Bannerlər", "Təhlükəsizlik"];
const socialOptions: { key: FooterSocialKey; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "share", label: "Paylaş" },
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard");
  const [notice, setNotice] = useState("Admin panel hazırdır");
  const [query, setQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ListingReviewStatus>>(
    () => Object.fromEntries(listings.slice(0, 6).map((listing) => [listing.id, "Gözləmədə"])),
  );
  const [users, setUsers] = useState(initialUsers);
  const [categoryCount, setCategoryCount] = useState(15);
  const [selectedAttribute, setSelectedAttribute] = useState("Atribut seçilməyib");
  const [selectedModerationQueue, setSelectedModerationQueue] = useState("Növbə seçilməyib");
  const [storeStatuses, setStoreStatuses] = useState<Record<string, StoreStatus>>(
    () => Object.fromEntries(stores.map((store) => [store.id, "gözləyir"])),
  );
  const [storeStats, setStoreStats] = useState("Mağaza statistikası seçilməyib");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [invoice, setInvoice] = useState("Faktura seçilməyib");
  const [cmsDraft, setCmsDraft] = useState("CMS səhifəsi seçilməyib");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readSiteSettings());

  const visibleListings = useMemo(() => {
    const lowered = query.toLowerCase().trim();
    return listings
      .slice(0, 6)
      .filter((listing) => !lowered || listing.title.toLowerCase().includes(lowered));
  }, [query]);

  function setSection(section: AdminSection) {
    setActiveSection(section);
    setNotice(`${section} bölməsi açıldı`);
  }

  function updateReviewStatus(id: string, status: ListingReviewStatus) {
    setReviewStatuses((current) => ({ ...current, [id]: status }));
    setNotice(`Elan statusu dəyişdi: ${status}`);
  }

  function openListing(id: string) {
    const listing = listings.find((item) => item.id === id);
    setSelectedListing(listing?.title ?? id);
    setNotice(`Elan baxışı açıldı: ${listing?.title ?? id}`);
  }

  function changeUserRole(id: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, role: user.role === "admin" ? "user" : "admin" }
          : user,
      ),
    );
    setNotice("İstifadəçi rolu dəyişdirildi");
  }

  function toggleUserBlock(id: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "aktiv" ? "bloklandı" : "aktiv" }
          : user,
      ),
    );
    setNotice("İstifadəçi statusu yeniləndi");
  }

  function changeAccountType(id: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              accountType: user.accountType === "store" ? "individual" : "store",
            }
          : user,
      ),
    );
    setNotice("İstifadəçi hesab tipi admin tərəfindən dəyişdirildi");
  }

  function updateIdentity(key: keyof SiteSettings["identity"], value: string) {
    setSiteSettings((current) => ({
      ...current,
      identity: { ...current.identity, [key]: value },
    }));
  }

  function approveStore(id: string) {
    setStoreStatuses((current) => ({ ...current, [id]: "təsdiqləndi" }));
    setNotice("Mağaza təsdiqləndi");
  }

  function markTransactionCompleted(id: string) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id ? { ...transaction, status: "completed" } : transaction,
      ),
    );
    setNotice(`${id} tamamlandı`);
  }

  function updateFooterField<K extends keyof SiteSettings["footer"]>(
    key: K,
    value: SiteSettings["footer"][K],
  ) {
    setSiteSettings((current) => ({
      ...current,
      footer: { ...current.footer, [key]: value },
    }));
  }

  function toggleSocial(key: FooterSocialKey) {
    setSiteSettings((current) => {
      const exists = current.footer.socials.includes(key);
      return {
        ...current,
        footer: {
          ...current.footer,
          socials: exists
            ? current.footer.socials.filter((item) => item !== key)
            : [...current.footer.socials, key],
        },
      };
    });
  }

  function persistSiteSettings() {
    saveSiteSettings(siteSettings);
    setNotice("Sayt teması və footer ayarları saxlanıldı");
    setCmsDraft("Footer, sosial ikonlar və tema ayarları yeniləndi");
  }

  function updateAdBanner(
    side: "left" | "right",
    key: keyof AdBannerSettings,
    value: string | boolean,
  ) {
    setSiteSettings((current) => ({
      ...current,
      ads: {
        ...current.ads,
        [side]: {
          ...current.ads[side],
          [key]: value,
        },
      },
    }));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-slate-900 p-4 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="mb-6 text-2xl font-black">alışveriş.az admin</div>
          <nav className="grid gap-1">
            {adminNav.map(([label, Icon]) => (
              <button
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  activeSection === label ? "bg-primary text-white" : "text-slate-200 hover:bg-white/10"
                }`}
                key={label}
                type="button"
                onClick={() => setSection(label)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="p-5 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black">{activeSection}</h1>
              <p className="mt-2 text-slate-300">
                Moderasiya, ödəniş, mağaza, audit log və CMS idarəetməsi.
              </p>
            </div>
            <Button type="button" onClick={() => setSection("Elanların idarəsi")}>
              Yeni admin əməliyyatı
            </Button>
          </div>

          <div
            className="mb-5 flex items-center gap-2 rounded-lg border border-green-400/30 bg-green-400/10 p-3 text-sm font-semibold text-green-100"
            data-testid="admin-notice"
          >
            <CheckCircle2 className="h-4 w-4 text-green-300" />
            {notice}
          </div>

          {activeSection === "Dashboard" ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dashboardMetrics.map((metric) => (
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5" key={metric.label}>
                    <p className="text-sm text-slate-300">{metric.label}</p>
                    <p className="mt-2 text-3xl font-black">{metric.value}</p>
                    <p className="mt-2 text-sm font-semibold text-green-300">{metric.delta}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
                <ListingModerationTable
                  listings={visibleListings}
                  query={query}
                  reviewStatuses={reviewStatuses}
                  selectedListing={selectedListing}
                  setQuery={setQuery}
                  openListing={openListing}
                  updateReviewStatus={updateReviewStatus}
                />
                <ActivityFeed />
              </div>
            </>
          ) : null}

          {activeSection === "Elanların idarəsi" ? (
            <ListingModerationTable
              listings={visibleListings}
              query={query}
              reviewStatuses={reviewStatuses}
              selectedListing={selectedListing}
              setQuery={setQuery}
              openListing={openListing}
              updateReviewStatus={updateReviewStatus}
            />
          ) : null}

          {activeSection === "İstifadəçilər" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">İstifadəçilər</h2>
              <div className="mt-4 space-y-3">
                {users.map((user) => (
                  <div className="grid gap-3 rounded-lg bg-slate-900 p-3 md:grid-cols-[1fr_auto]" key={user.id}>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-slate-300">
                        {user.role} · {user.accountType === "store" ? "Mağaza" : "Fərdi"} · {user.ads}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={user.status === "aktiv" ? "green" : "red"}>{user.status}</Badge>
                      <Button data-testid={`role-${user.id}`} size="sm" type="button" variant="secondary" onClick={() => changeUserRole(user.id)}>
                        Role dəyiş
                      </Button>
                      <Button data-testid={`account-type-${user.id}`} size="sm" type="button" variant="secondary" onClick={() => changeAccountType(user.id)}>
                        Hesab tipini dəyiş
                      </Button>
                      <Button data-testid={`block-${user.id}`} size="sm" type="button" variant="danger" onClick={() => toggleUserBlock(user.id)}>
                        {user.status === "aktiv" ? "Blokla" : "Aktiv et"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {activeSection === "Kateqoriyalar" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Kateqoriya və dynamic attributes</h2>
                  <p className="mt-1 text-sm text-slate-300" data-testid="category-count">{categoryCount} kateqoriya aktivdir</p>
                </div>
                <Button type="button" onClick={() => {
                  setCategoryCount((count) => count + 1);
                  setNotice("Yeni kateqoriya əlavə edildi");
                }}>
                  Kateqoriya əlavə et
                </Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["Avtomobil atributları", "Telefon atributları", "Əmlak atributları"].map((item) => (
                  <button
                    className="rounded-lg bg-slate-900 p-4 text-left hover:bg-slate-800"
                    key={item}
                    type="button"
                    onClick={() => {
                      setSelectedAttribute(item);
                      setNotice(`${item} açıldı`);
                    }}
                  >
                    <p className="font-bold">{item}</p>
                    <p className="mt-2 text-sm text-slate-300">Marka, model, rəng, status, seçim və validation.</p>
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="selected-attribute">{selectedAttribute}</p>
            </Card>
          ) : null}

          {activeSection === "Moderasiya" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Moderasiya növbəsi</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {moderationQueues.map((item) => (
                  <button
                    className="rounded-lg bg-slate-900 p-4 text-left hover:bg-slate-800"
                    key={item}
                    type="button"
                    onClick={() => {
                      setSelectedModerationQueue(item);
                      setNotice(`${item} növbəsi açıldı`);
                    }}
                  >
                    <Flag className="mb-3 h-5 w-5 text-warning" />
                    <p className="font-bold">{item}</p>
                    <p className="mt-1 text-sm text-slate-300">Bax və tədbir gör</p>
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="moderation-selection">{selectedModerationQueue}</p>
            </Card>
          ) : null}

          {activeSection === "Mağazalar" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Mağaza müraciətləri</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {stores.map((store) => (
                  <div className="rounded-lg bg-slate-900 p-4" key={store.id}>
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-sm font-black">{store.logo}</div>
                      <div>
                        <p className="font-bold">{store.name}</p>
                        <p className="text-sm text-slate-300">{store.listingsCount} elan · {store.city}</p>
                        <Badge className="mt-2" tone={storeStatuses[store.id] === "təsdiqləndi" ? "green" : "amber"}>{storeStatuses[store.id]}</Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button data-testid={`store-approve-${store.id}`} size="sm" type="button" onClick={() => approveStore(store.id)}>
                        Təsdiqlə
                      </Button>
                      <Button size="sm" type="button" variant="secondary" onClick={() => {
                        setStoreStats(`${store.name}: ${store.listingsCount} elan, reytinq ${store.rating}`);
                        setNotice(`${store.name} statistikası açıldı`);
                      }}>
                        Statistika
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="store-stats">{storeStats}</p>
            </Card>
          ) : null}

          {activeSection === "Ödənişlər" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Transaction siyahısı</h2>
              <div className="mt-4 space-y-3">
                {transactions.map((transaction) => (
                  <div className="grid gap-3 rounded-lg bg-slate-900 p-3 md:grid-cols-[1fr_auto]" key={transaction.id}>
                    <div>
                      <p className="font-bold">{transaction.id} · {transaction.product}</p>
                      <p className="text-sm text-slate-300">{transaction.amount}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={transaction.status === "completed" ? "green" : transaction.status === "failed" ? "red" : "amber"}>{transaction.status}</Badge>
                      <Button data-testid={`invoice-${transaction.id}`} size="sm" type="button" variant="secondary" onClick={() => {
                        setInvoice(`${transaction.id} fakturası hazırdır`);
                        setNotice(`${transaction.id} fakturası açıldı`);
                      }}>
                        Faktura
                      </Button>
                      {transaction.status === "pending" ? (
                        <Button size="sm" type="button" onClick={() => markTransactionCompleted(transaction.id)}>
                          Tamamla
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="invoice-output">{invoice}</p>
            </Card>
          ) : null}

          {activeSection === "CMS" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">CMS və sayt ayarları</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {cmsPages.map((item) => (
                  <button
                    className="rounded-lg bg-slate-900 p-4 text-left hover:bg-slate-800"
                    key={item}
                    type="button"
                    onClick={() => {
                      setCmsDraft(`${item} redaktə paneli açıldı`);
                      setNotice(`${item} redaktə olunur`);
                    }}
                  >
                    <FileText className="mb-3 h-5 w-5 text-primary" />
                    <p className="font-bold">{item}</p>
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="cms-output">{cmsDraft}</p>
              <section className="mt-5 rounded-lg bg-slate-900 p-4">
                <h3 className="text-lg font-black">Loqo və sayt məlumatları</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {([
                    ["siteName", "Sayt adı"],
                    ["browserTitle", "Brauzer title"],
                    ["logoUrl", "Loqo URL"],
                    ["faviconUrl", "Favicon URL"],
                  ] as const).map(([key, label]) => (
                    <label key={key}>
                      <span className="text-sm font-semibold">{label}</span>
                      <Input
                        className="mt-1 border-white/10 bg-slate-950 text-white"
                        placeholder={key.endsWith("Url") ? "https://..." : undefined}
                        value={siteSettings.identity[key]}
                        onChange={(event) => updateIdentity(key, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <Button className="mt-4" type="button" onClick={persistSiteSettings}>
                  Brend ayarlarını saxla
                </Button>
              </section>
              <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
                <section className="rounded-lg bg-slate-900 p-4">
                  <h3 className="text-lg font-black">Sayt teması</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    10 hazır tema. Default indiki dizayndır.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {siteThemes.map((theme) => (
                      <button
                        className={`rounded-lg border p-3 text-left transition ${
                          siteSettings.theme === theme.id
                            ? "border-primary bg-primary/20"
                            : "border-white/10 bg-white/[0.03] hover:border-primary/60"
                        }`}
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          setSiteSettings((current) => ({ ...current, theme: theme.id }))
                        }
                      >
                        <div className="mb-2 flex gap-1">
                          {theme.swatches.map((color) => (
                            <span
                              className="h-4 w-4 rounded-full border border-white/20"
                              key={color}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="font-bold">{theme.name}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-300">
                          {theme.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg bg-slate-900 p-4">
                  <h3 className="text-lg font-black">Footer idarəetməsi</h3>
                  <div className="mt-4 grid gap-3">
                    <label>
                      <span className="text-sm font-semibold">Brand adı</span>
                      <Input
                        className="mt-1 border-white/10 bg-slate-950 text-white"
                        value={siteSettings.footer.brand}
                        onChange={(event) => updateFooterField("brand", event.target.value)}
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold">Footer təsviri</span>
                      <textarea
                        className="mt-1 min-h-24 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-primary"
                        value={siteSettings.footer.description}
                        onChange={(event) =>
                          updateFooterField("description", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold">Mobil tətbiq mətni</span>
                      <Input
                        className="mt-1 border-white/10 bg-slate-950 text-white"
                        value={siteSettings.footer.appLabel}
                        onChange={(event) => updateFooterField("appLabel", event.target.value)}
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold">Footer linkləri</span>
                      <textarea
                        className="mt-1 min-h-24 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-primary"
                        value={siteSettings.footer.links.join("\n")}
                        onChange={(event) =>
                          updateFooterField(
                            "links",
                            event.target.value
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          )
                        }
                      />
                    </label>
                    <label>
                      <span className="text-sm font-semibold">Copyright</span>
                      <Input
                        className="mt-1 border-white/10 bg-slate-950 text-white"
                        value={siteSettings.footer.copyright}
                        onChange={(event) => updateFooterField("copyright", event.target.value)}
                      />
                    </label>
                    <div>
                      <p className="text-sm font-semibold">Sosial ikonlar</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {socialOptions.map((item) => (
                          <button
                            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                              siteSettings.footer.socials.includes(item.key)
                                ? "border-primary bg-primary text-white"
                                : "border-white/10 bg-slate-950 text-slate-200"
                            }`}
                            key={item.key}
                            type="button"
                            onClick={() => toggleSocial(item.key)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button type="button" onClick={persistSiteSettings}>
                      Sayt ayarlarını saxla
                    </Button>
                  </div>
                </section>
              </div>
              <section className="mt-5 rounded-lg bg-slate-900 p-4">
                <h3 className="text-lg font-black">Reklam bannerləri</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Desktopda sağ/sol banner, mobildə sponsor kartı kimi görünür.
                </p>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  {(["left", "right"] as const).map((side) => {
                    const banner = siteSettings.ads[side];
                    return (
                      <div className="rounded-lg bg-slate-950 p-4" key={side}>
                        <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                          <input
                            checked={banner.enabled}
                            className="h-4 w-4 accent-primary"
                            type="checkbox"
                            onChange={(event) =>
                              updateAdBanner(side, "enabled", event.target.checked)
                            }
                          />
                          {side === "left" ? "Sol banner" : "Sağ banner"} aktivdir
                        </label>
                        <div className="grid gap-3">
                          {([
                            ["brand", "Brand"],
                            ["title", "Başlıq"],
                            ["subtitle", "Alt mətn"],
                            ["cta", "Düymə mətni"],
                            ["href", "Link"],
                          ] as const).map(([key, label]) => (
                            <label key={key}>
                              <span className="text-sm font-semibold">{label}</span>
                              <Input
                                className="mt-1 border-white/10 bg-slate-900 text-white"
                                value={banner[key]}
                                onChange={(event) =>
                                  updateAdBanner(side, key, event.target.value)
                                }
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Card>
          ) : null}
        </main>
      </div>
    </div>
  );
}

type ListingModerationTableProps = {
  listings: typeof import("@/lib/mock-data").listings;
  query: string;
  reviewStatuses: Record<string, ListingReviewStatus>;
  selectedListing: string | null;
  setQuery: (query: string) => void;
  openListing: (id: string) => void;
  updateReviewStatus: (id: string, status: ListingReviewStatus) => void;
};

function ListingModerationTable({
  listings: visibleListings,
  query,
  reviewStatuses,
  selectedListing,
  setQuery,
  openListing,
  updateReviewStatus,
}: ListingModerationTableProps) {
  return (
    <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Elanların idarəsi</h2>
          <p className="text-sm text-slate-300">Bax, təsdiqlə, rədd et və səbəb yaz.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="border-white/10 bg-slate-900 pl-9 text-white"
            placeholder="Elan axtar"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-3">
        {visibleListings.map((listing) => (
          <div className="grid gap-3 rounded-lg border border-white/10 p-3 md:grid-cols-[1fr_auto]" key={listing.id}>
            <div>
              <p className="font-bold">{listing.title}</p>
              <p className="text-sm text-slate-300">{listing.city} · {formatCurrency(listing.price)}</p>
              <Badge
                className="mt-2"
                data-testid={`listing-status-${listing.id}`}
                tone={reviewStatuses[listing.id] === "Təsdiqləndi" ? "green" : reviewStatuses[listing.id] === "Rədd edildi" ? "red" : "amber"}
              >
                {reviewStatuses[listing.id]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button data-testid={`view-${listing.id}`} size="sm" type="button" variant="secondary" onClick={() => openListing(listing.id)}>
                Bax
              </Button>
              <Button data-testid={`approve-${listing.id}`} size="sm" type="button" onClick={() => updateReviewStatus(listing.id, "Təsdiqləndi")}>
                Təsdiqlə
              </Button>
              <Button data-testid={`reject-${listing.id}`} size="sm" type="button" variant="danger" onClick={() => updateReviewStatus(listing.id, "Rədd edildi")}>
                Rədd et
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="selected-listing">
        {selectedListing ? `Seçilmiş elan: ${selectedListing}` : "Elan seçilməyib"}
      </p>
    </Card>
  );
}

function ActivityFeed() {
  return (
    <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
      <h2 className="text-xl font-black">Son fəaliyyətlər</h2>
      <div className="mt-4 space-y-3">
        {[
          ["Yeni mesaj", MessageSquare, "39 yeni mesaj qeyd edildi"],
          ["Şikayət", Flag, "3 elan təkrar yerləşdirmə şübhəsi"],
          ["Bloklama", Ban, "1 istifadəçi müvəqqəti bloklandı"],
          ["Mağaza", Store, "2 mağaza müraciəti gözləyir"],
          ["Təhlükəsizlik", ShieldCheck, "5 yeni giriş audit log-a yazıldı"],
        ].map(([title, Icon, text]) => (
          <div className="flex gap-3 rounded-lg bg-slate-900 p-3" key={title as string}>
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <p className="font-bold">{title as string}</p>
              <p className="text-sm text-slate-300">{text as string}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
