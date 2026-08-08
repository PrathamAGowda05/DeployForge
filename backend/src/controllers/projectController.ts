import type { Request, Response } from "express";

export const getProjects = (req: Request, res: Response) => {
  const projects = [
    {
      id: 1,
      name: "portfolio",
      status: "deployed",
    },
    {
      id: 2,
      name: "blog",
      status: "building",
    },
  ];

  res.json(projects);
};

export const createProject = (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      error: "Project name is required",
    });
  }

  const project = {
    id: 3,
    name: name.trim(),
    status: "created",
  };

  res.status(201).json(project);
};
