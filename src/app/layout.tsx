import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import BackgroundEngine from "@/components/BackgroundEngine";
import { AuthProvider } from "@/contexts/AuthContext";
import Web3AuthSync from "@/components/Web3AuthSync";
import BetSlipDrawer from "@/components/BetSlipDrawer";
import GlobalChat from "@/components/GlobalChat";
import CryptoTicker from "@/components/CryptoTicker";

import { BetProvider } from "@/contexts/BetContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TRENCHBET | Global Casino & Sports Betting Platform",
  description: "Kripto ile bahis, canlı casino, spor bahisleri, Web3 trading ve prediction markets. Provably fair teknolojisi ile güvenli platform.",
  keywords: "casino, spor bahisleri, kripto, web3, canlı casino, prediction markets, trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#050505" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} antialiased selection:bg-[#16a34a]/30 selection:text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          <WalletContextProvider>
            <BetProvider>
              <BackgroundEngine />
              <Web3AuthSync />
              <GlobalChat />
              <BetSlipDrawer />
              <CryptoTicker />
              {children}
            </BetProvider>
          </WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
