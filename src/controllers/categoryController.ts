import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getCategories, createCategory } from "../services/categoryService";
import { CreateCategoryInput } from "../models/types";

export const getAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const categories = await getCategories(req.user.userId);
    res.status(200).json(categories);
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

    const input: CreateCategoryInput = req.body;

    if (!input.name || input.name.trim() === "") {
      res.status(400).json({ error: "Category name is required" });
      return;
    }

    const category = await createCategory(req.user.userId, {
      name: input.name.trim(),
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

