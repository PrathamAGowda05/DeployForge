import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const buildDockerImage = async (
  repositoryPath: string,
  imageName: string,
  onLog?: (log: string) => void,
) => {
  return new Promise<{
    imageName: string;
    logs: string;
  }>((resolve, reject) => {
    const dockerBuild = spawn("docker", [
      "build",
      "-t",
      imageName,
      repositoryPath,
    ]);

    let logs = "";

    dockerBuild.stdout.on("data", (data) => {
      const output = data.toString();

      logs += output;

      if (onLog) {
        onLog(output);
      }
    });

    dockerBuild.stderr.on("data", (data) => {
      const output = data.toString();

      logs += output;

      if (onLog) {
        onLog(output);
      }
    });

    dockerBuild.on("close", (code) => {
      if (code === 0) {
        resolve({
          imageName,
          logs,
        });
      } else {
        reject(new Error(`Docker build failed with exit code ${code}`));
      }
    });
  });
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

export const getDockerContainerStatus = async (containerId: string) => {
  try {
    const { stdout } = await execAsync(
      `docker inspect -f "{{.State.Status}}" ${containerId}`,
    );

    return stdout.trim();
  } catch (error) {
    return null;
  }
};
