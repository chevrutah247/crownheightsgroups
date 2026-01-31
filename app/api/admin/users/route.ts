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

// Get all users
export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json([]);
    }
    
    const keys = await redis.keys('user:*');
    const users = [];
    
    for (const key of keys) {
      const user = await redis.get(key);
      if (user) {
        const userData = typeof user === 'string' ? JSON.parse(user) : user;
        if (userData.isVerified) users.push({
          ...userData,
          password: '***',
          isProtected: userData.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
        });
      }
    }
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json([]);
  }
}

// Update user role
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const { email, role } = await request.json();
    
    // Protect superadmin from role changes
    if (email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot modify superadmin account' }, { status: 403 });
    }
    
    const userData = await redis.get('user:' + email.toLowerCase());
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    
    // Prevent creating another superadmin
    if (role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot assign superadmin role' }, { status: 403 });
    }
    
    user.role = role;
    
    await redis.set('user:' + email.toLowerCase(), JSON.stringify(user));
    
    return NextResponse.json({ success: true, user: { ...user, password: '***' } });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const { email } = await request.json();
    
    // Protect superadmin from deletion
    if (email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot delete superadmin account' }, { status: 403 });
    }
    
    await redis.del('user:' + email.toLowerCase());
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
