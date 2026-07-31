import React, { useState, useId } from 'react';

/**
 * MedicareLateEnrollmentPenaltyCalculator.tsx
 * Strictly for Medicare Part B Late Enrollment Penalty.
 * Date-based inputs:
 *   - Date of birth (month + year dropdowns — no day needed)
 *   - Month employer/group coverage ended (if stayed on active group health plan past 65)
 *   - Month Part B coverage started
 * All calculations run client-side in the browser. Zero server calls, zero data storage.
 *
 * 2026 Official CMS Figures:
 *   Standard Part B monthly premium: $202.90
 * Source: CMS / Medicare.gov — verify and update annually.
 */

// ── 2026 CMS-verified figures ─────────────────────────────────────────────
const PART_B_PREMIUM_2026 = 202.90;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Returns a YYYY-MM string for the month that is `offsetMonths` after the given YYYY-MM */
function addMonths(ym: string, offsetMonths: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Full months between two YYYY-MM strings (positive if end > start) */
function monthsBetween(start: string, end: string): number {
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  return (ey - sy) * 12 + (em - sm);
}

/** Format YYYY-MM to "Month YYYY" */
function fmtMonth(ym: string): string {
  if (!ym) return '';
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Format number as USD */
function usd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

/** Round to nearest $0.10 as CMS does */
function roundTenCents(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Build a YYYY-MM string from month (1-12) and year */
function toYM(month: number | '', year: number | ''): string {
  if (month === '' || year === '') return '';
  return `${year}-${String(month).padStart(2, '0')}`;
}

// ── Types ─────────────────────────────────────────────────────────────────

interface CalcResult {
  iepStart: string;   // YYYY-MM — month IEP began (month person turns 65 minus 3)
  iepEnd: string;     // YYYY-MM — last month of 7-month IEP
  iepEndLabel: string;
  coverageEndMonth: string;
  partBStartMonth: string;
  
  // Part B penalty math
  partBLateTotalMonths: number;    // raw months late
  partBFullYears: number;          // full 12-month periods
  partBPenaltyPct: number;         // e.g. 20 for 20%
  partBMonthlyAdded: number;       // $ added each month
  partBYearlyAdded: number;
  partBNewTotal: number;           // standard + penalty
  partBLifetime20: number;         // 20-year total penalty cost
  
  // Status
  noPenalty: boolean;
  hadEmployerCoverage: boolean;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// ── Component ─────────────────────────────────────────────────────────────

export const MedicareLateEnrollmentPenaltyCalculator: React.FC = () => {
  const uid = useId();
  const currentYear = new Date().getFullYear();

  // Birth years: people aged 50–90 today
  const birthYears: number[] = [];
  for (let y = currentYear - 90; y <= currentYear - 50; y++) birthYears.push(y);

  // Coverage end / Part B start: past 30 years through next 5
  const dateYears: number[] = [];
  for (let y = currentYear - 30; y <= currentYear + 5; y++) dateYears.push(y);

  // DOB dropdowns
  const [dobMonth, setDobMonth] = useState<number | ''>('');
  const [dobYear,  setDobYear]  = useState<number | ''>('');

  // Employer coverage end dropdowns (optional)
  const [covMonth, setCovMonth] = useState<number | ''>('');
  const [covYear,  setCovYear]  = useState<number | ''>('');

  // Part B start dropdowns
  const [pbMonth, setPbMonth] = useState<number | ''>('');
  const [pbYear,  setPbYear]  = useState<number | ''>('');

  const [result, setResult] = useState<CalcResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWork, setShowWork] = useState(false);

  // ── Validation & Calculation ──────────────────────────────────────────

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    const dob = toYM(dobMonth, dobYear);
    const coverageEnd = toYM(covMonth, covYear);
    const partBStart = toYM(pbMonth, pbYear);

    if (!dob) errs.dob = 'Please select both your birth month and birth year.';
    if (!partBStart) errs.partBStart = 'Please select both the month and year your Part B coverage started (or will start).';

    if (Object.keys(errs).length > 0) { setErrors(errs); setResult(null); return; }
    setErrors({});

    // ── IEP: begins 3 months before 65th birthday month, ends 3 months after
    const [by, bm] = dob.split('-').map(Number);
    const birthdayMonth65 = `${by + 65}-${String(bm).padStart(2, '0')}`;
    const iepStart = addMonths(birthdayMonth65, -3);
    const iepEnd   = addMonths(birthdayMonth65, 3);   // inclusive last month of IEP

    // Part B enrollment window: IEP ends, or 8 months after active employer coverage ends
    const hadEmployerCoverage = !!coverageEnd;
    let penaltyStartMonth: string;

    if (hadEmployerCoverage) {
      // SEP: 8-month window after employer coverage ends.
      // Penalty clock starts the month after the SEP ends (9 months after coverageEnd)
      penaltyStartMonth = addMonths(coverageEnd, 9); // first month LATE
    } else {
      // No employer coverage → IEP end + 1 = first month late
      penaltyStartMonth = addMonths(iepEnd, 1);
    }

    // Months late = from penaltyStartMonth to partBStart
    const lateTotalMonths = Math.max(0, monthsBetween(penaltyStartMonth, partBStart));
    const fullYears = Math.floor(lateTotalMonths / 12);
    const penaltyPct = fullYears * 10;
    const monthlyAdded = roundTenCents((penaltyPct / 100) * PART_B_PREMIUM_2026);
    const yearlyAdded  = monthlyAdded * 12;
    const newTotal     = PART_B_PREMIUM_2026 + monthlyAdded;
    const lifetime20   = monthlyAdded * 240; // 20 years projection

    setResult({
      iepStart, iepEnd,
      iepEndLabel: fmtMonth(iepEnd),
      coverageEndMonth: coverageEnd,
      partBStartMonth: partBStart,
      partBLateTotalMonths: lateTotalMonths,
      partBFullYears: fullYears,
      partBPenaltyPct: penaltyPct,
      partBMonthlyAdded: monthlyAdded,
      partBYearlyAdded: yearlyAdded,
      partBNewTotal: newTotal,
      partBLifetime20: lifetime20,
      noPenalty: monthlyAdded === 0,
      hadEmployerCoverage,
    });
    setShowWork(false);
  };

  const reset = () => {
    setDobMonth(''); setDobYear('');
    setCovMonth(''); setCovYear('');
    setPbMonth('');  setPbYear('');
    setResult(null); setErrors({});
  };

  // ── Reusable month/year dropdown pair ────────────────────────────────────
  const MonthYearSelect = ({
    idPrefix, monthVal, yearVal, onMonthChange, onYearChange,
    years, errorKey,
  }: {
    idPrefix: string;
    monthVal: number | '';
    yearVal: number | '';
    onMonthChange: (v: number | '') => void;
    onYearChange:  (v: number | '') => void;
    years: number[];
    errorKey?: string;
  }) => (
    <div className="lep-date-grid">
      <div className="lep-date-col">
        <label htmlFor={`${uid}-${idPrefix}-month`} className="lep-date-sub-label">Month</label>
        <select
          id={`${uid}-${idPrefix}-month`}
          value={monthVal}
          onChange={e => onMonthChange(e.target.value === '' ? '' : parseInt(e.target.value))}
          className={`lep-select${errorKey && errors[errorKey] ? ' lep-input--error' : ''}`}
        >
          <option value="">-- Month --</option>
          {MONTH_NAMES.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
      </div>
      <div className="lep-date-col">
        <label htmlFor={`${uid}-${idPrefix}-year`} className="lep-date-sub-label">Year</label>
        <select
          id={`${uid}-${idPrefix}-year`}
          value={yearVal}
          onChange={e => onYearChange(e.target.value === '' ? '' : parseInt(e.target.value))}
          className={`lep-select${errorKey && errors[errorKey] ? ' lep-input--error' : ''}`}
        >
          <option value="">-- Year --</option>
          {[...years].reverse().map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="lep-calc">

      {/* ── Trust badge ── */}
      <div className="lep-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 Free &amp; private</span>
        <span>No signup required</span>
        <span>Calculated instantly in your browser</span>
        <span>No data collected</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="Medicare Part B Late Enrollment Penalty Calculator">

        {/* Date of birth — Month + Year dropdowns */}
        <div className="lep-field" role="group" aria-labelledby={`${uid}-dob-legend`}>
          <p id={`${uid}-dob-legend`} className="lep-label">
            Your birth month and year
            <span className="lep-required" aria-hidden="true"> *</span>
          </p>
          <p className="lep-hint" id={`${uid}-dob-hint`}>
            We only need month and year — no exact day required. This determines your 7-month Initial Enrollment Period (IEP) around your 65th birthday.
          </p>
          <MonthYearSelect
            idPrefix="dob"
            monthVal={dobMonth}
            yearVal={dobYear}
            onMonthChange={setDobMonth}
            onYearChange={setDobYear}
            years={birthYears}
            errorKey="dob"
          />
          {errors.dob && <p id={`${uid}-dob-err`} className="lep-error" role="alert">{errors.dob}</p>}
        </div>

        {/* Employer coverage end — Month + Year dropdowns (optional) */}
        <div className="lep-field" role="group" aria-labelledby={`${uid}-cov-legend`}>
          <p id={`${uid}-cov-legend`} className="lep-label">
            Month and year your active employer health coverage ended
            <span className="lep-optional-tag"> (optional)</span>
          </p>
          <p className="lep-hint" id={`${uid}-covend-hint`}>
            <strong>Leave blank if you had no employer coverage past 65.</strong> Only fill this in if you maintained active group coverage through your own (or your spouse's) current employer past age 65. COBRA and retiree insurance do NOT count.
          </p>
          <MonthYearSelect
            idPrefix="cov"
            monthVal={covMonth}
            yearVal={covYear}
            onMonthChange={setCovMonth}
            onYearChange={setCovYear}
            years={dateYears}
          />
        </div>

        {/* Part B start month — Month + Year dropdowns */}
        <div className="lep-field" role="group" aria-labelledby={`${uid}-pb-legend`}>
          <p id={`${uid}-pb-legend`} className="lep-label">
            Month and year your Medicare Part B started (or will start)
            <span className="lep-required" aria-hidden="true"> *</span>
          </p>
          <p className="lep-hint" id={`${uid}-pbstart-hint`}>
            Found on your Medicare card, or use the current month if you want to see your penalty as of today.
          </p>
          <MonthYearSelect
            idPrefix="pb"
            monthVal={pbMonth}
            yearVal={pbYear}
            onMonthChange={setPbMonth}
            onYearChange={setPbYear}
            years={dateYears}
            errorKey="partBStart"
          />
          {errors.partBStart && <p id={`${uid}-pbstart-err`} className="lep-error" role="alert">{errors.partBStart}</p>}
        </div>

        <div className="lep-actions">
          <button type="submit" className="lep-btn lep-btn--primary">
            Calculate Part B Penalty
          </button>
          {result && (
            <button type="button" className="lep-btn lep-btn--ghost" onClick={reset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results ── */}
      {result && (
        <div className="lep-results" role="region" aria-live="polite" aria-label="Medicare Part B penalty calculation results">

          {result.noPenalty ? (
            <div className="lep-result-card lep-result-card--success">
              <div className="lep-result-icon">✅</div>
              <div className="lep-result-main">
                <p className="lep-result-headline">No Part B penalty applies</p>
                <p className="lep-result-sub">
                  Based on your dates, you enrolled in Medicare Part B within your allowed enrollment window.
                  {result.hadEmployerCoverage
                    ? ' Your 8-month Special Enrollment Period (SEP) after your employer coverage ended protected you from a penalty.'
                    : ' You enrolled during your 7-month Initial Enrollment Period (IEP).'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Primary result card */}
              <div className="lep-result-card lep-result-card--warning">
                <div className="lep-result-badge">Medicare Part B Late Enrollment Penalty</div>
                <div className="lep-result-primary-row">
                  <div className="lep-result-stat">
                    <span className="lep-stat-value">{result.partBPenaltyPct}%</span>
                    <span className="lep-stat-label">Lifetime penalty surcharge</span>
                  </div>
                  <div className="lep-result-stat lep-result-stat--money">
                    <span className="lep-stat-value">{usd(result.partBMonthlyAdded)}</span>
                    <span className="lep-stat-label">added to your monthly bill</span>
                  </div>
                </div>

                {/* Part B breakdown */}
                <div className="lep-breakdown">
                  <div className="lep-breakdown-row">
                    <span>Standard 2026 Part B premium</span>
                    <span><strong>{usd(PART_B_PREMIUM_2026)}/month</strong></span>
                  </div>
                  <div className="lep-breakdown-row lep-breakdown-row--penalty">
                    <span>Your {result.partBPenaltyPct}% Part B penalty ({result.partBFullYears} full year{result.partBFullYears !== 1 ? 's' : ''} late)</span>
                    <span><strong>+ {usd(result.partBMonthlyAdded)}/month</strong></span>
                  </div>
                  <div className="lep-breakdown-row lep-breakdown-row--total">
                    <span>Your estimated total Part B monthly premium</span>
                    <span><strong>{usd(result.partBNewTotal)}/month</strong></span>
                  </div>
                </div>

                {/* Lifetime cost callout */}
                <div className="lep-lifetime">
                  <div className="lep-lifetime-row">
                    <span>Extra cost per year</span>
                    <strong>{usd(result.partBYearlyAdded)}</strong>
                  </div>
                  <div className="lep-lifetime-row">
                    <span>Estimated extra cost over 20 years</span>
                    <strong>{usd(result.partBLifetime20)}</strong>
                  </div>
                  <p className="lep-lifetime-note">
                    ⚠️ The Part B penalty is <strong>permanent for life</strong> and increases whenever the standard Part B premium goes up.
                  </p>
                </div>
              </div>

              {/* Show-my-work toggle */}
              <button
                type="button"
                className="lep-show-work-btn"
                onClick={() => setShowWork(v => !v)}
                aria-expanded={showWork}
              >
                {showWork ? '▲ Hide step-by-step math' : '▼ Show how this Part B penalty was calculated'}
              </button>

              {showWork && (
                <div className="lep-work" aria-label="Calculation details">
                  <h4>Part B Penalty Calculation Steps</h4>
                  <ol className="lep-work-list">
                    <li>
                      <strong>Initial Enrollment Period (IEP):</strong> Ran from <strong>{fmtMonth(result.iepStart)}</strong> through <strong>{result.iepEndLabel}</strong>.
                    </li>
                    {result.hadEmployerCoverage ? (
                      <li>
                        <strong>Active Employer Coverage:</strong> Ended <strong>{fmtMonth(result.coverageEndMonth)}</strong>. Your 8-month Special Enrollment Period (SEP) ran through the 8th month after. Your penalty clock started 9 months after coverage ended.
                      </li>
                    ) : (
                      <li>
                        <strong>No Employer Coverage:</strong> Your penalty clock started the month immediately after your IEP ended.
                      </li>
                    )}
                    <li>
                      <strong>Part B Start Month:</strong> <strong>{fmtMonth(result.partBStartMonth)}</strong>.
                    </li>
                    <li>
                      <strong>Total Uncovered Duration:</strong> <strong>{result.partBLateTotalMonths} months</strong>.
                    </li>
                    <li>
                      <strong>Full 12-Month Periods (CMS Rule):</strong> {result.partBLateTotalMonths} ÷ 12 = <strong>{result.partBFullYears} full year{result.partBFullYears !== 1 ? 's' : ''}</strong> (partial years do not count toward Part B penalty).
                    </li>
                    <li>
                      <strong>Penalty Percentage:</strong> {result.partBFullYears} × 10% = <strong>{result.partBPenaltyPct}%</strong>.
                    </li>
                    <li>
                      <strong>Monthly Surcharge Amount:</strong> {result.partBPenaltyPct}% × {usd(PART_B_PREMIUM_2026)} = <strong>{usd(result.partBMonthlyAdded)}</strong> (rounded to the nearest $0.10 per CMS rules).
                    </li>
                  </ol>
                  <p className="lep-work-source">
                    Source: <a href="https://www.medicare.gov/basics/costs/medicare-costs/avoid-penalties" target="_blank" rel="noopener noreferrer">Medicare.gov — Part B Late Enrollment Penalty</a>
                  </p>
                </div>
              )}

              {/* What to do next */}
              <div className="lep-next-steps">
                <h4>Options If You Face a Part B Penalty</h4>
                <ul>
                  <li>If you had active employer insurance past 65, obtain <strong>Form CMS-L564</strong> signed by your former employer to request a penalty waiver from Social Security.</li>
                  <li>Contact Social Security at <strong>1-800-772-1213</strong> to appeal a Part B penalty determination.</li>
                  <li>See if you qualify for a <strong>Medicare Savings Program (MSP)</strong> in your state — MSPs pay your Part B premium and eliminate late enrollment penalties.</li>
                </ul>
              </div>
            </>
          )}

          {/* Disclaimer inside results */}
          <div className="lep-result-disclaimer">
            <p>
              <strong>Educational estimate only.</strong> Based on standard 2026 Medicare Part B premium of ${PART_B_PREMIUM_2026}/month (<a href="https://www.medicare.gov/basics/costs/medicare-costs" target="_blank" rel="noopener noreferrer">Medicare.gov</a>). Official determinations are made exclusively by the Social Security Administration.
            </p>
          </div>
        </div>
      )}

      <style>{`
        .lep-calc { font-family: inherit; }

        /* Trust bar */
        .lep-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.8rem; color: var(--color-text-muted);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }
        .lep-trust-bar span { display: flex; align-items: center; gap: 0.25rem; }

        /* Fields */
        .lep-field { margin-bottom: 1.5rem; }

        .lep-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .lep-required { color: var(--color-error, #c0392b); }
        .lep-optional-tag { font-size: 0.8rem; font-weight: 400; color: var(--color-text-muted, #64748b); }
        .lep-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        /* Month/Year dropdown grid */
        .lep-date-grid {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
        }
        .lep-date-col { display: flex; flex-direction: column; gap: 0.25rem; }
        .lep-date-sub-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted, #64748b); }
        .lep-select {
          font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
          min-width: 130px;
          transition: border-color 0.2s;
          appearance: auto;
        }
        .lep-select:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .lep-select.lep-input--error { border-color: var(--color-error, #c0392b); }

        .lep-input {
          display: block; width: 100%; max-width: 340px;
          font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
          transition: border-color 0.2s;
        }
        .lep-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .lep-input--error { border-color: var(--color-error, #c0392b); }
        .lep-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        /* Actions */
        .lep-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.75rem; }
        .lep-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer;
          border: 2px solid transparent; transition: all 0.2s;
        }
        .lep-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .lep-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .lep-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .lep-btn--ghost:hover { border-color: var(--color-primary, #0A3D3A); color: var(--color-primary, #0A3D3A); }
        .lep-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .lep-results { margin-top: 2rem; }

        .lep-result-card {
          border-radius: 0.875rem; padding: 1.75rem;
          margin-bottom: 1rem;
        }
        .lep-result-card--success {
          background: #f0fdf4; border: 2px solid #22c55e;
          display: flex; gap: 1rem; align-items: flex-start;
        }
        .lep-result-card--warning {
          background: #fffbeb; border: 2px solid #f59e0b;
        }
        .lep-result-icon { font-size: 2rem; flex-shrink: 0; }
        .lep-result-headline { font-size: 1.25rem; font-weight: 700; color: #15803d; margin: 0 0 0.5rem; }
        .lep-result-sub { font-size: 0.95rem; color: #166534; margin: 0; max-width: 60ch; }

        .lep-result-badge {
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          color: #92400e; background: #fef3c7; border-radius: 9999px;
          padding: 0.2rem 0.75rem; display: inline-block; margin-bottom: 1rem;
        }

        .lep-result-primary-row {
          display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.25rem;
        }
        .lep-result-stat { display: flex; flex-direction: column; }
        .lep-stat-value { font-size: 2.4rem; font-weight: 800; color: var(--color-primary, #0A3D3A); line-height: 1; }
        .lep-stat-label { font-size: 0.85rem; color: var(--color-text-muted, #64748b); margin-top: 0.25rem; }
        .lep-result-stat--money .lep-stat-value { color: #b45309; }

        /* Breakdown table */
        .lep-breakdown { background: #fff; border-radius: 0.5rem; overflow: hidden; border: 1px solid #fde68a; margin-bottom: 1rem; }
        .lep-breakdown-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.6rem 1rem; font-size: 0.95rem; border-bottom: 1px solid #fde68a;
          gap: 1rem;
        }
        .lep-breakdown-row:last-child { border-bottom: none; }
        .lep-breakdown-row--penalty { background: #fff7ed; color: #92400e; }
        .lep-breakdown-row--total { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 700; }

        /* Lifetime cost */
        .lep-lifetime { background: #fff7ed; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
        .lep-lifetime-row { display: flex; justify-content: space-between; font-size: 0.95rem; padding: 0.3rem 0; gap: 1rem; }
        .lep-lifetime-note { font-size: 0.85rem; color: #92400e; margin: 0.75rem 0 0; }

        /* Show work */
        .lep-show-work-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.875rem; color: var(--color-secondary, #C9933A);
          text-decoration: underline; padding: 0.25rem 0;
          display: block; margin-bottom: 1rem;
        }
        .lep-work { background: #f8fafc; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 1rem; }
        .lep-work h4 { font-size: 0.95rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.75rem; }
        .lep-work-list { padding-left: 1.25rem; margin: 0 0 0.75rem; }
        .lep-work-list li { font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.5rem; }
        .lep-work-source { font-size: 0.8rem; color: var(--color-text-muted, #64748b); margin: 0; }
        .lep-work-source a { color: var(--color-secondary, #C9933A); }

        /* Next steps */
        .lep-next-steps { background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 1rem; }
        .lep-next-steps h4 { font-size: 0.95rem; font-weight: 700; color: #15803d; margin: 0 0 0.75rem; }
        .lep-next-steps ul { padding-left: 1.25rem; margin: 0; }
        .lep-next-steps li { font-size: 0.9rem; line-height: 1.6; margin-bottom: 0.4rem; color: #166534; }

        /* Result disclaimer */
        .lep-result-disclaimer { background: var(--color-surface-alt, #f8fafc); border-radius: 0.5rem; padding: 0.875rem 1rem; border: 1px solid var(--color-border, #e2e8f0); }
        .lep-result-disclaimer p { font-size: 0.8rem; color: var(--color-text-muted, #64748b); margin: 0; line-height: 1.5; }
        .lep-result-disclaimer a { color: var(--color-secondary, #C9933A); }

        /* Responsive */
        @media (max-width: 480px) {
          .lep-input { max-width: 100%; }
          .lep-stat-value { font-size: 1.8rem; }
          .lep-breakdown-row { flex-direction: column; align-items: flex-start; gap: 0.2rem; }
          .lep-lifetime-row { flex-direction: column; }
          .lep-result-primary-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};
