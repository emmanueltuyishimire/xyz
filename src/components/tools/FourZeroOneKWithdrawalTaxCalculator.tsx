/**
 * FourZeroOneKWithdrawalTaxCalculator.tsx
 * 401(k) Withdrawal Tax Calculator 2026 — Seniors Audit
 *
 * Official Sources:
 * - 26 U.S. Code § 402 (Taxability of beneficiary of employees' trust)
 * - 26 U.S. Code § 72(t) (10% additional tax on early distributions)
 * - 26 U.S. Code § 3405(c) (Mandatory 20% withholding on eligible rollover distributions from qualified employer plans)
 * - IRS Rev. Proc. 2025-32 (Inflation-adjusted federal tax brackets & standard deductions)
 * - IRS Publication 575 (Pension and Annuity Income)
 *
 * Semantic Flow:
 * 401(k) WITHDRAWAL -> TAXABLE INCOME -> FEDERAL TAX -> EARLY WITHDRAWAL PENALTY -> WITHHOLDING -> NET CASH
 *
 * Last verified: August 2026
 */

import React, { useState, useId } from 'react';

type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';
type FourZeroOneKType = 'traditional' | 'roth_qualified' | 'roth_nonqualified' | 'mixed' | 'not_sure';
type EmploymentStatus = 'employed' | 'separated_55_plus' | 'separated_under_55' | 'retired';
type WithdrawalReason = 'retirement' | 'emergency' | 'home' | 'medical' | 'education' | 'debt' | 'other';
type WithholdingMode = 'percentage' | 'dollar';

const TAX_PARAMS_2026 = {
  taxYear: 2026,
  brackets: {
    single: [
      { min: 0, max: 12400 as number | null, rate: 0.10 },
      { min: 12400, max: 50400 as number | null, rate: 0.12 },
      { min: 50400, max: 105700 as number | null, rate: 0.22 },
      { min: 105700, max: 201775 as number | null, rate: 0.24 },
      { min: 201775, max: 256225 as number | null, rate: 0.32 },
      { min: 256225, max: 640600 as number | null, rate: 0.35 },
      { min: 640600, max: null as null, rate: 0.37 },
    ],
    mfj: [
      { min: 0, max: 24800 as number | null, rate: 0.10 },
      { min: 24800, max: 100800 as number | null, rate: 0.12 },
      { min: 100800, max: 211400 as number | null, rate: 0.22 },
      { min: 211400, max: 403550 as number | null, rate: 0.24 },
      { min: 403550, max: 512450 as number | null, rate: 0.32 },
      { min: 512450, max: 768700 as number | null, rate: 0.35 },
      { min: 768700, max: null as null, rate: 0.37 },
    ],
    mfs: [
      { min: 0, max: 12400 as number | null, rate: 0.10 },
      { min: 12400, max: 50400 as number | null, rate: 0.12 },
      { min: 50400, max: 105700 as number | null, rate: 0.22 },
      { min: 105700, max: 201775 as number | null, rate: 0.24 },
      { min: 201775, max: 256225 as number | null, rate: 0.32 },
      { min: 256225, max: 384350 as number | null, rate: 0.35 },
      { min: 384350, max: null as null, rate: 0.37 },
    ],
    hoh: [
      { min: 0, max: 17700 as number | null, rate: 0.10 },
      { min: 17700, max: 67450 as number | null, rate: 0.12 },
      { min: 67450, max: 105700 as number | null, rate: 0.22 },
      { min: 105700, max: 201750 as number | null, rate: 0.24 },
      { min: 201750, max: 256200 as number | null, rate: 0.32 },
      { min: 256200, max: 640600 as number | null, rate: 0.35 },
      { min: 640600, max: null as null, rate: 0.37 },
    ],
    qss: [
      { min: 0, max: 24800 as number | null, rate: 0.10 },
      { min: 24800, max: 100800 as number | null, rate: 0.12 },
      { min: 100800, max: 211400 as number | null, rate: 0.22 },
      { min: 211400, max: 403550 as number | null, rate: 0.24 },
      { min: 403550, max: 512450 as number | null, rate: 0.32 },
      { min: 512450, max: 768700 as number | null, rate: 0.35 },
      { min: 768700, max: null as null, rate: 0.37 },
    ]
  },
  standardDeductions: {
    single: 16100,
    mfj: 32200,
    mfs: 16100,
    hoh: 24150,
    qss: 32200,
  },
  seniorDeduction: {
    single: 2050,
    mfj: 1650,
    mfs: 1650,
    hoh: 2050,
    qss: 1650,
  },
  irmaaTier1Single: 109000,
  irmaaTier1MFJ: 218000,
};

