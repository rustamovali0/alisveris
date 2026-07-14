import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListingCard } from "@/components/listings/listing-card";
import { listings, premiumListings, stores } from "@/lib/mock-data";

export function PremiumListings() {
  return (
    <section className="container-shell py-5 md:py-10">
      <div className="mb-3 flex items-center justify-between md:hidden">
        <h2 className="text-base font-black">Premium elanlar</h2>
        <Link className="text-xs font-semibold underline" href="/elanlar?premium=true">Son elanlar</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {premiumListings.concat(listings.filter((item) => !item.isPremium)).slice(0, 4).map((listing) => (
          <ListingCard listing={listing} key={`mobile-${listing.id}`} />
        ))}
      </div>
      <div className="mb-5 hidden items-end justify-between md:flex">
        <div>
          <Badge tone="amber">Premium elanlar</Badge>
          <h2 className="mt-2 text-2xl font-black">Daha çox görünən təkliflər</h2>
        </div>
        <Button asChild variant="secondary">
          <Link href="/elanlar?premium=true">Hamısı</Link>
        </Button>
      </div>
      <div className="scrollbar-hide hidden gap-4 overflow-x-auto pb-2 md:flex">
        {premiumListings.map((listing) => (
          <div className="w-[260px] shrink-0" key={listing.id}>
            <ListingCard listing={listing} compact />
          </div>
        ))}
      </div>
    </section>
  );
}

export function LatestListings() {
  return (
    <section className="container-shell py-6 md:py-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">Son elanlar</h2>
          <p className="mt-1 text-sm text-muted">
            Desktopda 5, tabletdə 3, mobil cihazlarda 2 sütun.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/elanlar">Daha çox bax</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {listings.map((listing) => (
          <ListingCard listing={listing} key={listing.id} />
        ))}
      </div>
    </section>
  );
}

export function StoreShowcase() {
  return (
    <section className="container-shell hidden py-10 md:block">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">Təsdiqlənmiş mağazalar</h2>
          <p className="mt-1 text-sm text-muted">
            Mağaza hesabları, izləmə və paket sistemi üçün hazır səth.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/elanlar?seller=store">Mağazalar</Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stores.map((store) => (
          <Card className="p-4" key={store.id}>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-border bg-primary-soft text-sm font-black text-primary-dark">
                {store.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold">{store.name}</h3>
                  {store.verified ? (
                    <ShieldCheck className="h-4 w-4 text-success" />
                  ) : null}
                </div>
                <p className="text-xs text-muted">
                  {store.category} · {store.city}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>{store.listingsCount} elan</span>
              <span className="inline-flex items-center gap-1 font-semibold text-warning">
                <Star className="h-4 w-4 fill-current" />
                {store.rating}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
