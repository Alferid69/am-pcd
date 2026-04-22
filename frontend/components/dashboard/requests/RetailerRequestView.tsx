"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
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
import { createStockRequest } from "../../../api/apiStockRequests";

interface RetailerRequestViewProps {
  requests: StockRequest[];
  isLoading: boolean;
}

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
    case "FULFILLED":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
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

export default function RetailerRequestView({
  requests,
  isLoading,
}: RetailerRequestViewProps) {
  const queryClient = useQueryClient();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  // Form State for multiple commodities
  const [requestedItems, setRequestedItems] = useState<
    { commodity: string; quantity: number; unit: string }[]
  >([{ commodity: "", quantity: 1, unit: "" }]);

  const { data: commodities = [] } = useQuery<Commodity[]>({
    queryKey: ["commodities"],
    queryFn: fetchCommodities,
  });

  const createMutation = useMutation({
    mutationFn: createStockRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockRequests"] });
      setIsNewRequestOpen(false);
      setRequestedItems([{ commodity: "", quantity: 1, unit: "" }]);
    },
  });

  const handleAddCommodity = () => {
    setRequestedItems([
      ...requestedItems,
      { commodity: "", quantity: 1, unit: "" },
    ]);
  };

  const handleRemoveCommodity = (index: number) => {
    setRequestedItems(requestedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: "commodity" | "quantity" | "unit",
    value: string | number,
  ) => {
    const newItems = [...requestedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRequestedItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out incomplete items
    const validItems = requestedItems.filter(
      (item) => item.commodity && item.quantity > 0 && item.unit !== "",
    );
    if (validItems.length > 0) {
      createMutation.mutate({ requestedItems: validItems });
    }
  };

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

        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger>
            <Button className="bg-(--bpds-primary) text-(--bpds-on-primary) hover:bg-(--bpds-primary)/90 shadow-(--bpds-shadow-level-2)">
              <Plus className="mr-2 h-4 w-4" /> New Stock Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-125">
            <DialogHeader>
              <DialogTitle>Create Stock Request</DialogTitle>
              <DialogDescription>
                Select the commodities and quantities you need. You can request
                multiple items at once.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 pt-4 min-w-full"
            >
              {requestedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-end gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all"
                >
                  <div className="flex-1 space-y-2">
                    <Label>Commodity</Label>
                    <Select
                      value={item.commodity}
                      onValueChange={(val) =>
                        handleItemChange(index, "commodity", val!)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select commodity" />
                      </SelectTrigger>
                      <SelectContent>
                        {commodities.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name} ({c.baseUnit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(val) =>
                        handleItemChange(index, "unit", val!)
                      }
                      disabled={!item.commodity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.commodity &&
                          commodities.find((c) => c._id === item.commodity) && (
                            <>
                              <SelectItem
                                value={
                                  commodities.find(
                                    (c) => c._id === item.commodity,
                                  )!.baseUnit
                                }
                              >
                                {
                                  commodities.find(
                                    (c) => c._id === item.commodity,
                                  )!.baseUnit
                                }
                              </SelectItem>
                              <SelectItem
                                value={
                                  commodities.find(
                                    (c) => c._id === item.commodity,
                                  )!.bulkUnit
                                }
                              >
                                {
                                  commodities.find(
                                    (c) => c._id === item.commodity,
                                  )!.bulkUnit
                                }
                              </SelectItem>
                            </>
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                  {requestedItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleRemoveCommodity(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCommodity}
                className="w-full border-dashed"
              >
                <Plus className="mr-2 h-4 w-4" /> Add another commodity
              </Button>

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
                    !requestedItems[0].commodity ||
                    !requestedItems[0].unit
                  }
                >
                  {createMutation.isPending
                    ? "Submitting..."
                    : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
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
                      <Dialog>
                        <DialogTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                          >
                            <FileText className="h-4 w-4 mr-2" /> Timeline
                          </Button>
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
                    </TableCell>
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
