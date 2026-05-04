import type { Metadata } from "next";
import { Noto_Sans_Ethiopic, Public_Sans, Geist } from "next/font/google";
import "../globals.css";
import Providers from "../providers";
import { cn } from "@/lib/utils";
import { I18nProvider } from "next-i18next/client";
import { getResources, initServerI18next, getT } from "next-i18next/server";
import i18nConfig from "../../i18n.config";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}>) {
  const { lng = "en" } = await params;

  // Initialize server i18next first
  await initServerI18next(i18nConfig);

  // Fetch translation instance and extract resources
  const { i18n } = await getT("common", { lng });
  const resources = getResources(i18n, ["common"]);

  return (
    <html
      lang={lng}
      className={cn(
        "h-full",
        "antialiased",
        publicSans.variable,
        notoSansEthiopic.variable,
        "font-sans",
        geist.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <I18nProvider language={lng} resources={resources}>
            {children}
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
