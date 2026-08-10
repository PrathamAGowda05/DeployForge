import express from "express";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";
import "./db.js";

const app = express();
const PORT = 4000;

app.use(express.json());

// Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Project Routes
app.use("/api/projects", projectRoutes);

//Authentication Routes
app.use("/api/auth", authRoutes);

//Deployment Routes
app.use("/projects/:id/deployments", deploymentRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`DeployForge API running on http://localhost:${PORT}`);
});
