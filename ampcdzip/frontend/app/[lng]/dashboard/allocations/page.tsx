import React from "react";
import AllocationsView from "../../../../components/dashboard/allocations/AllocationsView";

export const metadata = {
  title: "Allocations | AM-PCD",
};

export default function AllocationsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <AllocationsView />
    </div>
  );
}
