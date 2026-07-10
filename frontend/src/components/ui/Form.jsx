import React, { forwardRef, useId } from 'react';
import { XIcon, ChevronDownIcon, SearchIcon, CloseIcon, AlertXIcon } from '../AnimatedIcons';

export const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      disabled = false,
      readOnly = false,
      required = false,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onClear,
      fullWidth = true,
      size = 'md',
      className = '',
      style = {},
      id,
      name,
      autoComplete,
      inputMode,
      pattern,
      maxLength,
      min,
      max,
      step,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const sizes = {
      sm: { height: '32px', padding: '0 var(--space-3)', fontSize: 'var(--style-footnote)', iconSize: 16 },
      md: { height: 'var(--input-height)', padding: '0 var(--space-3)', fontSize: 'var(--style-body)', iconSize: 18 },
      lg: { height: '48px', padding: '0 var(--space-4)', fontSize: 'var(--style-callout)', iconSize: 20 },
    };

    const s = sizes[size];

    return (
      <div className={className} style={{ width: fullWidth ? '100%' : 'auto', ...style }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              font: 'var(--style-caption-1)',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-2)',
              letterSpacing: '0.01em',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--error)', marginLeft: 'var(--space-1)' }}>*</span>}
          </label>
        )}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            height: s.height,
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast)',
          }}
          onClick={() => !disabled && !readOnly && ref.current?.focus()}
        >
          {leftIcon && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: s.height, color: 'var(--text-tertiary)', marginLeft: 'var(--space-1)' }}>
              {React.cloneElement(leftIcon, { size: s.iconSize })}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: s.fontSize,
              fontFamily: 'var(--font)',
              height: '100%',
              padding: `0 ${leftIcon ? 0 : 'var(--space-3)'} 0 ${rightIcon || onClear ? 0 : 'var(--space-3)'}`,
              width: '100%',
              minWidth: 0,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            {...props}
          />
          {(rightIcon || onClear || (value && !disabled && !readOnly)) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginRight: 'var(--space-2)' }}>
              {rightIcon && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                  {React.cloneElement(rightIcon, { size: s.iconSize })}
                </div>
              )}
              {value && !disabled && !readOnly && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClear?.(); onChange?.({ target: { value: '' } }); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: s.iconSize,
                    height: s.iconSize,
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  aria-label="Clear input"
                >
                  <XIcon size={s.iconSize - 2} />
                </button>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} style={{ font: 'var(--style-caption-1)', color: 'var(--error)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <AlertXIcon size={12} />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} style={{ font: 'var(--style-caption-1)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      disabled = false,
      readOnly = false,
      required = false,
      error,
      helperText,
      rows = 4,
      maxLength,
      fullWidth = true,
      className = '',
      style = {},
      id,
      name,
      autoComplete,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText && !error ? `${textareaId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={className} style={{ width: fullWidth ? '100%' : 'auto', ...style }}>
        {label && (
          <label
            htmlFor={textareaId}
            style={{
              display: 'block',
              font: 'var(--style-caption-1)',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-2)',
              letterSpacing: '0.01em',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--error)', marginLeft: 'var(--space-1)' }}>*</span>}
          </label>
        )}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'var(--bg-tertiary)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast)',
          }}
        >
          <textarea
            ref={ref}
            id={textareaId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            rows={rows}
            maxLength={maxLength}
            autoComplete={autoComplete}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            style={{
              width: '100%',
              minHeight: `${rows * 1.5}rem`,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              font: 'var(--style-body)',
              fontFamily: 'var(--font)',
              padding: 'var(--space-3)',
              resize: 'vertical',
              lineHeight: 1.6,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            {...props}
          />
          {maxLength && (
            <div style={{ position: 'absolute', bottom: 'var(--space-2)', right: 'var(--space-2)', font: 'var(--style-caption-2)', color: 'var(--text-tertiary)' }}>
              {value?.length || 0} / {maxLength}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} style={{ font: 'var(--style-caption-1)', color: 'var(--error)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <AlertXIcon size={12} />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} style={{ font: 'var(--style-caption-1)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export const Select = forwardRef(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      disabled = false,
      required = false,
      error,
      helperText,
      options = [],
      fullWidth = true,
      size = 'md',
      className = '',
      style = {},
      id,
      name,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText && !error ? `${selectId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const sizes = {
      sm: { height: '32px', padding: '0 var(--space-3)', fontSize: 'var(--style-footnote)', iconSize: 16 },
      md: { height: 'var(--input-height)', padding: '0 var(--space-3)', fontSize: 'var(--style-body)', iconSize: 18 },
      lg: { height: '48px', padding: '0 var(--space-4)', fontSize: 'var(--style-callout)', iconSize: 20 },
    };

    const s = sizes[size];

    return (
      <div className={className} style={{ width: fullWidth ? '100%' : 'auto', ...style }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              display: 'block',
              font: 'var(--style-caption-1)',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              marginBottom: 'var(--space-2)',
              letterSpacing: '0.01em',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--error)', marginLeft: 'var(--space-1)' }}>*</span>}
          </label>
        )}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            height: s.height,
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast)',
          }}
        >
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            style={{
              flex: 1,
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontSize: s.fontSize,
              fontFamily: 'var(--font)',
              height: '100%',
              padding: `0 ${s.iconSize * 2}px 0 var(--space-3)`,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div
            style={{
              position: 'absolute',
              right: 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }}
          >
            <ChevronDownIcon size={s.iconSize} />
          </div>
        </div>
        {error && (
          <p id={errorId} style={{ font: 'var(--style-caption-1)', color: 'var(--error)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <AlertXIcon size={12} />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} style={{ font: 'var(--style-caption-1)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const Checkbox = forwardRef(
  (
    {
      label,
      description,
      checked,
      onChange,
      disabled = false,
      required = false,
      error,
      indeterminate = false,
      size = 'md',
      className = '',
      style = {},
      id,
      name,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const describedBy = [error ? `${checkboxId}-error` : null, description ? `${checkboxId}-desc` : null].filter(Boolean).join(' ') || undefined;

    const sizes = {
      sm: { box: '16px', icon: '12px' },
      md: { box: '18px', icon: '14px' },
      lg: { box: '20px', icon: '16px' },
    };

    const s = sizes[size];

    return (
      <label
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: 'var(--space-2)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          ...style,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-checked={indeterminate ? 'mixed' : checked}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...props}
          />
          <div
            style={{
              width: s.box,
              height: s.box,
              borderRadius: 'var(--radius-sm)',
              border: checked || indeterminate ? 'none' : '2px solid var(--border-primary)',
              backgroundColor: checked || indeterminate ? 'var(--brand-primary)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
          >
            {(checked || indeterminate) && (
              <svg
                width={s.icon}
                height={s.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-on-brand)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {indeterminate ? (
                  <line x1="5" y1="12" x2="19" y2="12" />
                ) : (
                  <polyline points="20 6 9 17 4 12" />
                )}
              </svg>
            )}
          </div>
        </div>
        <div style={{ marginTop: '2px' }}>
          {label && (
            <span
              style={{
                display: 'block',
                font: 'var(--style-body)',
                color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span style={{ display: 'block', font: 'var(--style-caption-1)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
              {description}
            </span>
          )}
        </div>
        {error && (
          <p id={`${checkboxId}-error`} style={{ font: 'var(--style-caption-1)', color: 'var(--error)', marginTop: 'var(--space-1)' }}>
            {error}
          </p>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export const Radio = forwardRef(
  (
    {
      label,
      description,
      value,
      checked,
      onChange,
      disabled = false,
      required = false,
      error,
      size = 'md',
      className = '',
      style = {},
      id,
      name,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const radioId = id || generatedId;
    const describedBy = [error ? `${radioId}-error` : null, description ? `${radioId}-desc` : null].filter(Boolean).join(' ') || undefined;

    const sizes = {
      sm: { box: '16px', inner: '8px' },
      md: { box: '18px', inner: '9px' },
      lg: { box: '20px', inner: '10px' },
    };

    const s = sizes[size];

    return (
      <label
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: 'var(--space-2)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          ...style,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <input
            ref={ref}
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...props}
          />
          <div
            style={{
              width: s.box,
              height: s.box,
              borderRadius: '50%',
              border: checked ? 'none' : '2px solid var(--border-primary)',
              backgroundColor: checked ? 'var(--brand-primary)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
          >
            {checked && (
              <div
                style={{
                  width: s.inner,
                  height: s.inner,
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-on-brand)',
                }}
              />
            )}
          </div>
        </div>
        <div style={{ marginTop: '2px' }}>
          {label && (
            <span
              style={{
                display: 'block',
                font: 'var(--style-body)',
                color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span style={{ display: 'block', font: 'var(--style-caption-1)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
              {description}
            </span>
          )}
        </div>
        {error && (
          <p id={`${radioId}-error`} style={{ font: 'var(--style-caption-1)', color: 'var(--error)', marginTop: 'var(--space-1)' }}>
            {error}
          </p>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

export const RadioGroup = ({ name, value, onChange, options, disabled = false, className = '', style = {}, layout = 'vertical', ...props }) => (
  <fieldset
    className={className}
    style={{
      display: 'flex',
      flexDirection: layout === 'horizontal' ? 'row' : 'column',
      gap: layout === 'horizontal' ? 'var(--space-4)' : 'var(--space-2)',
      border: 'none',
      padding: 0,
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {options.map((option) => (
      <Radio
        key={option.value}
        name={name}
        value={option.value}
        checked={value === option.value}
        onChange={onChange}
        label={option.label}
        description={option.description}
        disabled={disabled || option.disabled}
      />
    ))}
  </fieldset>
);

export const Switch = forwardRef(
  (
    {
      label,
      description,
      checked,
      onChange,
      disabled = false,
      size = 'md',
      className = '',
      style = {},
      id,
      name,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const switchId = id || generatedId;

    const sizes = {
      sm: { track: '36px', thumb: '20px', translate: '16px' },
      md: { track: '44px', thumb: '24px', translate: '20px' },
      lg: { track: '52px', thumb: '28px', translate: '24px' },
    };

    const s = sizes[size];

    return (
      <label
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          ...style,
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            role="switch"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-checked={checked}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...props}
          />
          <div
            style={{
              width: s.track,
              height: 'calc(var(--space-4))',
              borderRadius: 'var(--radius-full)',
              backgroundColor: checked ? 'var(--brand-primary)' : 'var(--border-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              transition: 'background-color var(--transition-fast)',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <div
              style={{
                width: s.thumb,
                height: s.thumb,
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)',
                transform: checked ? `translateX(${s.translate})` : 'translateX(0)',
                transition: 'transform var(--transition-spring)',
              }}
            />
          </div>
        </div>
        <div>
          {label && (
            <span
              style={{
                display: 'block',
                font: 'var(--style-body)',
                color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span style={{ display: 'block', font: 'var(--style-caption-1)', color: 'var(--text-tertiary)' }}>
              {description}
            </span>
          )}
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export const Slider = forwardRef(
  (
    {
      label,
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      showValue = true,
      valueFormatter = (v) => v,
      className = '',
      style = {},
      id,
      name,
      'aria-label': ariaLabel,
      'aria-valuetext': ariaValueText,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const sliderId = id || generatedId;
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={className} style={{ width: '100%', ...style }}>
        {label && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <label htmlFor={sliderId} style={{ font: 'var(--style-caption-1)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </label>
            {showValue && (
              <span style={{ font: 'var(--style-caption-1)', fontWeight: 600, color: 'var(--brand-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {valueFormatter(value)}
              </span>
            )}
          </div>
        )}
        <div style={{ position: 'relative', height: 'var(--space-4)', display: 'flex', alignItems: 'center' }}>
          <input
            ref={ref}
            type="range"
            id={sliderId}
            name={name}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange?.(Number(e.target.value))}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={ariaValueText || valueFormatter(value)}
            style={{
              width: '100%',
              height: 'var(--space-4)',
              appearance: 'none',
              background: 'transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
              outline: 'none',
              ...props,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '4px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--border-primary)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--brand-primary)',
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: `calc(${percentage}% - 10px)`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              border: '3px solid var(--bg-primary)',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              opacity: disabled ? 0.5 : 1,
              transition: 'opacity var(--transition-fast)',
            }}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';