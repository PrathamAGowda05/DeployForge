"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const { isAuthenticated, loading: authLoading, logout } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/me");

        setUser(response.data);
      } catch (error: any) {
        console.error(error);

        if (error.response?.status === 401) {
          logout();
          return;
        }

        setError(error.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <main>
        <h1>Profile</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>Profile</h1>

        <p>{error || "Unable to load profile"}</p>

        <button onClick={() => router.push("/projects")}>
          Back to Projects
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Profile</h1>

      {error && <p>{error}</p>}

      <section>
        <h2>Account Information</h2>

        <p>ID: {user.id}</p>

        <p>Email: {user.email}</p>
      </section>

      <button onClick={() => router.push("/projects")}>Projects</button>

      <button onClick={logout}>Logout</button>
    </main>
  );
}
