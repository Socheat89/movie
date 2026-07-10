import React from 'react';
import { HomeIcon, SearchIcon, HeartIcon, UserIcon, BellIcon, MenuIcon, CloseIcon, LogoIcon, ChevronLeftIcon, ChevronRightIcon } from '../AnimatedIcons';
import { IconButton } from './Button';

export const NavBar = ({
  title = 'Mekong Movie',
  showBack = false,
  onBack,
  actions = [],
  largeTitle = false,
  transparent = false,
  className = '',
  style = {},
  currentHash = '',
}) => {
  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 'calc(var(--nav-height) + var(--safe-area-top))',
    zIndex: 'var(--z-fixed)',
    backgroundColor: transparent ? 'transparent' : 'var(--ios-material-thick)',
    backdropFilter: `blur(var(--ios-blur-thick))`,
    WebkitBackdropFilter: `blur(var(--ios-blur-thick))`,
    borderBottom: transparent ? 'none' : '0.5px solid rgba(255, 255, 255, 0.08)',
    transition: 'all var(--transition-normal)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    ...style,
  };

  const innerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 var(--space-4)',
    height: 'var(--nav-height)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    width: '100%',
  };

  return (
    <header style={navStyle} className={className} role="banner">
      <div style={innerStyle}>
        {showBack ? (
          <IconButton
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
            style={{ marginRight: 'var(--space-1)' }}
          >
            <ChevronLeftIcon size={22} />
          </IconButton>
        ) : (
          <button
            onClick={() => window.location.hash = '#/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '1.125rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              background: 'none',
              border: 'none',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label={`${title} Home`}
          >
            <LogoIcon size={28} style={{ marginRight: '2px' }} />
            <span>{title}</span>
          </button>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {actions.map((action, index) => (
            <IconButton
              key={index}
              variant="ghost"
              size="icon"
              onClick={action.onClick}
              aria-label={action.label}
              disabled={action.disabled}
              style={{ opacity: action.disabled ? 0.5 : 1 }}
            >
              {action.icon}
            </IconButton>
          ))}
        </div>
      </div>
    </header>
  );
};

export const TabBar = ({
  items,
  activeItem,
  onChange,
  className = '',
  style = {},
  variant = 'standard',
}) => {
  const tabBarStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'calc(var(--tab-bar-height) + var(--safe-area-bottom))',
    zIndex: 'var(--z-fixed)',
    backgroundColor: 'var(--ios-material-thick)',
    backdropFilter: 'blur(var(--ios-blur-thick))',
    WebkitBackdropFilter: 'blur(var(--ios-blur-thick))',
    borderTop: '0.5px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: '8px',
    paddingBottom: 'calc(var(--safe-area-bottom) + 4px)',
    ...style,
  };

  const handleClick = (item, e) => {
    e.preventDefault();
    onChange(item.value);
  };

  const renderItem = (item) => {
    const isActive = activeItem === item.value;
    const Icon = item.icon;

    return (
      <button
        key={item.value}
        role="tab"
        aria-selected={isActive}
        aria-label={item.label}
        onClick={(e) => handleClick(item, e)}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '3px',
          background: 'transparent',
          border: 'none',
          color: isActive ? 'var(--brand-primary)' : 'var(--color-system-gray)',
          fontSize: '10px',
          fontWeight: isActive ? 600 : 500,
          fontFamily: 'var(--font)',
          cursor: 'pointer',
          transition: 'color var(--transition-fast)',
          padding: '2px 0',
          minWidth: 0,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Icon active={isActive} size={24} style={{ transition: 'all var(--transition-fast)' }} />
        <span style={{ 
          fontSize: '10px',
          letterSpacing: '0.01em',
          lineHeight: 1,
        }}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      style={tabBarStyle}
      className={className}
      role="tablist"
      aria-label="Main navigation"
    >
      {items.map(renderItem)}
    </nav>
  );
};

export const SearchBar = ({
  value,
  onChange,
  onClear,
  onFocus,
  onBlur,
  placeholder = 'Search movies, shows...',
  autoFocus = false,
  showCancel = false,
  onCancel,
  className = '',
  style = {},
}) => {
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        ...style,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          backgroundColor: 'var(--color-system-gray5)',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          padding: '0 var(--space-3)',
          height: '36px',
          transition: 'all var(--transition-normal)',
        }}
      >
        <SearchIcon
          size={16}
          active={focused}
          style={{
            color: 'var(--color-system-gray)',
            flexShrink: 0,
            transition: 'color var(--transition-fast)',
          }}
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '15px',
            fontFamily: 'var(--font)',
            width: '100%',
            padding: 0,
            margin: 0,
          }}
          aria-label={placeholder}
        />
        {value && (
          <button
            onClick={onClear}
            aria-label="Clear search"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-system-gray3)',
              color: 'var(--color-system-gray6)',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              padding: 0,
            }}
          >
            <CloseIcon size={10} />
          </button>
        )}
      </div>
      {showCancel && (
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-system-blue)',
            fontSize: '15px',
            fontWeight: 400,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            padding: '0 var(--space-1)',
            whiteSpace: 'nowrap',
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export const SegmentedControl = ({
  options,
  value,
  onChange,
  className = '',
  style = {},
  disabled = false,
}) => (
  <div
    className={className}
    style={{
      display: 'inline-flex',
      backgroundColor: 'var(--color-system-gray5)',
      borderRadius: 'var(--radius-md)',
      padding: '2px',
      ...style,
    }}
    role="radiogroup"
    aria-disabled={disabled}
  >
    {options.map((option) => (
      <button
        key={option.value}
        role="radio"
        aria-selected={value === option.value}
        aria-disabled={disabled}
        onClick={() => !disabled && onChange(option.value)}
        style={{
          padding: '6px var(--space-4)',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: value === option.value ? 'var(--color-system-gray3)' : 'transparent',
          color: value === option.value ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'var(--font)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-normal)',
          minWidth: '70px',
          opacity: disabled ? 0.5 : 1,
          boxShadow: value === option.value ? 'var(--shadow-sm)' : 'none',
        }}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const FilterChips = ({
  options,
  selected,
  onChange,
  className = '',
  style = {},
  multiple = false,
  scrollable = true,
}) => (
  <div
    className={className}
    style={{
      display: 'flex',
      gap: 'var(--space-2)',
      flexWrap: scrollable ? 'nowrap' : 'wrap',
      overflowX: scrollable ? 'auto' : 'visible',
      paddingBottom: scrollable ? '2px' : 0,
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      marginBottom: 'var(--space-5)',
      ...style,
    }}
    role="group"
    aria-label="Filters"
  >
    {options.map((option) => {
      const isSelected = multiple ? selected.includes(option.value) : selected === option.value;
      return (
        <button
          key={option.value}
          role={multiple ? 'checkbox' : 'radio'}
          aria-selected={isSelected}
          aria-checked={isSelected}
          onClick={() => onChange(option.value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'var(--font)',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all var(--transition-normal)',
            backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--color-system-gray5)',
            color: isSelected ? 'var(--text-on-brand)' : 'var(--text-secondary)',
            boxShadow: isSelected ? '0 2px 8px rgba(229, 9, 20, 0.25)' : 'none',
            flexShrink: 0,
          }}
        >
          {option.icon && React.cloneElement(option.icon, { size: 13 })}
          {option.label}
        </button>
      );
    })}
  </div>
);

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  style = {},
  showFirstLast = true,
  siblingCount = 1,
}) => {
  const pages = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 3;
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const pages = [];

    if (showFirstLast) pages.push(1);
    if (shouldShowLeftDots) pages.push('...');

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pages.push(i);
    }

    if (shouldShowRightDots) pages.push('...');
    if (showFirstLast) pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages, siblingCount, showFirstLast]);

  return (
    <nav
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1)',
        ...style,
      }}
      aria-label="Pagination"
    >
      <IconButton
        variant="ghost"
        size="iconSm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon size={18} />
      </IconButton>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} style={{ padding: 'var(--space-2)', color: 'var(--text-tertiary)' }}>…</span>
        ) : (
          <button
            key={page}
            role="button"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(page)}
            style={{
              minWidth: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: page === currentPage ? 'var(--brand-primary)' : 'transparent',
              color: page === currentPage ? 'var(--text-on-brand)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: page === currentPage ? 600 : 400,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {page}
          </button>
        )
      )}

      <IconButton
        variant="ghost"
        size="iconSm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon size={18} />
      </IconButton>
    </nav>
  );
};

