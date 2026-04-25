"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import CustomersView from "../../../components/dashboard/customers/CustomersView";

export default function CustomersPage() {
  const { userRole: role, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          Loading Customers...
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
