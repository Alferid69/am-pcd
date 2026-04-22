import { ArrowRight } from "lucide-react";
import type { DashboardAction } from "./types";

type QuickActionsPanelProps = {
  title: string;
  actions: DashboardAction[];
};

export default function QuickActionsPanel({
  title,
  actions,
}: QuickActionsPanelProps) {
  return (
    <article className="rounded-2xl border border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) p-6 shadow-(--bpds-shadow-level-1)">
      <h3 className="text-lg font-semibold text-(--bpds-on-surface)">
        {title}
      </h3>
      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-(--bpds-outline-variant) bg-(--bpds-surface-container-low) px-4 py-3 text-sm font-medium text-(--bpds-on-surface) transition hover:border-(--bpds-primary)"
          >
            <span>{action.label}</span>
            <ArrowRight
              className="h-4.5 w-4.5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </article>
  );
}
