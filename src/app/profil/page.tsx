"use client";

import {
  BarChart3,
  Bell,
  CreditCard,
  Heart,
  Lock,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAccount } from "@/components/providers/account-provider";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/marketplace";

const menu = [
  ["Ümumi məlumat", UserRound],
  ["Elanlarım", Package],
  ["Yeni elan", Package],
  ["Seçilmiş elanlar", Heart],
  ["Mesajlar", MessageCircle],
  ["Bildirişlər", Bell],
  ["Mağazam", Store],
  ["Balans", CreditCard],
  ["Ödənişlər", CreditCard],
  ["Premium paketlər", ShieldCheck],
  ["Reytinq və rəylər", BarChart3],
  ["Şəxsi məlumatlar", UserRound],
  ["Təhlükəsizlik", Lock],
  ["Ayarlar", Settings],
  ["Çıxış", LogOut],
] as const;

const tabs = ["Aktiv", "Gözləmədə", "Rədd edilmiş", "Vaxtı bitmiş", "Satılmış", "Draft"] as const;
type Tab = (typeof tabs)[number];
type UserListing = Listing & { status?: Tab };

declare global {
  interface Window {
    Swal?: {
      fire: (options: Record<string, unknown>) => Promise<{ isConfirmed?: boolean }>;
    };
  }
}

