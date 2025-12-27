import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../services/budgetService';
import { CreateBudgetInput, UpdateBudgetInput } from '../models/types';
import { AppError } from '../utils/appError';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const budgets = await getBudgets(req.user.userId);
    res.status(200).json(budgets);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const input: CreateBudgetInput = req.body;

    if (!input.categoryId || !input.limit || !input.month || !input.year) {
      res.status(400).json({
        error: 'categoryId, limit, month, and year are required',
      });
      return;
    }

    const budget = await createBudget(req.user.userId, input);
    res.status(201).json(budget);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const input: UpdateBudgetInput = req.body;

    if (!id) {
      res.status(400).json({
        error: 'Budget id is required',
      });
      return;
    }

    const budget = await updateBudget(req.user.userId, id, input);
    res.status(200).json(budget);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: 'Budget id is required',
      });
      return;
    }

    const result = await deleteBudget(req.user.userId, id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
