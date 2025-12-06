import { Router } from "express";
import { getAll, create } from "../controllers/budgetController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All budget routes require authentication
router.use(authenticate);

router.get("/", getAll);
router.post("/", create);

export default router;

