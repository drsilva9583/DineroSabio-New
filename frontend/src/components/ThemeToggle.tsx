"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/* Reusable light/dark switch backed by next-themes.
   The `mounted` guard matters: on the server we don't know the resolved theme,
   so we render a neutral placeholder until hydration to avoid a mismatch. */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      className="flex size-9 items-center justify-center rounded-full border border-border text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
    >
      {/* Keep the box stable before mount so layout doesn't shift on hydration. */}
      {mounted && (isDark ? <Sun className="size-5" /> : <Moon className="size-5" />)}
    </button>
  );
}