import type { Request, Response } from "express";
import { pool } from "../db.js";
import { deployProject } from "../services/deploymentService.js";
import {
  getDockerContainerStatus,
  removeDockerContainer,
  removeDockerImage,
  startDockerContainer,
  stopDockerContainer,
} from "../services/dockerService.js";

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
              logs = $2,
              container_id = $3,
              image_name = $4
          WHERE id = $5
          RETURNING *`,
        [
          "RUNNING",
          result.buildLogs,
          result.containerId,
          result.imageName,
          deployment.id,
        ],
      );

      return res.status(201).json({
        deployment: updatedDeployment.rows[0],
        containerId: result.containerId,
        imageName: result.imageName,
        hostPort: result.hostPort,
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

export const deleteDeployment = async (req: Request, res: Response) => {
  const { id, deploymentId } = req.params;

  try {
    const userId = req.user!.userId;

    // Find deployment and make sure it belongs to the user's project
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

    const deployment = result.rows[0];

    // Remove Docker container if one exists
    if (deployment.container_id) {
      await removeDockerContainer(deployment.container_id);
    }

    if (deployment.image_name) {
      await removeDockerImage(deployment.image_name);
    }

    // Delete deployment record
    await pool.query(
      `DELETE FROM deployments
       WHERE id = $1`,
      [deploymentId],
    );

    return res.json({
      message: "Deployment deleted successfully",
    });
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

    const deployment = result.rows[0];

    // Synchronize status with Docker
    if (deployment.container_id) {
      const dockerStatus = await getDockerContainerStatus(
        deployment.container_id,
      );

      let status = deployment.status;

      if (dockerStatus === "running") {
        status = "RUNNING";
      } else if (dockerStatus === "exited") {
        status = "STOPPED";
      } else if (dockerStatus === null) {
        status = "FAILED";
      }

      if (status !== deployment.status) {
        const updatedDeployment = await pool.query(
          `UPDATE deployments
           SET status = $1
           WHERE id = $2
           RETURNING *`,
          [status, deploymentId],
        );

        return res.json(updatedDeployment.rows[0]);
      }
    }

    res.json(deployment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const stopDeployment = async (req: Request, res: Response) => {
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

    const deployment = result.rows[0];

    if (deployment.status !== "RUNNING") {
      return res.status(400).json({
        error: "Deployment is not running",
      });
    }

    await stopDockerContainer(deployment.container_id);

    const updatedDeployment = await pool.query(
      `UPDATE deployments
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      ["STOPPED", deploymentId],
    );

    return res.json(updatedDeployment.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to stop deployment",
    });
  }
};

export const startDeployment = async (req: Request, res: Response) => {
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

    const deployment = result.rows[0];

    if (deployment.status !== "STOPPED") {
      return res.status(400).json({
        error: "Deployment is not stopped",
      });
    }

    await startDockerContainer(deployment.container_id);

    const updatedDeployment = await pool.query(
      `UPDATE deployments
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      ["RUNNING", deploymentId],
    );

    return res.json(updatedDeployment.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to start deployment",
    });
  }
};
