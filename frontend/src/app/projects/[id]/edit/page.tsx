"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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

              <Input
                id="status"
                type="text"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                required
              />
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
