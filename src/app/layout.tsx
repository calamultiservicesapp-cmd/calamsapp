import type { Metadata, Viewport } from "next";
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
  description: "Plataforma integral de gestión de proyectos, presupuestos, seguimiento y facturación.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CALA",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: "CALA Multiservices",
    description: "Plataforma integral de gestión de proyectos, presupuestos, seguimiento y facturación.",
    siteName: "CALA Multiservices",
    images: [
      {
        url: "/fondologin.png",
        width: 1200,
        height: 630,
        alt: "CALA Multiservices - Plataforma de gestión",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CALA Multiservices",
    description: "Plataforma integral de gestión de proyectos, presupuestos, seguimiento y facturación.",
    images: ["/fondologin.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
