"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

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
      <main>
        <h1>Loading deployment...</h1>
      </main>
    );
  }

  return (
    <main>
      <h1>Deployment Details</h1>

      {error && <p>{error}</p>}

      {deployment && (
        <>
          <section>
            <h2>Information</h2>

            <p>Deployment ID: {deployment.id}</p>

            <p>Status: {deployment.status}</p>

            <p>Created: {deployment.created_at}</p>

            <p>Commit: {deployment.commit_hash || "N/A"}</p>

            <p>Image: {deployment.image_name || "N/A"}</p>

            <p>Container: {deployment.container_id || "N/A"}</p>

            <p>Host Port: {deployment.host_port || "N/A"}</p>
          </section>

          <section>
            <h2>Logs</h2>

            <pre>{logs || "No logs available"}</pre>
          </section>
        </>
      )}

      <button onClick={() => router.push(`/projects/${projectId}/deployments`)}>
        Back to Deployment History
      </button>
    </main>
  );
}
