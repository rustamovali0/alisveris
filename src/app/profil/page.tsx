import type { Metadata } from "next";
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
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listings } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profil kabineti",
};

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

const tabs = ["Aktiv", "Gözləmədə", "Rədd edilmiş", "Vaxtı bitmiş", "Satılmış", "Draft"];

export default function ProfilePage() {
  return (
    <SiteShell>
      <div className="container-shell py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black">İstifadəçi kabineti</h1>
          <p className="mt-2 text-muted">
            Elanlar, mesajlar, mağaza, balans və təhlükəsizlik idarəetməsi.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
          <Card className="hidden h-fit p-3 lg:block">
            {menu.map(([label, Icon], index) => (
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  index === 1 ? "bg-primary text-white" : "hover:bg-primary-soft/60"
                }`}
                key={label}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </Card>
          <section className="space-y-5">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto lg:hidden">
              {menu.slice(0, 8).map(([label]) => (
                <button
                  className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-sm"
                  key={label}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["Aktiv elan", "18"],
                ["Telefon klikləri", "246"],
                ["Mesaj", "39"],
                ["Balans", "72 AZN"],
              ].map(([label, value]) => (
                <Card className="p-4" key={label}>
                  <p className="text-sm text-muted">{label}</p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </Card>
              ))}
            </div>
            <Card className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">Elanlarım</h2>
                <Button>Yeni elan</Button>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab, index) => (
                  <button
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                      index === 0
                        ? "bg-primary text-white"
                        : "border border-border text-muted"
                    }`}
                    key={tab}
                    type="button"
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {listings.slice(0, 4).map((listing) => (
                  <div
                    className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_auto]"
                    key={listing.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{listing.title}</h3>
                        <Badge tone={listing.isPremium ? "amber" : "green"}>
                          {listing.isPremium ? "Premium" : "Aktiv"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {formatCurrency(listing.price)} · {listing.views} baxış ·{" "}
                        {listing.favorites} seçilmiş
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Redaktə et", "Statistika", "Premium et", "Sil"].map((action) => (
                        <Button
                          key={action}
                          size="sm"
                          type="button"
                          variant={action === "Sil" ? "danger" : "secondary"}
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
