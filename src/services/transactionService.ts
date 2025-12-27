import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { CreateTransactionInput, UpdateTransactionInput } from '../models/types';
import { AppError } from '../utils/appError';

const PAGE_SIZE = 20;

export const createTransaction = async (userId: string, input: CreateTransactionInput) => {
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
    throw AppError.notFound('Category not found');
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
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      date: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return transaction;
};

export const getTransactions = async (
  userId: string,
  page: number,
  startDate?: Date,
  endDate?: Date
) => {
  const skip = (page - 1) * PAGE_SIZE;

  // Build dynamic where clause
  const where: Prisma.TransactionWhereInput = { userId };

  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          date: 'desc',
        },
        {
          description: 'asc',
        },
      ],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({
      where,
    }),
  ]);

  return {
    data: transactions,
    page,
    total,
  };
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
    throw AppError.notFound('Transaction not found');
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
      throw AppError.notFound('Category not found');
    }
  }

  const updateData: Partial<UpdateTransactionInput> = {};
  if (input.categoryId) updateData.categoryId = input.categoryId;
  if (input.type) updateData.type = input.type;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.date) updateData.date = new Date(input.date);

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      date: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return transaction;
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!transaction) {
    throw AppError.notFound('Transaction not found');
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  return { message: 'Transaction deleted successfully' };
};
