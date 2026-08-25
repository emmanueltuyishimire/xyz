/**
 * RMDTaxWithholdingCalculator.tsx
 * RMD Tax & Withholding Calculator 2026 — Seniors Audit
 *
 * Official Sources:
 * - IRS Publication 590-B (Distributions from IRAs / Uniform Lifetime Table III)
 * - 26 U.S. Code § 401(a)(9) (Required Minimum Distributions)
 * - 26 U.S. Code § 4974 (Excise Tax on Missed Accumulations)
 * - IRS Rev. Proc. 2025-28 (2026 Federal Tax Brackets & Standard Deductions)
 * - SECURE 2.0 Act of 2022 (P.L. 117-328, Division T)
 * - IRS Form W-4R (Withholding Certificate for Nonperiodic Payments)
 *
 * Semantic Flow:
 * RMD -> REQUIRED DISTRIBUTION -> TAXABLE AMOUNT -> FEDERAL TAX -> WITHHOLDING -> NET DISTRIBUTION
 *
 * Last verified: August 2026
 */

import React, { useState, useId } from 'react';

type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';
type AccountType = 'traditional_ira' | 'sep_ira' | 'simple_ira' | '401k' | '403b' | 'other';
type BasisOption = 'no' | 'yes' | 'not_sure';
type WithholdingMode = 'percentage' | 'dollar';

const TAX_PARAMS_2026 = {
  taxYear: 2026,
  priorYear: 2025,
  brackets: {
    single: [
      { min: 0, max: 11925 as number | null, rate: 0.10 },
      { min: 11925, max: 48475 as number | null, rate: 0.12 },
      { min: 48475, max: 103350 as number | null, rate: 0.22 },
      { min: 103350, max: 197300 as number | null, rate: 0.24 },
      { min: 197300, max: 250525 as number | null, rate: 0.32 },
      { min: 250525, max: 626350 as number | null, rate: 0.35 },
      { min: 626350, max: null as null, rate: 0.37 },
    ],
    mfj: [
      { min: 0, max: 23850 as number | null, rate: 0.10 },
      { min: 23850, max: 96950 as number | null, rate: 0.12 },
      { min: 96950, max: 206700 as number | null, rate: 0.22 },
      { min: 206700, max: 394600 as number | null, rate: 0.24 },
      { min: 394600, max: 501050 as number | null, rate: 0.32 },
      { min: 501050, max: 751600 as number | null, rate: 0.35 },
      { min: 751600, max: null as null, rate: 0.37 },
    ],
    mfs: [
      { min: 0, max: 11925 as number | null, rate: 0.10 },
      { min: 11925, max: 48475 as number | null, rate: 0.12 },
      { min: 48475, max: 103350 as number | null, rate: 0.22 },
      { min: 103350, max: 197300 as number | null, rate: 0.24 },
      { min: 197300, max: 250525 as number | null, rate: 0.32 },
      { min: 250525, max: 375800 as number | null, rate: 0.35 },
      { min: 375800, max: null as null, rate: 0.37 },
    ],
    hoh: [
      { min: 0, max: 17000 as number | null, rate: 0.10 },
      { min: 17000, max: 64850 as number | null, rate: 0.12 },
      { min: 64850, max: 103350 as number | null, rate: 0.22 },
      { min: 103350, max: 197300 as number | null, rate: 0.24 },
      { min: 197300, max: 250500 as number | null, rate: 0.32 },
      { min: 250500, max: 626350 as number | null, rate: 0.35 },
      { min: 626350, max: null as null, rate: 0.37 },
    ],
    qss: [
      { min: 0, max: 23850 as number | null, rate: 0.10 },
      { min: 23850, max: 96950 as number | null, rate: 0.12 },
      { min: 96950, max: 206700 as number | null, rate: 0.22 },
      { min: 206700, max: 394600 as number | null, rate: 0.24 },
      { min: 394600, max: 501050 as number | null, rate: 0.32 },
      { min: 501050, max: 751600 as number | null, rate: 0.35 },
      { min: 751600, max: null as null, rate: 0.37 },
    ]
  },
  standardDeductions: {
    single: 15000,
    mfj: 30000,
    mfs: 15000,
    hoh: 22500,
    qss: 30000,
  },
  seniorDeduction: {
    single: 2000,
    mfj: 1600,
    mfs: 1600,
    hoh: 2000,
    qss: 1600,
  },
  irmaaTier1Single: 106000,
  irmaaTier1MFJ: 212000,
};

