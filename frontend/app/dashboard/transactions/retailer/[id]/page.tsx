"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Store } from "lucide-react";
import TransactionList from "../../../../../components/dashboard/transactions/TransactionList";
import InventoryOverview from "../../../../../components/dashboard/transactions/InventoryOverview";
import { fetchRetailerById } from "../../../../../api/apiRetailers";
import { Button } from "../../../../../components/ui/button";

export default function RetailerTransactionDetail() {
  const params = useParams();
  const router = useRouter();
  const retailerId = params.id as string;

  const { data: retailer, isLoading } = useQuery({
    queryKey: ["retailer", retailerId],
    queryFn: () => fetchRetailerById(retailerId),
    enabled: !!retailerId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="-ml-4 text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Retailers
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-(--bpds-primary-container) rounded-full">
          <Store className="w-8 h-8 text-(--bpds-primary)" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface)">
            {isLoading ? "Loading..." : retailer?.name || "Retailer Transactions"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {retailer?.woredaOffice?.name
              ? `Woreda: ${retailer.woredaOffice.name}`
              : "Detailed transaction history."}
          </p>
        </div>
      </div>

      <InventoryOverview retailerId={retailerId} />

      <TransactionList retailerId={retailerId} />
    </div>
  );
}
