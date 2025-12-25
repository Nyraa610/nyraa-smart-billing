import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  invoice_id: string | null;
  date: string;
  description: string;
  amount: number;
  payment_method: string | null;
  client_name: string | null;
  invoice_number: string | null;
  created_at: string;
}

export function useSupabaseTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des transactions');
      console.error(error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return false;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    return true;
  };

  return { transactions, loading, deleteTransaction, refetch: fetchTransactions };
}
