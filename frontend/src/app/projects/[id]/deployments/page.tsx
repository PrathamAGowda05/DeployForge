"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";

interface Deployment {
  id: number;
  project_id: number;
  status: string;
  commit_hash: string | null;
  logs: string | null;
  created_at: string;
  host_port: number | null;
  container_id: string | null;
  image_name: string | null;
}

export default function DeploymentHistoryPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [deployments, setDeployments] = useState<Deployment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchDeployments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/projects/${projectId}/deployments`,
        getAuthConfig(),
      );

      setDeployments(response.data);
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Failed to load deployments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const deleteDeployment = async (deploymentId: number) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/projects/${projectId}/deployments/${deploymentId}`,
        getAuthConfig(),
      );

      fetchDeployments();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to delete deployment");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader index="02 — DEPLOYMENTS" title="Deployment History" />
        <Spinner label="Loading deployments" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        index="02 — DEPLOYMENTS"
        title="Deployment History"
        subtitle={`Project ${projectId}`}
        actions={
          <Button onClick={() => router.push(`/projects/${projectId}`)}>
            Back to Project
          </Button>
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {deployments.length === 0 ? (
        <div className="border border-border-subtle bg-bg-surface p-8 text-center">
          <p className="font-mono text-xs text-text-muted">{"// NO DEPLOYMENTS"}</p>
          <p className="mt-2 text-sm text-text-secondary">No deployments found.</p>
        </div>
      ) : (
        <div className="border border-border-subtle">
          <div className="hidden border-b border-border-subtle bg-bg-surface px-4 py-2 sm:grid sm:grid-cols-[80px_1fr_120px_140px_1fr] sm:gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">ID</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Status</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Port</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Created</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Actions</span>
          </div>

          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="border-b border-border-subtle px-4 py-4 last:border-b-0 sm:grid sm:grid-cols-[80px_1fr_120px_140px_1fr] sm:items-center sm:gap-4 sm:py-3"
            >
              <span className="font-mono text-sm text-text-primary">
                #{deployment.id}
              </span>

              <div className="mt-2 sm:mt-0">
                <StatusBadge status={deployment.status} />
              </div>

              <span className="mt-2 font-mono text-xs text-text-secondary sm:mt-0">
                {deployment.host_port || "N/A"}
              </span>

              <span className="mt-2 font-mono text-xs text-text-muted sm:mt-0">
                {deployment.created_at}
              </span>

              <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    router.push(
                      `/projects/${projectId}/deployments/${deployment.id}`,
                    )
                  }
                >
                  View
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteDeployment(deployment.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
