import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/appError';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from '../models/types';

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const input: CreateTransactionInput = req.body;

    if (!input.categoryId || !input.type || !input.amount || !input.date) {
      res.status(400).json({
        error: 'categoryId, type, amount, and date are required',
      });
      return;
    }

    // will be handle in the UI as dropdown
    if (input.type !== 'income' && input.type !== 'expense') {
      res.status(400).json({ error: "type must be 'income' or 'expense'" });
      return;
    }

    if (input.amount <= 0) {
      res.status(400).json({ error: 'amount must be greater than 0' });
      return;
    }

    const transaction = await createTransaction(req.user.userId, input);
    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    console.log(req.query);

    const filter: TransactionFilterInput = {};

    // Parse page
    if (req.query.page) {
      filter.page = parseInt(req.query.page as string, 10);
      if (filter.page < 1) {
        res.status(400).json({ error: 'Page must be greater than 0' });
        return;
      }
    } else {
      filter.page = 1;
    }

    // Parse date range
    if (req.query.startDate || req.query.endDate) {
      if (!req.query.startDate || !req.query.endDate) {
        res.status(400).json({
          error: 'Both startDate and endDate are required for filtering',
        });
        return;
      }

      filter.startDate = new Date(req.query.startDate as string);
      filter.endDate = new Date(req.query.endDate as string);
      filter.endDate.setUTCHours(23, 59, 59, 999);

      if (isNaN(filter.startDate.getTime()) || isNaN(filter.endDate.getTime())) {
        res.status(400).json({
          error: 'startDate and endDate must be valid ISO date strings',
        });
        return;
      }
    }

    const result = await getTransactions(
      req.user.userId,
      filter.page,
      filter.startDate,
      filter.endDate
    );
    res.status(200).json({ content: result });
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
    if (!id) {
      res.status(400).json({ error: 'Transaction ID is required' });
      return;
    }

    const input: UpdateTransactionInput = req.body;

    if (input.type && input.type !== 'income' && input.type !== 'expense') {
      res.status(400).json({ error: "type must be 'income' or 'expense'" });
      return;
    }

    if (input.amount !== undefined && input.amount <= 0) {
      res.status(400).json({ error: 'amount must be greater than 0' });
      return;
    }

    const transaction = await updateTransaction(req.user.userId, id, input);
    res.status(200).json(transaction);
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
      res.status(400).json({ error: 'Transaction ID is required' });
      return;
    }

    const result = await deleteTransaction(req.user.userId, id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
