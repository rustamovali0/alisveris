"use client";

import Link from "next/link";
import { Heart, Home, MessageCircle, Plus, UserRound } from "lucide-react";
import { useAccount } from "@/components/providers/account-provider";

export function BottomNav() {
  const { account } = useAccount();
  const listingHref = !account
    ? "/giris"
    : account.accountType === "store" && !account.store
      ? "/magaza-yarat"
      : "/elan-yerlesdir";
  const items = [
    { href: "/", label: "Əsas", icon: Home },
    { href: "/secilmisler", label: "Seçilmişlər", icon: Heart },
    { href: listingHref, label: "Yeni elan", icon: Plus, primary: true },
    { href: account ? "/mesajlar" : "/giris", label: "Mesajlar", icon: MessageCircle },
    { href: account ? "/profil" : "/giris", label: "Kabinet", icon: UserRound },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
      data-testid="mobile-bottom-nav"
    >
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className="relative min-w-0 flex flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-semibold text-muted"
          >
            <span className={item.primary ? "relative z-10 -mt-7 grid h-12 w-12 shrink-0 place-items-center rounded-full border-4 border-card bg-primary text-white shadow-lg" : ""}>
              <item.icon className="h-5 w-5" />
            </span>
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
