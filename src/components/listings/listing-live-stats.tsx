"use client";

import { useEffect, useState } from "react";
import { Eye, PhoneCall } from "lucide-react";

const viewedListingsKey = "alisveris-viewed-listings-v1";
const contactCountsKey = "alisveris-contact-counts-v1";
export const listingContactCountEvent = "alisveris-listing-contact-count";

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

export function incrementListingContactCount(listingId: string) {
  if (typeof window === "undefined") return;

  const counts = readJson<Record<string, number>>(contactCountsKey, {});
  const nextCount = (counts[listingId] ?? 0) + 1;
  counts[listingId] = nextCount;
  window.localStorage.setItem(contactCountsKey, JSON.stringify(counts));
  window.dispatchEvent(
    new CustomEvent(listingContactCountEvent, {
      detail: { listingId, count: nextCount },
    }),
  );
}

export function ListingLiveStats({
  listingId,
  baseViews,
  baseContacts = 0,
}: {
  listingId: string;
  baseViews: number;
  baseContacts?: number;
}) {
  const [views, setViews] = useState(baseViews);
  const [contacts, setContacts] = useState(baseContacts);

  useEffect(() => {
    const viewed = new Set(readJson<string[]>(viewedListingsKey, []));
    const storedExtraViews = Number(window.localStorage.getItem(`alisveris-view-count-${listingId}`) ?? "0");
    let extraViews = Number.isFinite(storedExtraViews) ? storedExtraViews : 0;

    if (!viewed.has(listingId)) {
      viewed.add(listingId);
      extraViews += 1;
      window.localStorage.setItem(viewedListingsKey, JSON.stringify([...viewed]));
      window.localStorage.setItem(`alisveris-view-count-${listingId}`, String(extraViews));
    }

    const counts = readJson<Record<string, number>>(contactCountsKey, {});
    setViews(baseViews + extraViews);
    setContacts(baseContacts + (counts[listingId] ?? 0));

    function handleContact(event: Event) {
      const detail = (event as CustomEvent<{ listingId: string; count: number }>).detail;
      if (detail?.listingId === listingId) {
        setContacts(baseContacts + detail.count);
      }
    }

    window.addEventListener(listingContactCountEvent, handleContact);
    return () => window.removeEventListener(listingContactCountEvent, handleContact);
  }, [baseContacts, baseViews, listingId]);

  return (
    <>
      <span className="inline-flex items-center gap-2">
        <Eye className="h-4 w-4" />
        {views} baxış
      </span>
      <span className="inline-flex items-center gap-2">
        <PhoneCall className="h-4 w-4" />
        {contacts} əlaqə
      </span>
    </>
  );
}
