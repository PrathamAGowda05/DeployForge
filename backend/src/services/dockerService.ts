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
