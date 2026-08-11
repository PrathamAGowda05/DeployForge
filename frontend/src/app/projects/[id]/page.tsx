"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import api from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import LogViewer from "@/components/ui/LogViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Project {
  id: number;
  name: string;
  status: string;
  repository_url: string;
}

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

const ACTIVE_STATUSES = ["PENDING", "BUILDING", "STARTING", "RUNNING"];
const CURRENT_STATUSES = [...ACTIVE_STATUSES, "STOPPED", "FAILED"];
const TRANSITIONAL_STATUSES = ["PENDING", "BUILDING", "STARTING"];
const TERMINAL_STATUSES = ["FAILED", "RUNNING", "STOPPED"];

function selectCurrentDeployment(deployments: Deployment[]): Deployment | null {
  if (deployments.length === 0) {
    return null;
  }

  const sorted = [...deployments].sort((a, b) => b.id - a.id);

  const current = sorted.find((deployment) =>
    CURRENT_STATUSES.includes(deployment.status),
  );

  if (current) {
    return current;
  }

  const latest = sorted[0];

  if (TRANSITIONAL_STATUSES.includes(latest.status)) {
    return latest;
  }

  return null;
}

function mergeDeploymentState(
  previous: Deployment | null,
  next: Deployment,
): Deployment {
  if (!previous) {
    return next;
  }

  const preserveStatus =
    TERMINAL_STATUSES.includes(previous.status) &&
    TRANSITIONAL_STATUSES.includes(next.status);

  return {
    ...next,
    status: preserveStatus ? previous.status : next.status,
    image_name: next.image_name ?? previous.image_name,
    container_id: next.container_id ?? previous.container_id,
    host_port: next.host_port ?? previous.host_port,
    commit_hash: next.commit_hash ?? previous.commit_hash,
  };
}

