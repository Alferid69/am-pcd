import type { DashboardTransaction } from "./types";
import { Download } from "lucide-react";

type TransactionsPanelProps = {
  title: string;
  viewAllLabel: string;
  columnLabels: {
    commodity: string;
    from: string;
    to: string;
    quantity: string;
    status: string;
  };
  rows: DashboardTransaction[];
};

export default function TransactionsPanel({
  title,
  viewAllLabel,
  columnLabels,
  rows,
}: TransactionsPanelProps) {
  const handleExport = () => {
    // Basic CSV Export implementation
    const headers = [
      columnLabels.commodity,
      columnLabels.from,
      columnLabels.to,
      columnLabels.quantity,
      columnLabels.status,
    ];
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        [row.commodity, row.from, row.to, row.quantity, row.status]
          // Quote strings to handle commas inside the text automatically
          .map((val) => `"${val}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Transactions_Export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article className="xl:col-span-2 rounded-2xl border border-(--bpds-outline-variant) bg-(--bpds-surface-container-lowest) p-6 shadow-(--bpds-shadow-level-1)">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-(--bpds-on-surface)">
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-(--bpds-outline-variant) px-3 py-1.5 text-sm font-medium text-(--bpds-on-surface-variant) hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            type="button"
            className="rounded-lg border border-(--bpds-outline-variant) px-3 py-1.5 text-sm font-medium text-(--bpds-on-surface-variant)"
          >
            {viewAllLabel}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.06em] text-(--bpds-on-surface-variant)">
              <th className="px-3 py-2 font-semibold">
                {columnLabels.commodity}
              </th>
              <th className="px-3 py-2 font-semibold">{columnLabels.from}</th>
              <th className="px-3 py-2 font-semibold">{columnLabels.to}</th>
              <th className="px-3 py-2 font-semibold">
                {columnLabels.quantity}
              </th>
              <th className="px-3 py-2 font-semibold">{columnLabels.status}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="rounded-xl bg-(--bpds-surface-container-low) text-sm"
              >
                <td className="rounded-l-xl px-3 py-3 font-medium text-(--bpds-on-surface)">
                  {row.commodity}
                </td>
                <td className="px-3 py-3 text-(--bpds-on-surface-variant)">
                  {row.from}
                </td>
                <td className="px-3 py-3 text-(--bpds-on-surface-variant)">
                  {row.to}
                </td>
                <td className="px-3 py-3 text-(--bpds-on-surface)">
                  {row.quantity}
                </td>
                <td className="rounded-r-xl px-3 py-3">
                  <span className="inline-flex rounded-full bg-[rgba(0,110,44,0.16)] px-3 py-1 text-xs font-semibold text-(--bpds-secondary)">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
