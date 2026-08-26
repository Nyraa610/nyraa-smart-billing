export interface RateInfo {
  rate: number;
  date: string;
}

let cache: { key: string; value: RateInfo } | null = null;

async function fetchJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('Exchange rate source failed:', url, e);
    return null;
  }
}

/**
 * Récupère le taux de change journalier EUR -> devise cible (par défaut USD).
 * Plusieurs sources publiques sont testées successivement.
 */
export async function getDailyRate(target: string = 'USD'): Promise<RateInfo> {
  const today = new Date().toISOString().split('T')[0];
  const key = `${target}-${today}`;
  if (cache && cache.key === key) return cache.value;

  const lower = target.toLowerCase();

  // 1. Currency API (CDN statique, mis à jour quotidiennement)
  const cdn =
    (await fetchJson(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json`)) ||
    (await fetchJson(`https://latest.currency-api.pages.dev/v1/currencies/eur.min.json`));
  const cdnRate = cdn?.eur?.[lower];
  if (typeof cdnRate === 'number') {
    const value = { rate: cdnRate, date: cdn.date || today };
    cache = { key, value };
    return value;
  }

  // 2. open.er-api.com
  const erApi = await fetchJson('https://open.er-api.com/v6/latest/EUR');
  const erRate = erApi?.rates?.[target];
  if (typeof erRate === 'number') {
    const value = { rate: erRate, date: (erApi.time_last_update_utc || today).slice(0, 16) };
    cache = { key, value };
    return value;
  }

  // 3. Frankfurter (BCE)
  const frank = await fetchJson(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${target}`);
  const frankRate = frank?.rates?.[target];
  if (typeof frankRate === 'number') {
    const value = { rate: frankRate, date: frank.date || today };
    cache = { key, value };
    return value;
  }

  throw new Error('Taux de change indisponible');
}
