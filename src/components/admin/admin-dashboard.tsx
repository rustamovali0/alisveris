"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  BadgeDollarSign,
  Ban,
  Download,
  Eye,
  FileText,
  Flag,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Users,
  X,
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
import {
  createAdminCategory,
  loadAdminSnapshot,
  saveCloudSiteSettings,
  setAdminUserRole,
  updateAdminListing,
  updateAdminStore,
  updateAdminTransaction,
  updateAdminUser,
  type AdminListingItem,
  type AdminStoreItem,
  type AdminTransactionItem,
} from "@/lib/admin-api";

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
type TransactionStatus = "pending" | "completed" | "failed" | "refunded";

const initialAdminListings: AdminListingItem[] = listings.slice(0, 6).map((listing) => ({
  id: listing.id,
  title: listing.title,
  city: listing.city,
  price: listing.price,
  status: "pending",
}));

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
const moderationCases: Record<string, { id: string; title: string; detail: string; severity: "yüksək" | "orta" | "aşağı" }[]> = {
  Şikayətlər: [
    { id: "REP-104", title: "Yanlış məhsul məlumatı", detail: "Elan qiyməti və təsviri uyğun gəlmir.", severity: "orta" },
    { id: "REP-105", title: "Şübhəli ödəniş tələbi", detail: "Satıcı platformadan kənar öncədən ödəniş istəyir.", severity: "yüksək" },
  ],
  "Spam elanlar": [
    { id: "SPM-208", title: "Təkrarlanan elan", detail: "Eyni şəkillərlə 6 elan yerləşdirilib.", severity: "orta" },
  ],
  "Şübhəli hesablar": [
    { id: "USR-311", title: "Qısa müddətdə çoxsaylı giriş", detail: "Hesab 4 fərqli ölkədən giriş edib.", severity: "yüksək" },
  ],
  "Qadağan sözlər": [
    { id: "TXT-087", title: "Qadağan ifadə aşkarlandı", detail: "Elan mətnində moderasiya tələb edən ifadə var.", severity: "aşağı" },
  ],
  "IP fəaliyyəti": [
    { id: "IP-044", title: "Sürətli sorğu axını", detail: "Bir IP ünvanından normadan artıq sorğu gəlib.", severity: "yüksək" },
  ],
  "Audit log": [
    { id: "LOG-901", title: "Admin rolu yeniləndi", detail: "İstifadəçi rolu admin tərəfindən dəyişdirilib.", severity: "aşağı" },
    { id: "LOG-902", title: "Banner ayarları saxlanıldı", detail: "Sağ və sol reklam bannerləri yenilənib.", severity: "aşağı" },
  ],
};
const cmsPages = ["Haqqımızda", "Qaydalar", "FAQ", "SEO metadata", "Footer", "Sosial şəbəkələr", "Bannerlər", "Təhlükəsizlik"];
const socialOptions: { key: FooterSocialKey; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "share", label: "Paylaş" },
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard");
  const [query, setQuery] = useState("");
  const [adminListings, setAdminListings] = useState(initialAdminListings);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ListingReviewStatus>>(
    () => Object.fromEntries(initialAdminListings.map((listing) => [listing.id, "Gözləmədə"])),
  );
  const [users, setUsers] = useState(initialUsers);
  const [categoryCount, setCategoryCount] = useState(15);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState("Atribut seçilməyib");
  const [newAttributeName, setNewAttributeName] = useState("");
  const [attributeFields, setAttributeFields] = useState<Record<string, string[]>>({
    "Avtomobil atributları": ["Marka", "Model", "Buraxılış ili", "Yürüş"],
    "Telefon atributları": ["Marka", "Model", "Yaddaş", "Rəng"],
    "Əmlak atributları": ["Otaq sayı", "Sahə", "Mərtəbə", "Təmir"],
  });
  const [selectedModerationQueue, setSelectedModerationQueue] = useState<string | null>(null);
  const [resolvedModeration, setResolvedModeration] = useState<string[]>([]);
  const [adminStores, setAdminStores] = useState<AdminStoreItem[]>(() =>
    stores.map((store) => ({ ...store, status: "gözləyir" })),
  );
  const [storeStats, setStoreStats] = useState("Mağaza statistikası seçilməyib");
  const [transactions, setTransactions] = useState<AdminTransactionItem[]>(initialTransactions);
  const [invoice, setInvoice] = useState<AdminTransactionItem | null>(null);
  const [cmsDraft, setCmsDraft] = useState("CMS səhifəsi seçilməyib");
  const [cmsPage, setCmsPage] = useState<string | null>(null);
  const [cmsContent, setCmsContent] = useState("");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readSiteSettings());
  function setNotice(message: string) {
    void message;
  }

  useEffect(() => {
    let cancelled = false;
    loadAdminSnapshot()
      .then((snapshot) => {
        if (!snapshot || cancelled) return;
        setAdminListings(snapshot.listings);
        setReviewStatuses(
          Object.fromEntries(
            snapshot.listings.map((listing) => [
              listing.id,
              listing.status === "active"
                ? "Təsdiqləndi"
                : listing.status === "rejected"
                  ? "Rədd edildi"
                  : "Gözləmədə",
            ]),
          ),
        );
        setUsers(snapshot.users);
        setAdminStores(snapshot.stores);
        setTransactions(snapshot.transactions);
        setCategoryCount(snapshot.categoryCount);
        setNotice("Supabase məlumatları yükləndi");
      })
      .catch((error: unknown) => {
        setNotice(`Məlumatlar yüklənmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
      })
      .finally(() => {
        if (!cancelled) return;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleListings = useMemo(() => {
    const lowered = query.toLowerCase().trim();
    return adminListings
      .filter((listing) => !lowered || listing.title.toLowerCase().includes(lowered));
  }, [adminListings, query]);

  function setSection(section: AdminSection) {
    setActiveSection(section);
    setNotice(`${section} bölməsi açıldı`);
  }

  async function updateReviewStatus(id: string, status: ListingReviewStatus) {
    setReviewStatuses((current) => ({ ...current, [id]: status }));
    try {
      await updateAdminListing(id, status === "Təsdiqləndi" ? "active" : "rejected");
      setNotice(`Elan statusu dəyişdi: ${status}`);
    } catch (error) {
      setNotice(`Elan yenilənmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
  }

  function openListing(id: string) {
    const listing = adminListings.find((item) => item.id === id);
    setSelectedListing(id);
    setNotice(`Elan baxışı açıldı: ${listing?.title ?? id}`);
  }

  async function changeUserRole(id: string) {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    const nextRole = user.role === "admin" ? "user" : "admin";
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, role: nextRole }
          : user,
      ),
    );
    try {
      await setAdminUserRole(id, nextRole);
      setNotice("İstifadəçi rolu dəyişdirildi");
    } catch (error) {
      setNotice(`Rol dəyişmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
  }

  async function toggleUserBlock(id: string) {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    const nextStatus = user.status === "aktiv" ? "bloklandı" : "aktiv";
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, status: nextStatus }
          : user,
      ),
    );
    try {
      await updateAdminUser(id, { status: nextStatus === "aktiv" ? "active" : "blocked" });
      setNotice("İstifadəçi statusu yeniləndi");
    } catch (error) {
      setNotice(`Status yenilənmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
  }

  async function changeAccountType(id: string) {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    const nextType = user.accountType === "store" ? "individual" : "store";
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              accountType: nextType,
            }
          : user,
      ),
    );
    try {
      await updateAdminUser(id, { account_type: nextType });
      setNotice("İstifadəçi hesab tipi admin tərəfindən dəyişdirildi");
    } catch (error) {
      setNotice(`Hesab tipi dəyişmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
  }

  function updateIdentity<K extends keyof SiteSettings["identity"]>(
    key: K,
    value: SiteSettings["identity"][K],
  ) {
    setSiteSettings((current) => ({
      ...current,
      identity: { ...current.identity, [key]: value },
    }));
  }

  async function changeStoreStatus(id: string, status: "təsdiqləndi" | "rədd edildi") {
    setAdminStores((current) =>
      current.map((store) => (store.id === id ? { ...store, status } : store)),
    );
    try {
      await updateAdminStore(id, status === "təsdiqləndi" ? "active" : "rejected");
      setNotice(status === "təsdiqləndi" ? "Mağaza təsdiqləndi" : "Mağaza müraciəti rədd edildi");
    } catch (error) {
      setNotice(`Mağaza yenilənmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
  }

  async function changeTransactionStatus(id: string, status: "completed" | "refunded") {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id ? { ...transaction, status } : transaction,
      ),
    );
    try {
      await updateAdminTransaction(id, status);
      setNotice(status === "completed" ? `${id} tamamlandı` : `${id} geri qaytarıldı`);
    } catch (error) {
      setNotice(`Ödəniş yenilənmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
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

  async function persistSiteSettings() {
    saveSiteSettings(siteSettings);
    try {
      await saveCloudSiteSettings(siteSettings);
      setNotice("Sayt teması və footer ayarları bütün istifadəçilər üçün saxlanıldı");
      setCmsDraft("Footer, sosial ikonlar, banner və tema ayarları yeniləndi");
    } catch (error) {
      setNotice(`Ayarlar yalnız bu brauzerdə saxlanıldı: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (name.length < 2) {
      setNotice("Kateqoriya adı ən azı 2 simvol olmalıdır");
      return;
    }
    const slug = name
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
      .replace(/^-|-$/g, "");
    try {
      await createAdminCategory(name, slug);
      setCategoryCount((count) => count + 1);
      setNewCategoryName("");
      setCategoryDialogOpen(false);
      setNotice(`${name} kateqoriyası əlavə edildi`);
    } catch (error) {
      setNotice(`Kateqoriya əlavə edilmədi: ${error instanceof Error ? error.message : "naməlum xəta"}`);
    }
  }

  function resolveModeration(id: string, action: string) {
    setResolvedModeration((current) => [...current, id]);
    setNotice(`${id}: ${action}`);
  }

  function downloadInvoice(transaction: AdminTransactionItem) {
    const body = [
      "alışveriş.az elektron faktura",
      `Əməliyyat: ${transaction.id}`,
      `Xidmət: ${transaction.product}`,
      `Məbləğ: ${transaction.amount}`,
      `Status: ${transaction.status}`,
      `Tarix: ${transaction.createdAt ? new Date(transaction.createdAt).toLocaleString("az-AZ") : new Date().toLocaleString("az-AZ")}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${transaction.id}-faktura.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`${transaction.id} fakturası endirildi`);
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
            </div>
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
                <Button type="button" onClick={() => setCategoryDialogOpen(true)}>
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
              {selectedAttribute !== "Atribut seçilməyib" ? (
                <div className="mt-4 rounded-lg border border-white/10 bg-slate-950 p-4" data-testid="selected-attribute">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black">{selectedAttribute}</h3>
                    <Button aria-label="Atribut panelini bağla" size="icon" type="button" variant="ghost" onClick={() => setSelectedAttribute("Atribut seçilməyib")}><X className="h-4 w-4" /></Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(attributeFields[selectedAttribute] ?? []).map((field) => (
                      <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm" key={field}>
                        {field}
                        <button aria-label={`${field} atributunu sil`} className="text-slate-400 hover:text-red-300" type="button" onClick={() => setAttributeFields((current) => ({ ...current, [selectedAttribute]: current[selectedAttribute].filter((item) => item !== field) }))}><X className="h-3.5 w-3.5" /></button>
                      </span>
                    ))}
                  </div>
                  <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => {
                    event.preventDefault();
                    const name = newAttributeName.trim();
                    if (!name) return;
                    setAttributeFields((current) => ({ ...current, [selectedAttribute]: [...(current[selectedAttribute] ?? []), name] }));
                    setNewAttributeName("");
                    setNotice(`${name} atributu əlavə edildi`);
                  }}>
                    <Input className="border-white/10 bg-slate-900 text-white" placeholder="Yeni atribut adı" value={newAttributeName} onChange={(event) => setNewAttributeName(event.target.value)} />
                    <Button type="submit">Atribut əlavə et</Button>
                  </form>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="selected-attribute">Atribut seçilməyib</p>
              )}
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
              {selectedModerationQueue ? (
                <div className="mt-4 rounded-lg border border-white/10 bg-slate-950 p-4" data-testid="moderation-selection">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">{selectedModerationQueue}</p>
                      <p className="text-sm text-slate-400">Növbədəki qeydləri yoxlayın və tədbir seçin.</p>
                    </div>
                    <Button aria-label="Moderasiya panelini bağla" size="icon" type="button" variant="ghost" onClick={() => setSelectedModerationQueue(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {(moderationCases[selectedModerationQueue] ?? [])
                      .filter((item) => !resolvedModeration.includes(item.id))
                      .map((item) => (
                        <div className="grid gap-3 rounded-lg border border-white/10 bg-slate-900 p-4 lg:grid-cols-[1fr_auto]" key={item.id}>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold">{item.id} · {item.title}</p>
                              <Badge tone={item.severity === "yüksək" ? "red" : item.severity === "orta" ? "amber" : "green"}>{item.severity}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" type="button" variant="secondary" onClick={() => setNotice(`${item.id} detalı göstərilir: ${item.detail}`)}>
                              <Eye className="h-4 w-4" /> Detal
                            </Button>
                            {selectedModerationQueue !== "Audit log" ? (
                              <>
                                <Button size="sm" type="button" onClick={() => resolveModeration(item.id, "Həll edildi")}>
                                  Həll et
                                </Button>
                                <Button size="sm" type="button" variant="danger" onClick={() => resolveModeration(item.id, "Bloklandı")}>
                                  <Ban className="h-4 w-4" /> Blokla
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    {(moderationCases[selectedModerationQueue] ?? []).every((item) => resolvedModeration.includes(item.id)) ? (
                      <p className="rounded-lg border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-200">Bu növbədə açıq qeyd qalmayıb.</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm text-slate-300" data-testid="moderation-selection">Növbə seçin</p>
              )}
            </Card>
          ) : null}

          {activeSection === "Mağazalar" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Mağaza müraciətləri</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {adminStores.map((store) => (
                  <div className="rounded-lg bg-slate-900 p-4" key={store.id}>
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-sm font-black">{store.logo}</div>
                      <div>
                        <p className="font-bold">{store.name}</p>
                        <p className="text-sm text-slate-300">{store.listingsCount} elan · {store.city}</p>
                        <Badge className="mt-2" tone={store.status === "təsdiqləndi" ? "green" : store.status === "rədd edildi" ? "red" : "amber"}>{store.status}</Badge>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button data-testid={`store-approve-${store.id}`} size="sm" type="button" onClick={() => changeStoreStatus(store.id, "təsdiqləndi")}>
                        Təsdiqlə
                      </Button>
                      <Button size="sm" type="button" variant="danger" onClick={() => changeStoreStatus(store.id, "rədd edildi")}>
                        Rədd et
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
                        setInvoice(transaction);
                        setNotice(`${transaction.id} fakturası açıldı`);
                      }}>
                        Faktura
                      </Button>
                      {transaction.status === "pending" ? (
                        <Button size="sm" type="button" onClick={() => changeTransactionStatus(transaction.id, "completed")}>
                          Tamamla
                        </Button>
                      ) : null}
                      {transaction.status === "completed" ? (
                        <Button size="sm" type="button" variant="danger" onClick={() => changeTransactionStatus(transaction.id, "refunded")}>
                          Geri qaytar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="invoice-output">{invoice ? `${invoice.id} fakturası açıldı` : "Faktura seçilməyib"}</p>
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
                      setCmsPage(item);
                      setCmsContent(`${item} səhifəsinin məzmununu burada redaktə edin.`);
                      setNotice(`${item} redaktə olunur`);
                    }}
                  >
                    <FileText className="mb-3 h-5 w-5 text-primary" />
                    <p className="font-bold">{item}</p>
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="cms-output">{cmsDraft}</p>
              {cmsPage ? (
                <section className="mt-4 rounded-lg border border-white/10 bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black">{cmsPage} redaktoru</h3>
                    <Button aria-label="CMS redaktorunu bağla" size="icon" type="button" variant="ghost" onClick={() => setCmsPage(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <textarea
                    aria-label={`${cmsPage} məzmunu`}
                    className="mt-3 min-h-40 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-primary"
                    value={cmsContent}
                    onChange={(event) => setCmsContent(event.target.value)}
                  />
                  <Button className="mt-3" type="button" onClick={() => {
                    setCmsDraft(`${cmsPage} məzmunu saxlanıldı`);
                    setNotice(`${cmsPage} yayımlandı`);
                  }}>
                    CMS məzmununu saxla
                  </Button>
                </section>
              ) : null}
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
                <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950 p-3">
                  <div>
                    <p className="text-sm font-bold">Sayt adını headerdə göstər</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Söndürüləndə mobil və desktop headerdə yalnız loqo görünür.
                    </p>
                  </div>
                  <button
                    aria-checked={siteSettings.identity.showSiteName}
                    aria-label="Sayt adını headerdə göstər"
                    className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
                      siteSettings.identity.showSiteName
                        ? "border-primary bg-primary"
                        : "border-slate-600 bg-slate-700"
                    }`}
                    onClick={() =>
                      updateIdentity(
                        "showSiteName",
                        !siteSettings.identity.showSiteName,
                      )
                    }
                    role="switch"
                    type="button"
                  >
                    <span
                      className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        siteSettings.identity.showSiteName
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
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
                        value={siteSettings.footer.links
                          .map((link) => [link.label, link.href, link.content ?? ""].join(" | "))
                          .join("\n")}
                        onChange={(event) =>
                          updateFooterField(
                            "links",
                            event.target.value
                              .split("\n")
                              .map((item) => {
                                const [label = "", href = "", content = ""] = item
                                  .split("|")
                                  .map((part) => part.trim());
                                const slug = label
                                  .toLowerCase()
                                  .replaceAll("ə", "e")
                                  .replaceAll("ı", "i")
                                  .replaceAll("ö", "o")
                                  .replaceAll("ü", "u")
                                  .replaceAll("ş", "s")
                                  .replaceAll("ğ", "g")
                                  .replaceAll("ç", "c")
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-|-$/g, "");

                                return {
                                  label,
                                  href: href || `/sehife/${slug}`,
                                  content,
                                };
                              })
                              .filter((item) => item.label),
                          )
                        }
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        Hər sətr: Başlıq | /sehife/link | Səhifə mətni
                      </p>
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
                            ["imageUrl", "Banner şəkli URL"],
                            ["mobileImageUrl", "Mobil banner şəkli URL"],
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

      {categoryDialogOpen ? (
        <AdminModal title="Yeni kateqoriya" onClose={() => setCategoryDialogOpen(false)}>
          <form className="grid gap-4" onSubmit={submitCategory}>
            <label>
              <span className="text-sm font-semibold">Kateqoriya adı</span>
              <Input
                autoFocus
                className="mt-2 border-white/10 bg-slate-900 text-white"
                placeholder="Məsələn: Musiqi alətləri"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setCategoryDialogOpen(false)}>Ləğv et</Button>
              <Button type="submit">Əlavə et</Button>
            </div>
          </form>
        </AdminModal>
      ) : null}

      {invoice ? (
        <AdminModal title={`${invoice.id} fakturası`} onClose={() => setInvoice(null)}>
          <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Xidmət</p>
                <p className="mt-1 text-lg font-black">{invoice.product}</p>
              </div>
              <Badge tone={invoice.status === "completed" ? "green" : invoice.status === "failed" ? "red" : "amber"}>{invoice.status}</Badge>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-400">Əməliyyat</dt><dd className="mt-1 font-bold">{invoice.id}</dd></div>
              <div><dt className="text-slate-400">Məbləğ</dt><dd className="mt-1 font-bold">{invoice.amount}</dd></div>
              <div><dt className="text-slate-400">Tarix</dt><dd className="mt-1 font-bold">{invoice.createdAt ? new Date(invoice.createdAt).toLocaleString("az-AZ") : new Date().toLocaleDateString("az-AZ")}</dd></div>
              <div><dt className="text-slate-400">Ödəniş üsulu</dt><dd className="mt-1 font-bold">Bank kartı</dd></div>
            </dl>
          </div>
          <Button className="mt-4 w-full" type="button" onClick={() => downloadInvoice(invoice)}>
            <Download className="h-4 w-4" /> Fakturanı endir
          </Button>
        </AdminModal>
      ) : null}
    </div>
  );
}

