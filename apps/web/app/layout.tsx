import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { SolanaWalletProvider } from "@/components/wallet/solana-wallet-provider";

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
  description:
    "Voice-native World Cup predictions, live goal moments, and verified settlement.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
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
          <SolanaWalletProvider>
            {children}
            <Toaster />
          </SolanaWalletProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
