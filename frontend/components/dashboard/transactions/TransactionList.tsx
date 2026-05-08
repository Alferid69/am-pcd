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
  Download,
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
import { useT } from "next-i18next/client";

export default function TransactionList({
  retailerId,
}: {
  retailerId: string;
}) {
  const { t } = useT("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", retailerId, appliedStartDate, appliedEndDate],
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

  const handleExportCSV = () => {
    if (!filteredTransactions.length) return;

    const headers = [
      t("common.customer"),
      t("dashboard.table.commodity"),
      `${t("dashboard.table.quantity")} (${t("common.kg")})`,
      t("transactions.unitPrice"),
      t("transactions.totalPrice"),
      t("common.date"),
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      const stringVal = String(val);
      if (
        stringVal.includes(",") ||
        stringVal.includes("\"") ||
        stringVal.includes("\n") ||
        stringVal.includes("\r")
      ) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    const rows = filteredTransactions.map((tx) => {
      const customer =
        `${tx.customer?.firstName || ""} ${tx.customer?.lastName || ""}`.trim();
      const commodity = tx.commodity?.name || "";
      const qty = tx.amount || 0;
      const price = tx.commodity?.price || 0;
      const total = qty * price;
      const date = tx.createdAt
        ? ` ${format(new Date(tx.createdAt), "MMM d, yyyy h:mm a")}`
        : "";

      return [customer, commodity, qty, price, total, date]
        .map(escapeCSV)
        .join(",");
    });

    const csvContent = [headers.map(escapeCSV).join(","), ...rows].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Transactions_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const term = searchTerm.toLowerCase();
    const customerName = `${tx.customer?.firstName || ""} ${
      tx.customer?.lastName || ""
    }`.toLowerCase();

    return (
      customerName.includes(term) ||
      tx.customerFayda.includes(term) ||
      tx.commodity?.name.toLowerCase().includes(term)
    );
  });

  // Calculate summaries
  const totalTransactions = filteredTransactions.length;

  const commodityVolumes: Record<
    string,
    { volume: number; unit: string; revenue: number }
  > = {};
  filteredTransactions.forEach((tx) => {
    if (tx.commodity?.name) {
      if (!commodityVolumes[tx.commodity.name]) {
        commodityVolumes[tx.commodity.name] = {
          volume: 0,
          unit: tx.commodity.baseUnit || "units",
          revenue: 0,
        };
      }
      commodityVolumes[tx.commodity.name].volume += tx.amount || 0;
      commodityVolumes[tx.commodity.name].revenue +=
        (tx.amount || 0) * (tx.commodity.price || 0);
    }
  });

  const totalRevenue = Object.values(commodityVolumes).reduce(
    (sum, data) => sum + data.revenue,
    0,
  );

  const getStatusBadge = (status: string) => {
    if (status === "success") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />{" "}
          {t("dashboard.status.success")}
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
              {t("transactions.totalTransactions")}
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--bpds-on-surface)">
              {totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("transactions.inSelectedPeriod")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("transactions.totalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--bpds-on-surface)">
              {totalRevenue.toLocaleString("en-ET", {
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-base font-normal text-muted-foreground">
                ETB
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("transactions.acrossAllCommodities")}
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
                {name} {t("transactions.dispensed")}
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
                {t("transactions.revenueLabel")}{" "}
                <span className="font-medium text-(--bpds-on-surface)">
                  {data.revenue.toLocaleString("en-ET", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  ETB
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
              placeholder={t("transactions.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium hidden sm:inline">
                {t("common.from")}
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground font-medium hidden sm:inline">
                {t("common.to")}
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleApplyDates}
                variant="default"
                className="w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" /> {t("common.filter")}
              </Button>
              {(appliedStartDate || appliedEndDate) && (
                <Button
                  onClick={handleClearDates}
                  variant="outline"
                  className="w-full sm:w-auto px-3"
                >
                  {t("common.clear")}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="w-full sm:w-auto px-3"
                disabled={filteredTransactions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                {t("common.export")}
              </Button>
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
                <TableHead>{t("common.dateTime")}</TableHead>
                <TableHead>{t("common.customer")}</TableHead>
                <TableHead>{t("customers.faydaID")}</TableHead>
                <TableHead>{t("dashboard.table.commodity")}</TableHead>
                <TableHead className="text-right">
                  {t("dashboard.table.quantity")}
                </TableHead>
                <TableHead className="text-right">
                  {t("common.status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t("transactions.loadingTransactions")}
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t("transactions.noTransactionsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {tx.createdAt
                          ? format(new Date(tx.createdAt), "MMM d, yyyy h:mm a")
                          : t("common.na")}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.customer
                        ? `${tx.customer.firstName} ${tx.customer.lastName}`
                        : t("common.unknown")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.customerFayda}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-(--bpds-primary)" />
                        {tx.commodity?.name || t("common.unknown")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {tx.amount} {tx.commodity?.baseUnit || t("common.units")}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(tx.status)}
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
