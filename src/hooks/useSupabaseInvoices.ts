import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export type InvoiceStatus = 'non_reglee' | 'reglement_en_cours' | 'reglee';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  client_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes: string | null;
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

export function useSupabaseInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name, email, address, postal_code, city, siret, tva_number)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des factures');
      console.error(error);
    } else {
      const formattedData = data?.map(inv => ({
        ...inv,
        items: (inv.items as unknown as InvoiceItem[]) || []
      })) || [];
      setInvoices(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at' | 'client'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        user_id: user.id,
        items: invoice.items as unknown as Json
      })
      .select(`
        *,
        client:clients(name, email, address, postal_code, city, siret, tva_number)
      `)
      .single();

    if (error) {
      toast.error('Erreur lors de la création de la facture');
      console.error(error);
      return null;
    }

    const formattedData = {
      ...data,
      items: (data.items as unknown as InvoiceItem[]) || []
    };
    setInvoices(prev => [formattedData, ...prev]);
    return formattedData;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>, paymentMethod?: string) => {
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.items) {
      updateData.items = updates.items as unknown as Json;
    }
    delete updateData.client;

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
      return false;
    }

    // If marking as paid, create a transaction with the payment method
    if (updates.status === 'reglee' && paymentMethod) {
      const invoice = invoices.find(inv => inv.id === id);
      if (invoice) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user!.id,
            invoice_id: id,
            date: new Date().toISOString().split('T')[0],
            description: `Paiement facture ${invoice.invoice_number}`,
            amount: invoice.total,
            payment_method: paymentMethod,
            client_name: invoice.client?.name || null,
            invoice_number: invoice.invoice_number
          });

        if (transactionError) {
          console.error('Error creating transaction:', transactionError);
        }
      }
    }

    await fetchInvoices();
    return true;
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return false;
    }

    setInvoices(prev => prev.filter(i => i.id !== id));
    return true;
  };

  return { invoices, loading, addInvoice, updateInvoice, deleteInvoice, refetch: fetchInvoices };
}
