"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listings } from "@/lib/mock-data";
import { useFavoritesStore } from "@/stores/favorites-store";

export function FavoritesContent() {
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const favorites = listings.filter((listing) => favoriteIds.includes(listing.id));

  if (!favorites.length) {
    return (
      <Card className="grid min-h-96 place-items-center p-8 text-center">
        <div>
          <Heart className="mx-auto h-12 w-12 text-muted" />
          <h2 className="mt-4 text-2xl font-black">Seçilmiş elan yoxdur</h2>
          <p className="mt-2 text-muted">
            Bəyəndiyiniz elanları ürək ikonuna basaraq saxlayın, sonra burada
            görünəcək.
          </p>
          <Button asChild className="mt-5">
            <Link href="/elanlar">Elanlara bax</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {favorites.map((listing) => (
        <ListingCard listing={listing} key={listing.id} />
      ))}
    </div>
  );
}
