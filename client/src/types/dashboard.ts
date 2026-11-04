export type TransactionType = "INCOME" | "EXPENSE";

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
}

export interface CategoryData {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  amountMinor: number;
  note: string | null;
  date: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}