function EmptySection({ title, text }: { title: string; text: string }) {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{text}</p>
    </Card>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { account, ready, logout } = useAccount();
  const [activeMenu, setActiveMenu] = useState("Elanlarım");
  const [activeTab, setActiveTab] = useState<Tab>("Aktiv");
  const [items, setItems] = useState<UserListing[]>([]);
  const [balance, setBalance] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [statsId, setStatsId] = useState<string | number | null>(null);

  const listingKey = account ? `alisveris-user-listings-v1:${account.id}` : "";
  const balanceKey = account ? `alisveris-user-balance-v1:${account.id}` : "";
  const messageKey = account ? `alisveris-user-messages-v1:${account.id}` : "";

  useEffect(() => {
    if (!account) {
      setItems([]);
      setBalance(0);
      setMessageCount(0);
      return;
    }

    try {
      const storedListings = JSON.parse(window.localStorage.getItem(listingKey) ?? "[]") as UserListing[];
      const storedBalance = Number(window.localStorage.getItem(balanceKey) ?? "0");
      const storedMessages = JSON.parse(window.localStorage.getItem(messageKey) ?? "[]") as unknown[];
      setItems(Array.isArray(storedListings) ? storedListings : []);
      setBalance(Number.isFinite(storedBalance) ? storedBalance : 0);
      setMessageCount(Array.isArray(storedMessages) ? storedMessages.length : 0);
    } catch {
      setItems([]);
      setBalance(0);
      setMessageCount(0);
    }
  }, [account, listingKey, balanceKey, messageKey]);

  const activeItems = useMemo(
    () => items.filter((item) => (item.status ?? "Aktiv") === "Aktiv"),
    [items],
  );

  const filteredListings = useMemo(
    () => items.filter((item) => (item.status ?? "Aktiv") === activeTab),
    [activeTab, items],
  );

  const totalPhoneClicks = useMemo(
    () => items.reduce((total, item) => total + Math.max(0, Math.round((item.views ?? 0) / 9)), 0),
    [items],
  );

  function persistListings(next: UserListing[]) {
    setItems(next);
    if (listingKey) window.localStorage.setItem(listingKey, JSON.stringify(next));
  }

  async function confirmDialog(title: string, text: string, confirmButtonText: string) {
    if (window.Swal) {
      const result = await window.Swal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: "Ləğv et",
        confirmButtonColor: "#6d28d9",
        cancelButtonColor: "#64748b",
      });
      return Boolean(result.isConfirmed);
    }
    return window.confirm(text);
  }

  function toast(title: string, icon: "success" | "info" = "success") {
    if (window.Swal) {
      void window.Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title,
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      });
    }
  }

  async function handleMenu(label: string) {
    if (label === "Yeni elan") {
      router.push("/elan-yerlesdir");
      return;
    }
    if (label === "Çıxış") {
      const accepted = await confirmDialog(
        "Hesabdan çıxış",
        "Hesabdan çıxmaq istədiyinizə əminsiniz?",
        "Bəli, çıx",
      );
      if (accepted) {
        logout();
        router.push("/");
      }
      return;
    }
    setActiveMenu(label);
  }

  async function removeListing(id: string, title: string) {
    const accepted = await confirmDialog(
      "Elanı silmək istəyirsiniz?",
      `“${title}” elanı silindikdən sonra geri qaytarılmayacaq.`,
      "Bəli, sil",
    );
    if (!accepted) return;
    persistListings(items.filter((item) => item.id !== id));
    toast("Elan silindi");
  }

  function togglePremium(id: string) {
    persistListings(
      items.map((item) => (item.id === id ? { ...item, isPremium: !item.isPremium } : item)),
    );
    toast("Premium statusu yeniləndi");
  }

  if (!ready) {
    return (
      <SiteShell>
        <div className="container-shell py-8"><Card className="min-h-80 animate-pulse" /></div>
      </SiteShell>
    );
  }

  if (!account) {
    return (
      <SiteShell>
        <div className="container-shell py-8">
          <Card className="mx-auto max-w-xl p-8 text-center">
            <h1 className="text-2xl font-black">Profilə daxil olun</h1>
            <p className="mt-2 text-muted">Şəxsi kabinet yalnız hesabınıza daxil olduqdan sonra görünür.</p>
            <Button className="mt-5" onClick={() => router.push("/giris")}>Giriş</Button>
          </Card>
        </div>
      </SiteShell>
    );
  }

  function renderContent() {
    if (activeMenu === "Elanlarım") {
      return (
        <Card className="min-w-0 p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Elanlarım</h2>
            <Button onClick={() => router.push("/elan-yerlesdir")}>Yeni elan</Button>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  activeTab === tab ? "bg-primary text-white" : "border border-border text-muted"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredListings.length ? filteredListings.map((listing) => (
              <div className="rounded-lg border border-border p-3" key={listing.id}>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{listing.title}</h3>
                      <Badge tone={listing.isPremium ? "amber" : "green"}>
                        {listing.isPremium ? "Premium" : listing.status ?? "Aktiv"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {formatCurrency(listing.price)} · {listing.views ?? 0} baxış · {listing.favorites ?? 0} seçilmiş
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toast("Redaktə səhifəsi hazırlanır", "info")}>Redaktə et</Button>
                    <Button size="sm" variant="secondary" onClick={() => setStatsId(statsId === listing.id ? null : listing.id)}>Statistika</Button>
                    <Button size="sm" variant="secondary" onClick={() => togglePremium(listing.id)}>{listing.isPremium ? "Premiumdən çıxar" : "Premium et"}</Button>
                    <Button size="sm" variant="danger" onClick={() => void removeListing(listing.id, listing.title)}>Sil</Button>
                  </div>
                </div>
                {statsId === listing.id ? (
                  <div className="mt-3 grid gap-2 rounded-lg bg-primary-soft/40 p-3 text-sm sm:grid-cols-3">
                    <div><span className="text-muted">Baxış:</span> <b>{listing.views ?? 0}</b></div>
                    <div><span className="text-muted">Seçilmiş:</span> <b>{listing.favorites ?? 0}</b></div>
                    <div><span className="text-muted">Telefon klikləri:</span> <b>{Math.max(0, Math.round((listing.views ?? 0) / 9))}</b></div>
                  </div>
                ) : null}
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <Package className="mx-auto h-9 w-9 text-muted" />
                <p className="mt-3 font-bold">Bu statusda elan yoxdur</p>
                <p className="mt-1 text-sm text-muted">Yeni hesabda elan sayı 0-dan başlayır.</p>
              </div>
            )}
          </div>
        </Card>
      );
    }

    if (activeMenu === "Balans") {
      return (
        <Card className="p-6">
          <p className="text-sm text-muted">Cari balans</p>
          <p className="mt-2 text-4xl font-black">{balance.toFixed(2)} AZN</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => toast("Balans artırma sistemi hazırlanır", "info")}>Balansı artır</Button>
            <Button variant="secondary" onClick={() => setActiveMenu("Ödənişlər")}>Ödəniş tarixçəsi</Button>
          </div>
        </Card>
      );
    }

    const sections: Record<string, string> = {
      "Ümumi məlumat": "Hesabınızın elan, baxış, mesaj və balans göstəriciləri yuxarıda görünür.",
      "Seçilmiş elanlar": "Seçdiyiniz elanlar bu bölmədə göstəriləcək.",
      "Mesajlar": "Alıcı və satıcılarla yazışmalar burada görünəcək.",
      "Bildirişlər": "Elan statusu, mesaj və ödəniş bildirişləri burada göstəriləcək.",
      "Mağazam": account.accountType === "store" ? "Mağaza məlumatlarınızı və məhsullarınızı idarə edin." : "Mağaza yaratmaq üçün mağaza hesabına keçid tələb olunur.",
      "Ödənişlər": "Balans əməliyyatları və ödəniş tarixçəsi burada görünəcək.",
      "Premium paketlər": "Elanlar üçün premium, VIP və irəli çəkmə paketlərini buradan seçə bilərsiniz.",
      "Reytinq və rəylər": "İstifadəçilərin verdiyi reytinq və rəylər burada görünəcək.",
      "Şəxsi məlumatlar": "Ad, əlaqə məlumatları və profil məlumatlarını buradan idarə edə bilərsiniz.",
      "Təhlükəsizlik": "Şifrə, aktiv sessiyalar və hesab təhlükəsizliyi burada idarə olunacaq.",
      "Ayarlar": "Dil, bildiriş və görünüş seçimlərini buradan dəyişə bilərsiniz.",
    };

    return <EmptySection title={activeMenu} text={sections[activeMenu] ?? "Bu bölmə hazırlanır."} />;
  }

  return (
    <SiteShell>
      <div className="container-shell min-w-0 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black">İstifadəçi kabineti</h1>
          <p className="mt-2 text-muted">Elanlar, mesajlar, mağaza, balans və təhlükəsizlik idarəetməsi.</p>
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
          <Card className="hidden h-fit p-3 lg:block">
            {menu.map(([label, Icon]) => (
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  activeMenu === label ? "bg-primary text-white" : "hover:bg-primary-soft/60"
                }`}
                key={label}
                onClick={() => void handleMenu(label)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </Card>

          <section className="min-w-0 space-y-5">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {menu.slice(0, 14).map(([label]) => (
                <button
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm ${
                    activeMenu === label ? "border-primary bg-primary text-white" : "border-border bg-card"
                  }`}
                  key={label}
                  onClick={() => void handleMenu(label)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["Aktiv elan", String(activeItems.length)],
                ["Telefon klikləri", String(totalPhoneClicks)],
                ["Mesaj", String(messageCount)],
                ["Balans", `${balance.toFixed(2)} AZN`],
              ].map(([label, value]) => (
                <Card className="p-4" key={label}>
                  <p className="text-sm text-muted">{label}</p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </Card>
              ))}
            </div>

            {renderContent()}
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
