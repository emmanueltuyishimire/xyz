import React from 'react';

/**
 * InputField.tsx
 * Accessible standard input component for React calculators.
 * Features:
 * - Proper <label> association with htmlFor
 * - Visual help/instructions text linked via aria-describedby
 * - Validation error messages linked via aria-errormessage / aria-invalid
 * - Large touch targets and high-contrast border states
 */

interface InputFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'number' | 'tel';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helpText,
  min,
  max,
  step,
  required = false,
}) => {
  const describedBy = [
    helpText ? `${id}-help` : '',
    error ? `${id}-error` : '',
  ].filter(Boolean).join(' ');

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

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={describedBy || undefined}
        aria-invalid={!!error}
        min={min}
        max={max}
        step={step}
        required={required}
        className="calc-input"
      />

      {error && (
        <p id={`${id}-error`} className="calc-error-message" role="alert">
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  );
};
