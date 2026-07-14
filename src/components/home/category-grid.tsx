import Link from "next/link";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  return (
    <section className="container-shell py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Kateqoriyalar</h2>
          <p className="mt-1 text-sm text-muted">
            Alt kateqoriyalar və dinamik filterlər üçün hazır model.
          </p>
        </div>
        <Link className="text-sm font-semibold text-primary" href="/elanlar">
          Hamısına bax
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {categories.map((category) => (
          <Link
            href={`/elanlar?category=${category.slug}`}
            key={category.id}
            className="group rounded-lg border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <div
              className={cn(
                "mb-3 grid h-11 w-11 place-items-center rounded-lg",
                category.accent,
              )}
            >
              <category.icon className="h-5 w-5" />
            </div>
            <h3 className="min-h-10 text-sm font-bold leading-5">
              {category.name}
            </h3>
            <p className="mt-2 line-clamp-1 text-xs text-muted">
              {category.subcategories.slice(0, 3).join(", ")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
