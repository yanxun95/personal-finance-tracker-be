import prisma from "../config/database";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../models/types";
import { AppError } from "../utils/appError";

export const createTransaction = async (
  userId: string,
  input: CreateTransactionInput
) => {
  // Verify category exists and is accessible to user
  const category = await prisma.category.findFirst({
    where: {
      id: input.categoryId,
      OR: [
        { userId: null }, // Default categories
        { userId }, // User-specific categories
      ],
    },
  });

  if (!category) {
    throw AppError.notFound("Category not found");
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId: input.categoryId,
      type: input.type,
      amount: input.amount,
      description: input.description || null,
      date: new Date(input.date),
    },
    include: {
      category: true,
    },
  });

  return transaction;
};

export const getTransactions = async (userId: string) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions;
};

export const getTransactionById = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      category: true,
    },
  });

  if (!transaction) {
    throw AppError.notFound("Transaction not found");
  }

  return transaction;
};

export const updateTransaction = async (
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput
) => {
  // Verify transaction exists and belongs to user
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!existingTransaction) {
    throw AppError.notFound("Transaction not found");
  }

  // If categoryId is being updated, verify it exists and is accessible to user
  if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: input.categoryId,
          OR: [
            { userId: null }, // Default categories
            { userId }, // User-specific categories
          ],
        },
      });

      if (!category) {
        throw AppError.notFound("Category not found");
      }
  }

  const updateData: any = {};
  if (input.categoryId) updateData.categoryId = input.categoryId;
  if (input.type) updateData.type = input.type;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.description !== undefined) updateData.description = input.description || null;
  if (input.date) updateData.date = new Date(input.date);

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    include: {
      category: true,
    },
  });

  return transaction;
};

export const deleteTransaction = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!transaction) {
    throw AppError.notFound("Transaction not found");
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  return { message: "Transaction deleted successfully" };
};

