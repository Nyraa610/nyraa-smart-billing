import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export type QuoteStatus = 'en_attente' | 'accepte' | 'refuse' | 'expire';

export interface QuoteItem {
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  client_id: string | null;
  quote_number: string;
  issue_date: string;
  valid_until: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  notes: string | null;
  timeline?: string | null;
  payment_terms?: string | null;
  revisions?: string | null;
  hosting?: string | null;
  maintenance?: string | null;
  support?: string | null;
  features?: string | null;
  created_at: string;
  client?: {
    name: string;
    email: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
    siret: string | null;
    tva_number: string | null;
  };
}

export function useSupabaseQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQuotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(name, email, address, postal_code, city, siret, tva_number)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des devis');
      console.error(error);
    } else {
      const formattedData = data?.map(q => ({
        ...q,
        items: (q.items as unknown as QuoteItem[]) || []
      })) || [];
      setQuotes(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, [user]);

  const addQuote = async (quote: Omit<Quote, 'id' | 'created_at' | 'client'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        ...quote,
        user_id: user.id,
        items: quote.items as unknown as Json
      })
      .select(`
        *,
        client:clients(name, email, address, postal_code, city, siret, tva_number)
      `)
      .single();

    if (error) {
      toast.error('Erreur lors de la création du devis');
      console.error(error);
      return null;
    }

    const formattedData = {
      ...data,
      items: (data.items as unknown as QuoteItem[]) || []
    };
    setQuotes(prev => [formattedData, ...prev]);
    return formattedData;
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.items) {
      updateData.items = updates.items as unknown as Json;
    }
    delete updateData.client;

    const { error } = await supabase
      .from('quotes')
      .update(updateData as never)
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
      return false;
    }

    await fetchQuotes();
    return true;
  };

  const deleteQuote = async (id: string) => {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return false;
    }

    setQuotes(prev => prev.filter(q => q.id !== id));
    return true;
  };

  return { quotes, loading, addQuote, updateQuote, deleteQuote, refetch: fetchQuotes };
}
