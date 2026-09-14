import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import ThemeToggle from "./ThemeToggle";
import AccountNav from "./AccountNav";
import { SESSION_COOKIE } from "@/lib/auth";

export default async function SiteHeader() {
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href={signedIn ? "/dashboard" : "/"}
          aria-label={signedIn ? "MoodLens — abrir minhas análises" : "MoodLens — página inicial"}
          className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
        >
          <Image
            src="/resources/LogoTotvsIconePreto.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 dark:invert"
            priority
          />
          <span className="font-display text-base font-medium tracking-tight sm:text-lg">MoodLens</span>
        </Link>
        <div className="flex items-center gap-4">
          <AccountNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
