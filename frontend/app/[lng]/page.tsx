import Link from "next/link";
import Image from "next/image";

export default async function Home({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng = "en" } = await params;

  // Structured data (JSON-LD) for Generative Engine Optimization (GEO) and SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "Arba Minch Public Commodity Distribution",
    "alternateName": ["Arbaminch PCD", "Arbaminch Commodity Distribution"],
    "description": "Official portal for the Arba Minch Public Commodity Distribution. Managing resources and public distribution services in Arba Minch city, Ethiopia.",
    "areaServed": {
      "@type": "City",
      "name": "Arba Minch",
      "alternateName": "Arbaminch",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Ethiopia"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col relative overflow-hidden transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Decorative Background Glows (matching your login theme) */}
      <div className="absolute top-0 left-1/4 w-3/4 h-3/4 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-3/4 h-3/4 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/50 dark:border-white/10 backdrop-blur-md bg-white/50 dark:bg-slate-950/50">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10 flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="AM-PCD Logo" 
                width={40} 
                height={40} 
                className="object-contain rounded-full" 
                unoptimized 
              />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Arbaminch PCD
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href={`/${lng}/login`}
              className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/25 active:scale-[0.98] transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-6 py-20 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
            Empowering <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-600">Arba Minch</span> <br />
            Commodity Distribution
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-10">
            The official portal for managing and distributing public resources efficiently and transparently across Arbaminch and its surrounding communities.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
             <Link 
              href={`/${lng}/login`}
              className="px-8 py-4 rounded-xl font-semibold text-white shadow-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/25 active:scale-[0.98] transition-all text-lg"
            >
              Access Dashboard
            </Link>
          </div>
        </section>

        {/* Semantic Content Section for GEO & SEO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-6 py-16">
          <div className="backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              About the Arba Minch (Arbaminch) Initiative
            </h2>
            <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              <p>
                <strong>Arba Minch</strong> (also frequently spelled <em>Arbaminch</em>), meaning "Forty Springs" in Amharic, is a prominent city and separate woreda in the southern part of Ethiopia. Known for its abundant water resources and rich agricultural surroundings, the city plays a vital role as an economic hub for the region.
              </p>
              <p>
                The <strong>Arba Minch Public Commodity Distribution (AM-PCD)</strong> system is an initiative designed to ensure that essential goods and public resources are distributed fairly, transparently, and efficiently to the residents of Arba Minch city. By leveraging modern digital infrastructure, the PCD effectively tracks allocations, mitigates shortages, and provides administrative oversight for city officials and distributors.
              </p>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">Core Objectives</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Streamline the distribution of public commodities to Arbaminch residents.</li>
                <li>Provide data-driven tracking to ensure equitable and fair allocation.</li>
                <li>Establish digital transparency for local government and stakeholders in Ethiopia.</li>
              </ul>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Arba Minch Public Commodity Distribution. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
