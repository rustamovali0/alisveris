import Image from "next/image";
import Link from "next/link";
import { Crown, Gem, MapPin, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/marketplace";

type ListingCardProps = {
  listing: Listing;
  compact?: boolean;
};

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  return (
    <Link href={`/elan/${listing.slug}`} className="block h-full">
      <Card className="group flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex gap-1.5">
            {listing.isPremium ? (
              <Badge tone="amber">
                <Gem className="h-3.5 w-3.5" />
                Premium
              </Badge>
            ) : null}
            {listing.isVip ? (
              <Badge tone="purple">
                <Crown className="h-3.5 w-3.5" />
                VIP
              </Badge>
            ) : null}
          </div>
          <FavoriteButton
            listingId={listing.id}
            className="absolute right-2 top-2 border-white/60"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-bold text-primary-dark dark:text-purple-100">
              {formatCurrency(listing.price)}
            </p>
            {listing.sellerType === "store" ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Mağaza
              </span>
            ) : null}
          </div>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">
            {listing.title}
          </h3>
          <p className="text-[11px] font-semibold text-muted">Elan № {listing.listingNumber}</p>
          {!compact ? (
            <div className="flex flex-wrap gap-1.5 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {listing.city}
              </span>
              <span>{listing.date}</span>
              {listing.delivery ? (
                <span className="inline-flex items-center gap-1 text-success">
                  <Truck className="h-3.5 w-3.5" />
                  Çatdırılma
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
