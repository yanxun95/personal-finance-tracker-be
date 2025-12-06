import prisma from "../config/database";
import { CreateBudgetInput } from "../models/types";
import { AppError } from "../utils/appError";

export const getBudgets = async (userId: string) => {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });

  return budgets;
};

export const createBudget = async (
  userId: string,
  input: CreateBudgetInput
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
    throw AppError.conflict(
      "Budget already exists for this category, month, and year"
    );
  }

  // Validate month and year
  if (input.month < 1 || input.month > 12) {
    throw AppError.badRequest("Month must be between 1 and 12");
  }

  if (input.year < 2000 || input.year > 2100) {
    throw AppError.badRequest("Year must be between 2000 and 2100");
  }

  if (input.limit <= 0) {
    throw AppError.badRequest("Budget limit must be greater than 0");
  }

  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId: input.categoryId,
      limit: input.limit,
      month: input.month,
      year: input.year,
    },
    include: {
      category: true,
    },
  });

  return budget;
};

