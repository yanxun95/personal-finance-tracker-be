import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../models/types";

export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const input: CreateTransactionInput = req.body;

    if (!input.categoryId || !input.type || !input.amount || !input.date) {
      res.status(400).json({
        error: "categoryId, type, amount, and date are required",
      });
      return;
    }

    if (input.type !== "income" && input.type !== "expense") {
      res.status(400).json({ error: "type must be 'income' or 'expense'" });
      return;
    }

    if (input.amount <= 0) {
      res.status(400).json({ error: "amount must be greater than 0" });
      return;
    }

    const transaction = await createTransaction(req.user.userId, input);
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const transactions = await getTransactions(req.user.userId);
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const transaction = await getTransactionById(req.user.userId, id);
    res.status(200).json(transaction);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const update = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const input: UpdateTransactionInput = req.body;

    if (input.type && input.type !== "income" && input.type !== "expense") {
      res.status(400).json({ error: "type must be 'income' or 'expense'" });
      return;
    }

    if (input.amount !== undefined && input.amount <= 0) {
      res.status(400).json({ error: "amount must be greater than 0" });
      return;
    }

    const transaction = await updateTransaction(
      req.user.userId,
      id,
      input
    );
    res.status(200).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const result = await deleteTransaction(req.user.userId, id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

