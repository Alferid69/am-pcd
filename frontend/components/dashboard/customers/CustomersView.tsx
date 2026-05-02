"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Users, CheckCircle2, XCircle, Search, Filter, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  fetchCustomers,
  fetchCustomersByWoreda,
} from "../../../api/apiCustomers";
import { fetchWoredas } from "../../../api/apiWoredas";
import type { Customer } from "../types";
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
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import CreateCustomerDialog from "./CreateCustomerDialog";
import EditCustomerDialog from "./EditCustomerDialog";
import { Button } from "@/components/ui/button";

export default function CustomersView() {
  const { userRole, worksAt: woredaId } = useAuth();
  const searchParams = useSearchParams();
  const initialWoredaFilter = searchParams.get("woredaId") ?? "all";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "taken"
  >("all");
  const [woredaFilter, setWoredaFilter] = useState<string>(initialWoredaFilter);

  const isWoreda = userRole === "woreda";
  const canManageCustomer = userRole === "woreda" || userRole === "admin";
  const canViewFilters =
    userRole === "zone" || userRole === "bureau" || userRole === "admin";

  const { data: woredas = [] } = useQuery({
    queryKey: ["woredas"],
    queryFn: fetchWoredas,
    enabled: canViewFilters,
  });

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["customers", isWoreda ? "woreda" : "all", woredaId],
    queryFn: () => {
      if (isWoreda && woredaId) {
        return fetchCustomersByWoreda(woredaId);
      }
      return fetchCustomers();
    },
    // Don't fetch if Woreda but no Woreda ID is found
    enabled: !isWoreda || !!woredaId,
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fayda.includes(searchTerm) ||
      c.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const woredaIdStr = typeof c.woreda === 'string' ? c.woreda : (c.woreda as any)?._id;
    const matchesWoreda = woredaFilter === "all" || woredaIdStr === woredaFilter;
    return matchesSearch && matchesStatus && matchesWoreda;
  });

  const getStatusBadge = (status: string) => {
    if (status === "available") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-500 dark:hover:bg-green-900/40">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Available
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/80">
        <XCircle className="w-3 h-3 mr-1" /> Taken
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
            <Users className="w-6 h-6 text-(--bpds-primary)" /> Customers
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {isWoreda
              ? "Manage customers in your Woreda."
              : "Oversight of all registered customers across the regions."}
          </p>
        </div>

        {canManageCustomer && (
          <div className="flex-shrink-0">
            <CreateCustomerDialog />
          </div>
        )}
      </div>

      {canViewFilters && (
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, Fayda, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="taken">Taken</option>
              </select>
            </div>
            {canViewFilters && (
              <div className="relative w-full sm:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={woredaFilter}
                  onChange={(e) => setWoredaFilter(e.target.value)}
                >
                  <option value="all">All Woredas</option>
                  {woredas.map((w: any) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-(--bpds-surface-container-low)">
              <TableRow>
                <TableHead>Fayda ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-mono text-xs">
                      {customer.fayda}
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Link href={`/dashboard/customers/${customer._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-800 dark:hover:bg-gray-900/50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                      {canManageCustomer && <EditCustomerDialog customer={customer} />}
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
