"use client";

import { login } from "@/services/apiAuth";
import { useMutation } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useSyncExternalStore } from "react";
import { isAxiosError } from "axios";
import { useT } from "next-i18next/client";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const { t, i18n } = useT("common");
  const { theme, setTheme } = useTheme();
  const { login: authLogin } = useAuth();

  const loginMutation = useMutation({
    mutationFn: () => login({ username, password }),
    onSuccess: (data) => {
      authLogin(data);
      const currentLng = pathname?.split("/")[1] || "en";
      router.push(`/${currentLng}/dashboard`);
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message || err.message || t("failedLogin"),
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("unexpectedError"));
      }
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  const handleToggleLanguage = () => {
    const currentLng = i18n?.language || "en";
    const newLng = currentLng.startsWith("en") ? "am" : "en";

    // Persist language preference in cookie
    document.cookie = `NEXT_LOCALE=${newLng}; path=/; max-age=31536000`;

    const segments = pathname.split("/");
    // If we are at root or using localized routes
    if (segments[1] === "en" || segments[1] === "am") {
      segments[1] = newLng;
      router.push(segments.join("/") || "/");
    } else {
      router.push(`/${newLng}${pathname}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Top right controls */}
      {mounted && (
        <div className="absolute top-4 right-4 flex gap-4 z-50">
          <button
            onClick={handleToggleLanguage}
            className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white hover:bg-white/20 transition-all shadow-sm"
          >
            {i18n?.language?.startsWith("en") ? "አማ" : "EN"}
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white hover:bg-white/20 transition-all shadow-sm flex items-center gap-2"
          >
            {theme === "dark" ? t("themeLight") : t("themeDark")}
          </button>
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm transition-all">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4 rounded-full overflow-hidden bg-white dark:bg-white p-1 ring-1 ring-slate-200 dark:ring-white/10 flex items-center justify-center h-18 w-18">
            <Image
              src="/logo.png"
              alt="AM-PCD Logo"
              width={64}
              height={64}
              className="object-contain rounded-full bg-white dark:bg-white"
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">
            {t("loginTitle")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t("loginSubtitle")}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="username"
            >
              {t("usernameLabel")}
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs text-sm"
              placeholder={t("usernamePlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="password"
            >
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs text-sm"
              placeholder={t("passwordPlaceholder")}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-xs transition-colors text-sm
              ${
                loginMutation.isPending
                  ? "bg-blue-600/50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
          >
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("authenticating")}
              </span>
            ) : (
              t("signInButton")
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={`/${pathname?.split("/")[1] || "en"}/forgot-password`}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t("forgotPasswordLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
