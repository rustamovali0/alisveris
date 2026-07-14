import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type AdminListingItem = {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
};

export type AdminUserItem = {
  id: string;
  name: string;
  role: string;
  accountType: "individual" | "store";
  status: "aktiv" | "bloklandı";
  ads: string;
};

export type AdminStoreItem = {
  id: string;
  name: string;
  logo: string;
  city: string;
  listingsCount: number;
  rating: number;
  status: "gözləyir" | "təsdiqləndi" | "rədd edildi";
};

export type AdminTransactionItem = {
  id: string;
  product: string;
  status: "pending" | "completed" | "failed" | "refunded";
  amount: string;
  createdAt?: string;
};

export type AdminSnapshot = {
  listings: AdminListingItem[];
  users: AdminUserItem[];
  stores: AdminStoreItem[];
  transactions: AdminTransactionItem[];
  categoryCount: number;
};

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function relationName(value: unknown, fallback: string) {
  if (Array.isArray(value)) return text((value[0] as Row | undefined)?.name, fallback);
  if (value && typeof value === "object") return text((value as Row).name, fallback);
  return fallback;
}

export async function loadAdminSnapshot(): Promise<AdminSnapshot | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = createSupabaseBrowserClient();
  const [listingResult, profileResult, roleResult, storeResult, transactionResult, categoryResult] =
    await Promise.all([
      supabase
        .from("listings")
        .select("id,title,price,status,location_id,seller_id,store_id")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("profiles")
        .select("id,full_name,status,account_type")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("user_roles").select("user_id,roles(name)"),
      supabase
        .from("stores")
        .select("id,name,logo_url,status,verified_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("transactions")
        .select("id,amount,currency,status,created_at,packages(name)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("categories").select("id", { count: "exact", head: true }).is("deleted_at", null),
    ]);

  const firstError = [
    listingResult.error,
    profileResult.error,
    roleResult.error,
    storeResult.error,
    transactionResult.error,
    categoryResult.error,
  ].find(Boolean);
  if (firstError) throw new Error(firstError.message);

  const rolesByUser = new Map<string, string>();
  for (const roleRow of (roleResult.data ?? []) as Row[]) {
    const userId = text(roleRow.user_id);
    const role = relationName(roleRow.roles, "user");
    const current = rolesByUser.get(userId);
    if (!current || role === "super_admin" || role === "admin") rolesByUser.set(userId, role);
  }

  const listingRows = (listingResult.data ?? []) as Row[];
  const profileRows = (profileResult.data ?? []) as Row[];
  const storeRows = (storeResult.data ?? []) as Row[];
  const transactionRows = (transactionResult.data ?? []) as Row[];

  return {
    listings: listingRows.map((row) => ({
      id: text(row.id),
      title: text(row.title, "Adsız elan"),
      city: "Azərbaycan",
      price: Number(row.price) || 0,
      status: text(row.status, "pending"),
    })),
    users: profileRows.map((row) => {
      const id = text(row.id);
      return {
        id,
        name: text(row.full_name, "İstifadəçi"),
        role: rolesByUser.get(id) ?? "user",
        accountType: row.account_type === "store" ? "store" : "individual",
        status: row.status === "blocked" ? "bloklandı" : "aktiv",
        ads: `${listingRows.filter((listing) => listing.seller_id === id).length} elan`,
      };
    }),
    stores: storeRows.map((row) => ({
      id: text(row.id),
      name: text(row.name, "Mağaza"),
      logo: text(row.name, "M").slice(0, 2).toUpperCase(),
      city: "Azərbaycan",
      listingsCount: listingRows.filter((listing) => listing.store_id === row.id).length,
      rating: 0,
      status:
        row.status === "rejected"
          ? "rədd edildi"
          : row.verified_at || row.status === "active"
            ? "təsdiqləndi"
            : "gözləyir",
    })),
    transactions: transactionRows.map((row) => ({
      id: text(row.id),
      product: relationName(row.packages, "Ödəniş"),
      status: ["pending", "completed", "failed", "refunded"].includes(text(row.status))
        ? (text(row.status) as AdminTransactionItem["status"])
        : "failed",
      amount: `${Number(row.amount).toFixed(2)} ${text(row.currency, "AZN")}`,
      createdAt: text(row.created_at),
    })),
    categoryCount: categoryResult.count ?? 0,
  };
}

export async function updateAdminListing(id: string, status: "active" | "rejected") {
  if (!isSupabaseConfigured || !id.includes("-")) return;
  const { error } = await createSupabaseBrowserClient()
    .from("listings")
    .update({ status, published_at: status === "active" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateAdminUser(
  id: string,
  changes: { status?: "active" | "blocked"; account_type?: "individual" | "store" },
) {
  if (!isSupabaseConfigured || !id.includes("-")) return;
  const { error } = await createSupabaseBrowserClient().from("profiles").update(changes).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setAdminUserRole(id: string, role: string) {
  if (!isSupabaseConfigured || !id.includes("-")) return;
  const { error } = await createSupabaseBrowserClient().rpc("admin_set_user_role", {
    target_user: id,
    new_role: role,
  });
  if (error) throw new Error(error.message);
}

export async function updateAdminStore(id: string, status: "active" | "rejected") {
  if (!isSupabaseConfigured || !id.includes("-")) return;
  const { error } = await createSupabaseBrowserClient()
    .from("stores")
    .update({
      status,
      verified_at: status === "active" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateAdminTransaction(id: string, status: "completed" | "refunded") {
  if (!isSupabaseConfigured || !id.includes("-")) return;
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("transactions").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.from("payments").update({ status }).eq("transaction_id", id);
}

export async function createAdminCategory(name: string, slug: string) {
  if (!isSupabaseConfigured) return;
  const { error } = await createSupabaseBrowserClient().from("categories").insert({ name, slug });
  if (error) throw new Error(error.message);
}

export async function saveCloudSiteSettings(value: unknown) {
  if (!isSupabaseConfigured) return;
  const { error } = await createSupabaseBrowserClient()
    .from("system_settings")
    .upsert({ key: "site_settings", value, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
