import type { Request, Response } from "express";
import { pool } from "../db.js";
import { deployProject } from "../services/deploymentService.js";

export const createDeployment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userId = req.user!.userId;

    // 1. Make sure the project belongs to the logged-in user
    const projectResult = await pool.query(
      `SELECT id, repository_url
       FROM projects
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const project = projectResult.rows[0];

    // 2. Make sure the project has a repository
    if (!project.repository_url) {
      return res.status(400).json({
        error: "Project does not have a repository URL",
      });
    }

    // 3. Create deployment record
    const deploymentResult = await pool.query(
      `INSERT INTO deployments (project_id, status)
       VALUES ($1, $2)
       RETURNING *`,
      [project.id, "PENDING"],
    );

    const deployment = deploymentResult.rows[0];

    try {
      // 4. Actually deploy the project
      const result = await deployProject(
        project.repository_url,
        project.id,
        deployment.id,
      );

      // 5. Deployment succeeded
      const updatedDeployment = await pool.query(
        `UPDATE deployments
         SET status = $1,
             logs = $2
         WHERE id = $3
         RETURNING *`,
        ["SUCCESS", result.buildLogs, deployment.id],
      );

      return res.status(201).json({
        deployment: updatedDeployment.rows[0],
        containerId: result.containerId,
        imageName: result.imageName,
      });
    } catch (deploymentError) {
      console.error("Deployment failed:", deploymentError);

      // 6. Deployment failed
      const failedDeployment = await pool.query(
        `UPDATE deployments
         SET status = $1,
             logs = $2
         WHERE id = $3
         RETURNING *`,
        ["FAILED", String(deploymentError), deployment.id],
      );

      return res.status(500).json({
        error: "Deployment failed",
        deployment: failedDeployment.rows[0],
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getDeployments = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userId = req.user!.userId;

    const projectResult = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const result = await pool.query(
      `SELECT * FROM deployments
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getDeployment = async (req: Request, res: Response) => {
  const { id, deploymentId } = req.params;

  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT d.*
       FROM deployments d
       JOIN projects p ON d.project_id = p.id
       WHERE d.id = $1
         AND d.project_id = $2
         AND p.user_id = $3`,
      [deploymentId, id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Deployment not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};
