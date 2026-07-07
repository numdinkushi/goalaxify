import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { PwaComponents } from "@/components/pwa/pwa-components";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { AppPreferencesProvider } from "@/components/providers/app-preferences-provider";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { SolanaWalletProvider } from "@/components/wallet/solana-wallet-provider";
import {
  PWA_BACKGROUND_COLOR,
  PWA_DESCRIPTION,
  PWA_ICON_PATHS,
  PWA_NAME,
  PWA_SHORT_NAME,
  PWA_THEME_COLOR,
} from "@/lib/pwa/constants";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Goalaxify | Talk your bet",
  description: PWA_DESCRIPTION,
  applicationName: PWA_NAME,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: PWA_SHORT_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: PWA_ICON_PATHS.icon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: PWA_ICON_PATHS.icon512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: PWA_ICON_PATHS.icon192,
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PWA_THEME_COLOR },
    { media: "(prefers-color-scheme: dark)", color: PWA_BACKGROUND_COLOR },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
    >
      <body className="min-h-dvh min-h-svh">
        <ConvexClientProvider>
          <AppPreferencesProvider>
            <SolanaWalletProvider>
              <ServiceWorkerRegister />
              {children}
              <PwaComponents />
              <Toaster />
            </SolanaWalletProvider>
          </AppPreferencesProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
