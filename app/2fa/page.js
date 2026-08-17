import { Suspense } from "react";
import BrandMotif from "@/components/BrandMotif";
import TwoFactorForm from "./two-factor-form";

export default function TwoFactorPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      <BrandMotif className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 opacity-[0.06] dark:opacity-[0.1]" />

      <Suspense fallback={null}>
        <TwoFactorForm />
      </Suspense>
    </main>
  );
}
