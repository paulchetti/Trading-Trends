import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { login, getCurrentUser } from './controllers/authController.js';
import { uploadKycDocs, submitKyc } from './controllers/kycController.js';
import {
  listAllUsers,
  createNewUser,
  editUser,
  removeUser,
  inspectUserDashboard,
  fetchPlatformSettings,
  savePlatformSettings,
  fetchKycSubmissions,
  acceptKycSubmission
} from './controllers/adminController.js';
import {
  requestWithdrawal,
  submitDepositNotice,
  getMyTransactions,
  listAllTransactionsAdmin,
  handleTransactionStatus,
  getPublicDepositInfo
} from './controllers/transactionController.js';
import {
  getUserMessages,
  sendUserMessage,
  getAdminConversations,
  sendAdminReply,
  markAdminThreadRead,
  clearAdminConversation,
  deleteSingleMessage
} from './controllers/supportController.js';
import { authenticateToken, optionalAuthenticateToken, requireAdmin } from './middleware/auth.js';
import {
  getBotData,
  createBotTrade,
  deleteBotTrade,
  updateBotConfig,
  initDatabase,
  getSettings,
  getDatabaseStatus,
  getUserById,
  generateReferralCode
} from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded KYC files (restricted in production or used for attachment preview)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check with real-time Database Diagnostics
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'online',
    platform: 'Nexora Trading API Engine',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Public Deposit info
app.get('/api/deposit-info', getPublicDepositInfo);

// APK Download Route
app.get('/api/download/apk', (req, res) => {
  try {
    const settings = getSettings();
    if (settings && settings.apkDownloadUrl && settings.apkDownloadUrl.trim()) {
      return res.redirect(settings.apkDownloadUrl.trim());
    }
    const serverApk = path.join(__dirname, 'downloads', 'NexoraTrading.apk');
    const legacyServerApk = path.join(__dirname, 'downloads', 'TradingTrends.apk');
    const clientApk = path.join(__dirname, '../client/public', 'NexoraTrading.apk');
    const legacyClientApk = path.join(__dirname, '../client/public', 'TradingTrends.apk');

    if (fs.existsSync(serverApk)) {
      return res.download(serverApk, 'NexoraTrading.apk');
    }
    if (fs.existsSync(legacyServerApk)) {
      return res.download(legacyServerApk, 'NexoraTrading.apk');
    }
    if (fs.existsSync(clientApk)) {
      return res.download(clientApk, 'NexoraTrading.apk');
    }
    if (fs.existsSync(legacyClientApk)) {
      return res.download(legacyClientApk, 'NexoraTrading.apk');
    }
    res.setHeader('Content-Disposition', 'attachment; filename="NexoraTrading.apk"');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    return res.send(Buffer.from('PK\x03\x04NexoraTrading-APK-Release'));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to download APK: ' + err.message });
  }
});

// KYC Submission (Emails directly with Aadhaar + PAN attachments)
app.post('/api/kyc/submit', uploadKycDocs, submitKyc);

// Auth Routes
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getCurrentUser);

// User Transaction Routes
app.post('/api/transactions/withdraw', authenticateToken, requestWithdrawal);
app.post('/api/transactions/deposit', authenticateToken, submitDepositNotice);
app.get('/api/transactions/my', authenticateToken, getMyTransactions);

// Referral System Stats Route
app.get('/api/referrals/my-stats', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const referralCode = user.referralCode || generateReferralCode(user.username);
    const referrals = Array.isArray(user.referrals) ? user.referrals : [];
    const totalEarnings = Number(user.totalReferralEarnings) || 0;
    return res.json({
      success: true,
      referralCode,
      totalReferred: referrals.length,
      totalEarnings,
      commissionRate: '5%',
      referrals
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load referral stats: ' + err.message });
  }
});

// Support & Chatbot Routes (User / Visitor)
app.get('/api/support/messages', optionalAuthenticateToken, getUserMessages);
app.post('/api/support/messages', optionalAuthenticateToken, sendUserMessage);

// Admin Support Desk Routes
app.get('/api/admin/support/conversations', authenticateToken, requireAdmin, getAdminConversations);
app.post('/api/admin/support/reply', authenticateToken, requireAdmin, sendAdminReply);
app.put('/api/admin/support/read/:userId', authenticateToken, requireAdmin, markAdminThreadRead);
app.delete('/api/admin/support/conversations/:userId', authenticateToken, requireAdmin, clearAdminConversation);
app.delete('/api/admin/support/messages/:messageId', authenticateToken, requireAdmin, deleteSingleMessage);

// Admin Routes (Guarded by requireAdmin)
app.get('/api/admin/users', authenticateToken, requireAdmin, listAllUsers);
app.post('/api/admin/users', authenticateToken, requireAdmin, createNewUser);
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, editUser);
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, removeUser);
app.get('/api/admin/users/:id/dashboard', authenticateToken, requireAdmin, inspectUserDashboard);

app.get('/api/admin/transactions', authenticateToken, requireAdmin, listAllTransactionsAdmin);
app.put('/api/admin/transactions/:id/status', authenticateToken, requireAdmin, handleTransactionStatus);

app.get('/api/admin/kyc-submissions', authenticateToken, requireAdmin, fetchKycSubmissions);
app.post('/api/admin/kyc-submissions/:id/accept', authenticateToken, requireAdmin, acceptKycSubmission);
app.get('/api/admin/settings', authenticateToken, requireAdmin, fetchPlatformSettings);
app.put('/api/admin/settings', authenticateToken, requireAdmin, savePlatformSettings);

// Alpha-V Bot Public & Admin Routes
app.get('/api/bot/data', (req, res) => {
  try {
    const data = getBotData();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bot data: ' + err.message });
  }
});

app.post('/api/admin/bot/trades', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { pair, type, entry, exit, profit, time, status } = req.body;
    if (!pair || !entry) {
      return res.status(400).json({ error: 'Instrument pair and entry price are required' });
    }
    const trade = createBotTrade({ pair, type, entry, exit, profit, time, status });
    res.json({ success: true, trade });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create bot trade: ' + err.message });
  }
});

app.delete('/api/admin/bot/trades/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const deleted = deleteBotTrade(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json({ success: true, message: 'Bot trade removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bot trade: ' + err.message });
  }
});

app.put('/api/admin/bot/config', authenticateToken, requireAdmin, (req, res) => {
  try {
    const updated = updateBotConfig(req.body);
    res.json({ success: true, config: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bot config: ' + err.message });
  }
});

// Serve static client build for direct access via http://localhost:5050
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Nexora Trading Backend running on http://localhost:${PORT}`);
    console.log(`🔑 Default Admin: admin / admin123`);
    console.log(`📈 Automated Mon-Fri 1%/day compounding growth engine initialized`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Database initialization fatal error:', err);
  app.listen(PORT, () => {
    console.log(`🚀 Nexora Trading running on http://localhost:${PORT}`);
  });
});