function AdminModal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <div aria-modal="true" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-white/10 bg-slate-950 p-5 text-white shadow-2xl" role="dialog">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <Button aria-label="Pəncərəni bağla" size="icon" type="button" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

type ListingModerationTableProps = {
  listings: AdminListingItem[];
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
  const selectedItem = visibleListings.find((listing) => listing.id === selectedListing);

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
      {selectedItem ? (
        <div className="mt-4 rounded-lg border border-primary/30 bg-slate-900 p-4" data-testid="selected-listing">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-primary">Elan detalı</p>
              <p className="mt-1 text-lg font-black">{selectedItem.title}</p>
              <p className="mt-2 text-sm text-slate-300">{selectedItem.city} · {formatCurrency(selectedItem.price)}</p>
            </div>
            <Badge tone={reviewStatuses[selectedItem.id] === "Təsdiqləndi" ? "green" : reviewStatuses[selectedItem.id] === "Rədd edildi" ? "red" : "amber"}>{reviewStatuses[selectedItem.id]}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" type="button" onClick={() => updateReviewStatus(selectedItem.id, "Təsdiqləndi")}>Təsdiqlə</Button>
            <Button size="sm" type="button" variant="danger" onClick={() => updateReviewStatus(selectedItem.id, "Rədd edildi")}>Rədd et</Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-900 p-3 text-sm" data-testid="selected-listing">Elan seçilməyib</p>
      )}
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
