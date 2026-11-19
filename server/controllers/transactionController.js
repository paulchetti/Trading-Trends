import {
  createTransaction,
  getTransactionsByUserId,
  getTransactionById,
  getAllTransactions,
  updateTransaction,
  getUserById,
  getUserByReferralCode,
  updateUser,
  getSettings
} from '../database.js';
import { calculateUserWallet } from '../services/walletEngine.js';
import { sendWithdrawalRequestEmail } from '../services/emailService.js';

export async function requestWithdrawal(req, res) {
  try {
    const { amount, cryptoAddress, network, binanceId, note } = req.body;
    const user = getUserById(req.user.id);

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please specify a valid withdrawal amount' });
    }

    if (!cryptoAddress && !binanceId) {
      return res.status(400).json({ error: 'Please provide either a Crypto Wallet Address or a Binance ID' });
    }

    // Check available balance
    const userTxs = getTransactionsByUserId(user.id);
    const growthStart = user.growthStartDate ? new Date(user.growthStartDate).getTime() : 0;
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const wallet = calculateUserWallet(user, approvedWithdrawals);

    const withdrawAmount = Number(amount);
    if (withdrawAmount > wallet.currentBalance) {
      return res.status(400).json({
        error: `Insufficient funds. Available balance: $${wallet.currentBalance.toFixed(2)} USD`
      });
    }

    const feeRate = 0.08; // 8% Platform fee
    const feeAmount = Math.round(withdrawAmount * feeRate * 100) / 100;
    const netPayout = Math.round((withdrawAmount - feeAmount) * 100) / 100;

    const feeNote = `Gross: $${withdrawAmount.toFixed(2)} | 8% Platform Fee: $${feeAmount.toFixed(2)} | Net Payout: $${netPayout.toFixed(2)}`;
    const fullNote = note ? `${note} (${feeNote})` : feeNote;

    const tx = createTransaction({
      userId: user.id,
      userName: user.fullName || user.username,
      userEmail: user.email,
      type: 'WITHDRAWAL',
      amount: withdrawAmount,
      feeAmount,
      feeRate: '8%',
      netPayout,
      cryptoAddress: cryptoAddress ? cryptoAddress.trim() : '',
      network: network || 'USDT (TRC-20)',
      binanceId: binanceId ? binanceId.trim() : '',
      status: 'PENDING',
      note: fullNote
    });

    // Send email alert to admin with fee & net payout details
    await sendWithdrawalRequestEmail({
      user,
      amount: withdrawAmount,
      feeAmount,
      netPayout,
      cryptoAddress,
      network: network || 'USDT (TRC-20)',
      binanceId
    });

    return res.status(201).json({
      success: true,
      message: `Withdrawal request submitted! Gross: $${withdrawAmount.toFixed(2)}, Platform Fee (8%): $${feeAmount.toFixed(2)}, Net Payout: $${netPayout.toFixed(2)} USDT.`,
      transaction: tx
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process withdrawal request: ' + err.message });
  }
}

export async function submitDepositNotice(req, res) {
  try {
    const { amount, txHash, network, note } = req.body;
    const user = getUserById(req.user.id);

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid deposit amount' });
    }

    const tx = createTransaction({
      userId: user.id,
      userName: user.fullName || user.username,
      userEmail: user.email,
      type: 'DEPOSIT',
      amount: Number(amount),
      network: network || 'USDT (TRC-20)',
      txHash: txHash ? txHash.trim() : '',
      status: 'PENDING',
      note: note || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Deposit notification logged. Funds will reflect in your wallet upon admin on-chain confirmation.',
      transaction: tx
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to log deposit notice: ' + err.message });
  }
}

export async function getMyTransactions(req, res) {
  try {
    const txs = getTransactionsByUserId(req.user.id);
    return res.json({ success: true, transactions: txs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load transactions: ' + err.message });
  }
}

export async function listAllTransactionsAdmin(req, res) {
  try {
    const txs = getAllTransactions();
    return res.json({ success: true, transactions: txs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load transactions: ' + err.message });
  }
}

export async function handleTransactionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note, newBalance } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const tx = getTransactionById(id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // When approving a DEPOSIT, credit the user's wallet + 10% Investment Bonus
    if (status === 'APPROVED' && tx.type === 'DEPOSIT') {
      const user = getUserById(tx.userId);
      if (user) {
        const depositAmount = Number(tx.amount) || 0;
        const depositBonus = Math.round(depositAmount * 0.10 * 100) / 100; // 10% Investment Bonus
        const totalCredited = depositAmount + depositBonus;

        let targetBalance;
        if (newBalance !== undefined && newBalance !== null && newBalance !== '') {
          targetBalance = Math.max(0, Number(newBalance));
        } else {
          targetBalance = (Number(user.initialBalance) || 0) + totalCredited;
        }

        updateUser(user.id, {
          initialBalance: targetBalance,
          investedAmount: (Number(user.investedAmount) || 0) + depositAmount,
          bonusBalance: (Number(user.bonusBalance) || 0) + depositBonus,
          growthStartDate: new Date().toISOString(),
          manualAdjustment: 0
        });

        // 5% Referral Commission for referrer if user was referred
        if (user.referredBy) {
          const referrer = getUserById(user.referredBy) || getUserByReferralCode(user.referredBy);
          if (referrer && referrer.id !== user.id) {
            const refCommission = Math.round(depositAmount * 0.05 * 100) / 100; // 5% Commission
            if (refCommission > 0) {
              const updatedRefBalance = (Number(referrer.initialBalance) || 0) + refCommission;
              const updatedEarnings = (Number(referrer.totalReferralEarnings) || 0) + refCommission;
              const currentReferrals = Array.isArray(referrer.referrals) ? [...referrer.referrals] : [];
              currentReferrals.push({
                userId: user.id,
                name: user.fullName || user.username,
                email: user.email,
                investedAmount: depositAmount,
                commissionEarned: refCommission,
                date: new Date().toISOString()
              });

              updateUser(referrer.id, {
                initialBalance: updatedRefBalance,
                totalReferralEarnings: updatedEarnings,
                referrals: currentReferrals
              });

              createTransaction({
                userId: referrer.id,
                userName: referrer.fullName || referrer.username,
                userEmail: referrer.email,
                type: 'REFERRAL_BONUS',
                amount: refCommission,
                status: 'APPROVED',
                note: `5% Referral Commission on ${user.fullName || user.username}'s deposit of $${depositAmount.toFixed(2)}`
              });
            }
          }
        }
      }
    }

    const updated = updateTransaction(id, {
      status,
      note: note !== undefined ? note : undefined
    });

    return res.json({
      success: true,
      message: `Transaction ${id} marked as ${status}`,
      transaction: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update transaction status: ' + err.message });
  }
}

export async function getPublicDepositInfo(req, res) {
  try {
    const settings = getSettings();
    return res.json({
      success: true,
      depositInfo: {
        address: settings.depositUsdtAddress,
        network: settings.depositNetwork,
        qrCode: settings.depositQrCode,
        note: settings.depositNote
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load deposit info: ' + err.message });
  }
}
