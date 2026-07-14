import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { FavoritesContent } from "@/components/listings/favorites-content";

export const metadata: Metadata = {
  title: "Seçilmiş elanlar",
};

export default function FavoritesPage() {
  return (
    <SiteShell>
      <div className="container-shell py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black">Seçilmiş elanlar</h1>
          <p className="mt-2 text-muted">
            Login olmayan istifadəçi üçün localStorage, login olduqda Supabase ilə
            sinxronizasiya.
          </p>
        </div>
        <FavoritesContent />
      </div>
    </SiteShell>
  );
}
