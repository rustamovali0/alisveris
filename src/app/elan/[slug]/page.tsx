import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContactActions, MobileContactBar } from "@/components/listings/contact-actions";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingCard } from "@/components/listings/listing-card";
import { SiteShell } from "@/components/layout/site-shell";
import { listings, sellerRatingSummary } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

type ListingDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);

  if (!listing) {
    return {
      title: "Elan tapılmadı",
    };
  }

  return {
    title: listing.title,
    description: listing.description,
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: [listing.image],
      type: "article",
    },
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);

  if (!listing) {
    notFound();
  }

  const related = listings
    .filter((item) => item.category === listing.category && item.id !== listing.id)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    image: listing.images,
    description: listing.description,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
      areaServed: listing.city,
    },
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-shell py-6">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
          <Link href="/">Ana səhifə</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/elanlar">Elanlar</Link>
          <ChevronRight className="h-4 w-4" />
          <span>{listing.category}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <ListingGallery images={listing.images} title={listing.title} />

            <Card className="p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                {listing.isPremium ? <Badge tone="amber">Premium</Badge> : null}
                <Badge tone={listing.condition === "new" ? "green" : "slate"}>
                  {listing.condition === "new" ? "Yeni" : "İkinci əl"}
                </Badge>
                {listing.delivery ? (
                  <Badge tone="green">
                    <Truck className="h-3.5 w-3.5" />
                    Çatdırılma
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-3xl font-black leading-tight">{listing.title}</h1>
              <p className="mt-3 text-3xl font-black text-primary-dark dark:text-purple-100">
                {formatCurrency(listing.price)}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2 lg:grid-cols-4">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {listing.city}, {listing.district}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(listing.date)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {listing.views} baxış
                </span>
                <span className="inline-flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Elan № {listing.id.replace("lst-", "")}
                </span>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-xl font-black">Təsvir</h2>
              <p className="mt-3 leading-7 text-muted">{listing.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(listing.attributes).map(([key, value]) => (
                  <div
                    className="flex items-center justify-between rounded-lg bg-background p-3 text-sm"
                    key={key}
                  >
                    <span className="text-muted">{key}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-xl font-black">Xəritə və ünvan</h2>
              <p className="mt-2 text-sm text-muted">
                {listing.city}, {listing.district}. Dəqiq ünvan satıcı ilə əlaqədən
                sonra paylaşılır.
              </p>
              <div className="mt-4 grid h-56 place-items-center rounded-lg border border-dashed border-border bg-background text-sm text-muted">
                Xəritə inteqrasiyası üçün hazır placeholder
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">Oxşar elanlar</h2>
                <Link className="text-sm font-semibold text-primary" href="/elanlar">
                  Daha çox
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(related.length ? related : listings.slice(0, 4)).map((item) => (
                  <ListingCard compact key={item.id} listing={item} />
                ))}
              </div>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card className="sticky top-24 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">Satıcı</p>
                  <h2 className="text-xl font-black">{listing.storeName ?? listing.sellerName}</h2>
                  <p className="mt-1 text-sm text-muted">{listing.sellerName}</p>
                </div>
                {listing.sellerType === "store" ? (
                  <Badge tone="green">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Təsdiqli
                  </Badge>
                ) : null}
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-background p-3">
                  <p className="text-muted">Reytinq</p>
                  <p className="mt-1 inline-flex items-center gap-1 font-black">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    {sellerRatingSummary.rating}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-3">
                  <p className="text-muted">Aktiv elan</p>
                  <p className="mt-1 font-black">
                    {sellerRatingSummary.activeListings}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-3">
                  <p className="text-muted">Cavab müddəti</p>
                  <p className="mt-1 font-black">{sellerRatingSummary.responseTime}</p>
                </div>
                <div className="rounded-lg bg-background p-3">
                  <p className="text-muted">Son görülmə</p>
                  <p className="mt-1 font-black">{sellerRatingSummary.lastSeen}</p>
                </div>
              </div>
              <ContactActions
                listingId={listing.id}
                phone={listing.phone}
                whatsapp={listing.whatsapp}
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button type="button" variant="ghost">
                  <Heart className="h-4 w-4" />
                  Seçilmiş
                </Button>
                <Button type="button" variant="ghost">
                  <AlertTriangle className="h-4 w-4" />
                  Şikayət et
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
      <MobileContactBar
        listingId={listing.id}
        phone={listing.phone}
        whatsapp={listing.whatsapp}
      />
    </SiteShell>
  );
}
