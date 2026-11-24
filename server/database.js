import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory store cache for instant lookups
let memoryStore = null;
let supabaseClient = null;
let databaseMode = 'LOCAL_JSON';
let pendingWrite = Promise.resolve();
let lastDatabaseError = null;
const STORE_ID = 'main_store';

const DEFAULT_SETTINGS = {
  depositUsdtAddress: 'TXyZ889KqN7W8B29LkJ5Q81HkMvPqS4eRt',
  depositNetwork: 'USDT (TRC-20)',
  depositQrCode: '',
  depositNote: 'Please deposit only USDT TRC-20 to this address. Sending any other currency or using another network may result in permanent loss. Contact support after transfer.',
  adminEmail: 'tradingtrendsbeta@gmail.com',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSender: 'Nexora Trading <no-reply@nexoratrading.com>',
  apkDownloadUrl: ''
};

export const DEFAULT_BOT_CONFIG = {
  status: 'ACTIVE', // 'ACTIVE' or 'PAUSED'
  dailyYield: '+1.0% / Day',
  winRate: '94.2%',
  schedule: 'Monday – Friday',
  riskProtocol: 'Capital Shielded'
};

export const DEFAULT_BOT_TRADES = [
  { id: 'trade-1', pair: 'BTC/USDT', type: 'LONG', entry: '64,280.50', exit: '64,810.00', profit: '+$18.40', time: '10 mins ago', status: 'CLOSED' },
  { id: 'trade-2', pair: 'ETH/USDT', type: 'LONG', entry: '3,490.20', exit: '3,522.80', profit: '+$14.20', time: '28 mins ago', status: 'CLOSED' },
  { id: 'trade-3', pair: 'SOL/USDT', type: 'LONG', entry: '152.10', exit: '154.90', profit: '+$17.40', time: '45 mins ago', status: 'CLOSED' },
  { id: 'trade-4', pair: 'BTC/USDT', type: 'SHORT', entry: '65,120.00', exit: '64,950.00', profit: '+$12.50', time: '2 hours ago', status: 'CLOSED' }
];

