"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ImagePlus,
  MapPin,
  PackageCheck,
  Store,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { categories, cities, metroStations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { listingDraftSchema, type ListingDraftInput } from "@/schemas/listing";
import { useAccount } from "@/components/providers/account-provider";

const steps = [
  "Kateqoriya",
  "Məhsul məlumatları",
  "Şəkillər",
  "Əlaqə",
  "Paket",
  "Ön baxış",
];

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

const examples = {
  title: "iPhone 15 Pro Max 256GB",
  description:
    "Məhsul ideal vəziyyətdədir. Bütün funksiyaları işləkdir, sənədləri və qutusu mövcuddur.",
  price: "2190",
  brand: "Apple",
  model: "iPhone 15 Pro Max",
  color: "Natural Titanium",
  district: "Nərimanov",
  address: "Bakı, Nərimanov rayonu",
  contactName: "Rauf Məmmədov",
  phone: "0501234567",
  email: "seller@example.com",
  whatsapp: "0501234567",
};

type UploadedImage = {
  id: string;
  name: string;
  url: string;
  isPrimary: boolean;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm font-semibold text-danger">{message}</p>;
}

type CustomSelectOption = {
  value: string;
  label: string;
};

function CustomSelect({
  label,
  placeholder,
  value,
  options,
  error,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: CustomSelectOption[];
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <span className="text-sm font-bold">{label}</span>
      <button
        aria-expanded={open}
        className={cn(
          "mt-2 flex h-11 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-left text-sm transition hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
          !selected && "text-muted",
          disabled && "cursor-not-allowed opacity-60",
        )}
        disabled={disabled}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted" />
      </button>
      {open ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-2xl animate-scale-in">
          {options.length ? (
            options.map((option) => (
              <button
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-primary-soft/60",
                  option.value === value && "bg-primary-soft font-bold text-primary-dark",
                )}
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
                {option.value === value ? <Check className="h-4 w-4" /> : null}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted">Əvvəl kateqoriya seçin.</p>
          )}
        </div>
      ) : null}
      <FieldError message={error} />
    </div>
  );
}

