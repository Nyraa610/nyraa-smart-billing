import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  siret: string | null;
  tva_number: string | null;
  created_at: string;
}

export function useSupabaseClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des clients');
      console.error(error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const addClient = async (client: Omit<Client, 'id' | 'created_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de l\'ajout du client');
      console.error(error);
      return null;
    }

    setClients(prev => [data, ...prev]);
    return data;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      return false;
    }

    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    return true;
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return false;
    }

    setClients(prev => prev.filter(c => c.id !== id));
    return true;
  };

  return { clients, loading, addClient, updateClient, deleteClient, refetch: fetchClients };
}
