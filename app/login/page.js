import { Suspense } from "react";
import Image from "next/image";
import BrandMotif from "@/components/BrandMotif";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      <BrandMotif className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 opacity-[0.06] dark:opacity-[0.1]" />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-8">
        <Image
          src="/resources/LogoTotvsEscuro.png"
          alt="TOTVS"
          width={160}
          height={47}
          priority
          className="h-8 w-auto dark:hidden"
        />
        <Image
          src="/resources/LogoTotvsBranco.png"
          alt="TOTVS"
          width={160}
          height={47}
          priority
          className="hidden h-8 w-auto dark:block"
        />

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
