"use client";

import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/upload")) return null;

  async function signOut() {
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch {
      // Keep the user on the current page if the session cannot be cleared.
    }
  }

  return (
    <button type="button" onClick={signOut} className="font-mono text-xs text-foreground-dim hover:text-cyan-deep">
      Sair
    </button>
  );
}
