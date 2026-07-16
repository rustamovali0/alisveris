"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Grid3X3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryTree } from "@/lib/mock-data";

export function CategoryMegaMenu() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState("");
  const activeRoot = useMemo(
    () => categoryTree.find((category) => category.id === activeRootId),
    [activeRootId],
  );
  const [activeChildId, setActiveChildId] = useState("");
  const activeChild = useMemo(() => {
    return activeRoot?.children?.find((child) => child.id === activeChildId);
  }, [activeChildId, activeRoot]);

  useEffect(() => {
    if (!open) {
      setActiveRootId("");
      setActiveChildId("");
      return;
    }

    function closeOnOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function selectRoot(id: string) {
    setActiveRootId(id);
    setActiveChildId("");
  }

  const columnCount = activeChild?.children?.length ? 3 : activeRoot?.children?.length ? 2 : 1;

  return (
    <div className="relative" ref={rootRef}>
      <Button
        aria-expanded={open}
        aria-label="Kateqoriyalar kataloqu"
        type="button"
        variant="ghost"
        onClick={() => setOpen((current) => !current)}
      >
        <Grid3X3 className="h-4 w-4" />
        Kateqoriyalar
      </Button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+12px)] z-50 w-[min(1040px,calc(100vw-32px))] rounded-lg border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-black">Kataloq</p>
              <p className="text-xs text-muted">
                Əsas kateqoriya, alt kateqoriya və 3-cü səviyyə üzrə seçim.
              </p>
            </div>
            <Button aria-label="Kataloqu bağla" size="icon" type="button" variant="ghost" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div
            className="grid max-h-[min(620px,calc(100vh-170px))] overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            <div className="overflow-y-auto border-r border-border p-3">
              {categoryTree.map((category) => (
                <button
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold ${
                    activeRoot?.id === category.id
                      ? "bg-primary-soft text-primary-dark"
                      : "hover:bg-background"
                  }`}
                  key={category.id}
                  type="button"
                  onMouseEnter={() => selectRoot(category.id)}
                  onClick={() => selectRoot(category.id)}
                >
                  {category.name}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
            {activeRoot?.children?.length ? (
            <div className={`${activeChild?.children?.length ? "border-r" : ""} overflow-y-auto border-border p-3`}>
              {activeRoot?.children?.map((child) => (
                <Link
                  className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold ${
                    activeChild?.id === child.id
                      ? "bg-primary-soft text-primary-dark"
                      : "hover:bg-background"
                  }`}
                  href={`/elanlar?category=${activeRoot.slug}&subcategory=${child.slug}`}
                  key={child.id}
                  onMouseEnter={() => setActiveChildId(child.id)}
                  onClick={() => setOpen(false)}
                >
                  {child.name}
                  {child.children?.length ? <ChevronRight className="h-4 w-4" /> : null}
                </Link>
              ))}
            </div>
            ) : null}
            {activeChild?.children?.length ? (
            <div className="overflow-y-auto p-3">
              {activeChild?.children?.length ? (
                activeChild.children.map((grandChild) => (
                  <Link
                    className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-background hover:text-primary"
                    href={`/elanlar?category=${activeRoot?.slug}&subcategory=${activeChild.slug}&child=${grandChild.slug}`}
                    key={grandChild.id}
                    onClick={() => setOpen(false)}
                  >
                    {grandChild.name}
                  </Link>
                ))
              ) : null}
            </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
