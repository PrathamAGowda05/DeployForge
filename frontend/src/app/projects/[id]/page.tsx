"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConfirmDelete from "@/components/ConfirmDelete";
import api from "@/lib/api";

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

  const fetchProjectData = async () => {
    try {
      setError("");

      const projectResponse = await api.get(`/api/projects/${projectId}`);

      setProject(projectResponse.data);

      const deploymentResponse = await api.get(
        `/api/projects/${projectId}/deployments`,
      );

      const deployments: Deployment[] = deploymentResponse.data;

      /*
       * Deployment history contains old FAILED/STOPPED
       * deployments too.
       *
       * Only an active deployment should appear as the
       * current deployment on this page.
       */
      const activeDeployment = deployments.find((deployment) =>
        ["PENDING", "BUILDING", "STARTING", "RUNNING"].includes(
          deployment.status,
        ),
      );

      if (activeDeployment) {
        setDeployment(activeDeployment);
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
        if (!previous) {
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
    };
  };

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

      await fetchProjectData();

      connectLogs(deploymentId, true);
    } catch (error: any) {
      console.error(error);

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

      const newDeployment = response.data.deployment;

      setDeployment(newDeployment);

      connectLogs(newDeployment.id, true);
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
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  return (
    <main>
      <h1>Project Dashboard</h1>

      {error && <p>{error}</p>}

      {project && (
        <section>
          <h2>Project Information</h2>

          <p>Name: {project.name}</p>

          <p>Status: {project.status}</p>

          <p>
            Repository:{" "}
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.repository_url}
            </a>
          </p>

          <button onClick={() => router.push(`/projects/${projectId}/edit`)}>
            Edit Project
          </button>
        </section>
      )}

      <section>
        <h2>Current Deployment</h2>

        {deployment ? (
          <>
            <p>Status: {deployment.status}</p>

            <p>Image: {deployment.image_name || "N/A"}</p>

            <p>Container: {deployment.container_id || "N/A"}</p>

            <p>Port: {deployment.host_port || "N/A"}</p>

            <button onClick={redeploy}>Redeploy</button>

            {deployment.status === "RUNNING" && (
              <button onClick={stopDeployment}>Stop</button>
            )}

            {deployment.status === "STOPPED" && (
              <button onClick={startDeployment}>Start</button>
            )}
          </>
        ) : (
          <>
            <p>No active deployment exists</p>

            <button onClick={deploy}>Deploy</button>
          </>
        )}
      </section>

      <section>
        <h2>Live Logs</h2>

        <pre>{logs || "Waiting for deployment..."}</pre>
      </section>

      <button onClick={() => router.push(`/projects/${projectId}/deployments`)}>
        Deployment History
      </button>

      <ConfirmDelete
        title="Delete Project"
        message="This will delete the project and all of its deployments."
        onConfirm={deleteProject}
      />
    </main>
  );
}
