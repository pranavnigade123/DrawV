// lib/authz.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}
