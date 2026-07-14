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
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listings as initialListings } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

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

const tabByIndex: Tab[] = ["Aktiv", "Aktiv", "Gözləmədə", "Rədd edilmiş", "Vaxtı bitmiş", "Satılmış"];

export default function ProfilePage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("Elanlarım");
  const [activeTab, setActiveTab] = useState<Tab>("Aktiv");
  const [items, setItems] = useState(initialListings.slice(0, 8));
  const [message, setMessage] = useState("");
  const [statsId, setStatsId] = useState<string | number | null>(null);

  const filteredListings = useMemo(
    () => items.filter((_, index) => (tabByIndex[index % tabByIndex.length] ?? "Aktiv") === activeTab),
    [activeTab, items],
  );

  function notify(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  function handleMenu(label: string) {
    if (label === "Yeni elan") {
      router.push("/elan-yerlesdir");
      return;
    }
    if (label === "Çıxış") {
      const accepted = window.confirm("Hesabdan çıxmaq istədiyinizə əminsiniz?");
      if (accepted) router.push("/");
      return;
    }
    setActiveMenu(label);
    notify(`${label} bölməsi açıldı`);
  }

  function removeListing(id: string | number, title: string) {
    if (!window.confirm(`“${title}” elanını silmək istəyirsiniz?`)) return;
    setItems((current) => current.filter((item) => item.id !== id));
    notify("Elan silindi");
  }

  function togglePremium(id: string | number) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isPremium: !item.isPremium } : item)),
    );
    notify("Premium statusu yeniləndi");
  }

  return (
    <SiteShell>
      <div className="container-shell min-w-0 py-6 md:py-8">
        {message ? (
          <div className="fixed right-5 top-24 z-50 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">
            {message}
          </div>
        ) : null}

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
                onClick={() => handleMenu(label)}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </Card>

          <section className="min-w-0 space-y-5">
            <div className="scrollbar-hide flex max-w-full min-w-0 gap-2 overflow-x-auto pb-1 lg:hidden">
              {menu.slice(0, 8).map(([label]) => (
                <button
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm ${
                    activeMenu === label ? "border-primary bg-primary text-white" : "border-border bg-card"
                  }`}
                  key={label}
                  onClick={() => handleMenu(label)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["Aktiv elan", String(items.length)],
                ["Telefon klikləri", "246"],
                ["Mesaj", "39"],
                ["Balans", "72 AZN"],
              ].map(([label, value]) => (
                <Card className="cursor-pointer p-4 transition hover:-translate-y-0.5 hover:shadow-md" key={label} onClick={() => notify(`${label}: ${value}`)}>
                  <p className="text-sm text-muted">{label}</p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </Card>
              ))}
            </div>

            <Card className="min-w-0 p-4 md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">{activeMenu}</h2>
                  {activeMenu !== "Elanlarım" ? <p className="mt-1 text-sm text-muted">Bu bölmə interaktiv olaraq seçildi.</p> : null}
                </div>
                <Button onClick={() => router.push("/elan-yerlesdir")}>Yeni elan</Button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      activeTab === tab ? "bg-primary text-white" : "border border-border text-muted hover:border-primary"
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
                {filteredListings.length ? (
                  filteredListings.map((listing) => (
                    <div className="rounded-lg border border-border p-3" key={listing.id}>
                      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">{listing.title}</h3>
                            <Badge tone={listing.isPremium ? "amber" : "green"}>{listing.isPremium ? "Premium" : activeTab}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted">
                            {formatCurrency(listing.price)} · {listing.views} baxış · {listing.favorites} seçilmiş
                          </p>
                        </div>
                        <div className="flex min-w-0 flex-wrap gap-2">
                          <Button size="sm" type="button" variant="secondary" onClick={() => notify("Redaktə forması açılacaq")}>Redaktə et</Button>
                          <Button size="sm" type="button" variant="secondary" onClick={() => setStatsId((value) => (value === listing.id ? null : listing.id))}>Statistika</Button>
                          <Button size="sm" type="button" variant="secondary" onClick={() => togglePremium(listing.id)}>{listing.isPremium ? "Premiumdən çıxar" : "Premium et"}</Button>
                          <Button size="sm" type="button" variant="danger" onClick={() => removeListing(listing.id, listing.title)}>Sil</Button>
                        </div>
                      </div>

                      {statsId === listing.id ? (
                        <div className="mt-3 grid gap-2 rounded-lg bg-primary-soft/40 p-3 text-sm sm:grid-cols-3">
                          <div><span className="text-muted">Baxış:</span> <b>{listing.views}</b></div>
                          <div><span className="text-muted">Seçilmiş:</span> <b>{listing.favorites}</b></div>
                          <div><span className="text-muted">Telefon klikləri:</span> <b>{Math.max(1, Math.round(listing.views / 9))}</b></div>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border py-12 text-center">
                    <Package className="mx-auto h-9 w-9 text-muted" />
                    <p className="mt-3 font-bold">Bu statusda elan yoxdur</p>
                    <p className="mt-1 text-sm text-muted">Başqa tab seçin və ya yeni elan yaradın.</p>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
