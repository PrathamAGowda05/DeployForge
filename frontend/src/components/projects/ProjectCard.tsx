import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Project {
  id: number;
  name: string;
  status: string;
  repository_url: string;
}

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <Card>
      <CardHeader label={`ID ${project.id}`}>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-mono text-sm text-text-primary">
            ./{project.name.toLowerCase().replace(/\s+/g, "-")}
          </p>
        </div>

        <div className="space-y-1 font-mono text-xs text-text-secondary">
          <p>
            <span className="text-text-muted">├──</span> repository
          </p>
          <p className="truncate pl-4 text-text-muted">{project.repository_url}</p>
          <p>
            <span className="text-text-muted">├──</span> deployments
          </p>
          <p>
            <span className="text-text-muted">└──</span> status{" "}
            <StatusBadge status={project.status} />
          </p>
        </div>

        <Button variant="primary" onClick={onOpen} className="w-full sm:w-auto">
          {">"} OPEN_PROJECT
        </Button>
      </CardContent>
    </Card>
  );
}
