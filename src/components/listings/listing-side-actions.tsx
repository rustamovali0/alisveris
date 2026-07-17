"use client";

import { AlertTriangle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showSweetAlert, showSweetToast } from "@/lib/sweet-alert";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/favorites-store";

export function ListingSideActions({ listingId }: { listingId: string }) {
  const has = useFavoritesStore((state) => state.has);
  const toggle = useFavoritesStore((state) => state.toggle);
  const selected = has(listingId);

  function toggleFavorite() {
    toggle(listingId);
    void showSweetToast(
      selected ? "Seçilmişlərdən silindi" : "Seçilmişlərə əlavə edildi",
      "success",
    );
  }

  function sendComplaint() {
    void showSweetAlert(
      "Şikayət göndərildi",
      "Moderasiya komandası elanı yoxlayacaq.",
      "success",
    );
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Button
        className={cn(selected && "border-primary bg-primary-soft text-primary-dark")}
        type="button"
        variant="ghost"
        onClick={toggleFavorite}
      >
        <Heart className={cn("h-4 w-4", selected && "fill-current")} />
        Seçilmiş
      </Button>
      <Button type="button" variant="ghost" onClick={sendComplaint}>
        <AlertTriangle className="h-4 w-4" />
        Şikayət et
      </Button>
    </div>
  );
}
