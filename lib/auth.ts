import crypto from 'crypto';
import { createClient } from 'redis';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpiry?: number;
  createdAt: string;
  role: 'user' | 'admin';
}

interface Session {
  email: string;
  expiry: number;
}

// Redis client singleton
let redis: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!process.env.REDIS_URL) return null;
  
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.error('Redis error:', err));
    await redis.connect();
  }
  return redis;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateUserId(): string {
  return 'user-' + crypto.randomBytes(8).toString('hex');
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const redis = await getRedis();
  const verificationCode = generateVerificationCode();
  
  const user: User = {
    id: generateUserId(),
    email: email.toLowerCase(),
    password: hashPassword(password),
    name,
    isVerified: false,
    verificationCode,
    verificationExpiry: Date.now() + 30 * 60 * 1000,
    createdAt: new Date().toISOString(),
    role: 'user'
  };
  
  if (redis) {
    await redis.set(`user:${email.toLowerCase()}`, JSON.stringify(user));
  }
  
  console.log(`VERIFICATION CODE for ${email}: ${verificationCode}`);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const redis = await getRedis();
  if (!redis) return undefined;
  
  if (email.toLowerCase() === 'admin@crownheightsgroups.com') {
    const existing = await redis.get('user:admin@crownheightsgroups.com');
    if (!existing) {
      const admin: User = {
        id: 'admin-1',
        email: 'admin@crownheightsgroups.com',
        password: hashPassword('admin123'),
        name: 'Admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
        role: 'admin'
      };
      await redis.set('user:admin@crownheightsgroups.com', JSON.stringify(admin));
      return admin;
    }
  }
  
  const data = await redis.get(`user:${email.toLowerCase()}`);
  return data ? JSON.parse(data) : undefined;
}

export async function verifyUser(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const user = await getUserByEmail(email);
  
  if (!user) return { success: false, error: 'User not found' };
  if (user.isVerified) return { success: false, error: 'Email already verified' };
  if (!user.verificationCode || !user.verificationExpiry) return { success: false, error: 'No verification code found' };
  if (Date.now() > user.verificationExpiry) return { success: false, error: 'Verification code expired' };
  if (user.verificationCode !== code) return { success: false, error: 'Invalid verification code' };
  
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpiry = undefined;
  
  const redis = await getRedis();
  if (redis) {
    await redis.set(`user:${email.toLowerCase()}`, JSON.stringify(user));
  }
  
  return { success: true };
}

export async function regenerateVerificationCode(email: string): Promise<string | null> {
  const user = await getUserByEmail(email);
  if (!user || user.isVerified) return null;
  
  const newCode = generateVerificationCode();
  user.verificationCode = newCode;
  user.verificationExpiry = Date.now() + 30 * 60 * 1000;
  
  const redis = await getRedis();
  if (redis) {
    await redis.set(`user:${email.toLowerCase()}`, JSON.stringify(user));
  }
  
  return newCode;
}

export async function validateLogin(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const user = await getUserByEmail(email);
  
  if (!user) return { success: false, error: 'Invalid email or password' };
  if (user.password !== hashPassword(password)) return { success: false, error: 'Invalid email or password' };
  if (!user.isVerified) return { success: false, error: 'Please verify your email first' };
  
  return { success: true, user };
}

export async function createSession(email: string): Promise<string> {
  const redis = await getRedis();
  const token = generateSessionToken();
  const session: Session = { email, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  
  if (redis) {
    await redis.setEx(`session:${token}`, 7 * 24 * 60 * 60, JSON.stringify(session));
  }
  
  return token;
}

export async function validateSession(token: string): Promise<User | null> {
  const redis = await getRedis();
  if (!redis) return null;
  
  const data = await redis.get(`session:${token}`);
  if (!data) return null;
  
  const session: Session = JSON.parse(data);
  if (Date.now() > session.expiry) {
    await redis.del(`session:${token}`);
    return null;
  }
  
  return await getUserByEmail(session.email) || null;
}

export async function deleteSession(token: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.del(`session:${token}`);
  }
}

export async function getAllUsers(): Promise<User[]> {
  return [];
}
