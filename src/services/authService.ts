import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../models/types';
import { AppError } from '../utils/appError';

const DEFAULT_CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Shopping',
  'Transport',
  'Entertainment',
  'Salary',
];

export const registerUser = async (input: RegisterInput) => {
  const { email, password } = input;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = regexEmail.test(email);

  if (!isValidEmail) {
    throw AppError.badRequest('Invalid email');
  }

  const name = input.name || (email.split('@')[0] as string);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw AppError.conflict('User with this email already exists');
  }

  // Hash password
  // TODO: The FE need to hash the password before sending it to the BE
  const hashedPassword = await hashPassword(password);

  // Create user and default categories in a transaction
  const user = await prisma.$transaction(async (tx) => {
    // Create user
    const newUser = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Create default categories for the new user
    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((categoryName) => ({
        name: categoryName,
        userId: newUser.id,
      })),
    });

    return newUser;
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return { user, token };
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    token,
  };
};

// TODO: check if we need this in the future
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return user;
};
