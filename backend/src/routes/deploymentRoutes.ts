import { Router } from "express";
import {
  createDeployment,
  getDeployments,
  getDeployment,
} from "../controllers/deploymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, createDeployment);
router.get("/", authMiddleware, getDeployments);
router.get("/:deploymentId", authMiddleware, getDeployment);

export default router;
