"use client";

import { useEffect } from "react";
import { routing } from "@/i18n/routing";

export default function RootPage() {
  useEffect(() => {
    window.location.replace(`/${routing.defaultLocale}/`);
  }, []);

  return (
    <html lang={routing.defaultLocale}>
      <body>
        <p>Redirecting…</p>
        <meta httpEquiv="refresh" content={`0;url=/${routing.defaultLocale}/`} />
      </body>
    </html>
  );
}
