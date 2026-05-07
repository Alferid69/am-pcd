export type RoleKey = "admin" | "bureau" | "zone" | "woreda" | "retailer";

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
  | "map_pin"
  | "shopping_bag";

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
    woredaOffice?: { _id: string; name: string };
  };
  requestedItems: StockRequestItem[];
  status: string;
  timeline: StockRequestTimeline[];
  createdAt: string;
  updatedAt: string;
};

export type AllocationItem = {
  commodity: {
    _id: string;
    name: string;
    unit?: string;
    baseUnit?: string;
    bulkUnit?: string;
  };
  quantity: number;
  _id: string;
};

export type Allocation = {
  _id: string;
  stockRequest: string | StockRequest;
  retailerCooperative: {
    _id: string;
    name: string;
    woredaOffice?: { _id: string; name: string };
  };
  allocatedItems: AllocationItem[];
  allocatedBy?: string;
  status: "DISPATCHED" | "DELIVERED";
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  _id: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  age: number;
  fayda: string;
  phone: string;
  woreda: string;
  kebele: string;
  houseNumber: string;
  status: "available" | "taken";
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerPayload = Omit<
  Customer,
  "_id" | "createdAt" | "updatedAt"
>;

export type RetailerCooperative = {
  _id: string;
  name: string;
  woredaOffice?: { _id: string; name: string };
  availableCommodity?: {
    commodity: { _id: string; name: string; baseUnit: string; price: number };
    quantity: number;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  _id: string;
  retailer: {
    _id: string;
    name: string;
    woredaOffice: { _id: string; name: string };
  };
  customerFayda: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    fayda: string;
  };
  commodity: {
    _id: string;
    name: string;
    price: number;
    baseUnit: string;
    bulkUnit: string;
  };
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};
