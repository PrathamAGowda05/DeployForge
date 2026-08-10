import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const cloneRepository = async (
  repositoryUrl: string,
  destinationPath: string,
) => {
  await execAsync(`git clone "${repositoryUrl}" "${destinationPath}"`);

  return destinationPath;
};
