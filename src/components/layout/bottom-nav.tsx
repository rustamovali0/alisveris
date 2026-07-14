"use client";

import Link from "next/link";
import { Heart, Home, MessageCircle, PlusCircle, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "Ana səhifə", icon: Home },
  { href: "/elanlar", label: "Axtarış", icon: PlusCircle },
  { href: "/secilmisler", label: "Seçilmiş", icon: Heart },
  { href: "/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: UserRound },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
