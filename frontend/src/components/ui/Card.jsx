import React from 'react';
import { HeartIcon, StarIcon, ClockIcon, CheckIcon } from '../AnimatedIcons';
import { Button } from './Button';

export const Card = React.forwardRef(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      pressable = false,
      onClick,
      className = '',
      style = {},
      as: Component = 'article',
      ...props
    },
    ref
  ) => {
    const variants = {
      default: {
        backgroundColor: 'var(--bg-card)',
        border: '0.5px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
      },
      elevated: {
        backgroundColor: 'var(--bg-card)',
        border: '0.5px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
      },
      flat: {
        backgroundColor: 'var(--bg-secondary)',
        border: 'none',
        borderRadius: 'var(--radius-xl)',
      },
      outlined: {
        backgroundColor: 'transparent',
        border: '0.5px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
      },
      hero: {
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        overflow: 'hidden',
      },
    };

    const paddings = {
      none: '0',
      sm: 'var(--space-3)',
      md: 'var(--space-4)',
      lg: 'var(--space-5)',
      xl: 'var(--space-8)',
    };

    const baseStyle = {
      ...variants[variant],
      padding: paddings[padding],
      transition: 'transform 0.25s var(--ease-ios-spring), box-shadow var(--transition-normal)',
      cursor: hoverable || pressable ? 'pointer' : 'default',
      overflow: 'hidden',
      ...style,
    };

    /* iOS press effect: subtle scale down */
    const handleMouseDown = (e) => {
      if (pressable) {
        e.currentTarget.style.transform = 'scale(0.97)';
      }
    };

    const handleMouseUp = (e) => {
      if (pressable) {
        e.currentTarget.style.transform = '';
      }
    };

    const handleMouseEnter = (e) => {
      if (hoverable && !pressable) {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }
    };

    const handleMouseLeave = (e) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = variants[variant].boxShadow || '';
    };

    return (
      <Component
        ref={ref}
        className={className}
        style={baseStyle}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        tabIndex={pressable || onClick ? 0 : undefined}
        role={pressable || onClick ? 'button' : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ title, subtitle, action, className = '', style = {} }) => (
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
      {title && <h3 style={{ font: 'var(--style-title-3)', color: 'var(--text-primary)', margin: 0, letterSpacing: 'var(--tracking-tight)' }}>{title}</h3>}
      {subtitle && <p style={{ font: 'var(--style-footnote)', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>{subtitle}</p>}
    </div>
    {action && (
      <span style={{ font: 'var(--style-footnote-emphasized)', color: 'var(--color-system-blue)', cursor: 'pointer' }}>
        {action}
      </span>
    )}
  </div>
);

export const CardContent = ({ children, className = '', style = {} }) => (
  <div className={className} style={{ ...style }}>{children}</div>
);

export const CardFooter = ({ children, className = '', style = {} }) => (
  <div
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-4)',
      paddingTop: 'var(--space-4)',
      borderTop: '0.5px solid var(--border-primary)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const MovieCard = ({
  movie,
  variant: _variant = 'poster',
  onClick,
  onFavorite,
  onWatchlist: _onWatchlist,
  isFavorite = false,
  isInWatchlist: _isInWatchlist = false,
  showOverlay = true,
  className = '',
  style = {},
  index: _index,
  showRating = true,
  showMeta = true,
  showFavorite = true,
  showWatchlist: _showWatchlist = false,
}) => {
  const {
    id,
    title,
    poster,
    year,
    genre,
    rating,
    trending,
  } = movie;

  const posterUrl = poster || `https://picsum.photos/seed/${id}/300/450`;

  const handleFavorite = (e) => {
    e.stopPropagation();
    onFavorite?.(id);
  };

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-card)',
        border: '0.5px solid rgba(255, 255, 255, 0.04)',
        transition: 'transform 0.25s var(--ease-ios-spring), box-shadow var(--transition-normal)',
        display: 'flex',
        flexDirection: 'column',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = '';
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = '';
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {/* Poster Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-tertiary)',
          flexShrink: 0,
        }}
      >
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s var(--ease-ios)',
          }}
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${id}/300/450`; }}
        />

        {/* Trending Badge */}
        {trending && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '3px 8px',
              backgroundColor: 'rgba(255, 159, 10, 0.9)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 600,
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(8px)',
              zIndex: 2,
            }}
          >
            Trending
          </span>
        )}

        {/* Rating Badge */}
        {showRating && rating && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '3px 7px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--rating-gold)',
              fontSize: '11px',
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            <StarIcon active={true} size={10} />
            {rating}
          </div>
        )}

        {/* Favorite Button */}
        {showFavorite && (
          <button
            onClick={handleFavorite}
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              zIndex: 3,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s var(--ease-spring)',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon active={isFavorite} size={16} />
          </button>
        )}

        {/* Play Overlay */}
        {showOverlay && onClick && (
          <div
            className="movie-card-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: 'var(--space-3)',
              opacity: 0,
              transition: 'opacity var(--transition-normal)',
              pointerEvents: 'none',
            }}
          >
            <Button
              variant="primary"
              size="sm"
              style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
            >
              Watch
            </Button>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div
        style={{
          padding: '10px 10px 12px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </h3>

        {showMeta && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '4px',
              marginTop: 'auto',
              paddingTop: '6px',
              color: 'var(--text-tertiary)',
              fontSize: '11px',
            }}
          >
            {year && <span>{year}</span>}
            {year && genre && <span style={{ opacity: 0.4 }}>·</span>}
            {genre && <span>{genre}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export const CastCard = ({
  cast,
  onClick,
  className = '',
  style = {},
}) => {
  const { id, name, character, profilePath } = cast;
  const imageUrl = profilePath || `https://picsum.photos/seed/${id}/200/300`;

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        width: '80px',
        flexShrink: 0,
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        margin: '0 auto',
        backgroundColor: 'var(--bg-tertiary)',
      }}>
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${id}/200/300`; }}
        />
      </div>
      <div style={{ padding: '6px 0 0' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </p>
        {character && (
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {character}
          </p>
        )}
      </div>
    </div>
  );
};

export const ReviewCard = ({
  review,
  onExpand,
  className = '',
  style = {},
}) => {
  const { author, avatar, rating, date, content, isExpanded = false } = review;

  return (
    <Card variant="flat" className={className} style={{ ...style, padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {avatar ? (
            <img src={avatar} alt={author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--brand-primary)' }}>
              {author?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{author}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{date}</span>
          </div>
          {rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} active={star <= rating} size={11} style={{ color: star <= rating ? 'var(--rating-gold)' : 'var(--color-system-gray3)' }} />
              ))}
            </div>
          )}
        </div>
      </div>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: 0,
          overflow: isExpanded ? 'visible' : 'hidden',
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : 4,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {content}
      </p>
      {!isExpanded && content.length > 300 && (
        <button
          onClick={onExpand}
          style={{
            marginTop: '6px',
            padding: 0,
            background: 'none',
            border: 'none',
            color: 'var(--color-system-blue)',
            fontSize: '13px',
            fontWeight: 400,
            cursor: 'pointer',
          }}
        >
          Read more
        </button>
      )}
    </Card>
  );
};

export const EpisodeCard = ({
  episode,
  isActive = false,
  onClick,
  className = '',
  style = {},
}) => {
  const { number, title, duration, thumbnail, watched } = episode;

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
        backgroundColor: isActive ? 'rgba(229, 9, 20, 0.06)' : 'transparent',
        transition: 'all var(--transition-normal)',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 0,
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--color-system-gray4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: isActive ? 'var(--text-on-brand)' : 'var(--text-tertiary)',
          flexShrink: 0,
          fontWeight: 700,
        }}
      >
        {number}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </p>
        {duration && (
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
            <ClockIcon size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            {duration}
          </p>
        )}
        {watched && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontSize: '11px', fontWeight: 600, color: 'var(--brand-primary)' }}>
            <CheckIcon size={10} />
            Watched
          </span>
        )}
      </div>
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          style={{ width: '72px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
        />
      )}
    </div>
  );
};

export const GenreCard = ({
  genre,
  selected = false,
  onClick,
  className = '',
  style = {},
}) => (
  <div
    className={className}
    onClick={onClick}
    style={{
      ...style,
      padding: '6px 16px',
      borderRadius: 'var(--radius-full)',
      backgroundColor: selected ? 'rgba(229, 9, 20, 0.12)' : 'var(--color-system-gray5)',
      border: selected ? '1px solid rgba(229, 9, 20, 0.3)' : '1px solid transparent',
      color: selected ? 'var(--brand-primary)' : 'var(--text-secondary)',
      fontSize: '13px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all var(--transition-normal)',
    }}
  >
    {genre}
  </div>
);

export const StatCard = ({
  label,
  value,
  trend,
  icon,
  className = '',
  style = {},
}) => (
  <Card variant="default" className={className} style={style}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
          {label}
        </p>
        <p style={{ font: 'var(--style-title-2)', color: 'var(--text-primary)', margin: '4px 0 0 0', fontWeight: 700 }}>
          {value}
        </p>
        {trend && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px', fontSize: '12px', color: trend > 0 ? 'var(--success)' : 'var(--error)' }}>
            {trend > 0 ? '↑' : '↓'}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {icon && (
        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(229, 9, 20, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {React.cloneElement(icon, { size: 22, color: 'var(--brand-primary)' })}
        </div>
      )}
    </div>
  </Card>
);

export const InfoCard = ({
  title,
  value,
  subtitle,
  icon,
  action,
  className = '',
  style = {},
}) => (
  <Card variant="default" className={className} style={style}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
      {icon && (
        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(229, 9, 20, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {React.cloneElement(icon, { size: 20, color: 'var(--brand-primary)' })}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
          {title}
        </p>
        <p style={{ font: 'var(--style-title-3)', color: 'var(--text-primary)', margin: '4px 0 0 0', fontWeight: 600 }}>
          {value}
        </p>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            flexShrink: 0,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  </Card>
);
