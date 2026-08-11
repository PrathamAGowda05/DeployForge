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
      <main>
        <h1>Deployment History</h1>

        <p>Loading deployments...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Deployment History</h1>

      {error && <p>{error}</p>}

      {deployments.length === 0 ? (
        <p>No deployments found.</p>
      ) : (
        deployments.map((deployment) => (
          <section key={deployment.id}>
            <h2>Deployment {deployment.id}</h2>

            <p>Status: {deployment.status}</p>

            <p>Created: {deployment.created_at}</p>

            <p>Image: {deployment.image_name || "N/A"}</p>

            <p>Port: {deployment.host_port || "N/A"}</p>

            <button
              onClick={() =>
                router.push(
                  `/projects/${projectId}/deployments/${deployment.id}`,
                )
              }
            >
              View Details
            </button>

            <button onClick={() => deleteDeployment(deployment.id)}>
              Delete Deployment
            </button>
          </section>
        ))
      )}

      <br />

      <button onClick={() => router.push(`/projects/${projectId}`)}>
        Back to Project
      </button>
    </main>
  );
}
