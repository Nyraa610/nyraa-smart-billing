export interface RateInfo {
  rate: number;
  date: string;
}

let cache: { key: string; value: RateInfo } | null = null;

/**
 * Récupère le taux de change journalier EUR -> devise cible (par défaut USD).
 * Source : Frankfurter (BCE), avec repli sur exchangerate.host.
 */
export async function getDailyRate(target: string = 'USD'): Promise<RateInfo> {
  const today = new Date().toISOString().split('T')[0];
  const key = `${target}-${today}`;
  if (cache && cache.key === key) return cache.value;

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${target}`);
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.[target];
      if (typeof rate === 'number') {
        const value = { rate, date: data.date || today };
        cache = { key, value };
        return value;
      }
    }
  } catch (e) {
    console.error('Frankfurter rate error', e);
  }

  try {
    const res = await fetch(`https://api.exchangerate.host/latest?base=EUR&symbols=${target}`);
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.[target];
      if (typeof rate === 'number') {
        const value = { rate, date: data.date || today };
        cache = { key, value };
        return value;
      }
    }
  } catch (e) {
    console.error('exchangerate.host error', e);
  }

  throw new Error('Taux de change indisponible');
}
