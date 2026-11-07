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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-3.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("auth.forgotPasswordTitle")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t("auth.forgotPasswordDescription")}
          </p>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left">
          <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t("auth.forgotPasswordInfo")}
          </p>
        </div>

        {/* Back to Login */}
        <Link
          href={`/${lng}/login`}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("auth.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
