import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import BackgroundEngine from "@/components/BackgroundEngine";

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
        <WalletContextProvider>
          <BackgroundEngine />
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
