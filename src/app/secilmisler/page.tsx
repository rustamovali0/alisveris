import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listings } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Seçilmiş elanlar",
};

export default function FavoritesPage() {
  const favorites = listings.filter((listing) => listing.isPremium).slice(0, 4);

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
        {favorites.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {favorites.map((listing) => (
              <ListingCard listing={listing} key={listing.id} />
            ))}
          </div>
        ) : (
          <Card className="grid min-h-96 place-items-center p-8 text-center">
            <div>
              <Heart className="mx-auto h-12 w-12 text-muted" />
              <h2 className="mt-4 text-2xl font-black">Seçilmiş elan yoxdur</h2>
              <p className="mt-2 text-muted">
                Bəyəndiyiniz elanları saxlayın, qiymət düşəndə bildiriş alın.
              </p>
              <Button className="mt-5">Elanlara bax</Button>
            </div>
          </Card>
        )}
      </div>
    </SiteShell>
  );
}
