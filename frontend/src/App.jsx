import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Admin from './pages/Admin';

function App() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      setMobileMenuOpen(false); // Close mobile nav on navigate
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = '#' + path;
  };

  // Basic Router Parsing
  const hashClean = hash.replace(/^#/, '') || '/';
  const parts = hashClean.split('/').filter(Boolean);
  const page = parts[0] || '';

  let currentPage = null;
  if (page === '' || page === 'home') {
    currentPage = <Home onNavigate={navigate} />;
  } else if (page === 'watch') {
    currentPage = <Watch dramaId={parts[1]} onNavigate={navigate} />;
  } else if (page === 'admin') {
    currentPage = <Admin onNavigate={navigate} />;
  } else {
    currentPage = <Home onNavigate={navigate} />;
  }

  const isHomeActive = page === '' || page === 'home';
  const isAdminActive = page === 'admin';

  return (
    <div id="app">
      {/* Navigation */}
      <nav id="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="#/" className="nav-logo" aria-label="DramaStream Home">
            <div className="logo-icon" aria-hidden="true">▶</div>
            <span>DramaStream</span>
          </a>

          {/* Desktop nav links */}
          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="nav-links">
            <a
              href="#/"
              className={`nav-link ${isHomeActive ? 'active' : ''}`}
            >
              Home
            </a>
            <a
              href="#/admin"
              className={`nav-link ${isAdminActive ? 'active' : ''}`}
            >
              Admin Dashboard
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-menu-btn"
            id="menuToggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="nav-links"
            style={{ display: 'none' }} /* Hidden by default CSS, shows on mobile media queries */
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Main Content (router target) */}
      <main id="main-content" role="main" aria-live="polite">
        {currentPage}
      </main>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="logo-icon" style={{ width: '26px', height: '26px', borderRadius: '7px', fontSize: '0.75rem' }} aria-hidden="true">
              ▶
            </div>
            DramaStream
          </div>
          <p className="footer-copy">© 2026 DramaStream. All drama content is user-managed via the admin panel.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
