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
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden pb-16 md:pb-0">
      <AdBanners />
      <Header />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
