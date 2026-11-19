import {
  getAllUsers,
  getUserById,
  getUserByEmailOrUsername,
  getUserByReferralCode,
  createUser,
  updateUser,
  deleteUser,
  createTransaction,
  getAllTransactions,
  getTransactionsByUserId,
  getSettings,
  updateSettings,
  getAllKycSubmissions,
  updateKycSubmission
} from '../database.js';
import { calculateUserWallet } from '../services/walletEngine.js';
import { sendCredentialsEmail } from '../services/emailService.js';

export async function listAllUsers(req, res) {
  try {
    const allUsers = getAllUsers();
    const allTxs = getAllTransactions();

    const usersWithWallets = allUsers.map(u => {
      const userTxs = allTxs.filter(t => t.userId === u.id);
      const growthStart = u.growthStartDate ? new Date(u.growthStartDate).getTime() : 0;
      const approvedWithdrawals = userTxs
        .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const wallet = calculateUserWallet(u, approvedWithdrawals);
      const safe = { ...u };
      delete safe.passwordHash;
      return {
        ...safe,
        wallet
      };
    });

    return res.json({ success: true, users: usersWithWallets });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users: ' + err.message });
  }
}

export async function createNewUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      fullName,
      phone,
      dob,
      address,
      aadharNo,
      panNo,
      initialBalance = 200,
      dailyGrowthRate = 1,
      status = 'ACTIVE',
      sendEmailToUser = true
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Prevent duplicate username or email collisions
    const existingUser = getUserByEmailOrUsername(cleanUsername) || getUserByEmailOrUsername(cleanEmail);
    if (existingUser) {
      return res.status(400).json({
        error: `A user account with username "${cleanUsername}" or email "${cleanEmail}" already exists. Please choose a unique username/email.`
      });
    }

    const baseInvested = Math.max(0, Number(initialBalance));
    const investmentBonus = Math.round(baseInvested * 0.10 * 100) / 100; // 10% Bonus
    const startingBalance = baseInvested + investmentBonus;

    const newUser = createUser({
      username: cleanUsername,
      email: cleanEmail,
      password: password.trim(),
      role: 'USER',
      fullName: fullName || username,
      phone: phone || '',
      dob: dob || '',
      address: address || '',
      aadharNo: aadharNo || '',
      panNo: panNo || '',
      initialBalance: startingBalance,
      investedAmount: baseInvested,
      bonusBalance: investmentBonus,
      dailyGrowthRate: Number(dailyGrowthRate),
      growthStartDate: new Date().toISOString(),
      manualAdjustment: 0,
      referredBy: req.body.referredBy || null,
      status
    });

    if (baseInvested > 0) {
      createTransaction({
        userId: newUser.id,
        userName: newUser.fullName || newUser.username,
        userEmail: newUser.email,
        type: 'DEPOSIT',
        amount: baseInvested,
        bonusAmount: investmentBonus,
        status: 'APPROVED',
        note: `Initial Investment ($${baseInvested.toFixed(2)}) + 10% Bonus ($${investmentBonus.toFixed(2)})`
      });

      // 5% Referral bonus if referred
      if (req.body.referredBy) {
        const referrer = getUserById(req.body.referredBy) || getUserByReferralCode(req.body.referredBy);
        if (referrer && referrer.id !== newUser.id) {
          const commission = Math.round(baseInvested * 0.05 * 100) / 100;
          if (commission > 0) {
            updateUser(referrer.id, {
              initialBalance: (Number(referrer.initialBalance) || 0) + commission,
              totalReferralEarnings: (Number(referrer.totalReferralEarnings) || 0) + commission,
              referrals: [...(referrer.referrals || []), {
                userId: newUser.id,
                name: newUser.fullName || newUser.username,
                email: newUser.email,
                investedAmount: baseInvested,
                commissionEarned: commission,
                date: new Date().toISOString()
              }]
            });
            createTransaction({
              userId: referrer.id,
              userName: referrer.fullName || referrer.username,
              userEmail: referrer.email,
              type: 'REFERRAL_BONUS',
              amount: commission,
              status: 'APPROVED',
              note: `5% Referral Commission from ${newUser.fullName}'s investment of $${baseInvested.toFixed(2)}`
            });
          }
        }
      }
    }

    // Optionally dispatch credentials to the user's email
    if (sendEmailToUser) {
      await sendCredentialsEmail({
        toEmail: newUser.email,
        username: newUser.username,
        password: password.trim(),
        fullName: newUser.fullName,
        initialBalance: newUser.initialBalance
      });
    }

    const safeUser = { ...newUser };
    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,
      message: `User ${newUser.username} created successfully with 10% bonus ($${investmentBonus.toFixed(2)})!`,
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
}

