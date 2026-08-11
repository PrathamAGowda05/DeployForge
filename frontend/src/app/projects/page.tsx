"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Project {
  id: number;
  name: string;
  status: string;
  repository_url: string;
}

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:4000/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProjects(response.data);
      } catch (error: any) {
        console.error("Failed to fetch projects:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        setError(error.response?.data?.error || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (loading) {
    return (
      <main>
        <h1>Projects</h1>
        <p>Loading projects...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Projects</h1>

      {error && <p>{error}</p>}

      {projects.length === 0 ? (
        <div>
          <p>No projects found.</p>

          <button onClick={() => router.push("/projects/new")}>
            Create Project
          </button>
        </div>
      ) : (
        <>
          {projects.map((project) => (
            <section key={project.id}>
              <h2>{project.name}</h2>

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

              <button onClick={() => router.push(`/projects/${project.id}`)}>
                Open Project
              </button>
            </section>
          ))}

          <br />

          <button onClick={() => router.push("/projects/new")}>
            Create Project
          </button>
          <button onClick={() => router.push("/profile")}>Profile</button>
        </>
      )}
    </main>
  );
}
