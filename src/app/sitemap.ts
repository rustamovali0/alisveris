import type { MetadataRoute } from "next";
import { categories, listings, stores } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://alisveris.az";

  return [
    "",
    "/elanlar",
    "/elan-yerlesdir",
    "/profil",
    "/mesajlar",
    "/secilmisler",
    ...categories.map((category) => `/elanlar/${category.slug}`),
    ...listings.map((listing) => `/elan/${listing.slug}`),
    ...stores.map((store) => `/magaza/${store.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/elan/") ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
