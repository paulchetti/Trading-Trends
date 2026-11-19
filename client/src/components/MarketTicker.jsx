import React from 'react';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export function MarketTicker() {
  const items = [
    { pair: 'BTC/USDT', price: '$64,810.00', change: '+3.82%', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { pair: 'ETH/USDT', price: '$3,522.80', change: '+4.15%', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    { pair: 'SOL/USDT', price: '$154.90', change: '+5.08%', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
    { pair: 'NEXORA ALPHA-V', price: '+1.00% / DAY', change: 'ALGO ACTIVE', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    { pair: 'ALGO WIN-RATE', price: '94.2%', change: 'CONFIRMED', color: '#00e676', bg: 'rgba(0, 230, 118, 0.15)' },
    { pair: 'WEEKEND SHIELD', price: '100% RISK-FREE', change: 'PROTECTED', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
    { pair: 'USDT TRC-20', price: 'INSTANT PAYOUT', change: 'AUTOMATED', color: '#00f2fe', bg: 'rgba(0, 242, 254, 0.15)' },
    { pair: 'BINANCE PAY', price: 'ZERO FEE ID', change: 'SUPPORTED', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }
  ];

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(148, 163, 240, 0.18)',
        background: 'linear-gradient(90deg, rgba(14, 20, 50, 0.92) 0%, rgba(20, 28, 68, 0.92) 50%, rgba(14, 20, 50, 0.92) 100%)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '9px 0',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 15px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: '30px',
          animation: 'tickerScroll 38s linear infinite',
          paddingLeft: '20px'
        }}
      >
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '12px' }}>{item.pair}</span>
            <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '12px' }}>
              {item.price}
            </span>
            <span
              style={{
                color: item.color,
                fontSize: '11px',
                fontWeight: 700,
                background: item.bg,
                padding: '2px 8px',
                borderRadius: '6px',
                border: `1px solid ${item.color}33`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <TrendingUp size={11} />
              {item.change}
            </span>
            <span style={{ color: 'rgba(148, 163, 240, 0.25)' }}>•</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
