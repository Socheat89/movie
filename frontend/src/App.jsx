import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Admin from './pages/Admin';
import { NavBar, TabBar, Modal, Button } from './components/ui';
import { LogoIcon, HomeIcon, SearchIcon, HeartIcon } from './components/AnimatedIcons';

function App() {
  const [hash, setHash] = useState(window.location.hash || '#/');

  // Install app states
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPlatform, setInstallPlatform] = useState('ios'); // 'ios' or 'android'
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = '#' + path;
  };

  const handleShowInstall = () => {
    setInstallPlatform('ios');
    setCurrentStep(0);
    setShowInstallModal(true);
  };

  useEffect(() => {
    const isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!isPwaInstalled) {
      const alreadyShowed = sessionStorage.getItem('pwa_install_prompt_showed');
      if (!alreadyShowed) {
        const timer = setTimeout(() => {
          handleShowInstall();
          sessionStorage.setItem('pwa_install_prompt_showed', 'true');
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Basic Router Parsing
  const hashClean = hash.replace(/^#/, '') || '/';
  const parts = hashClean.split('/').filter(Boolean);
  const page = parts[0] || '';

  let currentPage = null;
  if (page === '' || page === 'home') {
    currentPage = <Home onNavigate={navigate} onShowInstall={handleShowInstall} />;
  } else if (page === 'search') {
    currentPage = <Home onNavigate={navigate} initialSection="search" onShowInstall={handleShowInstall} />;
  } else if (page === 'favorites') {
    currentPage = <Home onNavigate={navigate} initialSection="favorites" onShowInstall={handleShowInstall} />;
  } else if (page === 'watch') {
    currentPage = <Watch dramaId={parts[1]} onNavigate={navigate} />;
  } else if (page === 'admin') {
    currentPage = <Admin onNavigate={navigate} />;
  } else {
    currentPage = <Home onNavigate={navigate} onShowInstall={handleShowInstall} />;
  }

  const iosSteps = [
    {
      title: "បើកក្នុងកម្មវិធី Safari",
      desc: "បើកគេហទំព័រនេះនៅលើទូរស័ព្ទ iPhone របស់អ្នក ដោយប្រើកម្មវិធី Safari។",
    },
    {
      title: "ចុចលើប៊ូតុង Share",
      desc: "ចុចលើប៊ូតុង Share (ចែករំលែក) ដែលស្ថិតនៅរបារខាងក្រោមនៃទូរស័ព្ទ។",
    },
    {
      title: "ជ្រើសរើស 'Add to Home Screen'",
      desc: "អូសចុះក្រោមបន្តិច រួចចុចយកពាក្យថា 'Add to Home Screen' (ឬ 'បន្ថែមទៅអេក្រង់ដើម')។",
    },
    {
      title: "ចុចពាក្យ 'Add' ដើម្បីបញ្ចប់",
      desc: "ចុចលើពាក្យ 'Add' (ឬ 'បន្ថែម') នៅផ្នែកខាងស្តាំខាងលើជាការស្រេច។",
    }
  ];

  const androidSteps = [
    {
      title: "បើកក្នុង Google Chrome",
      desc: "បើកគេហទំព័រនេះនៅលើទូរស័ព្ទ Android របស់អ្នក ដោយប្រើកម្មវិធី Google Chrome។",
    },
    {
      title: "ចុចលើចំណុចបី (Menu)",
      desc: "ចុចលើប៊ូតុងម៉ឺនុយ (ចំណុចបី) នៅផ្នែកខាងស្តាំខាងលើបង្អស់។",
    },
    {
      title: "ជ្រើសរើស 'Install App'",
      desc: "ចុចយកពាក្យថា 'Install App' (ឬ 'ដំឡើងកម្មវិធី' / 'បន្ថែមទៅអេក្រង់ដើម')។",
    },
    {
      title: "ចុច 'Install' ដើម្បីដំឡើង",
      desc: "ប្រអប់បញ្ជាក់នឹងបង្ហាញឡើង រួចចុចពាក្យ 'Install' (ឬ 'ដំឡើង') ជាការស្រេច។",
    }
  ];

  const steps = installPlatform === 'ios' ? iosSteps : androidSteps;

  const tabItems = [
    { value: '', label: 'Home', icon: HomeIcon },
    { value: 'search', label: 'Search', icon: SearchIcon },
    { value: 'favorites', label: 'Favorites', icon: HeartIcon },
  ];

  return (
    <div id="app">
      {/* Navigation Bar */}
      <NavBar
        title="Mekong Movie"
        logo={<LogoIcon size={28} />}
        actions={[]}
        currentHash={hash}
      />

      {/* Main Content (router target) */}
      <main id="main-content" role="main" aria-live="polite">
        {currentPage}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <TabBar
        items={tabItems}
        activeItem={page}
        onChange={navigate}
      />

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-logo">
            <LogoIcon size={22} style={{ marginRight: '4px' }} />
            Mekong Movie
          </div>
          <p className="footer-copy">© 2026 Mekong Movie. All drama content is user-managed via the admin panel.</p>
        </div>
      </footer>

      {/* Root Installation Slideshow Modal (Khmer) */}
      <Modal
        isOpen={showInstallModal}
        onClose={() => { setShowInstallModal(false); setCurrentStep(0); }}
        title="របៀបដំឡើងកម្មវិធីលើទូរស័ព្ទ"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center', padding: 'var(--space-2) 0' }}>
          
          {/* OS Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--color-system-gray5)',
            borderRadius: 'var(--radius-lg)',
            padding: '3px',
            margin: '0 auto',
            width: 'fit-content',
          }}>
            <button
              onClick={() => { setInstallPlatform('ios'); setCurrentStep(0); }}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: installPlatform === 'ios' ? 'var(--color-system-gray3)' : 'transparent',
                color: installPlatform === 'ios' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                border: 'none',
              }}
            >
              iPhone (iOS)
            </button>
            <button
              onClick={() => { setInstallPlatform('android'); setCurrentStep(0); }}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: installPlatform === 'android' ? 'var(--color-system-gray3)' : 'transparent',
                color: installPlatform === 'android' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                border: 'none',
              }}
            >
              Android
            </button>
          </div>

          {/* Slideshow Step View */}
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6) var(--space-4)',
            border: '0.5px solid rgba(255, 255, 255, 0.05)',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }} key={`${installPlatform}-${currentStep}`}>
            <span style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              backgroundColor: 'rgba(229, 9, 20, 0.12)',
              color: 'var(--brand-primary)',
              fontSize: '17px',
              fontWeight: 700,
            }}>
              {currentStep + 1}
            </span>
            <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-brand-primary)', margin: 0 }}>
              {steps[currentStep].title}
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '280px' }}>
              {steps[currentStep].desc}
            </p>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '4px 0' }}>
            {steps.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === currentStep ? '16px' : '6px',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: i === currentStep ? 'var(--color-brand-primary)' : 'var(--color-system-gray3)',
                  transition: 'all 0.3s var(--ease-ios)',
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: 'var(--space-2)' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => prev - 1)}
              style={{ flex: 1 }}
            >
              ថយក្រោយ
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(prev => prev + 1)}
                style={{ flex: 1 }}
              >
                បន្ទាប់
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setShowInstallModal(false); setCurrentStep(0); }}
                style={{ flex: 1, backgroundColor: 'var(--color-system-green)', color: '#fff' }}
              >
                រួចរាល់
              </Button>
            )}
          </div>

        </div>
      </Modal>
    </div>
  );
}

export default App;