export const Breadcrumbs = ({
  items,
  separator = '/',
  className = '',
  style = {},
  maxItems = 5,
}) => {
  const displayItems = React.useMemo(() => {
    if (items.length <= maxItems) return items;
    return [
      items[0],
      { label: '...', disabled: true },
      ...items.slice(-(maxItems - 2)),
    ];
  }, [items, maxItems]);

  return (
    <nav
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        fontSize: 'var(--style-footnote)',
        color: 'var(--text-tertiary)',
        ...style,
      }}
      aria-label="Breadcrumb"
    >
      {displayItems.map((item, index) => (
        <span key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {index > 0 && (
            <span style={{ color: 'var(--text-tertiary)' }}>{separator}</span>
          )}
          {item.disabled ? (
            <span style={{ color: 'var(--text-tertiary)' }}>{item.label}</span>
          ) : item.href ? (
            <a
              href={item.href}
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
              }}
            >
              {item.label}
            </a>
          ) : (
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export const SectionHeader = ({
  title,
  subtitle,
  action,
  className = '',
  style = {},
}) => (
  <div
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-4)',
      gap: 'var(--space-3)',
      ...style,
    }}
  >
    <div>
      {title && <h3 style={{ font: 'var(--style-title-3)', color: 'var(--text-primary)', margin: 0 }}>{title}</h3>}
      {subtitle && <p style={{ font: 'var(--style-footnote)', color: 'var(--text-tertiary)', margin: 'var(--space-1) 0 0 0' }}>{subtitle}</p>}
    </div>
    {action && (
      <span style={{ font: 'var(--style-footnote-emphasized)', color: 'var(--brand-primary)', cursor: 'pointer' }}>
        {action}
      </span>
    )}
  </div>
);