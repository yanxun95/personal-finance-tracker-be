import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getCategories, createCategory, updateCategory } from '../services/categoryService';
import { CategoryInput, UpdateCategoryInput } from '../models/types';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const categories = await getCategories(req.user.userId);
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const input: CategoryInput = req.body;

    if (!input.name || input.name.trim() === '') {
      res.status(400).json({ error: 'Category name is required' });
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

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const newCategory: UpdateCategoryInput = req.body;

    if (!newCategory.id || !newCategory.name) {
      res.status(400).json({ error: 'id and name are required' });
      return;
    }

    const category = await updateCategory(req.user.userId, newCategory);
    res.status(200).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