// Enhanced Senior Deduction per IRS Schedule 1-A (Form 1040), tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.
// Source: IRS Schedule 1-A, Part V — age 65 or older by December 31, 2026 (born before January 2, 1962), valid SSN, joint return required if married; MFS ineligible
function calcEnhancedSeniorDeduction(magi: number, fs: FilingStatus, age65Plus: boolean, spouseAge65Plus: boolean): number {
  if (fs === 'mfs') return 0;
  const threshold = (fs === 'mfj') ? 150000 : 75000;
  const excess = Math.max(0, magi - threshold);
  const phaseout = excess * 0.06;
  const perPerson = Math.max(0, 6000 - phaseout);
  let count = 0;
  if (age65Plus) count++;
  if (fs === 'mfj' && spouseAge65Plus) count++;
  return perPerson * count;
}

function calculateFederalTax(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = TAX_PARAMS_2026.brackets[status];
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome > b.min) {
      const taxableInBracket = b.max !== null
        ? Math.min(taxableIncome - b.min, b.max - b.min)
        : taxableIncome - b.min;
      tax += taxableInBracket * b.rate;
    }
  }
  return Math.max(0, tax);
}

function getMarginalBracket(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 10;
  const brackets = TAX_PARAMS_2026.brackets[status];
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) {
      return Math.round(brackets[i].rate * 100);
    }
  }
  return 10;
}

function calculateTaxableSS(annualSS: number, otherIncome: number, filingStatus: FilingStatus): number {
  if (annualSS <= 0) return 0;
  const provisionalIncome = otherIncome + (0.5 * annualSS);
  let threshold1 = 25000;
  let threshold2 = 34000;
  if (filingStatus === 'mfj') {
    threshold1 = 32000;
    threshold2 = 44000;
  } else if (filingStatus === 'mfs') {
    threshold1 = 0;
    threshold2 = 0;
  }

  if (filingStatus === 'mfs') {
    return Math.min(0.85 * annualSS, 0.85 * provisionalIncome);
  }

  if (provisionalIncome <= threshold1) {
    return 0;
  } else if (provisionalIncome <= threshold2) {
    return Math.min(0.50 * annualSS, 0.50 * (provisionalIncome - threshold1));
  } else {
    const tier1 = 0.50 * (threshold2 - threshold1);
    const tier2 = 0.85 * (provisionalIncome - threshold2);
    return Math.min(0.85 * annualSS, tier1 + tier2);
  }
}

