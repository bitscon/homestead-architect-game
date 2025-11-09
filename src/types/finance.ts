export interface FinancialCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at?: string;
}

export interface CategoryInsert {
  name: string;
  type: 'income' | 'expense';
}

export interface CategoryUpdate {
  name?: string;
  type?: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  notes: string | null;
  category_id: string | null;
  property_id: string | null;
  created_at?: string;
}

export interface TransactionInsert {
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  notes?: string | null;
  category_id?: string | null;
  property_id?: string | null;
}

export interface TransactionUpdate {
  date?: string;
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  notes?: string | null;
  category_id?: string | null;
  property_id?: string | null;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  property_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}
