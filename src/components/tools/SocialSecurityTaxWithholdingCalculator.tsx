/**
 * SocialSecurityTaxWithholdingCalculator.tsx
 * Social Security Tax Withholding Calculator 2026 — Seniors Audit
 *
 * Official Sources:
 * - IRS Form W-4V (Voluntary Withholding Request for Social Security: 7%, 10%, 12%, 22%)
 * - IRS Publication 915 (Social Security Benefits Taxability Methodology)
 * - IRS Rev. Proc. 2025-32 (2026 Federal Tax Brackets & Standard Deductions)
 * - SSA Publication 05-10153 (Tax Withholding From Benefits)
 *
 * Last verified: August 2026
 */

import React, { useState, useCallback } from 'react';

// ── TYPES ─────────────────────────────────────────────────────────────────────

type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';

interface Inputs {
  benefitMode: 'monthly' | 'annual';
  monthlySS: number;
  annualSS: number;
  filingStatus: FilingStatus;
  age65Plus: boolean;
  spouseAge65Plus: boolean;
  pensionIncome: number;
  ira401kWithdrawals: number;
  wagesIncome: number;
  otherTaxableIncome: number;
  taxExemptInterest: number;
  otherWithholding: number;
  estimatedTaxPayments: number;
  withholdingChoice: 'suggested' | '0' | '7' | '10' | '12' | '22' | 'custom_pct' | 'custom_dollar';
  customPct: number;
  customDollar: number;
}

interface WithholdingTierResult {
  rateLabel: string;
  ratePct: number;
  annualWithholding: number;
  monthlyWithholding: number;
  netMonthlySS: number;
  totalPayments: number;
  projectedBalance: number; // positive = owe in April, negative = refund
}

interface CalculationResult {
  annualSS: number;
  monthlySS: number;
  halfSS: number;
  combinedIncome: number;
  taxableSS: number;
  taxableSSPercent: number;
  totalOtherIncome: number;
  agi: number;
  standardDeduction: number;
  taxableIncome: number;
  totalFederalTax: number;
  effectiveTaxRate: number;
  marginalTaxBracket: number;
  existingPrepayments: number;
  netTaxNeeded: number;
  exactWithholdingPctNeeded: number;
  recommendedW4VRate: number;
  selectedAnnualWithholding: number;
  selectedMonthlyWithholding: number;
  selectedNetMonthlySS: number;
  selectedProjectedBalance: number;
  tiers: WithholdingTierResult[];
}

// ── 2026 FEDERAL TAX DATA ─────────────────────────────────────────────────────
// Source: IRS Rev. Proc. 2025-32

const TAX_2026 = {
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
    ],
  },
  standardDeductions: {
    single: 16100,
    mfj: 32200,
    mfs: 16100,
    hoh: 24150,
    qss: 32200,
  },
  seniorAddl: {
    singleHoh: 2050,
    marriedSpouse: 1650,
  },
  ssThresholds: {
    single: { tier1: 25000, tier2: 34000 },
    mfj: { tier1: 32000, tier2: 44000 },
    mfs: { tier1: 0, tier2: 0 },
    hoh: { tier1: 25000, tier2: 34000 },
    qss: { tier1: 32000, tier2: 44000 },
  },
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

// ── CALCULATION ENGINE ────────────────────────────────────────────────────────

function calculateFederalTax(taxableIncome: number, filingStatus: FilingStatus) {
  const brackets = TAX_2026.brackets[filingStatus];
  let tax = 0;
  let marginalRate = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const top = b.max !== null ? Math.min(taxableIncome, b.max) : taxableIncome;
    tax += (top - b.min) * b.rate;
    marginalRate = b.rate;
  }
  return { tax: Math.max(0, tax), marginalRate };
}

function calculateTaxableSS(halfSS: number, combinedIncome: number, annualSS: number, status: FilingStatus): number {
  const thresh = TAX_2026.ssThresholds[status];
  if (status === 'mfs') {
    return Math.max(0, Math.min(0.85 * annualSS, 0.85 * combinedIncome));
  }
  if (combinedIncome <= thresh.tier1) return 0;
  if (combinedIncome <= thresh.tier2) {
    return Math.min(halfSS, 0.5 * (combinedIncome - thresh.tier1));
  }
  const tier1Taxable = Math.min(halfSS, 0.5 * (thresh.tier2 - thresh.tier1));
  const tier2Taxable = 0.85 * (combinedIncome - thresh.tier2);
  return Math.min(tier1Taxable + tier2Taxable, 0.85 * annualSS);
}

