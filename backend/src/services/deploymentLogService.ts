import { EventEmitter } from "events";
import { pool } from "../db.js";

export const deploymentLogEmitter = new EventEmitter();

export const appendDeploymentLog = async (
  deploymentId: number,
  log: string,
) => {
  // 1. Save permanently
  await pool.query(
    `UPDATE deployments
     SET logs = COALESCE(logs, '') || $1
     WHERE id = $2`,
    [log, deploymentId],
  );

  // 2. Send live event
  deploymentLogEmitter.emit(String(deploymentId), log);
};
