import React, { useEffect, useRef } from 'react';
import { XIcon, CheckIcon, XIcon as AlertXIcon, AlertIcon, InfoIcon } from '../AnimatedIcons';
import { Button, IconButton } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  style = {},
  footer,
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const sizes = {
    sm: '360px',
    md: '460px',
    lg: '620px',
    xl: '780px',
    full: '90vw',
  };

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements?.length) {
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 'var(--z-modal-backdrop)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn 0.2s var(--ease-out)',
      }}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`modal-box ${className}`}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          maxWidth: sizes[size],
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style jsx>{`
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.9) translateY(24px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {(title || showClose) && (
          <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            {title && (
              <h2 id="modal-title" style={{ font: 'var(--style-title-3)', color: 'var(--text-primary)', margin: 0 }}>
                {title}
              </h2>
            )}
            {showClose && (
              <IconButton
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close modal"
                style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
              >
                <XIcon size={18} />
              </IconButton>
            )}
          </div>
        )}

        {description && (
          <p id="modal-description" style={{ font: 'var(--style-body)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
            {description}
          </p>
        )}

        <div style={{ marginBottom: footer ? 'var(--space-4)' : 0 }}>
          {children}
        </div>

        {footer && (
          <div className="modal-actions" style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-primary)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant === 'danger' ? 'destructive' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </>
    }
  >
    <p style={{ font: 'var(--style-body)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
  </Modal>
);

export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  type = 'info',
  confirmText = 'OK',
}) => {
  const icons = {
    success: <CheckIcon size={24} style={{ color: 'var(--success)' }} />,
    error: <AlertXIcon size={24} style={{ color: 'var(--error)' }} />,
    warning: <AlertIcon size={24} style={{ color: 'var(--warning)' }} />,
    info: <InfoIcon size={24} style={{ color: 'var(--brand-primary)' }} />,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Button variant="primary" onClick={onClose} style={{ marginLeft: 'auto' }}>
          {confirmText}
        </Button>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div style={{ flexShrink: 0, marginTop: 'var(--space-1)' }}>{icons[type]}</div>
        <p style={{ font: 'var(--style-body)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{message}</p>
      </div>
    </Modal>
  );
};

export const Sheet = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showHandle = true,
  className = '',
  style = {},
  footer,
}) => {
  const sheetRef = useRef(null);

  const sizes = {
    sm: '320px',
    md: '480px',
    lg: '640px',
    full: '100%',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="sheet-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 'var(--z-modal-backdrop)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn 0.2s var(--ease-out)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
    >
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div
        ref={sheetRef}
        className={`sheet-box ${className}`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
          width: '100%',
          maxWidth: sizes[size],
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'sheetSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style jsx>{`
          @keyframes sheetSlideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {showHandle && (
          <div
            style={{
              width: '36px',
              height: '5px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--text-tertiary)',
              margin: 'var(--space-3) auto var(--space-4)',
              cursor: 'grab',
            }}
          />
        )}

        {title && (
          <div style={{ padding: '0 var(--space-4) var(--space-4)', borderBottom: '1px solid var(--border-primary)' }}>
            <h2 id="sheet-title" style={{ font: 'var(--style-title-3)', color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h2>
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-4) var(--space-4)' }}>
          {children}
        </div>

        {footer && (
          <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Toast = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
  action,
  className = '',
  style = {},
}) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckIcon size={20} style={{ color: 'var(--success)' }} />,
    error: <AlertXIcon size={20} style={{ color: 'var(--error)' }} />,
    warning: <AlertIcon size={20} style={{ color: 'var(--warning)' }} />,
    info: <InfoIcon size={20} style={{ color: 'var(--brand-primary)' }} />,
  };

  if (!visible) return null;

  return (
    <div
      className={`toast ${className}`}
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        right: 'var(--space-4)',
        left: 'auto',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderLeft: `4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : type === 'warning' ? 'var(--warning)' : 'var(--brand-primary)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--shadow-xl)',
        maxWidth: '400px',
        minWidth: '300px',
        animation: 'slideIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        ...style,
      }}
      role="alert"
      aria-live="polite"
    >
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(120px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{icons[type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ font: 'var(--style-callout)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{message}</p>
        {action && (
          <Button variant="tertiary" size="sm" onClick={action.onClick} style={{ marginTop: 'var(--space-2)' }}>
            {action.label}
          </Button>
        )}
      </div>
      <IconButton
        variant="ghost"
        size="iconSm"
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        aria-label="Dismiss"
        style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
      >
        <XIcon size={16} />
      </IconButton>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => (
  <div
    style={{
      position: 'fixed',
      bottom: 'var(--space-4)',
      right: 'var(--space-4)',
      left: 'auto',
      zIndex: 'var(--z-toast)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      pointerEvents: 'none',
    }}
  >
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        {...toast}
        onClose={() => onClose(toast.id)}
        style={{ pointerEvents: 'auto', ...toast.style }}
      />
    ))}
  </div>
);