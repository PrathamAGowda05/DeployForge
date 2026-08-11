"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Alert from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
    <AppShell>
      <PageHeader
        index="01 — PROJECTS"
        title="Create Project"
        subtitle="Initialize a new repository-backed project"
      />

      <Card className="max-w-xl">
        <CardHeader label="// NEW PROJECT">
          <CardTitle>Project Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProject} className="space-y-5">
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
              <Label htmlFor="repositoryUrl">Repository URL</Label>

              <Input
                id="repositoryUrl"
                type="url"
                value={repositoryUrl}
                onChange={(event) => setRepositoryUrl(event.target.value)}
                required
              />
            </div>

            {error && <Alert>{error}</Alert>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Creating..." : "> CREATE_PROJECT"}
              </Button>
              <Button type="button" onClick={() => router.push("/projects")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
