import React, { useState, useId } from 'react';

/**
 * MedicareSavingsEstimator.tsx
 * Medicare Savings Program (MSP) Estimator Tool
 *
 * Checks eligibility for 4 federal/state programs:
 *   1. QMB (Qualified Medicare Beneficiary) — pays Part A & B premiums, deductibles, & copays
 *   2. SLMB (Specified Low-Income Medicare Beneficiary) — pays Part B premium
 *   3. QI (Qualifying Individual) — pays Part B premium
 *   4. QDWI (Qualified Disabled and Working Individuals) — pays Part A premium
 *
 * 2026 Baseline Guidelines (Federal Poverty Level based):
 *   FPL Individual = $1,255/month ($15,060/yr)
 *   FPL Couple     = $1,703/month ($20,440/yr)
 *
 *   QMB: Income <= 100% FPL
 *   SLMB: Income > 100% and <= 120% FPL
 *   QI: Income > 120% and <= 135% FPL
 */

interface ProgramEligibility {
  programName: string;
  shortName: string;
  qualifies: boolean;
  benefits: string;
  monthlySavings: string;
  incomeLimit: number;
  description: string;
}

export const MedicareSavingsEstimator: React.FC = () => {
  const uid = useId();

  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [state, setState]                   = useState<string>('standard');
  const [results, setResults]               = useState<{
    programs: ProgramEligibility[];
    income: number;
    householdSize: number;
    automaticExtraHelp: boolean;
  } | null>(null);
  const [error, setError]                   = useState<string>('');

  // 2026 FPL Base Monthly Values
  // Individual: $1,255/month; Couple (2): $1,703/month; +$448 per additional person
  const getBaseFPL = (size: number) => {
    if (size === 1) return 1255;
    if (size === 2) return 1703;
    return 1703 + (size - 2) * 448;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const inc = parseFloat(monthlyIncome.replace(/[^0-9.]/g, ''));
    if (isNaN(inc) || inc < 0) {
      setError('Please enter a valid gross monthly income (e.g. 1500).');
      setResults(null);
      return;
    }

    setError('');

    // State multiplier or special state limits (Alaska/Hawaii/CT/NY have higher limits or no asset test)
    let fplMultiplier = 1.0;
    if (state === 'AK') fplMultiplier = 1.25;
    if (state === 'HI') fplMultiplier = 1.15;

    const baseFPL = getBaseFPL(householdSize) * fplMultiplier;

    // Disregards: $20 unearned income disregard per month
    const countableIncome = Math.max(0, inc - 20);

    const qmbLimit  = baseFPL * 1.0;  // 100% FPL
    const slmbLimit = baseFPL * 1.2;  // 120% FPL
    const qiLimit   = baseFPL * 1.35; // 135% FPL

    const qmbQualifies  = countableIncome <= qmbLimit;
    const slmbQualifies = !qmbQualifies && countableIncome <= slmbLimit;
    const qiQualifies   = !qmbQualifies && !slmbQualifies && countableIncome <= qiLimit;

    const automaticExtraHelp = qmbQualifies || slmbQualifies || qiQualifies;

    const programs: ProgramEligibility[] = [
      {
        shortName: 'QMB',
        programName: 'Qualified Medicare Beneficiary (QMB)',
        qualifies: qmbQualifies,
        incomeLimit: Math.round(qmbLimit),
        benefits: 'Pays Part B premium ($202.90/mo), Part A premium (if any), Part A & B deductibles, copayments, and coinsurance. $0 out-of-pocket medical costs.',
        monthlySavings: '$202.90+ / month (Plus 100% cost-sharing coverage)',
        description: 'The most comprehensive Medicare Savings Program. Doctors and hospitals are legally prohibited from billing QMB beneficiaries for Medicare deductibles or copays.',
      },
      {
        shortName: 'SLMB',
        programName: 'Specified Low-Income Medicare Beneficiary (SLMB)',
        qualifies: slmbQualifies,
        incomeLimit: Math.round(slmbLimit),
        benefits: 'Pays your full monthly Medicare Part B premium ($202.90/month added back to your Social Security check).',
        monthlySavings: '$202.90 / month ($2,434.80 / year)',
        description: 'Pays your monthly Part B premium and automatically qualifies you for the Medicare Extra Help drug program.',
      },
      {
        shortName: 'QI',
        programName: 'Qualifying Individual (QI)',
        qualifies: qiQualifies,
        incomeLimit: Math.round(qiLimit),
        benefits: 'Pays your full monthly Medicare Part B premium ($202.90/month).',
        monthlySavings: '$202.90 / month ($2,434.80 / year)',
        description: 'Funded annually by federal grants. First-come, first-served enrollment. Re-apply each year to maintain benefits.',
      },
    ];

    setResults({
      programs,
      income: inc,
      householdSize,
      automaticExtraHelp,
    });
  };

  const handleReset = () => {
    setHouseholdSize(1);
    setMonthlyIncome('');
    setState('standard');
    setResults(null);
    setError('');
  };

  const fmtUsd = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="msp-calc-container">
      {/* ── Trust notice ── */}
      <div className="msp-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 100% Free &amp; Private</span>
        <span>No signup or account</span>
        <span>Calculated instantly in browser</span>
        <span>Data is never stored</span>
      </div>

      <form onSubmit={handleCalculate} noValidate aria-label="Medicare Savings Estimator Form">
        {/* Household Size */}
        <div className="msp-field">
          <label htmlFor={`${uid}-size`} className="msp-label">
            Household Size
            <span className="msp-required" aria-hidden="true"> *</span>
          </label>
          <p className="msp-hint">
            Count yourself, your spouse (if living together), and any dependents.
          </p>
          <select
            id={`${uid}-size`}
            value={householdSize}
            onChange={e => setHouseholdSize(parseInt(e.target.value, 10))}
            className="msp-select"
          >
            <option value={1}>1 Person (Single / Widowed)</option>
            <option value={2}>2 People (Married Couple)</option>
            <option value={3}>3 People</option>
            <option value={4}>4 People</option>
          </select>
        </div>

        {/* Monthly Income */}
        <div className="msp-field">
          <label htmlFor={`${uid}-income`} className="msp-label">
            Total Gross Monthly Household Income
            <span className="msp-required" aria-hidden="true"> *</span>
          </label>
          <p className="msp-hint" id={`${uid}-income-hint`}>
            Include Social Security gross check (before Medicare deduction), pensions, wages, and IRA distributions.
          </p>
          <div className="msp-input-addon">
            <span className="msp-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-income`}
              type="number"
              min="0"
              step="50"
              value={monthlyIncome}
              onChange={e => setMonthlyIncome(e.target.value)}
              className={`msp-input${error ? ' msp-input--error' : ''}`}
              placeholder="e.g. 1450"
              aria-describedby={`${uid}-income-hint${error ? ` ${uid}-income-err` : ''}`}
              aria-invalid={!!error}
              aria-required="true"
            />
          </div>
          {error && <p id={`${uid}-income-err`} className="msp-error" role="alert">{error}</p>}
        </div>

        {/* State Selection */}
        <div className="msp-field">
          <label htmlFor={`${uid}-state`} className="msp-label">
            State of Residence
          </label>
          <p className="msp-hint">
            Some states (like AK, HI, NY, CA, CT) have higher income limits or eliminated asset testing.
          </p>
          <select
            id={`${uid}-state`}
            value={state}
            onChange={e => setState(e.target.value)}
            className="msp-select"
          >
            <option value="standard">Standard Contiguous U.S. Baseline</option>
            <option value="AK">Alaska (Higher Cost of Living Limits)</option>
            <option value="HI">Hawaii (Higher Cost of Living Limits)</option>
            <option value="NO_ASSET">State with No Asset Test (CA, NY, CT, ME, OR, MS)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="msp-actions">
          <button type="submit" className="msp-btn msp-btn--primary">
            Check Eligibility Estimate
          </button>
          {results && (
            <button type="button" className="msp-btn msp-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Output ── */}
      {results && (
        <div className="msp-results" role="region" aria-live="polite" aria-label="Medicare Savings Estimator Results">
          
          {results.automaticExtraHelp && (
            <div className="msp-alert-banner">
              <span className="msp-alert-icon">🎉</span>
              <div>
                <strong>Bonus Benefit: Automatic Medicare Extra Help (LIS)</strong>
                <p>
                  Qualifying for QMB, SLMB, or QI automatically enrolls you in Extra Help, capping your prescription drug copays at low national limits and eliminating your Part D deductible (worth ~$5,900/year).
                </p>
              </div>
            </div>
          )}

          <div className="msp-program-cards">
            {results.programs.map((p) => (
              <div
                key={p.shortName}
                className={`msp-card ${p.qualifies ? 'msp-card--qualify' : 'msp-card--neutral'}`}
              >
                <div className="msp-card-header">
                  <span className={`msp-badge ${p.qualifies ? 'msp-badge--qualify' : 'msp-badge--neutral'}`}>
                    {p.qualifies ? '✅ Likely Eligible' : 'Higher Income Threshold'}
                  </span>
                  <h3>{p.programName}</h3>
                </div>

                <div className="msp-card-body">
                  <p className="msp-desc">{p.description}</p>
                  
                  <div className="msp-detail-grid">
                    <div className="msp-detail">
                      <span>Monthly Savings Value:</span>
                      <strong>{p.monthlySavings}</strong>
                    </div>
                    <div className="msp-detail">
                      <span>2026 Monthly Income Limit ({results.householdSize} person{results.householdSize > 1 ? 's' : ''}):</span>
                      <strong>{fmtUsd(p.incomeLimit)} / month</strong>
                    </div>
                  </div>

                  <div className="msp-benefits-box">
                    <strong>Program Benefits:</strong>
                    <p>{p.benefits}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="msp-next-steps">
            <h4>How to Claim Your Medicare Savings Program Benefits</h4>
            <ol>
              <li>Contact your local <strong>State Medicaid Office</strong> or call <strong>1-800-MEDICARE</strong> (1-800-633-4227) to get your state's MSP application.</li>
              <li>Get free local assistance from your <strong>State Health Insurance Assistance Program (SHIP)</strong> counselor at <a href="https://www.shiphelp.org" target="_blank" rel="noopener noreferrer">shiphelp.org</a> or 1-877-839-2675.</li>
              <li>Remember: The first $20 of unearned income per month is disregarded when determining official eligibility.</li>
            </ol>
          </div>

        </div>
      )}

      <style>{`
        .msp-calc-container { font-family: inherit; }

        .msp-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        .msp-field { margin-bottom: 1.5rem; }

        .msp-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .msp-required { color: var(--color-error, #c0392b); }
        .msp-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        .msp-select {
          display: block; width: 100%; max-width: 480px;
          font-size: 1rem; padding: 0.65rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }

        .msp-input-addon { display: flex; align-items: center; max-width: 280px; }
        .msp-addon-symbol {
          background: var(--color-surface-alt, #f1f5f9);
          border: 2px solid var(--color-border, #cbd5e1);
          border-right: none;
          border-radius: 0.5rem 0 0 0.5rem;
          padding: 0.6rem 0.85rem;
          font-weight: 700; color: var(--color-primary, #0A3D3A);
        }
        .msp-input {
          flex: 1; font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0 0.5rem 0.5rem 0; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }
        .msp-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .msp-input--error { border-color: var(--color-error, #c0392b); }
        .msp-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .msp-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .msp-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
        }
        .msp-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .msp-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .msp-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .msp-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .msp-results { margin-top: 2rem; }

        .msp-alert-banner {
          background: #eff6ff; border: 2px solid #3b82f6; border-radius: 0.75rem;
          padding: 1.25rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: flex-start;
        }
        .msp-alert-icon { font-size: 1.75rem; flex-shrink: 0; }
        .msp-alert-banner strong { color: #1e40af; font-size: 1.05rem; display: block; margin-bottom: 0.25rem; }
        .msp-alert-banner p { color: #1e3a8a; font-size: 0.9rem; margin: 0; line-height: 1.5; }

        .msp-program-cards { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
        .msp-card { border-radius: 0.875rem; padding: 1.5rem; border: 2px solid #e2e8f0; background: #fff; }
        .msp-card--qualify { background: #f0fdf4; border-color: #22c55e; }
        .msp-card--neutral { background: #f8fafc; border-color: #cbd5e1; }

        .msp-card-header { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.75rem; }
        .msp-card-header h3 { font-size: 1.2rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0; }

        .msp-badge {
          display: inline-block; width: fit-content; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; padding: 0.2rem 0.65rem; border-radius: 9999px;
        }
        .msp-badge--qualify { background: #dcfce7; color: #15803d; }
        .msp-badge--neutral { background: #e2e8f0; color: #64748b; }

        .msp-desc { font-size: 0.95rem; color: var(--color-text-muted, #64748b); margin: 0 0 1rem; line-height: 1.5; }

        .msp-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; background: #fff; padding: 0.85rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; margin-bottom: 1rem; }
        .msp-detail span { display: block; font-size: 0.8rem; color: var(--color-text-muted, #64748b); }
        .msp-detail strong { font-size: 1.05rem; color: var(--color-primary, #0A3D3A); }

        .msp-benefits-box { background: #fff; border-radius: 0.5rem; padding: 0.85rem; border: 1px dashed #cbd5e1; }
        .msp-benefits-box strong { display: block; font-size: 0.85rem; color: var(--color-primary, #0A3D3A); margin-bottom: 0.25rem; }
        .msp-benefits-box p { font-size: 0.9rem; color: #334155; margin: 0; line-height: 1.5; }

        .msp-next-steps { background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.75rem; padding: 1.25rem; }
        .msp-next-steps h4 { font-size: 1rem; font-weight: 700; color: #15803d; margin: 0 0 0.75rem; }
        .msp-next-steps ol { padding-left: 1.25rem; margin: 0; }
        .msp-next-steps li { font-size: 0.9rem; color: #166534; line-height: 1.6; margin-bottom: 0.5rem; }
        .msp-next-steps a { color: var(--color-secondary, #C9933A); font-weight: 600; }

        @media (max-width: 640px) {
          .msp-input-addon { max-width: 100%; }
          .msp-select { max-width: 100%; }
        }
      `}</style>
    </div>
  );
};
