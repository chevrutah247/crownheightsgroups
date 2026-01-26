import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const defaultGroupCategories = [
  { id: '1', name: 'Community', nameRu: 'Сообщество', slug: 'community', icon: '👥', order: 1 },
  { id: '2', name: 'Business & Jobs', nameRu: 'Бизнес и работа', slug: 'business-jobs', icon: '💼', order: 2 },
  { id: '3', name: 'Education', nameRu: 'Образование', slug: 'education', icon: '📚', order: 3 },
  { id: '4', name: 'Events', nameRu: 'События', slug: 'events', icon: '📅', order: 4 },
  { id: '5', name: 'Health & Wellness', nameRu: 'Здоровье', slug: 'health', icon: '🏥', order: 5 },
  { id: '6', name: 'Real Estate', nameRu: 'Недвижимость', slug: 'real-estate', icon: '🏠', order: 6 },
  { id: '7', name: 'Kids & Family', nameRu: 'Дети и семья', slug: 'kids-family', icon: '👨‍👩‍👧‍👦', order: 7 },
  { id: '8', name: 'Food & Dining', nameRu: 'Еда и рестораны', slug: 'food', icon: '🍽️', order: 8 },
  { id: '9', name: 'Services', nameRu: 'Услуги', slug: 'services', icon: '🔧', order: 9 },
  { id: '10', name: 'Torah & Learning', nameRu: 'Тора и учёба', slug: 'torah', icon: '📖', order: 10 },
  { id: '11', name: 'Buy & Sell', nameRu: 'Купля-продажа', slug: 'buy-sell', icon: '🛒', order: 11 },
  { id: '12', name: 'Rides & Carpool', nameRu: 'Поездки', slug: 'rides', icon: '🚗', order: 12 },
  { id: '13', name: 'Rentals Short Term', nameRu: 'Краткосрочная аренда', slug: 'rentals-short', icon: '🏨', order: 13 },
  { id: '14', name: 'Rentals Long Term', nameRu: 'Долгосрочная аренда', slug: 'rentals-long', icon: '🔑', order: 14 },
  { id: '15', name: 'Simchas & Celebrations', nameRu: 'Симхи и праздники', slug: 'simchas', icon: '🎉', order: 15 },
  { id: '16', name: 'Shidduchim', nameRu: 'Шидухим', slug: 'shidduchim', icon: '💍', order: 16 },
  { id: '17', name: 'Chesed & Volunteering', nameRu: 'Хесед и волонтёрство', slug: 'chesed', icon: '🤝', order: 17 },
  { id: '18', name: 'Sports & Fitness', nameRu: 'Спорт и фитнес', slug: 'sports', icon: '⚽', order: 18 },
  { id: '19', name: 'Travel', nameRu: 'Путешествия', slug: 'travel', icon: '✈️', order: 19 },
  { id: '20', name: 'Tech & Startups', nameRu: 'Технологии', slug: 'tech', icon: '💻', order: 20 },
  { id: '21', name: 'Women Only', nameRu: 'Только для женщин', slug: 'women', icon: '👩', order: 21 },
  { id: '22', name: 'Men Only', nameRu: 'Только для мужчин', slug: 'men', icon: '👨', order: 22 },
  { id: '23', name: 'Lost & Found', nameRu: 'Потеряно и найдено', slug: 'lost-found', icon: '🔍', order: 23 },
  { id: '24', name: 'Other', nameRu: 'Другое', slug: 'other', icon: '📌', order: 24 },
];

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json(defaultGroupCategories);
    const stored = await redis.get('groupCategories');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data) && data.length > 0) return NextResponse.json(data);
    }
    await redis.set('groupCategories', JSON.stringify(defaultGroupCategories));
    return NextResponse.json(defaultGroupCategories);
  } catch (error) {
    return NextResponse.json(defaultGroupCategories);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const newCat = await request.json();
    let categories: any[] = [];
    const stored = await redis.get('groupCategories');
    if (stored) {
      categories = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(categories)) categories = [...defaultGroupCategories];
    } else {
      categories = [...defaultGroupCategories];
    }
    const id = String(Date.now());
    const slug = newCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const maxOrder = Math.max(...categories.map(c => c.order || 0), 0);
    const category = { id, name: newCat.name, nameRu: newCat.nameRu || '', slug, icon: newCat.icon || '📁', order: maxOrder + 1 };
    categories.push(category);
    await redis.set('groupCategories', JSON.stringify(categories));
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const updated = await request.json();
    let categories: any[] = [];
    const stored = await redis.get('groupCategories');
    if (stored) { categories = typeof stored === 'string' ? JSON.parse(stored) : stored; }
    else { categories = [...defaultGroupCategories]; }
    const index = categories.findIndex((c: any) => c.id === updated.id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    categories[index] = { ...categories[index], ...updated };
    await redis.set('groupCategories', JSON.stringify(categories));
    return NextResponse.json(categories[index]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const { id } = await request.json();
    let categories: any[] = [];
    const stored = await redis.get('groupCategories');
    if (stored) { categories = typeof stored === 'string' ? JSON.parse(stored) : stored; }
    categories = categories.filter((c: any) => c.id !== id);
    await redis.set('groupCategories', JSON.stringify(categories));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
