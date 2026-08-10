import type { Request, Response } from "express";
import { pool } from "../db.js";

export const createDeployment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userId = req.user!.userId;

    // Make sure the project belongs to the logged-in user
    const projectResult = await pool.query(
      "SELECT id FROM projects WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    // Create the deployment
    const result = await pool.query(
      `INSERT INTO deployments (project_id, status)
       VALUES ($1, $2)
       RETURNING *`,
      [id, "PENDING"],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
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
