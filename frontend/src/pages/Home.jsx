import React, { useState, useEffect, useRef } from 'react';
import { API } from '../api';
import { updateSeo } from '../seo';
import {
  Button,
  MovieCard,
  Card,
  CardHeader,
  CardContent,
  NavBar,
  TabBar,
  SearchBar,
  FilterChips,
  SectionHeader,
  Skeleton,
  Badge,
  Modal,
} from '../components/ui';
import { PlayIcon, HeartIcon, SearchIcon, CloseIcon, HomeIcon, BookmarkIcon, UserIcon, StarFillIcon } from '../components/AnimatedIcons';

export default function Home({ onNavigate, initialSection, onShowInstall }) {
  const [dramas, setDramas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const searchInputRef = useRef(null);

  // Favorites Local State
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const showOnlyFavorites = initialSection === 'favorites';
  const showOnlySearch = initialSection === 'search';

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedGenre, searchQuery]);

  useEffect(() => {
    if (showOnlySearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showOnlySearch]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dramasRes, categoriesRes] = await Promise.all([
          API.getDramas(),
          API.getCategories()
        ]);
        setDramas(dramasRes);
        setCategories(categoriesRes);
        setError(false);
      } catch (err) {
        console.error('[Home] Failed to load data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    updateSeo({
      title: 'Khmer Movie | មើលភាពយន្តខ្មែរ ដោយឥតគិតថ្លៃ | Mekong Movie',
      description: 'មើលភាពយន្តខ្មែរ រឿងកូរ៉េ រឿងចិន ដោយឥតគិតថ្លៃ — Khmer Movie, Korean Drama, Chinese Drama, Thai Series. Watch free online, no login required.',
      keywords: 'khmer movie, ភាពយន្តខ្មែរ, movie, រឿងខ្មែរ, korean drama, k-drama, រឿងកូរ៉េ, chinese movie, thai movie, watch movie free, drama online, streaming free, Mekong Movie',
      url: 'https://movie.mekongcyberunit.app/',
      schema: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Mekong Movie — Khmer Movie",
        "alternateName": ["ភាពយន្តខ្មែរ", "Khmer Movie", "Movie Online Free"],
        "url": "https://movie.mekongcyberunit.app/",
        "description": "មើលភាពយន្តខ្មែរ រឿងកូរ៉េ រឿងចិន ដោយឥតគិតថ្លៃ",
        "inLanguage": ["km", "en"],
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://movie.mekongcyberunit.app/#/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    });
  }, []);

  const trending = dramas.filter(d => d.trending);

  // Filter dramas based on selected genre and search query
  const filteredDramas = dramas.filter(d => {
    const matchesGenre = selectedGenre === 'All' || d.genre === selectedGenre;
    const matchesSearch = !searchQuery.trim() ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.genre && d.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.year && d.year.toString().includes(searchQuery));
    return matchesGenre && matchesSearch;
  });

  // Toggle favorite helper
  const toggleFavorite = (dramaId, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(dramaId);
      const updated = isFav ? prev.filter(id => id !== dramaId) : [...prev, dramaId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-scroll slider
  useEffect(() => {
    if (!trending.length || loading) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.min(trending.length, 6));
    }, 5200);
    return () => clearInterval(interval);
  }, [trending.length, loading]);

  // View formatting helper
  const formatViews = (count) => {
    if (!count) return '0 views';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M views';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K views';
    return count + ' views';
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="hero-section" style={{ minHeight: '70vh' }}>
          <Skeleton variant="hero" />
        </div>
        <div className="content-section">
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-5)' }}>
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} variant="text" width="70px" style={{ height: '28px', borderRadius: 'var(--radius-full)' }} />
            ))}
          </div>
          <div className="dramas-grid">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <Skeleton variant="poster" />
                <div style={{ padding: '10px' }}>
                  <Skeleton variant="text" count={1} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 'var(--space-8)' }}>
        <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: 'var(--space-4)' }}>⚠️</div>
        <h2 style={{ font: 'var(--style-title-2)', marginBottom: 'var(--space-2)', letterSpacing: 'var(--tracking-tight)' }}>Cannot connect to server</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: 'var(--space-6)' }}>
          Make sure the backend is running.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // --- FAVORITES TAB ---
  if (showOnlyFavorites) {
    const favDramas = dramas.filter(d => favorites.includes(d.id));
    return (
      <div className="page-enter">
        <section className="content-section" style={{ paddingTop: 'var(--space-5)' }}>
          <h2 style={{ font: 'var(--style-title-1)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-1)' }}>
            Favorites
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '15px', marginBottom: 'var(--space-6)' }}>
            {favorites.length} saved
          </p>

          {favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)' }}>
              <HeartIcon active={true} size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.4 }} />
              <h3 style={{ font: 'var(--style-title-3)', marginBottom: 'var(--space-2)', letterSpacing: 'var(--tracking-tight)' }}>Your list is empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '300px', margin: '0 auto var(--space-6)', lineHeight: 1.55 }}>
                Save movies by tapping the heart icon on any poster.
              </p>
              <Button onClick={() => onNavigate('/')} size="lg">Discover Movies</Button>
            </div>
          ) : (
            <div className="dramas-grid">
              {favDramas.map((d) => (
                <MovieCard
                  key={d.id}
                  movie={d}
                  variant="poster"
                  onClick={() => onNavigate(`/watch/${d.id}`)}
                  onFavorite={toggleFavorite}
                  isFavorite={true}
                  showOverlay={true}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // --- SEARCH TAB ---
  if (showOnlySearch) {
    return (
      <div className="page-enter">
        <section className="content-section" style={{ paddingTop: 'var(--space-5)' }}>
          <h2 style={{ font: 'var(--style-title-1)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-4)' }}>
            Search
          </h2>
          <SearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(typeof e === 'string' ? e : e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Movies, genres, years..."
            autoFocus
            showCancel
            onCancel={() => onNavigate('/')}
            style={{ marginBottom: 'var(--space-5)' }}
          />

          {/* Genre Filters */}
          <FilterChips
            options={['All', ...categories].map(cat => ({ label: cat, value: cat }))}
            selected={selectedGenre}
            onChange={setSelectedGenre}
          />

          {/* Search Results */}
          <div className="dramas-grid">
            {filteredDramas.length === 0 ? (
              <div className="no-results" style={{ gridColumn: '1/-1', padding: 'var(--space-16) var(--space-6)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)', opacity: 0.2 }}>🔍</div>
                <h3 style={{ font: 'var(--style-title-3)', marginBottom: 'var(--space-2)', letterSpacing: 'var(--tracking-tight)' }}>No matches found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Try different keywords or another category.</p>
              </div>
            ) : (
              filteredDramas.slice(0, visibleCount).map((d) => (
                <MovieCard
                  key={d.id}
                  movie={d}
                  variant="poster"
                  onClick={() => onNavigate(`/watch/${d.id}`)}
                  onFavorite={toggleFavorite}
                  isFavorite={favorites.includes(d.id)}
                  showOverlay={true}
                />
              ))
            )}
          </div>

          {visibleCount < filteredDramas.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-8)' }}>
              <Button
                variant="outline"
                onClick={() => setVisibleCount(prev => prev + 12)}
                size="md"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                Load More
              </Button>
            </div>
          )}
        </section>
      </div>
    );
  }

  // --- MAIN HOME LAYOUT ---
  const sliderItems = trending.slice(0, 6);
  const isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  return (
    <div className="page-enter">
      {/* Hero Section / Slider */}
      <section className="hero-section">
        {sliderItems.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            No trending movies yet.
          </div>
        ) : (
          <>
            {sliderItems.map((d, i) => (
              <div
                key={d.id}
                className={`hero-slide ${i === currentSlide ? 'active' : ''}`}
                style={{ pointerEvents: i === currentSlide ? 'auto' : 'none' }}
              >
                <div className="hero-bg" style={{ backgroundImage: `url('${d.poster}')` }}></div>
                <div className="hero-gradient"></div>
                <div className="hero-content">
                  <span className="hero-badge">🔥 Trending</span>
                  <h1 className="hero-title">{d.title}</h1>
                  <p className="hero-desc">{(d.description || 'No description available.').replace(/\{\w+\}[^\s]*/g, '').trim() || 'No description available.'}</p>
                  <div className="hero-actions">
                    <Button
                      variant="primary"
                      leftIcon={<PlayIcon size={18} />}
                      onClick={() => onNavigate(`/watch/${d.id}`)}
                      size="lg"
                      style={{ borderRadius: 'var(--radius-xl)' }}
                    >
                      Watch Now
                    </Button>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        backgroundColor: 'rgba(229, 9, 20, 0.15)', 
                        color: 'var(--brand-primary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>{d.genre}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{d.year || '2025'}</span>
                      <span style={{ color: 'var(--rating-gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <StarFillIcon size={11} /> {d.rating || '8.0'}
                      </span>
                      <span style={{ color: 'var(--text-quaternary)' }}>{formatViews(d.views || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {sliderItems.length > 1 && (
              <>
                <button
                  className="hero-arrow prev"
                  onClick={() => setCurrentSlide(prev => (prev - 1 + sliderItems.length) % sliderItems.length)}
                  aria-label="Previous slide"
                >
                  ‹
                </button>
                <button
                  className="hero-arrow next"
                  onClick={() => setCurrentSlide(prev => (prev + 1) % sliderItems.length)}
                  aria-label="Next slide"
                >
                  ›
                </button>
                <div className="hero-dots">
                  {sliderItems.map((_, i) => (
                    <button
                      key={i}
                      className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                    ></button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Install App Banner */}
      {!isPwaInstalled && (
        <div style={{
          maxWidth: '1400px',
          margin: 'var(--space-4) auto 0',
          padding: '0 var(--space-5)',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4) var(--space-5)',
            border: '0.5px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '1.8rem' }}>📱</span>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  ដំឡើងកម្មវិធីទូរស័ព្ទ Mekong Movie
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                  មើលខ្សែភាពយន្តខ្មែរបានកាន់តែលឿន និងងាយស្រួល គ្មានការទាញយកពី App Store ឡើយ។
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onShowInstall}
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              ដំឡើងឥឡូវនេះ
            </Button>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <section className="content-section" style={{ borderBottom: '0.5px solid var(--border-primary)', paddingBottom: 'var(--space-8)', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <h2 style={{ font: 'var(--style-title-2)', letterSpacing: 'var(--tracking-tight)', margin: 0 }}>
                My Favorites
              </h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '2px' }}>{favorites.length} saved</p>
            </div>
            <span style={{ color: 'var(--color-system-blue)', fontSize: '15px', cursor: 'pointer' }}>
              See All
            </span>
          </div>

          <div className="dramas-grid">
            {dramas.filter(d => favorites.includes(d.id)).map((d) => (
              <MovieCard
                key={d.id}
                movie={d}
                variant="poster"
                onClick={() => onNavigate(`/watch/${d.id}`)}
                onFavorite={toggleFavorite}
                isFavorite={true}
                showOverlay={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Movies Section */}
      <section className="content-section">
        {/* Header + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <h2 style={{ font: 'var(--style-title-2)', letterSpacing: 'var(--tracking-tight)', margin: 0 }}>
            All Movies
          </h2>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--color-system-gray5)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '0 var(--space-3)', 
            width: '100%', 
            maxWidth: '340px',
            height: '36px',
          }}>
            <SearchIcon active={false} size={15} style={{ color: 'var(--color-system-gray)', marginRight: '6px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search title, genre, or year..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '15px',
                width: '100%',
                margin: 0,
                padding: 0,
                fontFamily: 'var(--font)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '18px', height: '18px', borderRadius: '50%',
                  backgroundColor: 'var(--color-system-gray3)', color: 'var(--color-system-gray6)',
                  border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0,
                }}
              >
                <CloseIcon size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Genre Filters */}
        <FilterChips
          options={['All', ...categories].map(cat => ({ label: cat, value: cat }))}
          selected={selectedGenre}
          onChange={setSelectedGenre}
        />

        {/* Dramas Grid */}
        <div className="dramas-grid">
          {filteredDramas.length === 0 ? (
            <div className="no-results" style={{ gridColumn: '1/-1', padding: 'var(--space-16) var(--space-6)' }}>
              <div style={{ fontSize: '2.5rem', textAlign: 'center', opacity: 0.2 }}>🎬</div>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '15px', marginTop: 'var(--space-3)' }}>No movies found.</p>
            </div>
          ) : (
            filteredDramas.slice(0, visibleCount).map((d) => (
              <MovieCard
                key={d.id}
                movie={d}
                variant="poster"
                onClick={() => onNavigate(`/watch/${d.id}`)}
                onFavorite={toggleFavorite}
                isFavorite={favorites.includes(d.id)}
                showOverlay={true}
              />
            ))
          )}
        </div>

        {visibleCount < filteredDramas.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-10)' }}>
            <Button
              variant="outline"
              onClick={() => setVisibleCount(prev => prev + 12)}
              size="md"
              style={{ borderRadius: 'var(--radius-full)', padding: '0 var(--space-8)' }}
            >
              Load More
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}