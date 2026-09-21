import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth-helpers";
import AdminPanel from "@/components/AdminPanel";

export const metadata = {
  title: "Admin Panel — Task Manager",
  description: "Admin control panel for managing users and tasks",
};

export default async function AdminPage() {
  try {
    const user = await requireAdmin();

    return (
      <AdminPanel
        currentUser={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
      />
    );
  } catch {
    redirect("/dashboard");
  }
}
