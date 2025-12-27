// User
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Category
export interface CategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
  id: string;
}

// Transaction
export interface CreateTransactionInput {
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: Date;
}

export interface TransactionFilterInput {
  page?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateTransactionInput {
  categoryId?: string;
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  date?: Date;
}

// Budget
export interface CreateBudgetInput {
  categoryId: string;
  limit: number;
  month: number;
  year: number;
}

export interface UpdateBudgetInput {
  limit: number;
}
