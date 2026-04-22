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
    key: "retailerCooperatives",
    labelKey: "dashboard.nav.retailerCooperatives",
    icon: "store",
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

export const roleNavMap: Record<RoleKey, NavItem[]> = {
  admin: baseNavItems,
  zone_trade_bureau: baseNavItems,
  woreda_office: baseNavItems,
  retailer_cooperative: baseNavItems,
  retailer_cooperatives_bureau: baseNavItems,
};

export const roleLabels: Record<RoleKey, string> = {
  admin: "dashboard.roles.admin",
  zone_trade_bureau: "dashboard.roles.zoneTradeBureau",
  woreda_office: "dashboard.roles.woredaOffice",
  retailer_cooperative: "dashboard.roles.retailerCooperative",
  retailer_cooperatives_bureau: "dashboard.roles.retailerCooperativesBureau",
};

export const isRoleKey = (value: string): value is RoleKey => {
  return value in roleNavMap;
};
