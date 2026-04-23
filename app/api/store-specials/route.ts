import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

// MCG (My Cloud Grocer) API stores — fetched directly
const MCG_STORES = [
  {
    id: 'koshertown',
    name: 'KosherTown',
    logo: '/images/koshertown-logo.svg',
    url: 'https://koshertown.com/brooklyn/category/specials',
    apiBase: 'https://koshertown.com/api',
    area: 'Crown Heights',
  },
  {
    id: 'kosherfamily',
    name: 'Kosher Family',
    logo: '/images/kosherfamily-logo.svg',
    url: 'https://kosherfamily.com/Brooklyn-Crown-Heights/category/specials',
    apiBase: 'https://kosherfamily.com/api',
    area: 'Crown Heights',
  },
  {
    id: 'empire',
    name: 'Empire Kosher',
    logo: '/images/empirekosher-logo.svg',
    url: 'https://empirekoshersupermarket.com/empire/category/specials',
    apiBase: 'https://empirekoshersupermarket.com/api',
    area: 'Crown Heights',
  },
  {
    id: 'mountainfruit',
    name: 'Mountain Fruit',
    logo: '/images/mountainfruit-logo.svg',
    url: 'https://shopmountainfruit.com/Brooklyn-Midwood-BoroPark/category/specials',
    apiBase: 'https://shopmountainfruit.com/api',
    area: 'Flatbush',
  },
  {
    id: 'breadberry',
    name: 'Breadberry',
    logo: '/images/breadberry-logo.svg',
    url: 'https://breadberry.com/Brooklyn/category/specials',
    apiBase: 'https://breadberry.com/api',
    area: 'Borough Park',
  },
];

// Stores served via connect2kehilla scraped DB
const C2K_STORES = [
  { id: 'kahans', name: "Kahan's Superette", logo: '/images/kahans-logo.svg', url: 'https://www.kahanskosher.com/specials', area: 'Crown Heights' },
  { id: 'moishas', name: "Moisha's Discount", logo: '/images/moishas-logo.svg', url: 'https://moishas.com/specials', area: 'Flatbush' },
  { id: 'goldbergs', name: "Goldberg's Freshmarket", logo: '/images/goldbergs-logo.svg', url: 'https://watsonsale.com/supermarkets/goldbergs-supermarket/', area: 'Borough Park' },
  { id: 'krm', name: 'KRM Kollel Supermarket', logo: '/images/krm-logo.svg', url: 'https://watsonsale.com/supermarkets/krm-kollel-supermarket/', area: 'Borough Park' },
];

const C2K_BASE = process.env.CONNECT2KEHILLA_URL || 'https://connect2kehilla.com';

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

async function fetchMcgSpecials(store: typeof MCG_STORES[number]): Promise<StoreSpecial[]> {
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

async function fetchC2kSpecials(storeId: string, storeName: string): Promise<StoreSpecial[]> {
  try {
    const res = await fetch(`${C2K_BASE}/api/specials?storeId=${storeId}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const storeData = data.stores?.[0];
    if (!storeData) return [];

    return storeData.specials.map((s: any, i: number) => ({
      id: `${storeId}-${i}`,
      name: s.name,
      normalizedName: normalizeName(s.name),
      price: parseFloat(s.price?.replace(/[^0-9.]/g, '') || '0'),
      priceDisplay: s.price,
      oldPrice: s.oldPrice ?? null,
      category: s.category ?? '',
      image: '',
      sku: '',
      store: storeId,
      storeName,
    }));
  } catch {
    return [];
  }
}

function buildComparisons(allProducts: StoreSpecial[]) {
  const groups = new Map<string, StoreSpecial[]>();

  for (const p of allProducts) {
    if (p.sku) {
      const key = `sku:${p.sku}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
  }

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

  return Array.from(groups.entries())
    .filter(([, items]) => new Set(items.map(i => i.store)).size >= 2)
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
}

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

const CACHE_KEY = 'store-specials-v2';
const CACHE_TTL = 2 * 60 * 60; // 2 hours

export async function GET() {
  try {
    const redis = getRedis();

    if (redis) {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
        if (data.timestamp && Date.now() - data.timestamp < CACHE_TTL * 1000) {
          return NextResponse.json(data);
        }
      }
    }

    // Fetch MCG stores + c2k scraped stores in parallel
    const [mcgResults, ...c2kResults] = await Promise.all([
      Promise.all(MCG_STORES.map(fetchMcgSpecials)),
      ...C2K_STORES.map(s => fetchC2kSpecials(s.id, s.name)),
    ]);

    const allMcg = mcgResults.flat();
    const allC2k = c2kResults.flat();
    const allProducts = [...allMcg, ...allC2k];

    const comparisons = buildComparisons(allProducts);

    const allStores = [
      ...MCG_STORES.map(s => ({ id: s.id, name: s.name, logo: s.logo, url: s.url, area: s.area })),
      ...C2K_STORES,
    ];

    const byStore: Record<string, StoreSpecial[]> = {};
    for (const s of allStores) {
      byStore[s.id] = allProducts.filter(p => p.store === s.id);
    }

    const response = {
      timestamp: Date.now(),
      stores: allStores.map(s => ({
        id: s.id,
        name: s.name,
        logo: s.logo,
        url: s.url,
        area: s.area,
        count: byStore[s.id]?.length || 0,
      })),
      byStore,
      comparisons,
    };

    if (redis) {
      await redis.set(CACHE_KEY, JSON.stringify(response), { ex: CACHE_TTL });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Store specials fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch specials' }, { status: 500 });
  }
}
