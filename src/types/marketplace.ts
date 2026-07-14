import type { LucideIcon } from "lucide-react";

export type ListingCondition = "new" | "used";
export type SellerType = "individual" | "store";
export type ListingStatus =
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "expired"
  | "sold"
  | "disabled";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  subcategories: string[];
  accent: string;
};

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryTreeNode[];
};

export type Listing = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: "AZN";
  city: string;
  district: string;
  date: string;
  category: string;
  subcategory: string;
  condition: ListingCondition;
  sellerType: SellerType;
  sellerName: string;
  storeName?: string;
  isPremium: boolean;
  isVip?: boolean;
  delivery: boolean;
  image: string;
  images: string[];
  views: number;
  favorites: number;
  phone: string;
  whatsapp: string;
  description: string;
  attributes: Record<string, string>;
};

export type Store = {
  id: string;
  name: string;
  slug: string;
  category: string;
  logo: string;
  city: string;
  listingsCount: number;
  rating: number;
  verified: boolean;
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
};
