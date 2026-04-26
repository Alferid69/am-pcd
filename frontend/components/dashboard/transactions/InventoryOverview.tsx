"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, AlertTriangle } from "lucide-react";
import { fetchRetailerById } from "../../../api/apiRetailers";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

export default function InventoryOverview({ retailerId }: { retailerId: string }) {
  const { data: retailer, isLoading } = useQuery({
    queryKey: ["retailer", retailerId],
    queryFn: () => fetchRetailerById(retailerId),
    enabled: !!retailerId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  const inventory = retailer?.availableCommodity || [];

  if (inventory.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <Package className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">No inventory data available for this retailer.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Current Inventory Stock
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventory.map((item: any) => {
          const isLowStock = item.quantity < 50; // Threshold for low stock warning
          return (
            <Card 
              key={item._id} 
              className={`bg-(--bpds-surface) border-(--bpds-outline-variant) transition-all hover:shadow-md ${isLowStock ? 'ring-1 ring-amber-500/30' : ''}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                  {item.commodity.name}
                </CardTitle>
                <Package className={`h-3.5 w-3.5 ${isLowStock ? 'text-amber-500' : 'text-blue-500'}`} />
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-(--bpds-on-surface)">
                    {item.quantity.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground font-bold uppercase tracking-tight">
                    {item.commodity.baseUnit}
                  </span>
                </div>
                {isLowStock && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Low Stock Warning
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
