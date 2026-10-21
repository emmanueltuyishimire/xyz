import React, { useState, useId } from 'react';
import {
  calculateOfficialRmd,
  getOfficialJointLifeFactor,
  getUniformLifetimeFactor,
  getSecure2RmdDetails,
  type RmdCalculationResult
} from '@data/irsRmdTables';

/**
 * RMDCalculatorEvergreen.tsx
 * RMD Calculator (Official IRS Publication 590-B & SECURE 2.0 Engine)
 * Primary keyword: rmd calculator
 *
 * Statutory Authorities:
 * - 26 CFR § 1.401(a)(9)-9 (Treasury Decision 9968 - Life Expectancy Tables)
 * - SECURE 2.0 Act § 107 (Starting age 73 for born 1951-1959, age 75 for born 1960+)
 * - SECURE 2. The IRS regulation does not yet say which age applies to people born in 1959 (26 CFR 1.401(a)(9)-2); this tool uses 73 — confirm with the IRS or a tax professional.0 Act § 302 (Excise tax reduced to 25%, 10% timely corrected)
 * - SECURE 2.0 Act § 325 & IRC § 408A(c)(5) (Roth accounts exempt from lifetime RMDs)
 */

interface RMDProjectionYear {
  year: number;
  age: number;
  startBalance: number;
  rmdAmount: number;
  endBalance: number;
  divisor: number;
  tableUsed: string;
}

