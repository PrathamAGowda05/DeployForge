import { EventEmitter } from "events";
import { pool } from "../db.js";

export const deploymentEventEmitter = new EventEmitter();

export const appendDeploymentLog = async (
  deploymentId: number,
  log: string,
) => {
  // 1. Save log permanently in database
  await pool.query(
    `UPDATE deployments
     SET logs = COALESCE(logs, '') || $1
     WHERE id = $2`,
    [log, deploymentId],
  );

  // 2. Emit log event to SSE listeners
  deploymentEventEmitter.emit(String(deploymentId), {
    type: "log",
    data: log,
  });
};

export const emitDeploymentStatus = (deploymentId: number, status: string) => {
  // Emit status event to SSE listeners
  deploymentEventEmitter.emit(String(deploymentId), {
    type: "status",
    data: status,
  });
};
