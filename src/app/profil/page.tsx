import type { Metadata } from "next";
import { ProfileDashboard } from "@/features/profile/profile-dashboard";

export const metadata: Metadata = {
  title: "İstifadəçi kabineti",
  description: "Elanlar, mesajlar, mağaza, balans və hesab ayarları.",
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}
