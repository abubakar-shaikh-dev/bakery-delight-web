import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// The admin panel never belongs in search results (robots.txt also
// disallows /admin, but meta robots is the belt to robots' braces).
export const metadata: Metadata = {
  title: { absolute: "Bakery Delight — Admin panel" },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
