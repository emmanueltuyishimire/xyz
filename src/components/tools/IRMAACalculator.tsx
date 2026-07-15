import React, { useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { ResultsPanel } from './ResultsPanel';

/**
 * IRMAACalculator.tsx
 * Medicare IRMAA Surcharge Calculator.
 * Uses 2026 IRMAA brackets from CMS.
 * Thresholds are adjusted annually — always link to official source.
 */

interface IRMAATier {
  label: string;
  singleMin: number;
  singleMax: number | null;
  jointMin: number;
  jointMax: number | null;
  partBMonthly: number;  // additional surcharge on top of standard
  partDMonthly: number;  // additional surcharge on top of individual plan
}

// 2026 IRMAA brackets (standard Part B premium: $202.90/mo)
// Source: CMS.gov
const STANDARD_PART_B = 202.90;
const STANDARD_PART_D = 0; // No standard Part D surcharge

const IRMAA_TIERS: IRMAATier[] = [
  {
    label: 'Standard — No Surcharge',
    singleMin: 0, singleMax: 109000,
    jointMin: 0, jointMax: 218000,
    partBMonthly: 0,
    partDMonthly: 0,
  },
  {
    label: 'Tier 1',
    singleMin: 109001, singleMax: 137000,
    jointMin: 218001, jointMax: 274000,
    partBMonthly: 81.20,
    partDMonthly: 14.50,
  },
  {
    label: 'Tier 2',
    singleMin: 137001, singleMax: 171000,
    jointMin: 274001, jointMax: 342000,
    partBMonthly: 202.90,
    partDMonthly: 37.50,
  },
  {
    label: 'Tier 3',
    singleMin: 171001, singleMax: 205000,
    jointMin: 342001, jointMax: 410000,
    partBMonthly: 324.60,
    partDMonthly: 60.40,
  },
  {
    label: 'Tier 4',
    singleMin: 205001, singleMax: 500000,
    jointMin: 410001, jointMax: 750000,
    partBMonthly: 446.30,
    partDMonthly: 83.30,
  },
  {
    label: 'Tier 5 — Highest',
    singleMin: 500001, singleMax: null,
    jointMin: 750001, jointMax: null,
    partBMonthly: 487.00,
    partDMonthly: 91.00,
  },
];

interface IRMAAResult {
  tier: IRMAATier;
  totalPartBMonthly: number;
  totalPartBYearly: number;
  partDSurchargeMonthly: number;
  partDSurchargeYearly: number;
}

export const IRMAACalculator: React.FC = () => {
  const [magi, setMagi] = useState<number | ''>('');
  const [filingStatus, setFilingStatus] = useState<'single' | 'joint'>('single');
  const [result, setResult] = useState<IRMAAResult | null>(null);
  const [errors, setErrors] = useState<{ magi?: string }>({});

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { magi?: string } = {};

    if (magi === '' || magi < 0) {
      newErrors.magi = 'Please enter a valid income amount (0 or more).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResult(null);
      return;
    }

    setErrors({});

    const income = magi as number;
    let matchedTier = IRMAA_TIERS[0];

    for (const tier of IRMAA_TIERS) {
      const min = filingStatus === 'single' ? tier.singleMin : tier.jointMin;
      const max = filingStatus === 'single' ? tier.singleMax : tier.jointMax;
      if (income >= min && (max === null || income <= max)) {
        matchedTier = tier;
        break;
      }
    }

    const totalPartBMonthly = STANDARD_PART_B + matchedTier.partBMonthly;
    setResult({
      tier: matchedTier,
      totalPartBMonthly,
      totalPartBYearly: totalPartBMonthly * 12,
      partDSurchargeMonthly: matchedTier.partDMonthly,
      partDSurchargeYearly: matchedTier.partDMonthly * 12,
    });
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="irmaa-calculator-wrapper">
      <form onSubmit={calculate} className="calc-form">
        <div className="calc-field-group">
          <label htmlFor="filing-status" className="calc-label">
            Tax Filing Status
          </label>
          <p className="calc-help-text">
            Select how you filed your most recent federal tax return.
          </p>
          <select
            id="filing-status"
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as 'single' | 'joint')}
            className="calc-select"
          >
            <option value="single">Single / Married Filing Separately</option>
            <option value="joint">Married Filing Jointly</option>
          </select>
        </div>

        <MoneyInput
          id="magi-income"
          label="Modified Adjusted Gross Income (MAGI)"
          value={magi}
          onChange={(val) => setMagi(val === '' ? '' : Number(val))}
          placeholder="Enter your MAGI income (e.g., 95,000)"
          helpText="Use your MAGI from 2 years ago (e.g. for 2026 Medicare, use your 2024 tax return MAGI)."
          error={errors.magi}
          min={0}
          required
        />

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate IRMAA Surcharge
        </button>
      </form>

      {result && (
        <ResultsPanel
          title="Your Medicare Premium Estimate"
          primaryLabel="Estimated Monthly Part B Premium"
          primaryValue={formatCurrency(result.totalPartBMonthly)}
          variant={result.tier.label === 'Standard — No Surcharge' ? 'success' : 'warning'}
        >
          <div className="irmaa-results-details">
            <p>
              Your income places you in the <strong>{result.tier.label}</strong> bracket.
            </p>

            <div className="irmaa-summary-grid">
              <div className="irmaa-summary-item">
                <span className="irmaa-item-label">Part B Monthly Premium</span>
                <strong className="irmaa-item-value">{formatCurrency(result.totalPartBMonthly)}</strong>
              </div>
              <div className="irmaa-summary-item">
                <span className="irmaa-item-label">Part B Yearly Total</span>
                <strong className="irmaa-item-value">{formatCurrency(result.totalPartBYearly)}</strong>
              </div>
              {result.partDSurchargeMonthly > 0 && (
                <>
                  <div className="irmaa-summary-item">
                    <span className="irmaa-item-label">Part D Monthly Surcharge</span>
                    <strong className="irmaa-item-value">{formatCurrency(result.partDSurchargeMonthly)}</strong>
                  </div>
                  <div className="irmaa-summary-item">
                    <span className="irmaa-item-label">Part D Yearly Surcharge</span>
                    <strong className="irmaa-item-value">{formatCurrency(result.partDSurchargeYearly)}</strong>
                  </div>
                </>
              )}
            </div>

            {result.tier.label !== 'Standard — No Surcharge' && (
              <p className="irmaa-appeal-note">
                <strong>💡 Tip:</strong> If your income recently dropped due to retirement, marriage, divorce, or loss of a spouse, you may qualify for a lower IRMAA bracket. Submit <strong>Form SSA-44</strong> to the Social Security Administration.
              </p>
            )}
          </div>
        </ResultsPanel>
      )}

      <style>{`
        .irmaa-results-details p { max-width: 100%; margin-bottom: var(--space-3); }
        .irmaa-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          background: var(--color-surface-alt);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin: var(--space-4) 0;
        }
        .irmaa-summary-item { display: flex; flex-direction: column; gap: 2px; }
        .irmaa-item-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .irmaa-item-value { font-size: var(--text-lg); color: var(--color-primary); }
        .irmaa-appeal-note { font-size: var(--text-sm); background: hsla(38,90%,45%,0.06); border-left: 3px solid var(--color-accent); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); max-width: 100%; }
        @media (max-width: 500px) { .irmaa-summary-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
