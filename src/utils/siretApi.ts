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

  const notFoundMessage =
    "Entreprise non trouvée (elle peut être non-diffusible sur l'API publique). Vous pouvez saisir les informations manuellement.";

  const tryRechercheEntreprises = async (): Promise<SiretCompanyData | null> => {
    const response = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}&page=1&per_page=5`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }

    const data = await response.json();

    if (!data?.results || data.results.length === 0) {
      return null;
    }

    const company = data.results[0];
    const siege = company?.siege;

    return {
      siret: cleanSiret,
      name: company?.nom_complet || company?.nom_raison_sociale || '',
      address: siege?.adresse || '',
      postalCode: siege?.code_postal || '',
      city: siege?.libelle_commune || '',
      tvaNumber: calculateTvaNumber(cleanSiret),
    };
  };

  const tryEntrepriseDataGouv = async (): Promise<SiretCompanyData | null> => {
    const response = await fetch(
      `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${cleanSiret}`
    );

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }

    const data = await response.json();
    const etablissement = data?.etablissement;
    const ul = etablissement?.unite_legale;

    // Adresse: les champs varient, on reconstruit simplement une ligne lisible.
    const addressParts = [
      etablissement?.adresse_ligne_1,
      etablissement?.adresse_ligne_2,
      etablissement?.numero_voie && etablissement?.type_voie
        ? `${etablissement.numero_voie} ${etablissement.type_voie}`
        : null,
      etablissement?.libelle_voie,
    ].filter(Boolean);

    const address = addressParts.join(' ').trim();

    return {
      siret: cleanSiret,
      name:
        ul?.denomination ||
        ul?.denomination_usuelle_1 ||
        `${ul?.prenom_1 || ''} ${ul?.nom || ''}`.trim(),
      address,
      postalCode: etablissement?.code_postal || '',
      city: etablissement?.libelle_commune || '',
      tvaNumber: calculateTvaNumber(cleanSiret),
    };
  };

  try {
    const fromRecherche = await tryRechercheEntreprises();
    if (fromRecherche) return fromRecherche;

    const fromEntrepriseDG = await tryEntrepriseDataGouv();
    if (fromEntrepriseDG) return fromEntrepriseDG;

    throw new Error(notFoundMessage);
  } catch (error) {
    if (error instanceof Error) {
      // Si l'API ne retourne rien, on remonte un message utile côté UI.
      if (error.message === 'Entreprise non trouvée') {
        throw new Error(notFoundMessage);
      }
      throw error;
    }
    throw new Error('Erreur lors de la recherche');
  }
}
