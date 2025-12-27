import prisma from '../config/database';
import { CreateBudgetInput, UpdateBudgetInput } from '../models/types';
import { AppError } from '../utils/appError';

export const getBudgets = async (userId: string) => {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    select: {
      id: true,
      limit: true,
      month: true,
      year: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return budgets;
};

export const createBudget = async (userId: string, input: CreateBudgetInput) => {
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
    throw AppError.notFound('Category not found');
  }

  // Check if budget already exists for this category, month, and year
  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId,
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
    },
  });

  if (existingBudget) {
    throw AppError.conflict('Budget already exists for this category, month, and year');
  }

  // Validate month and year
  if (input.month < 1 || input.month > 12) {
    throw AppError.badRequest('Month must be between 1 and 12');
  }

  // TODO: This should be dynamic based on the current year
  const currentYear = new Date().getFullYear();
  if (input.year > currentYear) {
    throw AppError.badRequest('Year must be lower than the current year');
  }

  if (input.limit <= 0) {
    throw AppError.badRequest('Budget limit must be greater than 0');
  }

  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId: input.categoryId,
      limit: input.limit,
      month: input.month,
      year: input.year,
    },
    select: {
      id: true,
      limit: true,
      month: true,
      year: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return budget;
};

export const updateBudget = async (userId: string, budgetId: string, input: UpdateBudgetInput) => {
  // Verify budget exists and belongs to the user
  const existingBudget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!existingBudget) {
    throw AppError.notFound('Budget not found');
  }

  // Validate limit
  if (input.limit <= 0) {
    throw AppError.badRequest('Budget limit must be greater than 0');
  }

  const budget = await prisma.budget.update({
    where: { id: budgetId },
    data: { limit: input.limit },
    select: {
      id: true,
      limit: true,
      month: true,
      year: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return budget;
};

export const deleteBudget = async (userId: string, budgetId: string) => {
  // Verify budget exists and belongs to the user
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });

  if (!budget) {
    throw AppError.notFound('Budget not found');
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  });

  return { message: 'Budget deleted successfully' };
};
