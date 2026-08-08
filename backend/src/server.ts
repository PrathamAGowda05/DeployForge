import express from "express";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();
const PORT = 4000;

app.use(express.json());

// Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Project Routes
app.use("/api/projects", projectRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`DeployForge API running on http://localhost:${PORT}`);
});
