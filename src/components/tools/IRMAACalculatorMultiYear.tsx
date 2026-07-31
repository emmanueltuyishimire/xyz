import React, { useState, useId } from 'react';

/**
 * IRMAACalculatorMultiYear.tsx
 * Multi-Year Medicare IRMAA Surcharge Calculator
 * Primary keyword: irmaa calculator
 *
 * Supports:
 *  - Filing Status: Single, Married Filing Jointly, Married Filing Separately
 *  - 2-Year Lookback MAGI (determines current year IRMAA)
 *  - Optional Next-Year/Projected MAGI for side-by-side "This Year vs. Next Year" comparison
 *
 * Official 2026 CMS IRMAA Brackets (Standard Part B premium = $202.90/mo):
 * Source: CMS.gov / Medicare.gov
 */

export type FilingStatus = 'single' | 'joint' | 'separate';

interface IRMAATier {
  tierName: string;
  label: string;
  singleMin: number; singleMax: number | null;
  jointMin: number;  jointMax: number | null;
  sepMin: number;    sepMax: number | null;
  partBSurcharge: number;  // added monthly
  partDSurcharge: number;  // added monthly
}

const STANDARD_PART_B_2026 = 202.90;

const IRMAA_TIERS_2026: IRMAATier[] = [
  {
    tierName: 'Tier 0 (Standard)',
    label: 'Standard Rate — No IRMAA Surcharge',
    singleMin: 0, singleMax: 106000,
    jointMin: 0, jointMax: 212000,
    sepMin: 0, sepMax: 106000,
    partBSurcharge: 0,
    partDSurcharge: 0,
  },
  {
    tierName: 'Tier 1',
    label: 'Tier 1 Surcharge',
    singleMin: 106001, singleMax: 133000,
    jointMin: 212001, jointMax: 266000,
    sepMin: null, sepMax: null, // Separated skips to Tier 4 above $106k
    partBSurcharge: 81.20,
    partDSurcharge: 13.70,
  },
  {
    tierName: 'Tier 2',
    label: 'Tier 2 Surcharge',
    singleMin: 133001, singleMax: 166000,
    jointMin: 266001, jointMax: 332000,
    sepMin: null, sepMax: null,
    partBSurcharge: 202.90,
    partDSurcharge: 35.30,
  },
  {
    tierName: 'Tier 3',
    label: 'Tier 3 Surcharge',
    singleMin: 166001, singleMax: 199000,
    jointMin: 332001, jointMax: 398000,
    sepMin: null, sepMax: null,
    partBSurcharge: 324.60,
    partDSurcharge: 57.00,
  },
  {
    tierName: 'Tier 4',
    label: 'Tier 4 Surcharge',
    singleMin: 199001, singleMax: 500000,
    jointMin: 398001, jointMax: 750000,
    sepMin: 106001, sepMax: 394000,
    partBSurcharge: 446.30,
    partDSurcharge: 78.60,
  },
  {
    tierName: 'Tier 5 (Maximum)',
    label: 'Tier 5 Maximum Surcharge',
    singleMin: 500001, singleMax: null,
    jointMin: 750001, jointMax: null,
    sepMin: 394001, sepMax: null,
    partBSurcharge: 486.90,
    partDSurcharge: 85.80,
  },
];

export interface CalculationOutcome {
  magi: number;
  tier: IRMAATier;
  partBSurcharge: number;
  partBTotal: number;
  partDSurcharge: number;
  totalMonthlySurcharge: number;
  totalAnnualSurcharge: number;
}