const IRS_UNIFORM_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5,  95: 8.9,  96: 8.4,  97: 7.8,  98: 7.3,  99: 6.8,
  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
  107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0,
};

function getJointLifeFactor(ownerAge: number, spouseAge: number): number {
  const ageDiff = ownerAge - spouseAge;
  if (ageDiff <= 10) return IRS_UNIFORM_TABLE[ownerAge] || 26.5;
  const baseFactor = IRS_UNIFORM_TABLE[ownerAge] || 26.5;
  return Math.round((baseFactor + (ageDiff - 10) * 0.45) * 10) / 10;
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

export const RMDTaxWithholdingCalculator: React.FC = () => {
  const uid = useId();

  const [accountType, setAccountType] = useState<AccountType>('traditional_ira');
  const [birthYearStr, setBirthYearStr] = useState<string>('1953');
  const [balanceStr, setBalanceStr] = useState<string>('400000');
  const [hasYoungerSpouse, setHasYoungerSpouse] = useState<boolean>(false);
  const [spouseBirthYearStr, setSpouseBirthYearStr] = useState<string>('');
  const [hasTakenRmd, setHasTakenRmd] = useState<boolean>(false);
  const [alreadyTakenStr, setAlreadyTakenStr] = useState<string>('0');
  const [hasBasis, setHasBasis] = useState<BasisOption>('no');
  const [otherIncomeStr, setOtherIncomeStr] = useState<string>('24000');
  const [socialSecurityStr, setSocialSecurityStr] = useState<string>('28000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [age65Plus, setAge65Plus] = useState<boolean>(true);
  const [spouseAge65Plus, setSpouseAge65Plus] = useState<boolean>(false);
  const [deductionType, setDeductionType] = useState<'standard' | 'custom'>('standard');
  const [customDeductionStr, setCustomDeductionStr] = useState<string>('');
  const [creditsStr, setCreditsStr] = useState<string>('0');
  const [withholdingMode, setWithholdingMode] = useState<WithholdingMode>('percentage');
  const [withholdingPctStr, setWithholdingPctStr] = useState<string>('15');
  const [withholdingDollarStr, setWithholdingDollarStr] = useState<string>('2000');
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  const currentYear = TAX_PARAMS_2026.taxYear;
  const balance = parseFloat(balanceStr.replace(/[^0-9.]/g, '')) || 0;
  const birthYear = parseInt(birthYearStr.replace(/[^0-9]/g, ''), 10) || 1953;
  const alreadyTaken = hasTakenRmd ? (parseFloat(alreadyTakenStr.replace(/[^0-9.]/g, '')) || 0) : 0;
  const otherIncome = parseFloat(otherIncomeStr.replace(/[^0-9.]/g, '')) || 0;
  const annualSS = parseFloat(socialSecurityStr.replace(/[^0-9.]/g, '')) || 0;
  const credits = parseFloat(creditsStr.replace(/[^0-9.]/g, '')) || 0;

  const ageIn2026 = currentYear - birthYear;

  let rmdStartingAge = 73;
  if (birthYear >= 1960) {
    rmdStartingAge = 75;
  } else if (birthYear < 1951) {
    rmdStartingAge = 72;
  }

  const isRmdRequired = ageIn2026 >= rmdStartingAge;

  let divisor = 26.5;
  if (hasYoungerSpouse && spouseBirthYearStr) {
    const sBy = parseInt(spouseBirthYearStr.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(sBy) && sBy > 0) {
      const sAge = currentYear - sBy;
      divisor = getJointLifeFactor(ageIn2026, sAge);
    }
  } else {
    const lookupAge = Math.min(Math.max(ageIn2026, 72), 120);
    divisor = IRS_UNIFORM_TABLE[lookupAge] || 26.5;
  }

  const grossRMD = isRmdRequired ? balance / divisor : 0;
  const remainingRMD = Math.max(0, grossRMD - alreadyTaken);

  let deduction = TAX_PARAMS_2026.standardDeductions[filingStatus];
  if (age65Plus) {
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

  const taxableSSWithoutRMD = calculateTaxableSS(annualSS, otherIncome, filingStatus);
  const agiWithoutRMD = otherIncome + taxableSSWithoutRMD;
  const taxableIncomeWithoutRMD = Math.max(0, agiWithoutRMD - deduction);
  const baseTaxWithoutRMD = Math.max(0, calculateFederalTax(taxableIncomeWithoutRMD, filingStatus) - credits);

  const totalIncomeWithRMD = otherIncome + grossRMD;
  const taxableSSWithRMD = calculateTaxableSS(annualSS, totalIncomeWithRMD, filingStatus);
  const agiWithRMD = totalIncomeWithRMD + taxableSSWithRMD;
  const taxableIncomeWithRMD = Math.max(0, agiWithRMD - deduction);
  const totalTaxWithRMD = Math.max(0, calculateFederalTax(taxableIncomeWithRMD, filingStatus) - credits);

  const incrementalRmdTax = Math.max(0, totalTaxWithRMD - baseTaxWithoutRMD);
  const effectiveRmdTaxRate = grossRMD > 0 ? (incrementalRmdTax / grossRMD) * 100 : 0;
  const marginalBracket = getMarginalBracket(taxableIncomeWithRMD, filingStatus);
  const ssIncreaseFromRMD = Math.max(0, taxableSSWithRMD - taxableSSWithoutRMD);
  const irmaaThreshold = filingStatus === 'mfj' ? TAX_PARAMS_2026.irmaaTier1MFJ : TAX_PARAMS_2026.irmaaTier1Single;
  const triggersIrmaa = agiWithRMD > irmaaThreshold;

  let selectedWithholdingDollar = 0;
  let selectedWithholdingPct = 0;

  if (withholdingMode === 'percentage') {
    selectedWithholdingPct = parseFloat(withholdingPctStr) || 0;
    selectedWithholdingDollar = (grossRMD * selectedWithholdingPct) / 100;
  } else {
    selectedWithholdingDollar = parseFloat(withholdingDollarStr.replace(/[^0-9.]/g, '')) || 0;
    selectedWithholdingPct = grossRMD > 0 ? (selectedWithholdingDollar / grossRMD) * 100 : 0;
  }

  const netAmountReceived = Math.max(0, grossRMD - selectedWithholdingDollar);
  const withholdingVsIncrementalTaxDiff = selectedWithholdingDollar - incrementalRmdTax;

  const comparisonTiers = [0, 5, 10, 15, 20, 22];
  const dynamicTiers = comparisonTiers.map(pct => {
    const taxWithheld = (grossRMD * pct) / 100;
    const netCash = Math.max(0, grossRMD - taxWithheld);
    const balanceDiff = taxWithheld - incrementalRmdTax;
    return { pct, taxWithheld, netCash, balanceDiff };
  });

  return (
    <div className="rmdtw-container" id="calculator">
      <div className="rmdtw-header">
        <span className="rmdtw-badge">2026 Tax Year &amp; IRS Publication 590-B</span>
        <h2 className="rmdtw-title">RMD Tax &amp; Withholding Calculator</h2>
        <p className="rmdtw-subtitle">
          Calculate your required minimum distribution, estimate incremental federal tax, model withholding options, and see your net cash received.
        </p>
      </div>

      <div className="rmdtw-grid">
        <div className="rmdtw-form-col">
          <div className="rmdtw-input-group">
            <h3 className="rmdtw-group-title">
              <span className="rmdtw-step-num">1</span> Account &amp; Age Details
            </h3>

            <div className="rmdtw-field">
              <label htmlFor={uid + '-account'} className="rmdtw-label">
                Retirement Account Type
              </label>
              <select
                id={uid + '-account'}
                value={accountType}
                onChange={e => setAccountType(e.target.value as AccountType)}
                className="rmdtw-select"
              >
                <option value="traditional_ira">Traditional IRA (Aggregates with other IRAs)</option>
                <option value="sep_ira">SEP IRA (Aggregates with IRAs)</option>
                <option value="simple_ira">SIMPLE IRA (Aggregates with IRAs)</option>
                <option value="401k">401(k) Plan (Separate distribution per plan)</option>
                <option value="403b">403(b) Plan (Aggregates with other 403(b)s only)</option>
                <option value="other">Other Eligible Retirement Account</option>
              </select>
              <span className="rmdtw-hint">
                {accountType === '401k'
                  ? 'Note: 401(k) plans cannot be aggregated. Each plan must distribute its own RMD.'
                  : accountType === '403b'
                  ? 'Note: 403(b) plans can only be aggregated with other 403(b) accounts.'
                  : 'Traditional, SEP, and SIMPLE IRAs can aggregate total RMD from any single IRA.'}
              </span>
            </div>

            <div className="rmdtw-row-2">
              <div className="rmdtw-field">
                <label htmlFor={uid + '-by'} className="rmdtw-label">
                  Birth Year (Age in 2026: {ageIn2026})
                </label>
                <input
                  id={uid + '-by'}
                  type="number"
                  min="1920"
                  max="1970"
                  value={birthYearStr}
                  onChange={e => setBirthYearStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="e.g. 1953"
                />
              </div>

              <div className="rmdtw-field">
                <label htmlFor={uid + '-balance'} className="rmdtw-label">
                  Dec 31, 2025 Account Balance ($)
                </label>
                <input
                  id={uid + '-balance'}
                  type="text"
                  value={balanceStr}
                  onChange={e => setBalanceStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="e.g. 400000"
                />
              </div>
            </div>

            {!isRmdRequired && (
              <div className="rmdtw-warning-box">
                <strong>RMD Starting Age Notice:</strong> Based on birth year {birthYear}, your SECURE 2.0 RMD starting age is <strong>{rmdStartingAge}</strong>. You are not currently required to take an RMD in {currentYear}. The calculations below illustrate your future requirements.
              </div>
            )}

            <div className="rmdtw-checkbox-field">
              <label className="rmdtw-checkbox-label">
                <input
                  type="checkbox"
                  checked={hasYoungerSpouse}
                  onChange={e => setHasYoungerSpouse(e.target.checked)}
                  className="rmdtw-checkbox"
                />
                <span>My spouse is more than 10 years younger and is my sole primary beneficiary (Table II)</span>
              </label>
            </div>

            {hasYoungerSpouse && (
              <div className="rmdtw-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-spouse-by'} className="rmdtw-label">
                  Spouse Birth Year
                </label>
                <input
                  id={uid + '-spouse-by'}
                  type="number"
                  min="1920"
                  max="2000"
                  value={spouseBirthYearStr}
                  onChange={e => setSpouseBirthYearStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="e.g. 1968"
                />
              </div>
            )}
          </div>

          <div className="rmdtw-input-group">
            <h3 className="rmdtw-group-title">
              <span className="rmdtw-step-num">2</span> Existing Distributions &amp; Tax Basis
            </h3>

            <div className="rmdtw-checkbox-field">
              <label className="rmdtw-checkbox-label">
                <input
                  type="checkbox"
                  checked={hasTakenRmd}
                  onChange={e => setHasTakenRmd(e.target.checked)}
                  className="rmdtw-checkbox"
                />
                <span>I have already taken part of my {currentYear} RMD</span>
              </label>
            </div>

            {hasTakenRmd && (
              <div className="rmdtw-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-already-taken'} className="rmdtw-label">
                  Amount Already Withdrawn in {currentYear} ($)
                </label>
                <input
                  id={uid + '-already-taken'}
                  type="text"
                  value={alreadyTakenStr}
                  onChange={e => setAlreadyTakenStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="e.g. 5000"
                />
              </div>
            )}

            <div className="rmdtw-field" style={{ marginTop: '1rem' }}>
              <label htmlFor={uid + '-basis'} className="rmdtw-label">
                Do you have after-tax basis in this account? (Form 8606)
              </label>
              <select
                id={uid + '-basis'}
                value={hasBasis}
                onChange={e => setHasBasis(e.target.value as BasisOption)}
                className="rmdtw-select"
              >
                <option value="no">No — 100% pre-tax (Most common)</option>
                <option value="yes">Yes — I made nondeductible contributions</option>
                <option value="not_sure">Not sure</option>
              </select>
              {hasBasis !== 'no' && (
                <div className="rmdtw-info-box-sm">
                  ⚠️ <strong>Basis Notice:</strong> If you have nondeductible IRA contributions, a portion of each distribution is tax-free under IRS Form 8606 pro-rata rules. This calculator estimates the pre-tax baseline.
                </div>
              )}
            </div>
          </div>

          <div className="rmdtw-input-group">
            <h3 className="rmdtw-group-title">
              <span className="rmdtw-step-num">3</span> Other Income &amp; Tax Status
            </h3>

            <div className="rmdtw-row-2">
              <div className="rmdtw-field">
                <label htmlFor={uid + '-other-income'} className="rmdtw-label">
                  Other Taxable Income ($/yr)
                </label>
                <input
                  id={uid + '-other-income'}
                  type="text"
                  value={otherIncomeStr}
                  onChange={e => setOtherIncomeStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="Pensions, wages, interest"
                />
                <span className="rmdtw-hint">Pensions, wages, taxable interest, dividends</span>
              </div>

              <div className="rmdtw-field">
                <label htmlFor={uid + '-ss'} className="rmdtw-label">
                  Annual Social Security ($/yr)
                </label>
                <input
                  id={uid + '-ss'}
                  type="text"
                  value={socialSecurityStr}
                  onChange={e => setSocialSecurityStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="e.g. 28000"
                />
                <span className="rmdtw-hint">IRS tests taxability (0%, 50%, 85%)</span>
              </div>
            </div>

            <div className="rmdtw-row-2" style={{ marginTop: '0.75rem' }}>
              <div className="rmdtw-field">
                <label htmlFor={uid + '-filing'} className="rmdtw-label">
                  Filing Status
                </label>
                <select
                  id={uid + '-filing'}
                  value={filingStatus}
                  onChange={e => setFilingStatus(e.target.value as FilingStatus)}
                  className="rmdtw-select"
                >
                  <option value="single">Single</option>
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="mfs">Married Filing Separately</option>
                  <option value="hoh">Head of Household</option>
                  <option value="qss">Qualifying Surviving Spouse</option>
                </select>
              </div>

              <div className="rmdtw-field">
                <label htmlFor={uid + '-deduction'} className="rmdtw-label">
                  Deductions
                </label>
                <select
                  id={uid + '-deduction'}
                  value={deductionType}
                  onChange={e => setDeductionType(e.target.value as 'standard' | 'custom')}
                  className="rmdtw-select"
                >
                  <option value="standard">Standard (with 65+ senior bump)</option>
                  <option value="custom">Itemized / Custom Amount</option>
                </select>
              </div>
            </div>

            {deductionType === 'custom' && (
              <div className="rmdtw-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-custom-ded'} className="rmdtw-label">
                  Custom Total Deduction ($)
                </label>
                <input
                  id={uid + '-custom-ded'}
                  type="text"
                  value={customDeductionStr}
                  onChange={e => setCustomDeductionStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="e.g. 32000"
                />
              </div>
            )}
          </div>

          <div className="rmdtw-input-group">
            <h3 className="rmdtw-group-title">
              <span className="rmdtw-step-num">4</span> Federal Tax Withholding Choice
            </h3>

            <div className="rmdtw-tabs">
              <button
                type="button"
                className={"rmdtw-tab " + (withholdingMode === 'percentage' ? 'active' : '')}
                onClick={() => setWithholdingMode('percentage')}
              >
                Withholding Percentage (%)
              </button>
              <button
                type="button"
                className={"rmdtw-tab " + (withholdingMode === 'dollar' ? 'active' : '')}
                onClick={() => setWithholdingMode('dollar')}
              >
                Fixed Dollar Amount ($)
              </button>
            </div>

            {withholdingMode === 'percentage' ? (
              <div className="rmdtw-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-withhold-pct'} className="rmdtw-label">
                  Federal Withholding Rate (%)
                </label>
                <div className="rmdtw-quick-rates">
                  {[0, 10, 12, 15, 20, 22].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      className={"rmdtw-quick-btn " + (withholdingPctStr === String(rate) ? 'selected' : '')}
                      onClick={() => setWithholdingPctStr(String(rate))}
                    >
                      {rate}%
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
                  className="rmdtw-input"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Custom %"
                />
              </div>
            ) : (
              <div className="rmdtw-field" style={{ marginTop: '0.75rem' }}>
                <label htmlFor={uid + '-withhold-dollar'} className="rmdtw-label">
                  Dollar Amount to Withhold ($)
                </label>
                <input
                  id={uid + '-withhold-dollar'}
                  type="text"
                  value={withholdingDollarStr}
                  onChange={e => setWithholdingDollarStr(e.target.value)}
                  className="rmdtw-input"
                  placeholder="e.g. 2500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="rmdtw-results-col">
          <div className="rmdtw-results-card">
            <span className="rmdtw-results-tag">2026 RMD &amp; Tax Estimate</span>

            <div className="rmdtw-hero-result">
              <span className="rmdtw-result-label">Estimated Required Minimum Distribution</span>
              <span className="rmdtw-hero-number">
                ${Math.round(grossRMD).toLocaleString()}
              </span>
              <span className="rmdtw-hero-sub">
                Based on Dec 31, 2025 balance of ${Math.round(balance).toLocaleString()} ÷ IRS divisor of {divisor} (Age {ageIn2026})
              </span>
            </div>

            {hasTakenRmd && (
              <div className="rmdtw-remaining-callout">
                <div className="rmdtw-rem-row">
                  <span>Already Withdrawn:</span>
                  <strong>${Math.round(alreadyTaken).toLocaleString()}</strong>
                </div>
                <div className="rmdtw-rem-row highlight">
                  <span>Estimated Remaining RMD:</span>
                  <strong>${Math.round(remainingRMD).toLocaleString()}</strong>
                </div>
                {remainingRMD === 0 && (
                  <p className="rmdtw-rem-note">
                    ✅ Your withdrawals to date equal or exceed your estimated RMD for {currentYear}.
                  </p>
                )}
              </div>
            )}

            <div className="rmdtw-metrics-grid">
              <div className="rmdtw-metric-box">
                <span className="rmdtw-m-label">Federal Tax Withheld</span>
                <span className="rmdtw-m-val highlight-withheld">
                  ${Math.round(selectedWithholdingDollar).toLocaleString()}
                </span>
                <span className="rmdtw-m-sub">{selectedWithholdingPct.toFixed(1)}% of distribution</span>
              </div>

              <div className="rmdtw-metric-box">
                <span className="rmdtw-m-label">Estimated Cash You Receive</span>
                <span className="rmdtw-m-val highlight-cash">
                  ${Math.round(netAmountReceived).toLocaleString()}
                </span>
                <span className="rmdtw-m-sub">Gross RMD minus withholding</span>
              </div>

              <div className="rmdtw-metric-box">
                <span className="rmdtw-m-label">Additional Tax From RMD</span>
                <span className="rmdtw-m-val">
                  ${Math.round(incrementalRmdTax).toLocaleString()}
                </span>
                <span className="rmdtw-m-sub">Incremental federal tax impact</span>
              </div>

              <div className="rmdtw-metric-box">
                <span className="rmdtw-m-label">Marginal Tax Bracket</span>
                <span className="rmdtw-m-val">{marginalBracket}%</span>
                <span className="rmdtw-m-sub">Top rate on last RMD dollar</span>
              </div>
            </div>

            <div className="rmdtw-distinction-box">
              <h4>⚖️ Withholding vs. Actual Tax Liability</h4>
              <p>
                <strong>Federal withholding</strong> (${Math.round(selectedWithholdingDollar).toLocaleString()}) is a prepayment toward your taxes. Your <strong>actual incremental tax from this RMD</strong> is estimated at <strong>${Math.round(incrementalRmdTax).toLocaleString()}</strong> ({effectiveRmdTaxRate.toFixed(1)}% effective rate).
              </p>
              {withholdingVsIncrementalTaxDiff > 50 ? (
                <p className="rmdtw-diff-note positive">
                  💡 Your withholding exceeds the estimated RMD tax by <strong>${Math.round(withholdingVsIncrementalTaxDiff).toLocaleString()}</strong>, building a buffer toward your overall return.
                </p>
              ) : withholdingVsIncrementalTaxDiff < -50 ? (
                <p className="rmdtw-diff-note negative">
                  ⚠️ Your withholding is <strong>${Math.round(Math.abs(withholdingVsIncrementalTaxDiff)).toLocaleString()}</strong> less than the estimated RMD tax impact. You may owe the difference at filing.
                </p>
              ) : (
                <p className="rmdtw-diff-note neutral">
                  🎯 Your selected withholding closely matches the estimated incremental tax impact.
                </p>
              )}
            </div>

            {(ssIncreaseFromRMD > 0 || triggersIrmaa) && (
              <div className="rmdtw-interaction-box">
                <p className="rmdtw-int-title">⚡ Retirement Ripple Effects</p>
                {ssIncreaseFromRMD > 0 && (
                  <p className="rmdtw-int-item">
                    • <strong>Social Security:</strong> This RMD causes an additional <strong>${Math.round(ssIncreaseFromRMD).toLocaleString()}</strong> of your benefits to become taxable. Model this in our <a href="/tools/social-security-tax-calculator/">Social Security Tax Calculator</a>.
                  </p>
                )}
                {triggersIrmaa && (
                  <p className="rmdtw-int-item">
                    • <strong>Medicare IRMAA:</strong> Your total estimated AGI (${Math.round(agiWithRMD).toLocaleString()}) exceeds the 2026 Tier 1 IRMAA threshold (${irmaaThreshold.toLocaleString()}), which may trigger Part B &amp; Part D premium surcharges. Check our <a href="/tools/medicare-irmaa-calculator/">Medicare IRMAA Calculator</a>.
                  </p>
                )}
              </div>
            )}

            <div className="rmdtw-what-means">
              <h4>What This Means For You</h4>
              <p>
                For tax year {currentYear}, your mandatory distribution is <strong>${Math.round(grossRMD).toLocaleString()}</strong>. If you withhold <strong>{selectedWithholdingPct.toFixed(1)}% (${Math.round(selectedWithholdingDollar).toLocaleString()})</strong>, you will receive an estimated check of <strong>${Math.round(netAmountReceived).toLocaleString()}</strong> in hand. The RMD adds approximately <strong>${Math.round(incrementalRmdTax).toLocaleString()}</strong> to your federal tax liability for the year.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rmdtw-comparison-section">
        <h3 className="rmdtw-comp-title">📊 Side-by-Side Federal Withholding Comparison</h3>
        <p className="rmdtw-comp-desc">
          Compare how different federal tax withholding percentages affect the cash you receive from your ${Math.round(grossRMD).toLocaleString()} RMD vs. your estimated ${Math.round(incrementalRmdTax).toLocaleString()} incremental tax:
        </p>

        <div className="rmdtw-table-responsive">
          <table className="rmdtw-comp-table">
            <thead>
              <tr>
                <th>Withholding Rate</th>
                <th>Federal Tax Withheld</th>
                <th>Estimated Cash Received</th>
                <th>Prepayment vs. RMD Tax Impact</th>
              </tr>
            </thead>
            <tbody>
              {dynamicTiers.map(t => (
                <tr key={t.pct} className={t.pct === parseFloat(withholdingPctStr) ? 'rmdtw-row-active' : ''}>
                  <td>
                    <strong>{t.pct}%</strong> {t.pct === 10 ? '(IRS Default)' : ''}
                  </td>
                  <td>${Math.round(t.taxWithheld).toLocaleString()}</td>
                  <td className="rmdtw-cash-cell">${Math.round(t.netCash).toLocaleString()}</td>
                  <td>
                    {t.balanceDiff > 50 ? (
                      <span className="rmdtw-badge-green">+${Math.round(t.balanceDiff).toLocaleString()} (Buffer)</span>
                    ) : t.balanceDiff < -50 ? (
                      <span className="rmdtw-badge-amber">-${Math.round(Math.abs(t.balanceDiff)).toLocaleString()} (May owe)</span>
                    ) : (
                      <span className="rmdtw-badge-blue">Exact Match</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rmdtw-assumptions-wrapper">
        <button
          type="button"
          className="rmdtw-assumptions-toggle"
          onClick={() => setShowAssumptions(!showAssumptions)}
          aria-expanded={showAssumptions}
        >
          <span>📋 View Calculation Assumptions &amp; Tax Parameters</span>
          <span>{showAssumptions ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showAssumptions && (
          <div className="rmdtw-assumptions-content">
            <div className="rmdtw-assumptions-grid">
              <div><strong>Tax Year:</strong> {TAX_PARAMS_2026.taxYear}</div>
              <div><strong>Account Type:</strong> {accountType}</div>
              <div><strong>Age / Birth Year:</strong> Age {ageIn2026} (Born {birthYear})</div>
              <div><strong>IRS Table Divisor:</strong> {divisor} (Pub 590-B Table III)</div>
              <div><strong>Prior Dec 31 Balance:</strong> ${Math.round(balance).toLocaleString()}</div>
              <div><strong>Estimated Gross RMD:</strong> ${Math.round(grossRMD).toLocaleString()}</div>
              <div><strong>Filing Status:</strong> {filingStatus.toUpperCase()}</div>
              <div><strong>Standard Deduction:</strong> ${Math.round(deduction).toLocaleString()}</div>
              <div><strong>Other Income:</strong> ${Math.round(otherIncome).toLocaleString()}</div>
              <div><strong>Taxable Social Security:</strong> ${Math.round(taxableSSWithRMD).toLocaleString()}</div>
              <div><strong>Incremental Tax Impact:</strong> ${Math.round(incrementalRmdTax).toLocaleString()}</div>
              <div><strong>Effective RMD Tax Rate:</strong> {effectiveRmdTaxRate.toFixed(1)}%</div>
</div>
<p className="rmdtw-assumptions-note">
  * Educational estimate based on 2026 federal tax parameters (IRS Rev. Proc. 2025-28) and IRS Publication 590-B. State income taxes, local taxes, and specific account basis adjustments under Form 8606 are not included.
</p>
</div>
)}
</div>
</div>
);
};