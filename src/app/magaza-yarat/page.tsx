import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { StoreSetup } from "@/components/stores/store-setup";

export const metadata: Metadata = { title: "Mağaza yarat" };

export default function CreateStorePage() {
  return (
    <SiteShell>
      <StoreSetup />
    </SiteShell>
  );
}
