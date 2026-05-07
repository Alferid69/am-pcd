"use client";

import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import RetailerTransactions from "../../../../components/dashboard/transactions/RetailerTransactions";
import RetailerList from "../../../../components/dashboard/transactions/RetailerList";
import { useT } from "next-i18next/client";

export default function TransactionsPage() {
  const { userRole, isLoading } = useAuth();
  const { t } = useT("common");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground animate-pulse">{t("common.loading")}</p>
      </div>
    );
  }

  if (userRole === "retailer") {
    return <RetailerTransactions />;
  }

  if (userRole === "woreda" || userRole === "zone" || userRole === "bureau" || userRole === "admin") {
    return <RetailerList />;
  }

  return (
    <div className="flex justify-center py-20 text-red-500">
      {t("common.accessDenied")}
    </div>
  );
}
