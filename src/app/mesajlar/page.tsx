import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { MessagesClient } from "@/components/messages/messages-client";

export const metadata: Metadata = {
  title: "Mesajlar",
};

export default function MessagesPage() {
  return (
    <SiteShell>
      <div className="container-shell py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black">Mesajlar</h1>
          <p className="mt-2 text-muted">
            Real-time söhbət, oxundu statusu, yazır göstəricisi və elan kartı.
          </p>
        </div>
        <MessagesClient />
      </div>
    </SiteShell>
  );
}
