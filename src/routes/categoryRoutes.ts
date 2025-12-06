import { Router } from "express";
import { getAll, create } from "../controllers/categoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All category routes require authentication
router.use(authenticate);

router.get("/", getAll);
router.post("/", create);

export default router;

