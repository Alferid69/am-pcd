import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  CircleUserRound,
  Languages,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  PieChart,
  Settings,
  Store,
  Sun,
  Users,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { useT } from "next-i18next/client";
import type { IconName, NavItem } from "./types";

const navIconMap: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  inventory_2: Package,
  sync_alt: ArrowLeftRight,
  settings: Settings,
  menu: Menu,
  translate: Languages,
  light_mode: Sun,
  dark_mode: Moon,
  notifications: Bell,
  account_circle: CircleUserRound,
  arrow_forward: ArrowRight,
  pie_chart: PieChart,
  users: Users,
  store: Store,
  map_pin: MapPin,
  shopping_bag: ShoppingBag,
};

type DashboardSidebarProps = {
  isOpen: boolean;
  activeNav: string;
  navItems: NavItem[];
  systemLabel: string;
  title: string;
  navigationLabel: string;
  closeMenuLabel: string;
  onSelectNav: (key: string) => void;
  onClose: () => void;
};

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function DashboardSidebar({
  isOpen,
  activeNav,
  navItems,
  systemLabel,
  // title,
  navigationLabel,
  closeMenuLabel,
  onSelectNav,
  onClose,
}: DashboardSidebarProps) {
  const { t } = useT("common");
  const { logout } = useAuth();
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label={closeMenuLabel}
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/35 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-30 flex h-screen w-70 flex-col border-r border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) px-4 py-4 shadow-(--bpds-shadow-level-3) transition-transform duration-300 md:sticky md:z-auto md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-(--bpds-outline-variant) bg-(--bpds-surface-container-low) p-3">
          <div className="rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-white dark:bg-white h-8 w-8">
            <Image
              src="/logo.png"
              alt="AM-PCD Logo"
              width={32}
              height={32}
              className="object-cover rounded-full bg-white dark:bg-white"
              unoptimized
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-(--bpds-on-surface-variant)">
            {systemLabel}
          </p>
          {/* <h1 className="mt-2 text-lg font-bold leading-6 text-(--bpds-on-surface)">
            {title}
          </h1> */}
        </div>

        <nav
          className="flex-1 space-y-4 overflow-y-auto"
          aria-label={navigationLabel}
        >
          {Array.from(new Set(navItems.map((item) => item.group || ""))).map(
            (groupKey, groupIndex) => (
              <div key={groupKey || groupIndex} className="space-y-1">
                {groupKey && groupKey !== "main" && (
                  <div className="px-3 mb-2 mt-4 text-[0.65rem] font-bold uppercase tracking-wider text-(--bpds-on-surface-variant)/70">
                    {t(`dashboard.group.${groupKey}`, {
                      defaultValue: groupKey,
                    })}
                  </div>
                )}
                {navItems
                  .filter((item) => (item.group || "") === groupKey)
                  .map((item) => {
                    const isActive = item.key === activeNav;
                    const NavIcon = navIconMap[item.icon];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onSelectNav(item.key);
                          onClose();
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                          isActive
                            ? "border-transparent bg-(--bpds-primary-container) text-white shadow-(--bpds-shadow-level-2)"
                            : "border-transparent text-(--bpds-on-surface-variant) hover:border-(--bpds-outline-variant) hover:bg-(--bpds-surface-container-low)"
                        }`}
                      >
                        <NavIcon
                          className="h-5 w-5 shrink-0"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium">
                          {item.label ?? item.labelKey}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ),
          )}
        </nav>

        <div className="mt-2 border-t border-(--bpds-outline-variant) pt-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left text-(--bpds-error) hover:border-(--bpds-error) hover:bg-(--bpds-error)/10 transition"
            onClick={() => {
              logout();
            }}
          >
            <LogOut
              className="h-5 w-5 shrink-0"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">
              {t("common.logout", { defaultValue: "Logout" })}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
