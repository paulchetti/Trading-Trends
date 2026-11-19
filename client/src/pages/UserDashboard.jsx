import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../apiConfig.js';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  TrendingUp,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileCheck,
  RefreshCw,
  AlertCircle,
  Download,
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Percent
} from 'lucide-react';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { BotActivity } from '../components/BotActivity';
import { TradingViewWidget } from '../components/TradingViewWidget';

export function UserDashboard() {
  const { user: authUser, wallet: authWallet, refreshProfile, impersonatedUser } = useAuth();

  // If Admin is impersonating a user, use impersonated user's data
  const user = impersonatedUser || authUser;
  const wallet = impersonatedUser ? impersonatedUser.wallet : authWallet;

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [myTransactions, setMyTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralStats, setReferralStats] = useState(null);

  useEffect(() => {
    loadTransactions();
    loadReferralStats();
  }, [user]);

  async function loadReferralStats() {
    try {
      const token = localStorage.getItem('tt_token');
      const res = await fetch(`${API_BASE}/api/referrals/my-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReferralStats(data);
      }
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    }
  }

  async function loadTransactions() {
    try {
      const token = localStorage.getItem('tt_token');
      if (impersonatedUser) {
        // Fetch specific impersonated user transactions
        const res = await fetch(`${API_BASE}/api/admin/users/${impersonatedUser.id}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMyTransactions(data.transactions || []);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/transactions/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMyTransactions(data.transactions || []);
        }
      }
    } catch (err) {
      console.error('Failed to load user transactions:', err);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refreshProfile();
    await loadTransactions();
    await loadReferralStats();
    setTimeout(() => setRefreshing(false), 600);
  }

  const isWeekend = wallet?.isWeekend;
  const currentBalance = wallet?.currentBalance || 0;
  const dailyRate = wallet?.dailyGrowthRate ?? 1;
  const todayProfit = wallet?.todayProfit || 0;

  const myRefCode = referralStats?.referralCode || user?.referralCode || 'NX-PARTNER';
  const myRefLink = `${window.location.origin}/?ref=${myRefCode}`;

  function copyReferralLink() {
    navigator.clipboard.writeText(myRefLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function copyReferralCode() {
    navigator.clipboard.writeText(myRefCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: '#ffffff' }}>
              Welcome, {user?.fullName || user?.username}
            </h1>
            <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> KYC Verified
            </span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>
            Nexora Trading Algorithmic Managed Capital • Account ID: <code style={{ color: '#00f2fe' }}>{user?.id}</code>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Wallet'}
          </button>

          <a
            href={`${API_BASE}/api/download/apk`}
            target="_blank"
            rel="noopener noreferrer"
            download="NexoraTrading.apk"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            <Download size={15} /> Download APK
          </a>
        </div>
      </div>

      {/* Main Highlights Grid */}
      <div className="dashboard-highlights-grid">
        {/* Main Wallet Balance Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '26px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Wallet Balance
              </span>
              <div style={{
                fontSize: '38px',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'JetBrains Mono',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px'
              }}>
                ${currentBalance.toFixed(2)}
                <span style={{ fontSize: '16px', color: '#00e676', fontWeight: 600 }}>USD</span>
              </div>
            </div>

            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(0, 242, 254, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={24} color="#00f2fe" />
            </div>
          </div>

          {/* Growth & Yield metrics row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '14px 16px',
            background: 'rgba(30, 41, 59, 0.55)',
            borderRadius: '14px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Today's P&L</div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: isWeekend ? '#fbbf24' : '#34d399',
                fontFamily: 'JetBrains Mono',
                marginTop: '2px'
              }}>
                {isWeekend ? '$0.00 (Weekend)' : `+$${todayProfit.toFixed(2)} USD`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Automated Compounding</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                +{dailyRate}% / day (Mon-Fri)
              </div>
            </div>
          </div>

          {/* Action Buttons: Deposit & Withdraw */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              className="btn btn-emerald"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setDepositOpen(true)}
            >
              <ArrowDownToLine size={18} /> Deposit
            </button>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setWithdrawOpen(true)}
            >
              <ArrowUpFromLine size={18} /> Withdraw
            </button>
          </div>
        </div>

        {/* Growth & Yield Status Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>Growth Engine Schedule</span>
              <span className={`badge ${isWeekend ? 'badge-gold' : 'badge-emerald'}`}>
                {isWeekend ? 'Weekend Paused' : 'Active (Mon–Fri Growth)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Invested Trading Capital:</span>
                <strong style={{ color: '#ffffff' }}>${(user?.investedAmount || wallet?.initialBalance || 0).toFixed(2)} USD</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 14px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)', border: '1px solid rgba(251, 191, 36, 0.35)', borderRadius: '10px' }}>
                <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gift size={14} /> 10% Investment Bonus:
                </span>
                <strong style={{ color: '#fbbf24', fontFamily: 'JetBrains Mono' }}>
                  +${(user?.bonusBalance || ((wallet?.initialBalance || 0) * 0.1)).toFixed(2)} USD
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 14px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Weekdays Active (Mon-Fri):</span>
                <strong style={{ color: '#38bdf8' }}>{wallet?.weekdaysElapsed || 0} business days</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8' }}>Accumulated Bot Yield:</span>
                <strong style={{ color: '#34d399' }}>+${(wallet?.calculatedGrowth || 0).toFixed(2)} USD</strong>
              </div>

              {wallet?.approvedWithdrawalsTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 14px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(251, 113, 133, 0.2)', borderRadius: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Settled Withdrawals:</span>
                  <strong style={{ color: '#fb7185' }}>-${wallet.approvedWithdrawalsTotal.toFixed(2)} USD</strong>
                </div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(0, 242, 254, 0.05)',
            border: '1px solid rgba(0, 242, 254, 0.15)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={16} color="#00f2fe" style={{ flexShrink: 0 }} />
            <span>Next yield cycle credits on the upcoming business day at 00:00 UTC.</span>
          </div>
        </div>

        {/* User Profile & KYC Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>Verified KYC Profile</span>
            <span className="badge badge-cyan">Compliance Approved</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', flexWrap: 'wrap' }}>
              <User size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', minWidth: '65px' }}>Name:</span>
              <strong style={{ color: '#ffffff' }}>{user?.fullName || 'N/A'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', flexWrap: 'wrap' }}>
              <Mail size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', minWidth: '65px' }}>Email:</span>
              <span style={{ wordBreak: 'break-all' }}>{user?.email || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', flexWrap: 'wrap' }}>
              <Phone size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', minWidth: '65px' }}>Phone:</span>
              <span>{user?.phone || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', flexWrap: 'wrap' }}>
              <Calendar size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', minWidth: '65px' }}>DOB:</span>
              <span>{user?.dob || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#d1d5db' }}>
              <MapPin size={15} color="#00f2fe" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ color: '#9ca3af', minWidth: '65px' }}>Address:</span>
              <span style={{ wordBreak: 'break-word', flex: 1 }}>{user?.address || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', flexWrap: 'wrap' }}>
              <FileCheck size={15} color="#00e676" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', minWidth: '65px' }}>Aadhaar:</span>
              <strong style={{ color: '#00e676', fontFamily: 'JetBrains Mono' }}>{user?.aadharNo || 'Verified'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', flexWrap: 'wrap' }}>
              <CreditCard size={15} color="#00e676" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', minWidth: '65px' }}>PAN:</span>
              <strong style={{ color: '#00e676', fontFamily: 'JetBrains Mono' }}>{user?.panNo || 'Verified'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Activity Engine Section */}
      <BotActivity isWeekend={isWeekend} />

      {/* Nexora Referral & Affiliate Program Hub */}
      <div className="glass-panel" style={{
        padding: '24px',
        marginBottom: '24px',
        background: 'linear-gradient(165deg, rgba(20, 28, 64, 0.85) 0%, rgba(13, 18, 44, 0.95) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.28)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={20} color="#00f2fe" />
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Nexora Referral & Affiliate Rewards Hub
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Earn 5% instant commission whenever your referrals invest capital
              </p>
            </div>
          </div>
          <span className="badge badge-cyan" style={{ fontSize: '12px', padding: '6px 14px' }}>
            ● 5% Lifetime Commission
          </span>
        </div>

        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '20px' }}>
          Invite your friends, network, and fellow traders. When they register using your partner link and fund their account, you receive an <strong>instant 5% cash bonus of whatever amount they invest</strong> credited directly into your active trading balance!
        </p>

        {/* Link & Code Share Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}>
          {/* Box 1: Referral Link */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 240, 0.22)',
            borderRadius: '12px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Your Unique Referral Link
              </span>
              <Share2 size={13} color="#00f2fe" />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={myRefLink}
                className="input-field"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono', padding: '8px 10px', background: 'rgba(10, 15, 30, 0.8)' }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={copyReferralLink}
                style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {copiedLink ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
              </button>
            </div>
          </div>

          {/* Box 2: Referral Code */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 240, 0.22)',
            borderRadius: '12px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Your Referral Partner Code
              </span>
              <span style={{ fontSize: '11px', color: '#00e676', fontWeight: 700 }}>Active</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(10, 15, 30, 0.8)',
                border: '1px solid rgba(148, 163, 240, 0.28)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontWeight: 800,
                fontSize: '15px',
                color: '#00f2fe',
                letterSpacing: '1px'
              }}>
                {myRefCode}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={copyReferralCode}
                style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {copiedCode ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
              </button>
            </div>
          </div>
        </div>

        {/* 3 Referral Stat Counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            padding: '14px 16px',
            background: 'rgba(30, 41, 59, 0.45)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Total Friends Referred
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', fontFamily: 'JetBrains Mono' }}>
              {referralStats?.totalReferred ?? (user?.referrals?.length || 0)}
            </div>
          </div>

          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '11px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '4px' }}>
              Total 5% Commissions Earned
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
              +${(referralStats?.totalEarnings ?? (user?.totalReferralEarnings || 0)).toFixed(2)} USD
            </div>
          </div>

          <div style={{
            padding: '14px 16px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '4px' }}>
              Referral Reward Rate
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#a5b4fc', fontFamily: 'JetBrains Mono' }}>
              5.0% Instant
            </div>
          </div>
        </div>

        {/* Referred Traders History (If available) */}
        {((referralStats?.referrals && referralStats.referrals.length > 0) || (user?.referrals && user.referrals.length > 0)) && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Referred Traders & Commission Logs:
            </div>
            <div className="table-responsive-container">
              <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                    <th style={{ padding: '8px 10px' }}>Referred Trader</th>
                    <th style={{ padding: '8px 10px' }}>Capital Invested</th>
                    <th style={{ padding: '8px 10px' }}>5% Commission Earned</th>
                    <th style={{ padding: '8px 10px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(referralStats?.referrals || user?.referrals || []).map((ref, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px', color: '#ffffff', fontWeight: 600 }}>{ref.name || 'Trader'}</td>
                      <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>
                        ${Number(ref.investedAmount || 0).toFixed(2)} USD
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#00e676' }}>
                        +${Number(ref.commissionEarned || 0).toFixed(2)} USD
                      </td>
                      <td style={{ padding: '10px', color: '#6b7280' }}>
                        {ref.date ? new Date(ref.date).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Chart */}
      <TradingViewWidget />

      {/* Daily Growth History & Transactions Tabs */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Portfolio History & Transactions
        </h4>

        {/* Transactions Table */}
        {myTransactions.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#00f2fe' }}>
                Deposits & Withdrawal Requests:
              </span>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                ← Scroll to view all →
              </span>
            </div>
            <div className="table-responsive-container">
              <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Destination / Network</th>
                    <th style={{ padding: '10px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myTransactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: tx.type === 'DEPOSIT' ? '#00e676' : tx.type === 'REFERRAL_BONUS' ? '#00f2fe' : '#ff4757' }}>
                        {tx.type === 'REFERRAL_BONUS' ? '5% REFERRAL BONUS' : tx.type}
                      </td>
                      <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>
                          ${tx.amount.toFixed(2)} USD
                        </div>
                        {tx.type === 'WITHDRAWAL' && (
                          <div style={{ fontSize: '11px', color: '#fb7185', marginTop: '2px' }}>
                            -8% Fee: -${(tx.feeAmount ?? (tx.amount * 0.08)).toFixed(2)} | Net: ${(tx.netPayout ?? (tx.amount * 0.92)).toFixed(2)} USDT
                          </div>
                        )}
                        {tx.type === 'DEPOSIT' && tx.bonusAmount && (
                          <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '2px' }}>
                            +10% Bonus: +${Number(tx.bonusAmount).toFixed(2)} USD
                          </div>
                        )}
                        {tx.type === 'REFERRAL_BONUS' && (
                          <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '2px' }}>
                            5% Commission Credited
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`badge ${
                          tx.status === 'APPROVED' ? 'badge-emerald' : tx.status === 'REJECTED' ? 'badge-rose' : 'badge-gold'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#9ca3af', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                        {tx.note || tx.cryptoAddress || (tx.binanceId ? `Binance: ${tx.binanceId}` : tx.network)}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daily Mon-Fri Growth Statement */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#00e676' }}>
              Automated Daily Profit Timeline (Mon-Fri):
            </span>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              ← Scroll to view all →
            </span>
          </div>
          <div className="table-responsive-container" style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Day of Week</th>
                  <th style={{ padding: '10px' }}>Daily Yield</th>
                  <th style={{ padding: '10px' }}>End of Day Balance</th>
                  <th style={{ padding: '10px' }}>Activity Note</th>
                </tr>
              </thead>
              <tbody>
                {(wallet?.history || []).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px', color: '#d1d5db', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: '10px', color: '#ffffff' }}>
                      {row.dayOfWeek}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: row.isWeekend ? '#9ca3af' : '#00e676' }}>
                      {row.growthAmount > 0 ? `+$${row.growthAmount.toFixed(2)}` : '$0.00'}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#ffffff' }}>
                      ${row.balance.toFixed(2)} USD
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${row.isWeekend ? 'badge-gold' : 'badge-cyan'}`} style={{ fontSize: '11px' }}>
                        {row.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </div>
  );
}
