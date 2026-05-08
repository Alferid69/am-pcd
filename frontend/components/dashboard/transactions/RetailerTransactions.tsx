"use client";

import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import TransactionList from "./TransactionList";
import InventoryOverview from "./InventoryOverview";
import { Store } from "lucide-react";
import { useT } from "next-i18next/client";

export default function RetailerTransactions() {
  const { t } = useT("common");
  const { worksAt: retailerId } = useAuth();

  if (!retailerId) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
            <Store className="w-6 h-6 text-(--bpds-primary)" /> {t("transactions.salesAndTransactions")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("transactions.manageSubtitle")}
          </p>
        </div>
      </div>

      <InventoryOverview retailerId={retailerId} />

      <TransactionList retailerId={retailerId} />
    </div>
  );
}
