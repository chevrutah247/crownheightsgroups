import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

const STORES = [
  {
    id: 'koshertown',
    name: 'KosherTown',
    logo: '/images/koshertown-logo.svg',
    url: 'https://koshertown.com/brooklyn/category/specials',
    apiBase: 'https://koshertown.com/api',
  },
  {
    id: 'kosherfamily',
    name: 'Kosher Family',
    logo: '/images/kosherfamily-logo.svg',
    url: 'https://kosherfamily.com/Brooklyn-Crown-Heights/category/specials',
    apiBase: 'https://kosherfamily.com/api',
  },
  {
    id: 'empire',
    name: 'Empire Kosher',
    logo: '/images/empirekosher-logo.svg',
    url: 'https://empirekoshersupermarket.com/empire/category/specials',
    apiBase: 'https://empirekoshersupermarket.com/api',
  },
];

interface StoreSpecial {
  id: string;
  name: string;
  normalizedName: string;
  price: number;
  priceDisplay: string;
  oldPrice: string | null;
  category: string;
  image: string;
  sku: string;
  store: string;
  storeName: string;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\b(approx\.?|about|~)\s*/gi, '')
    .replace(/\d+(\.\d+)?\s*(oz|lb|lbs|ml|l|g|kg|ct|pk|pack|count|ea|each)\b/gi, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

async function fetchStoreSpecials(store: typeof STORES[number]): Promise<StoreSpecial[]> {
  try {
    const res = await fetch(`${store.apiBase}/AjaxFilter/JsonProductsList?pageNumber=1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (compatible; CrownHeightsGroups/1.0)',
      },
      body: JSON.stringify([{ FilterType: 6, Value1: 1, categoryId: 0 }]),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const raw = data.productsJson || data.ProductsJson || '[]';
    const products = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const imgBase = data.TImgUrl || data.tImgUrl || '';

    return products.map((p: any) => ({
      id: `${store.id}-${p.Id || p.SPId}`,
      name: p.N || '',
      normalizedName: normalizeName(p.N || ''),
      price: p.P_v || 0,
      priceDisplay: p.P || '',
      oldPrice: p.O || null,
      category: p.CN || '',
      image: p.iU ? `${imgBase}${p.iU}` : '',
      sku: p.SKU || '',
      store: store.id,
      storeName: store.name,
    }));
  } catch {
    return [];
  }
}

function buildComparisons(allProducts: StoreSpecial[]) {
  const groups = new Map<string, StoreSpecial[]>();

  // Group by SKU first
  for (const p of allProducts) {
    if (p.sku) {
      const key = `sku:${p.sku}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
  }

  // Group remaining by normalized name
  const skuMatched = new Set(
    Array.from(groups.values())
      .filter(g => g.length > 1)
      .flat()
      .map(p => p.id)
  );

  for (const p of allProducts) {
    if (skuMatched.has(p.id) || !p.normalizedName) continue;
    const key = `name:${p.normalizedName}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  // Only keep groups with 2+ stores
  const comparisons = Array.from(groups.entries())
    .filter(([, items]) => {
      const stores = new Set(items.map(i => i.store));
      return stores.size >= 2;
    })
    .map(([, items]) => {
      const prices = items.map(i => ({
        store: i.store,
        storeName: i.storeName,
        price: i.price,
        priceDisplay: i.priceDisplay,
        image: i.image,
      }));
      const cheapest = prices.reduce((min, p) => p.price < min.price ? p : min, prices[0]);
      return {
        productName: items[0].name,
        category: items[0].category,
        prices,
        cheapestStore: cheapest.store,
      };
    })
    .sort((a, b) => a.productName.localeCompare(b.productName));

  return comparisons;
}

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

const CACHE_KEY = 'store-specials';
const CACHE_TTL = 2 * 60 * 60; // 2 hours in seconds

export async function GET() {
  try {
    const redis = getRedis();

    // Try cache first
    if (redis) {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
        if (data.timestamp && Date.now() - data.timestamp < CACHE_TTL * 1000) {
          return NextResponse.json(data);
        }
      }
    }

    // Fetch fresh data from all stores
    const results = await Promise.all(STORES.map(fetchStoreSpecials));
    const allProducts = results.flat();
    const comparisons = buildComparisons(allProducts);

    const byStore: Record<string, StoreSpecial[]> = {};
    for (const store of STORES) {
      byStore[store.id] = allProducts.filter(p => p.store === store.id);
    }

    const response = {
      timestamp: Date.now(),
      stores: STORES.map(s => ({
        id: s.id,
        name: s.name,
        logo: s.logo,
        url: s.url,
        count: byStore[s.id]?.length || 0,
      })),
      byStore,
      comparisons,
    };

    // Cache in Redis
    if (redis) {
      await redis.set(CACHE_KEY, JSON.stringify(response), { ex: CACHE_TTL });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Store specials fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch specials' }, { status: 500 });
  }
}
