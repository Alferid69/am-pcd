"use client";

import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import TransactionList from "./TransactionList";
import MakeSaleDialog from "./MakeSaleDialog";
import { Store } from "lucide-react";

export default function RetailerTransactions() {
  const { worksAt: retailerId } = useAuth();

  if (!retailerId) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
            <Store className="w-6 h-6 text-(--bpds-primary)" /> Sales & Transactions
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your daily sales and view your transaction history.
          </p>
        </div>
        <div className="flex-shrink-0">
          <MakeSaleDialog />
        </div>
      </div>

      <TransactionList retailerId={retailerId} />
    </div>
  );
}
