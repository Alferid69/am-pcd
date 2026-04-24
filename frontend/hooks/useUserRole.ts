import { useState, useEffect } from "react";
import type { RoleKey } from "@/components/dashboard/types";
import { isRoleKey } from "@/components/dashboard/data";

/**
 * Reads the current user's role from localStorage in a SSR-safe, reactive way.
 *
 * - Returns the correct value immediately on the client (no hydration flash).
 * - Defaults to "retailer" on the server and before hydration.
 * - Re-evaluates whenever the component mounts (e.g. after navigating back
 *   from a 404 page), so the role is never stale.
 */
export function useUserRole(): RoleKey {
  const [role, setRole] = useState<RoleKey>(() => {
    if (typeof window === "undefined") return "retailer";
    const stored = localStorage.getItem("userRole") || "";
    return isRoleKey(stored) ? stored : "retailer";
  });

  // Re-sync on every mount to handle navigation from unmatched routes
  useEffect(() => {
    const stored = localStorage.getItem("userRole") || '';
    const resolved: RoleKey = isRoleKey(stored) ? stored : "retailer";
    setRole(resolved);
  }, []);

  return role;
}
