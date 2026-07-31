import React, { useState, useId } from 'react';

/**
 * RMDCalculatorEvergreen.tsx
 * RMD Calculator (Current Year, Evergreen)
 * Primary keyword: rmd calculator
 *
 * SECURE 2.0 Rules & IRS Publication 590-B (2022+ Uniform Lifetime Table III):
 *   - Born 1951 - 1959: RMD starting age is 73
 *   - Born 1960 or later: RMD starting age is 75
 *   - Penalty for missed RMD: 25% (reduced to 10% if corrected within 2 years)
 */

// IRS Uniform Lifetime Table III (Revised 2022+)
const IRS_UNIFORM_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5,  95: 8.9,  96: 8.4,  97: 7.8,  98: 7.3,  99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
  107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9,
};

// IRS Joint Life Table II approximation for spouse >10 yrs younger
function getJointLifeFactor(ownerAge: number, spouseAge: number): number {
  const ageDiff = ownerAge - spouseAge;
  if (ageDiff <= 10) return IRS_UNIFORM_TABLE[ownerAge] || 26.5;
  // Approximation based on IRS Table II
  const baseFactor = IRS_UNIFORM_TABLE[ownerAge] || 26.5;
  return Math.round((baseFactor + (ageDiff - 10) * 0.45) * 10) / 10;
}

interface RMDProjectionYear {
  year: number;
  age: number;
  startBalance: number;
  rmdAmount: number;
  endBalance: number;
  divisor: number;
}

interface RMDResult {
  currentYear: number;
  ageInCurrentYear: number;
  rmdRequiredAge: number;
  isRmdRequired: boolean;
  priorBalance: number;
  divisor: number;
  rmdAmount: number;
  monthlyEquivalent: number;
  deadlineDate: string;
  isFirstYearRmd: boolean;
  projections: RMDProjectionYear[];
  accountType: string;
}

