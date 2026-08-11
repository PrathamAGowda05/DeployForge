import { pool } from "../db.js";

const PORT_START = 3001;
const PORT_END = 3999;

export const allocatePort = async (deploymentId: number) => {
  for (let port = PORT_START; port <= PORT_END; port++) {
    try {
      const result = await pool.query(
        `UPDATE deployments
         SET host_port = $1
         WHERE id = $2
           AND host_port IS NULL
         RETURNING host_port`,
        [port, deploymentId],
      );

      if (result.rows.length > 0) {
        return port;
      }
    } catch (error: any) {
      if (error.code === "23505") {
        continue;
      }

      throw error;
    }
  }

  throw new Error("No available deployment ports");
};

export const releasePort = async (deploymentId: number) => {
  await pool.query(
    `UPDATE deployments
     SET host_port = NULL
     WHERE id = $1`,
    [deploymentId],
  );
};