export async function initDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl && !serviceRoleKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production.');
    }

    memoryStore = readLocalDb();
    databaseMode = 'LOCAL_JSON';
    console.log('ℹ️ Running in local JSON file database mode.');
    return;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
  }

  supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: row, error } = await supabaseClient
    .from('app_store')
    .select('data')
    .eq('id', STORE_ID)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load the Supabase app_store row: ${error.message}`);
  }

  databaseMode = 'SUPABASE';
  if (row) {
    memoryStore = normalizeStore(row.data);
    console.log(`✅ Loaded ${memoryStore.users.length} users and ${memoryStore.transactions.length} transactions from Supabase.`);
    return;
  }

  throw new Error('Supabase app_store is empty. Run the data migration before starting the production backend.');
}

function readLocalDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = createInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return normalizeStore(JSON.parse(raw));
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      users: [],
      transactions: [],
      kycSubmissions: [],
      settings: { ...DEFAULT_SETTINGS },
      botConfig: { ...DEFAULT_BOT_CONFIG },
      botTrades: [...DEFAULT_BOT_TRADES],
      supportMessages: []
    };
  }
}

function createInitialDb() {
  const initialDb = {
    users: [],
    transactions: [],
    kycSubmissions: [],
    settings: { ...DEFAULT_SETTINGS },
    botConfig: { ...DEFAULT_BOT_CONFIG },
    botTrades: [...DEFAULT_BOT_TRADES],
    supportMessages: []
  };
  initialDb.users.push({
    id: 'admin-001',
    username: 'admin',
    email: 'admin@nexoratrading.com',
    passwordHash: bcrypt.hashSync('admin123', bcrypt.genSaltSync(10)),
    role: 'ADMIN',
    fullName: 'System Administrator',
    phone: '+1 (555) 019-2834',
    dob: '1985-01-01',
    address: 'HQ Financial District, New York, NY',
    aadharNo: 'N/A',
    panNo: 'N/A',
    initialBalance: 0,
    dailyGrowthRate: 0,
    growthStartDate: new Date().toISOString(),
    manualAdjustment: 0,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  });
  return initialDb;
}

function normalizeStore(store) {
  const normalized = store && typeof store === 'object' ? store : {};
  if (!Array.isArray(normalized.users)) normalized.users = [];
  normalized.users.forEach(user => {
    if (!user.referralCode) user.referralCode = generateReferralCode(user.username);
    if (!Array.isArray(user.referrals)) user.referrals = [];
    if (user.totalReferralEarnings === undefined) user.totalReferralEarnings = 0;
    if (user.bonusBalance === undefined) user.bonusBalance = 0;
    if (user.investedAmount === undefined) user.investedAmount = Number(user.initialBalance) || 200;
  });
  if (!Array.isArray(normalized.transactions)) normalized.transactions = [];
  if (!Array.isArray(normalized.kycSubmissions)) normalized.kycSubmissions = [];
  if (!Array.isArray(normalized.botTrades)) normalized.botTrades = [...DEFAULT_BOT_TRADES];
  if (!Array.isArray(normalized.supportMessages)) normalized.supportMessages = [];
  normalized.settings = { ...DEFAULT_SETTINGS, ...normalized.settings };
  normalized.botConfig = { ...DEFAULT_BOT_CONFIG, ...normalized.botConfig };
  return normalized;
}

function writeLocalDb(data) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    // Write directly to DB_FILE to prevent Windows/OneDrive renameSync lock issues
    fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Direct write to store.json failed, attempting fallback write:', err.message);
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.copyFileSync(tmpFile, DB_FILE);
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    } catch (fallbackErr) {
      console.error('Fatal error writing store.json:', fallbackErr.message);
    }
  }
}

function readDb() {
  if (memoryStore) return memoryStore;
  memoryStore = readLocalDb();
  return memoryStore;
}

function writeDb(data) {
  memoryStore = data;
  if (databaseMode === 'LOCAL_JSON') {
    writeLocalDb(data);
    return;
  }

  if (!supabaseClient) {
    throw new Error('Supabase is not initialized; refusing to write data to temporary local storage.');
  }

  const snapshot = JSON.parse(JSON.stringify(data));
  pendingWrite = pendingWrite.catch(() => {}).then(() => persistStoreSnapshot(snapshot));
  pendingWrite.catch(err => {
    lastDatabaseError = err.message;
    console.error('Supabase database write error:', err.message);
  });
}

async function persistStoreSnapshot(data) {
  const { error } = await supabaseClient
    .from('app_store')
    .upsert({ id: STORE_ID, data, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    lastDatabaseError = error.message;
    throw new Error(`Supabase database write failed: ${error.message}`);
  }

  lastDatabaseError = null;
}

export async function flushDatabase() {
  if (databaseMode === 'SUPABASE') {
    await pendingWrite;
  }
}

export function getDatabaseStatus() {
  const supabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return {
    databaseMode,
    connected: databaseMode === 'SUPABASE',
    supabaseConfigured,
    lastDatabaseError,
    totalUsers: (memoryStore?.users || []).length,
    timestamp: new Date().toISOString()
  };
}

// User Helpers
export function generateReferralCode(username = '') {
  const clean = String(username).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'NX';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NX-${clean}${rand}`;
}

export function getAllUsers() {
  const db = readDb();
  return db.users;
}

