import type { Metadata } from "next";
import Image from "next/image";
import { ImagePlus, MoreVertical, Search, Send } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listings } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Mesajlar",
};

const conversations = [
  ["Telefon Dünyası", "iPhone hələ satışdadır?", "online"],
  ["Kamran Vəliyev", "PS5 üçün qiymətdə endirim olar?", "offline"],
  ["City Home", "Mənzilə baxış vaxtı seçək.", "online"],
];

export default function MessagesPage() {
  const activeListing = listings[0];

  return (
    <SiteShell>
      <div className="container-shell py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black">Mesajlar</h1>
          <p className="mt-2 text-muted">
            Real-time söhbət, oxundu statusu, yazır göstəricisi və elan kartı.
          </p>
        </div>
        <Card className="grid min-h-[680px] overflow-hidden lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-border lg:border-b-0 lg:border-r">
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input className="pl-9" placeholder="Mesajlarda axtar" />
              </div>
            </div>
            {conversations.map(([name, message, status]) => (
              <button
                className="flex w-full items-center gap-3 border-b border-border p-4 text-left hover:bg-primary-soft/40"
                key={name}
                type="button"
              >
                <div className="relative grid h-11 w-11 place-items-center rounded-full bg-primary-soft font-black text-primary">
                  {name[0]}
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                      status === "online" ? "bg-success" : "bg-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="line-clamp-1 text-sm text-muted">{message}</p>
                </div>
              </button>
            ))}
          </aside>
          <section className="flex min-h-[520px] flex-col">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="font-black">Telefon Dünyası</h2>
                <p className="text-sm text-success">online · yazır...</p>
              </div>
              <Button aria-label="Əlavə menyu" size="icon" type="button" variant="ghost">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3 rounded-lg bg-background p-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={activeListing.image}
                    alt={activeListing.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold">{activeListing.title}</p>
                  <p className="text-sm text-muted">{activeListing.price} AZN</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3 bg-background p-4">
              <div className="max-w-[75%] rounded-lg bg-card p-3 text-sm shadow-sm">
                Salam, məhsul hələ satışdadır?
              </div>
              <div className="ml-auto max-w-[75%] rounded-lg bg-primary p-3 text-sm text-white shadow-sm">
                Salam, bəli. Mağazada yoxlayıb ala bilərsiniz.
              </div>
              <div className="max-w-[75%] rounded-lg bg-card p-3 text-sm shadow-sm">
                Çatdırılma var?
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <Button aria-label="Şəkil göndər" size="icon" type="button" variant="ghost">
                <ImagePlus className="h-5 w-5" />
              </Button>
              <Input placeholder="Mesaj yaz" />
              <Button aria-label="Göndər" size="icon" type="button">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </section>
        </Card>
      </div>
    </SiteShell>
  );
}
