import Link from "next/link";
import { AtSign, Rss, Send, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  "Haqqımızda",
  "Əlaqə",
  "İstifadə qaydaları",
  "Məxfilik siyasəti",
  "Təhlükəsizlik",
  "Reklam",
  "Mağaza hesabı",
  "Dəstək",
  "Tez-tez verilən suallar",
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card pb-20 md:pb-0">
      <div className="container-shell grid gap-8 py-10 lg:grid-cols-[1.2fr_2fr_1fr]">
        <div>
          <Link href="/" className="text-2xl font-black">
            alışveriş.az
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Azərbaycan üçün təhlükəsiz, sürətli və müasir elan platforması.
            Fərdi satıcılar, mağazalar və biznes hesabları üçün vahid bazar.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {links.map((link) => (
            <Link
              className="text-sm text-muted transition hover:text-primary"
              href="#"
              key={link}
            >
              {link}
            </Link>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold">Mobil tətbiq</p>
          <Button className="mt-3 w-full justify-start" variant="secondary">
            <Smartphone className="h-4 w-4" />
            Tezliklə App Store və Google Play
          </Button>
          <div className="mt-4 flex gap-2">
            {[AtSign, Share2, Send, Rss].map((Icon, index) => (
              <Button
                aria-label="Sosial şəbəkə"
                key={index}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <div className="container-shell text-sm text-muted">
          © 2026 alışveriş.az. Bütün hüquqlar qorunur.
        </div>
      </div>
    </footer>
  );
}
