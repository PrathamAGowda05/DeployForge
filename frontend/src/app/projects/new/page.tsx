"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/projects",
        {
          name,
          repository_url: repositoryUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const project = response.data;

      router.push(`/projects/${project.id}`);
    } catch (error: any) {
      console.error("Failed to create project:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setError(error.response?.data?.error || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Create Project</h1>

      <form onSubmit={handleCreateProject}>
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
          <label htmlFor="repositoryUrl">Repository URL</label>

          <input
            id="repositoryUrl"
            type="url"
            value={repositoryUrl}
            onChange={(event) => setRepositoryUrl(event.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>

      <button type="button" onClick={() => router.push("/projects")}>
        Back to Projects
      </button>
    </main>
  );
}
