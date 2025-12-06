import prisma from "../config/database";
import { CreateCategoryInput } from "../models/types";
import { AppError } from "../utils/appError";

export const getCategories = async (userId: string) => {
  // Get both default categories (userId is null) and user-specific categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: null }, // Default categories
        { userId }, // User-specific categories
      ],
    },
    orderBy: [
      { userId: "asc" }, // Default categories first
      { name: "asc" },
    ],
  });

  return categories;
};

export const createCategory = async (
  userId: string,
  input: CreateCategoryInput
) => {
  // Check if category with same name already exists for this user
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: input.name,
      userId,
    },
  });

  if (existingCategory) {
    throw AppError.conflict("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      userId,
    },
  });

  return category;
};

