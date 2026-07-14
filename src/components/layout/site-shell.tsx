import type { ReactNode } from "react";
import { AdBanners } from "@/components/layout/ad-banners";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdBanners />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
