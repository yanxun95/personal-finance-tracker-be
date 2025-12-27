import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { registerUser, loginUser, getUserById } from '../services/authService';
import { RegisterInput, LoginInput } from '../models/types';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input: RegisterInput = req.body;

    if (!input.email || !input.password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await registerUser(input);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input: LoginInput = req.body;

    if (!input.email || !input.password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await loginUser(input);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getUserById(req.user.userId);
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
