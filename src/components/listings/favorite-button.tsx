"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/favorites-store";

type FavoriteButtonProps = {
  listingId: string;
  className?: string;
};

export function FavoriteButton({ listingId, className }: FavoriteButtonProps) {
  const toggle = useFavoritesStore((state) => state.toggle);
  const isFavorite = useFavoritesStore((state) => state.has(listingId));

  return (
    <Button
      aria-label="Seçilmişlərə əlavə et"
      className={cn(
        "bg-white/95 text-slate-700 hover:bg-white",
        isFavorite && "text-danger",
        className,
      )}
      size="icon"
      type="button"
      variant="secondary"
      onClick={(event) => {
        event.preventDefault();
        toggle(listingId);
      }}
    >
      <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
    </Button>
  );
}
