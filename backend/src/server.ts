import express from "express";

const app = express();

const PORT = 4000;

// Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Projects Endpoint
app.get("/api/projects", (req, res) => {
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
});

// Start Server
app.listen(PORT, () => {
  console.log(`DeployForge API running on http://localhost:${PORT}`);
});