export function getUserById(id) {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

export function getUserByReferralCode(code) {
  if (!code) return null;
  const db = readDb();
  const clean = String(code).trim().toUpperCase();
  return db.users.find(u => u.referralCode && u.referralCode.toUpperCase() === clean);
}

export function getUserByEmailOrUsername(identifier) {
  const db = readDb();
  if (!identifier) return null;
  const lower = String(identifier).toLowerCase().trim();
  return db.users.find(u =>
    (u.email && String(u.email).toLowerCase().trim() === lower) ||
    (u.username && String(u.username).toLowerCase().trim() === lower)
  );
}

export function createUser(userData) {
  const db = readDb();
  const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(userData.password, salt);

  const referralCode = userData.referralCode || generateReferralCode(userData.username);
  const investedAmount = Number(userData.investedAmount) || Number(userData.initialBalance) || 200;
  const bonusBalance = Number(userData.bonusBalance) || 0;

  const newUser = {
    id,
    username: userData.username,
    email: userData.email,
    passwordHash,
    role: userData.role || 'USER',
    fullName: userData.fullName || '',
    phone: userData.phone || '',
    dob: userData.dob || '',
    address: userData.address || '',
    aadharNo: userData.aadharNo || '',
    panNo: userData.panNo || '',
    initialBalance: Number(userData.initialBalance) || 200,
    investedAmount,
    bonusBalance,
    dailyGrowthRate: Number(userData.dailyGrowthRate) !== undefined ? Number(userData.dailyGrowthRate) : 1,
    growthStartDate: userData.growthStartDate || new Date().toISOString(),
    manualAdjustment: Number(userData.manualAdjustment) || 0,
    status: userData.status || 'ACTIVE',
    referralCode,
    referredBy: userData.referredBy || null,
    referrals: Array.isArray(userData.referrals) ? userData.referrals : [],
    totalReferralEarnings: Number(userData.totalReferralEarnings) || 0,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function updateUser(id, updates) {
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return null;

  if (updates.password && updates.password.trim()) {
    const salt = bcrypt.genSaltSync(10);
    updates.passwordHash = bcrypt.hashSync(updates.password.trim(), salt);
    delete updates.password;
  } else {
    delete updates.password;
  }

  db.users[idx] = {
    ...db.users[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.users[idx];
}

export function deleteUser(id) {
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  db.users.splice(idx, 1);
  writeDb(db);
  return true;
}

// Transaction Helpers
export function getAllTransactions() {
  const db = readDb();
  return db.transactions;
}

export function getTransactionsByUserId(userId) {
  const db = readDb();
  return db.transactions.filter(t => t.userId === userId);
}

export function getTransactionById(id) {
  const db = readDb();
  return db.transactions.find(t => t.id === id);
}

export function createTransaction(txData) {
  const db = readDb();
  const newTx = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    userId: txData.userId,
    userName: txData.userName || '',
    userEmail: txData.userEmail || '',
    type: txData.type, // 'WITHDRAWAL', 'DEPOSIT', 'REFERRAL_BONUS', 'ADMIN_ADJUST'
    amount: Number(txData.amount) || 0,
    feeAmount: txData.feeAmount !== undefined ? Number(txData.feeAmount) : undefined,
    feeRate: txData.feeRate || undefined,
    netPayout: txData.netPayout !== undefined ? Number(txData.netPayout) : undefined,
    bonusAmount: txData.bonusAmount !== undefined ? Number(txData.bonusAmount) : undefined,
    cryptoAddress: txData.cryptoAddress || '',
    network: txData.network || 'USDT (TRC-20)',
    binanceId: txData.binanceId || '',
    txHash: txData.txHash || '',
    status: txData.status || 'PENDING', // 'PENDING', 'APPROVED', 'REJECTED'
    note: txData.note || '',
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  writeDb(db);
  return newTx;
}

export function updateTransaction(id, updates) {
  const db = readDb();
  const idx = db.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  db.transactions[idx] = {
    ...db.transactions[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.transactions[idx];
}

// Settings Helpers
export function getSettings() {
  const db = readDb();
  return db.settings || { ...DEFAULT_SETTINGS };
}

export function updateSettings(updates) {
  const db = readDb();
  db.settings = {
    ...DEFAULT_SETTINGS,
    ...db.settings,
    ...updates
  };
  writeDb(db);
  return db.settings;
}

// KYC Submissions
export function addKycSubmission(submission) {
  const db = readDb();
  if (!db.kycSubmissions) db.kycSubmissions = [];
  const entry = {
    id: 'kyc-' + Date.now(),
    ...submission,
    submittedAt: new Date().toISOString()
  };
  db.kycSubmissions.unshift(entry);
  writeDb(db);
  return entry;
}

export function getAllKycSubmissions() {
  const db = readDb();
  return db.kycSubmissions || [];
}

export function updateKycSubmission(id, updates) {
  const db = readDb();
  if (!db.kycSubmissions) return null;
  const idx = db.kycSubmissions.findIndex(s => s.id === id);
  if (idx === -1) return null;
  db.kycSubmissions[idx] = { ...db.kycSubmissions[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.kycSubmissions[idx];
}

// Bot Trades & Config Helpers
export function getBotData() {
  const db = readDb();
  return {
    config: db.botConfig || { ...DEFAULT_BOT_CONFIG },
    trades: db.botTrades || [...DEFAULT_BOT_TRADES]
  };
}

export function createBotTrade(tradeData) {
  const db = readDb();
  if (!db.botTrades) db.botTrades = [...DEFAULT_BOT_TRADES];
  const newTrade = {
    id: 'trade-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    pair: tradeData.pair || 'BTC/USDT',
    type: (tradeData.type || 'LONG').toUpperCase(),
    entry: tradeData.entry || '0.00',
    exit: tradeData.exit || '0.00',
    profit: tradeData.profit || '+$0.00',
    time: tradeData.time || 'Just now',
    status: tradeData.status || 'CLOSED',
    createdAt: new Date().toISOString()
  };
  db.botTrades.unshift(newTrade);
  writeDb(db);
  return newTrade;
}

export function deleteBotTrade(id) {
  const db = readDb();
  if (!db.botTrades) return false;
  const idx = db.botTrades.findIndex(t => t.id === id);
  if (idx === -1) return false;
  db.botTrades.splice(idx, 1);
  writeDb(db);
  return true;
}

export function updateBotConfig(updates) {
  const db = readDb();
  db.botConfig = {
    ...DEFAULT_BOT_CONFIG,
    ...db.botConfig,
    ...updates
  };
  writeDb(db);
  return db.botConfig;
}

// Support & Chatbot Helpers
export function getAllSupportMessages() {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  return db.supportMessages;
}

export function getSupportMessagesByUserId(userId) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  return db.supportMessages.filter(m => m.userId === userId);
}

export function addSupportMessage({ userId, userName, userEmail, sender, text }) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  const newMsg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    userId,
    userName: userName || 'Trader',
    userEmail: userEmail || '',
    sender: sender || 'USER', // 'USER', 'ADMIN', 'BOT'
    text: (text || '').trim(),
    readByAdmin: sender === 'ADMIN',
    readByUser: sender === 'USER',
    createdAt: new Date().toISOString()
  };
  db.supportMessages.push(newMsg);
  writeDb(db);
  return newMsg;
}

export function markSupportMessagesRead(userId, readerRole) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  let updated = false;
  db.supportMessages.forEach(m => {
    if (m.userId === userId) {
      if (readerRole === 'ADMIN' && !m.readByAdmin) {
        m.readByAdmin = true;
        updated = true;
      } else if (readerRole === 'USER' && !m.readByUser) {
        m.readByUser = true;
        updated = true;
      }
    }
  });
  if (updated) {
    writeDb(db);
  }
  return true;
}

export function deleteSupportThreadByUserId(userId) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  const initialLength = db.supportMessages.length;
  db.supportMessages = db.supportMessages.filter(m => m.userId !== userId);
  const deletedCount = initialLength - db.supportMessages.length;
  writeDb(db);
  return deletedCount;
}

export function deleteSupportMessageById(messageId) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  const idx = db.supportMessages.findIndex(m => m.id === messageId);
  if (idx === -1) return false;
  db.supportMessages.splice(idx, 1);
  writeDb(db);
  return true;
}


