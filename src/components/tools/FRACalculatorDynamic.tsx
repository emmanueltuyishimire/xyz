import React, { useState, useId } from 'react';

/**
 * FRACalculatorDynamic.tsx
 * Full Retirement Age (FRA) Calculator (Dynamic Birthdate Input)
 * Primary keyword: full retirement age calculator
 *
 * SSA Official Rules:
 *  - 1943–1954: FRA = 66 yrs
 *  - 1955: FRA = 66 yrs + 2 mos
 *  - 1956: FRA = 66 yrs + 4 mos
 *  - 1957: FRA = 66 yrs + 6 mos
 *  - 1958: FRA = 66 yrs + 8 mos
 *  - 1959: FRA = 66 yrs + 10 mos
 *  - 1960+: FRA = 67 yrs
 *
 * Note on SSA 1st-of-month rule: Individuals born on the 1st of a month are considered by SSA to have been born in the previous month.
 */

interface FRADetail {
  fraYears: number;
  fraMonths: number;
  totalFraMonths: number;
  benefitAt62Pct: number;
  benefitAtFraPct: number;
  benefitAt70Pct: number;
}

export function getSSAFRA(birthYear: number): FRADetail {
  if (birthYear <= 1937) {
    return { fraYears: 65, fraMonths: 0, totalFraMonths: 780, benefitAt62Pct: 80.0, benefitAtFraPct: 100.0, benefitAt70Pct: 132.5 };
  } else if (birthYear === 1938) {
    return { fraYears: 65, fraMonths: 2, totalFraMonths: 782, benefitAt62Pct: 79.2, benefitAtFraPct: 100.0, benefitAt70Pct: 132.5 };
  } else if (birthYear === 1939) {
    return { fraYears: 65, fraMonths: 4, totalFraMonths: 784, benefitAt62Pct: 78.3, benefitAtFraPct: 100.0, benefitAt70Pct: 132.5 };
  } else if (birthYear === 1940) {
    return { fraYears: 65, fraMonths: 6, totalFraMonths: 786, benefitAt62Pct: 77.5, benefitAtFraPct: 100.0, benefitAt70Pct: 132.5 };
  } else if (birthYear === 1941) {
    return { fraYears: 65, fraMonths: 8, totalFraMonths: 788, benefitAt62Pct: 76.7, benefitAtFraPct: 100.0, benefitAt70Pct: 132.5 };
  } else if (birthYear === 1942) {
    return { fraYears: 65, fraMonths: 10, totalFraMonths: 790, benefitAt62Pct: 75.8, benefitAtFraPct: 100.0, benefitAt70Pct: 132.5 };
  } else if (birthYear >= 1943 && birthYear <= 1954) {
    return { fraYears: 66, fraMonths: 0, totalFraMonths: 792, benefitAt62Pct: 75.0, benefitAtFraPct: 100.0, benefitAt70Pct: 132.0 };
  } else if (birthYear === 1955) {
    return { fraYears: 66, fraMonths: 2, totalFraMonths: 794, benefitAt62Pct: 74.2, benefitAtFraPct: 100.0, benefitAt70Pct: 130.7 };
  } else if (birthYear === 1956) {
    return { fraYears: 66, fraMonths: 4, totalFraMonths: 796, benefitAt62Pct: 73.3, benefitAtFraPct: 100.0, benefitAt70Pct: 129.3 };
  } else if (birthYear === 1957) {
    return { fraYears: 66, fraMonths: 6, totalFraMonths: 798, benefitAt62Pct: 72.5, benefitAtFraPct: 100.0, benefitAt70Pct: 128.0 };
  } else if (birthYear === 1958) {
    return { fraYears: 66, fraMonths: 8, totalFraMonths: 800, benefitAt62Pct: 71.7, benefitAtFraPct: 100.0, benefitAt70Pct: 126.7 };
  } else if (birthYear === 1959) {
    return { fraYears: 66, fraMonths: 10, totalFraMonths: 802, benefitAt62Pct: 70.8, benefitAtFraPct: 100.0, benefitAt70Pct: 125.3 };
  } else {
    // 1960 or later
    return { fraYears: 67, fraMonths: 0, totalFraMonths: 804, benefitAt62Pct: 70.0, benefitAtFraPct: 100.0, benefitAt70Pct: 124.0 };
  }
}

interface FRAResult {
  dobStr: string;
  actualBirthYear: number;
  ssaEffectiveBirthYear: number;
  isFirstOfMonth: boolean;
  fraYears: number;
  fraMonths: number;
  fraExactDateStr: string;
  age62DateStr: string;
  age70DateStr: string;
  benefitAt62Pct: number;
  benefitAtFraPct: number;
  benefitAt70Pct: number;
  monthsUntilFra: number;
  hasReachedFra: boolean;
}