export const FourZeroOneKWithdrawalTaxCalculator: React.FC = () => {
  const uid = useId();

  const [withdrawalStr, setWithdrawalStr] = useState<string>('25000');
  const [accountType, setAccountType] = useState<FourZeroOneKType>('traditional');
  const [ageStr, setAgeStr] = useState<string>('62');
  const [birthYearStr, setBirthYearStr] = useState<string>('');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('retired');
  const [withdrawalReason, setWithdrawalReason] = useState<WithdrawalReason>('retirement');

  const [otherIncomeStr, setOtherIncomeStr] = useState<string>('30000');
  const [socialSecurityStr, setSocialSecurityStr] = useState<string>('24000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [spouseAge65Plus, setSpouseAge65Plus] = useState<boolean>(false);
  const [deductionType, setDeductionType] = useState<'standard' | 'custom'>('standard');
  const [customDeductionStr, setCustomDeductionStr] = useState<string>('');
  const [creditsStr, setCreditsStr] = useState<string>('0');

  const [withholdingMode, setWithholdingMode] = useState<WithholdingMode>('percentage');
  const [withholdingPctStr, setWithholdingPctStr] = useState<string>('20');
  const [withholdingDollarStr, setWithholdingDollarStr] = useState<string>('5000');

  const [showExceptions, setShowExceptions] = useState<boolean>(false);
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  const currentYear = TAX_PARAMS_2026.taxYear;
  const grossWithdrawal = parseFloat(withdrawalStr.replace(/[^0-9.]/g, '')) || 0;
  let age = parseFloat(ageStr.replace(/[^0-9.]/g, '')) || 62;
  if (birthYearStr) {
    const by = parseInt(birthYearStr.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(by) && by > 1920 && by <= currentYear) {
      age = currentYear - by;
    }
  }
  const otherIncome = parseFloat(otherIncomeStr.replace(/[^0-9.]/g, '')) || 0;
  const annualSS = parseFloat(socialSecurityStr.replace(/[^0-9.]/g, '')) || 0;
  const credits = parseFloat(creditsStr.replace(/[^0-9.]/g, '')) || 0;

  let taxablePortion = grossWithdrawal;
  if (accountType === 'roth_qualified') {
    taxablePortion = 0;
  } else if (accountType === 'mixed') {
    taxablePortion = grossWithdrawal * 0.5;
  } else if (accountType === 'roth_nonqualified') {
    taxablePortion = grossWithdrawal * 0.3;
  }

  let penaltyApplies = false;
  let ruleOf55Applies = false;

  if (age < 59.5) {
    if (employmentStatus === 'separated_55_plus' && age >= 55) {
      ruleOf55Applies = true;
      penaltyApplies = false;
    } else {
      penaltyApplies = true;
    }
  }

  const earlyPenaltyRate = penaltyApplies && accountType !== 'roth_qualified' ? 0.10 : 0;
  const earlyPenaltyAmount = taxablePortion * earlyPenaltyRate;

  let deduction = TAX_PARAMS_2026.standardDeductions[filingStatus];
  if (age >= 65) {
    deduction += TAX_PARAMS_2026.seniorDeduction[filingStatus];
  }
  if (filingStatus === 'mfj' && spouseAge65Plus) {
    deduction += TAX_PARAMS_2026.seniorDeduction.mfj;
  }
  if (deductionType === 'custom') {
    const customVal = parseFloat(customDeductionStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(customVal) && customVal > 0) {
      deduction = customVal;
    }
  }

  const taxableSSWithout = calculateTaxableSS(annualSS, otherIncome, filingStatus);
  const agiWithout = otherIncome + taxableSSWithout;
  const enhSeniorWithout = calcEnhancedSeniorDeduction(agiWithout, filingStatus, age >= 65, spouseAge65Plus);
  const taxableIncomeWithout = Math.max(0, agiWithout - deduction - enhSeniorWithout);
  const baseTaxWithout = Math.max(0, calculateFederalTax(taxableIncomeWithout, filingStatus) - credits);

  const totalOtherWith401k = otherIncome + taxablePortion;
  const taxableSSWith = calculateTaxableSS(annualSS, totalOtherWith401k, filingStatus);
  const agiWith = totalOtherWith401k + taxableSSWith;
  const enhSeniorWith = calcEnhancedSeniorDeduction(agiWith, filingStatus, age >= 65, spouseAge65Plus);
  const taxableIncomeWith = Math.max(0, agiWith - deduction - enhSeniorWith);
  const totalTaxWith = Math.max(0, calculateFederalTax(taxableIncomeWith, filingStatus) - credits);

  const incrementalFederalTax = Math.max(0, totalTaxWith - baseTaxWithout);
  const effectiveTaxRate = grossWithdrawal > 0 ? (incrementalFederalTax / grossWithdrawal) * 100 : 0;
  const marginalBracket = getMarginalBracket(taxableIncomeWith, filingStatus);
  const totalTaxPlusPenalty = incrementalFederalTax + earlyPenaltyAmount;

  const ssIncrease = Math.max(0, taxableSSWith - taxableSSWithout);
  const irmaaThreshold = filingStatus === 'mfj' ? TAX_PARAMS_2026.irmaaTier1MFJ : TAX_PARAMS_2026.irmaaTier1Single;
  const triggersIrmaa = agiWith > irmaaThreshold;

  let selectedWithholdingDollar = 0;
  let selectedWithholdingPct = 0;

  if (withholdingMode === 'percentage') {
    selectedWithholdingPct = parseFloat(withholdingPctStr) || 0;
    selectedWithholdingDollar = (grossWithdrawal * selectedWithholdingPct) / 100;
  } else {
    selectedWithholdingDollar = parseFloat(withholdingDollarStr.replace(/[^0-9.]/g, '')) || 0;
    selectedWithholdingPct = grossWithdrawal > 0 ? (selectedWithholdingDollar / grossWithdrawal) * 100 : 0;
  }

  const netCashReceived = Math.max(0, grossWithdrawal - selectedWithholdingDollar);
  const withholdingVsActualDiff = selectedWithholdingDollar - totalTaxPlusPenalty;

  const comparisonRates = [0, 10, 15, 20, 22, 25];
  const dynamicWithholdingTiers = comparisonRates.map(pct => {
    const withheld = (grossWithdrawal * pct) / 100;
    const received = Math.max(0, grossWithdrawal - withheld);
    const diff = withheld - totalTaxPlusPenalty;
    return { pct, withheld, received, diff };
  });

  const scenarioAmounts = [10000, 25000, 50000];
  const scenarioResults = scenarioAmounts.map(amt => {
    const taxPort = accountType === 'roth_qualified' ? 0 : amt;
    const tOther = otherIncome + taxPort;
    const tSS = calculateTaxableSS(annualSS, tOther, filingStatus);
    const tAGI = tOther + tSS;
    const tInc = Math.max(0, tAGI - deduction);
    const tTax = Math.max(0, calculateFederalTax(tInc, filingStatus) - credits);
    const incTax = Math.max(0, tTax - baseTaxWithout);
    const pen = penaltyApplies && accountType !== 'roth_qualified' ? amt * 0.10 : 0;
    const totLiability = incTax + pen;
    const wHold = (amt * 20) / 100;
    const netRcv = Math.max(0, amt - wHold);
    return {
      amt,
      incTax,
      pen,
      totLiability,
      wHold,
      netRcv,
      marginal: getMarginalBracket(tInc, filingStatus),
    };
  });

  return (
    <div className="fzk-container" id="calculator">
      <div className="fzk-header">
        <span className="fzk-badge">2026 Federal Tax Year &amp; IRC § 402 / § 72(t)</span>
        <h2 className="fzk-title">401(k) Withdrawal Tax &amp; Withholding Calculator</h2>
        <p className="fzk-subtitle">
          Estimate the incremental federal income tax, possible early-distribution penalties, mandatory 20% plan withholding, and your estimated take-home cash.
        </p>
      </div>

      <div className="fzk-grid">
        <div className="fzk-form-col">
          <div className="fzk-input-group">
            <h3 className="fzk-group-title">
              <span className="fzk-step-num">1</span> 401(k) Withdrawal Details
            </h3>

            <div className="fzk-field">
              <label htmlFor={uid + '-amount'} className="fzk-label">
                How much do you want to withdraw from your 401(k)? ($)
              </label>
              <input
                id={uid + '-amount'}
                type="text"
                value={withdrawalStr}
                onChange={e => setWithdrawalStr(e.target.value)}
                className="fzk-input fzk-input-lg"
                placeholder="e.g. 25000"
              />
              <span className="fzk-hint">Gross distribution amount before taxes or plan withholding.</span>
            </div>

            <div className="fzk-field" style={{ marginTop: '0.75rem' }}>
              <label htmlFor={uid + '-type'} className="fzk-label">
                What type of 401(k) money are you withdrawing?
              </label>
              <select
                id={uid + '-type'}
                value={accountType}
                onChange={e => setAccountType(e.target.value as FourZeroOneKType)}
                className="fzk-select"
              >
                <option value="traditional">Traditional / Pre-Tax 401(k) (100% Taxable — Most Common)</option>
                <option value="roth_qualified">Roth 401(k) — Qualified (Tax-Free &amp; Penalty-Free)</option>
                <option value="roth_nonqualified">Roth 401(k) — Non-Qualified (Earnings Taxable / Contributions Basis)</option>
                <option value="mixed">Mixed Traditional &amp; Roth 401(k)</option>
                <option value="not_sure">Not sure (Assume Pre-Tax Traditional)</option>
              </select>
              {accountType === 'roth_qualified' && (
                <div className="fzk-info-box-sm">
                  ✅ <strong>Qualified Roth 401(k):</strong> Distributions made after age 59½ and meeting the 5-year aging rule are completely free of federal income tax and early-distribution penalties.
                </div>
              )}
            </div>

            <div className="fzk-row-2" style={{ marginTop: '0.75rem' }}>
              <div className="fzk-field">
                <label htmlFor={uid + '-age'} className="fzk-label">
                  Your Age
                </label>
                <input
                  id={uid + '-age'}
                  type="number"
                  min="18"
                  max="100"
                  value={ageStr}
                  onChange={e => {
                    setAgeStr(e.target.value);
                    setBirthYearStr('');
                  }}
                  className="fzk-input"
                  placeholder="e.g. 62"
                />
              </div>

              <div className="fzk-field">
                <label htmlFor={uid + '-by'} className="fzk-label">
                  Birth Year (Optional)
                </label>
                <input
                  id={uid + '-by'}
                  type="number"
                  min="1925"
                  max="2010"
                  value={birthYearStr}
                  onChange={e => setBirthYearStr(e.target.value)}
                  className="fzk-input"
                  placeholder="e.g. 1964"
                />
              </div>
            </div>

            <div className="fzk-field" style={{ marginTop: '0.75rem' }}>
              <label htmlFor={uid + '-employment'} className="fzk-label">
                Employment Status with this 401(k) Employer
              </label>
              <select
                id={uid + '-employment'}
                value={employmentStatus}
                onChange={e => setEmploymentStatus(e.target.value as EmploymentStatus)}
                className="fzk-select"
              >
                <option value="retired">Retired / Fully Separated from Service</option>
                <option value="separated_55_plus">Separated from Service in or after the year I turned 55 (Rule of 55)</option>
                <option value="separated_under_55">Separated from Service before age 55</option>
                <option value="employed">Still Actively Working for this Employer</option>
              </select>
              {ruleOf55Applies && (
                <div className="fzk-info-box-sm">
                  🛡️ <strong>Rule of 55 Exception:</strong> Because you left this employer at or after age 55, distributions from this employer's 401(k) plan are exempt from the 10% early withdrawal tax under IRC § 72(t)(2)(A)(v).
                </div>
              )}
              {penaltyApplies && (
                <div className="fzk-warning-box">
                  ⚠️ <strong>Possible 10% Early Distribution Tax:</strong> Withdrawals before age 59½ are generally subject to a 10% federal penalty unless a statutory exception applies.
                </div>
              )}
            </div>

            <div className="fzk-field" style={{ marginTop: '0.75rem' }}>
              <label htmlFor={uid + '-reason'} className="fzk-label">
                Withdrawal Purpose (Optional)
              </label>
              <select
                id={uid + '-reason'}
                value={withdrawalReason}
                onChange={e => setWithdrawalReason(e.target.value as WithdrawalReason)}
                className="fzk-select"
              >
                <option value="retirement">Retirement Living Expenses</option>
                <option value="emergency">Emergency Expense / Hardship</option>
                <option value="medical">High Medical Expenses (&gt;7.5% AGI)</option>
                <option value="home">First-Time Home Purchase</option>
                <option value="education">Higher Education</option>
                <option value="debt">Debt Repayment</option>
                <option value="other">Other / Prefer Not to Say</option>
              </select>
              <span className="fzk-hint">
                Note: Unlike IRAs, 401(k) plans do NOT offer standard penalty exceptions for first-time home purchases or higher education unless rolled over first.
              </span>
            </div>
          </div>

          <div className="fzk-input-group">
            <h3 className="fzk-group-title">
              <span className="fzk-step-num">2</span> Other Income &amp; Tax Profile
            </h3>

            <div className="fzk-row-2">
              <div className="fzk-field">
                <label htmlFor={uid + '-other-inc'} className="fzk-label">
                  Other Taxable Income ($/yr)
                </label>
                <input
                  id={uid + '-other-inc'}
                  type="text"
                  value={otherIncomeStr}
                  onChange={e => setOtherIncomeStr(e.target.value)}
                  className="fzk-input"
                  placeholder="Wages, pensions, IRA"
                />
                <span className="fzk-hint">Wages, pension, interest, capital gains</span>
              </div>

              <div className="fzk-field">
                <label htmlFor={uid + '-ss'} className="fzk-label">
                  Annual Social Security ($/yr)
                </label>
                <input
                  id={uid + '-ss'}
                  type="text"
                  value={socialSecurityStr}
                  onChange={e => setSocialSecurityStr(e.target.value)}
                  className="fzk-input"
                  placeholder="e.g. 24000"
                />
                <span className="fzk-hint">Used for provisional income testing</span>
              </div>
            </div>

            <div className="fzk-row-2" style={{ marginTop: '0.75rem' }}>
              <div className="fzk-field">
                <label htmlFor={uid + '-filing'} className="fzk-label">
                  Filing Status
                </label>
                <select
                  id={uid + '-filing'}
                  value={filingStatus}
                  onChange={e => setFilingStatus(e.target.value as FilingStatus)}
                  className="fzk-select"
                >
                  <option value="single">Single</option>
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="mfs">Married Filing Separately</option>
                  <option value="hoh">Head of Household</option>
                  <option value="qss">Qualifying Surviving Spouse</option>
                </select>
              </div>

              <div className="fzk-field">
                <label htmlFor={uid + '-deduction'} className="fzk-label">
                  Deductions
                </label>
                <select
                  id={uid + '-deduction'}
                  value={deductionType}
                  onChange={e => setDeductionType(e.target.value as 'standard' | 'custom')}
                  className="fzk-select"
                >
                  <option value="standard">Standard (with 65+ Senior Addition)</option>
                  <option value="custom">Itemized / Custom Amount</option>
                </select>
              </div>
            </div>

            {filingStatus === 'mfj' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.75rem' }}>
                <input
                  id={uid + '-spouse-65'}
                  type="checkbox"
                  checked={spouseAge65Plus}
                  onChange={e => setSpouseAge65Plus(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0A3D3A' }}
                />
                <label htmlFor={uid + '-spouse-65'} style={{ fontSize: '0.9rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
                  Spouse age 65 or older by December 31, 2026 (born before January 2, 1962), valid SSN, joint return required if married
                </label>
              </div>
            )}

            {deductionType === 'custom' && (
              <div className="fzk-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-custom-ded'} className="fzk-label">
                  Custom Total Deductions ($)
                </label>
                <input
                  id={uid + '-custom-ded'}
                  type="text"
                  value={customDeductionStr}
                  onChange={e => setCustomDeductionStr(e.target.value)}
                  className="fzk-input"
                  placeholder="e.g. 28000"
                />
              </div>
            )}

            <div className="fzk-field" style={{ marginTop: '0.75rem' }}>
              <label htmlFor={uid + '-credits'} className="fzk-label">
                Estimated Tax Credits ($/yr — Optional)
              </label>
              <input
                id={uid + '-credits'}
                type="text"
                value={creditsStr}
                onChange={e => setCreditsStr(e.target.value)}
                className="fzk-input"
                placeholder="e.g. 0"
              />
            </div>
          </div>

          <div className="fzk-input-group">
            <h3 className="fzk-group-title">
              <span className="fzk-step-num">3</span> Federal Tax Withholding Selection
            </h3>

            <div className="fzk-tabs">
              <button
                type="button"
                className={"fzk-tab " + (withholdingMode === 'percentage' ? 'active' : '')}
                onClick={() => setWithholdingMode('percentage')}
              >
                Withholding Percentage (%)
              </button>
              <button
                type="button"
                className={"fzk-tab " + (withholdingMode === 'dollar' ? 'active' : '')}
                onClick={() => setWithholdingMode('dollar')}
              >
                Fixed Dollar Amount ($)
              </button>
            </div>

            {withholdingMode === 'percentage' ? (
              <div className="fzk-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-withhold-pct'} className="fzk-label">
                  Federal Withholding Rate (%)
                </label>
                <div className="fzk-quick-rates">
                  {[0, 10, 15, 20, 22, 25].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      className={"fzk-quick-btn " + (withholdingPctStr === String(rate) ? 'selected' : '')}
                      onClick={() => setWithholdingPctStr(String(rate))}
                    >
                      {rate}% {rate === 20 ? '(401k Default)' : ''}
                    </button>
                  ))}
                </div>
                <input
                  id={uid + '-withhold-pct'}
                  type="number"
                  min="0"
                  max="100"
                  value={withholdingPctStr}
                  onChange={e => setWithholdingPctStr(e.target.value)}
                  className="fzk-input"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Custom %"
                />
                <span className="fzk-hint">
                  Under 26 U.S.C. § 3405(c), plan administrators are legally required to withhold <strong>20% mandatory federal tax</strong> on eligible rollover distributions paid directly to you, unless rolled over directly into another qualified plan or IRA.
                </span>
              </div>
            ) : (
              <div className="fzk-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-withhold-dollar'} className="fzk-label">
                  Dollar Amount to Withhold ($)
                </label>
                <input
                  id={uid + '-withhold-dollar'}
                  type="text"
                  value={withholdingDollarStr}
                  onChange={e => setWithholdingDollarStr(e.target.value)}
                  className="fzk-input"
                  placeholder="e.g. 5000"
                />
              </div>
            )}
          </div>
        </div>

        <div className="fzk-results-col">
          <div className="fzk-results-card">
            <span className="fzk-results-tag">2026 401(k) Withdrawal Estimate</span>

            <div className="fzk-hero-result">
              <span className="fzk-result-label">Estimated Amount You Receive (Take-Home)</span>
              <span className="fzk-hero-number">
                ${Math.round(netCashReceived).toLocaleString()}
              </span>
              <span className="fzk-hero-sub">
                Gross withdrawal of ${Math.round(grossWithdrawal).toLocaleString()} minus ${Math.round(selectedWithholdingDollar).toLocaleString()} federal withholding ({selectedWithholdingPct.toFixed(1)}%)
              </span>
            </div>

            <div className="fzk-metrics-grid">
              <div className="fzk-metric-box">
                <span className="fzk-m-label">Additional Federal Income Tax</span>
                <span className="fzk-m-val highlight-tax">
                  ${Math.round(incrementalFederalTax).toLocaleString()}
                </span>
                <span className="fzk-m-sub">{effectiveTaxRate.toFixed(1)}% effective rate</span>
              </div>

              <div className="fzk-metric-box">
                <span className="fzk-m-label">Possible Early Tax (10%)</span>
                <span className={"fzk-m-val " + (earlyPenaltyAmount > 0 ? 'highlight-penalty' : '')}>
                  ${Math.round(earlyPenaltyAmount).toLocaleString()}
                </span>
                <span className="fzk-m-sub">{penaltyApplies ? 'Under age 59½' : 'No penalty applicable'}</span>
              </div>

              <div className="fzk-metric-box">
                <span className="fzk-m-label">Total Tax Liability + Penalty</span>
                <span className="fzk-m-val">
                  ${Math.round(totalTaxPlusPenalty).toLocaleString()}
                </span>
                <span className="fzk-m-sub">Estimated total tax cost</span>
              </div>

              <div className="fzk-metric-box">
                <span className="fzk-m-label">Marginal Tax Bracket</span>
                <span className="fzk-m-val">{marginalBracket}%</span>
                <span className="fzk-m-sub">Rate on top withdrawal dollar</span>
              </div>
            </div>

            <div className="fzk-distinction-box">
              <h4>⚖️ Withholding Is Not Your Final Tax</h4>
              <p>
                Your plan administrator sends <strong>${Math.round(selectedWithholdingDollar).toLocaleString()}</strong> directly to the IRS as a prepayment. Your actual estimated tax and penalty impact on this withdrawal is <strong>${Math.round(totalTaxPlusPenalty).toLocaleString()}</strong>.
              </p>
              {withholdingVsActualDiff > 50 ? (
                <p className="fzk-diff-note positive">
                  💡 Your withholding exceeds the estimated tax liability by <strong>${Math.round(withholdingVsActualDiff).toLocaleString()}</strong>, which builds a buffer or refund on your Form 1040 return.
                </p>
              ) : withholdingVsActualDiff < -50 ? (
                <p className="fzk-diff-note negative">
                  ⚠️ Your withholding is <strong>${Math.round(Math.abs(withholdingVsActualDiff)).toLocaleString()}</strong> less than the estimated tax liability. You may owe the difference at tax time.
                </p>
              ) : (
                <p className="fzk-diff-note neutral">
                  🎯 Your selected withholding almost exactly matches your estimated tax liability on this distribution.
                </p>
              )}
            </div>

            {(ssIncrease > 0 || triggersIrmaa) && (
              <div className="fzk-interaction-box">
                <p className="fzk-int-title">⚡ Retirement Ripple Effects</p>
                {ssIncrease > 0 && (
                  <p className="fzk-int-item">
                    • <strong>Social Security:</strong> This withdrawal causes an additional <strong>${Math.round(ssIncrease).toLocaleString()}</strong> of your benefits to become taxable. Model this in our <a href="/tools/social-security-tax-calculator/">Social Security Tax Calculator</a>.
                  </p>
                )}
                {triggersIrmaa && (
                  <p className="fzk-int-item">
                    • <strong>Medicare IRMAA:</strong> Your total estimated AGI (${Math.round(agiWith).toLocaleString()}) exceeds the 2026 Tier 1 IRMAA threshold (${irmaaThreshold.toLocaleString()}), which may trigger Part B &amp; Part D premium surcharges two years later. Check our <a href="/tools/medicare-irmaa-calculator/">Medicare IRMAA Calculator</a>.
                  </p>
                )}
              </div>
            )}

            <div className="fzk-what-means">
              <h4>What This Means</h4>
              <p>
                You entered a <strong>${Math.round(grossWithdrawal).toLocaleString()}</strong> {accountType === 'traditional' ? 'traditional pre-tax' : accountType} 401(k) withdrawal. Based on your estimated income and {filingStatus.toUpperCase()} status, the withdrawal could add approximately <strong>${Math.round(incrementalFederalTax).toLocaleString()}</strong> in federal income tax{earlyPenaltyAmount > 0 ? ` plus $${Math.round(earlyPenaltyAmount).toLocaleString()} in early-distribution tax` : ''}. Withholding {selectedWithholdingPct.toFixed(1)}% leaves you approximately <strong>${Math.round(netCashReceived).toLocaleString()}</strong> in hand right now.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fzk-section-wrapper">
        <h3 className="fzk-comp-title">📊 Federal Withholding Rate Comparison</h3>
        <p className="fzk-comp-desc">
          See how different federal tax withholding percentages affect the cash you receive from your ${Math.round(grossWithdrawal).toLocaleString()} distribution vs. your estimated ${Math.round(totalTaxPlusPenalty).toLocaleString()} total tax obligation:
        </p>

        <div className="fzk-table-responsive">
          <table className="fzk-comp-table">
            <thead>
              <tr>
                <th>Withholding Rate</th>
                <th>Federal Tax Withheld</th>
                <th>Estimated Take-Home Cash</th>
                <th>Prepayment vs. Estimated Tax Liability</th>
              </tr>
            </thead>
            <tbody>
              {dynamicWithholdingTiers.map(t => (
                <tr key={t.pct} className={t.pct === parseFloat(withholdingPctStr) ? 'fzk-row-active' : ''}>
                  <td>
                    <strong>{t.pct}%</strong> {t.pct === 20 ? '(Mandatory 401k Default)' : ''}
                  </td>
                  <td>${Math.round(t.withheld).toLocaleString()}</td>
                  <td className="fzk-cash-cell">${Math.round(t.received).toLocaleString()}</td>
                  <td>
                    {t.diff > 50 ? (
                      <span className="fzk-badge-green">+${Math.round(t.diff).toLocaleString()} (Refund/Buffer)</span>
                    ) : t.diff < -50 ? (
                      <span className="fzk-badge-amber">-${Math.round(Math.abs(t.diff)).toLocaleString()} (May owe at filing)</span>
                    ) : (
                      <span className="fzk-badge-blue">Balanced Match</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fzk-section-wrapper">
        <h3 className="fzk-comp-title">💡 Partial vs. Larger Withdrawal Scenarios</h3>
        <p className="fzk-comp-desc">
          Compare how withdrawing different dollar amounts impacts your marginal tax bracket, total federal taxes, mandatory 20% withholding, and take-home cash:
        </p>

        <div className="fzk-table-responsive">
          <table className="fzk-comp-table">
            <thead>
              <tr>
                <th>Withdrawal Amount</th>
                <th>Marginal Bracket</th>
                <th>Est. Additional Federal Tax</th>
                <th>Possible Penalty (10%)</th>
                <th>20% Plan Withholding</th>
                <th>Est. Take-Home Cash</th>
              </tr>
            </thead>
            <tbody>
              {scenarioResults.map(s => (
                <tr key={s.amt}>
                  <td><strong>${s.amt.toLocaleString()}</strong></td>
                  <td>{s.marginal}%</td>
                  <td>${Math.round(s.incTax).toLocaleString()}</td>
                  <td>${Math.round(s.pen).toLocaleString()}</td>
                  <td>${Math.round(s.wHold).toLocaleString()}</td>
                  <td className="fzk-cash-cell">${Math.round(s.netRcv).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fzk-assumptions-wrapper">
        <button
          type="button"
          className="fzk-assumptions-toggle"
          onClick={() => setShowExceptions(!showExceptions)}
          aria-expanded={showExceptions}
        >
          <span>🛡️ Could an Early-Distribution Penalty Exception Apply?</span>
          <span>{showExceptions ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showExceptions && (
          <div className="fzk-assumptions-content">
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
              Under Internal Revenue Code § 72(t), several statutory exceptions waive the 10% additional early withdrawal tax for qualified employer plans like 401(k)s:
            </p>
            <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', lineHeight: '1.6' }}>
              <li><strong>Rule of 55:</strong> Separation from service during or after the calendar year in which you reach age 55 (age 50 for qualified public safety employees).</li>
              <li><strong>Total and Permanent Disability:</strong> Qualifying disability under IRS standards.</li>
              <li><strong>Unreimbursed Medical Expenses:</strong> Medical expenses exceeding 7.5% of your Adjusted Gross Income.</li>
              <li><strong>Qualified Domestic Relations Order (QDRO):</strong> Payments to an alternate payee under a court order.</li>
              <li><strong>Substantially Equal Periodic Payments (SEPP / Rule 72(t)):</strong> Fixed distributions based on IRS life expectancy tables over at least 5 years or until age 59½.</li>
              <li><strong>Emergency Personal Expenses &amp; Domestic Abuse (SECURE 2.0):</strong> Up to $1,000/yr for personal emergency expenses; up to $10,000 for victims of domestic abuse.</li>
            </ul>
            <p className="fzk-assumptions-note">
              * Note: You must file IRS Form 5329 with your federal tax return to claim an eligible exception code. Eligibility depends on specific plan terms and IRS documentation.
            </p>
          </div>
        )}
      </div>

      <div className="fzk-assumptions-wrapper" style={{ marginTop: '0.75rem' }}>
        <button
          type="button"
          className="fzk-assumptions-toggle"
          onClick={() => setShowAssumptions(!showAssumptions)}
          aria-expanded={showAssumptions}
        >
          <span>📋 View Calculation Assumptions &amp; Tax Parameters</span>
          <span>{showAssumptions ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showAssumptions && (
          <div className="fzk-assumptions-content">
            <div className="fzk-assumptions-grid">
              <div><strong>Tax Year:</strong> {TAX_PARAMS_2026.taxYear}</div>
              <div><strong>Account Type:</strong> {accountType}</div>
              <div><strong>Gross Withdrawal:</strong> ${Math.round(grossWithdrawal).toLocaleString()}</div>
              <div><strong>Taxable Portion:</strong> ${Math.round(taxablePortion).toLocaleString()}</div>
              <div><strong>Age / Rule:</strong> Age {age} ({penaltyApplies ? '10% early tax applies' : ruleOf55Applies ? 'Rule of 55 exempt' : 'Over 59½ exempt'})</div>
              <div><strong>Filing Status:</strong> {filingStatus.toUpperCase()}</div>
              <div><strong>Standard Deduction:</strong> ${Math.round(deduction).toLocaleString()}</div>
              <div><strong>Other Income:</strong> ${Math.round(otherIncome).toLocaleString()}</div>
              <div><strong>Taxable Social Security:</strong> ${Math.round(taxableSSWith).toLocaleString()}</div>
              <div><strong>Incremental Federal Tax:</strong> ${Math.round(incrementalFederalTax).toLocaleString()}</div>
              <div><strong>Federal Withholding:</strong> ${Math.round(selectedWithholdingDollar).toLocaleString()} ({selectedWithholdingPct.toFixed(1)}%)</div>
              <div><strong>Effective Tax Rate:</strong> {effectiveTaxRate.toFixed(1)}%</div>
            </div>
            <p className="fzk-assumptions-note">
              * Educational estimate based on federal tax parameters (IRS Rev. Proc. 2025-32), IRC § 402, and IRC § 72(t). Schedule 1-A Senior Deduction requires being age 65 or older by December 31, 2026 (born before January 2, 1962), valid SSN, joint return required if married. State and local taxes are not included. Plan provisions may impose additional restrictions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
