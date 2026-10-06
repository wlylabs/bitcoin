"use client";

import { useReveal } from "@/lib/useReveal";

export default function PageShell({ children }) {
  useReveal();
  return (
    <main id="main" tabIndex={-1}>
      {children}
    </main>
  );
}
