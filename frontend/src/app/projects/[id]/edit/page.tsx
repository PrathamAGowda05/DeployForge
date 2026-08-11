"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Project {
  id: number;
  name: string;
  status: string;
  repository_url: string;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/projects/${projectId}`);

        const projectData = response.data;

        setProject(projectData);
        setName(projectData.name);
        setStatus(projectData.status);
      } catch (error: any) {
        console.error(error);

        setError(error.response?.data?.error || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await api.patch(`/api/projects/${projectId}`, {
        name,
        status,
      });

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (error: any) {
      console.error(error);

      setError(error.response?.data?.error || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Edit Project</h1>
        <p>Loading project...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main>
        <h1>Edit Project</h1>
        <p>{error || "Project not found"}</p>

        <button onClick={() => router.push("/projects")}>
          Back to Projects
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Edit Project</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Project Name</label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="status">Project Status</label>

          <input
            id="status"
            type="text"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => router.push(`/projects/${projectId}`)}
      >
        Cancel
      </button>
    </main>
  );
}
