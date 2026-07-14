"use client";

import Image from "next/image";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ListingGalleryProps = {
  title: string;
  images: string[];
};

export function ListingGallery({ title, images }: ListingGalleryProps) {
  const [selected, setSelected] = useState(images[0]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-[16/10] bg-slate-100">
          <Image
            src={selected}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 760px"
            className="object-cover"
            priority
          />
          <Button
            className="absolute right-3 top-3 bg-white/95 !text-slate-900 hover:bg-white"
            type="button"
            variant="secondary"
            onClick={() => setOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {images.map((image) => (
            <button
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border bg-slate-100 ${
                selected === image ? "border-primary" : "border-border"
              }`}
              key={image}
              type="button"
              onClick={() => setSelected(image)}
            >
              <Image
                src={image}
                alt={title}
                fill
                sizes="180px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/90 p-4">
          <Button
            aria-label="Bağla"
            className="absolute right-4 top-4"
            size="icon"
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="relative h-[82vh] w-full max-w-6xl">
            <Image src={selected} alt={title} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
