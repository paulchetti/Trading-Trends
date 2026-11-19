import React from 'react';

export function NexoraLogo({ size = 'md', showText = true, className = '' }) {
  // Dimension presets
  const dimensions = {
    sm: { iconSize: 28, textMain: '15px', textSub: '8px', gap: '8px' },
    md: { iconSize: 38, textMain: '18px', textSub: '9px', gap: '10px' },
    lg: { iconSize: 52, textMain: '24px', textSub: '11px', gap: '14px' },
    xl: { iconSize: 68, textMain: '32px', textSub: '13px', gap: '16px' }
  };

  const dim = dimensions[size] || dimensions.md;

  return (
    <div
      className={`nexora-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim.gap,
        userSelect: 'none'
      }}
    >
      {/* Precision Modern Nexora Emblem (SVG) */}
      <div
        style={{
          width: dim.iconSize,
          height: dim.iconSize,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '12px',
            background: 'radial-gradient(circle, rgba(0, 242, 254, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 80%)',
            filter: 'blur(6px)',
            opacity: 0.85,
            zIndex: 0
          }}
        />

        <svg
          width={dim.iconSize}
          height={dim.iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <defs>
            {/* Hexagon / Shield Outer Gradient */}
            <linearGradient id="emblemBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#00e676" />
            </linearGradient>

            {/* Shield Deep Background */}
            <linearGradient id="emblemBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#151d48" />
              <stop offset="50%" stopColor="#0c112e" />
              <stop offset="100%" stopColor="#060919" />
            </linearGradient>

            {/* Stylized N Monogram Gradient */}
            <linearGradient id="nexoraNGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e676" />
              <stop offset="35%" stopColor="#00f2fe" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Upward Ascending Vector Pulse */}
            <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Glass Highlight */}
            <linearGradient id="glassSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Rounded Hexagon Base Shield */}
          <polygon
            points="50,6 88,24 88,76 50,94 12,76 12,24"
            fill="url(#emblemBgGrad)"
            stroke="url(#emblemBorderGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Upper Glass Sheen Facet */}
          <polygon
            points="50,9 85,26 50,46 15,26"
            fill="url(#glassSheen)"
          />

          {/* Candlestick Depth Accents */}
          <line x1="30" y1="28" x2="30" y2="72" stroke="rgba(0, 242, 254, 0.2)" strokeWidth="2" strokeDasharray="2 3" />
          <line x1="70" y1="28" x2="70" y2="72" stroke="rgba(0, 230, 118, 0.2)" strokeWidth="2" strokeDasharray="2 3" />

          {/* Modern Geometric NEXORA Monogram 'N' with Algorithmic Upward Trajectory */}
          {/* Left Vertical Pillar */}
          <path
            d="M26 71 L26 29 L35 29 L35 71 Z"
            fill="url(#nexoraNGrad)"
          />

          {/* Dynamic Diagonal Slicing Upward */}
          <path
            d="M32 30 L66 69 L74 69 L40 30 Z"
            fill="url(#nexoraNGrad)"
          />

          {/* Right Pillar Ascending into Bullish Arrow Tip */}
          <path
            d="M65 71 L65 38 L74 38 L74 71 Z"
            fill="url(#nexoraNGrad)"
          />

          {/* Integrated Upward Breakout Arrow at Top-Right */}
          <path
            d="M60 27 L80 17 L81 37 L74 33 L67 42 L61 36 L68 28 Z"
            fill="url(#arrowGrad)"
          />

          {/* High-Tech Quantum Core Dot */}
          <circle cx="50" cy="50" r="3.5" fill="#00f2fe" filter="drop-shadow(0 0 4px #00f2fe)" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: dim.textMain,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: "'Outfit', 'Inter', sans-serif",
              color: '#ffffff',
              lineHeight: 1.15,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>NEXORA</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #38bdf8 50%, #00e676 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900
              }}
            >
              TRADING
            </span>
          </div>
          <div
            style={{
              fontSize: dim.textSub,
              letterSpacing: '0.14em',
              color: '#94a3b8',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginTop: '1px'
            }}
          >
            Institutional Algorithmic Desk
          </div>
        </div>
      )}
    </div>
  );
}
