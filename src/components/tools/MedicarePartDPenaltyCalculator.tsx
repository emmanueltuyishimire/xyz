import React, { useState, useId } from 'react';

/**
 * MedicarePartDPenaltyCalculator.tsx
 * Tool: Medicare Part D Late Enrollment Penalty Calculator
 * Primary keyword: medicare part d penalty calculator
 *
 * CMS Part D Penalty Formula:
 *   Penalty = (Uncovered Months × 1%) × National Base Beneficiary Premium
 *   Result is rounded to the nearest $0.10 per CMS rules.
 *   2026 National Base Beneficiary Premium: $36.78
 */

const DEFAULT_BASE_PREMIUM_2026 = 36.78;

interface PenaltyResult {
  uncoveredMonths: number;
  basePremium: number;
  penaltyPct: number;          // e.g. 12 for 12%
  monthlySurcharge: number;    // rounded to nearest $0.10
  annualSurcharge: number;
  lifetime20Year: number;
}

export const MedicarePartDPenaltyCalculator: React.FC = () => {
  const uid = useId();

  const [months, setMonths]             = useState<number | ''>('');
  const [basePremium, setBasePremium]   = useState<number>(DEFAULT_BASE_PREMIUM_2026);
  const [customPremium, setCustomPremium] = useState(false);
  const [result, setResult]             = useState<PenaltyResult | null>(null);
  const [error, setError]               = useState('');
  const [showWork, setShowWork]         = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (months === '' || isNaN(Number(months)) || Number(months) < 0) {
      setError('Please enter the number of months you went without creditable drug coverage (0 or more).');
      setResult(null);
      return;
    }

    setError('');
    const m = Math.floor(Number(months));
    const prem = Number(basePremium) || DEFAULT_BASE_PREMIUM_2026;

    // 1% per full uncovered month
    const penaltyPct = m * 1;
    const rawSurcharge = (penaltyPct / 100) * prem;
    
    // CMS rounds to the nearest $0.10
    const monthlySurcharge = Math.round(rawSurcharge * 10) / 10;
    const annualSurcharge = monthlySurcharge * 12;
    const lifetime20Year = monthlySurcharge * 240;

    setResult({
      uncoveredMonths: m,
      basePremium: prem,
      penaltyPct,
      monthlySurcharge,
      annualSurcharge,
      lifetime20Year,
    });
    setShowWork(false);
  };

  const handleReset = () => {
    setMonths('');
    setBasePremium(DEFAULT_BASE_PREMIUM_2026);
    setCustomPremium(false);
    setResult(null);
    setError('');
  };

  const formatUsd = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  return (
    <div className="d-calc-container">

      {/* ── Trust badge ── */}
      <div className="d-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 Free &amp; private</span>
        <span>No signup required</span>
        <span>Calculated instantly in browser</span>
        <span>Your data is never saved</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="Medicare Part D Penalty Calculator Form">
        
        {/* Months input */}
        <div className="d-field">
          <label htmlFor={`${uid}-months`} className="d-label">
            Months without creditable prescription drug coverage
            <span className="d-required" aria-hidden="true"> *</span>
          </label>
          <p className="d-hint" id={`${uid}-months-hint`}>
            Count every full month you went without Medicare Part D or equivalent creditable drug coverage (like active employer coverage or VA benefits) after your Initial Enrollment Period ended.
          </p>
          <input
            id={`${uid}-months`}
            type="number"
            min="0"
            max="600"
            step="1"
            value={months}
            onChange={e => setMonths(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
            className={`d-input${error ? ' d-input--error' : ''}`}
            aria-describedby={`${uid}-months-hint${error ? ` ${uid}-months-err` : ''}`}
            aria-invalid={!!error}
            aria-required="true"
            placeholder="e.g. 14"
          />
          {error && <p id={`${uid}-months-err`} className="d-error" role="alert">{error}</p>}
        </div>

        {/* National Base Premium (editable toggle) */}
        <div className="d-field d-field--secondary">
          <div className="d-base-header">
            <span className="d-label-sub">
              2026 National Base Beneficiary Premium: <strong>{formatUsd(basePremium)}</strong>
            </span>
            <button
              type="button"
              className="d-toggle-link"
              onClick={() => setCustomPremium(!customPremium)}
            >
              {customPremium ? 'Use default ($36.78)' : 'Change base premium'}
            </button>
          </div>
          {customPremium && (
            <div className="d-custom-box">
              <label htmlFor={`${uid}-base`} className="d-label-sm">
                Custom National Base Beneficiary Premium ($)
              </label>
              <input
                id={`${uid}-base`}
                type="number"
                step="0.01"
                min="1"
                value={basePremium}
                onChange={e => setBasePremium(parseFloat(e.target.value) || DEFAULT_BASE_PREMIUM_2026)}
                className="d-input d-input--sm"
              />
              <p className="d-hint-sm">CMS updates this figure annually (2026 standard is $36.78).</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="d-actions">
          <button type="submit" className="d-btn d-btn--primary">
            Calculate Part D Penalty
          </button>
          {result && (
            <button type="button" className="d-btn d-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Panel ── */}
      {result && (
        <div className="d-results" role="region" aria-live="polite" aria-label="Part D Penalty Calculation Results">
          
          {result.monthlySurcharge === 0 ? (
            <div className="d-card d-card--success">
              <div className="d-card-icon">✅</div>
              <div>
                <p className="d-card-title">No Part D Late Enrollment Penalty</p>
                <p className="d-card-body">
                  Because you reported 0 uncovered months, you owe no Part D late enrollment penalty. You can enroll in any Part D plan at its regular premium rate.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="d-card d-card--warning">
                <span className="d-badge">Medicare Part D Penalty Estimate</span>
                
                <div className="d-stat-grid">
                  <div className="d-stat">
                    <span className="d-stat-val">{formatUsd(result.monthlySurcharge)}</span>
                    <span className="d-stat-lbl">added to your monthly Part D plan premium for life</span>
                  </div>
                  <div className="d-stat d-stat--secondary">
                    <span className="d-stat-val">{result.penaltyPct}%</span>
                    <span className="d-stat-lbl">penalty rate ({result.uncoveredMonths} months × 1%)</span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="d-table">
                  <div className="d-row">
                    <span>Uncovered months count</span>
                    <span><strong>{result.uncoveredMonths} months</strong></span>
                  </div>
                  <div className="d-row">
                    <span>Penalty percentage (1% per month)</span>
                    <span><strong>{result.penaltyPct}%</strong></span>
                  </div>
                  <div className="d-row">
                    <span>2026 National Base Beneficiary Premium</span>
                    <span><strong>{formatUsd(result.basePremium)}</strong></span>
                  </div>
                  <div className="d-row d-row--highlight">
                    <span>Monthly Part D penalty surcharge (rounded to $0.10)</span>
                    <span><strong>+ {formatUsd(result.monthlySurcharge)} / month</strong></span>
                  </div>
                </div>

                {/* Projections */}
                <div className="d-projections">
                  <div className="d-proj-row">
                    <span>Extra cost per year</span>
                    <strong>{formatUsd(result.annualSurcharge)}</strong>
                  </div>
                  <div className="d-proj-row">
                    <span>Estimated extra cost over 20 years</span>
                    <strong>{formatUsd(result.lifetime20Year)}</strong>
                  </div>
                  <p className="d-proj-note">
                    ⚠️ The Part D penalty is <strong>permanent for life</strong> and is billed on top of whatever specific prescription drug plan premium you choose.
                  </p>
                </div>
              </div>

              {/* Show-my-work toggle */}
              <button
                type="button"
                className="d-work-btn"
                onClick={() => setShowWork(v => !v)}
                aria-expanded={showWork}
              >
                {showWork ? '▲ Hide calculation steps' : '▼ Show step-by-step math'}
              </button>

              {showWork && (
                <div className="d-work-box" aria-label="Calculation steps">
                  <h4>How CMS Calculates This Part D Penalty</h4>
                  <ol className="d-work-list">
                    <li>
                      <strong>Uncovered months:</strong> {result.uncoveredMonths} full months without creditable drug coverage after your Initial Enrollment Period.
                    </li>
                    <li>
                      <strong>Monthly penalty multiplier:</strong> {result.uncoveredMonths} months × 1% = <strong>{result.penaltyPct}%</strong>.
                    </li>
                    <li>
                      <strong>Base premium:</strong> 2026 CMS National Base Beneficiary Premium = <strong>{formatUsd(result.basePremium)}</strong>.
                    </li>
                    <li>
                      <strong>Raw monthly calculation:</strong> {result.penaltyPct}% × {formatUsd(result.basePremium)} = {formatUsd((result.penaltyPct / 100) * result.basePremium)}.
                    </li>
                    <li>
                      <strong>CMS Rounding rule:</strong> Rounded to the nearest $0.10 = <strong>{formatUsd(result.monthlySurcharge)} per month</strong>.
                    </li>
                  </ol>
                  <p className="d-work-source">
                    Official rule: <a href="https://www.medicare.gov/drug-coverage-part-d/costs-for-medicare-drug-coverage/part-d-late-enrollment-penalty" target="_blank" rel="noopener noreferrer">Medicare.gov — Part D Late Enrollment Penalty</a>
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      )}

      <style>{`
        .d-calc-container { font-family: inherit; }

        /* Trust bar */
        .d-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        /* Fields */
        .d-field { margin-bottom: 1.5rem; }
        .d-field--secondary {
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.85rem 1rem;
        }

        .d-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .d-label-sub { font-size: 0.9rem; color: var(--color-primary, #0A3D3A); }
        .d-required { color: var(--color-error, #c0392b); }
        .d-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        .d-input {
          display: block; width: 100%; max-width: 280px;
          font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
          transition: border-color 0.2s;
        }
        .d-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .d-input--error { border-color: var(--color-error, #c0392b); }
        .d-input--sm { max-width: 140px; font-size: 0.95rem; margin-top: 0.4rem; }

        .d-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .d-base-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
        .d-toggle-link {
          background: none; border: none; font-size: 0.825rem;
          color: var(--color-secondary, #C9933A); text-decoration: underline;
          cursor: pointer; padding: 0;
        }
        .d-custom-box { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--color-border, #cbd5e1); }
        .d-label-sm { display: block; font-size: 0.85rem; font-weight: 600; color: var(--color-primary, #0A3D3A); }
        .d-hint-sm { font-size: 0.775rem; color: var(--color-text-muted, #64748b); margin: 0.2rem 0 0; }

        /* Actions */
        .d-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .d-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer;
          border: 2px solid transparent; transition: all 0.2s;
        }
        .d-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .d-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .d-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .d-btn--ghost:hover { border-color: var(--color-primary, #0A3D3A); color: var(--color-primary, #0A3D3A); }
        .d-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .d-results { margin-top: 2rem; }
        .d-card { border-radius: 0.875rem; padding: 1.75rem; margin-bottom: 1rem; }
        .d-card--success { background: #f0fdf4; border: 2px solid #22c55e; display: flex; gap: 1rem; }
        .d-card-icon { font-size: 2rem; }
        .d-card-title { font-size: 1.2rem; font-weight: 700; color: #15803d; margin: 0 0 0.4rem; }
        .d-card-body { font-size: 0.95rem; color: #166534; margin: 0; }

        .d-card--warning { background: #fffbeb; border: 2px solid #f59e0b; }
        .d-badge {
          font-size: 0.725rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          color: #92400e; background: #fef3c7; border-radius: 9999px;
          padding: 0.2rem 0.75rem; display: inline-block; margin-bottom: 1rem;
        }

        .d-stat-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.25rem; }
        .d-stat { display: flex; flex-direction: column; }
        .d-stat-val { font-size: 2.3rem; font-weight: 800; color: #b45309; line-height: 1; }
        .d-stat-lbl { font-size: 0.85rem; color: #78350f; margin-top: 0.3rem; }
        .d-stat--secondary .d-stat-val { color: var(--color-primary, #0A3D3A); font-size: 1.8rem; }
        .d-stat--secondary .d-stat-lbl { color: var(--color-text-muted, #64748b); }

        .d-table { background: #fff; border-radius: 0.5rem; border: 1px solid #fde68a; overflow: hidden; margin-bottom: 1rem; }
        .d-row { display: flex; justify-content: space-between; padding: 0.6rem 1rem; font-size: 0.95rem; border-bottom: 1px solid #fde68a; gap: 1rem; }
        .d-row:last-child { border-bottom: none; }
        .d-row--highlight { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 700; }

        .d-projections { background: #fff7ed; border-radius: 0.5rem; padding: 1rem; }
        .d-proj-row { display: flex; justify-content: space-between; font-size: 0.95rem; padding: 0.3rem 0; gap: 1rem; }
        .d-proj-note { font-size: 0.85rem; color: #92400e; margin: 0.75rem 0 0; line-height: 1.5; }

        .d-work-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.875rem; color: var(--color-secondary, #C9933A);
          text-decoration: underline; padding: 0.25rem 0; display: block; margin-bottom: 1rem;
        }
        .d-work-box { background: #f8fafc; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 1rem; }
        .d-work-box h4 { font-size: 0.95rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.75rem; }
        .d-work-list { padding-left: 1.25rem; margin: 0 0 0.75rem; }
        .d-work-list li { font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.4rem; }
        .d-work-source { font-size: 0.8rem; color: var(--color-text-muted, #64748b); margin: 0; }
        .d-work-source a { color: var(--color-secondary, #C9933A); }

        @media (max-width: 480px) {
          .d-input { max-width: 100%; }
          .d-stat-val { font-size: 1.8rem; }
          .d-row { flex-direction: column; align-items: flex-start; gap: 0.2rem; }
          .d-proj-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};
