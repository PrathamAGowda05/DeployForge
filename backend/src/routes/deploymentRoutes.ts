import { Router } from "express";
import {
  createDeployment,
  getDeployments,
  getDeployment,
  deleteDeployment,
  stopDeployment,
  startDeployment,
  redeployDeployment,
} from "../controllers/deploymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, createDeployment);
router.get("/", authMiddleware, getDeployments);
router.get("/:deploymentId", authMiddleware, getDeployment);
router.delete("/:deploymentId", authMiddleware, deleteDeployment);
router.post("/:deploymentId/stop", authMiddleware, stopDeployment);
router.post("/:deploymentId/start", authMiddleware, startDeployment);

export default router;
