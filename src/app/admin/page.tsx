import type { Metadata } from "next";
import {
  Activity,
  BadgeDollarSign,
  Ban,
  Flag,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboardMetrics, listings } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin panel",
};

const adminNav = [
  ["Dashboard", LayoutDashboard],
  ["Elanların idarəsi", Activity],
  ["İstifadəçilər", Users],
  ["Kateqoriyalar", Settings],
  ["Moderasiya", Flag],
  ["Mağazalar", Store],
  ["Ödənişlər", BadgeDollarSign],
  ["CMS", ShieldCheck],
] as const;

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-slate-900 p-4 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="mb-6 text-2xl font-black">alışveriş.az admin</div>
          <nav className="grid gap-1">
            {adminNav.map(([label, Icon], index) => (
              <button
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  index === 0 ? "bg-primary" : "text-slate-300 hover:bg-white/10"
                }`}
                key={label}
                type="button"
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
              <h1 className="text-3xl font-black">Dashboard</h1>
              <p className="mt-2 text-slate-400">
                Moderasiya, ödəniş, mağaza və audit log nəzarəti.
              </p>
            </div>
            <Button>Yeni admin əməliyyatı</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dashboardMetrics.map((metric) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                key={metric.label}
              >
                <p className="text-sm text-slate-400">{metric.label}</p>
                <p className="mt-2 text-3xl font-black">{metric.value}</p>
                <p className="mt-2 text-sm text-green-300">{metric.delta}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">Gözləmədə olan elanlar</h2>
                <Badge tone="amber">316 gözləyir</Badge>
              </div>
              <div className="space-y-3">
                {listings.slice(0, 5).map((listing) => (
                  <div
                    className="grid gap-3 rounded-lg border border-white/10 p-3 md:grid-cols-[1fr_auto]"
                    key={listing.id}
                  >
                    <div>
                      <p className="font-bold">{listing.title}</p>
                      <p className="text-sm text-slate-400">
                        {listing.city} · {formatCurrency(listing.price)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" type="button" variant="secondary">
                        Bax
                      </Button>
                      <Button size="sm" type="button">
                        Təsdiqlə
                      </Button>
                      <Button size="sm" type="button" variant="danger">
                        Rədd et
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="border-white/10 bg-white/[0.04] p-5 text-white">
              <h2 className="text-xl font-black">Son fəaliyyətlər</h2>
              <div className="mt-4 space-y-3">
                {[
                  ["Yeni mesaj", MessageSquare, "39 yeni mesaj qeyd edildi"],
                  ["Şikayət", Flag, "3 elan təkrar yerləşdirmə şübhəsi"],
                  ["Bloklama", Ban, "1 istifadəçi müvəqqəti bloklandı"],
                  ["Mağaza", Store, "2 mağaza müraciəti gözləyir"],
                ].map(([title, Icon, text]) => (
                  <div className="flex gap-3 rounded-lg bg-slate-900 p-3" key={title as string}>
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold">{title as string}</p>
                      <p className="text-sm text-slate-400">{text as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