export function ListingWizard() {
  const { account, ready } = useAccount();
  const [step, setStep] = useState(0);
  const [published, setPublished] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageError, setImageError] = useState("");
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
    window.localStorage.removeItem("alisveris-listing-draft");
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (rawDraft) {
      form.reset({ ...defaultValues, ...JSON.parse(rawDraft) });
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [form]);

  async function submit(values: ListingDraftInput) {
    if (!images.length) {
      setImageError("Ən azı 1 şəkil əlavə edin.");
      setStep(2);
      setPublished(false);
      return;
    }

    const parsed = listingDraftSchema.safeParse(values);
    if (!parsed.success) {
      setPublished(false);
      return;
    }

    console.info("listing_publish_requested", parsed.data);
    window.localStorage.removeItem(draftStorageKey);
    setPublished(true);
  }

  function handleInvalid() {
    const errors = form.formState.errors;

    if (errors.category || errors.subcategory) {
      setStep(0);
      return;
    }

    if (
      errors.title ||
      errors.description ||
      errors.price ||
      errors.condition ||
      errors.city
    ) {
      setStep(1);
      return;
    }

    if (errors.contactName || errors.phone || errors.email || errors.whatsapp) {
      setStep(3);
      return;
    }

    if (errors.package) {
      setStep(4);
      return;
    }

    if (errors.acceptedRules) {
      setStep(5);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const nextImages: UploadedImage[] = [];

    for (const file of Array.from(files).slice(0, 15 - images.length)) {
      if (!allowedTypes.includes(file.type)) {
        setImageError("Yalnız JPG, PNG və WebP şəkillər qəbul olunur.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setImageError("Hər şəkil maksimum 5MB ola bilər.");
        return;
      }

      nextImages.push({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        isPrimary: images.length === 0 && nextImages.length === 0,
      });
    }

    setImages((current) => [...current, ...nextImages].slice(0, 15));
    setImageError("");
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }

      const next = current.filter((image) => image.id !== id);
      if (next.length && !next.some((image) => image.isPrimary)) {
        return next.map((image, index) => ({ ...image, isPrimary: index === 0 }));
      }
      return next;
    });
  }

  function makePrimary(id: string) {
    setImages((current) =>
      current.map((image) => ({ ...image, isPrimary: image.id === id })),
    );
  }

  if (!ready) {
    return <Card className="min-h-72 animate-pulse bg-card p-6" />;
  }

  if (!account) {
    return (
      <Card className="mx-auto max-w-2xl p-7 text-center animate-scale-in">
        <h1 className="text-2xl font-black">Elan yerləşdirmək üçün daxil olun</h1>
        <p className="mx-auto mt-2 max-w-lg text-muted">
          Fərdi və ya mağaza hesabınızı bir dəfə seçin, sonra yalnız həmin hesab tipi ilə davam edin.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary"><Link href="/giris">Giriş</Link></Button>
          <Button asChild><Link href="/qeydiyyat">Qeydiyyat</Link></Button>
        </div>
      </Card>
    );
  }

  if (account.accountType === "store" && !account.store) {
    return (
      <Card className="mx-auto max-w-2xl p-7 text-center animate-scale-in">
        <Store className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-3 text-2xl font-black">Əvvəl mağazanızı yaradın</h1>
        <p className="mt-2 text-muted">Mağaza adı və loqo əlavə etdikdən sonra məhsullarınızı yerləşdirə bilərsiniz.</p>
        <Button asChild className="mt-6"><Link href="/magaza-yarat">Mağaza yarat</Link></Button>
      </Card>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(submit, handleInvalid)}
      className="grid gap-5 lg:grid-cols-[260px_1fr]"
      noValidate
    >
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
        <div className="mb-5 flex items-center gap-3 rounded-lg bg-primary-soft p-3 text-sm">
          {account.accountType === "store" && account.store ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={account.store.name} className="h-9 w-9 rounded-lg object-cover" src={account.store.logoUrl} />
          ) : (
            <UserRound className="h-5 w-5 text-primary" />
          )}
          <div>
            <p className="font-bold">
              {account.accountType === "store" && account.store
                ? `${account.store.name} mağazasına məhsul əlavə edilir`
                : "Fərdi elan yerləşdirilir"}
            </p>
            <p className="text-xs text-muted">Hesab tipi yalnız admin tərəfindən dəyişdirilə bilər.</p>
          </div>
        </div>
        <div className="mb-5">
          <p className="text-sm font-semibold text-primary">
            Addım {step + 1} / {steps.length}
          </p>
          <h1 className="mt-1 text-2xl font-black">{steps[step]}</h1>
        </div>

        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <CustomSelect
              error={form.formState.errors.category?.message}
              label="Kateqoriya"
              options={categories.map((category) => ({
                label: category.name,
                value: category.name,
              }))}
              placeholder="Kateqoriya seçin"
              value={form.watch("category")}
              onChange={(value) => {
                form.setValue("category", value, { shouldDirty: true, shouldValidate: true });
                form.setValue("subcategory", "", { shouldDirty: true, shouldValidate: true });
              }}
            />
            <CustomSelect
              disabled={!currentCategory}
              error={form.formState.errors.subcategory?.message}
              label="Alt kateqoriya"
              options={(currentCategory?.subcategories ?? []).map((subcategory) => ({
                label: subcategory,
                value: subcategory,
              }))}
              placeholder="Alt kateqoriya seçin"
              value={form.watch("subcategory")}
              onChange={(value) =>
                form.setValue("subcategory", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
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
              <Input className="mt-2" placeholder={examples.title} {...form.register("title")} />
              <FieldError message={form.formState.errors.title?.message} />
            </label>
            <label className="md:col-span-2">
              <span className="text-sm font-bold">Təsvir</span>
              <textarea
                className="mt-2 min-h-36 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder={examples.description}
                {...form.register("description")}
              />
              <FieldError message={form.formState.errors.description?.message} />
            </label>
            <label>
              <span className="text-sm font-bold">Qiymət</span>
              <Input
                className="mt-2"
                inputMode="numeric"
                placeholder={examples.price}
                {...form.register("price", { valueAsNumber: true })}
              />
              <FieldError message={form.formState.errors.price?.message} />
            </label>
            <CustomSelect
              error={form.formState.errors.condition?.message}
              label="Vəziyyət"
              options={[
                { label: "Yeni", value: "new" },
                { label: "İkinci əl", value: "used" },
              ]}
              placeholder="Vəziyyət seçin"
              value={form.watch("condition") ?? ""}
              onChange={(value) =>
                form.setValue("condition", value as ListingDraftInput["condition"], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <Input placeholder={examples.brand} {...form.register("brand")} />
            <Input placeholder={examples.model} {...form.register("model")} />
            <Input placeholder={examples.color} {...form.register("color")} />
            <label className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
              <input className="h-4 w-4 accent-primary" type="checkbox" {...form.register("delivery")} />
              Çatdırılma mümkündür
            </label>
            <CustomSelect
              error={form.formState.errors.city?.message}
              label="Şəhər"
              options={cities.map((city) => ({ label: city, value: city }))}
              placeholder="Şəhər seçin"
              value={form.watch("city")}
              onChange={(value) =>
                {
                  form.setValue("city", value, { shouldDirty: true, shouldValidate: true });
                  if (value !== "Bakı") {
                    form.setValue("metro", "", { shouldDirty: true });
                  }
                }
              }
            />
            {form.watch("city") === "Bakı" ? (
              <CustomSelect
                label="Metro"
                options={metroStations.map((station) => ({ label: station, value: station }))}
                placeholder="Metro seçin"
                value={form.watch("metro") ?? ""}
                onChange={(value) =>
                  form.setValue("metro", value, { shouldDirty: true, shouldValidate: true })
                }
              />
            ) : null}
            <Input placeholder={examples.district} {...form.register("district")} />
            <label className="md:col-span-2">
              <span className="text-sm font-bold">Ünvan və xəritədən seçim</span>
              <Input className="mt-2" placeholder={examples.address} {...form.register("address")} />
              <div className="mt-3 grid h-40 place-items-center rounded-lg border border-dashed border-border bg-background text-sm text-muted">
                <MapPin className="mb-2 h-5 w-5" />
                Xəritə seçimi üçün hazır sahə
              </div>
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <label className="grid min-h-64 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border bg-background p-8 text-center transition hover:border-primary/50">
              <div>
                <UploadCloud className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 font-bold">Şəkilləri buraya sürüklə</p>
                <p className="mt-1 text-sm text-muted">
                  Maksimum 15 şəkil, WebP/JPG/PNG, progress bar və MIME validation.
                </p>
                <span className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold">
                  <ImagePlus className="h-4 w-4" />
                  Fayl seç
                </span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  multiple
                  type="file"
                  onChange={(event) => handleFiles(event.target.files)}
                />
              </div>
            </label>
            <FieldError message={imageError} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {images.map((image) => (
                <div
                  className="overflow-hidden rounded-lg border border-border bg-background"
                  key={image.id}
                >
                  <div
                    className="aspect-square bg-cover bg-center"
                    style={{ backgroundImage: `url(${image.url})` }}
                  />
                  <div className="grid gap-2 p-2">
                    <p className="truncate text-xs font-semibold">{image.name}</p>
                    <div className="flex gap-1">
                      <Button
                        className="flex-1"
                        size="sm"
                        type="button"
                        variant={image.isPrimary ? "primary" : "secondary"}
                        onClick={() => makePrimary(image.id)}
                      >
                        {image.isPrimary ? "Əsas" : "Əsas et"}
                      </Button>
                      <Button
                        aria-label="Şəkli sil"
                        size="icon"
                        type="button"
                        variant="danger"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 5 - images.length) }).map((_, index) => (
                <div
                  className="grid aspect-square place-items-center rounded-lg border border-border bg-background text-xs text-muted"
                  key={`empty-${index}`}
                >
                  Boş slot
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="text-sm font-bold">Ad</span>
              <Input className="mt-2" placeholder={examples.contactName} {...form.register("contactName")} />
              <FieldError message={form.formState.errors.contactName?.message} />
            </label>
            <label>
              <span className="text-sm font-bold">Telefon</span>
              <Input className="mt-2" placeholder={examples.phone} {...form.register("phone")} />
              <FieldError message={form.formState.errors.phone?.message} />
            </label>
            <label>
              <span className="text-sm font-bold">E-poçt</span>
              <Input className="mt-2" placeholder={examples.email} {...form.register("email")} />
              <FieldError message={form.formState.errors.email?.message} />
            </label>
            <label>
              <span className="text-sm font-bold">WhatsApp nömrəsi</span>
              <Input className="mt-2" placeholder={examples.whatsapp} {...form.register("whatsapp")} />
              <FieldError message={form.formState.errors.whatsapp?.message} />
            </label>
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
              <FieldError message={form.formState.errors.acceptedRules?.message} />
              <Button className="w-full" type="submit">
                <Check className="h-4 w-4" />
                Elanı dərc et
              </Button>
            </div>
          </div>
        ) : null}

        {published ? (
          <div className="mt-5 rounded-lg border border-success/30 bg-green-50 p-3 text-sm font-semibold text-success">
            Elan demo rejimdə dərc olundu. Real Supabase qoşulanda bu addım
            server action-a göndəriləcək.
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
