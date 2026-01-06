import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CompanyInfo {
  id?: string;
  name: string;
  siret: string;
  tva_number: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  website: string;
  legal_form: string;
  capital: string;
  rcs: string;
  ape_code: string;
  invoice_prefix: string;
  quote_prefix: string;
  tax_rate: number;
  payment_delay: number;
  bank_name: string;
  iban: string;
  bic: string;
}

const defaultCompanyInfo: CompanyInfo = {
  name: '',
  siret: '',
  tva_number: '',
  email: '',
  phone: '',
  address: '',
  postal_code: '',
  city: '',
  website: '',
  legal_form: '',
  capital: '',
  rcs: '',
  ape_code: '',
  invoice_prefix: 'FACT-',
  quote_prefix: 'DEV-',
  tax_rate: 0,
  payment_delay: 30,
  bank_name: '',
  iban: '',
  bic: '',
};

export function useSupabaseCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCompanyInfo = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error(error);
    } else if (data) {
      setCompanyInfo({
        id: data.id,
        name: data.name,
        siret: data.siret || '',
        tva_number: data.tva_number || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        postal_code: data.postal_code || '',
        city: data.city || '',
        website: data.website || '',
        legal_form: data.legal_form || '',
        capital: data.capital || '',
        rcs: data.rcs || '',
        ape_code: data.ape_code || '',
        invoice_prefix: data.invoice_prefix || 'FACT-',
        quote_prefix: data.quote_prefix || 'DEV-',
        tax_rate: Number(data.tax_rate) || 20,
        payment_delay: data.payment_delay || 30,
        bank_name: data.bank_name || '',
        iban: data.iban || '',
        bic: data.bic || '',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, [user]);

  const saveCompanyInfo = async (info: CompanyInfo) => {
    if (!user) return false;

    const dataToSave = {
      user_id: user.id,
      name: info.name,
      siret: info.siret || null,
      tva_number: info.tva_number || null,
      email: info.email || null,
      phone: info.phone || null,
      address: info.address || null,
      postal_code: info.postal_code || null,
      city: info.city || null,
      website: info.website || null,
      legal_form: info.legal_form || null,
      capital: info.capital || null,
      rcs: info.rcs || null,
      ape_code: info.ape_code || null,
      invoice_prefix: info.invoice_prefix,
      quote_prefix: info.quote_prefix,
      tax_rate: info.tax_rate,
      payment_delay: info.payment_delay,
      bank_name: info.bank_name || null,
      iban: info.iban || null,
      bic: info.bic || null,
    };

    const { data: existing } = await supabase
      .from('company_info')
      .select('id')
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from('company_info')
        .update(dataToSave)
        .eq('id', existing.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('company_info')
        .insert(dataToSave);
      error = result.error;
    }

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
      return false;
    }

    setCompanyInfo(info);
    toast.success('Informations sauvegardées');
    return true;
  };

  return { companyInfo, loading, saveCompanyInfo, refetch: fetchCompanyInfo };
}