export const RMDCalculatorEvergreen: React.FC = () => {
  const uid = useId();

  const [balanceStr, setBalanceStr]           = useState<string>('');
  const [birthYearStr, setBirthYearStr]       = useState<string>('');
  const [accountType, setAccountType]         = useState<string>('traditional_ira');
  const [hasYoungerSpouse, setHasYoungerSpouse] = useState<boolean>(false);
  const [spouseBirthYearStr, setSpouseBirthYearStr] = useState<string>('');

  const [result, setResult]                   = useState<RmdCalculationResult | null>(null);
  const [accountLabel, setAccountLabel]       = useState<string>('Traditional IRA');
  const [priorBalanceNum, setPriorBalanceNum] = useState<number>(0);
  const [projections, setProjections]         = useState<RMDProjectionYear[]>([]);
  const [error, setError]                     = useState<string>('');
  const [showProjections, setShowProjections] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const isRoth = accountType === 'roth_ira' || accountType === 'roth_401k';

    const bal = parseFloat(balanceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(bal) || bal <= 0) {
      setError('Please enter a valid prior year-end balance (e.g. 250000).');
      setResult(null);
      return;
    }

    const by = parseInt(birthYearStr, 10);
    if (isNaN(by) || by < 1920 || by > currentYear) {
      setError(`Please enter a valid 4-digit birth year between 1920 and ${currentYear} (e.g. 1953).`);
      setResult(null);
      return;
    }

    let sBy: number | undefined = undefined;
    if (hasYoungerSpouse && spouseBirthYearStr) {
      const parsedSBy = parseInt(spouseBirthYearStr, 10);
      if (isNaN(parsedSBy) || parsedSBy < 1920 || parsedSBy > currentYear) {
        setError(`Please enter a valid 4-digit birth year for your spouse (e.g. 1968).`);
        setResult(null);
        return;
      }
      sBy = parsedSBy;
    }

    setError('');
    setPriorBalanceNum(bal);

    let accLabel = 'Traditional IRA';
    if (accountType === '401k') accLabel = '401(k) / 403(b) / 457(b)';
    if (accountType === 'sep_ira') accLabel = 'SEP IRA';
    if (accountType === 'simple_ira') accLabel = 'SIMPLE IRA';
    if (accountType === 'roth_ira') accLabel = 'Roth IRA';
    if (accountType === 'roth_401k') accLabel = 'Designated Roth 401(k) / 403(b)';
    setAccountLabel(accLabel);

    // Calculate official RMD using 26 CFR § 1.401(a)(9)-9 tables & SECURE 2.0 rules
    const calcResult = calculateOfficialRmd({
      balance: bal,
      birthYear: by,
      taxYear: currentYear,
      hasYoungerSpouseSoleBeneficiary: hasYoungerSpouse,
      spouseBirthYear: sBy,
      isRothAccount: isRoth,
    });

    setResult(calcResult);

    // Build 5-Year Projection using official IRS factors
    const projList: RMDProjectionYear[] = [];
    let runningBalance = bal;
    const secureDetails = getSecure2RmdDetails(by);

    for (let i = 0; i < 5; i++) {
      const projYear = currentYear + i;
      const projAge = (currentYear - by) + i;
      const projIsReq = projYear >= secureDetails.firstRmdYear && !isRoth;

      let projDivisor = getUniformLifetimeFactor(projAge);
      let projTableUsed = 'Table III';

      if (hasYoungerSpouse && sBy) {
        const projSpouseAge = (currentYear - sBy) + i;
        if (projAge - projSpouseAge > 10) {
          projDivisor = getOfficialJointLifeFactor(projAge, projSpouseAge);
          projTableUsed = 'Table II';
        }
      }

      const projRmd = projIsReq && projDivisor > 0 ? runningBalance / projDivisor : 0;
      const growth = (runningBalance - projRmd) * 0.05; // 5% annual portfolio return assumption
      const endBal = Math.max(0, runningBalance - projRmd + growth);

      projList.push({
        year: projYear,
        age: projAge,
        startBalance: runningBalance,
        rmdAmount: Math.round(projRmd * 100) / 100,
        endBalance: Math.round(endBal * 100) / 100,
        divisor: projDivisor,
        tableUsed: projTableUsed,
      });

      runningBalance = endBal;
    }

    setProjections(projList);
  };

  const handleReset = () => {
    setBalanceStr('');
    setBirthYearStr('');
    setAccountType('traditional_ira');
    setHasYoungerSpouse(false);
    setSpouseBirthYearStr('');
    setResult(null);
    setProjections([]);
    setError('');
  };

  const fmtUsd = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="rmd-calc-wrapper">

      {/* ── Trust & Authority Notice ── */}
      <div className="rmd-trust-bar" role="note" aria-label="Official source verification">
        <span>🏛️ Official IRS Publication 590-B &amp; 26 CFR § 1.401(a)(9)-9</span>
        <span>SECURE 2.0 Act § 107 &amp; § 302 Compliant</span>
        <span>🔒 Zero personal data stored</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="Official IRS RMD Calculator Form">
        
        {/* Account Balance */}
        <div className="rmd-field">
          <label htmlFor={`${uid}-bal`} className="rmd-label">
            Account Balance as of December 31 ({currentYear - 1})
            <span className="rmd-required" aria-hidden="true"> *</span>
          </label>
          <p className="rmd-hint" id={`${uid}-bal-hint`}>
            Enter your total fair market value as of December 31, {currentYear - 1} from your official custodian year-end statement.
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
            Determines your SECURE 2.0 RMD starting age: <strong>Age 73</strong> (born 1951–1959) or <strong>Age 75</strong> (born 1960 or later).
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
            Retirement Account Type
          </label>
          <select
            id={`${uid}-acctype`}
            value={accountType}
            onChange={e => setAccountType(e.target.value)}
            className="rmd-select"
          >
            <option value="traditional_ira">Traditional IRA (Aggregates across IRAs)</option>
            <option value="401k">401(k) / 403(b) / governmental 457(b) (Plan-specific)</option>
            <option value="sep_ira">SEP IRA (Aggregates with IRAs)</option>
            <option value="simple_ira">SIMPLE IRA (Aggregates with IRAs)</option>
            <option value="roth_ira">Roth IRA (Exempt from lifetime RMDs)</option>
            <option value="roth_401k">Designated Roth 401(k) / 403(b) (Exempt under SECURE 2.0)</option>
          </select>
          <p className="rmd-hint-sm">
            {accountType === 'roth_ira' || accountType === 'roth_401k'
              ? '✅ Under IRC § 408A(c)(5) and SECURE 2.0 § 325, all Roth accounts are exempt from lifetime mandatory distributions.'
              : accountType === '401k'
              ? '📌 Federal Aggregation Rule: 401(k) plans cannot be aggregated. You must calculate and take the RMD from each 401(k) separately.'
              : '📌 Federal Aggregation Rule: You can total the RMDs for all Traditional, SEP, and SIMPLE IRAs and withdraw the sum from any one or more IRAs.'}
          </p>
        </div>

        {/* Younger Spouse Option (Table II) */}
        {accountType !== 'roth_ira' && accountType !== 'roth_401k' && (
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
                  min="1920"
                  max={currentYear}
                  value={spouseBirthYearStr}
                  onChange={e => setSpouseBirthYearStr(e.target.value)}
                  className="rmd-input rmd-input--sm"
                  placeholder="e.g. 1968"
                />
                <p className="rmd-hint-sm">
                  Applies official IRS Joint Life and Last Survivor Table II (26 CFR § 1.401(a)(9)-9(d)) to reduce your mandatory withdrawal.
                </p>
              </div>
            )}
          </div>
        )}

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
          
          {/* Roth Exemption Card */}
          {result.isRothExempt ? (
            <div className="rmd-card rmd-card--roth">
              <div className="rmd-icon">🎉</div>
              <div>
                <h3 className="rmd-info-h3" style={{ color: '#065f46' }}>No RMD Required — Roth Account Exemption</h3>
                <p className="rmd-info-p" style={{ color: '#047857' }}>
                  Your <strong>{accountLabel}</strong> has <strong>no required minimum distributions</strong> during your lifetime. Under <strong>Internal Revenue Code § 408A(c)(5)</strong> (for Roth IRAs) and <strong>SECURE 2.0 Act § 325</strong> (effective 2024 for designated Roth 401(k) and 403(b) plans), account owners are never forced to take lifetime withdrawals.
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#065f46' }}>
                  <strong>Tax Advantage:</strong> Your balance can continue growing 100% tax-free for your entire lifetime with zero IRS withdrawal penalties.
                </div>
              </div>
            </div>
          ) : !result.isRmdRequired ? (
            /* Under Age Card */
            <div className="rmd-card rmd-card--info">
              <div className="rmd-icon">ℹ️</div>
              <div>
                <h3 className="rmd-info-h3">No RMD Required in {currentYear}</h3>
                <p className="rmd-info-p">
                  At age <strong>{result.ownerAgeInTaxYear}</strong>, you have not yet reached your SECURE 2.0 RMD starting age of <strong>{result.rmdStartingAge}</strong>. Under federal law, you are not required to take any mandatory distribution from your {accountLabel} in {currentYear}.
                </p>
                <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#1e3a8a' }}>
                  <strong>Your Timeline:</strong> Your first RMD year will be <strong>{result.firstRmdYear}</strong> (the year you attain age {result.rmdStartingAge}), with an initial Required Beginning Date deadline of <strong>April 1, {result.firstRmdYear + 1}</strong>.
                </div>
              </div>
            </div>
          ) : (
            /* Active RMD Output Card */
            <>
              <div className="rmd-card rmd-card--success">
                <span className="rmd-badge">
                  Official IRS RMD for {currentYear} • {result.tableUsed}
                </span>

                <div className="rmd-stat-grid">
                  <div className="rmd-stat-unit">
                    <span className="rmd-stat-val">{fmtUsd(result.rmdAmount)}</span>
                    <span className="rmd-stat-lbl">Mandatory distribution for {currentYear} ({result.percentageOfBalance}% of balance)</span>
                  </div>
                  <div className="rmd-stat-unit rmd-stat-unit--sec">
                    <span className="rmd-stat-val">{fmtUsd(result.monthlyEquivalent)} / mo</span>
                    <span className="rmd-stat-lbl">Monthly equivalent distribution</span>
                  </div>
                </div>

                {/* Table Breakdown */}
                <div className="rmd-table-box">
                  <div className="rmd-t-row">
                    <span>Prior Dec 31 Balance ({currentYear - 1})</span>
                    <span><strong>{fmtUsd(priorBalanceNum)}</strong></span>
                  </div>
                  <div className="rmd-t-row">
                    <span>Your Age in {currentYear}</span>
                    <span><strong>{result.ownerAgeInTaxYear} years old</strong> (SECURE 2.0 Start Age: {result.rmdStartingAge})</span>
                  </div>
                  {result.spouseAgeInTaxYear && (
                    <div className="rmd-t-row">
                      <span>Spouse Age in {currentYear}</span>
                      <span><strong>{result.spouseAgeInTaxYear} years old</strong> ({result.ownerAgeInTaxYear - result.spouseAgeInTaxYear} years younger)</span>
                    </div>
                  )}
                  <div className="rmd-t-row">
                    <span>Official IRS Divisor (Life Expectancy Factor)</span>
                    <span><strong>{result.divisor}</strong> ({result.tableUsed})</span>
                  </div>
                  <div className="rmd-t-row rmd-t-row--total">
                    <span>{currentYear} Total Mandatory RMD (Balance ÷ Factor)</span>
                    <span><strong>{fmtUsd(result.rmdAmount)}</strong></span>
                  </div>
                  <div className="rmd-t-row rmd-t-row--deadline">
                    <span>Statutory Deadline</span>
                    <span><strong>{result.deadlineDate}</strong></span>
                  </div>
                </div>

                {/* First-Year Grace Period Notice */}
                {result.isFirstYearRmd && (
                  <div className="rmd-first-year-callout">
                    <p style={{ margin: 0, fontWeight: 700, color: '#92400e' }}>
                      ⏳ First-Year RMD Grace Period Notice:
                    </p>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#78350f', lineHeight: 1.5 }}>
                      Because {currentYear} is the year you reach age {result.rmdStartingAge}, the IRS allows you to delay your first distribution until <strong>April 1, {currentYear + 1}</strong>.
                    </p>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.825rem', color: '#b45309', fontWeight: 600 }}>
                      ⚠️ Double-Tax Warning: Delaying to April 1 means taking TWO full RMDs in {currentYear + 1} (your {currentYear} RMD by April 1, and your {currentYear + 1} RMD by Dec 31). This can spike your taxable income and trigger Medicare IRMAA premium surcharges.
                    </p>
                  </div>
                )}

                {/* Official SECURE 2.0 Penalty Breakdown */}
                <div className="rmd-penalty-warning">
                  <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                    ⚖️ Official IRS Penalty Rules (26 U.S. Code § 4974 &amp; SECURE 2.0 § 302):
                  </p>
                  <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <li>
                      <strong>Standard Penalty (25%):</strong> If you fail to withdraw your full RMD by {result.deadlineDate}, the IRS assesses a 25% excise tax of <strong>{fmtUsd(result.penalty.standardPenalty)}</strong>.
                    </li>
                    <li>
                      <strong>Timely Corrected Penalty (10%):</strong> Under SECURE 2.0, if you timely correct the shortfall within the 2-year correction window and file IRS Form 5329, the penalty is reduced to 10% (<strong>{fmtUsd(result.penalty.correctedPenalty)}</strong>), saving you <strong>{fmtUsd(result.penalty.potentialSavings)}</strong>.
                    </li>
                    <li>
                      <strong>Reasonable Cause Waiver:</strong> Under IRC § 4974(d), you may request a 100% waiver of the excise tax by attaching an explanation letter of reasonable error and corrective action to Form 5329 Line 54 with notation "RC".
                    </li>
                  </ul>
                </div>
              </div>

              {/* 5-Year Projection Toggle */}
              <button
                type="button"
                className="rmd-work-btn"
                onClick={() => setShowProjections(v => !v)}
                aria-expanded={showProjections}
              >
                {showProjections ? '▲ Hide 5-year official RMD projection table' : '▼ Show 5-year official RMD & balance projection table'}
              </button>

              {showProjections && (
                <div className="rmd-proj-box" aria-label="5-Year RMD Projection Table">
                  <h4>5-Year RMD &amp; Portfolio Balance Projection</h4>
                  <p className="rmd-proj-sub">
                    Calculated using official IRS factors (Table III / Table II). Assumes a 5% average annual portfolio growth rate on remaining funds.
                  </p>

                  <div className="rmd-proj-table-wrapper">
                    <table className="rmd-proj-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Age</th>
                          <th>Start Balance</th>
                          <th>IRS Table Factor</th>
                          <th>Required RMD</th>
                          <th>Est. End Balance (5% Return)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projections.map((p) => (
                          <tr key={p.year}>
                            <td><strong>{p.year}</strong></td>
                            <td>{p.age}</td>
                            <td>{fmtUsd(p.startBalance)}</td>
                            <td>{p.divisor} ({p.tableUsed})</td>
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
          font-size: 0.825rem; color: #0A3D3A;
          background: #EBF4F3;
          border: 1px solid #0A3D3A;
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
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
          display: block; width: 100%; max-width: 440px;
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
        .rmd-card--roth { background: #ecfdf5; border: 2px solid #10b981; display: flex; gap: 1rem; }

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
        .rmd-t-row { display: flex; justify-content: space-between; padding: 0.65rem 1rem; font-size: 0.95rem; border-bottom: 1px solid #bbf7d0; gap: 1rem; }
        .rmd-t-row:last-child { border-bottom: none; }
        .rmd-t-row--total { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 700; }
        .rmd-t-row--deadline { background: #fff7ed; color: #92400e; font-weight: 700; }

        .rmd-first-year-callout {
          background: #fefce8; border: 1px solid #fde047; border-radius: 0.5rem;
          padding: 0.85rem 1rem; margin-bottom: 1rem;
        }

        .rmd-penalty-warning { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 0.5rem; padding: 0.85rem 1rem; }
        .rmd-penalty-warning p { color: #991b1b; }
        .rmd-penalty-warning li { color: #7f1d1d; margin-bottom: 0.3rem; }

        .rmd-work-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.875rem; color: var(--color-secondary, #C9933A);
          text-decoration: underline; padding: 0.25rem 0; display: block; margin-bottom: 1rem;
          font-weight: 600;
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
