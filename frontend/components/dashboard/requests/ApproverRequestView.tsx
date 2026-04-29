"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
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
  DialogFooter,
} from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";
import type { StockRequest } from "../types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateStockRequestAction } from "../../../api/apiStockRequests";
import { fetchRetailerPerformance } from "../../../api/apiRetailers";

interface ApproverRequestViewProps {
  requests: StockRequest[];
  isLoading: boolean;
  userRole: string;
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

const RequestTable = ({
  data,
  showActions = false,
  isLoading,
  onPerformance,
  onApprove,
  onReject,
}: {
  data: StockRequest[];
  showActions?: boolean;
  isLoading: boolean;
  onPerformance: (req: StockRequest) => void;
  onApprove: (req: StockRequest) => void;
  onReject: (req: StockRequest) => void;
}) => (
  <Table>
    <TableHeader className="bg-(--bpds-surface-container-low)">
      <TableRow>
        <TableHead className="w-30">Date</TableHead>
        <TableHead>Cooperative</TableHead>
        <TableHead>Requested Items</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {isLoading ? (
        <TableRow>
          <TableCell
            colSpan={5}
            className="h-24 text-center text-muted-foreground"
          >
            Loading requests...
          </TableCell>
        </TableRow>
      ) : data.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={5}
            className="h-24 text-center text-muted-foreground"
          >
            No requests found.
          </TableCell>
        </TableRow>
      ) : (
        data.map((req) => (
          <TableRow key={req._id}>
            <TableCell className="font-medium text-slate-600 dark:text-slate-300">
              {format(new Date(req.createdAt), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <div className="font-semibold text-(--bpds-on-surface)">
                {req.retailerCooperative?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Woreda: {req.retailerCooperative?.woredaOffice?.name || "N/A"}
              </div>
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
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPerformance(req)}
                >
                  <BarChart3 className="w-4 h-4 mr-1 text-blue-500" />{" "}
                  Performance
                </Button>

                {showActions && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => onApprove(req)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onReject(req)}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export default function ApproverRequestView({
  requests,
  isLoading,
  userRole,
}: ApproverRequestViewProps) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(
    null,
  );
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );
  const [remarks, setRemarks] = useState("");
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);

  const { data: performanceData, isFetching: isFetchingPerformance } = useQuery(
    {
      queryKey: [
        "retailerPerformance",
        selectedRequest?.retailerCooperative?._id,
      ],
      queryFn: () => {
        if (!selectedRequest?.retailerCooperative?._id) return null;
        return fetchRetailerPerformance(
          selectedRequest.retailerCooperative._id,
        );
      },
      enabled: isPerformanceOpen && !!selectedRequest?.retailerCooperative?._id,
    },
  );

  // We split requests into "Needs Attention" and "History"
  const pendingRequests = requests.filter(
    (r) =>
      (userRole === "woreda" && r.status === "PENDING_WOREDA") ||
      (userRole === "zone" && r.status === "PENDING_ZONE") ||
      ((userRole === "bureau" || userRole === "admin") &&
        r.status === "PENDING_BUREAU"),
  );

  const historyRequests = requests.filter((r) => !pendingRequests.includes(r));

  const actionMutation = useMutation({
    mutationFn: (data: {
      id: string;
      action: "APPROVED" | "REJECTED";
      remarks: string;
    }) =>
      updateStockRequestAction(data.id, {
        action: data.action,
        remarks: data.remarks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockRequests"] });
      setSelectedRequest(null);
      setActionType(null);
      setRemarks("");
    },
  });

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequest && actionType) {
      actionMutation.mutate({
        id: selectedRequest._id,
        action: actionType,
        remarks,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Needs Attention Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-(--bpds-on-surface) mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-yellow-500" /> Needs Attention
          <Badge variant="secondary" className="ml-3">
            {pendingRequests.length}
          </Badge>
        </h2>
        <Card className="shadow-(--bpds-shadow-level-1) border-yellow-200 dark:border-yellow-900/30 overflow-hidden">
          <CardContent className="p-0">
            <RequestTable
              data={pendingRequests}
              showActions={true}
              isLoading={isLoading}
              onPerformance={(req) => {
                setSelectedRequest(req);
                setIsPerformanceOpen(true);
              }}
              onApprove={(req) => {
                setSelectedRequest(req);
                setActionType("APPROVED");
              }}
              onReject={(req) => {
                setSelectedRequest(req);
                setActionType("REJECTED");
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-(--bpds-on-surface) mb-4 flex items-center">
          <ChevronRight className="w-5 h-5 mr-2 text-slate-400" /> Request
          History
        </h2>
        <Card className="shadow-(--bpds-shadow-level-1) border-(--bpds-outline-variant) overflow-hidden opacity-80">
          <CardContent className="p-0">
            <RequestTable
              data={historyRequests}
              showActions={false}
              isLoading={isLoading}
              onPerformance={(req) => {
                setSelectedRequest(req);
                setIsPerformanceOpen(true);
              }}
              onApprove={(req) => {
                setSelectedRequest(req);
                setActionType("APPROVED");
              }}
              onReject={(req) => {
                setSelectedRequest(req);
                setActionType("REJECTED");
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={!!actionType}
        onOpenChange={(open) => !open && setActionType(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVED" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVED"
                ? "You are about to approve this request and forward it to the next authority."
                : "You are about to reject this request. Please provide a reason below."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleActionSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (Optional)</label>
              <Textarea
                placeholder="Enter any comments or reasons..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required={actionType === "REJECTED"}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActionType(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={actionType === "REJECTED" ? "destructive" : "default"}
                disabled={actionMutation.isPending}
              >
                {actionMutation.isPending
                  ? "Processing..."
                  : `Confirm ${actionType === "APPROVED" ? "Approval" : "Rejection"}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Performance Dialog (Mock) */}
      <Dialog open={isPerformanceOpen} onOpenChange={setIsPerformanceOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Retailer Performance</DialogTitle>
            <DialogDescription>
              Overview for {selectedRequest?.retailerCooperative?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="col-span-2">
              {isFetchingPerformance ? (
                <div className="h-48 flex flex-col items-center justify-center text-sm text-muted-foreground gap-3">
                  <div className="w-8 h-8 border-2 border-(--bpds-primary) border-t-transparent rounded-full animate-spin" />
                  Loading 30-day performance data...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        30-Day Efficiency
                      </p>
                      <p className={`text-3xl font-bold ${
                        (performanceData?.overallEfficiency || 0) > 70 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-amber-600 dark:text-amber-400"
                      }`}>
                        {performanceData?.overallEfficiency || 0}%
                      </p>
                      <p className="text-[10px] mt-1 text-slate-400">
                        Total Sold / Total Allocated
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        Total Volume
                      </p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {(performanceData?.totalSold || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] mt-1 text-slate-400">
                        Units sold in last 30 days
                      </p>
                    </div>
                  </div>

                  {/* Commodity Breakdown */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                      Commodity Efficiency (Last 30 Days)
                    </h4>
                    <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                          <TableRow>
                            <TableHead className="text-[10px] h-8 py-1">Commodity</TableHead>
                            <TableHead className="text-[10px] h-8 py-1 text-right">Allocated</TableHead>
                            <TableHead className="text-[10px] h-8 py-1 text-right">Sold</TableHead>
                            <TableHead className="text-[10px] h-8 py-1 text-right">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {performanceData?.commodityBreakdown?.length > 0 ? (
                            performanceData.commodityBreakdown.map((item: any, idx: number) => (
                              <TableRow key={idx} className="h-10">
                                <TableCell className="py-1.5 text-xs font-medium">
                                  {item.name}
                                </TableCell>
                                <TableCell className="py-1.5 text-xs text-right text-muted-foreground">
                                  {item.allocated} {item.unit}
                                </TableCell>
                                <TableCell className="py-1.5 text-xs text-right font-semibold">
                                  {item.sold} {item.unit}
                                </TableCell>
                                <TableCell className="py-1.5 text-xs text-right">
                                  <Badge variant="outline" className={`text-[10px] h-5 ${
                                    item.efficiency > 70 ? "text-green-600 border-green-100" : "text-amber-600 border-amber-100"
                                  }`}>
                                    {item.efficiency}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-xs text-muted-foreground">
                                No allocations received in the last 30 days.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Link href={`/dashboard/transactions/retailer/${selectedRequest?.retailerCooperative?._id}`} className="w-full">
                      <Button variant="outline" className="w-full text-xs gap-2">
                        View Full Transaction History
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPerformanceOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
