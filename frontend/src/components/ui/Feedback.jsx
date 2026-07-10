import React from 'react';
import { XIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, LoaderIcon } from '../AnimatedIcons';

export const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  className = '',
  style = {},
}) => {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    xxl: 72,
  };

  const sizePx = sizes[size];
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'var(--brand-primary)',
    'var(--color-system-blue)',
    'var(--color-system-green)',
    'var(--color-system-purple)',
    'var(--color-system-orange)',
    'var(--color-system-pink)',
    'var(--color-system-teal)',
    'var(--color-system-indigo)',
  ];

  const colorIndex = name
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  const bgColor = colors[colorIndex];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: sizePx,
        height: sizePx,
        borderRadius: shape === 'circle' ? '50%' : 'var(--radius-lg)',
        overflow: 'hidden',
        backgroundColor: bgColor,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ color: 'white', fontWeight: 600, fontSize: sizePx * 0.35, fontFamily: 'var(--font)' }}>
          {initials || '?'}
        </span>
      )}
      {status && (
        <span
          style={{
            position: 'absolute',
            width: sizePx * 0.25,
            height: sizePx * 0.25,
            borderRadius: '50%',
            border: `2px solid var(--bg-primary)`,
            backgroundColor:
              status === 'online'
                ? 'var(--success)'
                : status === 'busy'
                ? 'var(--error)'
                : status === 'away'
                ? 'var(--warning)'
                : 'var(--text-tertiary)',
            [statusPosition.includes('bottom') ? 'bottom' : 'top']: -2,
            [statusPosition.includes('right') ? 'right' : 'left']: -2,
          }}
        />
      )}
    </div>
  );
};

export const AvatarGroup = ({
  avatars = [],
  max = 5,
  size = 'md',
  className = '',
  style = {},
  onClick,
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        ...style,
      }}
      role="group"
      aria-label={`${avatars.length} people`}
    >
      {visible.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          {...avatar}
          size={size}
          style={{
            ...avatar.style,
            marginLeft: index === 0 ? 0 : -12,
            border: '2px solid var(--bg-primary)',
            boxShadow: index > 0 ? 'var(--shadow-sm)' : 'none',
          }}
        />
      ))}
      {remaining > 0 && (
        <div
          style={{
            width: sizes[size],
            height: sizes[size],
            borderRadius: '50%',
            marginLeft: -12,
            backgroundColor: 'var(--bg-tertiary)',
            border: '2px solid var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: sizes[size] * 0.35,
            fontFamily: 'var(--font)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onClick={onClick}
          role="button"
          tabIndex={onClick ? 0 : undefined}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

const sizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  xxl: 72,
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  dotColor,
  className = '',
  style = {},
}) => {
  const variants = {
    default: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' },
    primary: { bg: 'var(--brand-secondary)', color: 'var(--brand-primary)', border: 'none' },
    success: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.3)' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.3)' },
    info: { bg: 'rgba(14, 165, 233, 0.15)', color: 'var(--info)', border: '1px solid rgba(14, 165, 233, 0.3)' },
  };

  const sizes = {
    xs: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--style-caption-2)', borderRadius: 'var(--radius-sm)', dotSize: 6 },
    sm: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--style-caption-1)', borderRadius: 'var(--radius-md)', dotSize: 7 },
    md: { padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--style-footnote)', borderRadius: 'var(--radius-md)', dotSize: 8 },
    lg: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--style-callout)', borderRadius: 'var(--radius-lg)', dotSize: 10 },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dot ? 'var(--space-1)' : 0,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font)',
        borderRadius: s.borderRadius,
        backgroundColor: v.bg,
        color: v.color,
        border: v.border,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: s.dotSize,
            height: s.dotSize,
            borderRadius: '50%',
            backgroundColor: dotColor || v.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};

export const Divider = ({
  orientation = 'horizontal',
  label,
  className = '',
  style = {},
}) => (
  <div
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      color: 'var(--text-tertiary)',
      fontSize: 'var(--style-caption-1)',
      fontWeight: 500,
      ...style,
    }}
    role="separator"
  >
    <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-primary)' }} />
    {label && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-primary)' }} />
  </div>
);

export const Spinner = ({
  size = 'md',
  color = 'var(--brand-primary)',
  className = '',
  style = {},
}) => {
  const sizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  };

  const sizePx = sizes[size];

  return (
    <svg
      className={className}
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 1s linear infinite', ...style }}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        style={{ opacity: 0.3, color }}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ color }}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
};

export const Skeleton = ({
  variant = 'text',
  width = '100%',
  height,
  className = '',
  style = {},
  count = 1,
  gap = 'var(--space-3)',
}) => {
  const variants = {
    text: { height: '1rem', borderRadius: 'var(--radius-sm)' },
    circular: { height: '40px', width: '40px', borderRadius: '50%' },
    rectangular: { height: '120px', borderRadius: 'var(--radius-lg)' },
    poster: { height: '270px', width: '180px', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' },
    card: { height: '180px', borderRadius: 'var(--radius-lg)' },
  };

  const v = variants[variant] || variants.text;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        ...style,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            ...v,
            width: variant === 'circular' ? v.width : width,
            height: height || v.height,
            background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-card) 50%, var(--bg-tertiary) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.6s infinite linear',
            borderRadius: v.borderRadius,
          }}
        >
          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
};

