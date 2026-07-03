import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Admin from './pages/Admin';
import { LogoIcon, HomeIcon, SearchIcon, HeartIcon, AdminIcon } from './components/AnimatedIcons';

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
  } else if (page === 'search') {
    currentPage = <Home onNavigate={navigate} initialSection="search" />;
  } else if (page === 'favorites') {
    currentPage = <Home onNavigate={navigate} initialSection="favorites" />;
  } else if (page === 'watch') {
    currentPage = <Watch dramaId={parts[1]} onNavigate={navigate} />;
  } else if (page === 'admin') {
    currentPage = <Admin onNavigate={navigate} />;
  } else {
    currentPage = <Home onNavigate={navigate} />;
  }

  const isHomeActive = page === '' || page === 'home' || page === 'search' || page === 'favorites';

  return (
    <div id="app">
      {/* Navigation */}
      <nav id="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <a href="#/" className="nav-logo" aria-label="DramaStream Home">
            <LogoIcon size={30} style={{ marginRight: '6px' }} />
            <span>DramaStream</span>
          </a>

          {/* Desktop nav links */}
          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="nav-links">
            <a
              href="#/"
              className={`nav-link ${page === '' || page === 'home' ? 'active' : ''}`}
            >
              Home
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

      {/* Mobile Bottom Tab Navigation */}
      <div className="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
        <button
          onClick={() => navigate('/')}
          className={`mobile-nav-item ${page === '' || page === 'home' ? 'active' : ''}`}
          aria-label="Home"
        >
          <HomeIcon active={page === '' || page === 'home'} size={22} />
          <span className="mobile-nav-label">Home</span>
        </button>

        <button
          onClick={() => navigate('/search')}
          className={`mobile-nav-item ${page === 'search' ? 'active' : ''}`}
          aria-label="Search"
        >
          <SearchIcon active={page === 'search'} size={22} />
          <span className="mobile-nav-label">Search</span>
        </button>

        <button
          onClick={() => navigate('/favorites')}
          className={`mobile-nav-item ${page === 'favorites' ? 'active' : ''}`}
          aria-label="Favorites"
        >
          <HeartIcon active={page === 'favorites'} size={20} />
          <span className="mobile-nav-label">Favorites</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-logo">
            <LogoIcon size={24} style={{ marginRight: '6px' }} />
            DramaStream
          </div>
          <p className="footer-copy">© 2026 DramaStream. All drama content is user-managed via the admin panel.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
