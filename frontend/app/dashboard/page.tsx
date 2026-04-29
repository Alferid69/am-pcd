"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { fetchOverviewStats } from "../../api/apiOverview";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

// ─── Icon map matching backend icon keys ─────────────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  activity:      <Activity className="h-4 w-4" />,
  trending_up:   <TrendingUp className="h-4 w-4" />,
  dollar:        <DollarSign className="h-4 w-4" />,
  package:       <Package className="h-4 w-4" />,
  users:         <Users className="h-4 w-4" />,
  store:         <Store className="h-4 w-4" />,
  clock:         <Clock className="h-4 w-4" />,
  check:         <CheckCircle2 className="h-4 w-4" />,
  x_circle:      <XCircle className="h-4 w-4" />,
  arrow_forward: <ArrowRight className="h-4 w-4" />,
};

// ─── Colour token map ─────────────────────────────────────────────────────────
const colorMap: Record<string, { icon: string; bg: string; text: string }> = {
  blue:   { icon: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-700 dark:text-blue-300" },
  indigo: { icon: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-300" },
  green:  { icon: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/20",  text: "text-green-700 dark:text-green-300" },
  amber:  { icon: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-900/20",  text: "text-amber-700 dark:text-amber-300" },
  red:    { icon: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20",    text: "text-red-700 dark:text-red-300" },
  purple: { icon: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300" },
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success:        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    PENDING_WOREDA: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    PENDING_ZONE:   "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    PENDING_BUREAU: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    APPROVED:       "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    REJECTED:       "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  const label: Record<string, string> = {
    success:        "Success",
    PENDING_WOREDA: "Pending Woreda",
    PENDING_ZONE:   "Pending Zone",
    PENDING_BUREAU: "Pending Bureau",
    APPROVED:       "Approved",
    REJECTED:       "Rejected",
  };
  return (
    <Badge className={`text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label[status] ?? status}
    </Badge>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ card }: { card: any }) {
  const colors = colorMap[card.color] ?? colorMap.blue;
  return (
    <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant) hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {card.label}
        </CardTitle>
        <div className={`rounded-full p-1.5 ${colors.bg} ${colors.icon}`}>
          {iconMap[card.icon] ?? <Activity className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-(--bpds-on-surface)">
          {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
          {card.unit && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {card.unit}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const { userName, userRole } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["overview-stats", userRole],
    queryFn: fetchOverviewStats,
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-(--bpds-on-surface)">
          {greeting}, {userName?.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening in your dashboard today.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          Failed to load overview stats. Please refresh the page.
        </div>
      )}

      {data && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.statCards.map((card: any) => (
              <StatCard key={card.id} card={card} />
            ))}
          </div>

          {/* Bottom grid: recent activity + quick actions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="xl:col-span-2 bg-(--bpds-surface) border-(--bpds-outline-variant)">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-(--bpds-on-surface)">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.recentActivity.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No recent activity to show.
                  </div>
                ) : (
                  <ul className="divide-y divide-(--bpds-outline-variant)">
                    {data.recentActivity.map((item: any) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-6 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-(--bpds-on-surface) truncate">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.sub}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <StatusBadge status={item.status} />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(item.date), "MMM d")}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-(--bpds-surface) border-(--bpds-outline-variant)">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-(--bpds-on-surface)">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.quickActions.map((action: any) => (
                  <Button
                    key={action.key}
                    variant="outline"
                    className="w-full justify-between text-left"
                    onClick={() => router.push(action.path)}
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
