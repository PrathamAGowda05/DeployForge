import type { Request, Response } from "express";
import { pool } from "../db.js";

export const getProjects = async (req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM projects");

  res.json(result.rows);
};

export const createProject = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      error: "Project name is required",
    });
  }

  const result = await pool.query(
    "INSERT INTO projects (name, status) VALUES ($1, $2) RETURNING *",
    [name.trim(), "created"],
  );

  res.status(201).json(result.rows[0]);
};

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: "Project not found",
    });
  }

  res.json(result.rows[0]);
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status } = req.body;

  const result = await pool.query(
    `UPDATE projects
     SET name = $1, status = $2
     WHERE id = $3
     RETURNING *`,
    [name, status, id],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: "Project not found",
    });
  }

  res.json(result.rows[0]);
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM projects WHERE id = $1 RETURNING *",
    [id],
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
};
