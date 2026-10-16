import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "ECOGEST | Gestion scolaire tout en un",
  description:
    "Solution logicielle moderne de gestion pour établissements scolaires (collèges, lycées et complexes scolaires) : direction administrative, pédagogie, bulletins scolaires normalisés, comptabilité et suivi parental.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 antialiased selection:bg-school-100 selection:text-school-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
