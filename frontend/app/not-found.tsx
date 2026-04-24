"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard so the client router stays in a clean state.
    // A bare 404 page breaks subsequent router.push() calls in the sidebar.
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">
      Page not found — redirecting…
    </div>
  );
}
