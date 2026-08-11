"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Project {
  id: number;
  name: string;
  repository_url: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:4000/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <main>
      <h1>Projects</h1>

      {projects.map((project) => (
        <div key={project.id}>
          <h2>{project.name}</h2>
          <p>{project.repository_url}</p>
        </div>
      ))}
    </main>
  );
}
