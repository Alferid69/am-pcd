import { defineConfig } from "next-i18next";
import path from "path";

export default defineConfig({
  supportedLngs: ["en", "am"],
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common"],
  localePath: "/locales",
  localeInPath: true,
  reloadOnPrerender: process.env.NODE_ENV === "development",
  cookieName: "NEXT_LOCALE",
});
