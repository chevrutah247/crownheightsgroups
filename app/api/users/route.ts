// app/api/users/route.ts
// ЗАМЕНИ свой существующий файл этим - все твои функции сохранены + добавлены новые

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Protected superadmin email - cannot be deleted or demoted
const SUPERADMIN_EMAIL = 'chevrutah24x7@gmail.com';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

// =====================================================
// GET - Получить пользователей (расширено с фильтрами)
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json([]);
    }

    // Параметры фильтрации
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, verified, unverified, blocked, admin
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const keys = await redis.keys('user:*');
    const users = [];
    
    for (const key of keys) {
      const user = await redis.get(key);
      if (user) {
        const userData = typeof user === 'string' ? JSON.parse(user) : user;
        
        // Применяем фильтры
        let matchesFilter = true;
        switch (filter) {
          case 'verified':
            matchesFilter = userData.verified === true;
            break;
          case 'unverified':
            matchesFilter = userData.verified !== true;
            break;
          case 'blocked':
            matchesFilter = userData.blocked === true;
            break;
          case 'admin':
            matchesFilter = userData.role === 'admin' || userData.role === 'superadmin';
            break;
        }
        
        // Применяем поиск
        if (search && matchesFilter) {
          const searchLower = search.toLowerCase();
          matchesFilter = 
            userData.email?.toLowerCase().includes(searchLower) ||
            userData.name?.toLowerCase().includes(searchLower);
        }
        
        if (matchesFilter) {
          users.push({
            ...userData,
            password: '***',
            isProtected: userData.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
          });
        }
      }
    }
    
    // Сортировка - новые первые
    users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Статистика (считаем по всем пользователям, не только отфильтрованным)
    const allKeys = await redis.keys('user:*');
    let stats = { total: 0, verified: 0, unverified: 0, blocked: 0, admins: 0 };
    
    for (const key of allKeys) {
      const u = await redis.get(key);
      if (u) {
        const ud = typeof u === 'string' ? JSON.parse(u) : u;
        stats.total++;
        if (ud.verified) stats.verified++;
        else stats.unverified++;
        if (ud.blocked) stats.blocked++;
        if (ud.role === 'admin' || ud.role === 'superadmin') stats.admins++;
      }
    }

    // Пагинация
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedUsers = users.slice(start, start + limit);

    // Если запрос с параметрами - возвращаем расширенный формат
    if (searchParams.has('filter') || searchParams.has('search') || searchParams.has('page')) {
      return NextResponse.json({
        users: paginatedUsers,
        pagination: { page, limit, total, totalPages },
        stats
      });
    }
    
    // Для обратной совместимости - просто массив
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json([]);
  }
}

// =====================================================
// PUT - Обновить пользователя (расширено с verify/block)
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const body = await request.json();
    const { email, role, action, reason } = body;
    
    // Protect superadmin from changes
    if (email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot modify superadmin account' }, { status: 403 });
    }
    
    const userKey = 'user:' + email.toLowerCase();
    const userData = await redis.get(userKey);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    
    // ========== НОВОЕ: Обработка действий ==========
    if (action) {
      switch (action) {
        case 'verify':
          user.verified = true;
          break;
          
        case 'unverify':
          user.verified = false;
          break;
          
        case 'block':
          user.blocked = true;
          user.blockedAt = new Date().toISOString();
          user.blockedReason = reason || 'No reason provided';
          // Добавляем email в список заблокированных для быстрой проверки
          await redis.sadd('blocked:emails', email.toLowerCase());
          break;
          
        case 'unblock':
          user.blocked = false;
          delete user.blockedAt;
          delete user.blockedReason;
          await redis.srem('blocked:emails', email.toLowerCase());
          break;
          
        case 'make_admin':
          if (user.role === 'superadmin') {
            return NextResponse.json({ error: 'Cannot change superadmin role' }, { status: 403 });
          }
          user.role = 'admin';
          break;
          
        case 'remove_admin':
          if (user.role === 'superadmin') {
            return NextResponse.json({ error: 'Cannot change superadmin role' }, { status: 403 });
          }
          user.role = 'user';
          break;
          
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
      
      await redis.set(userKey, JSON.stringify(user));
      
      // Логируем действие
      const logEntry = {
        action: `user_${action}`,
        targetEmail: email,
        reason,
        timestamp: new Date().toISOString()
      };
      await redis.lpush('admin:logs', JSON.stringify(logEntry));
      await redis.ltrim('admin:logs', 0, 99); // Храним последние 100 логов
      
      return NextResponse.json({ 
        success: true, 
        action,
        user: { ...user, password: '***' } 
      });
    }
    
    // ========== СУЩЕСТВУЮЩИЙ КОД: Изменение роли ==========
    if (role) {
      // Prevent creating another superadmin
      if (role === 'superadmin') {
        return NextResponse.json({ error: 'Cannot assign superadmin role' }, { status: 403 });
      }
      
      user.role = role;
      await redis.set(userKey, JSON.stringify(user));
      
      return NextResponse.json({ success: true, user: { ...user, password: '***' } });
    }
    
    return NextResponse.json({ error: 'No action or role specified' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// =====================================================
// DELETE - Удалить пользователя (расширено с удалением контента)
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const body = await request.json();
    const { email, deleteContent } = body;
    
    // Protect superadmin from deletion
    if (email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot delete superadmin account' }, { status: 403 });
    }
    
    const userKey = 'user:' + email.toLowerCase();
    
    // ========== НОВОЕ: Удаление контента пользователя ==========
    if (deleteContent) {
      // Удаляем группы пользователя
      const groups = await redis.get('groups');
      if (groups) {
        const groupsArray = typeof groups === 'string' ? JSON.parse(groups) : groups;
        if (Array.isArray(groupsArray)) {
          const filtered = groupsArray.filter((g: any) => 
            g.submittedBy?.toLowerCase() !== email.toLowerCase() &&
            g.addedBy?.toLowerCase() !== email.toLowerCase()
          );
          await redis.set('groups', JSON.stringify(filtered));
        }
      }
      
      // Удаляем бизнесы пользователя
      const businesses = await redis.get('businesses');
      if (businesses) {
        const bizArray = typeof businesses === 'string' ? JSON.parse(businesses) : businesses;
        if (Array.isArray(bizArray)) {
          const filtered = bizArray.filter((b: any) => 
            b.submittedBy?.toLowerCase() !== email.toLowerCase() &&
            b.addedBy?.toLowerCase() !== email.toLowerCase()
          );
          await redis.set('businesses', JSON.stringify(filtered));
        }
      }
    }
    
    // Удаляем из blocked:emails если был там
    await redis.srem('blocked:emails', email.toLowerCase());
    
    // Удаляем пользователя
    await redis.del(userKey);
    
    // Логируем удаление
    const logEntry = {
      action: 'user_delete',
      targetEmail: email,
      deleteContent: !!deleteContent,
      timestamp: new Date().toISOString()
    };
    await redis.lpush('admin:logs', JSON.stringify(logEntry));
    
    return NextResponse.json({ 
      success: true,
      message: deleteContent ? 'User and content deleted' : 'User deleted'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
