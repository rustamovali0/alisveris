import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = { title: "Qeydiyyat" };

export default function RegisterPage() {
  return (
    <SiteShell>
      <AuthPanel initialMode="register" />
    </SiteShell>
  );
}
