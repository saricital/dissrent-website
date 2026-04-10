import { redirect } from "next/navigation";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/adminAuth";
import AdminLogin from "@/components/AdminLogin";

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <AdminLogin disabledMessage="Admin pristup nije aktivan. Postavite ADMIN_PASSWORD i ADMIN_SESSION_SECRET prije produkcije." />
    );
  }

  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return <AdminLogin />;
}
