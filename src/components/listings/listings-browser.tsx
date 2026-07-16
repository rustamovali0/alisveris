"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Filter, Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { ListingCard } from "@/components/listings/listing-card";
import { categoryTree, cities, listings } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import type { CategoryTreeNode, Listing } from "@/types/marketplace";

const sortOptions = [
  "Ən yeni",
  "Ən ucuz",
  "Ən bahalı",
  "Ən çox baxılan",
  "Premium elanlar",
];

const cityOptions = [
  { label: "Bütün şəhərlər", value: "" },
  ...cities.map((city) => ({ label: city, value: city })),
];

const flags = [
  { key: "newOnly", label: "Yeni məhsullar" },
  { key: "usedOnly", label: "İkinci əl" },
  { key: "individualOnly", label: "Fərdi satıcı" },
  { key: "storeOnly", label: "Mağaza" },
  { key: "deliveryOnly", label: "Çatdırılma var" },
  { key: "withImagesOnly", label: "Yalnız şəkilli elanlar" },
  { key: "premiumOnly", label: "Premium elanlar" },
] as const;

type FlagKey = (typeof flags)[number]["key"];

type Filters = {
  query: string;
  category: string;
  subcategory: string;
  childCategory: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  dateRange: string;
  flags: Record<FlagKey, boolean>;
};

const defaultFlags = flags.reduce(
  (acc, flag) => ({ ...acc, [flag.key]: false }),
  {} as Record<FlagKey, boolean>,
);

function sortListings(items: Listing[], sort: string) {
  const copy = [...items];

  if (sort === "Ən ucuz") return copy.sort((a, b) => a.price - b.price);
  if (sort === "Ən bahalı") return copy.sort((a, b) => b.price - a.price);
  if (sort === "Ən çox baxılan") return copy.sort((a, b) => b.views - a.views);
  if (sort === "Premium elanlar") {
    return copy.sort((a, b) => Number(b.isPremium) - Number(a.isPremium));
  }

  return copy.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

function findCategoryNode(nodes: CategoryTreeNode[], value: string) {
  return nodes.find((node) => node.name === value || node.slug === value);
}

function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategoryTree(node.children ?? [])]);
}

function categoryNameMatches(value: string, listingValue: string) {
  const normalizedValue = value.toLowerCase();
  const normalizedListingValue = listingValue.toLowerCase();

  return (
    normalizedValue === normalizedListingValue ||
    normalizedValue.includes(normalizedListingValue) ||
    normalizedListingValue.includes(normalizedValue)
  );
}

type FilterPanelProps = {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  toggleFlag: (key: FlagKey) => void;
};

