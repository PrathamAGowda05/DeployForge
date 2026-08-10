import { Router } from "express";
import {
  createDeployment,
  getDeployments,
  getDeployment,
  deleteDeployment,
} from "../controllers/deploymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, createDeployment);
router.get("/", authMiddleware, getDeployments);
router.get("/:deploymentId", authMiddleware, getDeployment);
router.delete("/:deploymentId", authMiddleware, deleteDeployment);

export default router;
