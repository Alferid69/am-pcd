"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Store,
  ExternalLink,
  Mail,
} from "lucide-react";
import { fetchWoredaStats } from "../../../../../api/apiWoredas";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { useT } from "next-i18next/client";

export default function WoredaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useT("common");
  const woredaId = params.id as string;
  const lng = params?.lng || "en";

  const { data, isLoading } = useQuery({
    queryKey: ["woreda-stats", woredaId],
    queryFn: () => fetchWoredaStats(woredaId),
    enabled: !!woredaId,
  });

  const woreda = data?.woreda;
  const customerCount = data?.customerCount ?? 0;
  const retailerCount = data?.retailerCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="-ml-4 text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("woredas.backToWoredas")}
      </Button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-(--bpds-primary-container) rounded-full">
          <Building2 className="w-8 h-8 text-(--bpds-primary)" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface)">
            {isLoading
              ? t("common.loading")
              : (woreda?.name ?? t("woredas.detail"))}
          </h2>
          {woreda?.email && (
            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {woreda.email}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant) hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("woredas.registeredCustomers")}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-(--bpds-on-surface)">
              {isLoading ? "—" : customerCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("woredas.customersUnderWoreda")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant) hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.nav.retailerCooperatives")}
            </CardTitle>
            <Store className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-(--bpds-on-surface)">
              {isLoading ? "—" : retailerCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("woredas.activeRetailers")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-(--bpds-on-surface)">
            {t("dashboard.quickActions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Link href={`/${lng}/dashboard/customers?woredaId=${woredaId}`}>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Users className="h-4 w-4" />
              {t("woredas.viewCustomers")}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
          <Link href={`/${lng}/dashboard/transactions?woredaId=${woredaId}`}>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Store className="h-4 w-4" />
              {t("woredas.viewTransactions")}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
