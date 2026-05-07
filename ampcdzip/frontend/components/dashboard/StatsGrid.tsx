import type { DashboardStat } from "./types";
import { useT } from "next-i18next/client";

type DashboardStatsGridProps = {
  stats: DashboardStat[];
};

export default function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  const { t } = useT("common");
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.id}
          className="rounded-2xl border border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) p-5 shadow-(--bpds-shadow-level-1)"
        >
          <p className="text-sm text-(--bpds-on-surface-variant)">
            {stat.label}
          </p>
          <p className="mt-3 text-2xl font-bold leading-8 text-(--bpds-on-surface)">
            {stat.value}
          </p>
          <p
            className="mt-2 text-sm font-semibold"
            style={{ color: stat.color }}
          >
            {stat.trend}
          </p>
        </article>
      ))}
    </div>
  );
}
