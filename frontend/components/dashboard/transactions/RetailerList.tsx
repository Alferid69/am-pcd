"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Store, Search, Filter, ArrowRight } from "lucide-react";
import { fetchRetailers } from "../../../api/apiRetailers";
import type { RetailerCooperative } from "../../dashboard/types";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

export default function RetailerList() {
  const { userRole, worksAt } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: retailers = [], isLoading } = useQuery<RetailerCooperative[]>({
    queryKey: ["retailers"],
    queryFn: fetchRetailers,
  });

  const isWoreda = userRole === "woreda";

  // Woreda users can only see retailers in their woreda
  const filteredRetailers = retailers.filter((r) => {
    if (isWoreda && r.woredaOffice?._id !== worksAt) {
      return false;
    }
    return r.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
            <Store className="w-6 h-6 text-(--bpds-primary)" /> Retailer Transactions
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Select a retailer to view their sales transactions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search retailers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-(--bpds-surface-container-low)">
              <TableRow>
                <TableHead>Retailer Name</TableHead>
                {!isWoreda && <TableHead>Woreda</TableHead>}
                <TableHead>Available Commodities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={isWoreda ? 3 : 4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading retailers...
                  </TableCell>
                </TableRow>
              ) : filteredRetailers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isWoreda ? 3 : 4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No retailers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRetailers.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    {!isWoreda && (
                      <TableCell>{r.woredaOffice?.name || "N/A"}</TableCell>
                    )}
                    <TableCell>
                      {r.availableCommodity?.length || 0} items
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/transactions/retailer/${r._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-900/20"
                        >
                          View Transactions
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
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
