import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "ECODUC | Plateforme Intégrée de Gestion Scolaire",
  description:
    "Application web moderne de gestion scolaire pour collèges et lycées (GESTIO 229) : suivi des élèves, notes, présences, comptabilité et paiements sécurisés.",
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
