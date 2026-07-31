import React from 'react';

/**
 * DateInput.tsx
 * Senior-friendly Month/Year dropdown selector.
 * Avoids native calendar widgets which can be tiny, cluttered, and hard to interact with.
 * Features:
 * - Simple separate drop-down fields for Month and Year
 * - Accessible grouping with <fieldset> and <legend>
 */

interface DateInputProps {
  id: string;
  legend: string;
  birthMonth: number; // 1-12
  birthYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  startYear?: number;
  endYear?: number;
  error?: string;
  helpText?: string;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const DateInput: React.FC<DateInputProps> = ({
  id,
  legend,
  birthMonth,
  birthYear,
  onMonthChange,
  onYearChange,
  startYear = 1930,
  endYear = new Date().getFullYear(),
  error,
  helpText,
}) => {
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => endYear - i
  );

  const describedBy = [
    helpText ? `${id}-help` : '',
    error ? `${id}-error` : '',
  ].filter(Boolean).join(' ');

  return (
    <fieldset className="calc-fieldset" aria-describedby={describedBy || undefined}>
      <legend className="calc-legend">{legend}</legend>

      {helpText && (
        <p id={`${id}-help`} className="calc-help-text">
          {helpText}
        </p>
      )}

      <div className="date-select-grid">
        <div className="date-select-col">
          <label htmlFor={`${id}-month`} className="sr-only">
            Select Month
          </label>
          <select
            id={`${id}-month`}
            value={birthMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="calc-select"
          >
            <option value="">-- Select Month --</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="date-select-col">
          <label htmlFor={`${id}-year`} className="sr-only">
            Select Year
          </label>
          <select
            id={`${id}-year`}
            value={birthYear || ''}
            onChange={(e) => onYearChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
            className="calc-select"
          >
            <option value="">-- Select Year --</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p id={`${id}-error`} className="calc-error-message" role="alert">
          <strong>Error:</strong> {error}
        </p>
      )}
    </fieldset>
  );
};
