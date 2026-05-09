"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { RoleKey } from "@/components/dashboard/types";
import { isRoleKey } from "@/components/dashboard/data";
import apiClient from "@/lib/api";

interface AuthState {
  userRole: RoleKey;
  userName: string;
  worksAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
}

interface AuthContextType extends AuthState {
  login: (data: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const defaultState: AuthState = {
  userRole: "retailer",
  userName: "",
  worksAt: null,
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/me");
      const user = response.data.data;
      const role = isRoleKey(user.role) ? user.role : "retailer";
      
      let worksAt = null;
      if (user.worksAt) {
        worksAt = typeof user.worksAt === "object" ? user.worksAt._id : user.worksAt;
      }

      setState({
        userRole: role,
        userName: `${user.firstName} ${user.lastName}`,
        worksAt,
        isAuthenticated: true,
        isLoading: false,
        user,
      });
    } catch (error) {
      setState({
        ...defaultState,
        isLoading: false,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUser();
  }, [fetchUser]);

  const login = useCallback((data: any) => {
    const user = data.data.user;
    const role = isRoleKey(user.role) ? user.role : "retailer";
    
    let worksAt = null;
    if (user.worksAt) {
      worksAt = typeof user.worksAt === "object" ? user.worksAt._id : user.worksAt;
    }

    setState({
      userRole: role,
      userName: `${user.firstName} ${user.lastName}`,
      worksAt,
      isAuthenticated: true,
      isLoading: false,
      user,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.get("/users/logout");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      const currentLng = window.location.pathname.split("/")[1] || "en";
      setState({
        ...defaultState,
        isLoading: false,
      });
      window.location.href = `/${currentLng}/login`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
