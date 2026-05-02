"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import DashboardHeader from "../../components/dashboard/Header";
import DashboardSidebar from "../../components/dashboard/Sidebar";
import {
  baseNavItems,
  roleLabels,
  roleNavMap,
} from "../../components/dashboard/data";
import { useAuth } from "../../contexts/AuthContext";

const NAV_PATHS: Record<string, string> = {
  overview: "/dashboard",
  stockRequests: "/dashboard/stock-requests",
  transactions: "/dashboard/transactions",
  allocations: "/dashboard/allocations",
  customers: "/dashboard/customers",
  retailerCooperatives: "/dashboard/retailer-cooperatives",
  woredas: "/dashboard/woredas",
  entities: "/dashboard/entities",
  users: "/dashboard/users",
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
  const { userRole, userName, isLoading } = useAuth();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-(--bpds-surface)">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-8 w-8 animate-spin text-(--bpds-primary)"
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
          <p className="text-sm font-medium text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

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
