import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getBudgets, createBudget } from "../services/budgetService";
import { CreateBudgetInput } from "../models/types";

export const getAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const budgets = await getBudgets(req.user.userId);
    res.status(200).json(budgets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const input: CreateBudgetInput = req.body;

    if (
      !input.categoryId ||
      !input.limit ||
      !input.month ||
      !input.year
    ) {
      res.status(400).json({
        error: "categoryId, limit, month, and year are required",
      });
      return;
    }

    const budget = await createBudget(req.user.userId, input);
    res.status(201).json(budget);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

