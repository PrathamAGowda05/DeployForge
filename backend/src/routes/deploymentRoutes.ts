import { Router } from "express";
import {
  createDeployment,
  getDeployments,
  getDeployment,
  deleteDeployment,
  stopDeployment,
  startDeployment,
  getDeploymentLogs,
  streamDeploymentLogs,
} from "../controllers/deploymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, createDeployment);
router.get("/", authMiddleware, getDeployments);
router.get("/:deploymentId", authMiddleware, getDeployment);
router.delete("/:deploymentId", authMiddleware, deleteDeployment);
router.post("/:deploymentId/stop", authMiddleware, stopDeployment);
router.post("/:deploymentId/start", authMiddleware, startDeployment);
router.get("/:deploymentId/logs", authMiddleware, getDeploymentLogs);
router.get("/:deploymentId/stream", authMiddleware, streamDeploymentLogs);

export default router;
