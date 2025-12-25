import { useLocalStorage } from './useLocalStorage';
import { CompanyInfo } from '@/types';
import { defaultCompanyInfo } from '@/data/mockData';

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('nyraa-company-info', defaultCompanyInfo);

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...updates }));
  };

  return { companyInfo, setCompanyInfo, updateCompanyInfo };
}
