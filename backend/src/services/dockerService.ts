import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const buildDockerImage = async (
  repositoryPath: string,
  imageName: string,
) => {
  const { stdout, stderr } = await execAsync(
    `docker build -t ${imageName} "${repositoryPath}"`,
  );

  return {
    imageName,
    logs: `${stdout}\n${stderr}`,
  };
};

export const runDockerContainer = async (
  imageName: string,
  hostPort: number,
) => {
  const { stdout, stderr } = await execAsync(
    `docker run -d -p ${hostPort}:3000 ${imageName}`,
  );

  return {
    containerId: stdout.trim(),
    logs: `${stdout}\n${stderr}`,
  };
};

export const removeDockerContainer = async (containerId: string) => {
  await execAsync(`docker rm -f ${containerId}`);
};

export const removeDockerImage = async (imageName: string) => {
  await execAsync(`docker rmi ${imageName}`);
};

export const stopDockerContainer = async (containerId: string) => {
  await execAsync(`docker stop ${containerId}`);
};

export const startDockerContainer = async (containerId: string) => {
  await execAsync(`docker start ${containerId}`);
};
