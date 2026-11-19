import React, { useState, useEffect } from 'react';
import { NexoraLogo } from '../components/NexoraLogo';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  BarChart3,
  Coins,
  Cpu,
  CheckCircle,
  Clock,
  Wallet,
  Calculator,
  Download,
  Smartphone,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { API_BASE } from '../apiConfig.js';

export function LandingPage({ onOpenKyc, onOpenLogin }) {
  // Catch referral code from URL query param
  const [partnerRef, setPartnerRef] = useState('');

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        const cleanRef = ref.trim().toUpperCase();
        setPartnerRef(cleanRef);
        localStorage.setItem('nexora_ref', cleanRef);
      } else {
        const stored = localStorage.getItem('nexora_ref');
        if (stored) setPartnerRef(stored);
      }
    } catch (_) {}
  }, []);

  // Interactive Calculator State
  const [calcAmount, setCalcAmount] = useState(1000);
  const presetAmounts = [200, 500, 1000, 2500, 5000, 10000];

  // Compound return formula for n weekdays at 1% daily
  const calcReturn = (principal, days) => {
    const rate = 0.01;
    const finalAmount = principal * Math.pow(1 + rate, days);
    return {
      finalAmount: finalAmount.toFixed(2),
      profit: (finalAmount - principal).toFixed(2),
      pct: (((finalAmount - principal) / principal) * 100).toFixed(1)
    };
  };

  const day1 = calcReturn(calcAmount, 1);
  const day5 = calcReturn(calcAmount, 5);
  const day20 = calcReturn(calcAmount, 20);

  return (
    <div className="landing-container">
      {/* 1. Hero Section */}
      <section className="landing-hero">
        {/* Glowing Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 22px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(6, 182, 212, 0.22) 100%)',
          border: '1px solid rgba(148, 163, 240, 0.4)',
          color: '#38bdf8',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.25)',
          marginBottom: '26px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00e676',
            boxShadow: '0 0 10px #00e676'
          }} />
          <Zap size={15} color="#00f2fe" />
          <span>Nexora Quantitative Protocol • Mon–Fri +1.0% Yield</span>
        </div>

        {/* Crisp, Bold Headline (ZERO text masking) */}
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: '1.15',
          marginBottom: '22px',
          color: '#ffffff',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Algorithmic Trading & <br />
          <span style={{
            color: '#00f2fe',
            textShadow: '0 0 30px rgba(0, 242, 254, 0.4)'
          }}>
            Disciplined Daily Growth
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: '#cbd5e1',
          maxWidth: '740px',
          margin: '0 auto 38px',
          lineHeight: '1.65',
          padding: '0 8px'
        }}>
          Welcome to <strong style={{ color: '#ffffff' }}>Nexora Trading</strong>. We deploy institutional quantitative arbitrage models to generate <strong style={{ color: '#00e676' }}>+1.0% daily weekday compounding</strong>. Complete your compliance KYC, receive verified credentials, fund your account, and withdraw profits instantly to USDT or Binance Pay.
        </p>

        {/* Hero Actions Row */}
        <div className="landing-cta-row" style={{ marginBottom: '24px' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '14px 30px', fontSize: '15px' }}
            onClick={onOpenKyc}
          >
            <ShieldCheck size={18} /> Open Account & Submit KYC <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-purple"
            style={{ padding: '14px 28px', fontSize: '15px' }}
            onClick={onOpenLogin}
          >
            Access Trader Portal
          </button>
          <a
            href={`${API_BASE}/NexoraTrading.apk`}
            download="NexoraTrading.apk"
            className="btn btn-secondary"
            style={{ padding: '14px 22px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Smartphone size={17} color="#38bdf8" /> Download APK
          </a>
        </div>

        {/* Partner Referral Alert Banner if user clicked a referral link */}
        {partnerRef && (
          <div style={{
            maxWidth: '650px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#ffffff'
          }}>
            <span style={{ fontSize: '18px' }}>🤝</span>
            <span>
              Invited by partner <strong style={{ color: '#00f2fe', fontFamily: 'JetBrains Mono' }}>{partnerRef}</strong>! Register now to receive your <strong>10% Welcome Bonus</strong>.
            </span>
          </div>
        )}

        {/* Dual Incentive Banner: 10% Investment Bonus & 5% Referral Commission */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          maxWidth: '850px',
          margin: '0 auto 30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '24px' }}>🎁</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>
                10% Instant Investment Bonus
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                Every deposited dollar earns an immediate +10% bonus added to your trading balance.
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '24px' }}>🤝</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#00f2fe' }}>
                5% Referral Partner Rewards
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                Refer friends and receive 5% cash commission of what they invest straight to your wallet.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Live Metrics 4-Grid Strip with Vibrant Colors */}
        <div className="landing-metrics-grid">
          {/* Card 1: Emerald (Daily Yield) */}
          <div className="glass-panel" style={{
            padding: '24px 18px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.18) 0%, rgba(17, 24, 56, 0.85) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.45)',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.18)'
          }}>
            <div style={{ fontSize: '11px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px' }}>
              Weekday Target Yield
            </div>
            <div style={{ fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 800, color: '#00e676', fontFamily: 'JetBrains Mono', textShadow: '0 0 20px rgba(0, 230, 118, 0.45)' }}>
              +1.00% / Day
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', fontWeight: 500 }}>
              Active Monday to Friday
            </div>
          </div>

          {/* Card 2: Cyan (Min Deposit) */}
          <div className="glass-panel" style={{
            padding: '24px 18px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.18) 0%, rgba(17, 24, 56, 0.85) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            boxShadow: '0 10px 30px rgba(6, 182, 212, 0.18)'
          }}>
            <div style={{ fontSize: '11px', color: '#bae6fd', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px' }}>
              Minimum Initial Capital
            </div>
            <div style={{ fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 800, color: '#00f2fe', fontFamily: 'JetBrains Mono', textShadow: '0 0 20px rgba(0, 242, 254, 0.45)' }}>
              $200+ USD
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', fontWeight: 500 }}>
              No Maximum Investment Cap
            </div>
          </div>

          {/* Card 3: Amber (Weekend Shield) */}
          <div className="glass-panel" style={{
            padding: '24px 18px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.18) 0%, rgba(17, 24, 56, 0.85) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.45)',
            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.18)'
          }}>
            <div style={{ fontSize: '11px', color: '#fde68a', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px' }}>
              Weekend Risk Protocol
            </div>
            <div style={{ fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 800, color: '#fbbf24', fontFamily: 'JetBrains Mono', textShadow: '0 0 20px rgba(251, 191, 36, 0.45)' }}>
              100% Shielded
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', fontWeight: 500 }}>
              Zero Risk Paused Sat & Sun
            </div>
          </div>

          {/* Card 4: Violet (Instant Payout) */}
          <div className="glass-panel" style={{
            padding: '24px 18px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.18) 0%, rgba(17, 24, 56, 0.85) 100%)',
            border: '1px solid rgba(192, 132, 252, 0.45)',
            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.18)'
          }}>
            <div style={{ fontSize: '11px', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '8px' }}>
              Payout Settlement
            </div>
            <div style={{ fontSize: 'clamp(22px, 4.5vw, 30px)', fontWeight: 800, color: '#c084fc', fontFamily: 'JetBrains Mono', textShadow: '0 0 20px rgba(192, 132, 252, 0.45)' }}>
              Instant USDT
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', fontWeight: 500 }}>
              TRC-20 & Binance Pay ID
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Compound Growth Calculator */}
      <section style={{ padding: '50px 0 30px' }}>
        <div className="glass-panel" style={{
          padding: '36px 30px',
          background: 'linear-gradient(135deg, rgba(23, 33, 76, 0.9) 0%, rgba(15, 22, 54, 0.95) 100%)',
          border: '1px solid rgba(148, 163, 240, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45), 0 0 35px rgba(99, 102, 241, 0.18)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span className="badge badge-purple" style={{ marginBottom: '10px' }}>
              <Calculator size={14} /> Interactive Yield Simulator
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 4.5vw, 34px)', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
              Calculate Your 1% Daily Compounding Returns
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', maxWidth: '640px', margin: '0 auto' }}>
              Test how your initial capital compounds at +1% every weekday (Mon–Fri) under Nexora's quantitative model.
            </p>
          </div>

          {/* Amount Presets */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '26px'
          }}>
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setCalcAmount(amt)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: calcAmount === amt ? '1px solid #00f2fe' : '1px solid rgba(148, 163, 240, 0.25)',
                  background: calcAmount === amt ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: calcAmount === amt ? '#00f2fe' : '#cbd5e1',
                  transition: 'all 0.2s',
                  boxShadow: calcAmount === amt ? '0 0 15px rgba(0, 242, 254, 0.35)' : 'none'
                }}
              >
                ${amt.toLocaleString()} USD
              </button>
            ))}
          </div>

          {/* Slider */}
          <div style={{ maxWidth: '600px', margin: '0 auto 34px', padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>
              <span>Initial Capital: <strong style={{ color: '#ffffff' }}>${calcAmount.toLocaleString()} USD</strong></span>
              <span style={{ color: '#00e676' }}>+1.0% / Weekday</span>
            </div>
            <input
              type="range"
              min="200"
              max="20000"
              step="100"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, #00f2fe, #8b5cf6)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Projections 3-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px'
          }}>
            {/* 1 Day */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 80, 0.6) 0%, rgba(18, 26, 60, 0.75) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '14px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                1 Weekday (24 Hours)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono', marginBottom: '6px' }}>
                ${day1.finalAmount}
              </div>
              <div style={{ fontSize: '12px', color: '#00e676', fontWeight: 700 }}>
                +${day1.profit} profit (+{day1.pct}%)
              </div>
            </div>

            {/* 5 Days (1 Week) */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.15) 0%, rgba(18, 26, 60, 0.75) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              borderRadius: '14px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
            }}>
              <div style={{ fontSize: '12px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                5 Weekdays (1 Week)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#00e676', fontFamily: 'JetBrains Mono', marginBottom: '6px' }}>
                ${day5.finalAmount}
              </div>
              <div style={{ fontSize: '12px', color: '#00e676', fontWeight: 700 }}>
                +${day5.profit} profit (+{day5.pct}%)
              </div>
            </div>

            {/* 20 Days (1 Month) */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.18) 0%, rgba(18, 26, 60, 0.75) 100%)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              borderRadius: '14px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)'
            }}>
              <div style={{ fontSize: '12px', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                20 Weekdays (1 Month)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#c084fc', fontFamily: 'JetBrains Mono', marginBottom: '6px' }}>
                ${day20.finalAmount}
              </div>
              <div style={{ fontSize: '12px', color: '#00e676', fontWeight: 700 }}>
                +${day20.profit} profit (+{day20.pct}%)
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '26px' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '14px' }}
              onClick={onOpenKyc}
            >
              Start Earning 1% Daily with ${calcAmount.toLocaleString()} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. How Nexora Works (4-Stage Colorful Journey) */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '10px' }}>
            Streamlined Protocol
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
            How Nexora Trading Operates
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', padding: '0 8px' }}>
            A transparent 4-stage onboarding and quantitative compounding process
          </p>
        </div>

        <div className="landing-steps-grid">
          {/* Step 1: Cyan */}
          <div className="glass-panel" style={{
            padding: '26px',
            background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.12) 0%, rgba(18, 26, 62, 0.8) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#030814',
              fontWeight: 800,
              fontSize: '17px',
              boxShadow: '0 4px 18px rgba(0, 242, 254, 0.45)',
              marginBottom: '18px'
            }}>
              01
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              KYC Document Submission
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.65' }}>
              Submit your official personal details (Aadhaar, Contact, Address) and official verification documents. Applications are reviewed by our compliance administration.
            </p>
          </div>

          {/* Step 2: Emerald */}
          <div className="glass-panel" style={{
            padding: '26px',
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(18, 26, 62, 0.8) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.35)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00e676 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#030814',
              fontWeight: 800,
              fontSize: '17px',
              boxShadow: '0 4px 18px rgba(0, 230, 118, 0.45)',
              marginBottom: '18px'
            }}>
              02
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              Admin Verification & Deposit
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.65' }}>
              The admin desk verifies your application and provides verified login credentials. Deposit the minimum initial investment ($200+ USD) to activate your balance.
            </p>
          </div>

          {/* Step 3: Amber */}
          <div className="glass-panel" style={{
            padding: '26px',
            background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.12) 0%, rgba(18, 26, 62, 0.8) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.35)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#030814',
              fontWeight: 800,
              fontSize: '17px',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)',
              marginBottom: '18px'
            }}>
              03
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              Mon–Fri Automated Profit
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.65' }}>
              Your account gains +1.0% compounding yield automatically every business day (Monday through Friday). On Saturday and Sunday, growth is paused cleanly with zero market risk.
            </p>
          </div>

          {/* Step 4: Violet */}
          <div className="glass-panel" style={{
            padding: '26px',
            background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.12) 0%, rgba(18, 26, 62, 0.8) 100%)',
            border: '1px solid rgba(192, 132, 252, 0.35)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '17px',
              boxShadow: '0 4px 18px rgba(139, 92, 246, 0.45)',
              marginBottom: '18px'
            }}>
              04
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              Instant USDT / Binance Payout
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.65' }}>
              Request payouts anytime to your USDT wallet address (TRC-20) or Binance Pay ID. The administrator dispatches payments promptly upon notification.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Institutional Governance & Security Showcase */}
      <section style={{ padding: '30px 0' }}>
        <div className="glass-panel landing-feature-panel">
          <div className="landing-feature-grid">
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '14px' }}>
                Institutional Standards
              </span>
              <h3 style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                Full Administrative Oversight & Capital Solvency
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', marginBottom: '22px' }}>
                Nexora Trading guarantees operational reliability. Every client portfolio, daily yield transaction, deposit, and withdrawal request is audited in real-time by compliance administrators to ensure total solvency and security.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9', fontSize: '13px' }}>
                  <CheckCircle size={18} color="#00e676" style={{ flexShrink: 0 }} /> Mandatory Aadhaar identity verification before account activation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9', fontSize: '13px' }}>
                  <CheckCircle size={18} color="#00e676" style={{ flexShrink: 0 }} /> Systematic +1.0% daily weekday compounding rate (Mon–Fri)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9', fontSize: '13px' }}>
                  <CheckCircle size={18} color="#00e676" style={{ flexShrink: 0 }} /> Fast settlement to USDT TRC-20 and Binance Pay IDs
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9', fontSize: '13px' }}>
                  <CheckCircle size={18} color="#00e676" style={{ flexShrink: 0 }} /> 100% weekend market risk pause on Saturdays & Sundays
                </div>
              </div>
            </div>

            {/* Growth Curve Card */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(28, 38, 80, 0.8) 0%, rgba(16, 23, 56, 0.9) 100%)',
              borderRadius: '20px',
              padding: '26px',
              border: '1px solid rgba(148, 163, 240, 0.3)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.45)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Sample Account Growth Curve</span>
                <span className="badge badge-emerald">Active +1.0%/Day</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '12px 14px', background: 'rgba(51, 65, 85, 0.35)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Deposited Capital</span>
                  <strong style={{ color: '#ffffff' }}>$200.00 USD</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '12px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(52, 211, 153, 0.35)', borderRadius: '10px' }}>
                  <span style={{ color: '#cbd5e1' }}>Day 1 (Monday)</span>
                  <strong style={{ color: '#00e676', fontFamily: 'JetBrains Mono' }}>$202.00 USD (+1.0%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '12px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(52, 211, 153, 0.35)', borderRadius: '10px' }}>
                  <span style={{ color: '#cbd5e1' }}>Day 2 (Tuesday)</span>
                  <strong style={{ color: '#00e676', fontFamily: 'JetBrains Mono' }}>$204.02 USD (+1.0%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '12px 14px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(251, 191, 36, 0.35)', borderRadius: '10px' }}>
                  <span style={{ color: '#cbd5e1' }}>Weekend (Sat & Sun)</span>
                  <strong style={{ color: '#fbbf24', fontFamily: 'JetBrains Mono' }}>$204.02 USD (Paused)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bottom Call to Action */}
      <section style={{ textAlign: 'center', padding: '60px 0 20px' }}>
        <h2 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
          Ready to Grow with Nexora Trading?
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '640px', margin: '0 auto 30px', padding: '0 8px', lineHeight: '1.6' }}>
          Submit your KYC credentials today. Once approved by administration, receive your verified account credentials, deposit the minimum initial investment ($200+ USD), and watch your balance compound +1.0% each weekday.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '14px 32px', fontSize: '15px' }}
            onClick={onOpenKyc}
          >
            <ShieldCheck size={18} /> Submit KYC Application Now
          </button>
          <a
            href={`${API_BASE}/NexoraTrading.apk`}
            download="NexoraTrading.apk"
            className="btn btn-secondary"
            style={{ padding: '14px 22px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Smartphone size={17} color="#38bdf8" /> Download APK
          </a>
        </div>
      </section>

      {/* 7. Footer */}
      <footer style={{
        marginTop: '70px',
        paddingTop: '30px',
        borderTop: '1px solid rgba(148, 163, 240, 0.18)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <NexoraLogo size="sm" showText={false} />
          <div>
            © 2026 <strong style={{ color: '#ffffff' }}>Nexora Trading</strong> Quantitative Yield Technologies. All rights reserved.
          </div>
        </div>
        <div>
          Identity verification managed by compliance desk • Mon–Fri +1% algorithmic yield protocol
        </div>
      </footer>
    </div>
  );
}
