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
}

interface AuthContextType extends AuthState {
  login: (data: any) => void;
  logout: () => void;
}

const defaultState: AuthState = {
  userRole: "admin",
  userName: "",
  worksAt: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/me");
      const user = response.data.data;
      const role = isRoleKey(user.role) ? user.role : "admin";
      
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
      });
    } catch (error) {
      setState({
        ...defaultState,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback((data: any) => {
    const user = data.data.user;
    const role = isRoleKey(user.role) ? user.role : "admin";
    
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
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.get("/users/logout");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setState({
        ...defaultState,
        isLoading: false,
      });
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