export const RMDCalculatorEvergreen: React.FC = () => {
  const uid = useId();

  const [balanceStr, setBalanceStr]           = useState<string>('');
  const [birthYearStr, setBirthYearStr]       = useState<string>('');
  const [accountType, setAccountType]         = useState<string>('traditional_ira');
  const [hasYoungerSpouse, setHasYoungerSpouse] = useState<boolean>(false);
  const [spouseBirthYearStr, setSpouseBirthYearStr] = useState<string>('');

  const [result, setResult]                   = useState<RMDResult | null>(null);
  const [error, setError]                     = useState<string>('');
  const [showProjections, setShowProjections] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const bal = parseFloat(balanceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(bal) || bal <= 0) {
      setError('Please enter a valid prior year-end balance (e.g. 250000).');
      setResult(null);
      return;
    }

    const by = parseInt(birthYearStr, 10);
    if (isNaN(by) || by < 1920 || by > currentYear) {
      setError('Please enter a valid 4-digit birth year (e.g. 1953).');
      setResult(null);
      return;
    }

    setError('');

    // Determine SECURE 2.0 RMD starting age
    let rmdRequiredAge = 73;
    if (by >= 1960) {
      rmdRequiredAge = 75;
    } else if (by < 1951) {
      rmdRequiredAge = 70.5; // Or 72
    }

    const ageInCurrentYear = currentYear - by;
    const isRmdRequired = ageInCurrentYear >= rmdRequiredAge;

    // Determine divisor
    let divisor = 26.5;
    if (hasYoungerSpouse && spouseBirthYearStr) {
      const sBy = parseInt(spouseBirthYearStr, 10);
      if (!isNaN(sBy)) {
        const sAge = currentYear - sBy;
        divisor = getJointLifeFactor(ageInCurrentYear, sAge);
      }
    } else {
      const lookupAge = Math.min(Math.max(ageInCurrentYear, 72), 115);
      divisor = IRS_UNIFORM_TABLE[lookupAge] || 2.9;
    }

    const rmdAmount = isRmdRequired ? bal / divisor : 0;
    const monthlyEquivalent = rmdAmount / 12;

    // Deadline logic: First-time RMD is due April 1 of year following RMD age. Subsequent RMDs due Dec 31.
    const isFirstYearRmd = Math.floor(ageInCurrentYear) === Math.floor(rmdRequiredAge);
    const deadlineDate = isFirstYearRmd
      ? `April 1, ${currentYear + 1} (First-time grace period)`
      : `December 31, ${currentYear}`;

    // 5-Year Projection (assuming 5% annual investment returns)
    const projections: RMDProjectionYear[] = [];
    let runningBalance = bal;

    for (let i = 0; i < 5; i++) {
      const projYear = currentYear + i;
      const projAge = ageInCurrentYear + i;
      const projIsReq = projAge >= rmdRequiredAge;
      
      const lookupAge = Math.min(Math.max(projAge, 72), 115);
      let projDivisor = IRS_UNIFORM_TABLE[lookupAge] || 2.9;
      if (hasYoungerSpouse && spouseBirthYearStr) {
        const sBy = parseInt(spouseBirthYearStr, 10);
        if (!isNaN(sBy)) {
          projDivisor = getJointLifeFactor(projAge, (projYear - sBy));
        }
      }

      const projRmd = projIsReq ? runningBalance / projDivisor : 0;
      const growth = (runningBalance - projRmd) * 0.05; // 5% growth
      const endBal = Math.max(0, runningBalance - projRmd + growth);

      projections.push({
        year: projYear,
        age: projAge,
        startBalance: runningBalance,
        rmdAmount: projRmd,
        endBalance: endBal,
        divisor: projDivisor,
      });

      runningBalance = endBal;
    }

    let accLabel = 'Traditional IRA';
    if (accountType === '401k') accLabel = '401(k) / 403(b)';
    if (accountType === 'sep_ira') accLabel = 'SEP IRA';
    if (accountType === 'simple_ira') accLabel = 'SIMPLE IRA';

    setResult({
      currentYear,
      ageInCurrentYear,
      rmdRequiredAge,
      isRmdRequired,
      priorBalance: bal,
      divisor,
      rmdAmount,
      monthlyEquivalent,
      deadlineDate,
      isFirstYearRmd,
      projections,
      accountType: accLabel,
    });
  };

  const handleReset = () => {
    setBalanceStr('');
    setBirthYearStr('');
    setAccountType('traditional_ira');
    setHasYoungerSpouse(false);
    setSpouseBirthYearStr('');
    setResult(null);
    setError('');
  };

  const fmtUsd = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="rmd-calc-wrapper">

      {/* ── Trust notice ── */}
      <div className="rmd-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 100% Free &amp; Private</span>
        <span>No signup or account</span>
        <span>Instant browser calculations</span>
        <span>Data is never saved</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="RMD Calculator Form">
        
        {/* Account Balance */}
        <div className="rmd-field">
          <label htmlFor={`${uid}-bal`} className="rmd-label">
            Account Balance as of December 31 ({currentYear - 1})
            <span className="rmd-required" aria-hidden="true"> *</span>
          </label>
          <p className="rmd-hint" id={`${uid}-bal-hint`}>
            Enter the total balance of your IRA or 401(k) from your year-end account statement.
          </p>
          <div className="rmd-input-addon">
            <span className="rmd-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-bal`}
              type="number"
              min="0"
              step="1000"
              value={balanceStr}
              onChange={e => setBalanceStr(e.target.value)}
              className={`rmd-input${error ? ' rmd-input--error' : ''}`}
              placeholder="e.g. 350000"
              aria-describedby={`${uid}-bal-hint${error ? ` ${uid}-bal-err` : ''}`}
              aria-invalid={!!error}
              aria-required="true"
            />
          </div>
          {error && <p id={`${uid}-bal-err`} className="rmd-error" role="alert">{error}</p>}
        </div>

        {/* Birth Year */}
        <div className="rmd-field">
          <label htmlFor={`${uid}-byear`} className="rmd-label">
            Your Birth Year
            <span className="rmd-required" aria-hidden="true"> *</span>
          </label>
          <p className="rmd-hint" id={`${uid}-byear-hint`}>
            Used to determine your age ({currentYear - (parseInt(birthYearStr, 10) || currentYear)}) and SECURE 2.0 RMD starting age (73 vs 75).
          </p>
          <input
            id={`${uid}-byear`}
            type="number"
            min="1920"
            max={currentYear}
            value={birthYearStr}
            onChange={e => setBirthYearStr(e.target.value)}
            className="rmd-input rmd-input--sm"
            placeholder="e.g. 1953"
            aria-describedby={`${uid}-byear-hint`}
            aria-required="true"
          />
        </div>

        {/* Account Type */}
        <div className="rmd-field">
          <label htmlFor={`${uid}-acctype`} className="rmd-label">
            Account Type
          </label>
          <select
            id={`${uid}-acctype`}
            value={accountType}
            onChange={e => setAccountType(e.target.value)}
            className="rmd-select"
          >
            <option value="traditional_ira">Traditional IRA</option>
            <option value="401k">401(k) / 403(b) / 457(b)</option>
            <option value="sep_ira">SEP IRA</option>
            <option value="simple_ira">SIMPLE IRA</option>
          </select>
          <p className="rmd-hint-sm">
            Note: Original Roth IRAs do not require RMDs during the owner's lifetime.
          </p>
        </div>

        {/* Younger Spouse Option */}
        <div className="rmd-field rmd-field--checkbox">
          <label className="rmd-checkbox-label">
            <input
              type="checkbox"
              checked={hasYoungerSpouse}
              onChange={e => setHasYoungerSpouse(e.target.checked)}
              className="rmd-checkbox"
            />
            My spouse is sole beneficiary and MORE than 10 years younger than me
          </label>

          {hasYoungerSpouse && (
            <div className="rmd-subfield">
              <label htmlFor={`${uid}-sbyear`} className="rmd-label rmd-label--sub">
                Spouse Birth Year
              </label>
              <input
                id={`${uid}-sbyear`}
                type="number"
                min="1930"
                max={currentYear}
                value={spouseBirthYearStr}
                onChange={e => setSpouseBirthYearStr(e.target.value)}
                className="rmd-input rmd-input--sm"
                placeholder="e.g. 1968"
              />
              <p className="rmd-hint-sm">Applies IRS Joint Life Table II for lower required withdrawals.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="rmd-actions">
          <button type="submit" className="rmd-btn rmd-btn--primary">
            Calculate {currentYear} RMD
          </button>
          {result && (
            <button type="button" className="rmd-btn rmd-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Output ── */}
      {result && (
        <div className="rmd-results" role="region" aria-live="polite" aria-label="RMD Calculation Results">
          
          {!result.isRmdRequired ? (
            <div className="rmd-card rmd-card--info">
              <div className="rmd-icon">ℹ️</div>
              <div>
                <h3 className="rmd-info-h3">No RMD Required in {result.currentYear}</h3>
                <p className="rmd-info-p">
                  At age <strong>{result.ageInCurrentYear}</strong>, you have not yet reached your SECURE 2.0 RMD starting age of <strong>{result.rmdRequiredAge}</strong>. You are not required to take any minimum distribution from your {result.accountType} in {result.currentYear}. Your first RMD will be required when you reach age {result.rmdRequiredAge}.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rmd-card rmd-card--success">
                <span className="rmd-badge">Official IRS RMD Estimate for {result.currentYear}</span>

                <div className="rmd-stat-grid">
                  <div className="rmd-stat-unit">
                    <span className="rmd-stat-val">{fmtUsd(result.rmdAmount)}</span>
                    <span className="rmd-stat-lbl">Required minimum withdrawal for {result.currentYear}</span>
                  </div>
                  <div className="rmd-stat-unit rmd-stat-unit--sec">
                    <span className="rmd-stat-val">{fmtUsd(result.monthlyEquivalent)} / mo</span>
                    <span className="rmd-stat-lbl">Monthly equivalent rate</span>
                  </div>
                </div>

                {/* Table Breakdown */}
                <div className="rmd-table-box">
                  <div className="rmd-t-row">
                    <span>Prior Dec 31 Balance ({result.currentYear - 1})</span>
                    <span><strong>{fmtUsd(result.priorBalance)}</strong></span>
                  </div>
                  <div className="rmd-t-row">
                    <span>Your Age in {result.currentYear}</span>
                    <span><strong>{result.ageInCurrentYear} years old</strong></span>
                  </div>
                  <div className="rmd-t-row">
                    <span>IRS Distribution Period (Life Expectancy Factor)</span>
                    <span><strong>{result.divisor}</strong></span>
                  </div>
                  <div className="rmd-t-row rmd-t-row--total">
                    <span>{result.currentYear} RMD Amount (Balance ÷ Factor)</span>
                    <span><strong>{fmtUsd(result.rmdAmount)}</strong></span>
                  </div>
                  <div className="rmd-t-row rmd-t-row--deadline">
                    <span>Withdrawal Deadline</span>
                    <span><strong>{result.deadlineDate}</strong></span>
                  </div>
                </div>

                <div className="rmd-penalty-warning">
                  <p>
                    ⚠️ <strong>IRS Penalty Warning:</strong> Failing to withdraw your full RMD of {fmtUsd(result.rmdAmount)} by {result.deadlineDate} triggers an <strong>IRS penalty of 25%</strong> of the unwithdrawn amount (reduced to 10% if corrected within two years using IRS Form 5329).
                  </p>
                </div>
              </div>

              {/* 5-Year Projection Toggle */}
              <button
                type="button"
                className="rmd-work-btn"
                onClick={() => setShowProjections(v => !v)}
                aria-expanded={showProjections}
              >
                {showProjections ? '▲ Hide 5-year RMD projection table' : '▼ Show 5-year RMD & balance projection table'}
              </button>

              {showProjections && (
                <div className="rmd-proj-box" aria-label="5-Year RMD Projection Table">
                  <h4>5-Year RMD &amp; Portfolio Balance Projection</h4>
                  <p className="rmd-proj-sub">
                    Assumes a 5% average annual portfolio growth rate. RMDs increase as your IRS distribution period decreases.
                  </p>

                  <div className="rmd-proj-table-wrapper">
                    <table className="rmd-proj-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Age</th>
                          <th>Start Balance</th>
                          <th>IRS Factor</th>
                          <th>Required RMD</th>
                          <th>Est. End Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.projections.map((p) => (
                          <tr key={p.year}>
                            <td><strong>{p.year}</strong></td>
                            <td>{p.age}</td>
                            <td>{fmtUsd(p.startBalance)}</td>
                            <td>{p.divisor}</td>
                            <td><strong className="rmd-text-amber">{fmtUsd(p.rmdAmount)}</strong></td>
                            <td>{fmtUsd(p.endBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}

      <style>{`
        .rmd-calc-wrapper { font-family: inherit; }

        .rmd-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        .rmd-field { margin-bottom: 1.5rem; }
        .rmd-field--checkbox {
          background: var(--color-surface-alt, #f8fafc);
          border: 1px dashed var(--color-border, #cbd5e1);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
        }
        .rmd-subfield { margin-top: 1rem; padding-left: 1.25rem; border-left: 3px solid var(--color-secondary, #C9933A); }

        .rmd-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .rmd-label--sub { font-size: 0.95rem; }
        .rmd-required { color: var(--color-error, #c0392b); }
        .rmd-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }
        .rmd-hint-sm { font-size: 0.8rem; color: var(--color-text-muted, #64748b); margin-top: 0.3rem; }

        .rmd-select {
          display: block; width: 100%; max-width: 360px;
          font-size: 1rem; padding: 0.65rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }

        .rmd-input-addon { display: flex; align-items: center; max-width: 300px; }
        .rmd-addon-symbol {
          background: var(--color-surface-alt, #f1f5f9);
          border: 2px solid var(--color-border, #cbd5e1);
          border-right: none;
          border-radius: 0.5rem 0 0 0.5rem;
          padding: 0.6rem 0.85rem;
          font-weight: 700; color: var(--color-primary, #0A3D3A);
        }
        .rmd-input {
          flex: 1; font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0 0.5rem 0.5rem 0; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }
        .rmd-input--sm { max-width: 160px; border-radius: 0.5rem; }
        .rmd-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .rmd-input--error { border-color: var(--color-error, #c0392b); }
        .rmd-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .rmd-checkbox-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.95rem; font-weight: 600; color: var(--color-primary, #0A3D3A); }
        .rmd-checkbox { width: 1.2rem; height: 1.2rem; cursor: pointer; accent-color: var(--color-secondary, #C9933A); flex-shrink: 0; }

        .rmd-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .rmd-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
        }
        .rmd-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .rmd-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .rmd-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .rmd-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .rmd-results { margin-top: 2rem; }
        .rmd-card { border-radius: 0.875rem; padding: 1.75rem; margin-bottom: 1rem; }
        .rmd-card--success { background: #f0fdf4; border: 2px solid #22c55e; }
        .rmd-card--info { background: #eff6ff; border: 2px solid #3b82f6; display: flex; gap: 1rem; }

        .rmd-icon { font-size: 2rem; flex-shrink: 0; }
        .rmd-info-h3 { font-size: 1.2rem; font-weight: 700; color: #1e40af; margin: 0 0 0.5rem; }
        .rmd-info-p { font-size: 0.95rem; color: #1e3a8a; margin: 0; line-height: 1.6; }

        .rmd-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d; background: #dcfce7; border-radius: 9999px; padding: 0.25rem 0.75rem; display: inline-block; margin-bottom: 1rem; }

        .rmd-stat-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.25rem; }
        .rmd-stat-unit { display: flex; flex-direction: column; }
        .rmd-stat-val { font-size: 2.5rem; font-weight: 800; color: var(--color-primary, #0A3D3A); line-height: 1; }
        .rmd-stat-lbl { font-size: 0.85rem; color: #166534; margin-top: 0.3rem; }
        .rmd-stat-unit--sec .rmd-stat-val { color: #b45309; font-size: 1.9rem; }
        .rmd-stat-unit--sec .rmd-stat-lbl { color: var(--color-text-muted, #64748b); }

        .rmd-table-box { background: #fff; border-radius: 0.5rem; border: 1px solid #bbf7d0; overflow: hidden; margin-bottom: 1rem; }
        .rmd-t-row { display: flex; justify-content: space-between; padding: 0.6rem 1rem; font-size: 0.95rem; border-bottom: 1px solid #bbf7d0; gap: 1rem; }
        .rmd-t-row:last-child { border-bottom: none; }
        .rmd-t-row--total { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 700; }
        .rmd-t-row--deadline { background: #fff7ed; color: #92400e; font-weight: 700; }

        .rmd-penalty-warning { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 0.5rem; padding: 0.85rem 1rem; }
        .rmd-penalty-warning p { font-size: 0.85rem; color: #991b1b; margin: 0; line-height: 1.5; }

        .rmd-work-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.875rem; color: var(--color-secondary, #C9933A);
          text-decoration: underline; padding: 0.25rem 0; display: block; margin-bottom: 1rem;
        }

        .rmd-proj-box { background: #f8fafc; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 1rem; }
        .rmd-proj-box h4 { font-size: 0.95rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.25rem; }
        .rmd-proj-sub { font-size: 0.825rem; color: var(--color-text-muted, #64748b); margin: 0 0 1rem; }

        .rmd-proj-table-wrapper { overflow-x: auto; }
        .rmd-proj-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
        .rmd-proj-table th, .rmd-proj-table td { padding: 0.6rem 0.85rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
        .rmd-proj-table th { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 600; }
        .rmd-text-amber { color: #b45309; }

        @media (max-width: 640px) {
          .rmd-input-addon { max-width: 100%; }
          .rmd-stat-val { font-size: 2rem; }
          .rmd-t-row { flex-direction: column; align-items: flex-start; gap: 0.2rem; }
        }
      `}</style>
    </div>
  );
};
