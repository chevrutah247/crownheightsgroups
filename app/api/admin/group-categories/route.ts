import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { requireAdmin } from '@/lib/admin-auth';

const REDIS_KEY = 'groupCategories';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

const defaultCategories = [
  { id: '1', name: 'Community', nameRu: 'Сообщество', slug: 'community', icon: '🏘️', order: 1 },
  { id: '2', name: 'Torah & Learning', nameRu: 'Тора и учёба', slug: 'torah-learning', icon: '📚', order: 2 },
  { id: '3', name: 'Business & Jobs', nameRu: 'Бизнес и работа', slug: 'business-jobs', icon: '💼', order: 3 },
  { id: '4', name: 'Buy & Sell', nameRu: 'Купля-продажа', slug: 'buy-sell', icon: '🛒', order: 4 },
  { id: '5', name: 'Real Estate', nameRu: 'Недвижимость', slug: 'real-estate', icon: '🏠', order: 5 },
  { id: '6', name: 'Rides & Carpool', nameRu: 'Поездки', slug: 'rides', icon: '🚗', order: 6 },
  { id: '7', name: 'Events', nameRu: 'События', slug: 'events', icon: '📅', order: 7 },
  { id: '8', name: 'Kids & Education', nameRu: 'Дети и образование', slug: 'kids-education', icon: '👶', order: 8 },
  { id: '9', name: 'Health & Wellness', nameRu: 'Здоровье', slug: 'health', icon: '💪', order: 9 },
  { id: '10', name: 'Food & Recipes', nameRu: 'Еда и рецепты', slug: 'food', icon: '🍽️', order: 10 },
  { id: '11', name: 'Chesed & Volunteering', nameRu: 'Хесед', slug: 'chesed', icon: '🤝', order: 11 },
  { id: '12', name: 'Singles', nameRu: 'Знакомства', slug: 'singles', icon: '💕', order: 12 },
  { id: '13', name: 'Women', nameRu: 'Женские', slug: 'women', icon: '👩', order: 13 },
  { id: '14', name: 'Men', nameRu: 'Мужские', slug: 'men', icon: '👨', order: 14 },
  { id: '15', name: 'Humor & Fun', nameRu: 'Юмор', slug: 'humor', icon: '😄', order: 15 },
  { id: '16', name: 'News & Updates', nameRu: 'Новости', slug: 'news', icon: '📰', order: 16 },
  { id: '17', name: 'Tech & Gadgets', nameRu: 'Технологии', slug: 'tech', icon: '💻', order: 17 },
  { id: '18', name: 'Sports', nameRu: 'Спорт', slug: 'sports', icon: '⚽', order: 18 },
  { id: '19', name: 'Travel', nameRu: 'Путешествия', slug: 'travel', icon: '✈️', order: 19 },
  { id: '20', name: 'Pets', nameRu: 'Животные', slug: 'pets', icon: '🐾', order: 20 },
  { id: '21', name: 'Home & Garden', nameRu: 'Дом и сад', slug: 'home-garden', icon: '🏡', order: 21 },
  { id: '22', name: 'Fashion & Beauty', nameRu: 'Мода и красота', slug: 'fashion', icon: '👗', order: 22 },
  { id: '23', name: 'Music & Entertainment', nameRu: 'Музыка', slug: 'music', icon: '🎵', order: 23 },
  { id: '24', name: 'Other', nameRu: 'Другое', slug: 'other', icon: '📌', order: 24 },
];

async function getCategories(redis: Redis): Promise<any[]> {
  try {
    const stored = await redis.get(REDIS_KEY);
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data) && data.length > 0) return data;
    }
    await redis.set(REDIS_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  } catch (error) {
    return defaultCategories;
  }
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json(defaultCategories);
    const categories = await getCategories(redis);
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(defaultCategories);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const newCategory = await request.json();
    const categories = await getCategories(redis);
    const id = String(Date.now());
    const slug = (newCategory.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || id;
    const category = { id, name: newCategory.name || '', nameRu: newCategory.nameRu || '', slug, icon: newCategory.icon || '📁', order: newCategory.order || categories.length + 1 };
    categories.push(category);
    await redis.set(REDIS_KEY, JSON.stringify(categories));
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const updated = await request.json();
    const categories = await getCategories(redis);
    const index = categories.findIndex((c: any) => c.id === updated.id);
    if (index === -1) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    const slug = (updated.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    categories[index] = { ...categories[index], name: updated.name || categories[index].name, nameRu: updated.nameRu !== undefined ? updated.nameRu : categories[index].nameRu, slug: slug || categories[index].slug, icon: updated.icon || categories[index].icon, order: updated.order !== undefined ? updated.order : categories[index].order };
    await redis.set(REDIS_KEY, JSON.stringify(categories));
    return NextResponse.json(categories[index]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const { id } = await request.json();
    let groups: any[] = [];
    const groupsStored = await redis.get('groups');
    if (groupsStored) { groups = typeof groupsStored === 'string' ? JSON.parse(groupsStored) : groupsStored; if (!Array.isArray(groups)) groups = []; }
    if (groups.some(g => g.categoryId === id)) return NextResponse.json({ error: 'Cannot delete - groups are using this category' }, { status: 400 });
    const categories = await getCategories(redis);
    const newCategories = categories.filter((c: any) => c.id !== id);
    if (newCategories.length === 0) return NextResponse.json({ error: 'Cannot delete last category' }, { status: 400 });
    await redis.set(REDIS_KEY, JSON.stringify(newCategories));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
