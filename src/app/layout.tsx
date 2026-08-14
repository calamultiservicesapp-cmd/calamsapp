import type { Metadata } from "next";
import { Bebas_Neue, Poppins } from "next/font/google";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CALA Multiservices",
  description: "Plataforma integral de gestión de proyectos y presupuestos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CALA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
