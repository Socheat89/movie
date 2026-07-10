import React from 'react';

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      onClick,
      className = '',
      style = {},
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      border: 'none',
      borderRadius: 'var(--radius-lg)',
      fontFamily: 'var(--font)',
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all var(--transition-normal)',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      opacity: disabled || loading ? 0.4 : 1,
      width: fullWidth ? '100%' : 'auto',
      WebkitTapHighlightColor: 'transparent',
      ...style,
    };

    const variants = {
      primary: {
        background: 'var(--brand-primary)',
        color: 'var(--text-on-brand)',
        boxShadow: '0 4px 14px rgba(229, 9, 20, 0.25)',
        border: 'none',
      },
      primaryHover: {
        background: 'var(--brand-primary-hover)',
        transform: 'scale(0.97)',
        boxShadow: '0 6px 20px rgba(229, 9, 20, 0.35)',
      },
      secondary: {
        backgroundColor: 'rgba(229, 9, 20, 0.12)',
        color: 'var(--brand-primary)',
        border: 'none',
      },
      secondaryHover: {
        backgroundColor: 'rgba(229, 9, 20, 0.18)',
        transform: 'scale(0.97)',
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: 'var(--color-system-blue)',
      },
      tertiaryHover: {
        backgroundColor: 'rgba(10, 132, 255, 0.1)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
      },
      ghostHover: {
        backgroundColor: 'var(--ios-vibrancy-light)',
      },
      destructive: {
        backgroundColor: 'var(--error)',
        color: 'white',
      },
      destructiveHover: {
        backgroundColor: '#ff2d1f',
        transform: 'scale(0.97)',
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)',
      },
      outlineHover: {
        backgroundColor: 'var(--ios-vibrancy-light)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
      },
    };

    const sizes = {
      sm: {
        height: 'var(--btn-height-sm)',
        padding: '0 var(--space-3)',
        fontSize: '13px',
        borderRadius: 'var(--radius-md)',
        iconSize: 14,
      },
      md: {
        height: 'var(--btn-height)',
        padding: '0 var(--space-5)',
        fontSize: '15px',
        borderRadius: 'var(--radius-lg)',
        iconSize: 18,
      },
      lg: {
        height: 'var(--btn-height-lg)',
        padding: '0 var(--space-6)',
        fontSize: '17px',
        borderRadius: 'var(--radius-xl)',
        iconSize: 20,
      },
      icon: {
        width: 'var(--touch-target)',
        height: 'var(--touch-target)',
        padding: 0,
        borderRadius: 'var(--radius-md)',
        iconSize: 22,
      },
      iconSm: {
        width: 'var(--touch-target-sm)',
        height: 'var(--touch-target-sm)',
        padding: 0,
        borderRadius: 'var(--radius-md)',
        iconSize: 18,
      },
    };

    const variantStyles = variants[variant] || variants.primary;
    const hoverStyles = variants[`${variant}Hover`] || {};
    const sizeStyles = sizes[size] || sizes.md;

    const mergedStyle = {
      ...baseStyles,
      ...variantStyles,
      ...sizeStyles,
      ...(fullWidth && { width: '100%' }),
    };

    const handleMouseEnter = (e) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, hoverStyles);
      }
    };

    const handleMouseLeave = (e) => {
      if (!disabled && !loading) {
        Object.keys(hoverStyles).forEach(key => {
          e.currentTarget.style[key] = variantStyles[key] || '';
        });
      }
    };

    /* iOS-style press animation */
    const handleMouseDown = (e) => {
      if (!disabled && !loading) {
        e.currentTarget.style.transform = 'scale(0.96)';
      }
    };

    const handleMouseUp = (e) => {
      if (!disabled && !loading) {
        e.currentTarget.style.transform = '';
      }
    };

    const handleClick = (e) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const renderIcon = (icon, size) => {
      if (!icon) return null;
      if (typeof icon === 'function') return icon({ size, active: false });
      if (React.isValidElement(icon)) return React.cloneElement(icon, { size });
      return icon;
    };

    return (
      <button
        ref={ref}
        type={type}
        style={mergedStyle}
        className={className}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={(e) => { handleMouseLeave(e); handleMouseUp(e); }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        {...props}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
              width={sizeStyles.iconSize}
              height={sizeStyles.iconSize}
              viewBox="0 0 24 24"
              style={{ animation: 'spin 1s linear infinite' }}
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="31.4 31.4"
                strokeLinecap="round"
                style={{ opacity: 0.2 }}
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </span>
        ) : (
          <>
            {leftIcon && renderIcon(leftIcon, sizeStyles.iconSize)}
            {children}
            {rightIcon && renderIcon(rightIcon, sizeStyles.iconSize)}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const IconButton = React.forwardRef(
  (
    {
      children,
      variant = 'ghost',
      size = 'icon',
      'aria-label': ariaLabel,
      className = '',
      style = {},
      ...props
    },
    ref
  ) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={className}
      style={style}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

export const ButtonGroup = ({ children, className = '', style = {}, vertical = false }) => (
  <div
    className={className}
    style={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      gap: 'var(--space-2)',
      ...style,
    }}
    role="group"
  >
    {children}
  </div>
);

export const FloatingActionButton = ({
  children,
  onClick,
  className = '',
  style = {},
  expanded = false,
  actions = [],
  'aria-label': ariaLabel = 'Actions',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else {
      onClick?.();
    }
  };

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {isOpen && expanded && actions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + var(--space-3))',
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            zIndex: 100,
            animation: 'fabExpand 0.25s var(--ease-spring)',
          }}
        >
          {actions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick?.();
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--ios-material-thick)',
                backdropFilter: 'blur(var(--ios-blur-regular))',
                WebkitBackdropFilter: 'blur(var(--ios-blur-regular))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontWeight: 500,
                fontFamily: 'var(--font)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-lg)',
                whiteSpace: 'nowrap',
                animation: `fabItemIn 0.2s var(--ease-spring) ${index * 0.05}s both`,
              }}
            >
              {action.icon && React.cloneElement(action.icon, { size: 20 })}
              {action.label}
            </button>
          ))}
        </div>
      )}
      <Button
        variant="primary"
        size="icon"
        onClick={toggleMenu}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup={expanded && actions.length > 0}
        style={{
          boxShadow: 'var(--shadow-lg)',
          backgroundColor: 'var(--brand-primary)',
          borderRadius: '50%',
          width: '52px',
          height: '52px',
        }}
      >
        {children}
      </Button>
    </div>
  );
};
