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
import LogViewer from "@/components/ui/LogViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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

export default function DeploymentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const deploymentId = params.deploymentId as string;

  const [deployment, setDeployment] = useState<Deployment | null>(null);

  const [logs, setLogs] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchDeployment = async () => {
    try {
      const deploymentResponse = await axios.get(
        `http://localhost:4000/api/projects/${projectId}/deployments/${deploymentId}`,

        getAuthConfig(),
      );

      setDeployment(deploymentResponse.data);

      const logsResponse = await axios.get(
        `http://localhost:4000/api/projects/${projectId}/deployments/${deploymentId}/logs`,

        getAuthConfig(),
      );

      setLogs(logsResponse.data.logs || "");
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Failed loading deployment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployment();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Deployment Details" />
        <Spinner label="Loading deployment" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Deployment Details"
        subtitle={`Deployment #${deploymentId}`}
        actions={
          <Button onClick={() => router.push(`/projects/${projectId}/deployments`)}>
            Back to History
          </Button>
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {deployment && (
        <>
          <Card className="mb-6">
            <CardHeader label="// DEPLOYMENT INFO">
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Deployment ID
                  </p>
                  <p className="font-mono text-sm text-text-primary">{deployment.id}</p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Status
                  </p>
                  <StatusBadge status={deployment.status} />
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Created
                  </p>
                  <p className="font-mono text-sm text-text-secondary">{deployment.created_at}</p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Commit
                  </p>
                  <p className="font-mono text-sm text-text-secondary">
                    {deployment.commit_hash || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Image
                  </p>
                  <p className="font-mono text-sm text-text-secondary truncate">
                    {deployment.image_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Container
                  </p>
                  <p className="font-mono text-sm text-text-secondary truncate">
                    {deployment.container_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    Host Port
                  </p>
                  <p className="font-mono text-sm text-text-secondary">
                    {deployment.host_port || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <LogViewer logs={logs} placeholder="No logs available" />
        </>
      )}
    </AppShell>
  );
}
