import { useLocalStorage } from './useLocalStorage';
import { Invoice } from '@/types';

export function useInvoices() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('nyraa-invoices', []);

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  return { invoices, addInvoice, updateInvoice, deleteInvoice };
}
