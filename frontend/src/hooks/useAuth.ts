"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    setToken(storedToken);
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/login");
  };

  const requireAuth = () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/login");
      return false;
    }

    return true;
  };

  return {
    token,
    loading,
    isAuthenticated: !!token,
    logout,
    requireAuth,
  };
}
