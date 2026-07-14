import type { Metadata } from "next";
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
      <ListingsBrowser />
    </SiteShell>
  );
}