export const FRACalculatorDynamic: React.FC = () => {
  const uid = useId();

  const [dob, setDob]                 = useState<string>('');
  const [result, setResult]           = useState<FRAResult | null>(null);
  const [error, setError]             = useState<string>('');
  const [showTable, setShowTable]     = useState<boolean>(true);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dob) {
      setError('Please enter your exact date of birth.');
      setResult(null);
      return;
    }

    const [yStr, mStr, dStr] = dob.split('-').map(Number);
    if (!yStr || !mStr || !dStr) {
      setError('Please select a valid date of birth.');
      setResult(null);
      return;
    }

    setError('');

    // SSA 1st-of-month rule: Born on 1st of month -> SSA treats as born in previous month
    const isFirstOfMonth = dStr === 1;
    let ssaYear = yStr;
    let ssaMonth = mStr;

    if (isFirstOfMonth) {
      if (mStr === 1) {
        ssaMonth = 12;
        ssaYear = yStr - 1;
      } else {
        ssaMonth = mStr - 1;
      }
    }

    const fraInfo = getSSAFRA(ssaYear);

    // Calculate exact calendar date of reaching FRA
    // Add fraYears and fraMonths to birth month/year
    const birthDateObj = new Date(yStr, mStr - 1, dStr);
    const fraDateObj = new Date(yStr + fraInfo.fraYears, (mStr - 1) + fraInfo.fraMonths, isFirstOfMonth ? 1 : dStr);

    const age62DateObj = new Date(yStr + 62, mStr - 1, isFirstOfMonth ? 1 : dStr);
    const age70DateObj = new Date(yStr + 70, mStr - 1, isFirstOfMonth ? 1 : dStr);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasReachedFra = today >= fraDateObj;

    // Months until FRA
    const totalMonthsBetween = (fraDateObj.getFullYear() - today.getFullYear()) * 12 + (fraDateObj.getMonth() - today.getMonth());
    const monthsUntilFra = Math.max(0, totalMonthsBetween);

    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    setResult({
      dobStr: birthDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      actualBirthYear: yStr,
      ssaEffectiveBirthYear: ssaYear,
      isFirstOfMonth,
      fraYears: fraInfo.fraYears,
      fraMonths: fraInfo.fraMonths,
      fraExactDateStr: formatDate(fraDateObj),
      age62DateStr: formatDate(age62DateObj),
      age70DateStr: formatDate(age70DateObj),
      benefitAt62Pct: fraInfo.benefitAt62Pct,
      benefitAtFraPct: fraInfo.benefitAtFraPct,
      benefitAt70Pct: fraInfo.benefitAt70Pct,
      monthsUntilFra,
      hasReachedFra,
    });
  };

  const handleReset = () => {
    setDob('');
    setResult(null);
    setError('');
  };

  return (
    <div className="fra-calc-wrapper">

      {/* ── Trust notice ── */}
      <div className="fra-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 100% Free &amp; Private</span>
        <span>No signup or account</span>
        <span>Instant browser calculations</span>
        <span>Data is never stored</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="Full Retirement Age Calculator Form">
        
        {/* Date of Birth Input */}
        <div className="fra-field">
          <label htmlFor={`${uid}-dob`} className="fra-label">
            Your Exact Date of Birth
            <span className="fra-required" aria-hidden="true"> *</span>
          </label>
          <p className="fra-hint" id={`${uid}-dob-hint`}>
            Select your exact birth date. Handles the SSA 1st-of-the-month rule automatically.
          </p>
          <input
            id={`${uid}-dob`}
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className={`fra-input${error ? ' fra-input--error' : ''}`}
            aria-describedby={`${uid}-dob-hint${error ? ` ${uid}-dob-err` : ''}`}
            aria-invalid={!!error}
            aria-required="true"
          />
          {error && <p id={`${uid}-dob-err`} className="fra-error" role="alert">{error}</p>}
        </div>

        {/* Actions */}
        <div className="fra-actions">
          <button type="submit" className="fra-btn fra-btn--primary">
            Calculate My Exact FRA
          </button>
          {result && (
            <button type="button" className="fra-btn fra-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Output ── */}
      {result && (
        <div className="fra-results" role="region" aria-live="polite" aria-label="Full Retirement Age Results">

          <div className="fra-card fra-card--success">
            <span className="fra-badge">Your Official Social Security FRA Result</span>

            <div className="fra-primary-stat">
              <span className="fra-stat-val">
                {result.fraYears} years {result.fraMonths > 0 ? `& ${result.fraMonths} months` : ''}
              </span>
              <span className="fra-stat-lbl">Your Full Retirement Age (FRA)</span>
            </div>

            <div className="fra-date-box">
              <div className="fra-date-item">
                <span>Exact Calendar Date Reaching FRA:</span>
                <strong>{result.fraExactDateStr}</strong>
              </div>
              <div className="fra-date-item">
                <span>Status:</span>
                <strong>
                  {result.hasReachedFra ? '✅ You have reached Full Retirement Age' : `⏳ ${result.monthsUntilFra} months until your FRA`}
                </strong>
              </div>
            </div>

            {result.isFirstOfMonth && (
              <div className="fra-rule-note">
                ℹ️ <strong>SSA 1st-of-Month Rule Applied:</strong> Because you were born on the 1st day of the month, Social Security rules treat your effective birth date as the previous month for FRA calculations.
              </div>
            )}
          </div>

          {/* Benefit Comparison Table at 62, FRA, 70 */}
          <div className="fra-compare-card">
            <div className="fra-compare-header">
              <h3>Monthly Benefit Percentage Comparison (62 vs. FRA vs. 70)</h3>
              <p>Based on claiming your primary insurance amount (PIA):</p>
            </div>

            <div className="fra-table-wrapper">
              <table className="fra-table">
                <thead>
                  <tr>
                    <th>Claiming Age</th>
                    <th>Exact Claiming Date</th>
                    <th>Monthly Benefit %</th>
                    <th>Impact on Monthly Check</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="fra-row--early">
                    <td><strong>Age 62</strong> (Earliest)</td>
                    <td>{result.age62DateStr}</td>
                    <td><strong className="fra-text-red">{result.benefitAt62Pct}%</strong> of PIA</td>
                    <td>Permanent {Math.round(100 - result.benefitAt62Pct)}% reduction</td>
                  </tr>
                  <tr className="fra-row--fra">
                    <td><strong>FRA ({result.fraYears}y {result.fraMonths}m)</strong></td>
                    <td>{result.fraExactDateStr}</td>
                    <td><strong className="fra-text-green">{result.benefitAtFraPct}%</strong> of PIA</td>
                    <td>Full 100% baseline benefit</td>
                  </tr>
                  <tr className="fra-row--late">
                    <td><strong>Age 70</strong> (Maximum)</td>
                    <td>{result.age70DateStr}</td>
                    <td><strong className="fra-text-gold">{result.benefitAt70Pct}%</strong> of PIA</td>
                    <td>Permanent +{Math.round(result.benefitAt70Pct - 100)}% delayed credit bonus</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="fra-table-footnote">
              * Assuming a baseline Full Retirement Age benefit of $2,000/mo: Age 62 = ${(2000 * (result.benefitAt62Pct / 100)).toFixed(0)}/mo | FRA = $2,000/mo | Age 70 = ${(2000 * (result.benefitAt70Pct / 100)).toFixed(0)}/mo.
            </p>
          </div>

        </div>
      )}

      <style>{`
        .fra-calc-wrapper { font-family: inherit; }

        .fra-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        .fra-field { margin-bottom: 1.5rem; }

        .fra-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .fra-required { color: var(--color-error, #c0392b); }
        .fra-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        .fra-input {
          display: block; width: 100%; max-width: 280px;
          font-size: 1.05rem; padding: 0.65rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }
        .fra-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .fra-input--error { border-color: var(--color-error, #c0392b); }
        .fra-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .fra-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .fra-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
        }
        .fra-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .fra-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .fra-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .fra-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .fra-results { margin-top: 2rem; }
        .fra-card { border-radius: 0.875rem; padding: 1.75rem; margin-bottom: 1.25rem; }
        .fra-card--success { background: #f0fdf4; border: 2px solid #22c55e; }

        .fra-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d; background: #dcfce7; border-radius: 9999px; padding: 0.25rem 0.75rem; display: inline-block; margin-bottom: 1rem; }

        .fra-primary-stat { margin-bottom: 1.25rem; }
        .fra-stat-val { font-size: 2.6rem; font-weight: 800; color: var(--color-primary, #0A3D3A); display: block; line-height: 1; }
        .fra-stat-lbl { font-size: 0.9rem; color: #166534; margin-top: 0.3rem; display: block; }

        .fra-date-box { background: #fff; border-radius: 0.5rem; border: 1px solid #bbf7d0; padding: 1rem; margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .fra-date-item { display: flex; justify-content: space-between; font-size: 0.95rem; flex-wrap: wrap; gap: 0.5rem; }
        .fra-date-item strong { color: var(--color-primary, #0A3D3A); }

        .fra-rule-note { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.85rem; color: #1e40af; }

        .fra-compare-card { background: #fff; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.875rem; padding: 1.25rem; }
        .fra-compare-header h3 { font-size: 1.05rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.25rem; }
        .fra-compare-header p { font-size: 0.85rem; color: var(--color-text-muted, #64748b); margin: 0 0 1rem; }

        .fra-table-wrapper { overflow-x: auto; margin-bottom: 0.75rem; }
        .fra-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
        .fra-table th, .fra-table td { padding: 0.65rem 0.85rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
        .fra-table th { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 600; }
        .fra-row--early { background: #fef2f2; }
        .fra-row--fra { background: #f0fdf4; }
        .fra-row--late { background: #fffbeb; }

        .fra-text-red { color: #b91c1c; }
        .fra-text-green { color: #15803d; }
        .fra-text-gold { color: #b45309; }

        .fra-table-footnote { font-size: 0.8rem; color: var(--color-text-muted, #64748b); margin: 0; }

        @media (max-width: 640px) {
          .fra-input { max-width: 100%; }
          .fra-stat-val { font-size: 2.1rem; }
          .fra-date-item { flex-direction: column; gap: 0.2rem; }
        }
      `}</style>
    </div>
  );
};
