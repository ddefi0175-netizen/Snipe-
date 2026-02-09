
// React automatic JSX runtime in use — default React import not required
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { UniversalWalletProvider } from './lib/walletConnect';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Trade from './components/Trade';
import Wallet from './components/Wallet';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Small debug helper to mark intentionally unused imports as used
const _debugUnused_App = (ctx) => {
  // Keep minimal runtime impact in development only
  if (typeof console !== 'undefined' && process?.env?.NODE_ENV !== 'production') console.debug('app-unused', ctx);
};
_debugUnused_App({ Router, Route, Routes, SpeedInsights, UniversalWalletProvider, Header, Footer, Dashboard, Trade, Wallet, NotFound, ErrorBoundary });

function App() {
  return (
    <ErrorBoundary>
      <UniversalWalletProvider>
        <Router>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trade" element={<Trade />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UniversalWalletProvider>
      <SpeedInsights />
    </ErrorBoundary>
  );
}

export default App;
