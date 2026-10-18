import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";

export const metadata: Metadata = {
  title: "ECOGEST | Gestion scolaire tout en un",
  description:
    "Solution logicielle moderne de gestion pour établissements scolaires (collèges, lycées et complexes scolaires) : direction administrative, pédagogie, bulletins scolaires normalisés, comptabilité et suivi parental.",
  manifest: "/manifest.json",
  themeColor: "#0f2b5c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ECOGEST",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <meta name="application-name" content="ECOGEST" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ECOGEST" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f2b5c" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 antialiased selection:bg-school-100 selection:text-school-900">
        <PWAProvider>
          <ToastProvider>
            {children}
            <PWAInstallBanner />
          </ToastProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