export async function editUser(req, res) {
  try {
    const { id } = req.params;
    const existing = getUserById(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = { ...req.body };

    // If admin is explicitly overriding the total current balance
    if (updates.overrideBalance !== undefined && updates.overrideBalance !== null && updates.overrideBalance !== '') {
      const newTargetBalance = Math.max(0, Number(updates.overrideBalance));
      updates.initialBalance = newTargetBalance;
      updates.growthStartDate = new Date().toISOString();
      updates.manualAdjustment = 0;
      delete updates.overrideBalance;
    }

    if (updates.initialBalance !== undefined) {
      updates.initialBalance = Number(updates.initialBalance);
    }
    if (updates.dailyGrowthRate !== undefined) {
      updates.dailyGrowthRate = Number(updates.dailyGrowthRate);
    }

    const updated = updateUser(id, updates);
    const safeUser = { ...updated };
    delete safeUser.passwordHash;

    const userTxs = getTransactionsByUserId(id);
    const growthStart = updated.growthStartDate ? new Date(updated.growthStartDate).getTime() : 0;
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const wallet = calculateUserWallet(updated, approvedWithdrawals);

    return res.json({
      success: true,
      message: 'User profile and dashboard updated successfully',
      user: safeUser,
      wallet
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user: ' + err.message });
  }
}

export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    const existing = getUserById(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (existing.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot delete system administrator' });
    }

    deleteUser(id);
    return res.json({ success: true, message: 'User account removed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
}

export async function fetchPlatformSettings(req, res) {
  try {
    const settings = getSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load settings: ' + err.message });
  }
}

export async function savePlatformSettings(req, res) {
  try {
    const updated = updateSettings(req.body);
    return res.json({ success: true, message: 'Platform settings saved successfully', settings: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save settings: ' + err.message });
  }
}

export async function fetchKycSubmissions(req, res) {
  try {
    const submissions = getAllKycSubmissions();
    return res.json({ success: true, submissions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load KYC submissions: ' + err.message });
  }
}

export async function acceptKycSubmission(req, res) {
  try {
    const { id } = req.params;
    const { initialBalance = 200, dailyGrowthRate = 1 } = req.body;
    const submissions = getAllKycSubmissions();
    const sub = submissions.find(s => s.id === id);
    if (!sub) {
      return res.status(404).json({ error: 'KYC submission not found' });
    }

    const investedAmount = Math.max(0, Number(initialBalance) || 200);
    const investmentBonus = Math.round(investedAmount * 0.10 * 100) / 100; // 10% Investment Bonus
    const startingBalance = investedAmount + investmentBonus;

    let user = sub.userId ? getUserById(sub.userId) : getUserByEmailOrUsername(sub.email);
    if (user) {
      updateUser(user.id, {
        status: 'ACTIVE',
        initialBalance: startingBalance,
        investedAmount,
        bonusBalance: (Number(user.bonusBalance) || 0) + investmentBonus,
        dailyGrowthRate: Number(dailyGrowthRate) || user.dailyGrowthRate || 1,
        growthStartDate: new Date().toISOString()
      });
      user = getUserById(user.id);
    } else {
      const baseUsername = sub.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const uniqueUsername = baseUsername + Math.floor(100 + Math.random() * 900);
      user = createUser({
        username: uniqueUsername,
        email: sub.email,
        password: 'NT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!',
        fullName: sub.name,
        phone: sub.phone,
        dob: sub.dob,
        address: sub.address,
        aadharNo: sub.aadhar,
        panNo: sub.pan,
        initialBalance: startingBalance,
        investedAmount,
        bonusBalance: investmentBonus,
        dailyGrowthRate: Number(dailyGrowthRate) || 1,
        referredBy: sub.referralCode || sub.referredBy || null,
        status: 'ACTIVE'
      });
    }

    // Log the user's initial deposit transaction with 10% bonus
    createTransaction({
      userId: user.id,
      userName: user.fullName || user.username,
      userEmail: user.email,
      type: 'DEPOSIT',
      amount: investedAmount,
      bonusAmount: investmentBonus,
      status: 'APPROVED',
      note: `Initial Investment ($${investedAmount.toFixed(2)}) + 10% Bonus ($${investmentBonus.toFixed(2)})`
    });

    // 5% Referral Commission if user was referred by someone
    const refCode = user.referredBy || sub.referralCode || sub.referredBy;
    if (refCode) {
      const referrer = getUserById(refCode) || getUserByReferralCode(refCode);
      if (referrer && referrer.id !== user.id) {
        const refCommission = Math.round(investedAmount * 0.05 * 100) / 100; // 5% Commission
        if (refCommission > 0) {
          const updatedRefBalance = (Number(referrer.initialBalance) || 0) + refCommission;
          const updatedTotalEarnings = (Number(referrer.totalReferralEarnings) || 0) + refCommission;
          const currentReferrals = Array.isArray(referrer.referrals) ? [...referrer.referrals] : [];
          currentReferrals.push({
            userId: user.id,
            name: user.fullName || user.username,
            email: user.email,
            investedAmount,
            commissionEarned: refCommission,
            date: new Date().toISOString()
          });

          updateUser(referrer.id, {
            initialBalance: updatedRefBalance,
            totalReferralEarnings: updatedTotalEarnings,
            referrals: currentReferrals
          });

          createTransaction({
            userId: referrer.id,
            userName: referrer.fullName || referrer.username,
            userEmail: referrer.email,
            type: 'REFERRAL_BONUS',
            amount: refCommission,
            status: 'APPROVED',
            note: `5% Referral Commission from ${user.fullName || user.username}'s investment of $${investedAmount.toFixed(2)}`
          });
        }
      }
    }

    updateKycSubmission(id, { status: 'APPROVED', approvedAt: new Date().toISOString() });

    return res.json({
      success: true,
      message: `Account for ${sub.name} has been accepted and activated! Credited $${investedAmount.toFixed(2)} + 10% bonus ($${investmentBonus.toFixed(2)}) = $${startingBalance.toFixed(2)}.`,
      user
    });
  } catch (err) {
    console.error('Accept KYC error:', err);
    return res.status(500).json({ error: 'Failed to accept KYC submission: ' + err.message });
  }
}

export async function inspectUserDashboard(req, res) {
  try {
    const { id } = req.params;
    const user = getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userTxs = getTransactionsByUserId(id);
    const growthStart = user.growthStartDate ? new Date(user.growthStartDate).getTime() : 0;
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const wallet = calculateUserWallet(user, approvedWithdrawals);

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.json({
      success: true,
      user: safeUser,
      wallet,
      transactions: userTxs
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to inspect user: ' + err.message });
  }
}