function FilterPanel({ filters, setFilter, toggleFlag }: FilterPanelProps) {
  const selectedCategory = findCategoryNode(categoryTree, filters.category);
  const subcategories = selectedCategory
    ? selectedCategory.children ?? []
    : categoryTree.flatMap((category) => category.children ?? []);
  const selectedSubcategory = findCategoryNode(subcategories, filters.subcategory);
  const childCategories = selectedSubcategory?.children ?? [];

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-bold" htmlFor="category-filter">
          Kateqoriya
        </label>
        <CustomSelect
          ariaLabel="Kateqoriya"
          buttonClassName="mt-2 h-11 w-full"
          options={[
            { label: "Bütün kateqoriyalar", value: "" },
            ...categoryTree.map((category) => ({ label: category.name, value: category.name })),
          ]}
          value={filters.category}
          onChange={(value) => {
            setFilter("category", value);
            setFilter("subcategory", "");
            setFilter("childCategory", "");
          }}
        />
      </div>
      <div>
        <label className="text-sm font-bold" htmlFor="subcategory-filter">
          Alt kateqoriya
        </label>
        <CustomSelect
          ariaLabel="Alt kateqoriya"
          buttonClassName="mt-2 h-11 w-full"
          options={[
            { label: "Hamısı", value: "" },
            ...subcategories.map((subcategory) => ({ label: subcategory.name, value: subcategory.name })),
          ]}
          value={filters.subcategory}
          onChange={(value) => {
            setFilter("subcategory", value);
            setFilter("childCategory", "");
          }}
        />
      </div>
      {childCategories.length ? (
        <div>
          <label className="text-sm font-bold" htmlFor="child-category-filter">
            Daxili kateqoriya
          </label>
          <CustomSelect
            ariaLabel="Daxili kateqoriya"
            buttonClassName="mt-2 h-11 w-full"
            options={[
              { label: "Hamısı", value: "" },
              ...childCategories.map((childCategory) => ({ label: childCategory.name, value: childCategory.name })),
            ]}
            value={filters.childCategory}
            onChange={(value) => setFilter("childCategory", value)}
          />
        </div>
      ) : null}
      <div>
        <label className="text-sm font-bold">Qiymət aralığı</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            inputMode="numeric"
            placeholder="min"
            value={filters.minPrice}
            onChange={(event) => setFilter("minPrice", event.target.value)}
          />
          <Input
            inputMode="numeric"
            placeholder="max"
            value={filters.maxPrice}
            onChange={(event) => setFilter("maxPrice", event.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold" htmlFor="city-filter">
          Şəhər və rayon
        </label>
        <CustomSelect
          ariaLabel="Şəhər və rayon"
          buttonClassName="mt-2 h-11 w-full"
          menuClassName="max-h-72"
          options={cityOptions}
          value={filters.city}
          onChange={(value) => setFilter("city", value)}
        />
      </div>
      <div className="grid gap-2">
        {flags.map((item) => (
          <label
            className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm text-foreground"
            key={item.key}
          >
            <input
              checked={filters.flags[item.key]}
              className="h-4 w-4 accent-primary"
              type="checkbox"
              onChange={() => toggleFlag(item.key)}
            />
            {item.label}
          </label>
        ))}
      </div>
      <div>
        <label className="text-sm font-bold" htmlFor="date-filter">
          Tarix
        </label>
        <CustomSelect
          ariaLabel="Tarix"
          buttonClassName="mt-2 h-11 w-full"
          options={[
            { label: "Bütün tarixlər", value: "" },
            { label: "Bu gün", value: "Bu gün" },
            { label: "Son 3 gün", value: "Son 3 gün" },
            { label: "Son həftə", value: "Son həftə" },
          ]}
          value={filters.dateRange}
          onChange={(value) => setFilter("dateRange", value)}
        />
      </div>
    </div>
  );
}

export function ListingsBrowser() {
  const [isHydrated, setIsHydrated] = useState(false);
  const searchParams = useSearchParams();
  const categoryNodes = useMemo(() => flattenCategoryTree(categoryTree), []);
  const categoryParam = searchParams.get("category") ?? "";
  const subcategoryParam = searchParams.get("subcategory") ?? "";
  const childCategoryParam = searchParams.get("child") ?? "";
  const initialCategory =
    findCategoryNode(categoryTree, categoryParam)?.name ?? "";
  const initialSubcategory =
    categoryNodes.find((category) => category.slug === subcategoryParam || category.name === subcategoryParam)
      ?.name ?? "";
  const initialChildCategory =
    categoryNodes.find((category) => category.slug === childCategoryParam || category.name === childCategoryParam)
      ?.name ?? "";
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState(searchParams.get("sort") === "views" ? "Ən çox baxılan" : sortOptions[0]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  const [filters, setFilters] = useState<Filters>(() => ({
    query: searchParams.get("q") ?? "",
    category: initialCategory,
    subcategory: initialSubcategory,
    childCategory: initialChildCategory,
    city: searchParams.get("city") ?? "",
    minPrice: "",
    maxPrice: "",
    dateRange: "",
    flags: {
      ...defaultFlags,
      premiumOnly: searchParams.get("premium") === "true",
      storeOnly: searchParams.get("seller") === "store",
    },
  }));

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleFlag(key: FlagKey) {
    setFilters((current) => ({
      ...current,
      flags: { ...current.flags, [key]: !current.flags[key] },
    }));
  }

  function clearFilter(label: string) {
    if (label.startsWith("min ")) {
      setFilter("minPrice", "");
      return;
    }

    if (label.startsWith("max ")) {
      setFilter("maxPrice", "");
      return;
    }

    const flag = flags.find((item) => item.label === label);
    if (flag) {
      toggleFlag(flag.key);
      return;
    }

    if (label === filters.category) {
      setFilters((current) => ({
        ...current,
        category: "",
        subcategory: "",
        childCategory: "",
      }));
      return;
    }

    if (label === filters.subcategory) {
      setFilters((current) => ({ ...current, subcategory: "", childCategory: "" }));
      return;
    }

    const map: Partial<Record<keyof Filters, string>> = {
      query: filters.query,
      childCategory: filters.childCategory,
      city: filters.city,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      dateRange: filters.dateRange,
    };

    const entry = Object.entries(map).find(([, value]) => value === label);
    if (entry) {
      setFilter(entry[0] as keyof Filters, "" as never);
    }
  }

  function clearAll() {
    setFilters({
      query: "",
      category: "",
      subcategory: "",
      childCategory: "",
      city: "",
      minPrice: "",
      maxPrice: "",
      dateRange: "",
      flags: { ...defaultFlags },
    });
    setSort(sortOptions[0]);
    window.history.replaceState(null, "", "/elanlar");
  }

  const filteredListings = useMemo(() => {
    const min = Number(filters.minPrice) || 0;
    const max = Number(filters.maxPrice) || Number.POSITIVE_INFINITY;
    const query = filters.query.trim().toLowerCase();
    const now = new Date("2026-07-14T00:00:00");
    const selectedSubcategory = categoryNodes.find(
      (category) => category.name === filters.subcategory,
    );
    const descendantSubcategories = selectedSubcategory?.children ?? [];

    const result = listings.filter((listing) => {
      const haystack = [
        listing.title,
        listing.description,
        listing.category,
        listing.subcategory,
        listing.city,
        listing.sellerName,
        listing.storeName ?? "",
        listing.listingNumber,
        ...Object.values(listing.attributes),
      ]
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query)) return false;
      if (filters.category && listing.category !== filters.category) return false;
      if (
        filters.subcategory &&
        listing.subcategory !== filters.subcategory &&
        !descendantSubcategories.some((category) =>
          categoryNameMatches(category.name, listing.subcategory),
        )
      ) {
        return false;
      }
      if (
        filters.childCategory &&
        !categoryNameMatches(filters.childCategory, listing.subcategory)
      ) {
        return false;
      }
      if (filters.city && listing.city !== filters.city) return false;
      if (listing.price < min || listing.price > max) return false;
      if (filters.flags.newOnly && listing.condition !== "new") return false;
      if (filters.flags.usedOnly && listing.condition !== "used") return false;
      if (filters.flags.individualOnly && listing.sellerType !== "individual") return false;
      if (filters.flags.storeOnly && listing.sellerType !== "store") return false;
      if (filters.flags.deliveryOnly && !listing.delivery) return false;
      if (filters.flags.withImagesOnly && listing.images.length === 0) return false;
      if (filters.flags.premiumOnly && !listing.isPremium) return false;

      if (filters.dateRange) {
        const diffDays =
          (now.getTime() - new Date(listing.date).getTime()) / (1000 * 60 * 60 * 24);
        if (filters.dateRange === "Bu gün" && diffDays > 1) return false;
        if (filters.dateRange === "Son 3 gün" && diffDays > 3) return false;
        if (filters.dateRange === "Son həftə" && diffDays > 7) return false;
      }

      return true;
    });

    return sortListings(result, sort);
  }, [categoryNodes, filters, sort]);

  const activeFilters = [
    filters.query,
    filters.category,
    filters.subcategory,
    filters.childCategory,
    filters.city,
    filters.minPrice ? `min ${filters.minPrice}` : "",
    filters.maxPrice ? `max ${filters.maxPrice}` : "",
    filters.dateRange,
    ...flags.filter((flag) => filters.flags[flag.key]).map((flag) => flag.label),
  ].filter(Boolean);

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
          <label className="relative">
            <span className="sr-only">Axtarış</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Elan adı, təsvir, marka və ya mağaza"
              type="search"
              value={filters.query}
              onChange={(event) => setFilter("query", event.target.value)}
            />
          </label>
          <CustomSelect
            ariaLabel="Şəhər"
            buttonClassName="h-11 w-full"
            menuClassName="max-h-72"
            options={cityOptions}
            value={filters.city}
            onChange={(value) => setFilter("city", value)}
          />
          <Button type="button" onClick={() => setMobileFiltersOpen(true)}>
            Axtar
          </Button>
        </div>
      </div>

      <div className="mb-4 flex min-h-9 flex-wrap items-center gap-2">
        {activeFilters.length ? (
          <>
            {activeFilters.map((filter) => (
              <button
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
                key={filter}
                type="button"
                onClick={() => clearFilter(filter)}
              >
                {filter}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              className="text-sm font-semibold text-primary"
              data-testid="clear-all-filters"
              type="button"
              onClick={clearAll}
            >
              Hamısını sil
            </button>
          </>
        ) : (
          <p className="text-sm text-muted">Aktiv filter yoxdur.</p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-4">
            <div className="mb-4 flex items-center gap-2 font-black">
              <Filter className="h-5 w-5" />
              Filterlər
            </div>
            <FilterPanel filters={filters} setFilter={setFilter} toggleFlag={toggleFlag} />
          </Card>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{filteredListings.length} elan göstərilir</p>
            <div className="flex items-center gap-2">
              <Button
                className="lg:hidden"
                data-testid="open-mobile-filters"
                disabled={!isHydrated}
                type="button"
                variant="secondary"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
              <CustomSelect
                ariaLabel="Sıralama"
                buttonClassName="h-10 min-w-40"
                options={sortOptions.map((option) => ({ label: option, value: option }))}
                value={sort}
                onChange={setSort}
              />
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

          {filteredListings.length ? (
            <div
              className={cn(
                view === "grid"
                  ? "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                  : "grid gap-3",
              )}
            >
              {filteredListings.map((listing) =>
                view === "grid" ? (
                  <ListingCard listing={listing} key={listing.id} />
                ) : (
                  <Card
                    className="grid overflow-hidden sm:grid-cols-[220px_1fr]"
                    key={listing.id}
                  >
                    <ListingCard listing={listing} compact />
                    <div className="p-4">
                      <p className="text-xl font-black">{formatCurrency(listing.price)}</p>
                      <Link
                        className="mt-2 block text-lg font-bold hover:text-primary"
                        href={`/elan/${listing.slug}`}
                      >
                        {listing.title}
                      </Link>
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
          ) : (
            <Card className="grid min-h-80 place-items-center p-8 text-center">
              <div>
                <h2 className="text-2xl font-black">Uyğun elan tapılmadı</h2>
                <p className="mt-2 text-muted">
                  Filterləri yüngülləşdirin və ya başqa axtarış sözü yoxlayın.
                </p>
                <Button className="mt-5" type="button" variant="secondary" onClick={clearAll}>
                  Filterləri təmizlə
                </Button>
              </div>
            </Card>
          )}

        </section>
      </div>

      {mobileFiltersOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
          data-testid="mobile-filter-drawer"
        >
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
            <FilterPanel filters={filters} setFilter={setFilter} toggleFlag={toggleFlag} />
            <Button className="mt-5 w-full" onClick={() => setMobileFiltersOpen(false)}>
              Nəticələri göstər
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
