import React, { useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { ResultsPanel } from './ResultsPanel';
import {
  calculateOfficialRmd,
  type RmdCalculationResult
} from '@data/irsRmdTables';

/**
 * RMDCalculator.tsx
 * Official Required Minimum Distribution Calculator
 * Conforms to 26 CFR § 1.401(a)(9)-9 (Treasury Decision 9968) and SECURE 2.0 Act.
 * Source: IRS Publication 590-B & 26 U.S. Code § 401(a)(9)
 */

export const RMDCalculator: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [balance, setBalance] = useState<number | ''>('');
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [hasYoungerSpouse, setHasYoungerSpouse] = useState<boolean>(false);
  const [spouseBirthYear, setSpouseBirthYear] = useState<number | ''>('');
  const [result, setResult] = useState<RmdCalculationResult | null>(null);
  const [errors, setErrors] = useState<{ balance?: string; birthYear?: string; spouseBirthYear?: string }>({});

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { balance?: string; birthYear?: string; spouseBirthYear?: string } = {};

    if (balance === '' || Number(balance) <= 0) {
      newErrors.balance = 'Enter your December 31 prior-year account balance (must be greater than $0).';
    }

    if (birthYear === '' || Number(birthYear) < 1920 || Number(birthYear) > currentYear) {
      newErrors.birthYear = `Enter a valid 4-digit birth year between 1920 and ${currentYear}.`;
    }

    if (hasYoungerSpouse && spouseBirthYear !== '') {
      const sByNum = Number(spouseBirthYear);
      if (isNaN(sByNum) || sByNum < 1920 || sByNum > currentYear) {
        newErrors.spouseBirthYear = 'Enter a valid 4-digit birth year for your spouse.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResult(null);
      return;
    }

    setErrors({});

    const calcResult = calculateOfficialRmd({
      balance: Number(balance),
      birthYear: Number(birthYear),
      taxYear: currentYear,
      hasYoungerSpouseSoleBeneficiary: hasYoungerSpouse,
      spouseBirthYear: spouseBirthYear !== '' ? Number(spouseBirthYear) : undefined,
    });

    setResult(calcResult);
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="rmd-calculator-wrapper">
      <form onSubmit={calculate} className="calc-form">
        <MoneyInput
          id="account-balance"
          label={`Account Balance (as of Dec 31, ${currentYear - 1})`}
          value={balance}
          onChange={(val) => setBalance(val === '' ? '' : Number(val))}
          placeholder="Enter your balance (e.g., 350,000)"
          helpText={`Use the balance from your official December 31, ${currentYear - 1} statement for this account.`}
          error={errors.balance}
          min={1}
          required
        />

        <div className="calc-field-group">
          <label htmlFor="owner-birth-year" className="calc-label">
            Your Birth Year <span className="calc-required" aria-hidden="true">*</span>
          </label>
          <p className="calc-help-text">
            Under SECURE 2.0, RMDs start at <strong>age 73</strong> for those born 1951–1959, and <strong>age 75</strong> for those born in 1960 or later. The IRS regulation does not yet say which age applies to people born in 1959 (26 CFR 1.401(a)(9)-2); this tool uses 73 — confirm with the IRS or a tax professional.
          </p>
          <input
            id="owner-birth-year"
            type="number"
            min={1920}
            max={currentYear}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
            className="calc-input"
            placeholder="e.g., 1953"
            aria-describedby={errors.birthYear ? 'owner-by-error' : undefined}
            aria-invalid={!!errors.birthYear}
          />
          {errors.birthYear && <p id="owner-by-error" className="calc-error-message" role="alert"><strong>Error:</strong> {errors.birthYear}</p>}
        </div>

        <div className="calc-field-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasYoungerSpouse}
              onChange={(e) => setHasYoungerSpouse(e.target.checked)}
            />
            My spouse is sole beneficiary and MORE than 10 years younger than me
          </label>
          {hasYoungerSpouse && (
            <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '3px solid #C9933A' }}>
              <label htmlFor="spouse-birth-year" className="calc-label" style={{ fontSize: '0.9rem' }}>
                Spouse Birth Year
              </label>
              <input
                id="spouse-birth-year"
                type="number"
                min={1920}
                max={currentYear}
                value={spouseBirthYear}
                onChange={(e) => setSpouseBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                className="calc-input"
                placeholder="e.g., 1968"
              />
              <p className="calc-help-text" style={{ margin: '0.25rem 0 0' }}>
                Applies official IRS Joint Life Table II for lower mandatory distributions.
              </p>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn--primary calc-submit-button" style={{ marginTop: '1.25rem' }}>
          Calculate My {currentYear} RMD
        </button>
      </form>

      {result && (
        <ResultsPanel
          title={`Your Required Minimum Distribution for ${currentYear}`}
          primaryLabel={result.isRmdRequired ? `Mandatory ${currentYear} RMD Amount` : `No RMD Required in ${currentYear}`}
          primaryValue={result.isRmdRequired ? formatCurrency(result.rmdAmount) : '$0'}
          variant={result.isRmdRequired ? 'info' : 'success'}
        >
          <div className="rmd-results-details">
            {!result.isRmdRequired ? (
              <p style={{ margin: 0, fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
                At age <strong>{result.ownerAgeInTaxYear}</strong>, you have not yet reached your SECURE 2.0 statutory starting age of <strong>{result.rmdStartingAge}</strong>. Your first mandatory RMD will be in <strong>{result.firstRmdYear}</strong>.
              </p>
            ) : (
              <>
                <div className="rmd-summary-grid">
                  <div className="rmd-summary-item">
                    <span className="rmd-item-label">Monthly Equivalent</span>
                    <strong>{formatCurrency(result.monthlyEquivalent)} / mo</strong>
                  </div>
                  <div className="rmd-summary-item">
                    <span className="rmd-item-label">IRS Table &amp; Factor</span>
                    <strong>{result.divisor} ({result.tableUsed.includes('Table II') ? 'Table II Joint' : 'Table III'})</strong>
                  </div>
                  <div className="rmd-summary-item">
                    <span className="rmd-item-label">Statutory Deadline</span>
                    <strong>{result.deadlineDate}</strong>
                  </div>
                  <div className="rmd-summary-item">
                    <span className="rmd-item-label">Percentage of Balance</span>
                    <strong>{result.percentageOfBalance}%</strong>
                  </div>
                  <div className="rmd-summary-item">
                    <span className="rmd-item-label">Missed Penalty (25%)</span>
                    <strong style={{ color: 'var(--color-error)' }}>{formatCurrency(result.penalty.standardPenalty)}</strong>
                  </div>
                  <div className="rmd-summary-item">
                    <span className="rmd-item-label">Timely Corrected (10%)</span>
                    <strong style={{ color: '#b45309' }}>{formatCurrency(result.penalty.correctedPenalty)}</strong>
                  </div>
                </div>

                {result.isFirstYearRmd && (
                  <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
                    <strong>⏳ First RMD Grace Period:</strong> Because {currentYear} is the year you turn {result.rmdStartingAge}, you may delay taking this check until <strong>April 1, {currentYear + 1}</strong>. However, taking two RMDs in {currentYear + 1} can create a costly tax spike.
                  </div>
                )}

                <p style={{ fontSize: 'var(--text-sm)', maxWidth: '100%', marginTop: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                  ⚖️ <strong>IRS Form 5329 Rule:</strong> Under 26 U.S.C. § 4974 and SECURE 2.0 § 302, correcting a missed distribution within 2 years reduces the penalty from 25% to 10%. You may also request a 100% Reasonable Cause waiver under IRC § 4974(d).
                </p>
              </>
            )}
          </div>
        </ResultsPanel>
      )}

      <style>{`
        .rmd-results-details { max-width: 100%; }
        .rmd-results-details p { max-width: 100%; }
        .rmd-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          background: var(--color-surface-alt);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-bottom: var(--space-3);
        }
        .rmd-summary-item { display: flex; flex-direction: column; gap: 2px; }
        .rmd-item-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        @media (max-width: 500px) { .rmd-summary-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
