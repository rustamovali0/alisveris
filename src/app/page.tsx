import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSearch } from "@/components/home/hero-search";
import {
  LatestListings,
  PremiumListings,
  StoreShowcase,
} from "@/components/home/listing-sections";
import { SiteShell } from "@/components/layout/site-shell";
import { MotionSection } from "@/components/ui/motion-section";

export const metadata: Metadata = {
  title: "Al, sat və axtardığını tap",
};

export default function HomePage() {
  return (
    <SiteShell>
      <HeroSearch />
      <MotionSection>
        <CategoryGrid />
      </MotionSection>
      <MotionSection>
        <PremiumListings />
      </MotionSection>
      <MotionSection>
        <LatestListings />
      </MotionSection>
      <MotionSection>
        <StoreShowcase />
      </MotionSection>
      <section className="container-shell hidden py-12 md:block">
        <div className="rounded-lg border border-border bg-card p-6 soft-shadow">
          <h2 className="text-2xl font-black">
            Azərbaycanda təhlükəsiz alış-veriş və elan yerləşdirmə
          </h2>
          <p className="mt-4 max-w-4xl leading-7 text-muted">
            alışveriş.az istifadəçilərə yeni və ikinci əl məhsulları tapmaq,
            qiymətləri müqayisə etmək, satıcı ilə birbaşa əlaqə saxlamaq və
            elanlarını idarə etmək üçün modern marketplace infrastrukturu təqdim
            edir. Kateqoriya, şəhər, qiymət aralığı və satıcı növü üzrə ağıllı
            filterlər alış-veriş prosesini daha sürətli edir. Platforma
            təsdiqlənmiş mağazalar, real-time mesajlaşma, seçilmişlər,
            bildirişlər və moderator nəzarəti üçün genişlənə bilən arxitektura
            ilə hazırlanıb.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
