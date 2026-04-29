"use client";

import React, { useState, useMemo } from "react";
import { Plus, CheckCircle2, Clock, XCircle, FileText, Pencil, AlertCircle } from "lucide-react";
import { format } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import type { StockRequest } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCommodities, Commodity } from "../../../api/apiCommodities";
import { createStockRequest, updateRequestItems } from "../../../api/apiStockRequests";

interface RetailerRequestViewProps {
  requests: StockRequest[];
  isLoading: boolean;
}

type RequestItem = { commodity: string; quantity: number; unit: string };

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING_WOREDA":
    case "PENDING_ZONE":
    case "PENDING_BUREAU":
      const displayStatus = status
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ");
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
        >
          <Clock className="w-3 h-3 mr-1" /> {displayStatus}
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
        </Badge>
      );
    case "FULFILLED":
      return (
        <Badge
          variant="default"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" /> Fulfilled
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
        >
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Reusable form rows for commodity items
function CommodityItemRows({
  items,
  commodities,
  blockedCommodityIds,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: {
  items: RequestItem[];
  commodities: Commodity[];
  blockedCommodityIds: Set<string>;
  onItemChange: (index: number, field: keyof RequestItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const selectedCommodity = commodities.find((c) => c._id === item.commodity);
        return (
          <div
            key={index}
            className="flex items-start gap-4 p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all"
          >
            <div className="flex-1 space-y-2">
              <Label>Commodity</Label>
              <Select
                value={item.commodity}
                onValueChange={(val) => onItemChange(index, "commodity", val!)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commodity">
                    {selectedCommodity?.name || (item.commodity ? "Unknown Commodity" : "")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {commodities.map((c) => {
                    const isBlocked = blockedCommodityIds.has(c._id) && c._id !== item.commodity;
                    return (
                      <SelectItem key={c._id} value={c._id} disabled={isBlocked}>
                        {c.name}{isBlocked ? " (Pending)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-28 space-y-2 shrink-0">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  onItemChange(index, "quantity", parseInt(e.target.value) || 0)
                }
              />
            </div>
            
            <div className="w-32 space-y-2 shrink-0">
              <Label>Unit</Label>
              <Select
                value={item.unit ?? ""}
                onValueChange={(val) => onItemChange(index, "unit", val!)}
                disabled={!item.commodity}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCommodity && (
                    <>
                      <SelectItem value={selectedCommodity.baseUnit}>
                        {selectedCommodity.baseUnit}
                      </SelectItem>
                      <SelectItem value={selectedCommodity.bulkUnit}>
                        {selectedCommodity.bulkUnit}
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {items.length > 1 && (
              <div className="space-y-2 shrink-0">
                <Label className="invisible block">Action</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => onRemoveItem(index)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddItem}
        className="w-full border-dashed"
      >
        <Plus className="mr-2 h-4 w-4" /> Add another commodity
      </Button>
    </div>
  );
}

export default function RetailerRequestView({
  requests,
  isLoading,
}: RetailerRequestViewProps) {
  const queryClient = useQueryClient();

  // New request dialog state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newItems, setNewItems] = useState<RequestItem[]>([{ commodity: "", quantity: 1, unit: "" }]);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit request dialog state
  const [editingRequest, setEditingRequest] = useState<StockRequest | null>(null);
  const [editItems, setEditItems] = useState<RequestItem[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: commodities = [] } = useQuery<Commodity[]>({
    queryKey: ["commodities"],
    queryFn: fetchCommodities,
  });

  // Compute which commodity IDs already have a pending request — for blocking in the NEW form
  const alreadyPendingCommodityIds = useMemo<Set<string>>(() => {
    const pendingStatuses = ["PENDING_WOREDA", "PENDING_ZONE", "PENDING_BUREAU"];
    const ids = new Set<string>();
    requests
      .filter((r) => pendingStatuses.includes(r.status))
      .forEach((r) =>
        r.requestedItems.forEach((item) => {
          if (item.commodity?._id) ids.add(item.commodity._id);
        })
      );
    return ids;
  }, [requests]);

  // --- CREATE MUTATION ---
  const createMutation = useMutation({
    mutationFn: createStockRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockRequests"] });
      setIsNewRequestOpen(false);
      setNewItems([{ commodity: "", quantity: 1, unit: "" }]);
      setCreateError(null);
    },
    onError: (err: any) => {
      setCreateError(
        err?.response?.data?.message ?? "Failed to submit request. Please try again."
      );
    },
  });

  // --- EDIT MUTATION ---
  const editMutation = useMutation({
    mutationFn: (payload: { id: string; requestedItems: RequestItem[] }) =>
      updateRequestItems(payload.id, { requestedItems: payload.requestedItems }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockRequests"] });
      setEditingRequest(null);
      setEditError(null);
    },
    onError: (err: any) => {
      setEditError(
        err?.response?.data?.message ?? "Failed to update request. Please try again."
      );
    },
  });

  // Generic item-change handler factory
  const makeItemChangeHandler =
    (setter: React.Dispatch<React.SetStateAction<RequestItem[]>>) =>
    (index: number, field: keyof RequestItem, value: string | number) => {
      setter((prev) => {
        const next = [...prev];
        // If commodity changes, clear unit
        if (field === "commodity") {
          next[index] = { ...next[index], commodity: value as string, unit: "" };
        } else {
          next[index] = { ...next[index], [field]: value };
        }
        return next;
      });
    };

  const handleNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const valid = newItems.filter((i) => i.commodity && i.quantity > 0 && i.unit);
    if (valid.length > 0) createMutation.mutate({ requestedItems: valid });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    const valid = editItems.filter((i) => i.commodity && i.quantity > 0 && i.unit);
    if (editingRequest && valid.length > 0) {
      editMutation.mutate({ id: editingRequest._id, requestedItems: valid });
    }
  };

  const openEditDialog = (req: StockRequest) => {
    setEditingRequest(req);
    setEditError(null);
    setEditItems(
      req.requestedItems.map((item) => ({
        commodity: item.commodity?._id ?? "",
        quantity: item.quantity,
        unit: item.unit,
      }))
    );
  };

  // For the edit dialog, we block commodities that are pending in OTHER requests
  const editBlockedCommodityIds = useMemo<Set<string>>(() => {
    if (!editingRequest) return new Set();
    const pendingStatuses = ["PENDING_WOREDA", "PENDING_ZONE", "PENDING_BUREAU"];
    const editingItemCommodityIds = new Set(
      editingRequest.requestedItems.map((i) => i.commodity?._id)
    );
    const ids = new Set<string>();
    requests
      .filter((r) => pendingStatuses.includes(r.status) && r._id !== editingRequest._id)
      .forEach((r) =>
        r.requestedItems.forEach((item) => {
          if (item.commodity?._id && !editingItemCommodityIds.has(item.commodity._id)) {
            ids.add(item.commodity._id);
          }
        })
      );
    return ids;
  }, [requests, editingRequest]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface)">
            My Requests
          </h2>
          <p className="text-muted-foreground">
            Manage your stock requests and track their approval status.
          </p>
        </div>

        {/* NEW REQUEST DIALOG */}
        <Dialog
          open={isNewRequestOpen}
          onOpenChange={(open) => {
            setIsNewRequestOpen(open);
            if (!open) {
              setNewItems([{ commodity: "", quantity: 1, unit: "" }]);
              setCreateError(null);
            }
          }}
        >
          <DialogTrigger
            render={
              <Button className="bg-(--bpds-primary) text-(--bpds-on-primary) hover:bg-(--bpds-primary)/90 shadow-(--bpds-shadow-level-2)" />
            }
          >
            <Plus className="mr-2 h-4 w-4" /> New Stock Request
          </DialogTrigger>
          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle>Create Stock Request</DialogTitle>
              <DialogDescription>
                Select the commodities and quantities you need. Commodities marked
                &quot;pending&quot; already have an active request.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleNewSubmit} className="space-y-4 pt-4 min-w-full">
              <CommodityItemRows
                items={newItems}
                commodities={commodities}
                blockedCommodityIds={alreadyPendingCommodityIds}
                onItemChange={makeItemChangeHandler(setNewItems)}
                onAddItem={() => setNewItems((p) => [...p, { commodity: "", quantity: 1, unit: "" }])}
                onRemoveItem={(i) => setNewItems((p) => p.filter((_, idx) => idx !== i))}
              />

              {createError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {createError}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewRequestOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    !newItems[0].commodity ||
                    !newItems[0].unit
                  }
                >
                  {createMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* REQUESTS TABLE */}
      <Card className="shadow-(--bpds-shadow-level-1) border-(--bpds-outline-variant)">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-(--bpds-surface-container-low)">
              <TableRow>
                <TableHead className="w-30">Date</TableHead>
                <TableHead>Requested Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No requests found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium text-slate-600 dark:text-slate-300">
                      {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {req.requestedItems.map((item, idx) => (
                          <span key={idx} className="text-sm">
                            <span className="font-semibold text-(--bpds-on-surface)">
                              {item.quantity}
                            </span>{" "}
                            {item.unit} of {item.commodity?.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* EDIT button — only for PENDING_WOREDA requests */}
                        {req.status === "PENDING_WOREDA" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950"
                            onClick={() => openEditDialog(req)}
                          >
                            <Pencil className="h-4 w-4 mr-1.5" /> Edit
                          </Button>
                        )}

                        {/* TIMELINE button */}
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                              />
                            }
                          >
                            <FileText className="h-4 w-4 mr-1.5" /> Timeline
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Timeline</DialogTitle>
                              <DialogDescription>
                                History and remarks for this request.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              {req.timeline.map((event, idx) => (
                                <div
                                  key={idx}
                                  className="flex gap-4 items-start border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-4 relative pb-4"
                                >
                                  <div
                                    className={`absolute w-3 h-3 rounded-full -left-1.75 top-1 ${
                                      event.action === "REJECTED"
                                        ? "bg-red-500"
                                        : event.action === "APPROVED"
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                    }`}
                                  />
                                  <div>
                                    <p className="text-sm font-semibold">
                                      {event.action} by {event.role}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      {format(new Date(event.timestamp), "PPpp")}
                                    </p>
                                    {event.remarks && (
                                      <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded text-sm text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800">
                                        &quot;{event.remarks}&quot;
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* EDIT REQUEST DIALOG */}
      <Dialog
        open={!!editingRequest}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRequest(null);
            setEditError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Edit Stock Request</DialogTitle>
            <DialogDescription>
              Update your requested items before the Woreda reviews them.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4 min-w-full">
            <CommodityItemRows
              items={editItems}
              commodities={commodities}
              blockedCommodityIds={editBlockedCommodityIds}
              onItemChange={makeItemChangeHandler(setEditItems)}
              onAddItem={() => setEditItems((p) => [...p, { commodity: "", quantity: 1, unit: "" }])}
              onRemoveItem={(i) => setEditItems((p) => p.filter((_, idx) => idx !== i))}
            />

            {editError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {editError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRequest(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  editMutation.isPending ||
                  !editItems[0]?.commodity ||
                  !editItems[0]?.unit
                }
              >
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

