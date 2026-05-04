"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MapPin, Search, ArrowRight, Building2 } from "lucide-react";
import { fetchWoredas } from "../../../../api/apiWoredas";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { useT } from "next-i18next/client";
import { useParams } from "next/navigation";

export default function WoredasPage() {
  const { userRole, isLoading: authLoading } = useAuth();
  const { t } = useT("common");
  const params = useParams();
  const lng = params?.lng || "en";
  const [searchTerm, setSearchTerm] = useState("");

  const { data: woredas = [], isLoading } = useQuery({
    queryKey: ["woredas"],
    queryFn: fetchWoredas,
  });

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground animate-pulse">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (userRole !== "zone" && userRole !== "bureau" && userRole !== "admin") {
    return (
      <div className="flex justify-center py-20 text-red-500">
        {t("common.accessDenied")}
      </div>
    );
  }

  const safeWoredas = Array.isArray(woredas)
    ? woredas
    : (woredas as any)?.data || (woredas as any)?.docs || [];
  const filteredWoredas = safeWoredas.filter((w: any) =>
    (w?.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface) flex items-center gap-2">
            <MapPin className="w-6 h-6 text-(--bpds-primary)" />{" "}
            {t("woredas.offices")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("woredas.subtitle")}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("woredas.searchPlaceholder")}
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
                <TableHead>{t("woredas.name")}</TableHead>
                <TableHead>{t("common.email")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t("woredas.loadingWoredas")}
                  </TableCell>
                </TableRow>
              ) : filteredWoredas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t("woredas.noWoredas")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredWoredas.map((w: any) => (
                  <TableRow key={w._id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {w.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {w.email || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${lng}/dashboard/woredas/${w._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-900/20"
                        >
                          {t("common.details")}
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
