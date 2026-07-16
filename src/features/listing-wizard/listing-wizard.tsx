"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  PackageCheck,
  Store,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/components/providers/account-provider";
import { categories, cities, metroStations } from "@/lib/mock-data";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { listingDraftSchema, type ListingDraftInput } from "@/schemas/listing";

const steps = [
  "Kateqoriya",
  "Məhsul məlumatları",
  "Şəkillər",
  "Əlaqə",
  "Paket",
  "Ön baxış",
] as const;

const draftStorageKey = "alisveris-listing-draft-v2";

const defaultValues: ListingDraftInput = {
  category: "",
  subcategory: "",
  title: "",
  description: "",
  price: "" as unknown as number,
  currency: "AZN",
  condition: "" as ListingDraftInput["condition"],
  brand: "",
  model: "",
  color: "",
  delivery: false,
  city: "",
  metro: "",
  district: "",
  address: "",
  contactName: "",
  phone: "",
  email: "",
  whatsapp: "",
  package: "free",
  acceptedRules: false,
};

type UploadedImage = {
  id: string;
  name: string;
  url: string;
  file: File;
  isPrimary: boolean;
};

declare global {
  interface Window {
    Swal?: {
      fire: (options: Record<string, unknown>) => Promise<{ isConfirmed?: boolean }>;
    };
  }
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("az")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function safeFileName(value: string) {
  const extension = value.includes(".") ? value.split(".").pop()?.toLowerCase() : "jpg";
  return `${crypto.randomUUID()}.${extension?.replace(/[^a-z0-9]/g, "") || "jpg"}`;
}

function ErrorText({ children }: { children?: string }) {
  return children ? <p className="mt-1 text-sm font-semibold text-danger">{children}</p> : null;
}

export function ListingWizard() {
  const router = useRouter();
  const { account, ready } = useAccount();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ListingDraftInput>({
    resolver: zodResolver(listingDraftSchema),
    defaultValues,
    mode: "onBlur",
  });

  const selectedCategory = form.watch("category");
  const currentCategory = useMemo(
    () => categories.find((category) => category.name === selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(draftStorageKey);
    if (saved) {
      try {
        form.reset({ ...defaultValues, ...JSON.parse(saved) });
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    return () => images.forEach((image) => URL.revokeObjectURL(image.url));
  }, [images]);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const next: UploadedImage[] = [];

    for (const file of Array.from(files).slice(0, 15 - images.length)) {
      if (!allowed.includes(file.type)) {
        setImageError("Yalnız JPG, PNG və WebP şəkillər qəbul olunur.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Hər şəkil maksimum 5 MB ola bilər.");
        return;
      }
      next.push({
        id: crypto.randomUUID(),
        name: file.name,
        file,
        url: URL.createObjectURL(file),
        isPrimary: images.length === 0 && next.length === 0,
      });
    }

    setImages((current) => [...current, ...next].slice(0, 15));
    setImageError("");
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      const next = current.filter((image) => image.id !== id);
      return next.some((image) => image.isPrimary)
        ? next
        : next.map((image, index) => ({ ...image, isPrimary: index === 0 }));
    });
  }

  function setPrimary(id: string) {
    setImages((current) => current.map((image) => ({ ...image, isPrimary: image.id === id })));
  }

  async function showSuccess() {
    if (window.Swal) {
      await window.Swal.fire({
        icon: "success",
        title: "Elan yaradıldı",
        text: "Elan yoxlanış üçün göndərildi və profilinizdə görünəcək.",
        confirmButtonText: "Elanlarıma keç",
        confirmButtonColor: "#6d28d9",
      });
    }
  }

  async function submit(values: ListingDraftInput) {
    if (!account) return;
    if (!images.length) {
      setImageError("Ən azı 1 şəkil əlavə edin.");
      setStep(2);
      return;
    }

    const parsed = listingDraftSchema.safeParse(values);
    if (!parsed.success) return;
    if (!isSupabaseConfigured) {
      setSubmitError("Supabase bağlantısı tapılmadı. Vercel environment dəyişənlərini yoxlayın.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    const supabase = createSupabaseBrowserClient();
    const uploadedPaths: string[] = [];

    try {
      const categorySlug = currentCategory?.slug ?? slugify(parsed.data.category);
      let categoryQuery = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (!categoryQuery.data?.id) {
        categoryQuery = await supabase
          .from("categories")
          .select("id")
          .eq("name", parsed.data.category)
          .maybeSingle();
      }

      if (categoryQuery.error || !categoryQuery.data?.id) {
        throw new Error(`“${parsed.data.category}” kateqoriyası Supabase-də tapılmadı.`);
      }

      let storeId: string | null = null;
      if (account.accountType === "store") {
        const { data: storeRow, error: storeError } = await supabase
          .from("stores")
          .select("id")
          .eq("owner_id", account.id)
          .maybeSingle();
        if (storeError) throw storeError;
        storeId = storeRow?.id ?? null;
      }

      const orderedImages = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
      const uploaded = [] as Array<{ url: string; path: string; isPrimary: boolean }>;

      for (const image of orderedImages) {
        const path = `${account.id}/${safeFileName(image.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, image.file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, path, isPrimary: image.isPrimary });
      }

      const slug = `${slugify(parsed.data.title)}-${crypto.randomUUID().slice(0, 8)}`;
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          seller_id: account.id,
          store_id: storeId,
          category_id: categoryQuery.data.id,
          location_id: null,
          title: parsed.data.title.trim(),
          slug,
          description: parsed.data.description.trim(),
          price: parsed.data.price,
          currency: "AZN",
          condition: parsed.data.condition,
          status: "pending",
          is_premium: parsed.data.package === "premium",
          is_vip: parsed.data.package === "vip",
          delivery_available: parsed.data.delivery,
          phone: parsed.data.phone.trim(),
          whatsapp: parsed.data.whatsapp?.trim() || null,
          address: [parsed.data.city, parsed.data.district, parsed.data.address]
            .filter(Boolean)
            .join(", "),
          created_by: account.id,
        })
        .select("id")
        .single();

      if (listingError || !listing) throw listingError ?? new Error("Elan yaradıla bilmədi.");

      const imageRows = uploaded.map((image, index) => ({
        listing_id: listing.id,
        url: image.url,
        storage_path: image.path,
        is_primary: image.isPrimary || index === 0,
        sort_order: index,
      }));

      const imageInsert = await supabase.from("listing_images").insert(imageRows);
      if (imageInsert.error && imageInsert.error.code !== "42P01") {
        console.warn("listing_images insert failed", imageInsert.error);
      }

      window.localStorage.removeItem(draftStorageKey);
      form.reset(defaultValues);
      images.forEach((image) => URL.revokeObjectURL(image.url));
      setImages([]);
      await showSuccess();
      router.push("/profil");
      router.refresh();
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from("listing-images").remove(uploadedPaths);
      }
      setSubmitError(error instanceof Error ? error.message : "Elan yaradılarkən xəta baş verdi.");
    } finally {
      setSubmitting(false);
    }
  }

  function nextStep() {
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  if (!ready) return <Card className="min-h-72 animate-pulse" />;

  if (!account) {
    return (
      <Card className="mx-auto max-w-2xl p-7 text-center">
        <h1 className="text-2xl font-black">Elan yerləşdirmək üçün daxil olun</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="secondary"><Link href="/giris">Giriş</Link></Button>
          <Button asChild><Link href="/qeydiyyat">Qeydiyyat</Link></Button>
        </div>
      </Card>
    );
  }

  if (account.accountType === "store" && !account.store) {
    return (
      <Card className="mx-auto max-w-2xl p-7 text-center">
        <Store className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-3 text-2xl font-black">Əvvəl mağazanızı yaradın</h1>
        <Button asChild className="mt-6"><Link href="/magaza-yarat">Mağaza yarat</Link></Button>
      </Card>
    );
  }

  return (
    <form className="grid gap-5 lg:grid-cols-[260px_1fr]" onSubmit={form.handleSubmit(submit)} noValidate>
      <Card className="h-fit p-4">
        <div className="space-y-2">
          {steps.map((label, index) => (
            <button
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${step === index ? "bg-primary text-white" : "hover:bg-primary-soft/60"}`}
              key={label}
              type="button"
              onClick={() => setStep(index)}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 font-bold">{index + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5 flex items-center gap-3 rounded-lg bg-primary-soft p-3 text-sm">
          <UserRound className="h-5 w-5 text-primary" />
          <div>
            <p className="font-bold">{account.name}</p>
            <p className="text-xs text-muted">Elan bu istifadəçinin hesabına əlavə ediləcək.</p>
          </div>
        </div>

        <p className="text-sm font-semibold text-primary">Addım {step + 1} / {steps.length}</p>
        <h1 className="mb-5 mt-1 text-2xl font-black">{steps[step]}</h1>

        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-sm font-bold">Kateqoriya</span>
              <select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3" {...form.register("category")}>
                <option value="">Kateqoriya seçin</option>
                {categories.map((category) => <option key={category.slug} value={category.name}>{category.name}</option>)}
              </select>
              <ErrorText>{form.formState.errors.category?.message}</ErrorText>
            </label>
            <label>
              <span className="text-sm font-bold">Alt kateqoriya</span>
              <select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3" disabled={!currentCategory} {...form.register("subcategory")}>
                <option value="">Alt kateqoriya seçin</option>
                {(currentCategory?.subcategories ?? []).map((item) => <option key={item}>{item}</option>)}
              </select>
              <ErrorText>{form.formState.errors.subcategory?.message}</ErrorText>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2"><span className="text-sm font-bold">Elanın adı</span><Input className="mt-2" {...form.register("title")} /><ErrorText>{form.formState.errors.title?.message}</ErrorText></label>
            <label className="md:col-span-2"><span className="text-sm font-bold">Təsvir</span><textarea className="mt-2 min-h-36 w-full rounded-lg border border-border bg-card p-3" {...form.register("description")} /><ErrorText>{form.formState.errors.description?.message}</ErrorText></label>
            <label><span className="text-sm font-bold">Qiymət</span><Input className="mt-2" inputMode="decimal" {...form.register("price", { valueAsNumber: true })} /><ErrorText>{form.formState.errors.price?.message}</ErrorText></label>
            <label><span className="text-sm font-bold">Vəziyyət</span><select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3" {...form.register("condition")}><option value="">Seçin</option><option value="new">Yeni</option><option value="used">İkinci əl</option></select><ErrorText>{form.formState.errors.condition?.message}</ErrorText></label>
            <Input placeholder="Marka" {...form.register("brand")} />
            <Input placeholder="Model" {...form.register("model")} />
            <Input placeholder="Rəng" {...form.register("color")} />
            <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"><input type="checkbox" {...form.register("delivery")} /> Çatdırılma mümkündür</label>
            <label><span className="text-sm font-bold">Şəhər</span><select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3" {...form.register("city")}><option value="">Şəhər seçin</option>{cities.map((city) => <option key={city}>{city}</option>)}</select><ErrorText>{form.formState.errors.city?.message}</ErrorText></label>
            {form.watch("city") === "Bakı" && <label><span className="text-sm font-bold">Metro</span><select className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3" {...form.register("metro")}><option value="">Metro seçin</option>{metroStations.map((metro) => <option key={metro}>{metro}</option>)}</select></label>}
            <Input placeholder="Rayon" {...form.register("district")} />
            <Input className="md:col-span-2" placeholder="Ünvan" {...form.register("address")} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="grid min-h-56 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border bg-background p-8 text-center">
              <div><UploadCloud className="mx-auto h-10 w-10 text-primary" /><p className="mt-3 font-bold">Şəkilləri seçin</p><p className="mt-1 text-sm text-muted">Maksimum 15 şəkil, hər biri 5 MB.</p><span className="mt-4 inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2"><ImagePlus className="h-4 w-4" />Fayl seç</span><input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => addFiles(event.target.files)} /></div>
            </label>
            <ErrorText>{imageError}</ErrorText>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {images.map((image) => (
                <div className="overflow-hidden rounded-lg border border-border" key={image.id}>
                  <div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${image.url})` }} />
                  <div className="grid gap-2 p-2"><p className="truncate text-xs">{image.name}</p><div className="flex gap-1"><Button className="flex-1" size="sm" type="button" variant={image.isPrimary ? "primary" : "secondary"} onClick={() => setPrimary(image.id)}>{image.isPrimary ? "Əsas" : "Əsas et"}</Button><Button aria-label="Sil" size="icon" type="button" variant="danger" onClick={() => removeImage(image.id)}><Trash2 className="h-4 w-4" /></Button></div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="text-sm font-bold">Ad</span><Input className="mt-2" {...form.register("contactName")} /><ErrorText>{form.formState.errors.contactName?.message}</ErrorText></label>
            <label><span className="text-sm font-bold">Telefon</span><Input className="mt-2" {...form.register("phone")} /><ErrorText>{form.formState.errors.phone?.message}</ErrorText></label>
            <label><span className="text-sm font-bold">E-poçt</span><Input className="mt-2" {...form.register("email")} /><ErrorText>{form.formState.errors.email?.message}</ErrorText></label>
            <label><span className="text-sm font-bold">WhatsApp</span><Input className="mt-2" {...form.register("whatsapp")} /><ErrorText>{form.formState.errors.whatsapp?.message}</ErrorText></label>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-3 md:grid-cols-4">
            {[["free", "Pulsuz"], ["premium", "Premium"], ["vip", "VIP"], ["boost", "İrəli çək"]].map(([value, label]) => (
              <label className="rounded-lg border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft/60" key={value}><input className="sr-only" type="radio" value={value} {...form.register("package")} /><PackageCheck className="h-6 w-6 text-primary" /><p className="mt-3 font-black">{label}</p></label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="rounded-lg bg-background p-4"><Badge tone="amber">Ön baxış</Badge><h2 className="mt-3 text-2xl font-black">{form.watch("title")}</h2><p className="mt-2 text-3xl font-black text-primary">{form.watch("price")} AZN</p><p className="mt-3 text-muted">{form.watch("description")}</p></div>
            <div className="space-y-3"><label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm"><input className="mt-1" type="checkbox" {...form.register("acceptedRules")} />Qaydaları və məxfilik şərtlərini qəbul edirəm.</label><ErrorText>{form.formState.errors.acceptedRules?.message}</ErrorText><Button className="w-full" disabled={submitting} type="submit"><Check className="h-4 w-4" />{submitting ? "Dərc edilir..." : "Elanı dərc et"}</Button></div>
          </div>
        )}

        {submitError && <div className="mt-5 rounded-lg border border-danger/30 bg-red-50 p-3 text-sm font-semibold text-danger">{submitError}</div>}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Button disabled={step === 0 || submitting} type="button" variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))}><ChevronLeft className="h-4 w-4" />Geri</Button>
          <Button disabled={step === steps.length - 1 || submitting} type="button" onClick={nextStep}>İrəli<ChevronRight className="h-4 w-4" /></Button>
        </div>
      </Card>
    </form>
  );
}