export const Tooltip = ({
  content,
  children,
  position = 'top',
  offset = 8,
  delay = 200,
  className = '',
  style = {},
}) => {
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = React.useRef(null);
  const childRef = React.useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const child = React.Children.only(children);

  return (
    <div
      className={className}
      style={{ display: 'inline-block', position: 'relative', ...style }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {React.cloneElement(child, { ref: childRef })}
      {visible && (
        <div
          style={{
            position: 'absolute',
            zIndex: 'var(--z-tooltip)',
            bottom: position === 'top' ? `calc(100% + ${offset}px)` : undefined,
            top: position === 'bottom' ? `calc(100% + ${offset}px)` : undefined,
            left: position === 'right' ? `calc(100% + ${offset}px)` : undefined,
            right: position === 'left' ? `calc(100% + ${offset}px)` : undefined,
            transform: position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
            padding: 'var(--space-1) var(--space-2)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            fontSize: 'var(--style-caption-1)',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none',
            fontFamily: 'var(--font)',
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export const Popover = ({
  trigger,
  content,
  position = 'bottom',
  offset = 8,
  closeOnClickOutside = true,
  className = '',
  style = {},
}) => {
  const [open, setOpen] = React.useState(false);
  const popoverRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (closeOnClickOutside && popoverRef.current && !popoverRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickOutside]);

  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: offset },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: offset },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: offset },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: offset },
  };

  return (
    <div className={className} style={{ display: 'inline-block', position: 'relative', ...style }}>
      <span ref={triggerRef} onClick={() => setOpen(!open)}>{trigger}</span>
      {open && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            zIndex: 'var(--z-popover)',
            minWidth: '200px',
            maxWidth: '320px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-2)',
            animation: 'popoverIn 0.2s var(--ease-out)',
            ...positions[position],
          }}
          role="dialog"
          aria-modal="true"
        >
          <style jsx>{`
            @keyframes popoverIn {
              from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
          {content}
        </div>
      )}
    </div>
  );
};

export const DropdownMenu = ({
  trigger,
  items,
  position = 'bottom',
  offset = 8,
  className = '',
  style = {},
}) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    const focusableItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
    if (!focusableItems?.length) return;

    const currentIndex = Array.from(focusableItems).findIndex((item) => item === document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % focusableItems.length;
      focusableItems[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + focusableItems.length) % focusableItems.length;
      focusableItems[prevIndex].focus();
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.activeElement?.click();
    }
  };

  if (!items.length) return <span ref={triggerRef}>{trigger}</span>;

  return (
    <div className={className} style={{ display: 'inline-block', position: 'relative', ...style }}>
      <span
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
        style={{ cursor: 'pointer' }}
      >
        {trigger}
      </span>
      {open && (
        <div
          ref={menuRef}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            zIndex: 'var(--z-dropdown)',
            minWidth: '180px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-1)',
            marginTop: offset,
            animation: 'menuIn 0.15s var(--ease-out)',
          }}
          role="menu"
          tabIndex={-1}
        >
          <style jsx>{`
            @keyframes menuIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {items.map((item, index) => (
            <button
              key={item.value || index}
              role="menuitem"
              tabIndex={-1}
              onClick={() => { item.onClick?.(); setOpen(false); }}
              disabled={item.disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'transparent',
                color: item.disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
                fontSize: 'var(--style-callout)',
                fontFamily: 'var(--font)',
                fontWeight: item.danger ? 500 : 400,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => { if (!item.disabled) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {item.icon && React.cloneElement(item.icon, { size: 18 })}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--style-caption-1)' }}>{item.shortcut}</span>}
            </button>
          ))}
          {items.some((i) => i.divider) && items.map((item, index) =>
            item.divider ? <div key={index} style={{ height: 1, backgroundColor: 'var(--border-primary)', margin: 'var(--space-1) 0' }} /> : null
          )}
        </div>
      )}
    </div>
  );
};

export const Separator = ({
  orientation = 'horizontal',
  decorative = true,
  className = '',
  style = {},
}) => (
  <hr
    className={className}
    style={{
      border: 'none',
      borderTop: orientation === 'horizontal' ? '1px solid var(--border-primary)' : 'none',
      borderLeft: orientation === 'vertical' ? '1px solid var(--border-primary)' : 'none',
      width: orientation === 'horizontal' ? '100%' : 'auto',
      height: orientation === 'vertical' ? '100%' : 'auto',
      margin: 0,
      opacity: decorative ? 1 : 0,
      ...style,
    }}
    aria-orientation={orientation}
    role={decorative ? 'none' : 'separator'}
  />
);