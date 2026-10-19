import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avaliação Técnica — Natação Particular",
  description: "Gerenciamento de avaliações técnicas — Prof.ª Joyce Neres",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Avaliação Técnica",
    statusBarStyle: "default",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#115F76",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
