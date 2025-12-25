import { useLocalStorage } from './useLocalStorage';
import { Client } from '@/types';

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>('nyraa-clients', []);

  const addClient = (client: Client) => {
    setClients(prev => [client, ...prev]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return { clients, addClient, updateClient, deleteClient };
}
