"use client";

import React from "react";
import { format } from "date-fns";
import { PieChart, CheckCircle2, Truck, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllocations, updateAllocationStatus } from "../../../api/apiAllocations";
import type { Allocation } from "../types";
import { useUserRole } from "../../../hooks/useUserRole";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import CreateAllocationDialog from "./CreateAllocationDialog";

export default function AllocationsView() {
  const queryClient = useQueryClient();
  const userRole = useUserRole();

  const { data: allocations = [], isLoading } = useQuery<Allocation[]>({
    queryKey: ["allocations"],
    queryFn: fetchAllocations,
  });

  const deliverMutation = useMutation({
    mutationFn: (id: string) =>
      updateAllocationStatus(id, { status: "DELIVERED", deliveryDate: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
    },
  });

  const canCreate = userRole === "admin" || userRole === "bureau";
  const isWoreda = userRole === "woreda";

  const getStatusBadge = (status: string) => {
    if (status === "DELIVERED") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 hover:bg-green-100">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 hover:bg-yellow-100">
        <Truck className="w-3 h-3 mr-1" /> Dispatched
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
            <PieChart className="w-6 h-6 text-(--bpds-primary)" /> Allocations
          </h2>
          <p className="text-muted-foreground mt-1">
            Track and manage physical stock shipments to cooperatives.
          </p>
        </div>
        
        {canCreate && (
          <CreateAllocationDialog />
        )}
      </div>

      <Card className="shadow-(--bpds-shadow-level-1) border-(--bpds-outline-variant)">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-(--bpds-surface-container-low)">
              <TableRow>
                <TableHead className="w-32">Date</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Shipped Items</TableHead>
                <TableHead>Status</TableHead>
                {isWoreda && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isWoreda ? 5 : 4} className="h-24 text-center text-muted-foreground">
                    Loading allocations...
                  </TableCell>
                </TableRow>
              ) : allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isWoreda ? 5 : 4} className="h-24 text-center text-muted-foreground">
                    No allocations found.
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map((allocation) => (
                  <TableRow key={allocation._id}>
                    <TableCell className="font-medium text-slate-600 dark:text-slate-300">
                      {format(new Date(allocation.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-(--bpds-on-surface)">
                        {allocation.retailerCooperative?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Woreda: {allocation.retailerCooperative?.woredaOffice?.name || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {allocation.allocatedItems.map((item, idx) => (
                          <span key={idx} className="text-sm">
                            <span className="font-semibold text-(--bpds-on-surface)">
                              {item.quantity}
                            </span>{" "}
                            {item.commodity?.bulkUnit || "units"} of {item.commodity?.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                    {isWoreda && (
                      <TableCell className="text-right">
                        {allocation.status === "DISPATCHED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/50"
                            onClick={() => deliverMutation.mutate(allocation._id)}
                            disabled={deliverMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {deliverMutation.isPending ? "Confirming..." : "Confirm Delivery"}
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
