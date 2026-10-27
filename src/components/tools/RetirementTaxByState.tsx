/**
 * RetirementTaxByState.tsx
 * Comprehensive Retirement Tax Calculator by State — Seniors Audit
 *
 * Official Government Sources:
 * - Federal Brackets & Standard Deduction: IRS Rev. Proc. 2025-32 (2026 Tax Year)
 * - Social Security Provisional Income Formula: IRS Publication 915
 * - IRA & Pension Distribution Rules: IRS Publication 590-B & Publication 575
 * - State Tax Rules & Exemptions: Verified against each State's Department of Revenue
 *
 * Last verified: August 2026
 */

import React, { useState, useEffect, useCallback } from 'react';
import { STATES, type StateRecord, type TaxBracket, type ExemptLevel } from '../../data/stateRetirementTaxes';
import {
  taxableSS as engineTaxableSS,
  seniorDeduction as engineSeniorDeduction,
  calculateTaxableIncome as engineCalculateTaxableIncome,
  federalTax as engineFederalTax,
  marginalRate as engineMarginalRate,
  HIGH_INCOME_MESSAGE,
} from '../../lib/engine';
import { CONSTANTS_2026 } from '../../lib/constants-2026';

// ── TYPES ─────────────────────────────────────────────────────────────────────

type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';

interface Inputs {
  state: string;
  compareState1: string;
  compareState2: string;
  taxYear: number;
  age: number;
  spouseAge: number;
  filingStatus: FilingStatus;
  mfsLivedApartAllYear?: boolean;
  socialSecurity: number;
  privatePension: number;
  publicPension: number;
  militaryPension: number;
  iraWithdrawals: number;
  k401Withdrawals: number;
  k403bWithdrawals: number;
  rothIra: number;
  rothK401: number;
  rmdAmount: number;
  rmdIncludedAbove: boolean;
  wages: number;
  selfEmployment: number;
  rentalIncome: number;
  interest: number;
  dividends: number;
  capitalGains: number;
  otherIncome: number;
  useStandardDeduction: boolean;
  itemizedDeductions: number;
  qcd: number;
}

interface Results {
  grossIncome: number;
  adjustedGrossIncome: number;
  taxableSS: number;
  ssTaxablePercent: number;
  provisionalIncome: number;
  deduction: number;
  taxableIncome: number;
  federalTax: number | null;
  stateTax: number;
  totalTax: number | null;
  effectiveRate: number | null;
  afterTaxIncome: number | null;
  marginalRate: number | null;
  isOverCap: boolean;
  breakdown: { label: string; amount: number; status: 'taxable' | 'exempt' | 'partial'; note: string }[];
}

// ── STATE TAX DATABASE (50 STATES + DC) ───────────────────────────────────────
// Loaded from dated dataset file src/data/stateRetirementTaxes.ts (as of August 2026)
// Status: 2026 rates and brackets checked October 2026 (Tax Foundation, Jan. 1, 2026 tables); exclusions are simplified.

const STATE_LIST = Object.values(STATES).sort((a, b) => a.name.localeCompare(b.name));

// ── CALCULATION ENGINE ────────────────────────────────────────────────────────

function applyBrackets(taxableIncome: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let remaining = taxableIncome;
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bracketMax = bracket.max ?? Infinity;
    const bracketMin = bracket.min;
    const taxableInThisBracket = Math.min(remaining, bracketMax - bracketMin);
    if (taxableInThisBracket > 0) {
      tax += taxableInThisBracket * bracket.rate;
      remaining -= taxableInThisBracket;
    }
  }
  return Math.max(0, tax);
}

// Social Security provisional income formula per IRS Publication 915 via engine
function calculateTaxableSS(inputs: Inputs): { taxableAmount: number; percent: number; provisionalIncome: number } {
  const ssAnnual = inputs.socialSecurity;
  if (ssAnnual <= 0) return { taxableAmount: 0, percent: 0, provisionalIncome: 0 };

  const nonSSIncome =
    inputs.privatePension + inputs.publicPension + inputs.militaryPension +
    inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals +
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome +
    (inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount);

  const res = engineTaxableSS({
    ss: ssAnnual,
    otherAGI: nonSSIncome,
    status: inputs.filingStatus,
    livedWithSpouse: !inputs.mfsLivedApartAllYear,
  });

  return {
    taxableAmount: res.taxableSS,
    percent: ssAnnual > 0 ? Math.round((res.taxableSS / ssAnnual) * 100) : 0,
    provisionalIncome: res.prov,
  };
}

function calculateFederalTax(inputs: Inputs): { tax: number | null; taxableIncome: number; agi: number; deduction: number; marginalRate: number | null; isOverCap: boolean } {
  const { taxableAmount: taxableSS } = calculateTaxableSS(inputs);

  const traditionalRetirement =
    inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals;
  const effectiveRmd = inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount;

  const totalNonSS =
    inputs.privatePension + inputs.publicPension + inputs.militaryPension +
    traditionalRetirement + effectiveRmd +
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome
    - inputs.qcd;

  const agi = Math.max(0, taxableSS + totalNonSS);

  const fs = inputs.filingStatus;
  let numAged = 0;
  if (inputs.age >= 65) numAged++;
  if (fs === 'mfj' && (inputs.spouseAge || 0) >= 65) numAged++;

  const incRes = engineCalculateTaxableIncome({
    agi,
    status: fs,
    numAgedBlind: numAged,
    isItemized: !inputs.useStandardDeduction,
    itemizedAmount: inputs.itemizedDeductions,
    applySeniorDeduction: true,
    numEligibleSenior: numAged,
  });

  const taxableIncome = incRes.taxableIncome;
  const tax = engineFederalTax(taxableIncome, fs);
  const isOverCap = tax === null;
  const deduction = incRes.totalDeductions;

  let marginalRate: number | null = null;
  if (!isOverCap && taxableIncome > 0) {
    marginalRate = engineMarginalRate((inc) => {
      const s = engineTaxableSS({
        ss: inputs.socialSecurity,
        otherAGI: Math.max(0, inc),
        status: fs,
        livedWithSpouse: !inputs.mfsLivedApartAllYear,
      });
      const ti = engineCalculateTaxableIncome({
        agi: Math.max(0, inc + s.taxableSS),
        status: fs,
        numAgedBlind: numAged,
        isItemized: !inputs.useStandardDeduction,
        itemizedAmount: inputs.itemizedDeductions,
        applySeniorDeduction: true,
        numEligibleSenior: numAged,
      }).taxableIncome;
      return engineFederalTax(ti, fs);
    }, Math.max(0, totalNonSS));
  }

  return { tax, taxableIncome, agi, deduction, marginalRate, isOverCap };
}

