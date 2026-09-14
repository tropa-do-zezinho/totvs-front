import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import AccountNav from "./AccountNav";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Voltar para a página inicial"
          className="flex items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
        >
          <Image
            src="/resources/LogoTotvsIconePreto.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 dark:invert"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <AccountNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
