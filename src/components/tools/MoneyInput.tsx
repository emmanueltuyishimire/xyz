import React from 'react';

/**
 * MoneyInput.tsx
 * Accessible numeric input specifically formatted for currency values.
 * Features:
 * - Prepended dollar sign ($) visually and read correctly by screen readers
 * - Strict number filter to prevent invalid numeric inputs
 */

interface MoneyInputProps {
  id: string;
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  error?: string;
  helpText?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  error,
  helpText,
  min = 0,
  max,
  required = false,
}) => {
  const describedBy = [
    helpText ? `${id}-help` : '',
    error ? `${id}-error` : '',
  ].filter(Boolean).join(' ');

  const handleInputChange = (val: string) => {
    if (val === '') {
      onChange('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <div className={`calc-field-group ${error ? 'calc-field-group--error' : ''}`}>
      <label htmlFor={id} className="calc-label">
        {label} {required && <span className="calc-required" aria-hidden="true">*</span>}
      </label>

      {helpText && (
        <p id={`${id}-help`} className="calc-help-text">
          {helpText}
        </p>
      )}

      <div className="money-input-wrapper">
        <span className="money-symbol" aria-hidden="true">$</span>
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={describedBy || undefined}
          aria-invalid={!!error}
          min={min}
          max={max}
          required={required}
          className="calc-input money-input"
        />
      </div>

      {error && (
        <p id={`${id}-error`} className="calc-error-message" role="alert">
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  );
};
