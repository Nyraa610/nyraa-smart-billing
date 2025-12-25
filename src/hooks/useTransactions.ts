import { useLocalStorage } from './useLocalStorage';
import { Transaction } from '@/types';

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('nyraa-transactions', []);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return { transactions, addTransaction, updateTransaction, deleteTransaction };
}
