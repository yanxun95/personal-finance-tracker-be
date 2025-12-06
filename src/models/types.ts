export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateTransactionInput {
  categoryId: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  date: string | Date;
}

export interface UpdateTransactionInput {
  categoryId?: string;
  type?: "income" | "expense";
  amount?: number;
  description?: string;
  date?: string | Date;
}

export interface CreateCategoryInput {
  name: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  limit: number;
  month: number;
  year: number;
}

