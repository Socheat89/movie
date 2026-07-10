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

/**
 * Chevron Left Icon - for navigation
 */
export function ChevronLeftIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-chevron-left"
      {...props}
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Chevron Right Icon - for navigation
 */
export function ChevronRightIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-chevron-right"
      {...props}
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Star Fill Icon - solid star for ratings
 */
export function StarFillIcon({ size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-star-fill"
      {...props}
    >
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
    </svg>
  );
}

/**
 * Calendar Icon
 */
export function CalendarIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-calendar"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Clock Icon
 */
export function ClockIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-clock"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Alert Icon (warning triangle)
 */
export function AlertIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-alert"
      {...props}
    >
      <path
        d="M12 2L2 22H22L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="12" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Alert X Icon (for errors)
 */
export function AlertXIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-alert-x"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Bookmark Empty Icon
 */
export function BookmarkIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-bookmark"
      {...props}
    >
      <path
        d="M19 21L12 16L5 21V5C5 3.89 5.89 3 7 3H17C18.11 3 19 3.89 19 5V21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Bookmark Filled Icon
 */
export function BookmarkFillIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-bookmark-fill"
      {...props}
    >
      <path d="M19 21L12 16L5 21V5C5 3.89 5.89 3 7 3H17C18.11 3 19 3.89 19 5V21Z" />
    </svg>
  );
}

/**
 * Ellipsis Icon (more options)
 */
export function EllipsisIcon({ size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-ellipsis"
      {...props}
    >
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Download Icon
 */
export function DownloadIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-download"
      {...props}
    >
      <path d="M21 15V19C21 19.53 20.53 20 20 20H4C3.47 20 3 19.53 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * User/Profile Icon
 */
export function UserIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-user"
      {...props}
    >
      <path
        d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Menu/Hamburger Icon
 */
export function MenuIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-menu"
      {...props}
    >
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Bell/Notification Icon
 */
export function BellIcon({ size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-bell"
      {...props}
    >
      <path
        d="M18 8A6 6 0 0 0 6 8C6 6.9 6.9 6 8 6A6 6 0 0 1 18 6C19.1 6 20 6.9 20 8A6 6 0 0 0 18 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.73 21A2 2 0 0 1 12 21.5 2 2 0 0 1 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Minus Icon
 */
export function MinusIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-minus"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * X/Close Icon (alias for CloseIcon)
 */
export const XIcon = CloseIcon;

/**
 * Chevron Down Icon
 */
export function ChevronDownIcon({ size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-chevron-down"
      {...props}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Loader/Spinner Icon
 */
export function LoaderIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="anim-icon icon-loader"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        style={{ opacity: 0.3 }}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
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
    </svg>
  );
}