export default function ProjectDashboard() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [logs, setLogs] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const streamRef = useRef<EventSource | null>(null);
  const streamDeploymentIdRef = useRef<number | null>(null);

  const fetchProjectData = async () => {
    try {
      setError("");

      const projectResponse = await api.get(`/api/projects/${projectId}`);

      setProject(projectResponse.data);

      const deploymentResponse = await api.get(
        `/api/projects/${projectId}/deployments`,
      );

      const deployments: Deployment[] = deploymentResponse.data;

      const currentDeployment = selectCurrentDeployment(deployments);

      if (currentDeployment) {
        setDeployment(currentDeployment);
      } else {
        setDeployment(null);
        setLogs("");
      }
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Failed loading project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();

    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, [projectId]);

  const connectLogs = (deploymentId: number, clear = false) => {
    if (streamRef.current) {
      streamRef.current.close();
    }

    streamDeploymentIdRef.current = deploymentId;

    if (clear) {
      setLogs("");
    }

    const stream = new EventSource(
      `http://localhost:4000/api/projects/${projectId}/deployments/${deploymentId}/stream`,
    );

    streamRef.current = stream;

    stream.addEventListener("log", (event: MessageEvent) => {
      setLogs((previous) => previous + event.data + "\n");
    });

    stream.addEventListener("status", (event: MessageEvent) => {
      setDeployment((previous) => {
        if (!previous || previous.id !== deploymentId) {
          return previous;
        }

        return {
          ...previous,
          status: event.data,
        };
      });
    });

    stream.onerror = () => {
      console.log("SSE disconnected");
      stream.close();

      if (streamRef.current === stream) {
        streamRef.current = null;
      }

      window.setTimeout(() => {
        if (streamDeploymentIdRef.current === deploymentId) {
          connectLogs(deploymentId);
        }
      }, 2000);
    };
  };

  useEffect(() => {
    if (!deployment) {
      return;
    }

    if (!TRANSITIONAL_STATUSES.includes(deployment.status)) {
      return;
    }

    const pollDeploymentStatus = async () => {
      try {
        const response = await api.get(
          `/api/projects/${projectId}/deployments/${deployment.id}`,
        );

        setDeployment((previous) =>
          mergeDeploymentState(previous, response.data),
        );
      } catch (pollError) {
        console.error(pollError);
      }
    };

    const interval = window.setInterval(pollDeploymentStatus, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [deployment?.id, deployment?.status, projectId]);

  useEffect(() => {
    if (deployment) {
      connectLogs(deployment.id);
    }
  }, [deployment?.id]);

  const deploy = async () => {
    try {
      setError("");
      setLogs("");

      const response = await api.post(
        `/api/projects/${projectId}/deployments`,
        {},
      );

      const deploymentId = response.data.deploymentId;

      const fetchDeployment = async (previous: Deployment | null) => {
        const [projectResponse, deploymentResponse] = await Promise.all([
          api.get(`/api/projects/${projectId}`),
          api.get(`/api/projects/${projectId}/deployments/${deploymentId}`),
        ]);

        const merged = mergeDeploymentState(
          previous,
          deploymentResponse.data as Deployment,
        );

        setProject(projectResponse.data);
        setDeployment(merged);

        return merged;
      };

      let currentDeployment = await fetchDeployment(null);

      connectLogs(deploymentId, true);

      const needsMetadata = (value: Deployment) =>
        !value.image_name || !value.container_id || value.host_port == null;

      const isInProgress = (value: Deployment) =>
        TRANSITIONAL_STATUSES.includes(value.status) ||
        (value.status === "RUNNING" && needsMetadata(value));

      let attempts = 0;

      while (attempts < 15 && isInProgress(currentDeployment)) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        currentDeployment = await fetchDeployment(currentDeployment);

        if (currentDeployment.status === "FAILED") {
          break;
        }

        attempts++;
      }
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 409) {
        const existingDeploymentId = error.response?.data?.deploymentId;

        if (existingDeploymentId) {
          try {
            const deploymentResponse = await api.get(
              `/api/projects/${projectId}/deployments/${existingDeploymentId}`,
            );

            setDeployment(deploymentResponse.data);
            connectLogs(existingDeploymentId, true);
            setError(
              "A deployment already exists for this project. Use Redeploy to try again.",
            );
            return;
          } catch (loadError) {
            console.error(loadError);
          }
        }

        await fetchProjectData();
        return;
      }

      setError(error.response?.data?.error || "Deployment failed");
    }
  };

  const redeploy = async () => {
    try {
      setError("");
      setLogs("");

      const response = await api.post(
        `/api/projects/${projectId}/redeploy`,
        {},
      );

      const deploymentId: number | undefined =
        response.data.deploymentId ?? response.data.deployment?.id;

      if (!deploymentId) {
        await fetchProjectData();
        return;
      }

      const deploymentResponse = await api.get(
        `/api/projects/${projectId}/deployments/${deploymentId}`,
      );

      const nextDeployment = deploymentResponse.data;

      setDeployment((previous) =>
        mergeDeploymentState(previous, nextDeployment),
      );
      connectLogs(nextDeployment.id, true);
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Redeploy failed");
    }
  };

  const stopDeployment = async () => {
    if (!deployment) {
      return;
    }

    try {
      setError("");

      await api.post(
        `/api/projects/${projectId}/deployments/${deployment.id}/stop`,
        {},
      );

      await fetchProjectData();
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Stop failed");
    }
  };

  const startDeployment = async () => {
    if (!deployment) {
      return;
    }

    try {
      setError("");

      await api.post(
        `/api/projects/${projectId}/deployments/${deployment.id}/start`,
        {},
      );

      await fetchProjectData();
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Start failed");
    }
  };

  const deleteProject = async () => {
    try {
      setError("");

      await api.delete(`/api/projects/${projectId}`);

      if (streamRef.current) {
        streamRef.current.close();
      }

      router.push("/projects");
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Failed to delete project");

      throw error;
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Project Dashboard" />
        <Spinner label="Loading" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Project Dashboard"
        subtitle={project ? `./${project.name.toLowerCase().replace(/\s+/g, "-")}` : undefined}
        actions={
          <>
            <Button onClick={() => router.push(`/projects/${projectId}/deployments`)}>
              Deployment History
            </Button>
            <Button onClick={() => router.push("/projects")}>All Projects</Button>
          </>
        }
      />

      {error && <Alert className="mb-8">{error}</Alert>}

      <div className="flex flex-1 flex-col gap-8">
        <div className="grid min-w-0 gap-8 lg:grid-cols-2">
        {project && (
          <Card className="min-w-0">
            <CardHeader label="// PROJECT">
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-mono text-lg text-text-primary">{project.name}</p>
                <div className="mt-3 space-y-1 font-mono text-xs text-text-secondary">
                  <p>
                    <span className="text-text-muted">├──</span> repository
                  </p>
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate pl-4 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {project.repository_url}
                  </a>
                  <p>
                    <span className="text-text-muted">├──</span> deployments
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-text-muted">└──</span> status{" "}
                    <StatusBadge status={project.status} />
                  </p>
                </div>
              </div>

              <Button onClick={() => router.push(`/projects/${projectId}/edit`)}>
                Edit Project
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="min-w-0">
          <CardHeader label="// DEPLOYMENT">
            <CardTitle>Current Deployment</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 space-y-4">
            {deployment ? (
              <>
                <dl className="grid min-w-0 gap-4 font-mono text-sm">
                  <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-border-subtle pb-3">
                    <dt className="text-text-muted">Status</dt>
                    <dd className="flex min-w-0 justify-end">
                      <StatusBadge status={deployment.status} className="max-w-full" />
                    </dd>
                  </div>
                  <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-1">
                    <dt className="shrink-0 text-text-muted">Image</dt>
                    <dd className="min-w-0 break-all text-right text-text-secondary">
                      {deployment.image_name || "N/A"}
                    </dd>
                  </div>
                  <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-1">
                    <dt className="shrink-0 text-text-muted">Container</dt>
                    <dd className="min-w-0 break-all text-right text-text-secondary">
                      {deployment.container_id || "N/A"}
                    </dd>
                  </div>
                  <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-1">
                    <dt className="shrink-0 text-text-muted">Port</dt>
                    <dd className="min-w-0 text-right text-text-secondary">
                      {deployment.host_port ?? "N/A"}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" onClick={redeploy}>
                    Redeploy
                  </Button>

                  {deployment.status === "RUNNING" && (
                    <Button onClick={stopDeployment}>Stop</Button>
                  )}

                  {deployment.status === "STOPPED" && (
                    <Button onClick={startDeployment}>Start</Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="font-mono text-xs text-text-muted">{"// NO ACTIVE DEPLOYMENT"}</p>
                <p className="text-sm text-text-secondary">No active deployment exists</p>
                <Button variant="primary" onClick={deploy}>
                  {">"} DEPLOY
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        </div>

        <div className="flex min-h-[24rem] flex-1 flex-col">
          <div className="mb-4">
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
              {"// LIVE LOGS"}
            </p>
          </div>
          <LogViewer
            logs={logs}
            placeholder="Waiting for deployment..."
            className="min-h-[24rem] flex-1"
          />
        </div>

        <div className="border-t border-border-subtle pt-8">
        <ConfirmDelete
          title="Delete Project"
          message="This will delete the project and all of its deployments."
          onConfirm={deleteProject}
        />
        </div>
      </div>
    </AppShell>
  );
}
