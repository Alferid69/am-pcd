"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStockRequests } from "../../../api/apiStockRequests";
import RetailerRequestView from "../../../components/dashboard/requests/RetailerRequestView";
import ApproverRequestView from "../../../components/dashboard/requests/ApproverRequestView";
import { Package } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export default function StockRequestPage() {
  const { userRole } = useAuth();

  const {
    data: requests = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stockRequests"],
    queryFn: () => fetchStockRequests(),
    // Poll every 30 seconds for live updates since this is a critical dashboard
    refetchInterval: 30000,
  });

  const isApprover = ["woreda", "zone", "bureau", "admin"].includes(userRole);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p>Failed to load stock requests. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center">
            <Package className="w-8 h-8 mr-3 text-(--bpds-primary)" />
            Stock Requests
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {isApprover
              ? "Review and manage incoming commodity requests from cooperatives within your jurisdiction."
              : "Request basic commodities from the central logistics office and track the progress of your active requests."}
          </p>
        </div>
      </div>

      <div className="bg-(--bpds-surface) rounded-2xl">
        {userRole === "retailer" ? (
          <RetailerRequestView requests={requests} isLoading={isLoading} />
        ) : (
          <ApproverRequestView
            requests={requests}
            isLoading={isLoading}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
}
