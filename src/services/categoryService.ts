import prisma from '../config/database';
import { CategoryInput, UpdateCategoryInput } from '../models/types';
import { AppError } from '../utils/appError';
import { capitalizeFirstLetter } from '../utils/functions';
import { Prisma } from '@prisma/client';

export const getCategories = async (userId: string) => {
  // Get both default categories (userId is null) and user-specific categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: null }, // Default categories
        { userId }, // User-specific categories
      ],
    },
    orderBy: [{ name: 'asc' }, { userId: 'asc' }],
    select: {
      id: true,
      name: true,
    },
  });

  return categories;
};

export const createCategory = async (userId: string, input: CategoryInput) => {
  const name = capitalizeFirstLetter(input.name);
  const existingCategory = await prisma.category.findFirst({
    where: {
      name,
      userId,
    },
  });

  if (existingCategory) {
    throw AppError.conflict('Category with this name already exists');
  }

  const category = await prisma.category.create({
    data: {
      name,
      userId,
    },
  });

  return category;
};

export const updateCategory = async (userId: string, input: UpdateCategoryInput) => {
  try {
    const name = capitalizeFirstLetter(input.name);
    const category = await prisma.category.update({
      where: { userId: userId, id: input.id },
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return category;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw AppError.notFound('Category not found');
    }
    throw error;
  }
};
