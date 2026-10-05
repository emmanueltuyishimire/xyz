import React, { useState, useId } from 'react';

const ALL_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois',
  'Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
  'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota',
  'Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
  'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming',
];

/* ── 2026 Verified CMS Figures ── */
const INDIVIDUAL_LIMIT = 2_000;
const COUPLE_BOTH_LIMIT = 3_000;
const CSRA_MIN = 32_532;
const CSRA_MAX = 162_660;

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

interface ResultData {
  spendDown: number;
  assetLimit: number;
  csraProtected?: number;
  applicantKeeps?: number;
  lookBackMonths: number;
  lookBackStart?: string;
  isCalifornia: boolean;
  applicationType: string;
}

export function MedicaidSpendDownCalculator() {
  const idPrefix = useId();

  const [appType, setAppType] = useState<string>('individual');
  const [assets, setAssets] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [careMonth, setCareMonth] = useState<string>('');
  const [careYear, setCareYear] = useState<string>('');
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  const handleCalculate = () => {
    const totalAssets = parseFloat(assets) || 0;
    const isCalifornia = state === 'California';
    const lookBackMonths = isCalifornia ? 30 : 60;

    let spendDown = 0;
    let assetLimit = INDIVIDUAL_LIMIT;
    let csraProtected: number | undefined;
    let applicantKeeps: number | undefined;

    if (appType === 'individual') {
      assetLimit = INDIVIDUAL_LIMIT;
      spendDown = Math.max(0, totalAssets - INDIVIDUAL_LIMIT);
    } else if (appType === 'married-one') {
      csraProtected = Math.min(CSRA_MAX, Math.max(CSRA_MIN, Math.floor(totalAssets / 2)));
      applicantKeeps = INDIVIDUAL_LIMIT;
      assetLimit = csraProtected + applicantKeeps;
      spendDown = Math.max(0, totalAssets - assetLimit);
    } else {
      assetLimit = COUPLE_BOTH_LIMIT;
      spendDown = Math.max(0, totalAssets - COUPLE_BOTH_LIMIT);
    }

    let lookBackStart: string | undefined;
    if (careMonth && careYear) {
      const cm = parseInt(careMonth, 10);
      const cy = parseInt(careYear, 10);
      if (!isNaN(cm) && !isNaN(cy)) {
        const d = new Date(cy, cm - 1, 1);
        d.setMonth(d.getMonth() - lookBackMonths);
        lookBackStart = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }

    setResult({
      spendDown,
      assetLimit,
      csraProtected,
      applicantKeeps,
      lookBackMonths,
      lookBackStart,
      isCalifornia,
      applicationType: appType,
    });
    setCalculated(true);
  };

  const handleReset = () => {
    setAppType('individual');
    setAssets('');
    setState('');
    setCareMonth('');
    setCareYear('');
    setCalculated(false);
    setResult(null);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  return (
    <div className="msd-calc-shell">
      {/* ── INPUTS ── */}
      {!calculated && (
        <div className="msd-inputs">

          {/* Application Type */}
          <div className="msd-field">
            <label className="msd-label" id={`${idPrefix}-type-label`}>
              Who Is Applying for Medicaid?
            </label>
            <div className="msd-radio-group" role="radiogroup" aria-labelledby={`${idPrefix}-type-label`}>
              <label className={`msd-radio-option ${appType === 'individual' ? 'msd-radio-selected' : ''}`}>
                <input type="radio" name="msd-type" value="individual" checked={appType === 'individual'} onChange={() => setAppType('individual')} />
                <span className="msd-radio-text">
                  <strong>Individual</strong>
                  <span className="msd-radio-desc">Single person or applying alone</span>
                </span>
              </label>
              <label className={`msd-radio-option ${appType === 'married-one' ? 'msd-radio-selected' : ''}`}>
                <input type="radio" name="msd-type" value="married-one" checked={appType === 'married-one'} onChange={() => setAppType('married-one')} />
                <span className="msd-radio-text">
                  <strong>Married — One Spouse Needs Care</strong>
                  <span className="msd-radio-desc">CSRA protects the community spouse's share</span>
                </span>
              </label>
              <label className={`msd-radio-option ${appType === 'married-both' ? 'msd-radio-selected' : ''}`}>
                <input type="radio" name="msd-type" value="married-both" checked={appType === 'married-both'} onChange={() => setAppType('married-both')} />
                <span className="msd-radio-text">
                  <strong>Married — Both Spouses Need Care</strong>
                  <span className="msd-radio-desc">Combined limit of $3,000 applies</span>
                </span>
              </label>
            </div>
          </div>

          {/* Total Countable Assets */}
          <div className="msd-field">
            <label htmlFor={`${idPrefix}-assets`} className="msd-label">
              Total Countable Assets
              <span className="msd-label-hint"> — combined, if married</span>
            </label>
            <div className="msd-input-wrap">
              <span className="msd-dollar" aria-hidden="true">$</span>
              <input
                type="number"
                id={`${idPrefix}-assets`}
                className="msd-number-input"
                value={assets}
                onChange={(e) => setAssets(e.target.value)}
                placeholder="0"
                min={0}
                max={9999999}
                inputMode="numeric"
                aria-describedby={`${idPrefix}-assets-hint`}
              />
            </div>
            <p id={`${idPrefix}-assets-hint`} className="msd-hint">
              <strong>Include:</strong> checking, savings, CDs, stocks, bonds, second properties, cash value of life insurance over $1,500.
              <br />
              <strong>Do NOT include:</strong> your primary home (if spouse or dependent lives there), one vehicle, household belongings, prepaid burial arrangements, or life insurance face value under $1,500.
              <br />
              <span className="msd-hint-link">Already checked eligibility? Start with our <a href="/tools/medicaid-eligibility-calculator/">Medicaid Eligibility Calculator</a> first.</span>
            </p>
          </div>

          {/* State */}
          <div className="msd-field">
            <label htmlFor={`${idPrefix}-state`} className="msd-label">
              Your State
              <span className="msd-label-hint"> — affects look-back period</span>
            </label>
            <select
              id={`${idPrefix}-state`}
              className="msd-select"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">— Select your state —</option>
              {ALL_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="msd-hint">California uses a 30-month look-back period. All other states use 60 months.</p>
          </div>

          {/* Expected Care Date (optional) */}
          <div className="msd-field">
            <label className="msd-label">
              When Might Care Be Needed?
              <span className="msd-label-hint"> — optional, helps frame your look-back window</span>
            </label>
            <div className="msd-date-row">
              <select
                className="msd-select msd-select-half"
                value={careMonth}
                onChange={(e) => setCareMonth(e.target.value)}
                aria-label="Month care may be needed"
              >
                <option value="">Month</option>
                {months.map((m, i) => (
                  <option key={m} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              <select
                className="msd-select msd-select-half"
                value={careYear}
                onChange={(e) => setCareYear(e.target.value)}
                aria-label="Year care may be needed"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
            <p className="msd-hint">The look-back period is measured from your actual Medicaid application date, which may differ from when care begins. This gives you an approximate window only.</p>
          </div>

          {/* Calculate Button */}
          <button type="button" className="msd-calc-btn" onClick={handleCalculate}>
            Estimate My Spend-Down — Free
          </button>
        </div>
      )}

      {/* ── RESULTS ── */}
      {calculated && result && (
        <div className="msd-results" role="region" aria-live="polite" aria-label="Spend-Down Result">

          {/* Primary Result */}
          <div className={`msd-result-badge ${result.spendDown > 0 ? 'msd-result-over' : 'msd-result-under'}`}>
            <span className="msd-result-label">
              {result.spendDown > 0 ? 'Estimated Amount Over the Limit' : 'Your Estimated Status'}
            </span>
            <p className="msd-result-number">
              {result.spendDown > 0 ? fmt(result.spendDown) : 'At or Below the Asset Limit'}
            </p>
            {result.spendDown > 0 && (
              <p className="msd-result-sub">
                Your countable assets exceed the Medicaid asset limit by this amount. This is the estimated gap that would need to be addressed before Medicaid covers long-term care costs.
              </p>
            )}
            {result.spendDown === 0 && (
              <p className="msd-result-sub">
                Based on the numbers entered, your countable assets are at or below the applicable Medicaid asset limit. You may want to confirm with your <a href="https://www.usa.gov/medicaid-chip-insurance" target="_blank" rel="noopener noreferrer">state Medicaid office</a>.
              </p>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="msd-breakdown">
            <table className="msd-table" aria-label="Spend-down calculation breakdown">
              <thead>
                <tr>
                  <th>What We Calculated</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Your total countable assets</td>
                  <td>{fmt(parseFloat(assets) || 0)}</td>
                </tr>
                {result.applicationType === 'married-one' && result.csraProtected !== undefined && (
                  <>
                    <tr className="msd-row-highlight">
                      <td>
                        Community spouse's protected share (CSRA)
                        <span className="msd-table-note">Half of combined assets, within the ${CSRA_MIN.toLocaleString()}–${CSRA_MAX.toLocaleString()} federal range</span>
                      </td>
                      <td>{fmt(result.csraProtected)}</td>
                    </tr>
                    <tr>
                      <td>Applicant spouse keeps</td>
                      <td>{fmt(INDIVIDUAL_LIMIT)}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td>
                    {result.applicationType === 'individual' && 'Individual asset limit'}
                    {result.applicationType === 'married-one' && 'Combined protected total (CSRA + applicant allowance)'}
                    {result.applicationType === 'married-both' && 'Married couple asset limit (both need care)'}
                  </td>
                  <td>{fmt(result.assetLimit)}</td>
                </tr>
                <tr className={result.spendDown > 0 ? 'msd-row-result' : 'msd-row-result-ok'}>
                  <td><strong>Estimated spend-down amount</strong></td>
                  <td><strong>{fmt(result.spendDown)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Look-Back Window */}
          <div className="msd-lookback-card">
            <p className="msd-lookback-title">
              <span className="msd-lookback-icon" aria-hidden="true">📅</span>
              {result.isCalifornia ? '30-Month' : '60-Month'} Look-Back Period
            </p>
            <p className="msd-lookback-text">
              {result.isCalifornia
                ? 'California reinstated asset limits and a 30-month look-back period for long-term care Medi-Cal as of January 1, 2026. Asset transfers made between January 1, 2024, and December 31, 2025, are excluded from this review. Only transfers on or after January 1, 2026, can trigger a penalty.'
                : `Medicaid will review all asset transfers — gifts, property transfers, assets sold below fair market value — made within the ${result.lookBackMonths} months before the application date. Transfers that appear to have been made to qualify for Medicaid can result in a penalty period during which Medicaid will not cover care costs.`
              }
            </p>
            {result.lookBackStart && (
              <p className="msd-lookback-date">
                If you apply around the date entered, your look-back window would begin approximately <strong>{result.lookBackStart}</strong>.
              </p>
            )}
            {result.isCalifornia && (
              <p className="msd-lookback-verify">
                ⚠️ California's Medi-Cal rules have changed recently. Confirm the current status directly with the <a href="https://www.dhcs.ca.gov/" target="_blank" rel="noopener noreferrer">California Department of Health Care Services (DHCS)</a> before making any decisions.
              </p>
            )}
          </div>

          {/* ── MANDATORY PROFESSIONAL REFERRAL ── */}
          <div className="msd-referral-callout" role="alert">
            <div className="msd-referral-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8761A" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="msd-referral-content">
              <p className="msd-referral-headline">This Number Shows Where You Stand</p>
              <p className="msd-referral-text">
                How to address this amount safely — without risking a Medicaid penalty period — needs a conversation with an elder-law attorney or your state's Medicaid agency. We show the numbers; the "how" requires a professional. Incorrect spend-down decisions (especially gifts to family members within the look-back window) can result in months of lost Medicaid coverage.
              </p>
              <div className="msd-referral-links">
                <a href="https://www.shiphelp.org" target="_blank" rel="noopener noreferrer" className="msd-referral-btn">
                  Find a Free SHIP Counselor →
                </a>
                <a href="/medicaid/who-qualifies-for-medicaid/" className="msd-referral-btn msd-referral-btn-alt">
                  Read Our Medicaid Guide →
                </a>
              </div>
            </div>
          </div>

          {/* Reset */}
          <button type="button" className="msd-reset-btn" onClick={handleReset}>
            ← Start Over / Change My Numbers
          </button>
        </div>
      )}
    </div>
  );
}
