import path from "path";
import fs from "fs/promises";

import { cloneRepository } from "./gitService.js";
import { buildDockerImage, runDockerContainer } from "./dockerService.js";

const workspaceRoot = path.resolve("workspace");

export const deployProject = async (
  repositoryUrl: string,
  projectId: number,
  deploymentId: number,
) => {
  // Make sure the main workspace exists
  await fs.mkdir(workspaceRoot, { recursive: true });

  // Unique folder for this deployment
  const repositoryPath = path.join(workspaceRoot, `deployment-${deploymentId}`);

  // Generate a unique Docker image name
  const imageName = `deployforge-project-${projectId}-deployment-${deploymentId}`;

  // 1. Clone repository
  await cloneRepository(repositoryUrl, repositoryPath);

  // 2. Build Docker image
  const buildResult = await buildDockerImage(repositoryPath, imageName);

  // 3. Run Docker container
  const containerResult = await runDockerContainer(imageName, 3000);

  return {
    repositoryPath,
    imageName,
    buildLogs: buildResult.logs,
    containerId: containerResult.containerId,
  };
};