function runWithholdingCalculation(inputs: Inputs): CalculationResult {
  const annualSS = inputs.benefitMode === 'monthly' ? inputs.monthlySS * 12 : inputs.annualSS;
  const monthlySS = annualSS / 12;
  const halfSS = annualSS * 0.5;

  const totalOtherIncome =
    inputs.pensionIncome +
    inputs.ira401kWithdrawals +
    inputs.wagesIncome +
    inputs.otherTaxableIncome;

  const combinedIncome = totalOtherIncome + inputs.taxExemptInterest + halfSS;
  const taxableSS = calculateTaxableSS(halfSS, combinedIncome, annualSS, inputs.filingStatus);
  const taxableSSPercent = annualSS > 0 ? (taxableSS / annualSS) * 100 : 0;

  // Standard deduction with senior add-on
  let standardDeduction = TAX_2026.standardDeductions[inputs.filingStatus];
  if (inputs.age65Plus) {
    standardDeduction += (inputs.filingStatus === 'single' || inputs.filingStatus === 'hoh')
      ? TAX_2026.seniorAddl.singleHoh
      : TAX_2026.seniorAddl.marriedSpouse;
  }
  if (inputs.filingStatus === 'mfj' && inputs.spouseAge65Plus) {
    standardDeduction += TAX_2026.seniorAddl.marriedSpouse;
  }

  const agi = totalOtherIncome + taxableSS;
  const enhancedSeniorDed = calcEnhancedSeniorDeduction(agi, inputs.filingStatus, inputs.age65Plus, inputs.spouseAge65Plus);
  const taxableIncome = Math.max(0, agi - standardDeduction - enhancedSeniorDed);
  const { tax: totalFederalTax, marginalRate } = calculateFederalTax(taxableIncome, inputs.filingStatus);
  const effectiveTaxRate = (annualSS + totalOtherIncome) > 0 ? (totalFederalTax / (annualSS + totalOtherIncome)) * 100 : 0;

  const existingPrepayments = inputs.otherWithholding + inputs.estimatedTaxPayments;
  const netTaxNeeded = Math.max(0, totalFederalTax - existingPrepayments);

  const exactWithholdingPctNeeded = annualSS > 0 ? (netTaxNeeded / annualSS) * 100 : 0;

  // Find nearest official Form W-4V rate (0, 7, 10, 12, 22)
  const w4vRates = [0, 7, 10, 12, 22];
  let recommendedW4VRate = 0;
  if (exactWithholdingPctNeeded > 0) {
    let closest = w4vRates[0];
    let minDiff = Math.abs(exactWithholdingPctNeeded - closest);
    for (const r of w4vRates) {
      const diff = Math.abs(exactWithholdingPctNeeded - r);
      if (diff < minDiff) {
        minDiff = diff;
        closest = r;
      }
    }
    recommendedW4VRate = closest;
  }

  // Generate comparison tiers for all Form W-4V rates + custom
  const tiersToEval: { label: string; rate: number }[] = [
    { label: '0% (No Withholding)', rate: 0 },
    { label: '7% (Form W-4V)', rate: 7 },
    { label: '10% (Form W-4V)', rate: 10 },
    { label: '12% (Form W-4V)', rate: 12 },
    { label: '22% (Form W-4V)', rate: 22 },
  ];

  const tiers: WithholdingTierResult[] = tiersToEval.map(t => {
    const annualW = annualSS * (t.rate / 100);
    const monthlyW = annualW / 12;
    const netMonthly = monthlySS - monthlyW;
    const totalPay = existingPrepayments + annualW;
    const projectedBalance = totalFederalTax - totalPay;
    return {
      rateLabel: t.label,
      ratePct: t.rate,
      annualWithholding: annualW,
      monthlyWithholding: monthlyW,
      netMonthlySS: netMonthly,
      totalPayments: totalPay,
      projectedBalance,
    };
  });

  // Calculate selected withholding based on user's choice
  let selectedAnnualWithholding = 0;
  if (inputs.withholdingChoice === 'suggested') {
    selectedAnnualWithholding = annualSS * (recommendedW4VRate / 100);
  } else if (inputs.withholdingChoice === 'custom_pct') {
    selectedAnnualWithholding = annualSS * (Math.min(100, Math.max(0, inputs.customPct)) / 100);
  } else if (inputs.withholdingChoice === 'custom_dollar') {
    selectedAnnualWithholding = Math.min(annualSS, Math.max(0, inputs.customDollar));
  } else {
    const rateNum = parseFloat(inputs.withholdingChoice);
    selectedAnnualWithholding = annualSS * (rateNum / 100);
  }

  const selectedMonthlyWithholding = selectedAnnualWithholding / 12;
  const selectedNetMonthlySS = monthlySS - selectedMonthlyWithholding;
  const selectedTotalPayments = existingPrepayments + selectedAnnualWithholding;
  const selectedProjectedBalance = totalFederalTax - selectedTotalPayments;

  return {
    annualSS,
    monthlySS,
    halfSS,
    combinedIncome,
    taxableSS,
    taxableSSPercent,
    totalOtherIncome,
    agi,
    standardDeduction,
    taxableIncome,
    totalFederalTax,
    effectiveTaxRate,
    marginalTaxBracket: marginalRate * 100,
    existingPrepayments,
    netTaxNeeded,
    exactWithholdingPctNeeded,
    recommendedW4VRate,
    selectedAnnualWithholding,
    selectedMonthlyWithholding,
    selectedNetMonthlySS,
    selectedProjectedBalance,
    tiers,
  };
}

