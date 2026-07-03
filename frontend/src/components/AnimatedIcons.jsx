import React from 'react';

/**
 * Animated Logo Icon - Play triangle with a pulsing outer ring
 */
export function LogoIcon({ size = 28, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-logo"
      {...props}
    >
      <circle className="logo-ring-outer" cx="16" cy="16" r="14" stroke="url(#logoGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle className="logo-ring-pulse" cx="16" cy="16" r="11" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
      <path className="logo-triangle" d="M12.5 9.5V22.5L22.5 16L12.5 9.5Z" fill="url(#logoGrad)" />
      <defs>
        <linearGradient id="logoGrad" x1="12.5" y1="9.5" x2="22.5" y2="22.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-lt)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Animated Home Icon - House outline that draws and fills
 */
export function HomeIcon({ active, size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`anim-icon icon-home ${active ? 'active' : ''}`}
      {...props}
    >
      <path
        className="home-roof"
        d="M3 10L12 3L21 10"
        stroke={active ? 'var(--accent-lt)' : 'var(--text-2)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="home-walls"
        d="M5 10V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10"
        stroke={active ? 'var(--accent-lt)' : 'var(--text-2)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="home-door"
        d="M9 21V13H15V21"
        stroke={active ? 'var(--accent-lt)' : 'var(--text-2)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'var(--accent-glow)' : 'transparent'}
      />
    </svg>
  );
}

/**
 * Animated Search Icon - Magnifying glass that rotates and lens pulses
 */
export function SearchIcon({ active, size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`anim-icon icon-search ${active ? 'active' : ''}`}
      {...props}
    >
      <circle
        className="search-glass"
        cx="11"
        cy="11"
        r="6"
        stroke={active ? 'var(--accent-lt)' : 'var(--text-2)'}
        strokeWidth="2.2"
      />
      <path
        className="search-handle"
        d="M20 20L16 16"
        stroke={active ? 'var(--accent-lt)' : 'var(--text-2)'}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Animated Heart Icon - Beating heart with particle burst
 */
export function HeartIcon({ active, size = 24, ...props }) {
  return (
    <div className={`heart-icon-wrapper ${active ? 'active' : ''}`} style={{ width: size, height: size, display: 'inline-block', position: 'relative' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`anim-icon icon-heart ${active ? 'active' : ''}`}
        {...props}
      >
        <path
          d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
          fill={active ? 'url(#heartGrad)' : 'none'}
          stroke={active ? 'none' : 'currentColor'}
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="heartGrad" x1="2" y1="3" x2="22" y2="21.35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff4b8b" />
            <stop offset="100%" stopColor="#ff2b2b" />
          </linearGradient>
        </defs>
      </svg>
      {active && (
        <span className="heart-particles">
          <span className="p p1"></span>
          <span className="p p2"></span>
          <span className="p p3"></span>
          <span className="p p4"></span>
        </span>
      )}
    </div>
  );
}

/**
 * Animated Admin/Settings Gear Icon - smooth rotation with drag
 */
export function AdminIcon({ active, size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`anim-icon icon-admin ${active ? 'active' : ''}`}
      {...props}
    >
      <circle cx="12" cy="12" r="3" stroke={active ? 'var(--accent-lt)' : 'var(--text-2)'} strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={active ? 'var(--accent-lt)' : 'var(--text-2)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Animated Play Icon - Triangle inside a circular boundary that triggers ripple animation
 */
export function PlayIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-play"
      {...props}
    >
      <circle className="play-pulse-ring" cx="24" cy="24" r="22" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.6" />
      <circle className="play-circle-bg" cx="24" cy="24" r="20" fill="var(--accent)" />
      <path className="play-triangle-mesh" d="M19 15.5V32.5L32.5 24L19 15.5Z" fill="white" />
    </svg>
  );
}

/**
 * Animated Star Rating Icon - Scales and spins
 */
export function StarIcon({ active, hover, size = 22, ...props }) {
  const isFilled = active || hover;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? 'url(#starGold)' : 'none'}
      stroke={isFilled ? 'none' : 'var(--text-3)'}
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
      className={`anim-icon icon-star ${isFilled ? 'filled' : ''} ${hover ? 'hovered' : ''}`}
      {...props}
    >
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
      <defs>
        <linearGradient id="starGold" x1="2" y1="2" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd84b" />
          <stop offset="100%" stopColor="var(--yellow)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Animated Share Link Icon - morphs to checkmark on copy success
 */
export function ShareIcon({ copied, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`anim-icon icon-share ${copied ? 'copied' : ''}`}
      {...props}
    >
      {!copied ? (
        <g className="share-link-group">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : (
        <path
          className="share-checkmark"
          d="M20 6L9 17L4 12"
          stroke="var(--green)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/**
 * Animated Back Arrow Icon - moves left and bounces
 */
export function BackIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-back"
      {...props}
    >
      <path
        d="M19 12H5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19L5 12L12 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Animated Close Icon - spins and shrinks
 */
export function CloseIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-close"
      {...props}
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Toast Check Icon - draws a nice checkmark
 */
export function CheckIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-toast-check"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="var(--green)" strokeWidth="2" />
      <path
        className="checkmark-path"
        d="M8 12L11 15L16 9"
        stroke="var(--green)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Toast Info Icon - draws an info sign
 */
export function InfoIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-toast-info"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
      <line x1="12" y1="16" x2="12" y2="12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="var(--accent)" />
    </svg>
  );
}

/**
 * Toast Error Icon - draws warning triangle
 */
export function ErrorIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-toast-error"
      {...props}
    >
      <path
        d="M12 2L2 22H22L12 2Z"
        stroke="var(--red)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="12" y1="9" x2="12" y2="15" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1" fill="var(--red)" />
    </svg>
  );
}

/**
 * Animated Edit Icon - Pencil tip that shifts/tilts
 */
export function EditIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-edit"
      {...props}
    >
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Animated Trash Icon - Trash can lid that lifts on hover/active
 */
export function TrashIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-trash"
      {...props}
    >
      <path
        className="trash-lid"
        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="trash-header"
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Animated Plus/Add Icon - Spins on hover/active
 */
export function PlusIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-plus"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Animated Tag/Category Icon - Swings slightly
 */
export function TagIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-tag"
      {...props}
    >
      <path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

