import type { Metadata } from "next";
import { AdminAccess } from "@/components/admin/admin-access";

export const metadata: Metadata = {
  title: "Admin panel",
};

export default function AdminPage() {
  return <AdminAccess />;
}
