"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import CustomersView from "../../../../components/dashboard/customers/CustomersView";
import { useT } from "next-i18next/client";

export default function CustomersPage() {
  const { userRole: role, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useT("common");

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    // Only redirect after component has mounted on the client to avoid hydration mismatch
    // and wait for role to be truly resolved from localStorage.
    if (mounted && role === "retailer") {
      router.replace("/dashboard");
    }
  }, [mounted, role, router]);

  // Optionally show a loading state while mounting or resolving redirect
  if (!mounted || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-xl text-muted-foreground animate-pulse">
          {t("customers.loadingCustomers")}
        </p>
      </div>
    );
  }

  // Double check, render nothing before redirect processes
  if (role === "retailer") {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <CustomersView />
    </div>
  );
}
