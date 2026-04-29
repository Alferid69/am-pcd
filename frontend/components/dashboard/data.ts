import type { NavItem, RoleKey } from "./types";

export const baseNavItems: NavItem[] = [
  { key: "overview", labelKey: "dashboard.nav.overview", icon: "dashboard", group: "main" },
  {
    key: "stockRequests",
    labelKey: "dashboard.nav.requestStock",
    icon: "inventory_2",
    group: "operations",
  },
  {
    key: "transactions",
    labelKey: "dashboard.nav.transactions",
    icon: "sync_alt",
    group: "operations",
  },
  {
    key: "allocations",
    labelKey: "dashboard.nav.allocations",
    icon: "pie_chart",
    group: "operations",
  },
  {
    key: "customers",
    labelKey: "dashboard.nav.customers",
    icon: "users",
    group: "entities",
  },
  {
    key: "woredas",
    labelKey: "dashboard.nav.woredas",
    icon: "map_pin",
    group: "entities",
  },
  { key: "settings", labelKey: "dashboard.nav.settings", icon: "settings", group: "system" },
];

const HIDDEN_FROM_RETAILER = new Set([
  "customers",
  "woredas",
]);

const retailerNavItems = baseNavItems.filter(
  (item) => !HIDDEN_FROM_RETAILER.has(item.key)
);

// Woredas page is only relevant for zone/bureau/admin oversight roles.
const HIDDEN_FROM_WOREDA = new Set(["woredas"]);
const woredaNavItems = baseNavItems.filter(
  (item) => !HIDDEN_FROM_WOREDA.has(item.key)
);

export const roleNavMap: Record<RoleKey, NavItem[]> = {
  admin: baseNavItems,
  bureau: baseNavItems,
  zone: baseNavItems,
  woreda: woredaNavItems,
  retailer: retailerNavItems,
};

export const roleLabels: Record<RoleKey, string> = {
  admin: "dashboard.roles.admin",
  bureau: "dashboard.roles.retailerCooperativesBureau",
  zone: "dashboard.roles.zoneTradeBureau",
  woreda: "dashboard.roles.woredaOffice",
  retailer: "dashboard.roles.retailerCooperative",
};

export const isRoleKey = (value: string): value is RoleKey => {
  return value in roleNavMap;
};
