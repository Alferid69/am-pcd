"use client";

import React, { useState } from "react";
import { Plus, Package, AlertCircle } from "lucide-react";
import { useT } from "next-i18next/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import { createAllocation } from "../../../api/apiAllocations";
import { fetchStockRequests } from "../../../api/apiStockRequests";
import type { StockRequest } from "../types";

export default function CreateAllocationDialog() {
  const { t } = useT("common");
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [allocatedItems, setAllocatedItems] = useState<
    { commodity: string; quantity: number }[]
  >([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch all stock requests (backend filters to those Bureau can see)
  const { data: allRequests = [], isLoading: isLoadingRequests } = useQuery<
    StockRequest[]
  >({
    queryKey: ["stockRequests"],
    queryFn: () => fetchStockRequests(),
  });

  // Since we added the backend hook to set FULFILLED on allocation, APPROVED ones are truly pending allocation
  const approvedRequests = allRequests.filter(
    (req) => req.status === "APPROVED",
  );
  const selectedRequest = approvedRequests.find(
    (r) => r._id === selectedRequestId,
  );

  const createMutation = useMutation({
    mutationFn: createAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["stockRequests"] });
      setIsOpen(false);
      setSelectedRequestId("");
      setAllocatedItems([]);
    },
    onError: (err: any) => {
      setSubmitError(
        err?.response?.data?.message ?? t("allocations.errorFailed"),
      );
    },
  });

  const handleSelectRequest = (id: string | null) => {
    if (!id) {
      setSelectedRequestId("");
      setAllocatedItems([]);
      return;
    }

    setSelectedRequestId(id);
    const req = approvedRequests.find((r) => r._id === id);
    if (req) {
      // Pre-fill the allocation items with the exact requested amounts
      setAllocatedItems(
        req.requestedItems.map((item) => ({
          commodity: item.commodity?._id || "",
          quantity: item.quantity,
        })),
      );
    } else {
      setAllocatedItems([]);
    }
  };

  const handleQuantityChange = (index: number, value: number) => {
    setAllocatedItems((prev) => {
      const next = [...prev];
      next[index].quantity = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedRequest) return;

    // Filter out invalid items (quantity <= 0) just in case
    const validItems = allocatedItems.filter((item) => item.quantity > 0);

    if (validItems.length === 0) {
      setSubmitError(t("allocations.errorQuantity"));
      return;
    }

    createMutation.mutate({
      stockRequest: selectedRequest._id,
      retailerCooperative: selectedRequest.retailerCooperative._id,
      allocatedItems: validItems,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedRequestId("");
          setAllocatedItems([]);
          setSubmitError(null);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="bg-(--bpds-primary) text-(--bpds-on-primary) hover:bg-(--bpds-primary)/90 shadow-(--bpds-shadow-level-2)" />
        }
      >
        <Plus className="mr-2 h-4 w-4" /> {t("allocations.make")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-(--bpds-primary)" />{" "}
            {t("allocations.dispatch")}
          </DialogTitle>
          <DialogDescription>
            {t("allocations.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>{t("allocations.approvedRequest")}</Label>
            <Select
              value={selectedRequestId}
              onValueChange={handleSelectRequest}
              disabled={isLoadingRequests}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingRequests
                      ? t("common.loading")
                      : t("allocations.selectRequest")
                  }
                >
                  {selectedRequest && (
                    <span>
                      {selectedRequest.retailerCooperative?.name} —{" "}
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {approvedRequests.length === 0 && !isLoadingRequests ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {t("allocations.noPendingRequests")}
                  </div>
                ) : (
                  approvedRequests.map((req) => (
                    <SelectItem key={req._id} value={req._id}>
                      {req.retailerCooperative?.name} —{" "}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedRequest && (
            <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 p-4">
              <h4 className="text-sm font-semibold text-(--bpds-on-surface)">
                {t("allocations.itemsToAllocate")}
              </h4>
              <div className="space-y-3">
                {selectedRequest.requestedItems.map((reqItem, idx) => {
                  const allocatedItem = allocatedItems[idx];
                  if (!allocatedItem) return null;

                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">
                          {t("dashboard.table.commodity")}
                        </Label>
                        <div className="text-sm font-medium pt-1">
                          {reqItem.commodity?.name} ({reqItem.unit})
                        </div>
                      </div>
                      <div className="w-24">
                        <Label className="text-xs text-muted-foreground">
                          {t("allocations.requested")}
                        </Label>
                        <div className="text-sm pt-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-md">
                          {reqItem.quantity}
                        </div>
                      </div>
                      <div className="w-28">
                        <Label className="text-xs text-muted-foreground">
                          {t("allocations.allocate")}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          className="mt-1"
                          value={allocatedItem.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              idx,
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {submitError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!selectedRequestId || createMutation.isPending}
            >
              {createMutation.isPending
                ? t("allocations.allocating")
                : t("allocations.dispatch")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
