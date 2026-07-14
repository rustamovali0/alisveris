import { z } from "zod";

export const listingDraftSchema = z.object({
  category: z.string().min(1, "Kateqoriya seçilməlidir"),
  subcategory: z.string().min(1, "Alt kateqoriya seçilməlidir"),
  title: z.string().min(8, "Elan adı ən azı 8 simvol olmalıdır").max(90),
  description: z.string().min(30, "Təsvir ən azı 30 simvol olmalıdır").max(3000),
  price: z.number().positive("Qiymət düzgün deyil"),
  currency: z.enum(["AZN"]),
  condition: z.enum(["new", "used"]),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  delivery: z.boolean(),
  city: z.string().min(1, "Şəhər seçilməlidir"),
  district: z.string().optional(),
  address: z.string().optional(),
  contactName: z.string().min(2, "Ad daxil edin"),
  phone: z.string().regex(/^(\+994|0)(50|51|55|70|77|99|10)\d{7}$/, {
    message: "Azərbaycan mobil nömrəsi daxil edin",
  }),
  email: z.string().email("E-poçt düzgün deyil"),
  whatsapp: z.string().optional(),
  package: z.enum(["free", "premium", "vip", "boost"]),
  acceptedRules: z.boolean().refine(Boolean, "Qaydaları qəbul edin"),
});

export type ListingDraftInput = z.infer<typeof listingDraftSchema>;
