import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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
    
    // Get all keys starting with "user:"
    const keys = await redis.keys('user:*');
    const users = [];
    
    for (const key of keys) {
      const user = await redis.get(key);
      if (user) {
        const userData = typeof user === 'string' ? JSON.parse(user) : user;
        // Don't expose password
        users.push({
          ...userData,
          password: '***'
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
    
    const userData = await redis.get(`user:${email.toLowerCase()}`);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    user.role = role;
    
    await redis.set(`user:${email.toLowerCase()}`, JSON.stringify(user));
    
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
    await redis.del(`user:${email.toLowerCase()}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
