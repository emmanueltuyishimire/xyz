/**
 * SocialSecurityTaxCalculator.tsx
 * Social Security Tax Calculator 2026 — Seniors Audit
 *
 * Official Sources:
 * - IRS Publication 915 (Social Security Taxability Methodology)
 * - IRS Rev. Proc. 2025-32 (2026 Federal Brackets & Standard Deductions)
 * - IRS Form W-4V (Voluntary SS Withholding Request)
 *
 * Core formula (IRS Pub. 915):
 *   Combined Income = AGI + Tax-Exempt Interest + 50% of SS Benefits
 *
 * Last verified: August 2026
 */

import React, { useState, useCallback } from 'react';

// ── TYPES ─────────────────────────────────────────────────────────────────────

type FilingStatus = 'single' | 'mfj' | 'mfs';

interface CalcInputs {
  filingStatus: FilingStatus;
  socialSecurity: number;
  otherIncome: number;
  taxExemptInterest: number;
  age65Plus: boolean;
  spouseAge65Plus: boolean;
  withholding: string;
  customWithholding: number;
}

interface CalcResult {
  halfSS: number;
  combinedIncome: number;
  tier1Threshold: number;
  tier2Threshold: number;
  taxableSS: number;
  taxableSSPercent: number;
  zone: 'none' | 'up50' | 'up85';
  distanceToNext: number | null;
  distanceDirection: 'below' | 'above';
  agi: number;
  standardDeduction: number;
  enhancedSeniorDeduction: number;
  taxableIncome: number;
  federalTax: number;
  effectiveRate: number;
  marginalRate: number;
  annualWithholding: number;
  balanceDue: number;
}

// ── 2026 FEDERAL TAX DATA ─────────────────────────────────────────────────────
// Source: IRS Rev. Proc. 2025-32 (official 2026 inflation adjustments)

