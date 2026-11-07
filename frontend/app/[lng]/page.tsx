import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  ShieldCheck,
  Scale,
  ArrowRight,
  Boxes,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Landmark,
} from "lucide-react";

export default async function Home({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng = "en" } = await params;
  const isAmharic = lng.startsWith("am");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "Arba Minch Public Commodity Distribution",
    "alternateName": ["Arba Minch PCD", "Arbaminch Commodity Distribution"],
    "description":
      "Official administrative portal for Arba Minch Public Commodity Distribution. Managing regulated commodity quotas, cooperative supply chains, and transparent household allocations.",
    "areaServed": {
      "@type": "City",
      "name": "Arba Minch",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Ethiopia",
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Government Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium tracking-wide">
              {isAmharic
                ? "የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ • የአርባ ምንጭ ከተማ ንግድና ገበያ ልማት ጽ/ቤት"
                : "Federal Democratic Republic of Ethiopia • Arba Minch Trade & Industry Bureau"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              Arba Minch, Ethiopia
            </span>
            <Link
              href={isAmharic ? "/en" : "/am"}
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              {isAmharic ? "English" : "አማርኛ"}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-lg bg-white p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
              <Image
                src="/logo.png"
                alt="AM-PCD Official Logo"
                width={38}
                height={38}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg tracking-tight text-slate-950 dark:text-white leading-tight">
                AM-PCD
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isAmharic
                  ? "የህዝብ መሠረታዊ ሸቀጦች ማከፋፈያ ሥርዓት"
                  : "Public Commodity Distribution System"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${lng}/login`}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              {isAmharic ? "ግባ (Sign In)" : "Authorized Sign In"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {isAmharic
                  ? "ኦፊሴላዊ የቁጥጥርና ክትትል ፖርታል"
                  : "Official Regulatory Distribution Portal"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight sm:leading-tight mb-6">
              {isAmharic
                ? "ፍትሃዊና ግልፅ የመሠረታዊ ሸቀጦች ማከፋፈያ ቁጥጥር"
                : "Equitable & Transparent Commodity Distribution in Arba Minch"}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              {isAmharic
                ? "የአርባ ምንጭ ከተማ አስተዳደር መሠረታዊ ሸቀጦችን (ዘይት፣ ስኳር፣ ዱቄት) ፍትሃዊ በሆነ መንገድ ለህብረተሰቡ ለማዳረስ የተዘጋጀ ዲጂታል ቁጥጥር ሥርዓት።"
                : "A centralized municipal management system connecting the Zone Trade Bureau, Woreda administrations, and licensed retailer cooperatives to guarantee fair distribution."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/${lng}/login`}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <span>{isAmharic ? "ወደ ዳሽቦርድ ይግቡ" : "Access Operations Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Operational Statistics Strip */}
        <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              <div className="p-3">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  4
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  {isAmharic ? "ወረዳዎች" : "Municipal Woredas"}
                </div>
              </div>
              <div className="p-3">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  12+
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  {isAmharic ? "ህብረት ሥራ ማህበራት" : "Retailer Cooperatives"}
                </div>
              </div>
              <div className="p-3">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  100%
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  {isAmharic ? "ዲጂታል ምዝገባ" : "Digitized Beneficiaries"}
                </div>
              </div>
              <div className="p-3">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  Real-Time
                </div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  {isAmharic ? "የቀጥታ ክትትል" : "Stock Verification"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Core Pillars Section */}
        <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                {isAmharic ? "የሥርዓቱ ዋና ተግባራት" : "Core Institutional Capabilities"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                {isAmharic
                  ? "የሸቀጦች ሥርጭትን ከመጋዘን ጀምሮ እስከ ተጠቃሚው ድረስ በግልጽ ለመከታተል የተዘረጋ ሥርዓት።"
                  : "Providing multi-tier oversight across administrative boundaries to prevent shortages, price gouging, and unauthorized diversion."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {isAmharic ? "የወረዳና የዞን ኮታ ቁጥጥር" : "Zone & Woreda Quota Oversight"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {isAmharic
                    ? "የዞንና የወረዳ ንግድ ቢሮዎች የማከፋፈያ ኮታዎችን በአስተማማኝ ሁኔታ እንዲመድቡና እንዲያጸድቁ ያግዛል።"
                    : "Enables administrative offices to assign, approve, and track verified monthly allocations before commodities leave regional supply warehouses."}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {isAmharic ? "የህብረት ሥራ ማህበራት ክምችት" : "Cooperative Inventory Management"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {isAmharic
                    ? "እያንዳንዱ ማህበር የተቀበለውንና ያከፋፈለውን የሸቀጥ መጠን በቀጥታ ይመዘግባል፣ እጥረትንም በወቅቱ ያሳውቃል።"
                    : "Authorizes consumer cooperatives to request stock, manage on-hand inventory, and record legitimate distribution without discrepancy."}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {isAmharic ? "ፍትሃዊ የተጠቃሚ ሥርጭት" : "Citizen Entitlement Protection"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {isAmharic
                    ? "የተጠቃሚዎችን ምዝገባ በመፈተሽ አንድ ሰው ከአንድ ጊዜ በላይ እንዳይወስድና እኩል ድርሻ እንዲያገኝ ያረጋግጣል።"
                    : "Digital verification prevents duplicate collection and ensures subsidized items reach the registered households for whom they are intended."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Official Directives & Information */}
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {isAmharic ? "የማከፋፈያ ደንብና የሥራ ሰዓት ማስታወቂያ" : "Public Distribution Directive"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAmharic
                      ? "የመሠረታዊ ሸቀጦች ሥርጭት በከተማው አስተዳደር በተፈቀዱ ማህበራት ብቻ የሚከናወን ሲሆን፣ ማንኛውም ሸማች በሕጋዊ መታወቂያው መሠረት የተመደበለትን ኮታ በወቅቱ መውሰድ አለበት።"
                      : "Public commodities are distributed strictly through authorized kebele cooperative centers. Beneficiaries must present valid resident identification to claim allotted quotas according to the municipal schedule."}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Regulated Price Compliance
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Digital Ledger Records
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Audited Supply Transits
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              AM-PCD
            </span>
            <span>•</span>
            <span>Arba Minch City Administration, Southern Ethiopia</span>
          </div>
          <div>
            © {new Date().getFullYear()} Arba Minch Trade & Industry Bureau. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
