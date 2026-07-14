"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeDollarSign,
  Ban,
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

const demoUsers = [
  ["Rauf Məmmədov", "store_owner", "aktiv", "37 elan"],
  ["Nigar Əliyeva", "store_owner", "aktiv", "86 elan"],
  ["Elvin Həsənli", "user", "aktiv", "4 elan"],
  ["Aysel Rəhimova", "user", "müvəqqəti blok", "2 elan"],
];

const transactions = [
  ["TX-1001", "Premium elan", "completed", "9.90 AZN"],
  ["TX-1002", "VIP elan", "pending", "19.90 AZN"],
  ["TX-1003", "Balans artırma", "refunded", "50 AZN"],
  ["TX-1004", "İrəli çək", "failed", "4.90 AZN"],
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("Dashboard");
  const [query, setQuery] = useState("");
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ListingReviewStatus>>(
    () =>
      Object.fromEntries(
        listings.slice(0, 6).map((listing) => [listing.id, "Gözləmədə" as ListingReviewStatus]),
      ),
  );

  const visibleListings = useMemo(() => {
    const lowered = query.toLowerCase().trim();
    return listings
      .slice(0, 6)
      .filter((listing) => !lowered || listing.title.toLowerCase().includes(lowered));
  }, [query]);

  function updateReviewStatus(id: string, status: ListingReviewStatus) {
    setReviewStatuses((current) => ({ ...current, [id]: status }));
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
                onClick={() => setActiveSection(label)}
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
            <Button
              type="button"
              onClick={() => {
                setActiveSection("Elanların idarəsi");
              }}
            >
              Yeni admin əməliyyatı
            </Button>
          </div>

          {activeSection === "Dashboard" ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dashboardMetrics.map((metric) => (
                  <div
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                    key={metric.label}
                  >
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
                  setQuery={setQuery}
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
              setQuery={setQuery}
              updateReviewStatus={updateReviewStatus}
            />
          ) : null}

          {activeSection === "İstifadəçilər" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">İstifadəçilər</h2>
              <div className="mt-4 space-y-3">
                {demoUsers.map(([name, role, status, ads]) => (
                  <div className="grid gap-3 rounded-lg bg-slate-900 p-3 md:grid-cols-[1fr_auto]" key={name}>
                    <div>
                      <p className="font-bold">{name}</p>
                      <p className="text-sm text-slate-300">{role} · {ads}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge tone={status === "aktiv" ? "green" : "red"}>{status}</Badge>
                      <Button size="sm" type="button" variant="secondary">Role dəyiş</Button>
                      <Button size="sm" type="button" variant="danger">Blokla</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {activeSection === "Kateqoriyalar" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Kateqoriya və dynamic attributes</h2>
                <Button type="button">Kateqoriya əlavə et</Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["Avtomobil atributları", "Telefon atributları", "Əmlak atributları"].map((item) => (
                  <div className="rounded-lg bg-slate-900 p-4" key={item}>
                    <p className="font-bold">{item}</p>
                    <p className="mt-2 text-sm text-slate-300">Marka, model, rəng, status, seçim və validation.</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {activeSection === "Moderasiya" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Moderasiya növbəsi</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["Şikayətlər", "Spam elanlar", "Şübhəli hesablar", "Qadağan sözlər", "IP fəaliyyəti", "Audit log"].map((item) => (
                  <button className="rounded-lg bg-slate-900 p-4 text-left hover:bg-slate-800" key={item} type="button">
                    <Flag className="mb-3 h-5 w-5 text-warning" />
                    <p className="font-bold">{item}</p>
                    <p className="mt-1 text-sm text-slate-300">Bax və tədbir gör</p>
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          {activeSection === "Mağazalar" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Mağaza müraciətləri</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {stores.map((store) => (
                  <div className="rounded-lg bg-slate-900 p-4" key={store.id}>
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-sm font-black">
                        {store.logo}
                      </div>
                      <div>
                        <p className="font-bold">{store.name}</p>
                        <p className="text-sm text-slate-300">{store.listingsCount} elan · {store.city}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" type="button">Təsdiqlə</Button>
                      <Button size="sm" type="button" variant="secondary">Statistika</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {activeSection === "Ödənişlər" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Transaction siyahısı</h2>
              <div className="mt-4 space-y-3">
                {transactions.map(([id, product, status, amount]) => (
                  <div className="grid gap-3 rounded-lg bg-slate-900 p-3 md:grid-cols-[1fr_auto]" key={id}>
                    <div>
                      <p className="font-bold">{id} · {product}</p>
                      <p className="text-sm text-slate-300">{amount}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge tone={status === "completed" ? "green" : status === "failed" ? "red" : "amber"}>{status}</Badge>
                      <Button size="sm" type="button" variant="secondary">Faktura</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {activeSection === "CMS" ? (
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">CMS və sayt ayarları</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {["Haqqımızda", "Qaydalar", "FAQ", "SEO metadata", "Footer", "Sosial şəbəkələr", "Bannerlər", "Təhlükəsizlik"].map((item) => (
                  <button className="rounded-lg bg-slate-900 p-4 text-left hover:bg-slate-800" key={item} type="button">
                    <FileText className="mb-3 h-5 w-5 text-primary" />
                    <p className="font-bold">{item}</p>
                  </button>
                ))}
              </div>
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
  setQuery: (query: string) => void;
  updateReviewStatus: (id: string, status: ListingReviewStatus) => void;
};

function ListingModerationTable({
  listings: visibleListings,
  query,
  reviewStatuses,
  setQuery,
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
                tone={reviewStatuses[listing.id] === "Təsdiqləndi" ? "green" : reviewStatuses[listing.id] === "Rədd edildi" ? "red" : "amber"}
              >
                {reviewStatuses[listing.id]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" type="button" variant="secondary">Bax</Button>
              <Button
                data-testid={`approve-${listing.id}`}
                size="sm"
                type="button"
                onClick={() => updateReviewStatus(listing.id, "Təsdiqləndi")}
              >
                Təsdiqlə
              </Button>
              <Button
                data-testid={`reject-${listing.id}`}
                size="sm"
                type="button"
                variant="danger"
                onClick={() => updateReviewStatus(listing.id, "Rədd edildi")}
              >
                Rədd et
              </Button>
            </div>
          </div>
        ))}
      </div>
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
