import type { Request, Response } from "express";
import { pool } from "../db.js";

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      "SELECT * FROM projects WHERE user_id = $1",
      [userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { name, status } = req.body;

  if (!name || !status) {
    return res.status(400).json({
      error: "Name and status are required",
    });
  }

  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `INSERT INTO projects (name, status, user_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, status, user_id`,
      [name, status, userId],
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

    const result = await pool.query(
      `DELETE FROM projects
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    res.json({
      message: "Project deleted successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};