// ── FORMATTING HELPERS ────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n: number) => `${n.toFixed(1)}%`;

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function SocialSecurityTaxWithholdingCalculator() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [inputs, setInputs] = useState<Inputs>({
    benefitMode: 'monthly',
    monthlySS: 2200,
    annualSS: 26400,
    filingStatus: 'single',
    age65Plus: true,
    spouseAge65Plus: false,
    pensionIncome: 0,
    ira401kWithdrawals: 0,
    wagesIncome: 0,
    otherTaxableIncome: 0,
    taxExemptInterest: 0,
    otherWithholding: 0,
    estimatedTaxPayments: 0,
    withholdingChoice: 'suggested',
    customPct: 10,
    customDollar: 2640,
  });

  const setField = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'monthlySS' && typeof value === 'number') {
        updated.annualSS = value * 12;
      } else if (key === 'annualSS' && typeof value === 'number') {
        updated.monthlySS = Math.round(value / 12);
      }
      return updated;
    });
    setErrors(prev => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  const numField = (key: keyof Inputs, raw: string) => {
    const val = parseFloat(raw.replace(/[^0-9.]/g, ''));
    setField(key, (isNaN(val) ? 0 : val) as Inputs[typeof key]);
  };

  function validate() {
    const errs: Record<string, string> = {};
    if (inputs.benefitMode === 'monthly' && inputs.monthlySS < 0) {
      errs.monthlySS = 'Enter a valid monthly benefit amount.';
    }
    if (inputs.benefitMode === 'annual' && inputs.annualSS < 0) {
      errs.annualSS = 'Enter a valid annual benefit amount.';
    }
    if (inputs.customPct < 0 || inputs.customPct > 100) {
      errs.customPct = 'Enter a percentage between 0% and 100%.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    const r = runWithholdingCalculation(inputs);
    setResult(r);
    setTimeout(() => {
      document.getElementById('sstw-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleReset() {
    setResult(null);
    setStep(1);
    setErrors({});
  }

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;
  const stepLabels = [
    '📋 Step 1 of 3: Social Security & Filing Status',
    '💵 Step 2 of 3: Other Income & Prepayments',
    '⚙️ Step 3 of 3: Withholding Options & Target',
  ];
  const tabLabels = ['Benefit & Status', 'Other Income', 'Withholding Rate'];

  const isMFJ = inputs.filingStatus === 'mfj';

  return (
    <div className="sstw-wrap" id="calculator">

      {/* ── PROGRESS BAR ── */}
      {!result && (
        <div className="sstw-progress-bar">
          <div className="sstw-prog-meta">
            <span className="sstw-prog-label">{stepLabels[step - 1]}</span>
            <span className="sstw-prog-pct">{progressPct}% Complete</span>
          </div>
          <div className="sstw-prog-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="sstw-prog-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* ── STEP TABS ── */}
      {!result && (
        <div className="sstw-tabs" role="tablist" aria-label="Calculator steps">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              role="tab"
              aria-selected={step === s}
              className={'sstw-tab' + (step === s ? ' active' : step > s ? ' done' : '')}
              onClick={() => setStep(s)}
            >
              <span className="sstw-tab-num">{step > s ? '✓' : s}</span>
              <span className="sstw-tab-text">{tabLabels[s - 1]}</span>
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 1: Benefit Amount & Filing Status
          ══════════════════════════════════════════════════════ */}
      {!result && step === 1 && (
        <div className="sstw-card">
          <h2 className="sstw-card-h">Step 1 — Your Social Security &amp; Filing Status</h2>
          <p className="sstw-card-sub">
            Enter your benefit amount and tax filing status. You can enter your check monthly or annually.
          </p>

          <div className="sstw-group">
            <label className="sstw-label">How would you like to enter your Social Security benefit?</label>
            <div className="sstw-toggle-row">
              <button
                type="button"
                className={'sstw-toggle-btn' + (inputs.benefitMode === 'monthly' ? ' active' : '')}
                onClick={() => setField('benefitMode', 'monthly')}
              >
                Monthly Benefit ($)
              </button>
              <button
                type="button"
                className={'sstw-toggle-btn' + (inputs.benefitMode === 'annual' ? ' active' : '')}
                onClick={() => setField('benefitMode', 'annual')}
              >
                Annual Total ($)
              </button>
            </div>
          </div>

          {inputs.benefitMode === 'monthly' ? (
            <div className="sstw-group">
              <label htmlFor="sstw-ss-monthly" className="sstw-label">
                Gross Monthly Social Security Benefit <span className="sstw-req">*</span>
              </label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-ss-monthly"
                  type="number"
                  min="0"
                  step="50"
                  className={'sstw-input' + (errors.monthlySS ? ' error' : '')}
                  placeholder="e.g. 2200"
                  value={inputs.monthlySS || ''}
                  onChange={e => numField('monthlySS', e.target.value)}
                />
              </div>
              {errors.monthlySS && <p className="sstw-err" role="alert">{errors.monthlySS}</p>}
              <p className="sstw-help">
                Gross monthly amount before Medicare Part B is deducted. Annual equivalent: <strong>{fmt(inputs.monthlySS * 12)}</strong>.
              </p>
            </div>
          ) : (
            <div className="sstw-group">
              <label htmlFor="sstw-ss-annual" className="sstw-label">
                Gross Annual Social Security Benefit <span className="sstw-req">*</span>
              </label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-ss-annual"
                  type="number"
                  min="0"
                  step="500"
                  className={'sstw-input' + (errors.annualSS ? ' error' : '')}
                  placeholder="e.g. 26400"
                  value={inputs.annualSS || ''}
                  onChange={e => numField('annualSS', e.target.value)}
                />
              </div>
              {errors.annualSS && <p className="sstw-err" role="alert">{errors.annualSS}</p>}
              <p className="sstw-help">
                Found on Box 3 of your Form SSA-1099. Monthly equivalent: <strong>{fmt(Math.round(inputs.annualSS / 12))}</strong>.
              </p>
            </div>
          )}

          <div className="sstw-group">
            <label htmlFor="sstw-fs" className="sstw-label">
              Federal Tax Filing Status <span className="sstw-req">*</span>
            </label>
            <select
              id="sstw-fs"
              className="sstw-select"
              value={inputs.filingStatus}
              onChange={e => setField('filingStatus', e.target.value as FilingStatus)}
            >
              <option value="single">Single</option>
              <option value="mfj">Married Filing Jointly</option>
              <option value="mfs">Married Filing Separately</option>
              <option value="hoh">Head of Household</option>
              <option value="qss">Qualifying Surviving Spouse</option>
            </select>
            {inputs.filingStatus === 'mfs' && (
              <p className="sstw-warn-note">
                ⚠️ <strong>Married Filing Separately:</strong> If you lived with your spouse during the year, your taxability threshold is $0. Up to 85% of your benefits are taxable from dollar one, making voluntary withholding especially valuable.
              </p>
            )}
          </div>

          <div className="sstw-age-row">
            <label className="sstw-check-label">
              <input
                type="checkbox"
                checked={inputs.age65Plus}
                onChange={e => setField('age65Plus', e.target.checked)}
                className="sstw-check"
              />
              I am age 65 or older (Qualifies for +$2,050 / +$1,650 senior deduction)
            </label>
            {isMFJ && (
              <label className="sstw-check-label">
                <input
                  type="checkbox"
                  checked={inputs.spouseAge65Plus}
                  onChange={e => setField('spouseAge65Plus', e.target.checked)}
                  className="sstw-check"
                />
                My spouse is also age 65 or older
              </label>
            )}
          </div>

          <div className="sstw-nav-btns">
            <button className="sstw-btn-primary" onClick={() => { if (validate()) setStep(2); }}>
              Continue to Step 2 →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 2: Other Retirement Income & Prepayments
          ══════════════════════════════════════════════════════ */}
      {!result && step === 2 && (
        <div className="sstw-card">
          <h2 className="sstw-card-h">Step 2 — Other Retirement Income &amp; Tax Prepayments</h2>
          <p className="sstw-card-sub">
            Your Social Security withholding needs depend directly on your overall income and any taxes already withheld elsewhere.
          </p>

          <div className="sstw-grid-2">
            <div className="sstw-group">
              <label htmlFor="sstw-pension" className="sstw-label">Annual Pension Income</label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-pension"
                  type="number"
                  min="0"
                  step="500"
                  className="sstw-input"
                  placeholder="e.g. 15000"
                  value={inputs.pensionIncome || ''}
                  onChange={e => numField('pensionIncome', e.target.value)}
                />
              </div>
              <p className="sstw-help">Defined-benefit employer or government pensions.</p>
            </div>

            <div className="sstw-group">
              <label htmlFor="sstw-ira" className="sstw-label">Annual Traditional IRA / 401(k) Withdrawals</label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-ira"
                  type="number"
                  min="0"
                  step="500"
                  className="sstw-input"
                  placeholder="e.g. 12000"
                  value={inputs.ira401kWithdrawals || ''}
                  onChange={e => numField('ira401kWithdrawals', e.target.value)}
                />
              </div>
              <p className="sstw-help">
                Includes RMDs and voluntary traditional distributions. (Roth withdrawals are excluded).
              </p>
            </div>

            <div className="sstw-group">
              <label htmlFor="sstw-wages" className="sstw-label">Annual Wages / Part-Time Earnings</label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-wages"
                  type="number"
                  min="0"
                  step="500"
                  className="sstw-input"
                  placeholder="e.g. 0"
                  value={inputs.wagesIncome || ''}
                  onChange={e => numField('wagesIncome', e.target.value)}
                />
              </div>
              <p className="sstw-help">W-2 employment or 1099 consulting income.</p>
            </div>

            <div className="sstw-group">
              <label htmlFor="sstw-other-inc" className="sstw-label">Other Taxable Income (Dividends, Interest, Rental)</label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-other-inc"
                  type="number"
                  min="0"
                  step="250"
                  className="sstw-input"
                  placeholder="e.g. 2000"
                  value={inputs.otherTaxableIncome || ''}
                  onChange={e => numField('otherTaxableIncome', e.target.value)}
                />
              </div>
              <p className="sstw-help">Taxable brokerage interest, ordinary dividends, net rent.</p>
            </div>
          </div>

          <div className="sstw-divider" />
          <h3 className="sstw-subh">Taxes Already Withheld or Paid Elsewhere</h3>
          <p className="sstw-card-sub" style={{ marginBottom: '1rem' }}>
            If taxes are already being withheld from your pension or paychecks, enter them here so you do not double-withhold.
          </p>

          <div className="sstw-grid-2">
            <div className="sstw-group">
              <label htmlFor="sstw-other-wh" className="sstw-label">Federal Tax Withheld From Other Income</label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-other-wh"
                  type="number"
                  min="0"
                  step="250"
                  className="sstw-input"
                  placeholder="e.g. 1800"
                  value={inputs.otherWithholding || ''}
                  onChange={e => numField('otherWithholding', e.target.value)}
                />
              </div>
              <p className="sstw-help">Annual federal withholding from pensions (Form W-4P) or IRA (Form W-4R).</p>
            </div>

            <div className="sstw-group">
              <label htmlFor="sstw-est-pmt" className="sstw-label">Quarterly Estimated Payments (Annual Total)</label>
              <div className="sstw-input-wrap">
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-est-pmt"
                  type="number"
                  min="0"
                  step="250"
                  className="sstw-input"
                  placeholder="e.g. 0"
                  value={inputs.estimatedTaxPayments || ''}
                  onChange={e => numField('estimatedTaxPayments', e.target.value)}
                />
              </div>
              <p className="sstw-help">Total quarterly payments sent via IRS Form 1040-ES.</p>
            </div>
          </div>

          <div className="sstw-nav-btns">
            <button className="sstw-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="sstw-btn-primary" onClick={() => { if (validate()) setStep(3); }}>
              Continue to Step 3 →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 3: Withholding Preferences & Target
          ══════════════════════════════════════════════════════ */}
      {!result && step === 3 && (
        <div className="sstw-card">
          <h2 className="sstw-card-h">Step 3 — Withholding Options &amp; Targets</h2>
          <p className="sstw-card-sub">
            The IRS allows four voluntary withholding rates on Social Security: <strong>7%, 10%, 12%, or 22%</strong> (via Form W-4V). Choose which option you want to model:
          </p>

          <div className="sstw-group">
            <label htmlFor="sstw-choice" className="sstw-label">
              Withholding Rate to Model <span className="sstw-req">*</span>
            </label>
            <select
              id="sstw-choice"
              className="sstw-select"
              value={inputs.withholdingChoice}
              onChange={e => setField('withholdingChoice', e.target.value as Inputs['withholdingChoice'])}
            >
              <option value="suggested">🌟 Auto-Calculate Suggested Form W-4V Rate</option>
              <option value="0">0% — No Withholding</option>
              <option value="7">7% — Lowest Form W-4V Rate</option>
              <option value="10">10% — Standard Form W-4V Rate</option>
              <option value="12">12% — Form W-4V Rate</option>
              <option value="22">22% — Highest Form W-4V Rate</option>
              <option value="custom_pct">Custom Percentage (%)</option>
              <option value="custom_dollar">Custom Annual Dollar Amount ($)</option>
            </select>
          </div>

          {inputs.withholdingChoice === 'custom_pct' && (
            <div className="sstw-group">
              <label htmlFor="sstw-custom-pct" className="sstw-label">Custom Withholding Percentage</label>
              <div className="sstw-input-wrap" style={{ maxWidth: '200px' }}>
                <input
                  id="sstw-custom-pct"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  className={'sstw-input' + (errors.customPct ? ' error' : '')}
                  placeholder="e.g. 8.5"
                  value={inputs.customPct || ''}
                  onChange={e => numField('customPct', e.target.value)}
                />
                <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#0A3D3A' }}>%</span>
              </div>
              {errors.customPct && <p className="sstw-err" role="alert">{errors.customPct}</p>}
            </div>
          )}

          {inputs.withholdingChoice === 'custom_dollar' && (
            <div className="sstw-group">
              <label htmlFor="sstw-custom-dlr" className="sstw-label">Desired Annual Withholding Target ($)</label>
              <div className="sstw-input-wrap" style={{ maxWidth: '240px' }}>
                <span className="sstw-currency" aria-hidden="true">$</span>
                <input
                  id="sstw-custom-dlr"
                  type="number"
                  min="0"
                  step="100"
                  className="sstw-input"
                  placeholder="e.g. 2400"
                  value={inputs.customDollar || ''}
                  onChange={e => numField('customDollar', e.target.value)}
                />
              </div>
              <p className="sstw-help">Target amount to withhold over 12 months.</p>
            </div>
          )}

          <div className="sstw-nav-btns">
            <button className="sstw-btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="sstw-btn-primary sstw-btn-calc" onClick={handleCalculate}>
              Calculate Social Security Withholding →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          RESULTS DISPLAY
          ══════════════════════════════════════════════════════ */}
      {result && (
        <div id="sstw-result">

          {/* Top Primary Card */}
          <div className="sstw-result-card">
            <h2 className="sstw-result-h">Your 2026 Social Security Withholding Estimate</h2>
            <p className="sstw-result-date">
              Based on official 2026 IRS tax brackets (<a href="https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" target="_blank" rel="noopener noreferrer" className="sstw-inline-link">Rev. Proc. 2025-32</a>) and Form W-4V voluntary withholding options.
            </p>

            {/* Key 4 Highlights */}
            <div className="sstw-kpi-grid">
              <div className="sstw-kpi-card highlight">
                <span className="sstw-kpi-lbl">Suggested Monthly Withholding</span>
                <span className="sstw-kpi-val">{fmt(result.selectedMonthlyWithholding)}</span>
                <span className="sstw-kpi-sub">Deducted from monthly check</span>
              </div>

              <div className="sstw-kpi-card">
                <span className="sstw-kpi-lbl">Estimated Annual Social Security Withholding</span>
                <span className="sstw-kpi-val">{fmt(result.selectedAnnualWithholding)}</span>
                <span className="sstw-kpi-sub">Total withheld over 12 months</span>
              </div>

              <div className="sstw-kpi-card">
                <span className="sstw-kpi-lbl">Estimated Monthly Benefit After Withholding</span>
                <span className="sstw-kpi-val">{fmt(result.selectedNetMonthlySS)}</span>
                <span className="sstw-kpi-sub">Take-home Social Security check</span>
              </div>

              <div className={'sstw-kpi-card' + (result.selectedProjectedBalance > 0 ? ' warn' : ' good')}>
                <span className="sstw-kpi-lbl">
                  {result.selectedProjectedBalance > 0 ? 'Estimated Tax Balance Due (April)' : 'Estimated Overpayment (Refund)'}
                </span>
                <span className="sstw-kpi-val">{fmt(Math.abs(result.selectedProjectedBalance))}</span>
                <span className="sstw-kpi-sub">
                  {result.selectedProjectedBalance > 0 ? 'Due at filing time' : 'Estimated refund in April'}
                </span>
              </div>
            </div>

            {/* Recommendation Callout */}
            <div className="sstw-rec-box">
              <span className="sstw-rec-icon">💡</span>
              <div className="sstw-rec-text">
                {result.netTaxNeeded === 0 ? (
                  <p>
                    <strong>Recommended Withholding: 0%</strong> — Based on your current income and deductions, your estimated federal tax liability is $0. You do not need to withhold taxes from your Social Security check.
                  </p>
                ) : (
                  <p>
                    <strong>Recommended Form W-4V Selection: {result.recommendedW4VRate}%</strong> — Your exact calculated tax liability requires approximately <strong>{pct(result.exactWithholdingPctNeeded)}</strong> ({fmt(result.netTaxNeeded)}/yr) in withholding. Choosing <strong>{result.recommendedW4VRate}%</strong> on IRS Form W-4V will withhold <strong>{fmt(result.annualSS * (result.recommendedW4VRate / 100))}</strong> annually, keeping your April balance close to zero.
                  </p>
                )}
              </div>
            </div>

            <div className="sstw-result-divider" />

            {/* Complete Calculation Breakdown */}
            <h3 className="sstw-subh" style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
              Full Federal Tax &amp; Income Breakdown
            </h3>
            <div className="sstw-breakdown-list">
              {[
                ['Gross Annual Social Security Benefit', fmt(result.annualSS)],
                ['Total Other Retirement Income (Pension, IRA, Wages)', fmt(result.totalOtherIncome)],
                ['Combined / Provisional Income (IRS Pub. 915)', fmt(result.combinedIncome)],
                ['Taxable Portion of Social Security', `${fmt(result.taxableSS)} (${pct(result.taxableSSPercent)})`],
                ['Adjusted Gross Income (AGI)', fmt(result.agi)],
                ['Standard Deduction (incl. Age 65+ Senior Add-on)', `(${fmt(result.standardDeduction)})`],
                ['Federal Taxable Income', fmt(result.taxableIncome)],
                ['Total Estimated Federal Income Tax', fmt(result.totalFederalTax)],
                ['Taxes Already Withheld or Paid Elsewhere', `(${fmt(result.existingPrepayments)})`],
                ['Net Federal Tax to Cover via Social Security', fmt(result.netTaxNeeded)],
              ].map(([label, val]) => (
                <div key={label} className="sstw-row">
                  <span className="sstw-row-lbl">{label}</span>
                  <span className="sstw-row-val">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM W-4V COMPARISON TABLE ── */}
          <div className="sstw-table-card">
            <h3 className="sstw-table-card-h">Form W-4V Withholding Rate Comparison</h3>
            <p className="sstw-table-card-sub">
              Compare how the official IRS Form W-4V withholding rates affect your monthly check and April tax return:
            </p>

            <div className="sstw-table-wrap">
              <table className="sstw-compare-tbl">
                <thead>
                  <tr>
                    <th>Withholding Option</th>
                    <th>Annual Withheld</th>
                    <th>Monthly Withheld</th>
                    <th>Monthly Check After Tax</th>
                    <th>Projected April Balance / (Refund)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tiers.map(t => {
                    const isRec = t.ratePct === result.recommendedW4VRate;
                    return (
                      <tr key={t.rateLabel} className={isRec ? 'rec-row' : ''}>
                        <td>
                          <strong>{t.rateLabel}</strong>
                          {isRec && <span className="rec-badge">Recommended</span>}
                        </td>
                        <td>{fmt(t.annualWithholding)}</td>
                        <td>{fmt(t.monthlyWithholding)}</td>
                        <td className="bold-net">{fmt(t.netMonthlySS)}</td>
                        <td className={t.projectedBalance > 0 ? 'balance-owe' : 'balance-refund'}>
                          {t.projectedBalance > 0 ? `Owe ${fmt(t.projectedBalance)}` : `Refund ${fmt(Math.abs(t.projectedBalance))}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="sstw-tbl-note">
              *Estimates based on 2026 federal brackets and senior standard deductions. Actual taxes owed depend on your complete Form 1040 filing.
            </p>
          </div>

          {/* ── NEXT STEP ACTION CARDS ── */}
          <div className="sstw-actions-card">
            <h3 className="sstw-actions-h">Next Steps to Set Up Your Withholding</h3>
            <div className="sstw-actions-grid">
              <div className="sstw-action-item">
                <span className="action-step-num">1</span>
                <div>
                  <strong>Download IRS Form W-4V</strong>
                  <p>
                    Download the official one-page <a href="https://www.irs.gov/pub/irs-pdf/fw4v.pdf" target="_blank" rel="noopener noreferrer" className="sstw-inline-link">IRS Form W-4V (Voluntary Withholding Request)</a>.
                  </p>
                </div>
              </div>

              <div className="sstw-action-item">
                <span className="action-step-num">2</span>
                <div>
                  <strong>Check Box 6 With Your Desired Rate</strong>
                  <p>Check the box for <strong>{result.recommendedW4VRate}%</strong> (or your chosen rate: 7%, 10%, 12%, or 22%).</p>
                </div>
              </div>

              <div className="sstw-action-item">
                <span className="action-step-num">3</span>
                <div>
                  <strong>Submit to the Social Security Administration</strong>
                  <p>Mail or hand-deliver the completed form to your local SSA office or submit it online through your SSA.gov account.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RELATED TOOL CARDS ── */}
          <div className="sstw-related-tools">
            <h3 className="sstw-subh">Related Seniors Audit Retirement Planning Tools</h3>
            <div className="sstw-tools-grid">
              <a href="/tools/social-security-tax-calculator/" className="sstw-tool-card">
                <span className="tool-icon">🔍</span>
                <strong>Is My Benefit Taxable?</strong>
                <span>Check exact provisional income thresholds ($25k single / $32k joint) and test taxability tiers.</span>
              </a>

              <a href="/tools/retirement-tax-calculator-by-state/" className="sstw-tool-card">
                <span className="tool-icon">🗺️</span>
                <strong>Retirement Tax by State</strong>
                <span>Compare federal and state income taxes across all 50 states for Social Security and pensions.</span>
              </a>

              <a href="/tools/rmd-calculator/" className="sstw-tool-card">
                <span className="tool-icon">📅</span>
                <strong>RMD Calculator by Age</strong>
                <span>Calculate mandatory IRA distributions at age 73+ to estimate your total retirement income accurately.</span>
              </a>

              <a href="/tools/ira-401k-withdrawal-planner/" className="sstw-tool-card">
                <span className="tool-icon">📊</span>
                <strong>IRA &amp; 401(k) Withdrawal Planner</strong>
                <span>Sequence your retirement withdrawals to minimize tax spikes and keep benefits in lower brackets.</span>
              </a>
            </div>
          </div>

          <div className="sstw-recalc-wrap">
            <button className="sstw-btn-ghost" onClick={handleReset}>
              ← Recalculate With Different Numbers
            </button>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style>{`
        .sstw-wrap { font-family: inherit; color: #1A1A2E; width: 100%; }
        .sstw-progress-bar { background: #F0F7F6; border: 1px solid #C0DBD9; border-radius: 8px; padding: .85rem 1.25rem; margin-bottom: 1.1rem; }
        .sstw-prog-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: .45rem; flex-wrap: wrap; gap: .4rem; }
        .sstw-prog-label { font-size: .92rem; font-weight: 700; color: #0A3D3A; }
        .sstw-prog-pct { font-size: .8rem; font-weight: 800; color: #C9933A; background: #fff; padding: .15rem .5rem; border-radius: 12px; border: 1px solid #C9933A; }
        .sstw-prog-track { width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden; }
        .sstw-prog-fill { height: 100%; background: linear-gradient(90deg,#0A3D3A 0%,#C9933A 100%); border-radius: 4px; transition: width .3s ease; }
        .sstw-tabs { display: flex; border: 1px solid #C0DBD9; border-radius: 8px; overflow: hidden; margin-bottom: 1.25rem; background: #F8FBFB; }
        .sstw-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: .4rem; padding: .8rem .5rem; border: none; background: transparent; cursor: pointer; font-size: .85rem; font-weight: 600; color: #555; border-right: 1px solid #C0DBD9; transition: all .2s; }
        .sstw-tab:last-child { border-right: none; }
        .sstw-tab.active { background: #0A3D3A; color: #fff; }
        .sstw-tab.done { background: #E8F4F2; color: #0A3D3A; }
        .sstw-tab-num { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.2); font-size: .82rem; font-weight: 800; flex-shrink: 0; }
        .sstw-tab.active .sstw-tab-num { background: rgba(255,255,255,.25); }
        .sstw-tab.done .sstw-tab-num { background: #0A3D3A; color: #fff; }
        .sstw-tab-text { font-size: .82rem; }
        .sstw-card { background: #fff; border: 1.5px solid #C0DBD9; border-radius: 10px; padding: 1.5rem 1.75rem; margin-bottom: 1.25rem; }
        .sstw-card-h { font-size: 1.3rem; font-weight: 800; color: #0A3D3A; margin: 0 0 .35rem 0; }
        .sstw-card-sub { font-size: .94rem; color: #555; margin: 0 0 1.5rem 0; line-height: 1.5; }
        .sstw-subh { font-size: 1.15rem; font-weight: 800; color: #0A3D3A; margin: 1.25rem 0 .5rem 0; }
        .sstw-toggle-row { display: flex; gap: .5rem; margin-top: .35rem; }
        .sstw-toggle-btn { flex: 1; padding: .65rem 1rem; border: 1.5px solid #CBD5E0; border-radius: 6px; background: #FAFAFC; font-size: .92rem; font-weight: 700; color: #444; cursor: pointer; transition: all .2s; }
        .sstw-toggle-btn.active { background: #0A3D3A; color: #fff; border-color: #0A3D3A; }
        .sstw-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; }
        .sstw-label { font-size: .95rem; font-weight: 700; color: #1A1A2E; margin-bottom: .4rem; }
        .sstw-req { color: #C53030; }
        .sstw-select, .sstw-input { padding: .75rem 1rem; border: 1.5px solid #CBD5E0; border-radius: 8px; font-size: 1rem; color: #1A1A2E; background: #fff; width: 100%; box-sizing: border-box; transition: border-color .2s; }
        .sstw-select:focus, .sstw-input:focus { outline: none; border-color: #0A3D3A; box-shadow: 0 0 0 3px rgba(10,61,58,.12); }
        .sstw-input.error { border-color: #C53030; }
        .sstw-input-wrap { position: relative; display: flex; align-items: center; }
        .sstw-currency { position: absolute; left: .85rem; color: #666; font-size: 1rem; pointer-events: none; }
        .sstw-input-wrap .sstw-input { padding-left: 1.75rem; }
        .sstw-help { font-size: .83rem; color: #666; margin-top: .35rem; line-height: 1.45; }
        .sstw-err { font-size: .83rem; color: #C53030; font-weight: 600; margin-top: .3rem; }
        .sstw-warn-note { background: #FFFBF0; border-left: 3px solid #C9933A; padding: .75rem 1rem; border-radius: 0 6px 6px 0; font-size: .88rem; color: #555; margin-top: .5rem; line-height: 1.5; }
        .sstw-link, .sstw-inline-link { color: #0A3D3A; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
        .sstw-link:hover, .sstw-inline-link:hover { color: #082E2C; }
        .sstw-age-row { display: flex; flex-direction: column; gap: .75rem; margin-top: 1rem; }
        .sstw-check-label { display: flex; align-items: center; gap: .5rem; font-size: .95rem; font-weight: 600; cursor: pointer; color: #1A1A2E; }
        .sstw-check { width: 18px; height: 18px; cursor: pointer; accent-color: #0A3D3A; }
        .sstw-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media(max-width:600px){ .sstw-grid-2 { grid-template-columns: 1fr; } }
        .sstw-divider { height: 1px; background: #E2E8F0; margin: 1.5rem 0 1rem 0; }
        .sstw-nav-btns { display: flex; gap: .75rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .sstw-btn-primary { background: #0A3D3A; color: #fff; border: none; padding: .85rem 1.75rem; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background .2s; }
        .sstw-btn-primary:hover { background: #082E2C; }
        .sstw-btn-calc { background: #C9933A !important; }
        .sstw-btn-calc:hover { background: #A87830 !important; }
        .sstw-btn-ghost { background: transparent; color: #0A3D3A; border: 1.5px solid #0A3D3A; padding: .75rem 1.5rem; border-radius: 8px; font-size: .95rem; font-weight: 700; cursor: pointer; }
        .sstw-btn-ghost:hover { background: #F0F7F6; }

        /* Results Display */
        .sstw-result-card { background: #fff; border: 2px solid #0A3D3A; border-radius: 12px; padding: 1.75rem; margin-bottom: 1.5rem; box-shadow: 0 4px 16px rgba(10,61,58,.1); }
        .sstw-result-h { font-size: 1.4rem; font-weight: 800; color: #0A3D3A; margin: 0 0 .25rem 0; }
        .sstw-result-date { font-size: .82rem; color: #777; margin: 0 0 1.25rem 0; }
        .sstw-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: .85rem; margin-bottom: 1.25rem; }
        .sstw-kpi-card { background: #F8FBFB; border: 1.5px solid #C0DBD9; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: .25rem; }
        .sstw-kpi-card.highlight { background: #0A3D3A; color: #fff; border-color: #0A3D3A; }
        .sstw-kpi-card.highlight .sstw-kpi-lbl { color: rgba(255,255,255,.85); }
        .sstw-kpi-card.highlight .sstw-kpi-val { color: #C9933A; font-size: 1.6rem; }
        .sstw-kpi-card.highlight .sstw-kpi-sub { color: rgba(255,255,255,.8); }
        .sstw-kpi-card.warn { border-color: #FEB2B2; background: #FFF5F5; }
        .sstw-kpi-card.warn .sstw-kpi-val { color: #C53030; }
        .sstw-kpi-card.good { border-color: #9AE6B4; background: #F0FFF4; }
        .sstw-kpi-card.good .sstw-kpi-val { color: #22543D; }
        .sstw-kpi-lbl { font-size: .85rem; font-weight: 700; color: #555; }
        .sstw-kpi-val { font-size: 1.35rem; font-weight: 900; color: #1A1A2E; }
        .sstw-kpi-sub { font-size: .78rem; color: #777; }
        .sstw-rec-box { display: flex; gap: .75rem; background: #FFFBF0; border-left: 4px solid #C9933A; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; margin-bottom: 1.25rem; align-items: flex-start; }
        .sstw-rec-icon { font-size: 1.4rem; }
        .sstw-rec-text p { margin: 0; font-size: .95rem; color: #333; line-height: 1.55; }
        .sstw-result-divider { height: 1px; background: #E2E8F0; margin: 1.25rem 0; }
        .sstw-breakdown-list { display: flex; flex-direction: column; }
        .sstw-row { display: flex; justify-content: space-between; align-items: center; padding: .5rem 0; border-bottom: 1px solid #E2E8F0; font-size: .92rem; }
        .sstw-row:last-child { border-bottom: none; font-weight: 800; color: #0A3D3A; font-size: 1rem; }
        .sstw-row-lbl { color: #444; }
        .sstw-row-val { font-weight: 700; color: #1A1A2E; }

        /* Comparison Table */
        .sstw-table-card { background: #fff; border: 1.5px solid #C0DBD9; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .sstw-table-card-h { font-size: 1.25rem; font-weight: 800; color: #0A3D3A; margin: 0 0 .35rem 0; }
        .sstw-table-card-sub { font-size: .92rem; color: #555; margin: 0 0 1rem 0; }
        .sstw-table-wrap { overflow-x: auto; margin-bottom: .5rem; }
        .sstw-compare-tbl { width: 100%; border-collapse: collapse; font-size: .92rem; }
        .sstw-compare-tbl th { background: #0A3D3A; color: #fff; padding: .75rem .85rem; text-align: left; font-weight: 700; }
        .sstw-compare-tbl td { padding: .65rem .85rem; border-bottom: 1px solid #E2E8F0; }
        .sstw-compare-tbl tr.rec-row td { background: #F0F7F6; font-weight: 700; }
        .rec-badge { display: inline-block; background: #C9933A; color: #fff; font-size: .72rem; font-weight: 800; padding: .15rem .45rem; border-radius: 4px; margin-left: .5rem; text-transform: uppercase; }
        .bold-net { font-weight: 800; color: #0A3D3A; }
        .balance-owe { color: #C53030; font-weight: 700; }
        .balance-refund { color: #22543D; font-weight: 700; }
        .sstw-tbl-note { font-size: .8rem; color: #777; margin: .5rem 0 0 0; }

        /* Actions Card */
        .sstw-actions-card { background: #F8FBFB; border: 1px solid #C0DBD9; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .sstw-actions-h { font-size: 1.2rem; font-weight: 800; color: #0A3D3A; margin: 0 0 1rem 0; }
        .sstw-actions-grid { display: flex; flex-direction: column; gap: 1rem; }
        .sstw-action-item { display: flex; gap: .85rem; align-items: flex-start; }
        .action-step-num { width: 28px; height: 28px; border-radius: 50%; background: #0A3D3A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: .88rem; font-weight: 800; flex-shrink: 0; }
        .sstw-action-item strong { display: block; font-size: .95rem; color: #0A3D3A; margin-bottom: .2rem; }
        .sstw-action-item p { margin: 0; font-size: .9rem; color: #444; line-height: 1.45; }

        /* Related Tools */
        .sstw-related-tools { margin-bottom: 1.5rem; }
        .sstw-tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: .75rem; }
        .sstw-tool-card { display: flex; flex-direction: column; gap: .25rem; background: #fff; border: 1.5px solid #C0DBD9; border-radius: 8px; padding: 1rem; text-decoration: none; color: #1A1A2E; transition: border-color .2s, box-shadow .2s; }
        .sstw-tool-card:hover { border-color: #0A3D3A; box-shadow: 0 2px 8px rgba(10,61,58,.1); }
        .sstw-tool-card .tool-icon { font-size: 1.3rem; }
        .sstw-tool-card strong { font-size: .92rem; color: #0A3D3A; }
        .sstw-tool-card span:last-child { font-size: .82rem; color: #666; line-height: 1.4; }
        .sstw-recalc-wrap { text-align: center; margin: .5rem 0 1rem; }
      `}</style>
    </div>
  );
}

export default SocialSecurityTaxWithholdingCalculator;

