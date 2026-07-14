"use client";

import { Bell, CreditCard, Heart, Lock, MessageCircle, Package, ShieldCheck, Star, Store, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AccountProfile } from "@/components/providers/account-provider";
import type { Listing } from "@/types/marketplace";

export type ProfileTab = "Aktiv" | "Gözləmədə" | "Rədd edilmiş" | "Vaxtı bitmiş" | "Satılmış" | "Draft";
export type ProfileListing = Listing & { status?: ProfileTab; owner_id?: string };

function EmptyState({ icon: Icon, title, text, action }: { icon: typeof Package; title: string; text: string; action?: React.ReactNode }) {
  return (
    <Card className="p-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted" />
      <h2 className="mt-4 text-xl font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function ProfileOverview({ activeCount, phoneClicks, messageCount, balance }: { activeCount: number; phoneClicks: number; messageCount: number; balance: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[["Aktiv elan", String(activeCount)], ["Telefon klikləri", String(phoneClicks)], ["Mesaj", String(messageCount)], ["Balans", `${balance.toFixed(2)} AZN`]].map(([label, value]) => (
        <Card className="p-4" key={label}><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></Card>
      ))}
    </div>
  );
}

export function ProfileListings({ items, activeTab, onTabChange, onCreate, onDelete, onTogglePremium }: { items: ProfileListing[]; activeTab: ProfileTab; onTabChange: (tab: ProfileTab) => void; onCreate: () => void; onDelete: (listing: ProfileListing) => void; onTogglePremium: (listing: ProfileListing) => void }) {
  const tabs: ProfileTab[] = ["Aktiv", "Gözləmədə", "Rədd edilmiş", "Vaxtı bitmiş", "Satılmış", "Draft"];
  const filtered = items.filter((item) => (item.status ?? "Aktiv") === activeTab);
  return (
    <Card className="min-w-0 p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Elanlarım</h2><Button onClick={onCreate}>Yeni elan</Button></div>
      <div className="mb-4 flex flex-wrap gap-2">{tabs.map((tab) => <button className={`rounded-full px-3 py-1.5 text-sm font-semibold ${activeTab === tab ? "bg-primary text-white" : "border border-border text-muted"}`} key={tab} onClick={() => onTabChange(tab)} type="button">{tab}</button>)}</div>
      {filtered.length ? <div className="space-y-3">{filtered.map((listing) => (
        <div className="rounded-lg border border-border p-3" key={listing.id}>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{listing.title}</h3><Badge tone={listing.isPremium ? "amber" : "green"}>{listing.isPremium ? "Premium" : listing.status ?? "Aktiv"}</Badge></div><p className="mt-1 text-sm text-muted">{formatCurrency(listing.price)} · {listing.views ?? 0} baxış · {listing.favorites ?? 0} seçilmiş</p></div>
            <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary">Redaktə et</Button><Button size="sm" variant="secondary" onClick={() => onTogglePremium(listing)}>{listing.isPremium ? "Premiumdən çıxar" : "Premium et"}</Button><Button size="sm" variant="danger" onClick={() => onDelete(listing)}>Sil</Button></div>
          </div>
        </div>
      ))}</div> : <EmptyState icon={Package} title="Bu statusda elan yoxdur" text="Yeni hesabda elan sayı 0-dan başlayır." action={<Button onClick={onCreate}>Elan yerləşdir</Button>} />}
    </Card>
  );
}

export function ProfileFavorites() { return <EmptyState icon={Heart} title="Seçilmiş elan yoxdur" text="Bəyəndiyiniz elanları ürək işarəsi ilə seçdikdə burada görünəcək." />; }
export function ProfileMessages({ count }: { count: number }) { return <EmptyState icon={MessageCircle} title={count ? `${count} mesajınız var` : "Mesaj yoxdur"} text="Alıcı və satıcılarla yazışmalarınız burada görünəcək." />; }
export function ProfileNotifications() { return <EmptyState icon={Bell} title="Bildiriş yoxdur" text="Elan statusu, mesaj və ödəniş bildirişləri burada göstəriləcək." />; }
export function ProfileStore({ account, onCreate }: { account: AccountProfile; onCreate: () => void }) {
  if (account.accountType !== "store") return <EmptyState icon={Store} title="Mağaza hesabı tələb olunur" text="Mağaza yaratmaq üçün mağaza tipli hesab istifadə edin." />;
  if (!account.store) return <EmptyState icon={Store} title="Mağazanız yaradılmayıb" text="Mağaza adı və loqo əlavə etdikdən sonra məhsullarınızı idarə edə bilərsiniz." action={<Button onClick={onCreate}>Mağaza yarat</Button>} />;
  return <Card className="p-6"><div className="flex items-center gap-4"><img alt={account.store.name} className="h-16 w-16 rounded-xl object-cover" src={account.store.logoUrl} /><div><h2 className="text-2xl font-black">{account.store.name}</h2><p className="text-sm text-muted">Mağaza idarəetməsi</p></div></div></Card>;
}
export function ProfileBalance({ balance, onPayments }: { balance: number; onPayments: () => void }) { return <Card className="p-6"><p className="text-sm text-muted">Cari balans</p><p className="mt-2 text-4xl font-black">{balance.toFixed(2)} AZN</p><div className="mt-6 flex gap-3"><Button>Balansı artır</Button><Button variant="secondary" onClick={onPayments}>Ödəniş tarixçəsi</Button></div></Card>; }
export function ProfilePayments() { return <EmptyState icon={CreditCard} title="Ödəniş tarixçəsi boşdur" text="Balans artırma və paket ödənişləri burada görünəcək." />; }
export function ProfilePremium() { return <EmptyState icon={ShieldCheck} title="Premium paketlər" text="VIP, Premium və irəli çəkmə paketləri aktivləşdirildikdə burada idarə ediləcək." />; }
export function ProfileReviews() { return <EmptyState icon={Star} title="Rəy yoxdur" text="Digər istifadəçilərin verdiyi reytinq və rəylər burada görünəcək." />; }
export function ProfilePersonal({ account }: { account: AccountProfile }) { return <Card className="p-6"><UserRound className="h-8 w-8 text-primary" /><h2 className="mt-3 text-xl font-black">Şəxsi məlumatlar</h2><p className="mt-3"><b>Ad:</b> {account.name}</p><p className="mt-1 text-sm text-muted">Profil məlumatlarının redaktəsi növbəti mərhələdə Supabase profiles cədvəlinə yazılacaq.</p></Card>; }
export function ProfileSecurity() { return <EmptyState icon={Lock} title="Təhlükəsizlik" text="Şifrə dəyişmə, aktiv sessiyalar və iki mərhələli doğrulama burada idarə olunacaq." />; }
export function ProfileSettings() { return <Card className="p-6"><h2 className="text-xl font-black">Ayarlar</h2><div className="mt-5 space-y-4"><label className="flex items-center justify-between rounded-lg border border-border p-4"><span>Bildirişləri aktiv et</span><input defaultChecked type="checkbox" /></label><label className="flex items-center justify-between rounded-lg border border-border p-4"><span>E-poçt bildirişləri</span><input type="checkbox" /></label></div></Card>; }
