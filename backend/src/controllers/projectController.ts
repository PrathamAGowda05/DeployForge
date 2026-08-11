import type { Request, Response } from "express";
import { pool } from "../db.js";
import { removeDockerContainer, removeDockerImage } from "../services/dockerService.js";

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      "SELECT * FROM projects WHERE user_id = $1",
      [userId],
    );

    res.json(result.rows);
    console.log("PROJECTS RESPONSE:", result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { name, repository_url } = req.body;

  if (!name || !repository_url) {
    return res.status(400).json({
      error: "Name and repository URL are required",
    });
  }

  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `INSERT INTO projects (name, user_id, repository_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, userId, repository_url],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
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

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, status = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, status, id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
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

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userId = req.user!.userId;

    // 1. Make sure the project belongs to the logged-in user
    const projectResult = await pool.query(
      `SELECT *
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

    // 2. Get all deployments belonging to the project
    const deploymentsResult = await pool.query(
      `SELECT *
       FROM deployments
       WHERE project_id = $1`,
      [project.id],
    );

    const deployments = deploymentsResult.rows;

    // 3. Clean up Docker resources for every deployment
    for (const deployment of deployments) {
      try {
        if (deployment.container_id) {
          await removeDockerContainer(deployment.container_id);
        }
      } catch (error) {
        console.error(
          `Container cleanup failed for deployment ${deployment.id}:`,
          error,
        );
      }

      try {
        if (deployment.image_name) {
          await removeDockerImage(deployment.image_name);
        }
      } catch (error) {
        console.error(
          `Image cleanup failed for deployment ${deployment.id}:`,
          error,
        );
      }
    }

    // 4. Delete deployment records
    await pool.query(
      `DELETE FROM deployments
       WHERE project_id = $1`,
      [project.id],
    );

    // 5. Delete project
    await pool.query(
      `DELETE FROM projects
       WHERE id = $1 AND user_id = $2`,
      [project.id, userId],
    );

    return res.json({
      message: "Project deleted successfully",
      project,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
