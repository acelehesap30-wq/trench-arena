import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import BackgroundEngine from "@/components/BackgroundEngine";
import { AuthProvider } from "@/contexts/AuthContext";
import Web3AuthSync from "@/components/Web3AuthSync";
import BetSlipDrawer from "@/components/BetSlipDrawer";
import GlobalChat from "@/components/GlobalChat";

import { BetProvider } from "@/contexts/BetContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TRENCH | Web3 Sentetik Piyasa Arenası",
  description: "Diamond Hands için Provably Fair Strateji Ekosistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-blue-900 selection:text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          <WalletContextProvider>
            <BetProvider>
              <BackgroundEngine />
              <Web3AuthSync />
              <GlobalChat />
              <BetSlipDrawer />
              {children}
            </BetProvider>
          </WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
