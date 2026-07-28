"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/* Wraps next-themes. `attribute="class"` makes it toggle `class="dark"` on
   <html> — the exact hook globals.css keys off via `@custom-variant dark`.
   `enableSystem` respects the visitor's OS preference until they choose. */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}