"use client";

import { useState } from "react";
import { MessageCircle, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementListingContactCount } from "@/components/listings/listing-live-stats";

type ContactActionsProps = {
  phone: string;
  whatsapp: string;
  listingId: string;
};

function maskPhone(phone: string) {
  return `${phone.slice(0, 3)} XXX XX XX`;
}

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function ContactActions({
  phone,
  whatsapp,
  listingId,
}: ContactActionsProps) {
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");

  function revealPhone() {
    setVisible(true);
    incrementListingContactCount(listingId);
    console.info("listing_contact_revealed", { listingId, channel: "phone" });
    window.setTimeout(() => {
      window.location.href = `tel:${cleanPhone(phone)}`;
    }, 80);
  }

  return (
    <div className="grid gap-2">
      <Button type="button" onClick={revealPhone}>
        <Phone className="h-4 w-4" />
        {visible ? phone : maskPhone(phone)}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary">
          <MessageCircle className="h-4 w-4" />
          Mesaj
        </Button>
        <Button asChild variant="secondary">
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={async () => {
          const url = window.location.href;
          if (navigator.share) {
            await navigator.share({ title: document.title, url });
          } else {
            await navigator.clipboard.writeText(url);
            setNotice("Link kopyalandı");
          }
        }}
      >
        <Share2 className="h-4 w-4" />
        Paylaş
      </Button>
      {notice ? <p className="text-center text-sm font-semibold text-success">{notice}</p> : null}
    </div>
  );
}

export function MobileContactBar({ phone, whatsapp, listingId }: ContactActionsProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 grid grid-cols-3 gap-2 border-t border-border bg-card p-3 md:hidden">
      <Button type="button" variant="secondary">
        <MessageCircle className="h-4 w-4" />
        Mesaj
      </Button>
      <Button
        type="button"
        onClick={() => {
          setVisible(true);
          incrementListingContactCount(listingId);
          console.info("listing_contact_revealed", { listingId, channel: "phone" });
          window.setTimeout(() => {
            window.location.href = `tel:${cleanPhone(phone)}`;
          }, 80);
        }}
      >
        <Phone className="h-4 w-4" />
        {visible ? phone.slice(0, 6) : "Zəng"}
      </Button>
      <Button asChild variant="secondary">
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </Button>
    </div>
  );
}
