"use client";

import { useEffect, useState } from "react";
import { applyTheme, resolveInitialTheme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4.5" />
      <path
        strokeLinecap="round"
        d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a.6.6 0 0 0-.77-.7A9.5 9.5 0 1 0 21.7 15.27a.6.6 0 0 0-.7-.77 8.5 8.5 0 0 1-.5 0Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // Lê o tema já aplicado pelo script inline no <head> (evita flash);
    // só é possível saber o valor real depois de montar no client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveInitialTheme());
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!theme}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-foreground-dim transition-colors hover:border-cyan hover:text-foreground disabled:opacity-0"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
