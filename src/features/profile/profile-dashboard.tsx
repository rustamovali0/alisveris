"use client";

import { BarChart3, Bell, CreditCard, Heart, Lock, LogOut, MessageCircle, Package, Settings, ShieldCheck, Store, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/providers/account-provider";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ProfileBalance, ProfileFavorites, ProfileListings, ProfileMessages, ProfileNotifications,
  ProfileOverview, ProfilePayments, ProfilePersonal, ProfilePremium, ProfileReviews,
  ProfileSecurity, ProfileSettings, ProfileStore, type ProfileListing, type ProfileTab,
} from "./profile-sections";

const menu = [
  ["Ümumi məlumat", UserRound], ["Elanlarım", Package], ["Yeni elan", Package],
  ["Seçilmiş elanlar", Heart], ["Mesajlar", MessageCircle], ["Bildirişlər", Bell],
  ["Mağazam", Store], ["Balans", CreditCard], ["Ödənişlər", CreditCard],
  ["Premium paketlər", ShieldCheck], ["Reytinq və rəylər", BarChart3],
  ["Şəxsi məlumatlar", UserRound], ["Təhlükəsizlik", Lock], ["Ayarlar", Settings], ["Çıxış", LogOut],
] as const;

type MenuLabel = (typeof menu)[number][0];

declare global { interface Window { Swal?: { fire: (options: Record<string, unknown>) => Promise<{ isConfirmed?: boolean }> } } }

