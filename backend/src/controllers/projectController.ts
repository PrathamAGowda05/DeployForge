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
