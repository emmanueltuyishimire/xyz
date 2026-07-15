import React, { useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { ResultsPanel } from './ResultsPanel';

/**
 * RMDCalculator.tsx
 * Required Minimum Distribution Calculator.
 * Uses IRS Uniform Lifetime Table (Table III) — Publication 590-B.
 * Source: https://www.irs.gov/publications/p590b
 */

// IRS Uniform Lifetime Table (Table III) — ages 72 through 120+
// Distribution Period (life expectancy factor)
const UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
  107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0,
};

interface RMDResult {
  rmd: number;
  monthlyEquivalent: number;
  distributionPeriod: number;
  penaltyIfMissed: number;
  correctedPenalty: number;
}

export const RMDCalculator: React.FC = () => {
  const [balance, setBalance] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [result, setResult] = useState<RMDResult | null>(null);
  const [errors, setErrors] = useState<{ balance?: string; age?: string }>({});

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { balance?: string; age?: string } = {};

    if (balance === '' || Number(balance) <= 0) {
      newErrors.balance = 'Enter your December 31 account balance (must be greater than $0).';
    }
    if (age === '' || Number(age) < 72 || Number(age) > 120) {
      newErrors.age = 'Enter your age as of December 31 of the distribution year (must be between 72 and 120).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResult(null);
      return;
    }

    setErrors({});

    const ageNum = Number(age);
    const balanceNum = Number(balance);
    const distributionPeriod = UNIFORM_LIFETIME_TABLE[Math.min(ageNum, 120)] || 2.0;
    const rmd = balanceNum / distributionPeriod;
    const penaltyIfMissed = rmd * 0.25;
    const correctedPenalty = rmd * 0.10;

    setResult({
      rmd,
      monthlyEquivalent: rmd / 12,
      distributionPeriod,
      penaltyIfMissed,
      correctedPenalty,
    });
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

  return (
    <div className="rmd-calculator-wrapper">
      <form onSubmit={calculate} className="calc-form">
        <MoneyInput
          id="account-balance"
          label="Account Balance (as of Dec 31 of Prior Year)"
          value={balance}
          onChange={(val) => setBalance(val === '' ? '' : Number(val))}
          placeholder="Enter your balance (e.g., 50,000)"
          helpText="Use the balance from your most recent December 31 statement for this account."
          error={errors.balance}
          min={1}
          required
        />

        <div className="calc-field-group">
          <label htmlFor="owner-age" className="calc-label">
            Your Age as of December 31 <span className="calc-required" aria-hidden="true">*</span>
          </label>
          <p className="calc-help-text">
            Enter your age as of December 31 of the year you are taking the distribution.
          </p>
          <input
            id="owner-age"
            type="number"
            min={72}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            className="calc-input"
            placeholder="Enter your age (e.g., 75)"
            aria-describedby={errors.age ? 'owner-age-error' : undefined}
            aria-invalid={!!errors.age}
          />
          {errors.age && <p id="owner-age-error" className="calc-error-message" role="alert"><strong>Error:</strong> {errors.age}</p>}
        </div>

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate My RMD
        </button>
      </form>

      {result && (
        <ResultsPanel
          title="Your Required Minimum Distribution"
          primaryLabel="Annual RMD Amount"
          primaryValue={formatCurrency(result.rmd)}
          variant="info"
        >
          <div className="rmd-results-details">
            <div className="rmd-summary-grid">
              <div className="rmd-summary-item">
                <span className="rmd-item-label">Monthly Equivalent</span>
                <strong>{formatCurrency(result.monthlyEquivalent)}</strong>
              </div>
              <div className="rmd-summary-item">
                <span className="rmd-item-label">IRS Distribution Period</span>
                <strong>{result.distributionPeriod} years</strong>
              </div>
              <div className="rmd-summary-item">
                <span className="rmd-item-label">Penalty if Missed (25%)</span>
                <strong style={{ color: 'var(--color-error)' }}>{formatCurrency(result.penaltyIfMissed)}</strong>
              </div>
              <div className="rmd-summary-item">
                <span className="rmd-item-label">Corrected Penalty (10%)</span>
                <strong style={{ color: 'var(--color-warning)' }}>{formatCurrency(result.correctedPenalty)}</strong>
              </div>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', maxWidth: '100%', marginTop: 'var(--space-3)' }}>
              💡 <strong>Deadline Reminder:</strong> Your RMD must generally be withdrawn by <strong>December 31</strong> each year. Exception: Your first RMD can be delayed until April 1 of the year following when you first reach your required beginning date age.
            </p>
          </div>
        </ResultsPanel>
      )}

      <style>{`
        .rmd-results-details { max-width: 100%; }
        .rmd-results-details p { max-width: 100%; }
        .rmd-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          background: var(--color-surface-alt);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-bottom: var(--space-4);
        }
        .rmd-summary-item { display: flex; flex-direction: column; gap: 2px; }
        .rmd-item-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        @media (max-width: 500px) { .rmd-summary-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
