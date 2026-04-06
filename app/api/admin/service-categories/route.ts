import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { requireAdmin } from '@/lib/admin-auth';

const defaultCategories = [
  { id: '1', name: 'Plumber', nameRu: 'Сантехник', slug: 'plumber', icon: '🔧', order: 1 },
  { id: '2', name: 'Electrician', nameRu: 'Электрик', slug: 'electrician', icon: '⚡', order: 2 },
  { id: '3', name: 'Taxi / Driver', nameRu: 'Таксист', slug: 'taxi', icon: '🚕', order: 3 },
  { id: '4', name: 'SIM Cards', nameRu: 'СИМ-карты', slug: 'sim-cards', icon: '📱', order: 4 },
  { id: '5', name: 'Notary', nameRu: 'Нотариус', slug: 'notary', icon: '📜', order: 5 },
  { id: '6', name: 'Locksmith', nameRu: 'Локсмит', slug: 'locksmith', icon: '🔐', order: 6 },
  { id: '7', name: 'Musicians', nameRu: 'Музыканты', slug: 'musicians', icon: '🎵', order: 7 },
  { id: '8', name: 'Tile Worker', nameRu: 'Плиточник', slug: 'tile', icon: '🧱', order: 8 },
  { id: '9', name: 'Glass Worker', nameRu: 'Стекольщик', slug: 'glass', icon: '🪟', order: 9 },
  { id: '10', name: 'Painter', nameRu: 'Маляр', slug: 'painter', icon: '🎨', order: 10 },
  { id: '11', name: 'Carpenter', nameRu: 'Плотник', slug: 'carpenter', icon: '🪚', order: 11 },
  { id: '12', name: 'HVAC / AC', nameRu: 'Кондиционеры', slug: 'hvac', icon: '❄️', order: 12 },
  { id: '13', name: 'Cleaning', nameRu: 'Уборка', slug: 'cleaning', icon: '🧹', order: 13 },
  { id: '14', name: 'Moving', nameRu: 'Переезды', slug: 'moving', icon: '📦', order: 14 },
  { id: '15', name: 'Handyman', nameRu: 'Мастер на все руки', slug: 'handyman', icon: '🛠️', order: 15 },
  { id: '16', name: 'Babysitter', nameRu: 'Няня', slug: 'babysitter', icon: '👶', order: 16 },
  { id: '17', name: 'Tutor', nameRu: 'Репетитор', slug: 'tutor', icon: '🧑‍🏫', order: 17 },
  { id: '18', name: 'Hairdresser', nameRu: 'Парикмахер', slug: 'hairdresser', icon: '💇', order: 18 },
  { id: '19', name: 'Photographer', nameRu: 'Фотограф', slug: 'photographer', icon: '📸', order: 19 },
  { id: '20', name: 'Computer Repair', nameRu: 'Ремонт компьютеров', slug: 'computer', icon: '🖥️', order: 20 },
  { id: '21', name: 'Appliance Repair', nameRu: 'Ремонт техники', slug: 'appliance', icon: '🚿', order: 21 },
  { id: '22', name: 'Lawyer', nameRu: 'Адвокат', slug: 'lawyer', icon: '⚖️', order: 22 },
  { id: '23', name: 'Accountant', nameRu: 'Бухгалтер', slug: 'accountant', icon: '💰', order: 23 },
];

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) return NextResponse.json(defaultCategories);

    const stored = await redis.get('serviceCategories');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data) && data.length > 0) return NextResponse.json(data);
    }
    
    // Initialize with defaults
    await redis.set('serviceCategories', JSON.stringify(defaultCategories));
    return NextResponse.json(defaultCategories);
  } catch (error) {
    console.error('GET error:', error);
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

    const newCat = await request.json();
    console.log('Creating category:', newCat);
    
    let categories: any[] = [];
    const stored = await redis.get('serviceCategories');
    if (stored) {
      categories = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(categories)) categories = [...defaultCategories];
    } else {
      categories = [...defaultCategories];
    }
    
    const id = String(Date.now());
    const slug = newCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const maxOrder = Math.max(...categories.map(c => c.order || 0), 0);
    
    const category = {
      id,
      name: newCat.name,
      nameRu: newCat.nameRu || '',
      slug,
      icon: newCat.icon || '🔧',
      order: maxOrder + 1
    };
    
    categories.push(category);
    await redis.set('serviceCategories', JSON.stringify(categories));
    
    console.log('Category created:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('POST error:', error);
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
    
    let categories: any[] = [];
    const stored = await redis.get('serviceCategories');
    if (stored) {
      categories = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(categories)) categories = [...defaultCategories];
    } else {
      categories = [...defaultCategories];
    }
    
    const index = categories.findIndex((c: any) => c.id === updated.id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    categories[index] = { ...categories[index], ...updated };
    await redis.set('serviceCategories', JSON.stringify(categories));
    
    return NextResponse.json(categories[index]);
  } catch (error) {
    console.error('PUT error:', error);
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
    
    let categories: any[] = [];
    const stored = await redis.get('serviceCategories');
    if (stored) {
      categories = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(categories)) categories = [...defaultCategories];
    } else {
      categories = [...defaultCategories];
    }
    
    categories = categories.filter((c: any) => c.id !== id);
    await redis.set('serviceCategories', JSON.stringify(categories));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
