import path from "path";
import fs from "fs/promises";

import { cloneRepository } from "./gitService.js";
import {
  buildDockerImage,
  runDockerContainer,
  removeDockerContainer,
  removeDockerImage,
} from "./dockerService.js";

import { allocatePort, releasePort } from "./portService.js";

const workspaceRoot = path.resolve("workspace");

export const deployProject = async (
  repositoryUrl: string,
  projectId: number,
  deploymentId: number,
) => {
  await fs.mkdir(workspaceRoot, { recursive: true });

  const repositoryPath = path.join(workspaceRoot, `deployment-${deploymentId}`);

  const imageName = `deployforge-project-${projectId}-deployment-${deploymentId}`;

  let hostPort: number | null = null;
  let containerId: string | null = null;

  try {
    // 1. Clone repository
    await cloneRepository(repositoryUrl, repositoryPath);

    // 2. Build Docker image
    const buildResult = await buildDockerImage(repositoryPath, imageName);

    // 3. Allocate port
    hostPort = await allocatePort(deploymentId);

    // 4. Run Docker container
    const containerResult = await runDockerContainer(imageName, hostPort);

    containerId = containerResult.containerId;

    return {
      repositoryPath,
      imageName,
      hostPort,
      buildLogs: buildResult.logs,
      containerId,
    };
  } catch (error) {
    console.error(`Deployment ${deploymentId} failed:`, error);

    // Remove container if it was created
    if (containerId) {
      try {
        await removeDockerContainer(containerId);
      } catch (cleanupError) {
        console.error("Failed to remove container:", cleanupError);
      }
    }

    // Remove image if it was built
    try {
      await removeDockerImage(imageName);
    } catch (cleanupError) {
      console.error("Failed to remove image:", cleanupError);
    }

    // Release port if it was allocated
    if (hostPort !== null) {
      try {
        await releasePort(deploymentId);
      } catch (cleanupError) {
        console.error("Failed to release port:", cleanupError);
      }
    }

    throw error;
  } finally {
    // Always remove cloned repository
    await fs.rm(repositoryPath, {
      recursive: true,
      force: true,
    });
  }
};
