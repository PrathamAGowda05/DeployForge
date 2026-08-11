"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
      <AppShell>
        <PageHeader index="02 — PROFILE" title="Profile" />
        <Spinner label="Loading profile" />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <PageHeader index="02 — PROFILE" title="Profile" />

        <Alert>{error || "Unable to load profile"}</Alert>

        <Button onClick={() => router.push("/projects")} className="mt-4">
          Back to Projects
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        index="02 — PROFILE"
        title="Profile"
        subtitle="Account information"
        actions={
          <>
            <Button onClick={() => router.push("/projects")}>Projects</Button>
            <Button variant="danger" onClick={logout}>
              Logout
            </Button>
          </>
        }
      />

      {error && (
        <Alert className="mb-4">{error}</Alert>
      )}

      <Card>
        <CardHeader label="// ACCOUNT">
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                User ID
              </p>
              <p className="font-mono text-sm text-text-primary">{user.id}</p>
            </div>
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Email
              </p>
              <p className="font-mono text-sm text-text-primary">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