export function calculateIRMAA(magi: number, status: FilingStatus): CalculationOutcome {
  let matchedTier = IRMAA_TIERS_2026[0];

  if (status === 'separate') {
    if (magi <= 106000) {
      matchedTier = IRMAA_TIERS_2026[0];
    } else if (magi <= 394000) {
      matchedTier = IRMAA_TIERS_2026[4]; // Tier 4 for MFS
    } else {
      matchedTier = IRMAA_TIERS_2026[5]; // Tier 5 for MFS
    }
  } else {
    for (const tier of IRMAA_TIERS_2026) {
      const min = status === 'joint' ? tier.jointMin : tier.singleMin;
      const max = status === 'joint' ? tier.jointMax : tier.singleMax;

      if (magi >= min && (max === null || magi <= max)) {
        matchedTier = tier;
        break;
      }
    }
  }

  const partBSurcharge = matchedTier.partBSurcharge;
  const partBTotal = STANDARD_PART_B_2026 + partBSurcharge;
  const partDSurcharge = matchedTier.partDSurcharge;
  const totalMonthlySurcharge = partBSurcharge + partDSurcharge;
  const totalAnnualSurcharge = totalMonthlySurcharge * 12;

  return {
    magi,
    tier: matchedTier,
    partBSurcharge,
    partBTotal,
    partDSurcharge,
    totalMonthlySurcharge,
    totalAnnualSurcharge,
  };
}

