"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import ProjectCard from "@/components/projects/ProjectCard";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";

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
      <AppShell>
        <PageHeader index="01 — PROJECTS" title="Projects" />
        <Spinner label="Loading projects" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        index="01 — PROJECTS"
        title="Projects"
        subtitle="Repository-backed deployment projects"
        actions={
          <>
            <Button variant="primary" onClick={() => router.push("/projects/new")}>
              {">"} CREATE_PROJECT
            </Button>
            <Button onClick={() => router.push("/profile")}>Profile</Button>
          </>
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {projects.length === 0 ? (
        <div className="border border-border-subtle bg-bg-surface p-8 text-center">
          <p className="font-mono text-xs text-text-muted">{"// NO PROJECTS"}</p>
          <p className="mt-2 text-sm text-text-secondary">No projects found.</p>

          <Button
            variant="primary"
            onClick={() => router.push("/projects/new")}
            className="mt-6"
          >
            {">"} CREATE_PROJECT
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => router.push(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
