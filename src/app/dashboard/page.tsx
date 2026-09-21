import { redirect } from "next/navigation";

import { auth } from "@/auth";
import TaskManager from "@/components/TaskManager";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Admins go straight to the admin panel
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TaskManager
        user={{
          name: session.user.name || "User",
          email: session.user.email || "",
          image: session.user.image || "",
          role: session.user.role,
        }}
      />
    </main>
  );
}
