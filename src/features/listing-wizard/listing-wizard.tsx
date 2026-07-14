"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  MapPin,
  PackageCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { categories, cities } from "@/lib/mock-data";
import { listingDraftSchema, type ListingDraftInput } from "@/schemas/listing";

const steps = [
  "Kateqoriya",
  "Məhsul məlumatları",
  "Şəkillər",
  "Əlaqə",
  "Paket",
  "Ön baxış",
];

const defaultValues: ListingDraftInput = {
  category: "Telefonlar",
  subcategory: "Apple",
  title: "iPhone 15 Pro Max 256GB",
  description:
    "Məhsul ideal vəziyyətdədir. Bütün funksiyaları işləkdir, sənədləri və qutusu mövcuddur.",
  price: 2190,
  currency: "AZN",
  condition: "used",
  brand: "Apple",
  model: "iPhone 15 Pro Max",
  color: "Natural Titanium",
  delivery: true,
  city: "Bakı",
  district: "Nərimanov",
  address: "",
  contactName: "Rauf Məmmədov",
  phone: "0501234567",
  email: "seller@example.com",
  whatsapp: "0501234567",
  package: "premium",
  acceptedRules: true,
};

export function ListingWizard() {
  const [step, setStep] = useState(0);
  const form = useForm<ListingDraftInput>({
    resolver: zodResolver(listingDraftSchema),
    defaultValues,
    mode: "onBlur",
  });

  const selectedCategory = form.watch("category");
  const currentCategory = useMemo(
    () => categories.find((category) => category.name === selectedCategory) ?? categories[0],
    [selectedCategory],
  );

  useEffect(() => {
    const rawDraft = window.localStorage.getItem("alisveris-listing-draft");
    if (rawDraft) {
      form.reset({ ...defaultValues, ...JSON.parse(rawDraft) });
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      window.localStorage.setItem("alisveris-listing-draft", JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [form]);

  async function submit(values: ListingDraftInput) {
    const parsed = listingDraftSchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    console.info("listing_publish_requested", parsed.data);
    window.localStorage.removeItem("alisveris-listing-draft");
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit p-4">
        <div className="space-y-2">
          {steps.map((label, index) => (
            <button
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                step === index ? "bg-primary text-white" : "hover:bg-primary-soft/60"
              }`}
              key={label}
              type="button"
              onClick={() => setStep(index)}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 font-bold">
                {index + 1}
              </span>
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5">
          <p className="text-sm font-semibold text-primary">
            Addım {step + 1} / {steps.length}
          </p>
          <h1 className="mt-1 text-2xl font-black">{steps[step]}</h1>
        </div>

        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-sm font-bold">Kateqoriya</span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
                {...form.register("category")}
              >
                {categories.map((category) => (
                  <option key={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold">Alt kateqoriya</span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
                {...form.register("subcategory")}
              >
                {currentCategory.subcategories.map((subcategory) => (
                  <option key={subcategory}>{subcategory}</option>
                ))}
              </select>
            </label>
            <div className="md:col-span-2 rounded-lg bg-background p-4">
              <p className="font-bold">Dinamik sahələr</p>
              <p className="mt-1 text-sm text-muted">
                Seçilən kateqoriyaya görə marka, model, yaddaş, yürüş, otaq sayı
                kimi xüsusi atributlar göstərilir.
              </p>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-sm font-bold">Elanın adı</span>
              <Input className="mt-2" {...form.register("title")} />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-bold">Təsvir</span>
              <textarea
                className="mt-2 min-h-36 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                {...form.register("description")}
              />
            </label>
            <label>
              <span className="text-sm font-bold">Qiymət</span>
              <Input
                className="mt-2"
                inputMode="numeric"
                {...form.register("price", { valueAsNumber: true })}
              />
            </label>
            <label>
              <span className="text-sm font-bold">Vəziyyət</span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
                {...form.register("condition")}
              >
                <option value="new">Yeni</option>
                <option value="used">İkinci əl</option>
              </select>
            </label>
            <Input placeholder="Marka" {...form.register("brand")} />
            <Input placeholder="Model" {...form.register("model")} />
            <Input placeholder="Rəng" {...form.register("color")} />
            <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
              <input className="h-4 w-4 accent-primary" type="checkbox" {...form.register("delivery")} />
              Çatdırılma mümkündür
            </label>
            <label>
              <span className="text-sm font-bold">Şəhər</span>
              <select
                className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
                {...form.register("city")}
              >
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
            <Input placeholder="Rayon" {...form.register("district")} />
            <label className="md:col-span-2">
              <span className="text-sm font-bold">Ünvan və xəritədən seçim</span>
              <Input className="mt-2" placeholder="Ünvan" {...form.register("address")} />
              <div className="mt-3 grid h-40 place-items-center rounded-lg border border-dashed border-border bg-background text-sm text-muted">
                <MapPin className="mb-2 h-5 w-5" />
                Xəritə seçimi üçün hazır sahə
              </div>
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <div className="grid min-h-64 place-items-center rounded-lg border-2 border-dashed border-border bg-background p-8 text-center">
              <div>
                <UploadCloud className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 font-bold">Şəkilləri buraya sürüklə</p>
                <p className="mt-1 text-sm text-muted">
                  Maksimum 15 şəkil, WebP/JPG/PNG, progress bar və MIME validation.
                </p>
                <Button className="mt-4" type="button" variant="secondary">
                  <ImagePlus className="h-4 w-4" />
                  Fayl seç
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  className="grid aspect-square place-items-center rounded-lg border border-border bg-background text-xs text-muted"
                  key={index}
                >
                  {index === 0 ? "Əsas şəkil" : "Boş slot"}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Ad" {...form.register("contactName")} />
            <Input placeholder="Telefon" {...form.register("phone")} />
            <Input placeholder="E-poçt" {...form.register("email")} />
            <Input placeholder="WhatsApp nömrəsi" {...form.register("whatsapp")} />
            <div className="md:col-span-2 grid gap-2 sm:grid-cols-3">
              {["Telefon", "Mesaj", "WhatsApp"].map((method) => (
                <label
                  className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"
                  key={method}
                >
                  <input className="h-4 w-4 accent-primary" name="contactMethod" type="radio" />
                  {method}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["free", "Pulsuz", "Standart görünmə"],
              ["premium", "Premium", "Daha çox görünmə"],
              ["vip", "VIP", "Ana səhifədə vurğu"],
              ["boost", "İrəli çək", "Axtarışda yuxarı"],
            ].map(([value, title, description]) => (
              <label
                className="rounded-lg border border-border p-4 transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft/60"
                key={value}
              >
                <input
                  className="sr-only"
                  type="radio"
                  value={value}
                  {...form.register("package")}
                />
                <PackageCheck className="h-6 w-6 text-primary" />
                <p className="mt-3 font-black">{title}</p>
                <p className="mt-1 text-sm text-muted">{description}</p>
              </label>
            ))}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="rounded-lg bg-background p-4">
              <Badge tone="amber">Ön baxış</Badge>
              <h2 className="mt-3 text-2xl font-black">{form.watch("title")}</h2>
              <p className="mt-2 text-3xl font-black text-primary">
                {form.watch("price")} AZN
              </p>
              <p className="mt-3 leading-7 text-muted">{form.watch("description")}</p>
            </div>
            <div className="space-y-3">
              <label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
                <input
                  className="mt-1 h-4 w-4 accent-primary"
                  type="checkbox"
                  {...form.register("acceptedRules")}
                />
                Qaydaları və məxfilik şərtlərini qəbul edirəm.
              </label>
              <Button className="w-full" type="submit">
                <Check className="h-4 w-4" />
                Elanı dərc et
              </Button>
            </div>
          </div>
        ) : null}

        {Object.values(form.formState.errors).length ? (
          <div className="mt-5 rounded-lg border border-danger/30 bg-red-50 p-3 text-sm text-danger">
            Formda düzəldilməli sahələr var. Zəhmət olmasa məlumatları yoxlayın.
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Button
            disabled={step === 0}
            type="button"
            variant="secondary"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Geri
          </Button>
          <Button
            disabled={step === steps.length - 1}
            type="button"
            onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
          >
            İrəli
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </form>
  );
}