export const IRMAACalculatorMultiYear: React.FC = () => {
  const uid = useId();

  const [status, setStatus]               = useState<FilingStatus>('single');
  const [currentMagi, setCurrentMagi]     = useState<string>('');
  const [enableNextYear, setEnableNextYear] = useState<boolean>(false);
  const [nextMagi, setNextMagi]           = useState<string>('');

  const [currentResult, setCurrentResult] = useState<CalculationOutcome | null>(null);
  const [nextResult, setNextResult]       = useState<CalculationOutcome | null>(null);
  const [error, setError]                 = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const magi1 = parseFloat(currentMagi.replace(/[^0-9.]/g, ''));

    if (isNaN(magi1) || magi1 < 0) {
      setError('Please enter a valid Modified Adjusted Gross Income (MAGI) for the current tax year (0 or more).');
      setCurrentResult(null);
      setNextResult(null);
      return;
    }

    setError('');
    const res1 = calculateIRMAA(magi1, status);
    setCurrentResult(res1);

    if (enableNextYear && nextMagi.trim() !== '') {
      const magi2 = parseFloat(nextMagi.replace(/[^0-9.]/g, ''));
      if (!isNaN(magi2) && magi2 >= 0) {
        setNextResult(calculateIRMAA(magi2, status));
      } else {
        setNextResult(null);
      }
    } else {
      setNextResult(null);
    }
  };

  const handleReset = () => {
    setStatus('single');
    setCurrentMagi('');
    setEnableNextYear(false);
    setNextMagi('');
    setCurrentResult(null);
    setNextResult(null);
    setError('');
  };

  const fmtUsd = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const fmtUsdInt = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="irmaa-calc-wrapper">

      {/* ── Trust notice ── */}
      <div className="irmaa-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 100% Free &amp; Private</span>
        <span>No signup or account</span>
        <span>Instant browser calculations</span>
        <span>Data is never stored</span>
      </div>

      {/* ── Calculator Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="IRMAA Calculator Form">
        
        {/* Tax Filing Status */}
        <div className="irmaa-field">
          <label htmlFor={`${uid}-status`} className="irmaa-label">
            Tax Filing Status (from 2 years prior tax return)
            <span className="irmaa-required" aria-hidden="true"> *</span>
          </label>
          <p className="irmaa-hint">
            Social Security uses your tax return from two years prior (e.g., 2024 tax return determines 2026 IRMAA premiums).
          </p>
          <select
            id={`${uid}-status`}
            value={status}
            onChange={e => setStatus(e.target.value as FilingStatus)}
            className="irmaa-select"
          >
            <option value="single">Single / Head of Household / Qualifying Surviving Spouse</option>
            <option value="joint">Married Filing Jointly</option>
            <option value="separate">Married Filing Separately</option>
          </select>
        </div>

        {/* Current Year MAGI */}
        <div className="irmaa-field">
          <label htmlFor={`${uid}-cmagi`} className="irmaa-label">
            Modified Adjusted Gross Income (MAGI) for 2026 Premium Year (2024 Tax Return)
            <span className="irmaa-required" aria-hidden="true"> *</span>
          </label>
          <p className="irmaa-hint" id={`${uid}-cmagi-hint`}>
            MAGI is your Adjusted Gross Income (AGI) plus any tax-exempt interest income (Line 2a + Line 11 on IRS Form 1040).
          </p>
          <div className="irmaa-input-addon">
            <span className="irmaa-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-cmagi`}
              type="number"
              min="0"
              step="1000"
              value={currentMagi}
              onChange={e => setCurrentMagi(e.target.value)}
              className={`irmaa-input${error ? ' irmaa-input--error' : ''}`}
              placeholder="e.g. 145000"
              aria-describedby={`${uid}-cmagi-hint${error ? ` ${uid}-cmagi-err` : ''}`}
              aria-invalid={!!error}
              aria-required="true"
            />
          </div>
          {error && <p id={`${uid}-cmagi-err`} className="irmaa-error" role="alert">{error}</p>}
        </div>

        {/* Multi-Year Comparison Toggle */}
        <div className="irmaa-field irmaa-field--compare">
          <label className="irmaa-checkbox-label">
            <input
              type="checkbox"
              checked={enableNextYear}
              onChange={e => setEnableNextYear(e.target.checked)}
              className="irmaa-checkbox"
            />
            Compare with Next Year / Projected Income (Side-by-Side Comparison)
          </label>

          {enableNextYear && (
            <div className="irmaa-subfield">
              <label htmlFor={`${uid}-nmagi`} className="irmaa-label irmaa-label--sub">
                Projected MAGI for Next Year (e.g., post-retirement lower income)
              </label>
              <p className="irmaa-hint">
                Enter your expected MAGI if your income is changing (e.g. retiring, selling property, or taking IRA distributions).
              </p>
              <div className="irmaa-input-addon">
                <span className="irmaa-addon-symbol" aria-hidden="true">$</span>
                <input
                  id={`${uid}-nmagi`}
                  type="number"
                  min="0"
                  step="1000"
                  value={nextMagi}
                  onChange={e => setNextMagi(e.target.value)}
                  className="irmaa-input"
                  placeholder="e.g. 95000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="irmaa-actions">
          <button type="submit" className="irmaa-btn irmaa-btn--primary">
            Calculate IRMAA Surcharge
          </button>
          {currentResult && (
            <button type="button" className="irmaa-btn irmaa-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Output ── */}
      {currentResult && (
        <div className="irmaa-results" role="region" aria-live="polite" aria-label="IRMAA Surcharge Results">

          {/* Single Year or Multi-Year Comparison layout */}
          {nextResult ? (
            /* Multi-Year Side-by-Side Comparison */
            <div className="irmaa-compare-grid">
              {/* Year 1 Result */}
              <div className={`irmaa-card ${currentResult.totalMonthlySurcharge > 0 ? 'irmaa-card--warning' : 'irmaa-card--success'}`}>
                <div className="irmaa-card-header">
                  <span className="irmaa-year-tag">Current 2026 Benefit Year</span>
                  <p className="irmaa-magi-display">MAGI: {fmtUsdInt(currentResult.magi)}</p>
                </div>

                <div className="irmaa-tier-badge">{currentResult.tier.tierName}</div>
                <p className="irmaa-tier-desc">{currentResult.tier.label}</p>

                <div className="irmaa-main-stat">
                  <span className="irmaa-stat-value">{fmtUsd(currentResult.totalMonthlySurcharge)}</span>
                  <span className="irmaa-stat-label">total added monthly IRMAA surcharge</span>
                </div>

                <div className="irmaa-breakdown-list">
                  <div className="irmaa-b-row">
                    <span>Part B Standard Premium:</span>
                    <strong>{fmtUsd(STANDARD_PART_B_2026)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row">
                    <span>Part B IRMAA Surcharge:</span>
                    <strong>+ {fmtUsd(currentResult.partBSurcharge)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row irmaa-b-row--total">
                    <span>Your Total Part B Cost:</span>
                    <strong>{fmtUsd(currentResult.partBTotal)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row">
                    <span>Part D IRMAA Surcharge:</span>
                    <strong>+ {fmtUsd(currentResult.partDSurcharge)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row irmaa-b-row--annual">
                    <span>Annual IRMAA Cost:</span>
                    <strong>{fmtUsd(currentResult.totalAnnualSurcharge)}/year</strong>
                  </div>
                </div>
              </div>

              {/* Year 2 / Projected Result */}
              <div className={`irmaa-card ${nextResult.totalMonthlySurcharge > 0 ? 'irmaa-card--warning' : 'irmaa-card--success'}`}>
                <div className="irmaa-card-header">
                  <span className="irmaa-year-tag irmaa-year-tag--next">Projected Next Year</span>
                  <p className="irmaa-magi-display">MAGI: {fmtUsdInt(nextResult.magi)}</p>
                </div>

                <div className="irmaa-tier-badge">{nextResult.tier.tierName}</div>
                <p className="irmaa-tier-desc">{nextResult.tier.label}</p>

                <div className="irmaa-main-stat">
                  <span className="irmaa-stat-value">{fmtUsd(nextResult.totalMonthlySurcharge)}</span>
                  <span className="irmaa-stat-label">total added monthly IRMAA surcharge</span>
                </div>

                <div className="irmaa-breakdown-list">
                  <div className="irmaa-b-row">
                    <span>Part B Standard Premium:</span>
                    <strong>{fmtUsd(STANDARD_PART_B_2026)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row">
                    <span>Part B IRMAA Surcharge:</span>
                    <strong>+ {fmtUsd(nextResult.partBSurcharge)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row irmaa-b-row--total">
                    <span>Your Total Part B Cost:</span>
                    <strong>{fmtUsd(nextResult.partBTotal)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row">
                    <span>Part D IRMAA Surcharge:</span>
                    <strong>+ {fmtUsd(nextResult.partDSurcharge)}/mo</strong>
                  </div>
                  <div className="irmaa-b-row irmaa-b-row--annual">
                    <span>Annual IRMAA Cost:</span>
                    <strong>{fmtUsd(nextResult.totalAnnualSurcharge)}/year</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Single Year Standard View */
            <div className={`irmaa-card ${currentResult.totalMonthlySurcharge > 0 ? 'irmaa-card--warning' : 'irmaa-card--success'}`}>
              
              {currentResult.totalMonthlySurcharge === 0 ? (
                <div className="irmaa-success-wrapper">
                  <div className="irmaa-icon">✅</div>
                  <div>
                    <h3 className="irmaa-success-h3">No IRMAA Surcharge Applies</h3>
                    <p className="irmaa-success-p">
                      With a MAGI of <strong>{fmtUsdInt(currentResult.magi)}</strong> ({status === 'joint' ? 'Married Filing Jointly' : status === 'separate' ? 'Married Filing Separately' : 'Single'}), your income is below the 2026 IRMAA threshold ($106,000 Single / $212,000 Joint). You pay only the standard Part B premium ({fmtUsd(STANDARD_PART_B_2026)}/mo) and your standard Part D plan premium.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="irmaa-result-header-row">
                    <span className="irmaa-badge">{currentResult.tier.tierName}</span>
                    <span className="irmaa-magi-lbl">MAGI: <strong>{fmtUsdInt(currentResult.magi)}</strong></span>
                  </div>

                  <div className="irmaa-stat-pair">
                    <div className="irmaa-stat-unit">
                      <span className="irmaa-stat-val">{fmtUsd(currentResult.totalMonthlySurcharge)}</span>
                      <span className="irmaa-stat-sub">added monthly IRMAA surcharge</span>
                    </div>
                    <div className="irmaa-stat-unit irmaa-stat-unit--sec">
                      <span className="irmaa-stat-val">{fmtUsd(currentResult.totalAnnualSurcharge)}</span>
                      <span className="irmaa-stat-sub">added yearly cost</span>
                    </div>
                  </div>

                  <div className="irmaa-table-box">
                    <div className="irmaa-t-row">
                      <span>Standard 2026 Part B Premium</span>
                      <span><strong>{fmtUsd(STANDARD_PART_B_2026)} / month</strong></span>
                    </div>
                    <div className="irmaa-t-row irmaa-t-row--surcharge">
                      <span>Part B IRMAA Surcharge</span>
                      <span><strong>+ {fmtUsd(currentResult.partBSurcharge)} / month</strong></span>
                    </div>
                    <div className="irmaa-t-row irmaa-t-row--total">
                      <span>Total Part B Monthly Premium</span>
                      <span><strong>{fmtUsd(currentResult.partBTotal)} / month</strong></span>
                    </div>
                    <div className="irmaa-t-row irmaa-t-row--surcharge">
                      <span>Part D IRMAA Surcharge (billed on top of plan)</span>
                      <span><strong>+ {fmtUsd(currentResult.partDSurcharge)} / month</strong></span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Appeal / SSA Form 44 note */}
          <div className="irmaa-appeal-note">
            <h4>Experienced a Life-Changing Event? You Can Appeal!</h4>
            <p>
              If your income dropped significantly due to retirement, marriage, divorce, death of a spouse, work reduction, or loss of income-producing property, you can file <strong>Form SSA-44</strong> with Social Security to request an IRMAA reduction based on a more recent year's income.
            </p>
          </div>

        </div>
      )}

      <style>{`
        .irmaa-calc-wrapper { font-family: inherit; }

        .irmaa-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        .irmaa-field { margin-bottom: 1.5rem; }
        .irmaa-field--compare {
          background: var(--color-surface-alt, #f8fafc);
          border: 1px dashed var(--color-border, #cbd5e1);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
        }
        .irmaa-subfield { margin-top: 1rem; padding-left: 1.25rem; border-left: 3px solid var(--color-secondary, #C9933A); }

        .irmaa-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .irmaa-label--sub { font-size: 0.95rem; }
        .irmaa-required { color: var(--color-error, #c0392b); }
        .irmaa-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        .irmaa-select {
          display: block; width: 100%; max-width: 480px;
          font-size: 1rem; padding: 0.65rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }

        .irmaa-input-addon { display: flex; align-items: center; max-width: 280px; }
        .irmaa-addon-symbol {
          background: var(--color-surface-alt, #f1f5f9);
          border: 2px solid var(--color-border, #cbd5e1);
          border-right: none;
          border-radius: 0.5rem 0 0 0.5rem;
          padding: 0.6rem 0.85rem;
          font-weight: 700; color: var(--color-primary, #0A3D3A);
        }
        .irmaa-input {
          flex: 1; font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0 0.5rem 0.5rem 0; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }
        .irmaa-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); }
        .irmaa-input--error { border-color: var(--color-error, #c0392b); }
        .irmaa-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .irmaa-checkbox-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 1rem; font-weight: 600; color: var(--color-primary, #0A3D3A); }
        .irmaa-checkbox { width: 1.2rem; height: 1.2rem; cursor: pointer; accent-color: var(--color-secondary, #C9933A); flex-shrink: 0; }

        .irmaa-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .irmaa-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
        }
        .irmaa-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .irmaa-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .irmaa-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .irmaa-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .irmaa-results { margin-top: 2rem; }
        .irmaa-card { border-radius: 0.875rem; padding: 1.75rem; margin-bottom: 1rem; }
        .irmaa-card--success { background: #f0fdf4; border: 2px solid #22c55e; }
        .irmaa-card--warning { background: #fffbeb; border: 2px solid #f59e0b; }

        .irmaa-success-wrapper { display: flex; gap: 1rem; align-items: flex-start; }
        .irmaa-icon { font-size: 2rem; flex-shrink: 0; }
        .irmaa-success-h3 { font-size: 1.25rem; font-weight: 700; color: #15803d; margin: 0 0 0.5rem; }
        .irmaa-success-p { font-size: 0.95rem; color: #166534; margin: 0; line-height: 1.6; }

        .irmaa-result-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
        .irmaa-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #92400e; background: #fef3c7; border-radius: 9999px; padding: 0.25rem 0.75rem; }
        .irmaa-magi-lbl { font-size: 0.9rem; color: #78350f; }

        .irmaa-stat-pair { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.25rem; }
        .irmaa-stat-unit { display: flex; flex-direction: column; }
        .irmaa-stat-val { font-size: 2.4rem; font-weight: 800; color: #b45309; line-height: 1; }
        .irmaa-stat-sub { font-size: 0.85rem; color: #78350f; margin-top: 0.25rem; }
        .irmaa-stat-unit--sec .irmaa-stat-val { color: var(--color-primary, #0A3D3A); font-size: 1.9rem; }
        .irmaa-stat-unit--sec .irmaa-stat-sub { color: var(--color-text-muted, #64748b); }

        .irmaa-table-box { background: #fff; border-radius: 0.5rem; border: 1px solid #fde68a; overflow: hidden; margin-bottom: 1rem; }
        .irmaa-t-row { display: flex; justify-content: space-between; padding: 0.6rem 1rem; font-size: 0.95rem; border-bottom: 1px solid #fde68a; gap: 1rem; }
        .irmaa-t-row:last-child { border-bottom: none; }
        .irmaa-t-row--surcharge { background: #fff7ed; color: #92400e; }
        .irmaa-t-row--total { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 700; }

        /* Multi-Year Compare Grid */
        .irmaa-compare-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
        .irmaa-card-header { margin-bottom: 0.75rem; border-bottom: 1px solid #fde68a; padding-bottom: 0.5rem; }
        .irmaa-year-tag { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary, #0A3D3A); background: #e2e8f0; border-radius: 4px; padding: 0.15rem 0.5rem; }
        .irmaa-year-tag--next { background: #dbeafe; color: #1e40af; }
        .irmaa-magi-display { font-size: 0.9rem; font-weight: 700; color: #78350f; margin: 0.4rem 0 0; }
        .irmaa-tier-badge { font-size: 1.1rem; font-weight: 800; color: #b45309; margin-bottom: 0.2rem; }
        .irmaa-tier-desc { font-size: 0.85rem; color: #78350f; margin: 0 0 1rem; }
        .irmaa-main-stat { margin-bottom: 1rem; }
        .irmaa-main-stat .irmaa-stat-value { font-size: 2.1rem; font-weight: 800; color: #b45309; display: block; line-height: 1; }
        .irmaa-main-stat .irmaa-stat-label { font-size: 0.8rem; color: #78350f; }

        .irmaa-breakdown-list { background: #fff; border-radius: 0.5rem; border: 1px solid #fde68a; overflow: hidden; }
        .irmaa-b-row { display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; font-size: 0.875rem; border-bottom: 1px solid #fde68a; gap: 0.5rem; }
        .irmaa-b-row:last-child { border-bottom: none; }
        .irmaa-b-row--total { background: var(--color-primary, #0A3D3A); color: #fff; }
        .irmaa-b-row--annual { background: #fff7ed; color: #92400e; font-weight: 700; }

        /* Appeal note */
        .irmaa-appeal-note { background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.5rem; padding: 1.25rem; margin-top: 1rem; }
        .irmaa-appeal-note h4 { font-size: 0.95rem; font-weight: 700; color: #15803d; margin: 0 0 0.5rem; }
        .irmaa-appeal-note p { font-size: 0.9rem; color: #166534; margin: 0; line-height: 1.6; }

        @media (max-width: 640px) {
          .irmaa-input-addon { max-width: 100%; }
          .irmaa-stat-val { font-size: 1.9rem; }
          .irmaa-t-row { flex-direction: column; align-items: flex-start; gap: 0.2rem; }
        }
      `}</style>
    </div>
  );
};
