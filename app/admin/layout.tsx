import { getUserSession } from "@/lib/session";
import { AdminShell } from "@/components/AdminShell";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserSession();
  if (!user) redirect("/account");

  return (
    <AdminShell
      username={user.username ?? "admin"}
      displayName={user.displayName}
    >
      {children}
    </AdminShell>
  );
}
