import type { Metadata, Viewport } from "next";
import { APP_DISPLAY_NAME, APP_PAGE_TITLE } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_PAGE_TITLE,
  description: `Gerenciamento de ${APP_DISPLAY_NAME.toLowerCase()} — Prof.ª Joyce Neres`,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_DISPLAY_NAME,
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
