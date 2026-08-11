"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Project {
  id: number;
  name: string;
  status: string;
  repository_url: string;
}

const PROJECT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

const STATUS_SELECT_COLOR: Record<(typeof PROJECT_STATUSES)[number], string> = {
  ACTIVE: "text-status-live",
  INACTIVE: "text-status-building",
  ARCHIVED: "text-text-muted",
};

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
      <AppShell>
        <PageHeader title="Edit Project" />
        <Spinner label="Loading project" />
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <PageHeader title="Edit Project" />
        <Alert>{error || "Project not found"}</Alert>
        <Button onClick={() => router.push("/projects")} className="mt-4">
          Back to Projects
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Edit Project"
        subtitle={`./${project.name.toLowerCase().replace(/\s+/g, "-")}`}
      />

      <Card className="max-w-xl">
        <CardHeader label="// EDIT">
          <CardTitle>Project Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>

              <Input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Project Status</Label>

              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                required
                className={cn(
                  "w-full appearance-none border border-border-subtle bg-bg-base bg-[length:0.75rem] bg-[position:right_0.875rem_center] bg-no-repeat py-2.5 pl-3.5 pr-10 text-base transition-colors duration-150",
                  "hover:border-border-strong focus:border-border-strong focus:outline-none",
                  STATUS_SELECT_COLOR[
                    status as (typeof PROJECT_STATUSES)[number]
                  ] ?? "text-text-primary",
                )}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                }}
              >
                {PROJECT_STATUSES.map((option) => (
                  <option key={option} value={option} className="text-white">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {error && <Alert>{error}</Alert>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={() => router.push(`/projects/${projectId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