function calculateStateTax(inputs: Inputs, stateCode: string): number {
  const state = STATES[stateCode];
  if (!state || !state.hasStateTax) return 0;

  const { taxableAmount: taxableSS } = calculateTaxableSS(inputs);
  const traditionalRetirement = inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals;
  const effectiveRmd = inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount;

  let stateTaxableIncome = 0;

  // Social Security state treatment
  if (state.socialSecurity === 'none') {
    stateTaxableIncome += taxableSS;
  } else if (state.socialSecurity === 'partial') {
    stateTaxableIncome += taxableSS * 0.4;
  }

  // Private pension state treatment
  if (state.privatePension === 'none') {
    stateTaxableIncome += inputs.privatePension;
  } else if (state.privatePension === 'partial') {
    const exemption = (inputs.filingStatus === 'mfj') ? 20000 : 10000;
    stateTaxableIncome += Math.max(0, inputs.privatePension - exemption);
  }

  // Public pension state treatment
  if (state.publicPension === 'none') {
    stateTaxableIncome += inputs.publicPension;
  } else if (state.publicPension === 'partial') {
    stateTaxableIncome += inputs.publicPension * 0.25;
  }

  // Military retirement pay state treatment. Partial-exemption states with a well-established cap use it;
  // otherwise the pay is counted as taxable, which can overstate the state tax.
  if (inputs.militaryPension > 0) {
    if (state.militaryRetirement === 'none') {
      stateTaxableIncome += inputs.militaryPension;
    } else if (state.militaryRetirement === 'partial') {
      const ageOk = !state.militaryExclusionMinAge || inputs.age >= state.militaryExclusionMinAge;
      const cap = ageOk ? (state.militaryExclusionCap ?? 0) : 0;
      stateTaxableIncome += Math.max(0, inputs.militaryPension - cap);
    }
  }

  // Traditional IRA & 401(k) state treatment
  if (state.iraWithdrawals === 'none') {
    stateTaxableIncome += traditionalRetirement + effectiveRmd;
  } else if (state.iraWithdrawals === 'partial') {
    stateTaxableIncome += Math.max(0, (traditionalRetirement + effectiveRmd) * 0.4);
  }

  // Earned & Investment income
  stateTaxableIncome +=
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome;

  stateTaxableIncome = Math.max(0, stateTaxableIncome);

  if (state.flatRate) {
    return stateTaxableIncome * state.topRate;
  }

  const fs = inputs.filingStatus === 'mfj' ? 'mfj' : 'single';
  const brackets = state.brackets?.[fs] || state.brackets?.single;
  if (!brackets) return stateTaxableIncome * state.topRate;

  return applyBrackets(stateTaxableIncome, brackets);
}

function calculate(inputs: Inputs, stateCode: string): Results {
  const { taxableAmount: taxableSS, percent: ssTaxPct, provisionalIncome } = calculateTaxableSS(inputs);
  const { tax: federalTax, taxableIncome, agi, deduction, marginalRate, isOverCap } = calculateFederalTax(inputs);
  const stateTax = calculateStateTax(inputs, stateCode);
  const totalTax = isOverCap || federalTax === null ? null : federalTax + stateTax;

  const grossIncome =
    inputs.socialSecurity + inputs.privatePension + inputs.publicPension + inputs.militaryPension +
    inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals +
    inputs.rothIra + inputs.rothK401 +
    (inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount) +
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome;

  const afterTaxIncome = totalTax === null ? null : Math.max(0, grossIncome - totalTax);
  const effectiveRate = totalTax === null ? null : (grossIncome > 0 ? totalTax / grossIncome : 0);

  const st = STATES[stateCode];
  const stateMilitaryStatus: 'taxable' | 'exempt' | 'partial' =
    !st || !st.hasStateTax || st.militaryRetirement === 'full' ? 'exempt' : st.militaryRetirement === 'partial' ? 'partial' : 'taxable';
  const stateMilitaryNote = !st
    ? 'Taxable federally; state treatment depends on your state'
    : !st.hasStateTax
      ? 'Taxable federally; no state income tax in ' + st.name
      : st.militaryRetirement === 'full'
        ? 'Taxable federally; exempt from ' + st.name + ' income tax'
        : st.militaryRetirement === 'partial'
          ? (st.militaryExclusionCap
              ? 'Taxable federally; ' + st.name + ' excludes up to ' + fmt(st.militaryExclusionCap) + ' (assumed here), so confirm that you qualify'
              : 'Taxable federally; ' + st.name + ' exempts part of it under rules this estimate does not model, so it is counted as taxable here and your real state tax may be lower')
          : 'Taxable federally and by ' + st.name;

  const breakdown = [
    {
      label: 'Social Security Benefits',
      amount: inputs.socialSecurity,
      status: ssTaxPct === 0 ? 'exempt' : ssTaxPct < 85 ? 'partial' : 'taxable',
      note: `${ssTaxPct}% taxable federally (${fmt(taxableSS)}) based on IRS provisional income formula`,
    } as const,
    {
      label: 'Private Employer Pension',
      amount: inputs.privatePension,
      status: 'taxable',
      note: 'Taxable as ordinary income federally; state exemptions apply in select states',
    } as const,
    {
      label: 'Public / Government Pension',
      amount: inputs.publicPension,
      status: 'taxable',
      note: 'Taxable federally; many states fully or partially exempt government pensions',
    } as const,
    {
      label: 'Military Retirement Pay',
      amount: inputs.militaryPension,
      status: stateMilitaryStatus,
      note: stateMilitaryNote,
    } as const,
    {
      label: 'Traditional IRA Withdrawals',
      amount: inputs.iraWithdrawals,
      status: 'taxable',
      note: 'Taxable as ordinary income federally upon distribution (IRS Pub. 590-B)',
    } as const,
    {
      label: '401(k) / 403(b) Withdrawals',
      amount: inputs.k401Withdrawals + inputs.k403bWithdrawals,
      status: 'taxable',
      note: 'Taxable as ordinary income federally (IRS Pub. 575)',
    } as const,
    {
      label: 'Roth IRA Withdrawals',
      amount: inputs.rothIra,
      status: 'exempt',
      note: 'Qualified Roth distributions are 100% tax-free at federal and state levels',
    } as const,
    {
      label: 'Roth 401(k) Withdrawals',
      amount: inputs.rothK401,
      status: 'exempt',
      note: 'Qualified Roth 401(k) distributions are 100% tax-free',
    } as const,
    {
      label: 'Wages & Self-Employment',
      amount: inputs.wages + inputs.selfEmployment,
      status: 'taxable',
      note: 'Ordinary taxable earned income subject to federal and state tax',
    } as const,
    {
      label: 'Investment Income & Dividends',
      amount: inputs.interest + inputs.dividends + inputs.capitalGains,
      status: 'partial',
      note: 'Interest is taxed as ordinary income; qualified dividends & long-term capital gains receive preferential rates',
    } as const,
  ].filter(b => b.amount > 0);

  return {
    grossIncome,
    adjustedGrossIncome: agi,
    taxableSS,
    ssTaxablePercent: ssTaxPct,
    provisionalIncome,
    deduction,
    taxableIncome,
    federalTax,
    stateTax,
    totalTax,
    effectiveRate,
    afterTaxIncome,
    marginalRate,
    isOverCap,
    breakdown,
  };
}

// ── FORMATTING HELPERS ────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'See IRS table';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n));
}
function pct(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'See IRS table';
  return (n * 100).toFixed(1) + '%';
}
function toNumber(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''));
  return isNaN(n) ? 0 : Math.max(0, n);
}

