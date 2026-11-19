import React, { useEffect, useState, useRef } from 'react';

/**
 * ParallaxTradingBackground
 * Rich, luminous multi-color trading atmosphere.
 * Features:
 * - Dynamic radiant color orbs (Indigo, Cyan, Emerald, Amber, Violet)
 * - Modern subtle coordinate grid & crosshair dots
 * - Elegant parallax trading charts with glowing candlesticks and moving trendlines
 * - Non-intrusive, zero text masking, 100% pointer-events: none
 */
export function ParallaxTradingBackground() {
  const [scrollY, setScrollY] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || window.pageYOffset || 0);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const offset = scrollY * 0.08;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}
    >
      {/* 1. Luminous Radial Glow Orbs with Different Rich Colors */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '25%',
          width: '750px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 70%)',
          filter: 'blur(90px)',
          transform: `translate3d(0, ${offset * 0.3}px, 0)`,
          willChange: 'transform'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '5%',
          width: '650px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.24) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%)',
          filter: 'blur(80px)',
          transform: `translate3d(0, ${-offset * 0.2}px, 0)`,
          willChange: 'transform'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '38%',
          right: '-100px',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)',
          filter: 'blur(85px)',
          transform: `translate3d(0, ${offset * 0.4}px, 0)`
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '65%',
          left: '-120px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%)',
          filter: 'blur(90px)',
          transform: `translate3d(0, ${-offset * 0.3}px, 0)`
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          right: '20%',
          width: '700px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          filter: 'blur(100px)'
        }}
      />

      {/* 2. Cyber Coordinate Matrix Grid */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.14,
          transform: `translate3d(0, ${offset * 0.4}px, 0)`
        }}
      >
        <defs>
          <pattern id="colorful-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(148, 163, 240, 0.3)" strokeWidth="0.6" />
            <circle cx="60" cy="0" r="1.5" fill="rgba(0, 242, 254, 0.6)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#colorful-grid)" />
      </svg>

      {/* 3. Parallax Trading Chart 1 (Upper Right Area) */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: '-2%',
          width: '850px',
          height: '420px',
          opacity: 0.22,
          transform: `translate3d(0, ${-offset * 1.1}px, 0)`,
          willChange: 'transform'
        }}
      >
        <svg viewBox="0 0 850 420" width="100%" height="100%" fill="none">
          <defs>
            <linearGradient id="chartGradientCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 10 320 Q 150 290 260 230 T 480 180 T 680 90 T 840 20 L 840 400 L 10 400 Z"
            fill="url(#chartGradientCyan)"
          />
          <path
            d="M 10 320 Q 150 290 260 230 T 480 180 T 680 90 T 840 20"
            stroke="#00f2fe"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Glowing Candlesticks */}
          <line x1="180" y1="240" x2="180" y2="300" stroke="#00e676" strokeWidth="2" />
          <rect x="174" y="255" width="12" height="32" rx="2" fill="#00e676" />

          <line x1="310" y1="190" x2="310" y2="260" stroke="#00e676" strokeWidth="2" />
          <rect x="304" y="205" width="12" height="38" rx="2" fill="#00e676" />

          <line x1="440" y1="160" x2="440" y2="230" stroke="#f43f5e" strokeWidth="2" />
          <rect x="434" y="175" width="12" height="28" rx="2" fill="#f43f5e" />

          <line x1="570" y1="110" x2="570" y2="180" stroke="#00e676" strokeWidth="2" />
          <rect x="564" y="125" width="12" height="35" rx="2" fill="#00e676" />

          <line x1="700" y1="50" x2="700" y2="120" stroke="#00e676" strokeWidth="2" />
          <rect x="694" y="65" width="12" height="35" rx="2" fill="#00e676" />

          <circle cx="840" cy="20" r="6" fill="#00f2fe" filter="drop-shadow(0 0 8px #00f2fe)" />
        </svg>
      </div>

      {/* 4. Parallax Trading Chart 2 (Lower Left Area) */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '-4%',
          width: '780px',
          height: '380px',
          opacity: 0.18,
          transform: `translate3d(0, ${offset * 0.9}px, 0)`,
          willChange: 'transform'
        }}
      >
        <svg viewBox="0 0 780 380" width="100%" height="100%" fill="none">
          <defs>
            <linearGradient id="chartGradientViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 10 300 Q 140 270 280 200 T 520 140 T 760 40 L 760 370 L 10 370 Z"
            fill="url(#chartGradientViolet)"
          />
          <path
            d="M 10 300 Q 140 270 280 200 T 520 140 T 760 40"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
          <circle cx="760" cy="40" r="5" fill="#a855f7" />
        </svg>
      </div>
    </div>
  );
}
