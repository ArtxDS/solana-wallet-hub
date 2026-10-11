import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AppProviders } from "@/components/providers";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

// Use the Geist files bundled with Next so production builds do not need a network request.
const geistSans = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Solana Wallet Hub",
  description: "Painel de carteira Solana com suporte a Devnet e Mainnet",
  icons: {
    icon: [
      {
        url: "/favicon/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon/favicon.ico",
        type: "image/x-icon",
        sizes: "any",
      },
      {
        url: "/favicon/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/favicon/web-app-manifest-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/favicon/web-app-manifest-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0714",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        <AppProviders>
          <Header />
          <main className="mx-auto min-h-[calc(100vh-140px)] w-full max-w-310 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 min-[640px]:px-5 min-[640px]:pb-10 min-[640px]:pt-[7.25rem] lg:px-8">
            {children}
          </main>

          <MobileBottomNav />

          <Toaster
            position="bottom-right"
            theme="dark"
            closeButton={false}
            toastOptions={{
              className: "!border-white/[0.1] !bg-[#171026] !text-white",
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
