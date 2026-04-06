import { NextResponse } from 'next/server';
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
  { id: '24', name: 'Real Estate', nameRu: 'Недвижимость', slug: 'real-estate', icon: '🏠', order: 24 },
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
    if (!redis) return NextResponse.json({ error: 'No database' }, { status: 500 });

    await redis.set('serviceCategories', JSON.stringify(defaultCategories));
    
    return NextResponse.json({ success: true, count: defaultCategories.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
