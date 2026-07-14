import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage() {
  return (
    <SiteShell>
      <AuthPanel initialMode="login" />
    </SiteShell>
  );
}
