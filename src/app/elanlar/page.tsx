import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { ListingsBrowser } from "@/components/listings/listings-browser";

export const metadata: Metadata = {
  title: "Elanlar",
  description:
    "alışveriş.az elan kataloqu. Kateqoriya, qiymət, şəhər, satıcı növü və çatdırılma üzrə filterlə.",
};

export default function ListingsPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="container-shell py-8">Elanlar yüklənir...</div>}>
        <ListingsBrowser />
      </Suspense>
    </SiteShell>
  );
}