const DEFAULT_INPUTS: Inputs = {
  state: '', compareState1: '', compareState2: '',
  taxYear: 2026, age: 67, spouseAge: 65, filingStatus: 'mfj',
  socialSecurity: 38000, privatePension: 22000, publicPension: 0, militaryPension: 0,
  iraWithdrawals: 18000, k401Withdrawals: 0, k403bWithdrawals: 0,
  rothIra: 6000, rothK401: 0, rmdAmount: 0, rmdIncludedAbove: true,
  wages: 0, selfEmployment: 0, rentalIncome: 0,
  interest: 1500, dividends: 1200, capitalGains: 0, otherIncome: 0,
  useStandardDeduction: true, itemizedDeductions: 0, qcd: 0,
  mfsLivedApartAllYear: false,
};

// ── REACT COMPONENT ───────────────────────────────────────────────────────────

export function RetirementTaxByState() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<Results | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state')?.toUpperCase();
    if (stateParam && STATES[stateParam]) {
      setInputs(prev => ({ ...prev, state: stateParam }));
    }
  }, []);

  const handleStateChange = useCallback((stateCode: string) => {
    setInputs(prev => ({ ...prev, state: stateCode }));
    if (stateCode) {
      const url = new URL(window.location.href);
      url.searchParams.set('state', stateCode.toLowerCase());
      window.history.replaceState({}, '', url.toString());
    }
    if (results) {
      const updatedResults = calculate({ ...inputs, state: stateCode }, stateCode);
      setResults(updatedResults);
    }
  }, [inputs, results]);

  const setField = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  }, []);

  const setMoney = useCallback((key: keyof Inputs, val: string) => {
    setField(key, toNumber(val) as any);
  }, [setField]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!inputs.state) e.state = 'Please select your state before calculating.';
    if (inputs.age < 50 || inputs.age > 105) e.age = 'Please enter an age between 50 and 105.';
    if (inputs.filingStatus === 'mfj' && (inputs.spouseAge < 18 || inputs.spouseAge > 105)) {
      e.spouseAge = 'Please enter a valid spouse age.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCalculate() {
    if (!validate()) {
      setStep(1);
      return;
    }
    const r = calculate(inputs, inputs.state);
    setResults(r);
    setStep(4);
    setTimeout(() => {
      document.getElementById('rtbs-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  const selectedState = inputs.state ? STATES[inputs.state] : null;
  const cmp1 = inputs.compareState1 ? calculate(inputs, inputs.compareState1) : null;
  const cmp2 = inputs.compareState2 ? calculate(inputs, inputs.compareState2) : null;

  return (
    <div className="rtbs-container" id="calculator">
      {/* Steps Progress Bar */}
      <div className="rtbs-progress-header">
        <div className="rtbs-progress-meta">
          <span className="rtbs-progress-step-label">
            {step === 1 && '📍 Step 1 of 3: Location & Filing Status'}
            {step === 2 && '💵 Step 2 of 3: Retirement Income Sources'}
            {step === 3 && '📋 Step 3 of 3: Deductions & QCD Adjustments'}
            {step === 4 && '✅ Summary & Multi-State Results'}
          </span>
          <span className="rtbs-progress-percent">
            {step === 1 ? '33% Complete' : step === 2 ? '66% Complete' : step === 3 ? '100% Complete' : 'Completed'}
          </span>
        </div>
        <div className="rtbs-progress-track" role="progressbar" aria-valuenow={step === 1 ? 33 : step === 2 ? 66 : 100} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="rtbs-progress-fill"
            style={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      {step < 4 && (
        <div className="rtbs-nav" role="tablist" aria-label="Calculator Steps">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              role="tab"
              aria-selected={step === s}
              className={`rtbs-nav-tab${step === s ? ' active' : step > s ? ' completed' : ''}`}
              onClick={() => setStep(s)}
            >
              <span className="tab-num">{s}</span>
              <span className="tab-text">{['1. Location & Filing', '2. Retirement Income', '3. Deductions'][s - 1]}</span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 1: Location & Filing */}
      {step === 1 && (
        <div className="rtbs-card">
          <h2 className="rtbs-card-title">Step 1 — Where Do You Live & How Do You File?</h2>
          <p className="rtbs-card-desc">State tax rules differ significantly. Choose your state to load exact 2026 retirement income rules.</p>

          <div className="rtbs-form-group">
            <label htmlFor="rtbs-state-select" className="rtbs-label">
              Select Your State <span className="rtbs-req">*</span>
              <span className="rtbs-state-date-label" style={{ fontSize: '0.825rem', fontWeight: 400, color: 'var(--text-muted, #64748b)', marginLeft: '0.5rem' }}>
                (as of August 2026)
              </span>
            </label>
            <select
              id="rtbs-state-select"
              className={`rtbs-select${errors.state ? ' error' : ''}`}
              value={inputs.state}
              onChange={e => handleStateChange(e.target.value)}
              aria-required="true"
            >
              <option value="">-- Choose a State (All 50 States + DC) --</option>
              {STATE_LIST.map(s => (
                <option key={s.code} value={s.code}>
                  {s.name} {s.hasStateTax ? `(State tax up to ${pct(s.topRate)})` : '(No state income tax)'}
                </option>
              ))}
            </select>
            {errors.state && <p className="rtbs-err-text">{errors.state}</p>}
          </div>

          <div className="rtbs-grid-2">
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-tax-year" className="rtbs-label">Tax Year</label>
              <select
                id="rtbs-tax-year"
                className="rtbs-select"
                value={inputs.taxYear}
                onChange={e => setField('taxYear', parseInt(e.target.value))}
              >
                <option value={2026}>2026 (Current Tax Year)</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div className="rtbs-form-group">
              <label htmlFor="rtbs-filing-status" className="rtbs-label">Filing Status</label>
              <select
                id="rtbs-filing-status"
                className="rtbs-select"
                value={inputs.filingStatus}
                onChange={e => setField('filingStatus', e.target.value as FilingStatus)}
              >
                <option value="mfj">Married Filing Jointly</option>
                <option value="single">Single</option>
                <option value="hoh">Head of Household</option>
                <option value="mfs">Married Filing Separately</option>
              </select>
            </div>
            {inputs.filingStatus === 'mfs' && (
              <div className="rtbs-form-group" style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#0D2137', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={inputs.mfsLivedApartAllYear || false}
                    onChange={e => setField('mfsLivedApartAllYear', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0A3D3A' }}
                  />
                  <span>Lived apart from spouse for the entire year (allows standard provisional income thresholds $25,000 / $34,000)</span>
                </label>
              </div>
            )}
          </div>

          <div className="rtbs-grid-2">
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-age" className="rtbs-label">
                Your Age <span className="rtbs-req">*</span>
              </label>
              <input
                id="rtbs-age"
                type="number"
                min={50}
                max={105}
                className={`rtbs-input${errors.age ? ' error' : ''}`}
                value={inputs.age || ''}
                onChange={e => setField('age', parseInt(e.target.value) || 0)}
              />
              <span className="rtbs-helper">Age 65+ qualifies for higher IRS standard deduction.</span>
              {errors.age && <p className="rtbs-err-text">{errors.age}</p>}
            </div>

            {inputs.filingStatus === 'mfj' && (
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-spouse-age" className="rtbs-label">Spouse Age</label>
                <input
                  id="rtbs-spouse-age"
                  type="number"
                  min={18}
                  max={105}
                  className={`rtbs-input${errors.spouseAge ? ' error' : ''}`}
                  value={inputs.spouseAge || ''}
                  onChange={e => setField('spouseAge', parseInt(e.target.value) || 0)}
                />
                <span className="rtbs-helper">Spouse age 65+ adds an extra $1,650 standard deduction.</span>
                {errors.spouseAge && <p className="rtbs-err-text">{errors.spouseAge}</p>}
              </div>
            )}
          </div>

          {selectedState && (
            <div className="rtbs-state-preview">
              <p className="preview-heading">📌 {selectedState.name} Retirement Overview</p>
              <div className="preview-badges">
                <span className={`badge ${selectedState.hasStateTax ? 'warn' : 'success'}`}>
                  {selectedState.hasStateTax ? `Top Tax Rate: ${pct(selectedState.topRate)}` : 'No State Income Tax'}
                </span>
                <span className={`badge ${selectedState.socialSecurity === 'full' ? 'success' : 'warn'}`}>
                  Social Security: {selectedState.socialSecurity === 'full' ? '100% Exempt' : 'Partially Taxed'}
                </span>
                <span className={`badge ${selectedState.militaryRetirement === 'full' ? 'success' : selectedState.militaryRetirement === 'partial' ? 'info' : 'warn'}`}>
                  Military Pay: {selectedState.militaryRetirement === 'full' ? '100% Exempt' : selectedState.militaryRetirement === 'partial' ? 'Partly Exempt' : 'Taxed'}
                </span>
              </div>
            </div>
          )}

          <div className="rtbs-actions-right">
            <button className="rtbs-btn primary" onClick={() => setStep(2)}>
              Continue to Income Sources →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Retirement Income */}
      {step === 2 && (
        <div className="rtbs-card">
          <h2 className="rtbs-card-title">Step 2 — Enter Your Retirement Income Sources</h2>
          <p className="rtbs-card-desc">Enter annual dollar amounts. Only fill in what applies to you — leave others as $0.</p>

          <div className="rtbs-income-block">
            <h3 className="block-title">🏛️ Social Security Benefits</h3>
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-income-ss" className="rtbs-label">Total Annual Social Security Benefits</label>
              <div className="input-currency-wrap">
                <span className="currency-symbol">$</span>
                <input
                  id="rtbs-income-ss"
                  type="number"
                  min={0}
                  className="rtbs-input"
                  value={inputs.socialSecurity || ''}
                  placeholder="0"
                  onChange={e => setMoney('socialSecurity', e.target.value)}
                />
              </div>
              <span className="rtbs-helper">
                Combined annual gross amount before Medicare Part B deductions. Don't know your exact check amount? Estimate it with our <a href="/tools/social-security-benefits-calculator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">Social Security Benefits Estimator</a> or find your claiming window using our <a href="/tools/social-security-full-retirement-age-calculator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">FRA Calculator</a>.
              </span>
            </div>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">💼 Pension Distributions</h3>
            <div className="rtbs-grid-2">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-priv-pen" className="rtbs-label">Private Employer Pension (Annual)</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-priv-pen"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.privatePension || ''}
                    placeholder="0"
                    onChange={e => setMoney('privatePension', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-pub-pen" className="rtbs-label">Government / Public Pension (Annual)</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-pub-pen"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.publicPension || ''}
                    placeholder="0"
                    onChange={e => setMoney('publicPension', e.target.value)}
                  />
                </div>
                <span className="rtbs-helper">Federal civil service (FERS/CSRS), state, or municipal pensions.</span>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-mil-pen" className="rtbs-label">Military Retirement Pay (Annual)</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-mil-pen"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.militaryPension || ''}
                    placeholder="0"
                    onChange={e => setMoney('militaryPension', e.target.value)}
                  />
                </div>
                <span className="rtbs-helper">Taxable federally. States treat it differently, so it is kept separate. VA disability pay is not taxable; leave it out.</span>
              </div>
            </div>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">📈 Traditional Pre-Tax Retirement Accounts</h3>
            <div className="rtbs-grid-2">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-ira" className="rtbs-label">Traditional IRA Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-ira"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.iraWithdrawals || ''}
                    placeholder="0"
                    onChange={e => setMoney('iraWithdrawals', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-401k" className="rtbs-label">401(k) / 403(b) Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-401k"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.k401Withdrawals || ''}
                    placeholder="0"
                    onChange={e => setMoney('k401Withdrawals', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="rtbs-grid-2" style={{ marginTop: '0.5rem' }}>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-rmd" className="rtbs-label">Required Minimum Distribution (RMD)</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-rmd"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.rmdAmount || ''}
                    placeholder="0"
                    onChange={e => setMoney('rmdAmount', e.target.value)}
                  />
                </div>
                <span className="rtbs-helper">
                  Age 73+? Not sure how much you must withdraw? Calculate your official IRS required distribution with our <a href="/tools/rmd-calculator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">RMD Calculator by Age</a>.
                </span>
                <label className="rtbs-check-label">
                  <input
                    type="checkbox"
                    checked={inputs.rmdIncludedAbove}
                    onChange={e => setField('rmdIncludedAbove', e.target.checked)}
                  />
                  <span>RMD amount is already included in IRA/401(k) above</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">🛡️ Tax-Free Roth Withdrawals</h3>
            <div className="rtbs-grid-2">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-roth-ira" className="rtbs-label">Roth IRA Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-roth-ira"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.rothIra || ''}
                    placeholder="0"
                    onChange={e => setMoney('rothIra', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-roth-401k" className="rtbs-label">Roth 401(k) Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-roth-401k"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.rothK401 || ''}
                    placeholder="0"
                    onChange={e => setMoney('rothK401', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <span className="rtbs-helper">
              Qualified Roth withdrawals are 100% tax-free. Considering moving money from a Traditional IRA to Roth to lower future taxes? Model it with our <a href="/tools/roth-conversion-calculator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">Roth Conversion Calculator</a>.
            </span>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">💵 Other Income (Wages, Interest, Dividends)</h3>
            <div className="rtbs-grid-3">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-wages" className="rtbs-label">Wages / Part-Time</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-wages"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.wages || ''}
                    placeholder="0"
                    onChange={e => setMoney('wages', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-interest" className="rtbs-label">Interest & Dividends</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-interest"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={(inputs.interest + inputs.dividends) || ''}
                    placeholder="0"
                    onChange={e => {
                      const val = toNumber(e.target.value);
                      setField('interest', val);
                      setField('dividends', 0);
                    }}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-other" className="rtbs-label">Capital Gains / Other</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-other"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={(inputs.capitalGains + inputs.otherIncome) || ''}
                    placeholder="0"
                    onChange={e => {
                      const val = toNumber(e.target.value);
                      setField('capitalGains', val);
                      setField('otherIncome', 0);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rtbs-actions-between">
            <button className="rtbs-btn secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="rtbs-btn primary" onClick={() => setStep(3)}>Continue to Deductions →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Deductions */}
      {step === 3 && (
        <div className="rtbs-card">
          <h2 className="rtbs-card-title">Step 3 — Tax Deductions & Adjustments</h2>
          <p className="rtbs-card-desc">Most retirees use the Standard Deduction with the additional age 65+ senior increase.</p>

          <div className="rtbs-toggle-group">
            <button
              type="button"
              className={`toggle-btn${inputs.useStandardDeduction ? ' active' : ''}`}
              onClick={() => setField('useStandardDeduction', true)}
            >
              Standard Deduction (Recommended)
            </button>
            <button
              type="button"
              className={`toggle-btn${!inputs.useStandardDeduction ? ' active' : ''}`}
              onClick={() => setField('useStandardDeduction', false)}
            >
              Itemized Deductions
            </button>
          </div>

          {inputs.useStandardDeduction ? (
            <div className="deduction-callout">
              <p className="deduction-title">Official 2026 IRS Standard Deduction for Your Household:</p>
              {(() => {
                const fs = inputs.filingStatus;
                const base = CONSTANTS_2026.standardDeduction[fs] ?? CONSTANTS_2026.standardDeduction.single;
                const addl = (fs === 'mfj' || fs === 'mfs')
                  ? CONSTANTS_2026.additionalAgedBlind.married
                  : CONSTANTS_2026.additionalAgedBlind.unmarried;
                let seniorAddl = 0;
                if (inputs.age >= 65) seniorAddl += addl;
                if (fs === 'mfj' && inputs.spouseAge >= 65) seniorAddl += addl;
                const total = base + seniorAddl;
                return (
                  <div>
                    <p className="deduction-num">{fmt(total)}</p>
                    <p className="deduction-breakdown">
                      Base {fs === 'mfj' ? 'Married Joint' : 'Single'} Deduction: {fmt(base)}
                      {seniorAddl > 0 && ` + Senior Age 65+ Addition: ${fmt(seniorAddl)}`}
                    </p>
                    <p className="deduction-cite">Source: IRS Rev. Proc. 2025-32 (2026 Tax Table Updates)</p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-itemized-val" className="rtbs-label">Total Itemized Deductions (Schedule A)</label>
              <div className="input-currency-wrap">
                <span className="currency-symbol">$</span>
                <input
                  id="rtbs-itemized-val"
                  type="number"
                  min={0}
                  className="rtbs-input"
                  value={inputs.itemizedDeductions || ''}
                  placeholder="0"
                  onChange={e => setMoney('itemizedDeductions', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="rtbs-form-group" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="rtbs-qcd-input" className="rtbs-label">
              Qualified Charitable Distribution (QCD) — Optional
            </label>
            <div className="input-currency-wrap">
              <span className="currency-symbol">$</span>
              <input
                id="rtbs-qcd-input"
                type="number"
                min={0}
                className="rtbs-input"
                value={inputs.qcd || ''}
                placeholder="0"
                onChange={e => setMoney('qcd', e.target.value)}
              />
            </div>
            <span className="rtbs-helper">
              Direct transfers from IRA to charity for age 70½+ (up to $111,000 in 2026). Lowers your AGI directly.
            </span>
          </div>

          <div className="rtbs-actions-between">
            <button className="rtbs-btn secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="rtbs-btn calculate" onClick={handleCalculate}>
              Calculate My Retirement Taxes
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Results & Decision Support */}
      {step === 4 && results && (
        <div id="rtbs-results" className="rtbs-results-wrap">
          <div className="results-header">
            <h2 className="results-title">Your Estimated 2026 Retirement Tax Summary</h2>
            <p className="results-sub">
              Calculated for <strong>{selectedState?.name || 'Selected State'}</strong> based on your retirement income sources (2026 state rates and brackets checked {selectedState?.lastVerified || 'October 2026'}).
            </p>
            <div className="results-disclaimer-box">
              ⚠️ <strong>Educational Planning Estimate:</strong> Federal figures use the 2026 IRS tax brackets (IRS Rev. Proc. 2025-32). State figures use 2026 state rates and brackets but simplify each state's retirement exclusions, standard deductions and credits, so your state return can differ. These are educational estimates and do not replace personalized professional tax advice.
            </div>
            {results.isOverCap && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '0.5rem', padding: '0.85rem 1rem', color: '#991b1b', fontWeight: 600, marginTop: '1rem', fontSize: '0.95rem' }}>
                ⚠️ {HIGH_INCOME_MESSAGE}
              </div>
            )}
          </div>

          {/* Primary Summary Grid */}
          <div className="summary-grid">
            <div className="summary-card fed">
              <span className="card-lbl">Estimated Federal Tax</span>
              <span className="card-val">{fmt(results.federalTax)}</span>
              <span className="card-sub">{results.isOverCap ? 'Above modeling cap' : 'IRS 2026 Brackets'}</span>
            </div>
            <div className="summary-card state">
              <span className="card-lbl">Estimated State Tax</span>
              <span className="card-val">{fmt(results.stateTax)}</span>
              <span className="card-sub">{selectedState?.name}</span>
            </div>
            <div className="summary-card total">
              <span className="card-lbl">Total Estimated Tax</span>
              <span className="card-val">{fmt(results.totalTax)}</span>
              <span className="card-sub">{results.isOverCap ? 'Above modeling cap' : 'Federal + State'}</span>
            </div>
            <div className="summary-card net">
              <span className="card-lbl">Estimated After-Tax Income</span>
              <span className="card-val">{fmt(results.afterTaxIncome)}</span>
              <span className="card-sub">Take-Home Retirement Funds</span>
            </div>
            <div className="summary-card rate">
              <span className="card-lbl">Effective Tax Rate</span>
              <span className="card-val">{pct(results.effectiveRate)}</span>
              <span className="card-sub">{results.isOverCap ? 'Above modeling cap' : `Marginal Bracket: ${pct(results.marginalRate)}`}</span>
            </div>
          </div>

          {/* Step-by-Step Calculation Engine Output */}
          <div className="rtbs-section">
            <h3 className="section-title">📊 How Your Federal Tax Was Calculated</h3>
            <div className="calc-table-wrap">
              <table className="calc-table">
                <tbody>
                  <tr>
                    <td>Total Gross Retirement Income</td>
                    <td className="text-right font-bold">{fmt(results.grossIncome)}</td>
                  </tr>
                  <tr>
                    <td>Social Security Subject to Federal Tax ({results.ssTaxablePercent}% taxable)</td>
                    <td className="text-right">{fmt(results.taxableSS)}</td>
                  </tr>
                  <tr>
                    <td>Adjusted Gross Income (AGI)</td>
                    <td className="text-right font-bold">{fmt(results.adjustedGrossIncome)}</td>
                  </tr>
                  <tr>
                    <td>Less: Standard Deduction (includes Age 65+ addition)</td>
                    <td className="text-right text-green">({fmt(results.deduction)})</td>
                  </tr>
                  <tr className="highlight-row">
                    <td><strong>Federal Taxable Income</strong></td>
                    <td className="text-right font-bold"><strong>{fmt(results.taxableIncome)}</strong></td>
                  </tr>
                  <tr>
                    <td>IRS Provisional Income (SS formula)</td>
                    <td className="text-right text-muted">{fmt(results.provisionalIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Taxable vs. Exempt Income Breakdown */}
          <div className="rtbs-section">
            <h3 className="section-title">🔍 Your Income Sources: Taxable vs. Exempt</h3>
            <div className="income-pill-list">
              {results.breakdown.map((item, idx) => (
                <div key={idx} className="income-pill-row">
                  <div className="pill-head">
                    <span className="pill-name">{item.label}</span>
                    <span className={`status-tag ${item.status}`}>
                      {item.status === 'taxable' ? 'Taxable' : item.status === 'exempt' ? 'Tax-Free / Exempt' : 'Partially Taxed'}
                    </span>
                    <span className="pill-amt">{fmt(item.amount)}</span>
                  </div>
                  <p className="pill-note">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Security Taxation Deep Dive */}
          {inputs.socialSecurity > 0 && (
            <div className="deep-callout">
              <p className="deep-title">🏛️ Why {results.ssTaxablePercent}% of Your Social Security Is Taxable</p>
              <p>
                Under <strong>IRS Publication 915</strong>, your Social Security benefit taxability is based on <strong>Provisional Income</strong> (also called Combined Income):
              </p>
              <p className="formula-box">
                Provisional Income = Non-Social Security Income + 50% of Social Security Benefits
              </p>
              <p>
                Your Provisional Income is <strong>{fmt(results.provisionalIncome)}</strong>.
                {inputs.filingStatus === 'mfj' ? (
                  <> For married joint filers, income below $32,000 is 0% taxed; between $32,000 and $44,000 is up to 50% taxed; above $44,000 is up to 85% taxed.</>
                ) : (
                  <> For single filers, income below $25,000 is 0% taxed; between $25,000 and $34,000 is up to 50% taxed; above $34,000 is up to 85% taxed.</>
                )}
              </p>
              <p className="cite-text">Official Source: <a href="https://www.irs.gov/pub/irs-pdf/p915.pdf" target="_blank" rel="noopener noreferrer">IRS Publication 915: Social Security and Equivalent Railroad Retirement Benefits</a></p>
            </div>
          )}

          {/* Selected State Tax Details */}
          {selectedState && (
            <div className="rtbs-section state-card-box">
              <h3 className="section-title">📍 {selectedState.name} Retirement Tax Details</h3>
              <p className="state-date">2026 rates and brackets checked {selectedState.lastVerified} against Tax Foundation's January 1, 2026 state tables. Exclusion rules below are summaries: confirm with your state tax agency.</p>

              <table className="state-rules-table">
                <thead>
                  <tr>
                    <th>Retirement Income Stream</th>
                    <th>{selectedState.name} Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Social Security Benefits</strong></td>
                    <td>{selectedState.ssTaxNote}</td>
                  </tr>
                  <tr>
                    <td><strong>Private Employer Pensions</strong></td>
                    <td>{selectedState.privatePensionNote}</td>
                  </tr>
                  <tr>
                    <td><strong>Government / Public Pensions</strong></td>
                    <td>{selectedState.publicPensionNote}</td>
                  </tr>
                  <tr>
                    <td><strong>Traditional IRA / 401(k)</strong></td>
                    <td>{selectedState.iraNotes}</td>
                  </tr>
                  <tr>
                    <td><strong>Roth IRA Distributions</strong></td>
                    <td>{selectedState.rothNotes}</td>
                  </tr>
                  <tr>
                    <td><strong>Military Retirement Pay</strong></td>
                    <td>{selectedState.militaryNote}</td>
                  </tr>
                </tbody>
              </table>

              {selectedState.seniorBenefits && (
                <div className="senior-box">
                  <strong>Senior & Property Tax Provisions:</strong> {selectedState.seniorBenefits}
                </div>
              )}

              <p className="state-summary-notes">{selectedState.notes}</p>

              <div className="sources-list">
                <span className="sources-head">Official State Sources:</span>
                {selectedState.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="state-link">
                    🔗 {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* State Comparison Tool */}
          <div className="rtbs-section compare-box">
            <h3 className="section-title">🔄 Compare Retirement Taxes Across States</h3>
            <p className="compare-intro">
              Considering a move in retirement? Compare up to 3 states. Your income entries remain unchanged while state tax formulas are recalculated.
            </p>

            <div className="rtbs-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-cmp1" className="rtbs-label">Compare Against State 1</label>
                <select
                  id="rtbs-cmp1"
                  className="rtbs-select"
                  value={inputs.compareState1}
                  onChange={e => setField('compareState1', e.target.value)}
                >
                  <option value="">-- Choose State 1 --</option>
                  {STATE_LIST.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="rtbs-form-group">
                <label htmlFor="rtbs-cmp2" className="rtbs-label">Compare Against State 2</label>
                <select
                  id="rtbs-cmp2"
                  className="rtbs-select"
                  value={inputs.compareState2}
                  onChange={e => setField('compareState2', e.target.value)}
                >
                  <option value="">-- Choose State 2 --</option>
                  {STATE_LIST.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {(inputs.compareState1 || inputs.compareState2) && (
              <div className="compare-table-wrap">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>Factor</th>
                      <th>{selectedState?.name || 'Selected'}</th>
                      {inputs.compareState1 && <th>{STATES[inputs.compareState1]?.name}</th>}
                      {inputs.compareState2 && <th>{STATES[inputs.compareState2]?.name}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="highlight">
                      <td>Estimated State Tax</td>
                      <td><strong>{fmt(results.stateTax)}</strong></td>
                      {cmp1 && <td><strong>{fmt(cmp1.stateTax)}</strong></td>}
                      {cmp2 && <td><strong>{fmt(cmp2.stateTax)}</strong></td>}
                    </tr>
                    <tr>
                      <td>Total Estimated Tax (Fed + State)</td>
                      <td>{fmt(results.totalTax)}</td>
                      {cmp1 && <td>{fmt(cmp1.totalTax)}</td>}
                      {cmp2 && <td>{fmt(cmp2.totalTax)}</td>}
                    </tr>
                    <tr>
                      <td>Estimated After-Tax Income</td>
                      <td>{fmt(results.afterTaxIncome)}</td>
                      {cmp1 && <td>{fmt(cmp1.afterTaxIncome)}</td>}
                      {cmp2 && <td>{fmt(cmp2.afterTaxIncome)}</td>}
                    </tr>
                    <tr>
                      <td>Effective Combined Tax Rate</td>
                      <td>{pct(results.effectiveRate)}</td>
                      {cmp1 && <td>{pct(cmp1.effectiveRate)}</td>}
                      {cmp2 && <td>{pct(cmp2.effectiveRate)}</td>}
                    </tr>
                    <tr>
                      <td>Social Security Tax Status</td>
                      <td>{selectedState?.socialSecurity === 'full' ? '✅ 100% Exempt' : '⚠️ Partial / Taxed'}</td>
                      {inputs.compareState1 && <td>{STATES[inputs.compareState1]?.socialSecurity === 'full' ? '✅ 100% Exempt' : '⚠️ Partial / Taxed'}</td>}
                      {inputs.compareState2 && <td>{STATES[inputs.compareState2]?.socialSecurity === 'full' ? '✅ 100% Exempt' : '⚠️ Partial / Taxed'}</td>}
                    </tr>
                    <tr>
                      <td>State Top Income Tax Rate</td>
                      <td>{selectedState?.hasStateTax ? pct(selectedState.topRate) : '0% (No tax)'}</td>
                      {inputs.compareState1 && <td>{STATES[inputs.compareState1]?.hasStateTax ? pct(STATES[inputs.compareState1].topRate) : '0% (No tax)'}</td>}
                      {inputs.compareState2 && <td>{STATES[inputs.compareState2]?.hasStateTax ? pct(STATES[inputs.compareState2].topRate) : '0% (No tax)'}</td>}
                    </tr>
                  </tbody>
                </table>

                <div className="compare-warning">
                  💡 <strong>Decision Insight:</strong> A state having no income tax does not automatically make it the cheapest retirement destination. Property taxes, sales taxes, local healthcare costs, and overall cost of living must also be evaluated.
                </div>
              </div>
            )}
          </div>

          {/* Reset & Edit buttons */}
          <div className="rtbs-actions-between" style={{ marginTop: '1.5rem' }}>
            <button className="rtbs-btn secondary" onClick={() => { setStep(1); setResults(null); }}>
              🔄 Start Over
            </button>
            <button className="rtbs-btn primary" onClick={() => setStep(2)}>
              ✏️ Adjust Income Numbers
            </button>
          </div>

          {/* Next Logical Decision Helpers */}
          <div className="next-steps-section">
            <h3 className="section-title">🎯 What Should You Investigate Next?</h3>
            <div className="next-steps-grid">
              {(results.totalTax ?? 0) > 0 && (
                <a href="/tools/retirement-tax-withholding-calculator/" className="next-tool-card">
                  <span className="tool-icon">📋</span>
                  <strong>Retirement Tax Withholding Calculator</strong>
                  <span>Calculate how much federal tax to withhold from your pension or IRA via Form W-4P.</span>
                </a>
              )}
              {(inputs.iraWithdrawals > 0 || inputs.k401Withdrawals > 0) && (
                <a href="/tools/rmd-calculator/" className="next-tool-card">
                  <span className="tool-icon">📅</span>
                  <strong>RMD Calculator by Age</strong>
                  <span>Find your required minimum distribution amounts and IRS life expectancy factors.</span>
                </a>
              )}
              {results.adjustedGrossIncome > 100000 && (
                <a href="/tools/medicare-irmaa-calculator/" className="next-tool-card">
                  <span className="tool-icon">🏥</span>
                  <strong>Medicare IRMAA Calculator</strong>
                  <span>Your retirement income may trigger high-earner surcharges on Medicare Parts B and D.</span>
                </a>
              )}
              <a href="/tools/roth-conversion-calculator/" className="next-tool-card">
                <span className="tool-icon">🔄</span>
                <strong>Roth Conversion Calculator</strong>
                <span>Model whether converting traditional IRA money to Roth saves taxes before RMDs start.</span>
              </a>
              <a href="/tools/property-tax-relief-checker/" className="next-tool-card">
                <span className="tool-icon">🏡</span>
                <strong>Property Tax Relief Checker</strong>
                <span>Find senior homeowner property tax exemptions, circuit breaker credits, and freezes by state.</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS STYLES ── */}
      <style>{`
        .rtbs-container {
          font-family: inherit;
          color: #1A1A2E;
          width: 100%;
        }
        .rtbs-progress-header {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.25rem;
        }
        .rtbs-progress-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .rtbs-progress-step-label {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0A3D3A;
        }
        .rtbs-progress-percent {
          font-size: 0.82rem;
          font-weight: 800;
          color: #C9933A;
          background: #FFFFFF;
          padding: 0.15rem 0.55rem;
          border-radius: 12px;
          border: 1px solid #C9933A;
        }
        .rtbs-progress-track {
          width: 100%;
          height: 8px;
          background: #E2E8F0;
          border-radius: 4px;
          overflow: hidden;
        }
        .rtbs-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0A3D3A 0%, #C9933A 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .rtbs-nav {
          display: flex;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          background: #F8FBFB;
        }
        .rtbs-nav-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 0.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          color: #555;
          border-right: 1px solid #C0DBD9;
          transition: all 0.2s ease;
        }
        .rtbs-nav-tab:last-child {
          border-right: none;
        }
        .rtbs-nav-tab.active {
          background: #0A3D3A;
          color: #FFFFFF;
        }
        .rtbs-nav-tab.completed {
          background: #E8F5F4;
          color: #0A3D3A;
        }
        .tab-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
          font-size: 0.85rem;
        }
        .rtbs-nav-tab.active .tab-num {
          background: #C9933A;
          color: #FFFFFF;
        }
        .rtbs-card {
          background: #FFFFFF;
          border: 1px solid #D5E5E4;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(10, 61, 58, 0.05);
        }
        .rtbs-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
        }
        .rtbs-card-desc {
          font-size: 0.95rem;
          color: #555;
          margin: 0 0 1.5rem 0;
        }
        .rtbs-form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
        }
        .rtbs-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1A1A2E;
          margin-bottom: 0.4rem;
        }
        .rtbs-req {
          color: #C53030;
        }
        .rtbs-select, .rtbs-input {
          padding: 0.75rem 1rem;
          border: 1.5px solid #CBD5E0;
          border-radius: 8px;
          font-size: 1rem;
          color: #1A1A2E;
          background: #FFFFFF;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .rtbs-select:focus, .rtbs-input:focus {
          outline: none;
          border-color: #0A3D3A;
          box-shadow: 0 0 0 3px rgba(10, 61, 58, 0.15);
        }
        .rtbs-select.error, .rtbs-input.error {
          border-color: #C53030;
        }
        .rtbs-err-text {
          color: #C53030;
          font-size: 0.85rem;
          margin-top: 0.3rem;
          font-weight: 600;
        }
        .rtbs-helper {
          font-size: 0.82rem;
          color: #666;
          margin-top: 0.3rem;
          line-height: 1.4;
        }
        .rtbs-inline-link {
          color: #0A3D3A;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .rtbs-inline-link:hover {
          color: #082E2C;
        }
        .input-currency-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .currency-symbol {
          position: absolute;
          left: 1rem;
          font-weight: 700;
          color: #666;
          font-size: 1.1rem;
          pointer-events: none;
        }
        .input-currency-wrap .rtbs-input {
          padding-left: 2.2rem;
        }
        .rtbs-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .rtbs-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }
        .rtbs-income-block {
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          background: #FAFAFC;
        }
        .block-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 1rem 0;
        }
        .rtbs-check-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #444;
          margin-top: 0.5rem;
          cursor: pointer;
        }
        .rtbs-state-preview {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          margin-bottom: 1.5rem;
        }
        .preview-heading {
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
        }
        .preview-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .badge {
          display: inline-block;
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .badge.success { background: #D4EDDA; color: #155724; }
        .badge.warn { background: #FFF3CD; color: #856404; }
        .badge.info { background: #E2E8F0; color: #2D3748; }
        .rtbs-actions-right {
          display: flex;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .rtbs-actions-between {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          gap: 1rem;
        }
        .rtbs-btn {
          padding: 0.85rem 1.75rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .rtbs-btn.primary {
          background: #0A3D3A;
          color: #FFFFFF;
        }
        .rtbs-btn.primary:hover {
          background: #082E2C;
        }
        .rtbs-btn.secondary {
          background: #E2E8F0;
          color: #2D3748;
        }
        .rtbs-btn.secondary:hover {
          background: #CBD5E0;
        }
        .rtbs-btn.calculate {
          background: #C9933A;
          color: #FFFFFF;
          font-size: 1.1rem;
          padding: 0.95rem 2rem;
        }
        .rtbs-btn.calculate:hover {
          background: #AD7D2E;
        }
        .rtbs-toggle-group {
          display: flex;
          border: 1px solid #CBD5E0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .toggle-btn {
          flex: 1;
          padding: 0.75rem;
          background: #F7FAFC;
          border: none;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          color: #4A5568;
        }
        .toggle-btn.active {
          background: #0A3D3A;
          color: #FFFFFF;
        }
        .deduction-callout {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .deduction-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
        }
        .deduction-num {
          font-size: 2rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0;
        }
        .deduction-breakdown {
          font-size: 0.85rem;
          color: #555;
          margin: 0.3rem 0 0.2rem 0;
        }
        .deduction-cite {
          font-size: 0.78rem;
          color: #777;
          margin: 0;
        }

        /* Results Styling */
        .rtbs-results-wrap {
          background: #FFFFFF;
          border: 1px solid #D5E5E4;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 6px 18px rgba(10, 61, 58, 0.08);
        }
        .results-header {
          margin-bottom: 1.5rem;
        }
        .results-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0 0 0.25rem 0;
        }
        .results-sub {
          font-size: 1rem;
          color: #555;
          margin: 0 0 1rem 0;
        }
        .results-disclaimer-box {
          background: #FFF9E6;
          border-left: 4px solid #C9933A;
          padding: 0.75rem 1rem;
          border-radius: 0 6px 6px 0;
          font-size: 0.85rem;
          color: #444;
          line-height: 1.4;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .summary-card {
          background: #FAFAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 1.25rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .summary-card.fed { border-top: 4px solid #2B6CB0; }
        .summary-card.state { border-top: 4px solid #2F855A; }
        .summary-card.total { border-top: 4px solid #C53030; background: #FFF5F5; }
        .summary-card.net { border-top: 4px solid #0A3D3A; background: #F0F7F6; }
        .summary-card.rate { border-top: 4px solid #C9933A; }
        .card-lbl {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          color: #666;
          margin-bottom: 0.4rem;
        }
        .card-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0A3D3A;
          margin-bottom: 0.25rem;
        }
        .card-sub {
          font-size: 0.75rem;
          color: #777;
        }
        .rtbs-section {
          margin-bottom: 2rem;
        }
        .section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0A3D3A;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .calc-table-wrap {
          overflow-x: auto;
        }
        .calc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
        .calc-table td {
          padding: 0.6rem 0.5rem;
          border-bottom: 1px solid #EDF2F7;
        }
        .calc-table .text-right { text-align: right; }
        .calc-table .font-bold { font-weight: 700; }
        .calc-table .text-green { color: #276749; font-weight: 600; }
        .calc-table .text-muted { color: #718096; }
        .calc-table .highlight-row td {
          background: #F0F7F6;
          border-top: 2px solid #0A3D3A;
          border-bottom: 2px solid #0A3D3A;
        }
        .income-pill-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .income-pill-row {
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          background: #FAFAFC;
        }
        .pill-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .pill-name {
          font-weight: 700;
          color: #1A1A2E;
        }
        .status-tag {
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .status-tag.taxable { background: #FED7D7; color: #9B2C2C; }
        .status-tag.exempt { background: #C6F6D5; color: #22543D; }
        .status-tag.partial { background: #FEFCBF; color: #744210; }
        .pill-amt {
          font-weight: 700;
          color: #0A3D3A;
        }
        .pill-note {
          font-size: 0.82rem;
          color: #666;
          margin: 0.3rem 0 0 0;
        }
        .deep-callout {
          background: #08111F;
          color: #FFFFFF;
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-left: 5px solid #C9933A;
        }
        .deep-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #C9933A;
          margin: 0 0 0.5rem 0;
        }
        .formula-box {
          background: rgba(255,255,255,0.08);
          border: 1px dashed rgba(201,147,58,0.4);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9rem;
          color: #E2E8F0;
          margin: 0.75rem 0;
        }
        .cite-text {
          font-size: 0.8rem;
          color: #A0AEC0;
          margin-top: 0.75rem;
        }
        .cite-text a {
          color: #C9933A;
          text-decoration: underline;
        }
        .state-card-box {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 10px;
          padding: 1.5rem;
        }
        .state-date {
          font-size: 0.82rem;
          color: #555;
          margin-bottom: 1rem;
        }
        .state-rules-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          background: #FFFFFF;
          border-radius: 6px;
          overflow: hidden;
        }
        .state-rules-table th {
          background: #0A3D3A;
          color: #FFFFFF;
          padding: 0.6rem 0.75rem;
          text-align: left;
        }
        .state-rules-table td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #EDF2F7;
          vertical-align: top;
        }
        .senior-box {
          background: #FFFFFF;
          border: 1px solid #C0DBD9;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: #2D3748;
          margin-bottom: 0.75rem;
        }
        .state-summary-notes {
          font-size: 0.85rem;
          color: #4A5568;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .sources-head {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0A3D3A;
        }
        .state-link {
          font-size: 0.82rem;
          color: #0A3D3A;
          text-decoration: underline;
        }
        .compare-box {
          background: #FAFAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 1.5rem;
        }
        .compare-intro {
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 1rem;
        }
        .compare-table-wrap {
          overflow-x: auto;
          margin-top: 1rem;
        }
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          background: #FFFFFF;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #E2E8F0;
        }
        .compare-table th {
          background: #0A3D3A;
          color: #FFFFFF;
          padding: 0.6rem 0.75rem;
          text-align: center;
        }
        .compare-table td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #EDF2F7;
          text-align: center;
        }
        .compare-table td:first-child {
          text-align: left;
          font-weight: 600;
        }
        .compare-table tr.highlight td {
          background: #F0F7F6;
        }
        .compare-warning {
          font-size: 0.82rem;
          color: #744210;
          background: #FEFCBF;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-top: 1rem;
          line-height: 1.4;
        }
        .next-steps-section {
          margin-top: 2.5rem;
        }
        .next-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .next-tool-card {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 1rem;
          background: #FFFFFF;
          border: 1.5px solid #C0DBD9;
          border-radius: 10px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }
        .next-tool-card:hover {
          border-color: #0A3D3A;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(10, 61, 58, 0.1);
        }
        .tool-icon {
          font-size: 1.4rem;
        }
        .next-tool-card strong {
          color: #0A3D3A;
          font-size: 0.95rem;
        }
        .next-tool-card span {
          font-size: 0.82rem;
          color: #555;
          line-height: 1.35;
        }

        @media (max-width: 768px) {
          .rtbs-card { padding: 1.25rem; }
          .rtbs-results-wrap { padding: 1.25rem; }
          .rtbs-grid-2, .rtbs-grid-3 { grid-template-columns: 1fr; }
          .summary-grid { grid-template-columns: 1fr 1fr; }
          .rtbs-nav-tab { font-size: 0.85rem; padding: 0.6rem 0.3rem; }
        }
      `}</style>
    </div>
  );
}
