"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Phone } from "lucide-react";
import { useT } from "next-i18next/client";
import { useParams } from "next/navigation";

export default function ForgotPasswordPage() {
  const { t } = useT("common");
  const params = useParams();
  const lng = params?.lng || "en";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <ShieldCheck className="w-10 h-10 text-indigo-500" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("auth.forgotPasswordTitle")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t("auth.forgotPasswordDescription")}
          </p>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-left">
          <Phone className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t("auth.forgotPasswordInfo")}
          </p>
        </div>

        {/* Back to Login */}
        <Link
          href={`/${lng}/login`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("auth.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
