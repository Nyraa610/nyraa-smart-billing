import { SiretCompanyData } from '@/types';

export function formatSiret(siret: string): string {
  return siret.replace(/\s/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
}

export function validateSiret(siret: string): boolean {
  const cleanSiret = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleanSiret)) return false;
  
  // Luhn algorithm for SIRET validation
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleanSiret[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function calculateTvaNumber(siret: string): string {
  const siren = siret.replace(/\s/g, '').substring(0, 9);
  const key = (12 + 3 * (parseInt(siren, 10) % 97)) % 97;
  return `FR${String(key).padStart(2, '0')}${siren}`;
}

export async function fetchCompanyBySiret(siret: string): Promise<SiretCompanyData | null> {
  const cleanSiret = siret.replace(/\s/g, '');
  
  if (!validateSiret(cleanSiret)) {
    throw new Error('Numéro SIRET invalide');
  }

  try {
    const response = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}&page=1&per_page=1`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('Entreprise non trouvée');
    }

    const company = data.results[0];
    const siege = company.siege;

    return {
      siret: cleanSiret,
      name: company.nom_complet || company.nom_raison_sociale,
      address: siege?.adresse || '',
      postalCode: siege?.code_postal || '',
      city: siege?.libelle_commune || '',
      tvaNumber: calculateTvaNumber(cleanSiret),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de la recherche');
  }
}