export function ProfileDashboard() {
  const router = useRouter();
  const { account, ready, logout } = useAccount();
  const [activeMenu, setActiveMenu] = useState<MenuLabel>("Elanlarım");
  const [activeTab, setActiveTab] = useState<ProfileTab>("Aktiv");
  const [items, setItems] = useState<ProfileListing[]>([]);
  const [balance, setBalance] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accountId = account?.id;

    if (!accountId) {
      setItems([]);
      setBalance(0);
      setMessageCount(0);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load(userId: string) {
      setLoading(true);

      if (isSupabaseConfigured) {
        const supabase = createSupabaseBrowserClient();
        const [listingResult, walletResult, messageResult] = await Promise.all([
          supabase.from("listings").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
          supabase.from("wallets").select("balance").eq("user_id", userId).maybeSingle(),
          supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", userId),
        ]);

        if (!cancelled && !listingResult.error) setItems((listingResult.data ?? []) as ProfileListing[]);
        if (!cancelled && !walletResult.error) setBalance(Number(walletResult.data?.balance ?? 0));
        if (!cancelled && !messageResult.error) setMessageCount(messageResult.count ?? 0);
      } else {
        const listingKey = `alisveris-user-listings-v1:${userId}`;
        const balanceKey = `alisveris-user-balance-v1:${userId}`;
        const messageKey = `alisveris-user-messages-v1:${userId}`;

        try {
          const localItems = JSON.parse(localStorage.getItem(listingKey) ?? "[]");
          const localMessages = JSON.parse(localStorage.getItem(messageKey) ?? "[]");

          if (!cancelled) {
            setItems(Array.isArray(localItems) ? localItems : []);
            setBalance(Number(localStorage.getItem(balanceKey) ?? 0));
            setMessageCount(Array.isArray(localMessages) ? localMessages.length : 0);
          }
        } catch {
          if (!cancelled) {
            setItems([]);
            setBalance(0);
            setMessageCount(0);
          }
        }
      }

      if (!cancelled) setLoading(false);
    }

    void load(accountId);

    return () => {
      cancelled = true;
    };
  }, [account?.id]);

  const activeItems = useMemo(() => items.filter((item) => (item.status ?? "Aktiv") === "Aktiv"), [items]);
  const phoneClicks = useMemo(() => items.reduce((sum, item) => sum + Math.max(0, Math.round((item.views ?? 0) / 9)), 0), [items]);

  async function confirm(title: string, text: string) {
    if (window.Swal) return Boolean((await window.Swal.fire({ title, text, icon: "warning", showCancelButton: true, confirmButtonText: "Bəli", cancelButtonText: "Ləğv et", confirmButtonColor: "#6d28d9" })).isConfirmed);
    return window.confirm(text);
  }

  async function handleMenu(label: MenuLabel) {
    if (label === "Yeni elan") return router.push("/elan-yerlesdir");
    if (label === "Çıxış") {
      if (await confirm("Hesabdan çıxış", "Hesabdan çıxmaq istədiyinizə əminsiniz?")) { logout(); router.push("/"); }
      return;
    }
    setActiveMenu(label);
  }

  async function deleteListing(listing: ProfileListing) {
    if (!(await confirm("Elanı silmək istəyirsiniz?", `“${listing.title}” elanı silinəcək.`))) return;
    const next = items.filter((item) => item.id !== listing.id);
    setItems(next);

    const accountId = account?.id;
    if (!accountId) return;

    localStorage.setItem(`alisveris-user-listings-v1:${accountId}`, JSON.stringify(next));
    if (isSupabaseConfigured) {
      await createSupabaseBrowserClient().from("listings").delete().eq("id", listing.id).eq("owner_id", accountId);
    }
  }

  async function togglePremium(listing: ProfileListing) {
    const next = items.map((item) => item.id === listing.id ? { ...item, isPremium: !item.isPremium } : item);
    setItems(next);

    const accountId = account?.id;
    if (!accountId) return;

    localStorage.setItem(`alisveris-user-listings-v1:${accountId}`, JSON.stringify(next));
    if (isSupabaseConfigured) {
      await createSupabaseBrowserClient().from("listings").update({ is_premium: !listing.isPremium }).eq("id", listing.id).eq("owner_id", accountId);
    }
  }

  function content() {
    if (!account) return null;
    switch (activeMenu) {
      case "Ümumi məlumat": return <ProfileOverview activeCount={activeItems.length} balance={balance} messageCount={messageCount} phoneClicks={phoneClicks} />;
      case "Elanlarım": return <ProfileListings activeTab={activeTab} items={items} onCreate={() => router.push("/elan-yerlesdir")} onDelete={(item) => void deleteListing(item)} onTabChange={setActiveTab} onTogglePremium={(item) => void togglePremium(item)} />;
      case "Seçilmiş elanlar": return <ProfileFavorites />;
      case "Mesajlar": return <ProfileMessages count={messageCount} />;
      case "Bildirişlər": return <ProfileNotifications />;
      case "Mağazam": return <ProfileStore account={account} onCreate={() => router.push("/magaza-yarat")} />;
      case "Balans": return <ProfileBalance balance={balance} onPayments={() => setActiveMenu("Ödənişlər")} />;
      case "Ödənişlər": return <ProfilePayments />;
      case "Premium paketlər": return <ProfilePremium />;
      case "Reytinq və rəylər": return <ProfileReviews />;
      case "Şəxsi məlumatlar": return <ProfilePersonal account={account} />;
      case "Təhlükəsizlik": return <ProfileSecurity />;
      case "Ayarlar": return <ProfileSettings />;
      default: return null;
    }
  }

  if (!ready || loading) return <SiteShell><div className="container-shell py-8"><Card className="min-h-80 animate-pulse" /></div></SiteShell>;
  if (!account) return <SiteShell><div className="container-shell py-8"><Card className="mx-auto max-w-xl p-8 text-center"><h1 className="text-2xl font-black">Profilə daxil olun</h1><Button className="mt-5" onClick={() => router.push("/giris")}>Giriş</Button></Card></div></SiteShell>;

  return (
    <SiteShell>
      <div className="container-shell min-w-0 py-6 md:py-8">
        <div className="mb-6"><h1 className="text-3xl font-black">İstifadəçi kabineti</h1><p className="mt-2 text-muted">Elanlar, mesajlar, mağaza, balans və təhlükəsizlik idarəetməsi.</p></div>
        <div className="grid min-w-0 gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
          <Card className="hidden h-fit p-3 lg:block">{menu.map(([label, Icon]) => <button className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${activeMenu === label ? "bg-primary text-white" : "hover:bg-primary-soft/60"}`} key={label} onClick={() => void handleMenu(label)} type="button"><Icon className="h-4 w-4" />{label}</button>)}</Card>
          <section className="min-w-0 space-y-5">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:hidden">{menu.slice(0, 14).map(([label]) => <button className={`shrink-0 rounded-full border px-3 py-2 text-sm ${activeMenu === label ? "border-primary bg-primary text-white" : "border-border bg-card"}`} key={label} onClick={() => void handleMenu(label)} type="button">{label}</button>)}</div>
            {activeMenu !== "Ümumi məlumat" ? <ProfileOverview activeCount={activeItems.length} balance={balance} messageCount={messageCount} phoneClicks={phoneClicks} /> : null}
            {content()}
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