const TAX_2026 = {
  brackets: {
    single: [
      { min: 0,      max: 12400 as number | null,  rate: 0.10 },
      { min: 12400,  max: 50400 as number | null,  rate: 0.12 },
      { min: 50400,  max: 105700 as number | null, rate: 0.22 },
      { min: 105700, max: 201775 as number | null, rate: 0.24 },
      { min: 201775, max: 256225 as number | null, rate: 0.32 },
      { min: 256225, max: 640600 as number | null, rate: 0.35 },
      { min: 640600, max: null as null,             rate: 0.37 },
    ],
    mfj: [
      { min: 0,      max: 24800 as number | null,  rate: 0.10 },
      { min: 24800,  max: 100800 as number | null, rate: 0.12 },
      { min: 100800, max: 211400 as number | null, rate: 0.22 },
      { min: 211400, max: 403550 as number | null, rate: 0.24 },
      { min: 403550, max: 512450 as number | null, rate: 0.32 },
      { min: 512450, max: 768700 as number | null, rate: 0.35 },
      { min: 768700, max: null as null,             rate: 0.37 },
    ],
    mfs: [
      { min: 0,      max: 12400 as number | null,  rate: 0.10 },
      { min: 12400,  max: 50400 as number | null,  rate: 0.12 },
      { min: 50400,  max: 105700 as number | null, rate: 0.22 },
      { min: 105700, max: 201775 as number | null, rate: 0.24 },
      { min: 201775, max: 256225 as number | null, rate: 0.32 },
      { min: 256225, max: 384350 as number | null, rate: 0.35 },
      { min: 384350, max: null as null,             rate: 0.37 },
    ],
  },
  // Source: IRS Rev. Proc. 2025-32 — 2026 standard deductions
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100 },
  // Source: IRS Rev. Proc. 2025-32 — 2026 additional standard deduction for age 65+
  seniorAddl: { single: 2050, marriedPerSpouse: 1650 },
  // SS taxability thresholds — IRS Pub. 915, established 1983/1993, never inflation-indexed
  ssThresholds: {
    single: { tier1: 25000, tier2: 34000 },
    mfj:    { tier1: 32000, tier2: 44000 },
    mfs:    { tier1: 0,     tier2: 0     },
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

function calcFederalTax(taxableIncome: number, status: FilingStatus) {
  const brackets = TAX_2026.brackets[status];
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

function calcSSTaxable(halfSS: number, combinedIncome: number, annualSS: number, status: FilingStatus): number {
  const thresh = TAX_2026.ssThresholds[status];
  // MFS special rule: up to 85% taxable from dollar 1 if lived with spouse
  if (status === 'mfs') {
    return Math.max(0, Math.min(0.85 * annualSS, 0.85 * combinedIncome));
  }
  if (combinedIncome <= thresh.tier1) return 0;
  if (combinedIncome <= thresh.tier2) {
    return Math.min(halfSS, 0.5 * (combinedIncome - thresh.tier1));
  }
  // Tier 2 formula per IRS Publication 915
  const tier1Taxable = Math.min(halfSS, 0.5 * (thresh.tier2 - thresh.tier1));
  const tier2Taxable = 0.85 * (combinedIncome - thresh.tier2);
  return Math.min(tier1Taxable + tier2Taxable, 0.85 * annualSS);
}

function runCalculation(inputs: CalcInputs, extraIRA = 0): CalcResult {
  const fs = inputs.filingStatus;
  const ss = Math.max(0, inputs.socialSecurity);
  const other = Math.max(0, inputs.otherIncome + extraIRA);
  const tei = Math.max(0, inputs.taxExemptInterest);
  const halfSS = ss * 0.5;
  const combinedIncome = other + tei + halfSS;
  const thresh = TAX_2026.ssThresholds[fs];

  const taxableSS = calcSSTaxable(halfSS, combinedIncome, ss, fs);
  const taxableSSPercent = ss > 0 ? (taxableSS / ss) * 100 : 0;

  let zone: 'none' | 'up50' | 'up85' = 'none';
  if (taxableSS > 0) {
    zone = (combinedIncome > thresh.tier2 || fs === 'mfs') ? 'up85' : 'up50';
  }

  let distanceToNext: number | null = null;
  let distanceDirection: 'below' | 'above' = 'below';
  if (fs !== 'mfs') {
    if (combinedIncome < thresh.tier1) {
      distanceToNext = thresh.tier1 - combinedIncome;
    } else if (combinedIncome < thresh.tier2) {
      distanceToNext = thresh.tier2 - combinedIncome;
    } else {
      distanceToNext = combinedIncome - thresh.tier2;
      distanceDirection = 'above';
    }
  }

  let stdDeduction = TAX_2026.standardDeduction[fs];
  if (inputs.age65Plus) {
    stdDeduction += fs === 'single' ? TAX_2026.seniorAddl.single : TAX_2026.seniorAddl.marriedPerSpouse;
  }
  if (fs === 'mfj' && inputs.spouseAge65Plus) {
    stdDeduction += TAX_2026.seniorAddl.marriedPerSpouse;
  }

  const agi = other + taxableSS;
  const enhancedSeniorDed = calcEnhancedSeniorDeduction(agi, fs, inputs.age65Plus, inputs.spouseAge65Plus);
  const taxableIncome = Math.max(0, agi - stdDeduction - enhancedSeniorDed);
  const { tax: federalTax, marginalRate } = calcFederalTax(taxableIncome, fs);
  const effectiveRate = (ss + other) > 0 ? (federalTax / (ss + other)) * 100 : 0;

  let withholdRate = 0;
  if (inputs.withholding === 'custom') {
    withholdRate = Math.min(1, Math.max(0, inputs.customWithholding / 100));
  } else if (inputs.withholding !== 'none') {
    withholdRate = parseFloat(inputs.withholding) / 100;
  }
  const annualWithholding = ss * withholdRate;

  return {
    halfSS, combinedIncome,
    tier1Threshold: thresh.tier1, tier2Threshold: thresh.tier2,
    taxableSS, taxableSSPercent, zone,
    distanceToNext, distanceDirection,
    agi, standardDeduction: stdDeduction, enhancedSeniorDeduction: enhancedSeniorDed, taxableIncome,
    federalTax, effectiveRate, marginalRate, annualWithholding,
    balanceDue: federalTax - annualWithholding,
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n: number) => n.toFixed(1) + '%';

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export function SocialSecurityTaxCalculator() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [extraIRA, setExtraIRA] = useState(0);
  const [extraIRAInput, setExtraIRAInput] = useState('');
  const [inputs, setInputs] = useState<CalcInputs>({
    filingStatus: 'single',
    socialSecurity: 0,
    otherIncome: 0,
    taxExemptInterest: 0,
    age65Plus: true,
    spouseAge65Plus: false,
    withholding: 'none',
    customWithholding: 0,
  });

  const setField = useCallback(<K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) => {
    setInputs(prev => ({ ...prev, [k]: v }));
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  }, []);

  const numField = (k: keyof CalcInputs, raw: string) => {
    const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
    setField(k, (isNaN(n) ? 0 : n) as CalcInputs[typeof k]);
  };

  function validate() {
    const e: Record<string, string> = {};
    if (inputs.socialSecurity < 0) e.socialSecurity = 'Enter 0 or a positive dollar amount.';
    if (inputs.otherIncome < 0) e.otherIncome = 'Enter 0 or a positive dollar amount.';
    if (inputs.taxExemptInterest < 0) e.taxExemptInterest = 'Enter 0 or a positive dollar amount.';
    if (inputs.withholding === 'custom' && (inputs.customWithholding < 0 || inputs.customWithholding > 100)) {
      e.customWithholding = 'Enter a percentage between 0 and 100.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    setResult(runCalculation(inputs, 0));
    setExtraIRA(0);
    setExtraIRAInput('');
    setTimeout(() => {
      document.getElementById('sstc-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleReset() {
    setResult(null);
    setStep(1);
    setExtraIRA(0);
    setExtraIRAInput('');
    setErrors({});
  }

  const scenarioResult = (result && extraIRA > 0) ? runCalculation(inputs, extraIRA) : null;
  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;
  const stepLabels = [
    '📋 Step 1 of 3: Filing Status & Social Security',
    '💵 Step 2 of 3: Other Income & Adjustments',
    '⚙️ Step 3 of 3: Age & Optional Withholding',
  ];
  const tabLabels = ['Filing & SS', 'Other Income', 'Age & Withholding'];

  const isMFJ = inputs.filingStatus === 'mfj';

  return (
    <div className="sstc-wrap" id="calculator">

      {/* ── PROGRESS BAR ── */}
      {!result && (
        <div className="sstc-progress-bar">
          <div className="sstc-prog-meta">
            <span className="sstc-prog-label">{stepLabels[step - 1]}</span>
            <span className="sstc-prog-pct">{progressPct}% Complete</span>
          </div>
          <div className="sstc-prog-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="sstc-prog-fill" style={{ width: progressPct + '%' }} />
          </div>
        </div>
      )}

      {/* ── STEP TABS ── */}
      {!result && (
        <div className="sstc-tabs" role="tablist" aria-label="Calculator steps">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              role="tab"
              aria-selected={step === s}
              className={'sstc-tab' + (step === s ? ' active' : step > s ? ' done' : '')}
              onClick={() => setStep(s)}
            >
              <span className="sstc-tab-num">{step > s ? '✓' : s}</span>
              <span className="sstc-tab-text">{tabLabels[s - 1]}</span>
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 1: Filing Status & Social Security
          ══════════════════════════════════════════════════════ */}
      {!result && step === 1 && (
        <div className="sstc-card">
          <h2 className="sstc-card-h">Step 1 — Filing Status &amp; Social Security</h2>
          <p className="sstc-card-sub">These two items are the foundation of your Social Security taxability estimate.</p>

          <div className="sstc-group">
            <label htmlFor="sstc-fs" className="sstc-label">
              Federal Tax Filing Status <span className="sstc-req">*</span>
            </label>
            <select
              id="sstc-fs"
              className="sstc-select"
              value={inputs.filingStatus}
              onChange={e => setField('filingStatus', e.target.value as FilingStatus)}
            >
              <option value="single">Single</option>
              <option value="mfj">Married Filing Jointly</option>
              <option value="mfs">Married Filing Separately</option>
            </select>
            {inputs.filingStatus === 'mfs' && (
              <p className="sstc-warn-note">
                ⚠️ <strong>Married Filing Separately:</strong> If you lived with your spouse at any point during the year, nearly all of your Social Security is subject to federal tax starting from the very first dollar of combined income. Most tax professionals recommend filing jointly whenever possible to avoid this rule.
              </p>
            )}
          </div>

          <div className="sstc-group">
            <label htmlFor="sstc-ss" className="sstc-label">
              Annual Social Security Benefit (before Medicare deductions) <span className="sstc-req">*</span>
            </label>
            <div className="sstc-input-wrap">
              <span className="sstc-currency" aria-hidden="true">$</span>
              <input
                id="sstc-ss"
                type="number"
                min="0"
                step="100"
                className={'sstc-input' + (errors.socialSecurity ? ' error' : '')}
                aria-invalid={!!errors.socialSecurity}
                aria-describedby={errors.socialSecurity ? 'sstc-ss-err' : undefined}
                placeholder="e.g. 24000"
                value={inputs.socialSecurity || ''}
                onChange={e => numField('socialSecurity', e.target.value)}
              />
            </div>
            {errors.socialSecurity && <p id="sstc-ss-err" className="sstc-err" role="alert">{errors.socialSecurity}</p>}
            <p className="sstc-help">
              Enter your gross annual benefit before Medicare Part B premiums are deducted. Find this on your SSA award letter or at{' '}
              <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer" className="sstc-link">SSA.gov — My Social Security account</a>.
            </p>
          </div>

          <div className="sstc-nav-btns">
            <button className="sstc-btn-primary" onClick={() => { if (validate()) setStep(2); }}>
              Continue to Step 2 →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 2: Other Income
          ══════════════════════════════════════════════════════ */}
      {!result && step === 2 && (
        <div className="sstc-card">
          <h2 className="sstc-card-h">Step 2 — Other Retirement Income</h2>
          <p className="sstc-card-sub">Other income combined with 50% of your Social Security determines how much of your benefit may be taxable.</p>

          <div className="sstc-group">
            <label htmlFor="sstc-other" className="sstc-label">
              Total Other Taxable Income <span className="sstc-req">*</span>
            </label>
            <div className="sstc-input-wrap">
              <span className="sstc-currency" aria-hidden="true">$</span>
              <input
                id="sstc-other"
                type="number"
                min="0"
                step="100"
                className={'sstc-input' + (errors.otherIncome ? ' error' : '')}
                aria-invalid={!!errors.otherIncome}
                placeholder="e.g. 18000"
                value={inputs.otherIncome || ''}
                onChange={e => numField('otherIncome', e.target.value)}
              />
            </div>
            {errors.otherIncome && <p className="sstc-err" role="alert">{errors.otherIncome}</p>}
            <p className="sstc-help">
              Add up: pension + IRA withdrawals + 401(k) distributions + wages + dividends + interest + rental income + any other taxable amounts.
              If you are age 73+ and need your required IRA withdrawal amount, use our{' '}
              <a href="/tools/rmd-calculator/" className="sstc-link">RMD Calculator by Age</a>.
            </p>
          </div>

          <div className="sstc-group">
            <label htmlFor="sstc-tei" className="sstc-label">Tax-Exempt Interest Income</label>
            <div className="sstc-input-wrap">
              <span className="sstc-currency" aria-hidden="true">$</span>
              <input
                id="sstc-tei"
                type="number"
                min="0"
                step="100"
                className={'sstc-input' + (errors.taxExemptInterest ? ' error' : '')}
                placeholder="e.g. 0"
                value={inputs.taxExemptInterest || ''}
                onChange={e => numField('taxExemptInterest', e.target.value)}
              />
            </div>
            {errors.taxExemptInterest && <p className="sstc-err" role="alert">{errors.taxExemptInterest}</p>}
            <p className="sstc-help">
              Municipal bond interest is not normally subject to federal income tax — but the IRS requires it to be added when testing Social Security taxability per{' '}
              <a href="https://www.irs.gov/pub/irs-pdf/p915.pdf" target="_blank" rel="noopener noreferrer" className="sstc-link">IRS Publication 915</a>. Most retirees enter $0.
            </p>
          </div>

          <div className="sstc-nav-btns">
            <button className="sstc-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="sstc-btn-primary" onClick={() => { if (validate()) setStep(3); }}>
              Continue to Step 3 →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 3: Age & Withholding
          ══════════════════════════════════════════════════════ */}
      {!result && step === 3 && (
        <div className="sstc-card">
          <h2 className="sstc-card-h">Step 3 — Age &amp; Optional Withholding</h2>
          <p className="sstc-card-sub">Age does not affect whether Social Security is taxable — income does. But being 65+ increases your standard deduction and lowers your estimated federal tax.</p>

          <div className="sstc-age-row">
            <label className="sstc-check-label">
              <input
                type="checkbox"
                checked={inputs.age65Plus}
                onChange={e => setField('age65Plus', e.target.checked)}
                className="sstc-check"
              />
              I am age 65 or older
            </label>
            {isMFJ && (
              <label className="sstc-check-label">
                <input
                  type="checkbox"
                  checked={inputs.spouseAge65Plus}
                  onChange={e => setField('spouseAge65Plus', e.target.checked)}
                  className="sstc-check"
                />
                My spouse is also age 65 or older
              </label>
            )}
          </div>
          <p className="sstc-help" style={{ marginTop: '-0.25rem', marginBottom: '1.25rem' }}>
            The IRS adds $2,050 to the 2026 standard deduction for single filers age 65+ and $1,650 per qualifying spouse for married joint filers (IRS Rev. Proc. 2025-32).
          </p>

          <div className="sstc-group">
            <label htmlFor="sstc-wh" className="sstc-label">
              Federal Tax Withheld From Social Security Check (Optional)
            </label>
            <select
              id="sstc-wh"
              className="sstc-select"
              value={inputs.withholding}
              onChange={e => setField('withholding', e.target.value)}
            >
              <option value="none">No withholding (0%)</option>
              <option value="7">7% — lowest available rate</option>
              <option value="10">10%</option>
              <option value="12">12%</option>
              <option value="22">22% — highest available rate</option>
              <option value="custom">Custom percentage</option>
            </select>
            <p className="sstc-help">
              Request voluntary withholding by filing{' '}
              <a href="https://www.irs.gov/pub/irs-pdf/fw4v.pdf" target="_blank" rel="noopener noreferrer" className="sstc-link">IRS Form W-4V</a>
              {' '}with the Social Security Administration. Available rates: 7%, 10%, 12%, or 22%.
            </p>
          </div>

          {inputs.withholding === 'custom' && (
            <div className="sstc-group">
              <label htmlFor="sstc-wh-custom" className="sstc-label">Custom Withholding Percentage</label>
              <div className="sstc-input-wrap">
                <input
                  id="sstc-wh-custom"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className={'sstc-input' + (errors.customWithholding ? ' error' : '')}
                  placeholder="e.g. 15"
                  value={inputs.customWithholding || ''}
                  onChange={e => numField('customWithholding', e.target.value)}
                  style={{ maxWidth: '160px' }}
                />
                <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#0A3D3A' }}>%</span>
              </div>
              {errors.customWithholding && <p className="sstc-err" role="alert">{errors.customWithholding}</p>}
            </div>
          )}

          <div className="sstc-nav-btns">
            <button className="sstc-btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="sstc-btn-primary sstc-btn-calc" onClick={handleCalculate}>
              Calculate My Social Security Tax →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          RESULTS
          ══════════════════════════════════════════════════════ */}
      {result && (
        <div id="sstc-result">

          {/* Main Result Card */}
          <div className="sstc-result-card">
            <h2 className="sstc-result-h">Your Social Security Tax Estimate</h2>
            <p className="sstc-result-date">
              Based on 2026 IRS methodology —{' '}
              <a href="https://www.irs.gov/pub/irs-pdf/p915.pdf" target="_blank" rel="noopener noreferrer" className="sstc-link">IRS Pub. 915</a>
              {' '}&amp;{' '}
              <a href="https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" target="_blank" rel="noopener noreferrer" className="sstc-link">Rev. Proc. 2025-32</a>
            </p>

            <div className="sstc-result-primary">
              <div className="sstc-result-row highlight">
                <span className="rr-label">Estimated Taxable Social Security</span>
                <span className="rr-val">{fmt(result.taxableSS)}</span>
              </div>
              <div className="sstc-result-row">
                <span className="rr-label">Taxable Portion of Your Benefit</span>
                <span className="rr-val rr-pct">{pct(result.taxableSSPercent)}</span>
              </div>
            </div>

            <div className="sstc-result-divider" />

            <div className="sstc-result-rows">
              {([
                ['Annual Social Security Benefit', fmt(inputs.socialSecurity), ''],
                ['Other Taxable Income', fmt(inputs.otherIncome), ''],
                ['Combined / Provisional Income', fmt(result.combinedIncome), ''],
                ['Adjusted Gross Income (AGI)', fmt(result.agi), ''],
                ['Standard Deduction (incl. 65+ add-on)', fmt(result.standardDeduction), ''],
                ['Federal Taxable Income', fmt(result.taxableIncome), ''],
                ['Estimated Federal Income Tax', fmt(result.federalTax), 'strong'],
                ['Effective Tax Rate on Total Income', pct(result.effectiveRate), ''],
                ['Marginal Tax Bracket', pct(result.marginalRate * 100), ''],
              ] as [string, string, string][]).map(([label, val, cls]) => (
                <div key={label} className={'sstc-result-row' + (cls ? ' ' + cls : '')}>
                  <span className="rr-label">{label}</span>
                  <span className="rr-val">{val}</span>
                </div>
              ))}
              {inputs.withholding !== 'none' && (
                <>
                  <div className="sstc-result-divider" style={{ margin: '0.5rem 0' }} />
                  <div className="sstc-result-row">
                    <span className="rr-label">
                      Annual SS Withholding at {inputs.withholding === 'custom' ? inputs.customWithholding + '%' : inputs.withholding + '%'}
                    </span>
                    <span className="rr-val">{fmt(result.annualWithholding)}</span>
                  </div>
                  <div className={'sstc-result-row strong' + (result.balanceDue > 0 ? ' warn' : ' good')}>
                    <span className="rr-label">
                      {result.balanceDue > 0 ? 'Estimated Balance Due in April' : 'Estimated Overpayment (Refund)'}
                    </span>
                    <span className="rr-val">{fmt(Math.abs(result.balanceDue))}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Taxability Zone Indicator */}
          <div className="sstc-zone-card">
            <h3 className="sstc-zone-title">Your Social Security Taxability Zone</h3>
            <div className="sstc-zone-track">
              <div className={'sstc-zone-step' + (result.zone === 'none' ? ' zone-active' : '')}>
                <span className="zone-label">0% Taxable</span>
                <span className="zone-sub">{isMFJ ? 'Under $32,000' : 'Under $25,000'}</span>
              </div>
              <span className="sstc-zone-arrow" aria-hidden="true">→</span>
              <div className={'sstc-zone-step' + (result.zone === 'up50' ? ' zone-active' : '')}>
                <span className="zone-label">Up to 50% Taxable</span>
                <span className="zone-sub">{isMFJ ? '$32,000–$44,000' : '$25,000–$34,000'}</span>
              </div>
              <span className="sstc-zone-arrow" aria-hidden="true">→</span>
              <div className={'sstc-zone-step' + (result.zone === 'up85' ? ' zone-active' : '')}>
                <span className="zone-label">Up to 85% Taxable</span>
                <span className="zone-sub">{isMFJ ? 'Over $44,000' : 'Over $34,000'}</span>
              </div>
            </div>
            {inputs.filingStatus !== 'mfs' && result.distanceToNext !== null && (
              <p className="sstc-zone-distance">
                {result.zone === 'none' && `You are ${fmt(result.distanceToNext)} below the threshold where any Social Security becomes taxable.`}
                {result.zone === 'up50' && `You are ${fmt(result.distanceToNext)} below the 85% taxability threshold. Keeping combined income below ${isMFJ ? '$44,000' : '$34,000'} limits taxability to 50%.`}
                {result.zone === 'up85' && `Your combined income is ${fmt(result.distanceToNext)} above the 85% threshold. Up to 85% of your benefit is included in taxable income.`}
              </p>
            )}
            {inputs.filingStatus === 'mfs' && (
              <p className="sstc-zone-distance">Married Filing Separately: If you lived with your spouse during the year, the IRS applies a special rule — up to 85% of your Social Security may be taxable beginning at the first dollar of combined income.</p>
            )}
          </div>

          {/* Plain-English Explanation */}
          <div className="sstc-explain-card">
            <h3>Why Is Part of Your Social Security Taxable?</h3>
            <p>
              The IRS uses a formula called <strong>Combined Income</strong> (also called Provisional Income in{' '}
              <a href="https://www.irs.gov/pub/irs-pdf/p915.pdf" target="_blank" rel="noopener noreferrer" className="sstc-link">IRS Publication 915</a>
              ) to test how much of your benefit may be included in federal taxable income:
            </p>
            <div className="sstc-formula-box">
              <strong>{fmt(inputs.otherIncome)}</strong> other income
              &nbsp;+&nbsp;<strong>{fmt(result.halfSS)}</strong> (50% of SS)
              {inputs.taxExemptInterest > 0 && <>&nbsp;+&nbsp;<strong>{fmt(inputs.taxExemptInterest)}</strong> tax-exempt interest</>}
              &nbsp;=&nbsp;<strong>{fmt(result.combinedIncome)}</strong> combined income
            </div>
            {result.taxableSS > 0 ? (
              <p>
                Because your combined income of <strong>{fmt(result.combinedIncome)}</strong> exceeds the IRS threshold for your filing status, approximately <strong>{fmt(result.taxableSS)}</strong> ({pct(result.taxableSSPercent)}) of your <strong>{fmt(inputs.socialSecurity)}</strong> annual Social Security benefit is included in your federal taxable income.
              </p>
            ) : (
              <p>
                Because your combined income of <strong>{fmt(result.combinedIncome)}</strong> is below the IRS threshold for your filing status, <strong>none of your Social Security benefit is included in federal taxable income</strong>.
              </p>
            )}
            <div className="sstc-important-box">
              <strong>Critical distinction:</strong> "{pct(result.taxableSSPercent)} taxable" does NOT mean you pay a {pct(result.taxableSSPercent)} tax rate on your Social Security. It means that {pct(result.taxableSSPercent)} of your benefit is added to your total taxable income and then taxed at your ordinary income tax bracket — which in your case is the <strong>{pct(result.marginalRate * 100)} marginal bracket</strong>.
            </div>
          </div>

          {/* IRA Scenario Simulator */}
          <div className="sstc-scenario-card">
            <h3>What Happens If You Withdraw More From an IRA or 401(k)?</h3>
            <p>A larger IRA withdrawal can push more of your Social Security into taxable territory — sometimes triggering the 85% zone. Enter an additional withdrawal amount to model the effect:</p>
            <div className="sstc-group">
              <label htmlFor="sstc-extra" className="sstc-label">Additional IRA / 401(k) Withdrawal to Model</label>
              <div className="sstc-input-wrap" style={{ maxWidth: '280px' }}>
                <span className="sstc-currency" aria-hidden="true">$</span>
                <input
                  id="sstc-extra"
                  type="number"
                  min="0"
                  step="500"
                  className="sstc-input"
                  placeholder="e.g. 10000"
                  value={extraIRAInput}
                  onChange={e => {
                    setExtraIRAInput(e.target.value);
                    const n = parseFloat(e.target.value);
                    setExtraIRA(isNaN(n) ? 0 : Math.max(0, n));
                  }}
                />
              </div>
              <p className="sstc-help">
                <a href="/tools/rmd-calculator/" className="sstc-link">Calculate your RMD amount →</a>
                {' · '}
                <a href="/tools/roth-conversion-calculator/" className="sstc-link">Model a Roth conversion →</a>
              </p>
            </div>
            {extraIRA > 0 && scenarioResult && (
              <div className="sstc-compare-grid">
                <div className="sstc-compare-col before">
                  <h4>Before</h4>
                  <div className="sc-row"><span>Combined Income</span><strong>{fmt(result.combinedIncome)}</strong></div>
                  <div className="sc-row"><span>Taxable Social Security</span><strong>{fmt(result.taxableSS)}</strong></div>
                  <div className="sc-row"><span>Federal Taxable Income</span><strong>{fmt(result.taxableIncome)}</strong></div>
                  <div className="sc-row"><span>Estimated Federal Tax</span><strong>{fmt(result.federalTax)}</strong></div>
                </div>
                <div className="sstc-compare-col after">
                  <h4>After Adding {fmt(extraIRA)}</h4>
                  <div className="sc-row"><span>Combined Income</span><strong>{fmt(scenarioResult.combinedIncome)}</strong></div>
                  <div className="sc-row"><span>Taxable Social Security</span><strong>{fmt(scenarioResult.taxableSS)}</strong></div>
                  <div className="sc-row"><span>Federal Taxable Income</span><strong>{fmt(scenarioResult.taxableIncome)}</strong></div>
                  <div className="sc-row"><span>Estimated Federal Tax</span><strong>{fmt(scenarioResult.federalTax)}</strong></div>
                  <div className="sc-row impact">
                    <span>Additional Tax Cost</span>
                    <strong>+{fmt(scenarioResult.federalTax - result.federalTax)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Withholding Guidance */}
          <div className="sstc-wh-card">
            <h3>Should You Have Taxes Withheld From Social Security?</h3>
            <p>
              Social Security taxability and withholding are two separate things. Just because part of your benefit is taxable does not mean taxes are automatically withheld. Without voluntary withholding via{' '}
              <a href="https://www.irs.gov/pub/irs-pdf/fw4v.pdf" target="_blank" rel="noopener noreferrer" className="sstc-link">IRS Form W-4V</a>
              {' '}or quarterly estimated tax payments, you may owe a balance in April plus possible IRS underpayment penalties.
            </p>
            {result.federalTax > 0 && inputs.withholding === 'none' && (
              <div className="sstc-wh-alert">
                Based on your inputs, your estimated federal tax is <strong>{fmt(result.federalTax)}</strong> with <strong>$0 in Social Security withholding</strong>. Without withholding or quarterly payments, this amount would be due when you file your return.
              </div>
            )}
            <a href="/tools/retirement-tax-withholding-calculator/" className="sstc-btn-secondary">
              → Estimate How Much to Withhold
            </a>
          </div>

          {/* Next Steps Tool Cards */}
          <div className="sstc-next-tools">
            <h3>Your Next Planning Steps</h3>
            <div className="sstc-tools-grid">
              <a href="/tools/retirement-tax-calculator-by-state/" className="sstc-tool-card">
                <span className="tool-icon">🗺️</span>
                <strong>Retirement Tax by State</strong>
                <span>See your complete federal + state tax picture across all 50 states with all income sources.</span>
              </a>
              <a href="/tools/rmd-calculator/" className="sstc-tool-card">
                <span className="tool-icon">📅</span>
                <strong>RMD Calculator by Age</strong>
                <span>Age 73+? Calculate your required IRA distribution amount to use in this calculator.</span>
              </a>
              <a href="/tools/roth-conversion-calculator/" className="sstc-tool-card">
                <span className="tool-icon">🔄</span>
                <strong>Roth Conversion Calculator</strong>
                <span>Model whether converting IRA funds to a Roth now could reduce taxable Social Security in future years.</span>
              </a>
              {result.combinedIncome > (isMFJ ? 218000 : 109000) && (
                <a href="/tools/medicare-irmaa-calculator/" className="sstc-tool-card">
                  <span className="tool-icon">🏥</span>
                  <strong>Medicare IRMAA Calculator</strong>
                  <span>Your income may also trigger higher Medicare Part B &amp; D premiums. Calculate your surcharge exposure.</span>
                </a>
              )}
            </div>
          </div>

          <div className="sstc-recalc-wrap">
            <button className="sstc-btn-ghost" onClick={handleReset}>← Recalculate with Different Numbers</button>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style>{`
        .sstc-wrap{font-family:inherit;color:#1A1A2E;width:100%}
        .sstc-progress-bar{background:#F0F7F6;border:1px solid #C0DBD9;border-radius:8px;padding:.85rem 1.25rem;margin-bottom:1.1rem}
        .sstc-prog-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem;flex-wrap:wrap;gap:.4rem}
        .sstc-prog-label{font-size:.92rem;font-weight:700;color:#0A3D3A}
        .sstc-prog-pct{font-size:.8rem;font-weight:800;color:#C9933A;background:#fff;padding:.15rem .5rem;border-radius:12px;border:1px solid #C9933A}
        .sstc-prog-track{width:100%;height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden}
        .sstc-prog-fill{height:100%;background:linear-gradient(90deg,#0A3D3A 0%,#C9933A 100%);border-radius:4px;transition:width .3s ease}
        .sstc-tabs{display:flex;border:1px solid #C0DBD9;border-radius:8px;overflow:hidden;margin-bottom:1.25rem;background:#F8FBFB}
        .sstc-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.8rem .5rem;border:none;background:transparent;cursor:pointer;font-size:.85rem;font-weight:600;color:#555;border-right:1px solid #C0DBD9;transition:all .2s}
        .sstc-tab:last-child{border-right:none}
        .sstc-tab.active{background:#0A3D3A;color:#fff}
        .sstc-tab.done{background:#E8F4F2;color:#0A3D3A}
        .sstc-tab-num{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.2);font-size:.82rem;font-weight:800;flex-shrink:0}
        .sstc-tab.active .sstc-tab-num{background:rgba(255,255,255,.25)}
        .sstc-tab.done .sstc-tab-num{background:#0A3D3A;color:#fff}
        .sstc-tab-text{font-size:.82rem}
        .sstc-card{background:#fff;border:1.5px solid #C0DBD9;border-radius:10px;padding:1.5rem 1.75rem;margin-bottom:1.25rem}
        .sstc-card-h{font-size:1.3rem;font-weight:800;color:#0A3D3A;margin:0 0 .35rem 0}
        .sstc-card-sub{font-size:.94rem;color:#555;margin:0 0 1.5rem 0}
        .sstc-group{margin-bottom:1.25rem;display:flex;flex-direction:column}
        .sstc-label{font-size:.95rem;font-weight:700;color:#1A1A2E;margin-bottom:.4rem}
        .sstc-req{color:#C53030}
        .sstc-select,.sstc-input{padding:.75rem 1rem;border:1.5px solid #CBD5E0;border-radius:8px;font-size:1rem;color:#1A1A2E;background:#fff;width:100%;box-sizing:border-box;transition:border-color .2s}
        .sstc-select:focus,.sstc-input:focus{outline:none;border-color:#0A3D3A;box-shadow:0 0 0 3px rgba(10,61,58,.12)}
        .sstc-input.error{border-color:#C53030}
        .sstc-input-wrap{position:relative;display:flex;align-items:center}
        .sstc-currency{position:absolute;left:.85rem;color:#666;font-size:1rem;pointer-events:none}
        .sstc-input-wrap .sstc-input{padding-left:1.75rem}
        .sstc-help{font-size:.83rem;color:#666;margin-top:.35rem;line-height:1.45}
        .sstc-err{font-size:.83rem;color:#C53030;font-weight:600;margin-top:.3rem}
        .sstc-warn-note{background:#FFFBF0;border-left:3px solid #C9933A;padding:.75rem 1rem;border-radius:0 6px 6px 0;font-size:.88rem;color:#555;margin-top:.5rem;line-height:1.5}
        .sstc-link{color:#0A3D3A;font-weight:700;text-decoration:underline;text-underline-offset:2px}
        .sstc-link:hover{color:#082E2C}
        .sstc-age-row{display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:.5rem}
        .sstc-check-label{display:flex;align-items:center;gap:.5rem;font-size:1rem;font-weight:600;cursor:pointer;color:#1A1A2E}
        .sstc-check{width:18px;height:18px;cursor:pointer;accent-color:#0A3D3A}
        .sstc-nav-btns{display:flex;gap:.75rem;margin-top:1.5rem;flex-wrap:wrap}
        .sstc-btn-primary{background:#0A3D3A;color:#fff;border:none;padding:.85rem 1.75rem;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;transition:background .2s}
        .sstc-btn-primary:hover{background:#082E2C}
        .sstc-btn-calc{background:#C9933A!important}
        .sstc-btn-calc:hover{background:#A87830!important}
        .sstc-btn-ghost{background:transparent;color:#0A3D3A;border:1.5px solid #0A3D3A;padding:.75rem 1.5rem;border-radius:8px;font-size:.95rem;font-weight:700;cursor:pointer}
        .sstc-btn-ghost:hover{background:#F0F7F6}
        .sstc-btn-secondary{display:inline-block;background:#F0F7F6;color:#0A3D3A;border:1.5px solid #0A3D3A;padding:.65rem 1.25rem;border-radius:8px;font-size:.9rem;font-weight:700;text-decoration:none;margin-top:1rem;transition:background .2s}
        .sstc-btn-secondary:hover{background:#0A3D3A;color:#fff}
        .sstc-result-card{background:#fff;border:2px solid #0A3D3A;border-radius:12px;padding:1.75rem;margin-bottom:1.25rem;box-shadow:0 4px 16px rgba(10,61,58,.1)}
        .sstc-result-h{font-size:1.4rem;font-weight:800;color:#0A3D3A;margin:0 0 .25rem 0}
        .sstc-result-date{font-size:.82rem;color:#777;margin:0 0 1rem 0}
        .sstc-result-primary{background:#0A3D3A;border-radius:8px;padding:1.1rem 1.25rem;margin-bottom:1rem}
        .sstc-result-primary .sstc-result-row{border-bottom:1px solid rgba(255,255,255,.15)}
        .sstc-result-primary .sstc-result-row:last-child{border-bottom:none}
        .sstc-result-primary .rr-label{color:rgba(255,255,255,.85)}
        .sstc-result-primary .rr-val{color:#fff}
        .sstc-result-primary .highlight .rr-val{font-size:1.6rem;font-weight:900;color:#C9933A}
        .sstc-result-primary .highlight .rr-label{font-size:.95rem;font-weight:700;color:rgba(255,255,255,.9)}
        .sstc-result-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid #E2E8F0;flex-wrap:wrap;gap:.3rem}
        .sstc-result-row:last-child{border-bottom:none}
        .sstc-result-row.strong .rr-val{font-weight:800;color:#0A3D3A;font-size:1.1rem}
        .sstc-result-row.warn .rr-val{color:#9B2C2C}
        .sstc-result-row.good .rr-val{color:#276749}
        .rr-label{font-size:.92rem;color:#444}
        .rr-val{font-size:1rem;font-weight:700;color:#1A1A2E}
        .rr-pct{color:#C9933A}
        .sstc-result-rows{display:flex;flex-direction:column}
        .sstc-result-divider{height:1px;background:#E2E8F0;margin:.5rem 0}
        .sstc-zone-card{background:#F8FBFB;border:1px solid #C0DBD9;border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:1.25rem}
        .sstc-zone-title{font-size:1.05rem;font-weight:800;color:#0A3D3A;margin:0 0 1rem 0}
        .sstc-zone-track{display:flex;align-items:stretch;flex-wrap:wrap;gap:0}
        .sstc-zone-step{flex:1;min-width:105px;padding:.85rem .75rem;border-radius:8px;border:2px solid #E2E8F0;background:#fff;text-align:center;display:flex;flex-direction:column;gap:.25rem}
        .sstc-zone-step.zone-active{border-color:#0A3D3A;background:#0A3D3A}
        .sstc-zone-step.zone-active .zone-label{color:#fff}
        .sstc-zone-step.zone-active .zone-sub{color:rgba(255,255,255,.8)}
        .zone-label{font-size:.9rem;font-weight:800;color:#0A3D3A}
        .zone-sub{font-size:.76rem;color:#666}
        .sstc-zone-arrow{display:flex;align-items:center;padding:0 .4rem;font-size:1.2rem;font-weight:700;color:#0A3D3A}
        .sstc-zone-distance{font-size:.88rem;color:#444;margin:.75rem 0 0 0;background:#F0F7F6;padding:.6rem .85rem;border-radius:6px}
        .sstc-explain-card{background:#fff;border:1px solid #CBD5E0;border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:1.25rem}
        .sstc-explain-card h3{font-size:1.1rem;font-weight:800;color:#0A3D3A;margin:0 0 .6rem 0}
        .sstc-explain-card p{font-size:.94rem;color:#333;line-height:1.6;margin-bottom:.6rem}
        .sstc-formula-box{background:#F0F7F6;border-left:4px solid #0A3D3A;padding:.85rem 1rem;border-radius:0 6px 6px 0;font-size:.94rem;color:#0A3D3A;margin:.75rem 0}
        .sstc-important-box{background:#FFFBF0;border-left:4px solid #C9933A;padding:.85rem 1rem;border-radius:0 6px 6px 0;font-size:.9rem;color:#444;margin-top:.75rem;line-height:1.5}
        .sstc-scenario-card{background:#fff;border:1.5px solid #C0DBD9;border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:1.25rem}
        .sstc-scenario-card h3{font-size:1.1rem;font-weight:800;color:#0A3D3A;margin:0 0 .5rem 0}
        .sstc-scenario-card p{font-size:.92rem;color:#444;margin-bottom:1rem;line-height:1.5}
        .sstc-compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}
        @media(max-width:520px){.sstc-compare-grid{grid-template-columns:1fr}}
        .sstc-compare-col{border-radius:8px;padding:1rem;border:1.5px solid #E2E8F0}
        .sstc-compare-col.before{background:#FAFAFC}
        .sstc-compare-col.after{background:#F0F7F6;border-color:#0A3D3A}
        .sstc-compare-col h4{font-size:.88rem;font-weight:800;color:#0A3D3A;margin:0 0 .6rem 0;text-transform:uppercase}
        .sc-row{display:flex;justify-content:space-between;font-size:.88rem;padding:.3rem 0;border-bottom:1px solid rgba(0,0,0,.06)}
        .sc-row:last-child{border-bottom:none}
        .sc-row.impact{font-weight:800;color:#9B2C2C;margin-top:.25rem}
        .sstc-wh-card{background:#F0F7F6;border:1px solid #C0DBD9;border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:1.25rem}
        .sstc-wh-card h3{font-size:1.1rem;font-weight:800;color:#0A3D3A;margin:0 0 .6rem 0}
        .sstc-wh-card p{font-size:.92rem;color:#333;line-height:1.55}
        .sstc-wh-alert{background:#FFFBF0;border:1.5px solid #C9933A;border-radius:6px;padding:.75rem 1rem;font-size:.9rem;margin:.75rem 0}
        .sstc-next-tools{margin-bottom:1.25rem}
        .sstc-next-tools h3{font-size:1.05rem;font-weight:800;color:#0A3D3A;margin:0 0 .75rem 0}
        .sstc-tools-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.75rem}
        .sstc-tool-card{display:flex;flex-direction:column;gap:.25rem;background:#fff;border:1.5px solid #C0DBD9;border-radius:8px;padding:1rem;text-decoration:none;color:#1A1A2E;transition:border-color .2s,box-shadow .2s}
        .sstc-tool-card:hover{border-color:#0A3D3A;box-shadow:0 2px 8px rgba(10,61,58,.1)}
        .sstc-tool-card .tool-icon{font-size:1.3rem}
        .sstc-tool-card strong{font-size:.92rem;color:#0A3D3A}
        .sstc-tool-card span:last-child{font-size:.82rem;color:#666;line-height:1.4}
        .sstc-recalc-wrap{text-align:center;margin:.5rem 0 1rem}
      `}</style>
    </div>
  );
}

export default SocialSecurityTaxCalculator;

