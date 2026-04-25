"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Package,
  Activity,
  DollarSign,
} from "lucide-react";
import { fetchRetailerTransactions } from "../../../api/apiTransactions";
import type { Transaction } from "../../dashboard/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

export default function TransactionList({
  retailerId,
}: {
  retailerId: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: [
      "transactions",
      retailerId,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: () =>
      fetchRetailerTransactions(retailerId, appliedStartDate, appliedEndDate),
    enabled: !!retailerId,
  });

  const handleApplyDates = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const filteredTransactions = transactions.filter((t) => {
    const term = searchTerm.toLowerCase();
    const customerName = `${t.customer?.firstName || ""} ${
      t.customer?.lastName || ""
    }`.toLowerCase();

    return (
      customerName.includes(term) ||
      t.customerFayda.includes(term) ||
      t.commodity?.name.toLowerCase().includes(term)
    );
  });

  // Calculate summaries
  const totalTransactions = filteredTransactions.length;

  const commodityVolumes: Record<string, { volume: number; unit: string; revenue: number }> = {};
  filteredTransactions.forEach((t) => {
    if (t.commodity?.name) {
      if (!commodityVolumes[t.commodity.name]) {
        commodityVolumes[t.commodity.name] = {
          volume: 0,
          unit: t.commodity.baseUnit || "units",
          revenue: 0,
        };
      }
      commodityVolumes[t.commodity.name].volume += t.amount || 0;
      commodityVolumes[t.commodity.name].revenue += (t.amount || 0) * (t.commodity.price || 0);
    }
  });

  const totalRevenue = Object.values(commodityVolumes).reduce(
    (sum, data) => sum + data.revenue,
    0
  );

  const getStatusBadge = (status: string) => {
    if (status === "success") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Success
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-500">
        <XCircle className="w-3 h-3 mr-1" /> {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--bpds-on-surface)">
              {totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--bpds-on-surface)">
              {totalRevenue.toLocaleString("en-ET", {
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-base font-normal text-muted-foreground">ETB</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all commodities
            </p>
          </CardContent>
        </Card>

        {Object.entries(commodityVolumes).map(([name, data]) => (
          <Card
            key={name}
            className="bg-(--bpds-surface) border-(--bpds-outline-variant)"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {name} Dispensed
              </CardTitle>
              <Package className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-(--bpds-on-surface)">
                {data.volume.toLocaleString()}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  {data.unit}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue:{" "}
                <span className="font-medium text-(--bpds-on-surface)">
                  {data.revenue.toLocaleString("en-ET", { maximumFractionDigits: 2 })} ETB
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 flex flex-col xl:flex-row gap-4 justify-between items-center">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, Fayda ID, or commodity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium hidden sm:inline">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium hidden sm:inline">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleApplyDates} variant="default" className="w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
              {(appliedStartDate || appliedEndDate) && (
                <Button onClick={handleClearDates} variant="outline" className="w-full sm:w-auto px-3">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-(--bpds-surface-container-low)">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Fayda ID</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No transactions found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {t.createdAt
                          ? format(new Date(t.createdAt), "MMM d, yyyy h:mm a")
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.customer
                        ? `${t.customer.firstName} ${t.customer.lastName}`
                        : "Unknown"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {t.customerFayda}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-(--bpds-primary)" />
                        {t.commodity?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {t.amount} {t.commodity?.baseUnit || "units"}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(t.status)}
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
