import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { KycModal } from './components/KycModal';
import { LoginModal } from './components/LoginModal';
import { LandingPage } from './pages/LandingPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SupportChat } from './components/SupportChat';
import { ParallaxTradingBackground } from './components/ParallaxTradingBackground';
import { MarketTicker } from './components/MarketTicker';

function MainApp() {
  const { user, activeView, impersonatedUser } = useAuth();
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        localStorage.setItem('nexora_ref', ref.trim().toUpperCase());
      }
    } catch (_) {}
  }, []);

  // Show floating support chat widget for all user and guest views
  const showSupportChat = !(activeView === 'ADMIN_DASHBOARD' && user?.role === 'ADMIN' && !impersonatedUser);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ParallaxTradingBackground />
      <Navbar
        onOpenKyc={() => setKycModalOpen(true)}
        onOpenLogin={() => setLoginModalOpen(true)}
      />
      <MarketTicker />

      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {impersonatedUser ? (
          <UserDashboard />
        ) : activeView === 'ADMIN_DASHBOARD' && user?.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : activeView === 'USER_DASHBOARD' && user ? (
          <UserDashboard />
        ) : (
          <LandingPage
            onOpenKyc={() => setKycModalOpen(true)}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        )}
      </main>

      {showSupportChat && <SupportChat />}

      <KycModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenKyc={() => setKycModalOpen(true)}
      />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Platform Render Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0a0e27',
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            background: 'rgba(26, 35, 75, 0.85)',
            border: '1px solid rgba(148, 163, 240, 0.3)',
            borderRadius: '20px',
            padding: '36px 28px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginBottom: '12px' }}>
              Nexora Trading Platform
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '20px', lineHeight: 1.5 }}>
              A temporary display error was detected and caught. Click below to reload the workspace.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('nexora_ref');
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #0ea5e9 100%)',
                color: '#030814',
                fontWeight: 700,
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
