import { useLocalStorage } from './useLocalStorage';
import { Quote } from '@/types';

export function useQuotes() {
  const [quotes, setQuotes] = useLocalStorage<Quote[]>('nyraa-quotes', []);

  const addQuote = (quote: Quote) => {
    setQuotes(prev => [quote, ...prev]);
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  return { quotes, addQuote, updateQuote, deleteQuote };
}
