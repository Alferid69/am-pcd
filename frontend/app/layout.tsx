import type { Metadata } from "next";
import { Noto_Sans_Ethiopic, Public_Sans, Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
});

export const metadata: Metadata = {
  title: "Arba Minch Public Commodity Distribution",
  description: "Arba Minch Public Commodity Distribution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", publicSans.variable, notoSansEthiopic.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
