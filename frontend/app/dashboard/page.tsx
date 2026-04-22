"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import DashboardStatsGrid from "../../components/dashboard/StatsGrid";
import TransactionsPanel from "../../components/dashboard/TransactionsPanel";
import QuickActionsPanel from "../../components/dashboard/QuickActionsPanel";
import type {
  DashboardAction,
  DashboardStat,
  DashboardTransaction,
} from "../../components/dashboard/types";

export default function DashboardPage() {
  const { t } = useTranslation();

  const dashboardStats: DashboardStat[] = [
    {
      id: "allocations",
      label: t("dashboard.stats.allocations"),
      value: "12,460 qtl",
      trend: "+8.2%",
      color: "var(--bpds-primary)",
    },
    {
      id: "requests",
      label: t("dashboard.stats.pendingRequests"),
      value: "27",
      trend: "-3.1%",
      color: "var(--bpds-tertiary)",
    },
    {
      id: "transactions",
      label: t("dashboard.stats.transactionsToday"),
      value: "418",
      trend: "+12.4%",
      color: "var(--bpds-secondary)",
    },
    {
      id: "stock",
      label: t("dashboard.stats.lowStockItems"),
      value: "5",
      trend: t("dashboard.alert"),
      color: "var(--bpds-error)",
    },
  ];

  const transactions: DashboardTransaction[] = [
    {
      id: 1,
      commodity: "Sugar",
      from: t("dashboard.demo.zoneOffice"),
      to: t("dashboard.demo.cooperative"),
      quantity: "350 qtl",
      status: t("dashboard.status.inTransit"),
    },
    {
      id: 2,
      commodity: "Sugar",
      from: t("dashboard.demo.zoneOffice"),
      to: t("dashboard.demo.cooperative"),
      quantity: "350 qtl",
      status: t("dashboard.status.inTransit"),
    },
    {
      id: 3,
      commodity: "Sugar",
      from: t("dashboard.demo.zoneOffice"),
      to: t("dashboard.demo.cooperative"),
      quantity: "350 qtl",
      status: t("dashboard.status.inTransit"),
    },
    {
      id: 4,
      commodity: "Sugar",
      from: t("dashboard.demo.zoneOffice"),
      to: t("dashboard.demo.cooperative"),
      quantity: "350 qtl",
      status: t("dashboard.status.inTransit"),
    },
  ];

  const quickActions: DashboardAction[] = [
    { key: "newRequest", label: t("dashboard.actions.newRequest") },
    { key: "allocateStock", label: t("dashboard.actions.allocateStock") },
    {
      key: "registerTransaction",
      label: t("dashboard.actions.registerTransaction"),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardStatsGrid stats={dashboardStats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TransactionsPanel
          title={t("dashboard.recentTransactions")}
          viewAllLabel={t("dashboard.viewAll")}
          columnLabels={{
            commodity: t("dashboard.table.commodity"),
            from: t("dashboard.table.from"),
            to: t("dashboard.table.to"),
            quantity: t("dashboard.table.quantity"),
            status: t("dashboard.table.status"),
          }}
          rows={transactions}
        />

        <QuickActionsPanel
          title={t("dashboard.quickActions")}
          actions={quickActions}
        />
      </div>
    </div>
  );
}
