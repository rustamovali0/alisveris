import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { ListingWizard } from "@/features/listing-wizard/listing-wizard";

export const metadata: Metadata = {
  title: "Elan yerləşdir",
  description:
    "alışveriş.az elan yerləşdirmə wizard-ı. Kateqoriya, məhsul məlumatları, şəkillər, əlaqə və paket seçimi.",
};

export default function CreateListingPage() {
  return (
    <SiteShell>
      <div className="container-shell py-8">
        <ListingWizard />
      </div>
    </SiteShell>
  );
}
