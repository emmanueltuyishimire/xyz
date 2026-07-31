import React, { useState, useId } from 'react';

/**
 * MAGIForMedicareCalculator.tsx
 * MAGI for Medicare Calculator
 * Primary keyword: magi calculator for medicare
 *
 * Formula per SSA/IRS rules for IRMAA:
 *   Medicare MAGI = Adjusted Gross Income (AGI, Form 1040 Line 11)
 *                   + Tax-Exempt Interest (Form 1040 Line 2a)
 *                   + Foreign Earned Income Exclusion (Form 2555)
 *                   + Tax-exempt income from US Territories (Puerto Rico, etc.)
 */

interface MAGIResult {
  agi: number;
  taxExemptInterest: number;
  foreignIncome: number;
  territoryIncome: number;
  totalMAGI: number;
  totalAddbacks: number;
}

export const MAGIForMedicareCalculator: React.FC = () => {
  const uid = useId();

  const [agiStr, setAgiStr]                   = useState<string>('');
  const [interestStr, setInterestStr]         = useState<string>('');
  const [foreignStr, setForeignStr]           = useState<string>('');
  const [territoryStr, setTerritoryStr]       = useState<string>('');

  const [result, setResult]                   = useState<MAGIResult | null>(null);
  const [error, setError]                     = useState<string>('');
  const [showWork, setShowWork]               = useState<boolean>(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const agi = parseFloat(agiStr.replace(/[^0-9.-]/g, ''));
    if (isNaN(agi)) {
      setError('Please enter a valid Adjusted Gross Income (AGI) from your tax return (IRS Form 1040 Line 11).');
      setResult(null);
      return;
    }

    setError('');
    const taxExemptInterest = parseFloat(interestStr.replace(/[^0-9.]/g, '')) || 0;
    const foreignIncome     = parseFloat(foreignStr.replace(/[^0-9.]/g, '')) || 0;
    const territoryIncome   = parseFloat(territoryStr.replace(/[^0-9.]/g, '')) || 0;

    const totalAddbacks = taxExemptInterest + foreignIncome + territoryIncome;
    const totalMAGI = agi + totalAddbacks;

    setResult({
      agi,
      taxExemptInterest,
      foreignIncome,
      territoryIncome,
      totalMAGI,
      totalAddbacks,
    });
    setShowWork(false);
  };

  const handleReset = () => {
    setAgiStr('');
    setInterestStr('');
    setForeignStr('');
    setTerritoryStr('');
    setResult(null);
    setError('');
  };

  const fmtUsd = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="magi-calc-wrapper">

      {/* ── Trust notice ── */}
      <div className="magi-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 100% Free &amp; Private</span>
        <span>No signup or account</span>
        <span>Instant browser calculations</span>
        <span>Data is never saved</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="MAGI for Medicare Calculator Form">

        {/* AGI (Form 1040 Line 11) */}
        <div className="magi-field">
          <label htmlFor={`${uid}-agi`} className="magi-label">
            Adjusted Gross Income (AGI)
            <span className="magi-required" aria-hidden="true"> *</span>
          </label>
          <p className="magi-hint" id={`${uid}-agi-hint`}>
            Found on <strong>Line 11 of IRS Form 1040</strong>. Includes wages, pensions, traditional IRA withdrawals, taxable Social Security, capital gains, and dividends.
          </p>
          <div className="magi-input-addon">
            <span className="magi-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-agi`}
              type="number"
              step="100"
              value={agiStr}
              onChange={e => setAgiStr(e.target.value)}
              className={`magi-input${error ? ' magi-input--error' : ''}`}
              placeholder="e.g. 115000"
              aria-describedby={`${uid}-agi-hint${error ? ` ${uid}-agi-err` : ''}`}
              aria-invalid={!!error}
              aria-required="true"
            />
          </div>
          {error && <p id={`${uid}-agi-err`} className="magi-error" role="alert">{error}</p>}
        </div>

        {/* Tax-Exempt Interest (Form 1040 Line 2a) */}
        <div className="magi-field">
          <label htmlFor={`${uid}-interest`} className="magi-label">
            Tax-Exempt Interest Income
          </label>
          <p className="magi-hint" id={`${uid}-interest-hint`}>
            Found on <strong>Line 2a of IRS Form 1040</strong>. Includes interest from municipal bonds and tax-exempt bond funds. (Enter 0 if none).
          </p>
          <div className="magi-input-addon">
            <span className="magi-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-interest`}
              type="number"
              step="100"
              min="0"
              value={interestStr}
              onChange={e => setInterestStr(e.target.value)}
              className="magi-input"
              placeholder="e.g. 4500"
              aria-describedby={`${uid}-interest-hint`}
            />
          </div>
        </div>

        {/* Foreign Earned Income Exclusion (Form 2555) */}
        <div className="magi-field">
          <label htmlFor={`${uid}-foreign`} className="magi-label">
            Foreign Earned Income / Housing Exclusion (Form 2555)
          </label>
          <p className="magi-hint" id={`${uid}-foreign-hint`}>
            Enter any foreign earned income or housing exclusion claimed on IRS Form 2555. (Leave blank or 0 if not applicable).
          </p>
          <div className="magi-input-addon">
            <span className="magi-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-foreign`}
              type="number"
              step="100"
              min="0"
              value={foreignStr}
              onChange={e => setForeignStr(e.target.value)}
              className="magi-input"
              placeholder="0"
              aria-describedby={`${uid}-foreign-hint`}
            />
          </div>
        </div>

        {/* US Territory Tax-Exempt Income */}
        <div className="magi-field">
          <label htmlFor={`${uid}-territory`} className="magi-label">
            Tax-Exempt Income from U.S. Territories (e.g., Puerto Rico)
          </label>
          <p className="magi-hint" id={`${uid}-territory-hint`}>
            Enter income from sources within Puerto Rico, Guam, American Samoa, or Northern Mariana Islands not included in AGI. (Leave blank or 0 if none).
          </p>
          <div className="magi-input-addon">
            <span className="magi-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-territory`}
              type="number"
              step="100"
              min="0"
              value={territoryStr}
              onChange={e => setTerritoryStr(e.target.value)}
              className="magi-input"
              placeholder="0"
              aria-describedby={`${uid}-territory-hint`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="magi-actions">
          <button type="submit" className="magi-btn magi-btn--primary">
            Calculate Medicare MAGI
          </button>
          {result && (
            <button type="button" className="magi-btn magi-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Output ── */}
      {result && (
        <div className="magi-results" role="region" aria-live="polite" aria-label="Medicare MAGI Results">
          
          <div className="magi-card">
            <span className="magi-badge">Your Official Medicare MAGI Estimate</span>

            <div className="magi-primary-stat">
              <span className="magi-stat-val">{fmtUsd(result.totalMAGI)}</span>
              <span className="magi-stat-lbl">Modified Adjusted Gross Income for Medicare IRMAA</span>
            </div>

            {/* Line-by-line breakdown */}
            <div className="magi-table-box">
              <div className="magi-t-row">
                <span>Adjusted Gross Income (IRS Form 1040 Line 11)</span>
                <span><strong>{fmtUsd(result.agi)}</strong></span>
              </div>
              <div className="magi-t-row magi-t-row--add">
                <span>+ Tax-Exempt Interest (Form 1040 Line 2a)</span>
                <span><strong>+ {fmtUsd(result.taxExemptInterest)}</strong></span>
              </div>
              {result.foreignIncome > 0 && (
                <div className="magi-t-row magi-t-row--add">
                  <span>+ Foreign Earned Income Exclusion (Form 2555)</span>
                  <span><strong>+ {fmtUsd(result.foreignIncome)}</strong></span>
                </div>
              )}
              {result.territoryIncome > 0 && (
                <div className="magi-t-row magi-t-row--add">
                  <span>+ Tax-Exempt U.S. Territory Income</span>
                  <span><strong>+ {fmtUsd(result.territoryIncome)}</strong></span>
                </div>
              )}
              <div className="magi-t-row magi-t-row--total">
                <span>Total Medicare MAGI</span>
                <span><strong>{fmtUsd(result.totalMAGI)}</strong></span>
              </div>
            </div>

            {/* Handoff into IRMAA Calculator */}
            <div className="magi-handoff-box">
              <div className="magi-handoff-content">
                <h4>Check If This Income Triggers an IRMAA Surcharge</h4>
                <p>
                  Now that you have your exact Medicare MAGI (<strong>{fmtUsd(result.totalMAGI)}</strong>), see which IRMAA tier you fall into for Part B and Part D.
                </p>
              </div>
              <a
                href={`/tools/medicare-irmaa-calculator/?magi=${result.totalMAGI}`}
                className="magi-btn magi-btn--cta"
              >
                See Your IRMAA Surcharge →
              </a>
            </div>
          </div>

          {/* Show-work toggle */}
          <button
            type="button"
            className="magi-work-btn"
            onClick={() => setShowWork(v => !v)}
            aria-expanded={showWork}
          >
            {showWork ? '▲ Hide calculation formula' : '▼ Show exact SSA/IRS formula'}
          </button>

          {showWork && (
            <div className="magi-work-box" aria-label="Formula breakdown">
              <h4>Social Security Administration IRMAA MAGI Formula</h4>
              <p>
                Under Section 1839(i) of the Social Security Act, Social Security defines Modified Adjusted Gross Income (MAGI) for Medicare as:
              </p>
              <pre className="magi-code">
                Medicare MAGI = Form 1040 Line 11 (AGI) + Form 1040 Line 2a (Tax-Exempt Interest) + Form 2555 Foreign Exclusions + Territory Exclusions
              </pre>
              <p className="magi-work-source">
                Official source: <a href="https://www.ssa.gov/benefits/medicare/irmaa.html" target="_blank" rel="noopener noreferrer">SSA.gov — Medicare Premiums: Rules for Higher-Income Beneficiaries</a>
              </p>
            </div>
          )}

        </div>
      )}

      <style>{`
        .magi-calc-wrapper { font-family: inherit; }

        .magi-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        .magi-field { margin-bottom: 1.5rem; }

        .magi-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .magi-required { color: var(--color-error, #c0392b); }
        .magi-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        .magi-input-addon { display: flex; align-items: center; max-width: 320px; }
        .magi-addon-symbol {
          background: var(--color-surface-alt, #f1f5f9);
          border: 2px solid var(--color-border, #cbd5e1);
          border-right: none;
          border-radius: 0.5rem 0 0 0.5rem;
          padding: 0.6rem 0.85rem;
          font-weight: 700; color: var(--color-primary, #0A3D3A);
        }
        .magi-input {
          flex: 1; font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0 0.5rem 0.5rem 0; background: #fff;
          color: var(--color-primary, #0A3D3A);
          transition: border-color 0.2s;
        }
        .magi-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .magi-input--error { border-color: var(--color-error, #c0392b); }
        .magi-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .magi-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .magi-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
        }
        .magi-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .magi-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .magi-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .magi-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .magi-results { margin-top: 2rem; }
        .magi-card { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 0.875rem; padding: 1.75rem; margin-bottom: 1rem; }
        .magi-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d; background: #dcfce7; border-radius: 9999px; padding: 0.25rem 0.75rem; display: inline-block; margin-bottom: 1rem; }

        .magi-primary-stat { margin-bottom: 1.25rem; }
        .magi-stat-val { font-size: 2.6rem; font-weight: 800; color: var(--color-primary, #0A3D3A); display: block; line-height: 1; }
        .magi-stat-lbl { font-size: 0.9rem; color: #166534; margin-top: 0.3rem; display: block; }

        .magi-table-box { background: #fff; border-radius: 0.5rem; border: 1px solid #bbf7d0; overflow: hidden; margin-bottom: 1.5rem; }
        .magi-t-row { display: flex; justify-content: space-between; padding: 0.65rem 1rem; font-size: 0.95rem; border-bottom: 1px solid #bbf7d0; gap: 1rem; }
        .magi-t-row:last-child { border-bottom: none; }
        .magi-t-row--add { background: #f7fee7; color: #365314; }
        .magi-t-row--total { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 700; font-size: 1rem; }

        /* Handoff CTA */
        .magi-handoff-box {
          background: #fff; border: 2px solid var(--color-secondary, #C9933A);
          border-radius: 0.75rem; padding: 1.25rem;
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .magi-handoff-content h4 { font-size: 1.05rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.25rem; }
        .magi-handoff-content p { font-size: 0.9rem; color: var(--color-text-muted, #64748b); margin: 0; max-width: 50ch; }
        .magi-btn--cta {
          background: var(--color-secondary, #C9933A); color: #fff;
          font-weight: 700; text-decoration: none; padding: 0.75rem 1.25rem;
          border-radius: 0.5rem; transition: background 0.2s; white-space: nowrap;
        }
        .magi-btn--cta:hover { background: #b27f2e; }

        .magi-work-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.875rem; color: var(--color-secondary, #C9933A);
          text-decoration: underline; padding: 0.25rem 0; display: block; margin-bottom: 1rem;
        }
        .magi-work-box { background: #f8fafc; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 1rem; }
        .magi-work-box h4 { font-size: 0.95rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.5rem; }
        .magi-work-box p { font-size: 0.9rem; line-height: 1.5; color: var(--color-text-muted, #64748b); margin: 0 0 0.75rem; }
        .magi-code { background: #0f172a; color: #38bdf8; padding: 0.75rem 1rem; border-radius: 0.375rem; font-size: 0.85rem; overflow-x: auto; white-width: 100%; }
        .magi-work-source { font-size: 0.8rem; color: var(--color-text-muted, #64748b); margin: 0.5rem 0 0; }
        .magi-work-source a { color: var(--color-secondary, #C9933A); }

        @media (max-width: 640px) {
          .magi-input-addon { max-width: 100%; }
          .magi-stat-val { font-size: 2.1rem; }
          .magi-t-row { flex-direction: column; align-items: flex-start; gap: 0.2rem; }
          .magi-handoff-box { flex-direction: column; align-items: flex-start; }
          .magi-btn--cta { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  );
};
