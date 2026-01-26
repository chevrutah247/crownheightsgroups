import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  password: string; // hashed
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

interface StorageData {
  users: Record<string, User>;
  sessions: Record<string, Session>;
}

// File path for persistent storage
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load data from file
function loadData(): StorageData {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  // Default data with admin user
  const defaultData: StorageData = {
    users: {
      'admin@crownheightsgroups.com': {
        id: 'admin-1',
        email: 'admin@crownheightsgroups.com',
        password: hashPassword('admin123'),
        name: 'Admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
        role: 'admin'
      }
    },
    sessions: {}
  };
  
  saveData(defaultData);
  return defaultData;
}

// Save data to file
function saveData(data: StorageData) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Hash password using SHA-256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate unique user ID
export function generateUserId(): string {
  return 'user-' + crypto.randomBytes(8).toString('hex');
}

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create new user
export function createUser(email: string, password: string, name: string): User {
  const data = loadData();
  const verificationCode = generateVerificationCode();
  
  const user: User = {
    id: generateUserId(),
    email: email.toLowerCase(),
    password: hashPassword(password),
    name,
    isVerified: false,
    verificationCode,
    verificationExpiry: Date.now() + 30 * 60 * 1000, // 30 minutes
    createdAt: new Date().toISOString(),
    role: 'user'
  };
  
  data.users[email.toLowerCase()] = user;
  saveData(data);
  
  return user;
}

// Get user by email
export function getUserByEmail(email: string): User | undefined {
  const data = loadData();
  return data.users[email.toLowerCase()];
}

// Verify user email
export function verifyUser(email: string, code: string): { success: boolean; error?: string } {
  const data = loadData();
  const user = data.users[email.toLowerCase()];
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.isVerified) {
    return { success: false, error: 'Email already verified' };
  }
  
  if (!user.verificationCode || !user.verificationExpiry) {
    return { success: false, error: 'No verification code found' };
  }
  
  if (Date.now() > user.verificationExpiry) {
    return { success: false, error: 'Verification code expired' };
  }
  
  if (user.verificationCode !== code) {
    return { success: false, error: 'Invalid verification code' };
  }
  
  // Mark as verified
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpiry = undefined;
  data.users[email.toLowerCase()] = user;
  saveData(data);
  
  return { success: true };
}

// Regenerate verification code
export function regenerateVerificationCode(email: string): string | null {
  const data = loadData();
  const user = data.users[email.toLowerCase()];
  
  if (!user || user.isVerified) {
    return null;
  }
  
  const newCode = generateVerificationCode();
  user.verificationCode = newCode;
  user.verificationExpiry = Date.now() + 30 * 60 * 1000;
  data.users[email.toLowerCase()] = user;
  saveData(data);
  
  return newCode;
}

// Validate login credentials
export function validateLogin(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const data = loadData();
  const user = data.users[email.toLowerCase()];
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  if (user.password !== hashPassword(password)) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  if (!user.isVerified) {
    return { success: false, error: 'Please verify your email first' };
  }
  
  return { success: true, user };
}

// Create session
export function createSession(email: string): string {
  const data = loadData();
  const token = generateSessionToken();
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  
  data.sessions[token] = { email, expiry };
  saveData(data);
  
  return token;
}

// Validate session
export function validateSession(token: string): User | null {
  const data = loadData();
  const session = data.sessions[token];
  
  if (!session) {
    return null;
  }
  
  if (Date.now() > session.expiry) {
    delete data.sessions[token];
    saveData(data);
    return null;
  }
  
  const user = data.users[session.email];
  return user || null;
}

// Delete session
export function deleteSession(token: string): void {
  const data = loadData();
  delete data.sessions[token];
  saveData(data);
}

// Get all users (for admin)
export function getAllUsers(): User[] {
  const data = loadData();
  return Object.values(data.users).map(u => ({
    ...u,
    password: '***' // Don't expose passwords
  }));
}
