"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import DashboardHeader from "../../components/dashboard/Header";
import DashboardSidebar from "../../components/dashboard/Sidebar";
import {
  baseNavItems,
  isRoleKey,
  roleLabels,
  roleNavMap,
} from "../../components/dashboard/data";
import type { RoleKey } from "../../components/dashboard/types";

const NAV_PATHS: Record<string, string> = {
  overview: "/dashboard",
  stockRequests: "/dashboard/stock-requests",
  transactions: "/dashboard/transactions",
  allocations: "/dashboard/allocations",
  customers: "/dashboard/customers",
  retailerCooperatives: "/dashboard/retailer-cooperatives",
  woredas: "/dashboard/woredas",
  settings: "/dashboard/settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [clientUser] = useState(() => {
    if (typeof window === "undefined") {
      return { role: "admin", name: "Marta Alemu" };
    }

    return {
      role: localStorage.getItem("userRole") ?? "admin",
      name: localStorage.getItem("userName") ?? "Marta A.",
    };
  });

  const userRole = useMemo<RoleKey>(() => {
    if (isRoleKey(clientUser.role)) {
      return clientUser.role;
    }
    return "admin";
  }, [clientUser.role]);

  const userName = clientUser.name;

  const navItems = useMemo(
    () => roleNavMap[userRole] ?? baseNavItems,
    [userRole],
  );

  // Derive active nav from pathname
  const activeNav = useMemo(() => {
    const entry = Object.entries(NAV_PATHS).find(([_, path]) =>
      path === "/dashboard" ? pathname === path : pathname?.startsWith(path),
    );
    return entry ? entry[0] : "overview";
  }, [pathname]);

  const handleSelectNav = (key: string) => {
    const targetPath = NAV_PATHS[key];
    if (targetPath) {
      router.push(targetPath);
    }
    setMobileSidebarOpen(false);
  };


  return (
    <div className="min-h-screen bg-(--bpds-surface) text-(--bpds-on-surface)">
      <div className="mx-auto flex min-h-screen w-full max-w-360">
        <DashboardSidebar
          isOpen={mobileSidebarOpen}
          activeNav={activeNav}
          navItems={navItems.map((item) => ({
            ...item,
            label: t(item.labelKey),
          }))}
          systemLabel={t("dashboard.system")}
          title={t("dashboard.title")}
          navigationLabel={t("dashboard.mainNavigation")}
          closeMenuLabel={t("dashboard.closeMenu")}
          onSelectNav={handleSelectNav}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            welcomeLabel={t("dashboard.welcome")}
            heading={t("dashboard.heading")}
            openMenuLabel={t("dashboard.openMenu")}
            toggleLanguageLabel={t("dashboard.toggleLanguage")}
            toggleThemeLabel={t("dashboard.toggleTheme")}
            notificationsLabel={t("dashboard.notifications")}
            userName={userName}
            roleLabel={t(roleLabels[userRole] ?? "dashboard.roles.admin")}
            notificationCount={notificationCount}
            languageLabel={i18n.language === "en" ? "አማ" : "EN"}
            isDarkTheme={mounted ? theme === "dark" : false}
            onOpenMenu={() => setMobileSidebarOpen(true)}
            onToggleLanguage={() =>
              i18n.changeLanguage(i18n.language === "en" ? "am" : "en")
            }
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          />

          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
