"use client";

import { useMemo, useState } from "react";
import {
  Filter,
  Grid2X2,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/listings/listing-card";
import { categories, cities, listings } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const sortOptions = [
  "Ən yeni",
  "Ən ucuz",
  "Ən bahalı",
  "Ən çox baxılan",
  "Premium elanlar",
];

function FilterPanel() {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-bold">Kateqoriya</label>
        <select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm">
          <option>Bütün kateqoriyalar</option>
          {categories.map((category) => (
            <option key={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-bold">Alt kateqoriya</label>
        <select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm">
          <option>Hamısı</option>
          {categories
            .flatMap((category) => category.subcategories)
            .slice(0, 14)
            .map((subcategory) => (
              <option key={subcategory}>{subcategory}</option>
            ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-bold">Qiymət aralığı</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input placeholder="min" inputMode="numeric" />
          <Input placeholder="max" inputMode="numeric" />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold">Şəhər və rayon</label>
        <select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm">
          <option>Bütün şəhərlər</option>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        {[
          "Yeni məhsullar",
          "İkinci əl",
          "Fərdi satıcı",
          "Mağaza",
          "Çatdırılma var",
          "Yalnız şəkilli elanlar",
          "Premium elanlar",
        ].map((item) => (
          <label
            className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"
            key={item}
          >
            <input className="h-4 w-4 accent-primary" type="checkbox" />
            {item}
          </label>
        ))}
      </div>
      <div>
        <label className="text-sm font-bold">Tarix</label>
        <select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm">
          <option>Bütün tarixlər</option>
          <option>Bu gün</option>
          <option>Son 3 gün</option>
          <option>Son həftə</option>
        </select>
      </div>
    </div>
  );
}

export function ListingsBrowser() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState(sortOptions[0]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const sortedListings = useMemo(() => {
    const copy = [...listings];

    if (sort === "Ən ucuz") {
      return copy.sort((a, b) => a.price - b.price);
    }

    if (sort === "Ən bahalı") {
      return copy.sort((a, b) => b.price - a.price);
    }

    if (sort === "Ən çox baxılan") {
      return copy.sort((a, b) => b.views - a.views);
    }

    if (sort === "Premium elanlar") {
      return copy.sort((a, b) => Number(b.isPremium) - Number(a.isPremium));
    }

    return copy.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  }, [sort]);

  const activeFilters = ["Bakı", "Premium elanlar", "Çatdırılma var"];

  return (
    <div className="container-shell py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Elanlar</h1>
        <p className="mt-2 text-muted">
          Axtarış, filterlər, sıralama və görünüş rejimləri ilə elan kataloqu.
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card p-3">
        <div className="grid gap-2 lg:grid-cols-[1fr_190px_150px]">
          <Input placeholder="Elan adı, təsvir, marka və ya mağaza" type="search" />
          <select className="h-11 rounded-lg border border-border bg-card px-3 text-sm">
            <option>Bakı</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
          <Button>Axtar</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <button
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted"
            key={filter}
            type="button"
          >
            {filter}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
        <button className="text-sm font-semibold text-primary" type="button">
          Hamısını sil
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-4">
            <div className="mb-4 flex items-center gap-2 font-black">
              <Filter className="h-5 w-5" />
              Filterlər
            </div>
            <FilterPanel />
          </Card>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {sortedListings.length} elan göstərilir
            </p>
            <div className="flex items-center gap-2">
              <Button
                className="lg:hidden"
                type="button"
                variant="secondary"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
              <select
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <div className="hidden rounded-lg border border-border bg-card p-1 sm:flex">
                <Button
                  aria-label="Grid görünüş"
                  size="icon"
                  type="button"
                  variant={view === "grid" ? "primary" : "ghost"}
                  onClick={() => setView("grid")}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  aria-label="List görünüş"
                  size="icon"
                  type="button"
                  variant={view === "list" ? "primary" : "ghost"}
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div
            className={cn(
              view === "grid"
                ? "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                : "grid gap-3",
            )}
          >
            {sortedListings.map((listing) =>
              view === "grid" ? (
                <ListingCard listing={listing} key={listing.id} />
              ) : (
                <Card
                  className="grid overflow-hidden sm:grid-cols-[220px_1fr]"
                  key={listing.id}
                >
                  <ListingCard listing={listing} compact />
                  <div className="p-4">
                    <p className="text-xl font-black">
                      {formatCurrency(listing.price)}
                    </p>
                    <h2 className="mt-2 text-lg font-bold">{listing.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                      {listing.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                      <span>{listing.city}</span>
                      <span>{listing.category}</span>
                      <span>{listing.views} baxış</span>
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="secondary">Növbəti səhifə</Button>
          </div>
        </section>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-black">
                <Filter className="h-5 w-5" />
                Filterlər
              </div>
              <Button
                aria-label="Bağla"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FilterPanel />
            <Button className="mt-5 w-full" onClick={() => setMobileFiltersOpen(false)}>
              Nəticələri göstər
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
