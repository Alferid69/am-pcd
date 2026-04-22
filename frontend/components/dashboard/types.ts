export type RoleKey =
  | "admin"
  | "zone_trade_bureau"
  | "woreda_office"
  | "retailer_cooperative"
  | "retailer_cooperatives_bureau";

export type IconName =
  | "dashboard"
  | "inventory_2"
  | "sync_alt"
  | "settings"
  | "menu"
  | "translate"
  | "light_mode"
  | "dark_mode"
  | "notifications"
  | "account_circle"
  | "arrow_forward"
  | "pie_chart"
  | "users"
  | "store"
  | "map_pin";

export type NavItem = {
  key: string;
  labelKey: string;
  icon: IconName;
  label?: string;
  group?: string;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  trend: string;
  color: string;
};

export type DashboardTransaction = {
  id: number;
  commodity: string;
  from: string;
  to: string;
  quantity: string;
  status: string;
};

export type DashboardAction = {
  key: string;
  label: string;
};

export type StockRequestItem = {
  commodity: {
    _id: string;
    name: string;
    baseUnit: string;
  };
  quantity: number;
  unit: string;
  _id: string;
};

export type StockRequestTimeline = {
  actor: string;
  role: string;
  action: string;
  remarks: string;
  timestamp: string;
  _id: string;
};

export type StockRequest = {
  _id: string;
  retailerCooperative: {
    _id: string;
    name: string;
    woredaOffice?: string;
  };
  requestedItems: StockRequestItem[];
  status: string;
  timeline: StockRequestTimeline[];
  createdAt: string;
  updatedAt: string;
};
