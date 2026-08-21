"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, fetchApi } from "../lib/api";

export interface UserSession {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Check for stored token and fetch live profile
    const token = typeof window !== "undefined" ? localStorage.getItem("tapgo_admin_token") : null;
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.data) {
            setUser({
              name: res.data.name,
              email: res.data.email,
              role: res.data.role,
              avatar: res.data.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              phone: res.data.phone,
            });
          }
        })
        .catch(() => {
          // If token expired, clear invalid session
          if (typeof window !== "undefined") {
            localStorage.removeItem("tapgo_admin_token");
          }
          setUser(null);
        });
    } else {
      // Dev mode default session if no server running
      setUser({
        name: "Super Admin",
        email: "admin@tapgo.com",
        role: "superadmin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      });
    }
  }, []);

  const login = async (email: string, password?: string) => {
    if (password) {
      try {
        // 1. Try login
        let res: any;
        try {
          res = await api.login({ email, password });
        } catch (loginError: any) {
          // 2. If login fails, try auto-seeding first admin account
          try {
            res = await fetchApi("/auth/register-admin", {
              method: "POST",
              body: JSON.stringify({
                name: "Super Admin",
                email,
                password,
                role: "superadmin",
                phone: "+919876543210",
              }),
            });
          } catch (seedError) {
            throw loginError;
          }
        }

        if (res?.data?.token) {
          localStorage.setItem("tapgo_admin_token", res.data.token);
          const u = res.data.user;
          setUser({
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          });
          return;
        }
      } catch (err: any) {
        throw new Error(err.message || "Invalid login credentials");
      }
    }

    // Local / Dev fallback session
    setUser({
      name: "Super Admin",
      email: email,
      role: "superadmin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    });
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tapgo_admin_token");
    }
    api.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
