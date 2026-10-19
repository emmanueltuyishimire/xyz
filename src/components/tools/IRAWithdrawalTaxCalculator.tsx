/**
 * IRAWithdrawalTaxCalculator.tsx
 * IRA Withdrawal Tax Calculator 2026 — Seniors Audit
 *
 * Official Tax Sources:
 * - IRS Rev. Proc. 2025-32 (Inflation-adjusted federal tax brackets & standard deductions)
 * - IRS Publication 590-B (Distributions from Individual Retirement Arrangements)
 * - IRS Publication 915 (Social Security and Equivalent Railroad Retirement Benefits)
 * - IRS Form W-4R (Withholding Certificate for Nonperiodic Payments and Eligible Rollover Distributions)
 * - 26 U.S. Code § 72(t) (10% additional tax on early distributions; 25% for SIMPLE IRAs under § 72(t)(6))
 *
 * Last verified: August 2026
 */

import React, { useState, useMemo } from 'react';

// ── TYPES & INTERFACES ────────────────────────────────────────────────────────

type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';
type IRAType = 'traditional' | 'simple' | 'roth' | 'inherited';
type DeductionType = 'standard' | 'itemized';

interface Inputs {
  iraType: IRAType;
  simpleUnder2Years: boolean; // For SIMPLE IRA 25% early penalty
  withdrawalAmount: number;
  age: number;
  hasEarlyException: boolean;
  filingStatus: FilingStatus;
  spouseAge65Plus: boolean;
  wagesIncome: number;
  pensionIncome: number;
  annualSocialSecurity: number;
  otherTaxableIncome: number;
  deductionType: DeductionType;
  customItemizedDeduction: number;
  taxCredits: number;
  w4rWithholdingPct: number;
  mfsLivedApartAllYear?: boolean;
}

interface TaxCalculationStep {
  wages: number;
  pension: number;
  otherTaxable: number;
  iraWithdrawal: number;
  grossSS: number;
  provisionalIncome: number;
  taxableSS: number;
  totalIncome: number;
  standardDeduction: number;
  enhancedSeniorDeduction: number;
  magi: number;
  taxableIncome: number;
  grossTax: number;
  taxCredits: number;
  netTax: number;
  marginalBracket: number;
  isOverCap?: boolean;
}

interface ComparisonRow {
  amount: number;
  label: string;
  additionalTaxableSS: number;
  incrementalTax: number;
  earlyPenalty: number;
  totalTaxImpact: number;
  effectiveRate: number;
  netRemaining: number;
}

import {
  taxableSS as engineTaxableSS,
  seniorDeduction as engineSeniorDeduction,
  calculateTaxableIncome as engineCalculateTaxableIncome,
  federalTax as engineFederalTax,
  HIGH_INCOME_MESSAGE,
} from '../../lib/engine';

// ── CALCULATION HELPERS ────────────────────────────────────────────────────────

function evaluateTaxState(
  iraAmount: number,
  wages: number,
  pension: number,
  otherTaxable: number,
  grossSS: number,
  status: FilingStatus,
  userAge: number,
  spouseAge65: boolean,
  deductionType: DeductionType,
  customItemized: number,
  taxCredits: number,
  livedApartAllYear: boolean = false
): TaxCalculationStep {
  const nonSSIncome = wages + pension + otherTaxable + iraAmount;
  const halfSS = grossSS * 0.5;
  const provisionalIncome = nonSSIncome + halfSS;

  const ssRes = engineTaxableSS({
    ss: grossSS,
    otherAGI: nonSSIncome,
    status,
    livedWithSpouse: !livedApartAllYear,
  });
  const taxableSS = ssRes.taxableSS;
  const totalIncome = nonSSIncome + taxableSS;

  let numAged = 0;
  if (userAge >= 65) numAged++;
  if (status === 'mfj' && spouseAge65) numAged++;

  const incRes = engineCalculateTaxableIncome({
    agi: totalIncome,
    status,
    numAgedBlind: numAged,
    isItemized: deductionType === 'itemized',
    itemizedAmount: Math.max(0, customItemized),
    applySeniorDeduction: true,
    numEligibleSenior: numAged,
  });

  const appliedDeduction = incRes.isItemized ? customItemized : (incRes.standardDeduction + incRes.additionalAgedBlind);
  const enhancedSeniorDed = incRes.seniorDeductionAmount;
  const taxableIncome = incRes.taxableIncome;

  const grossTax = engineFederalTax(taxableIncome, status);
  const isOverCap = grossTax === null;
  const effectiveGrossTax = grossTax ?? 0;
  const netTax = Math.max(0, effectiveGrossTax - Math.max(0, taxCredits));

  return {
    wages,
    pension,
    otherTaxable,
    iraWithdrawal: iraAmount,
    grossSS,
    provisionalIncome,
    taxableSS,
    totalIncome,
    standardDeduction: appliedDeduction,
    enhancedSeniorDeduction: enhancedSeniorDed,
    magi: totalIncome,
    taxableIncome,
    grossTax: effectiveGrossTax,
    taxCredits,
    netTax,
    marginalBracket: 0,
    isOverCap,
  };
}

export default function IRAWithdrawalTaxCalculator() {
  // ── USER INPUT STATE ────────────────────────────────────────────────────────
  const [inputs, setInputs] = useState<Inputs>({
    iraType: 'traditional',
    simpleUnder2Years: false,
    withdrawalAmount: 20000,
    age: 66,
    hasEarlyException: false,
    filingStatus: 'single',
    spouseAge65Plus: false,
    wagesIncome: 0,
    pensionIncome: 12000,
    annualSocialSecurity: 24000,
    otherTaxableIncome: 0,
    deductionType: 'standard',
    customItemizedDeduction: 18000,
    taxCredits: 0,
    w4rWithholdingPct: 10,
    mfsLivedApartAllYear: false,
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'comparison' | 'assumptions'>('calculator');

  // ── HANDLERS ───────────────────────────────────────────────────────────────
  const updateNumber = (field: keyof Inputs, value: string) => {
    const parsed = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setInputs(prev => ({ ...prev, [field]: parsed }));
  };

  const setWithdrawalPreset = (amount: number) => {
    setInputs(prev => ({ ...prev, withdrawalAmount: amount }));
  };

  // ── CALCULATIONS ───────────────────────────────────────────────────────────
  const {
    baseState,
    withState,
    incrementalFederalTax,
    additionalTaxableSS,
    isEarly,
    penaltyRate,
    earlyPenaltyAmount,
    totalTaxImpact,
    effectiveTaxRateOnWithdrawal,
    netAmountRemaining,
    upfrontWithholding,
    immediateCashInHand,
    projectedAprilBalance,
    comparisonTiers,
  } = useMemo(() => {
    const isUnder59Half = inputs.age < 59.5;
    const isEarlyPenaltyApplicable = isUnder59Half && !inputs.hasEarlyException;

    // Penalty rate: 25% for SIMPLE IRA in first 2 years, otherwise 10%
    const penaltyPct = inputs.iraType === 'simple' && inputs.simpleUnder2Years ? 0.25 : 0.10;

    // 1. Base State (WITHOUT IRA Withdrawal)
    const base = evaluateTaxState(
      0,
      inputs.wagesIncome,
      inputs.pensionIncome,
      inputs.otherTaxableIncome,
      inputs.annualSocialSecurity,
      inputs.filingStatus,
      inputs.age,
      inputs.spouseAge65Plus,
      inputs.deductionType,
      inputs.customItemizedDeduction,
      inputs.taxCredits,
      inputs.mfsLivedApartAllYear || false
    );

    // 2. With IRA Withdrawal State
    const withIRA = evaluateTaxState(
      inputs.withdrawalAmount,
      inputs.wagesIncome,
      inputs.pensionIncome,
      inputs.otherTaxableIncome,
      inputs.annualSocialSecurity,
      inputs.filingStatus,
      inputs.age,
      inputs.spouseAge65Plus,
      inputs.deductionType,
      inputs.customItemizedDeduction,
      inputs.taxCredits,
      inputs.mfsLivedApartAllYear || false
    );

    // 3. Incremental Differences
    const incTax = Math.max(0, withIRA.netTax - base.netTax);
    const addSS = Math.max(0, withIRA.taxableSS - base.taxableSS);
    const penalty = isEarlyPenaltyApplicable ? inputs.withdrawalAmount * penaltyPct : 0;
    const totalImpact = incTax + penalty;
    const effRate = inputs.withdrawalAmount > 0 ? (totalImpact / inputs.withdrawalAmount) * 100 : 0;
    const remaining = Math.max(0, inputs.withdrawalAmount - totalImpact);

    // 4. Form W-4R Withholding vs Reality
    const upfrontW4R = (inputs.withdrawalAmount * Math.max(0, inputs.w4rWithholdingPct)) / 100;
    const cashInHand = Math.max(0, inputs.withdrawalAmount - upfrontW4R);
    const aprilBalance = totalImpact - upfrontW4R;

    // 5. Comparison Tiers ($5k, $10k, $20k, $30k, $50k, Custom)
    const presetAmounts = [5000, 10000, 20000, 30000, 50000];
    if (!presetAmounts.includes(inputs.withdrawalAmount) && inputs.withdrawalAmount > 0) {
      presetAmounts.push(inputs.withdrawalAmount);
      presetAmounts.sort((a, b) => a - b);
    }

    const tiers: ComparisonRow[] = presetAmounts.map(amt => {
      const tierWith = evaluateTaxState(
        amt,
        inputs.wagesIncome,
        inputs.pensionIncome,
        inputs.otherTaxableIncome,
        inputs.annualSocialSecurity,
        inputs.filingStatus,
        inputs.age,
        inputs.spouseAge65Plus,
        inputs.deductionType,
        inputs.customItemizedDeduction,
        inputs.taxCredits,
        inputs.mfsLivedApartAllYear || false
      );
      const tierIncTax = Math.max(0, tierWith.netTax - base.netTax);
      const tierAddSS = Math.max(0, tierWith.taxableSS - base.taxableSS);
      const tierPenalty = isEarlyPenaltyApplicable ? amt * penaltyPct : 0;
      const tierTotal = tierIncTax + tierPenalty;
      const tierEff = amt > 0 ? (tierTotal / amt) * 100 : 0;
      const tierRem = Math.max(0, amt - tierTotal);

      return {
        amount: amt,
        label: amt === inputs.withdrawalAmount ? `$${amt.toLocaleString()} (Current)` : `$${amt.toLocaleString()}`,
        additionalTaxableSS: tierAddSS,
        incrementalTax: tierIncTax,
        earlyPenalty: tierPenalty,
        totalTaxImpact: tierTotal,
        effectiveRate: tierEff,
        netRemaining: tierRem,
      };
    });

    return {
      baseState: base,
      withState: withIRA,
      incrementalFederalTax: incTax,
      additionalTaxableSS: addSS,
      isEarly: isUnder59Half,
      penaltyRate: penaltyPct,
      earlyPenaltyAmount: penalty,
      totalTaxImpact: totalImpact,
      effectiveTaxRateOnWithdrawal: effRate,
      netAmountRemaining: remaining,
      upfrontWithholding: upfrontW4R,
      immediateCashInHand: cashInHand,
      projectedAprilBalance: aprilBalance,
      comparisonTiers: tiers,
    };
  }, [inputs]);

  return (
    <div className="iraw-calc-container" id="calculator">
      {/* ── HEADER BADGE ── */}
      <div className="iraw-card-header">
        <div className="iraw-badge-row">
          <span className="iraw-badge-year">2026 IRS Rules</span>
          <span className="iraw-badge-authority">Verified Against IRS Pub 590-B &amp; Rev. Proc. 2025-32</span>
        </div>
        <h2 className="iraw-calc-title">Traditional &amp; SIMPLE IRA Withdrawal Tax Calculator (2026)</h2>
        <p className="iraw-calc-subtitle">
          Calculate your <strong>incremental federal income tax</strong>, effective withdrawal tax rate, potential early-distribution penalty, and net cash remaining.
        </p>
      </div>

      {/* ── ROTH IRA WARNING BANNER ── */}
      {inputs.iraType === 'roth' && (
        <div className="iraw-roth-banner" role="alert">
          <div className="iraw-roth-icon">💡</div>
          <div className="iraw-roth-body">
            <strong>Looking for Roth IRA Withdrawal Rules?</strong>
            <p>
              Qualified distributions from a Roth IRA (held for at least 5 years and taken after age 59½) are <strong>100% federal income tax-free and penalty-free</strong>. This calculator is built for taxable distributions from pre-tax Traditional and SIMPLE IRAs.
            </p>
            <button
              type="button"
              className="iraw-btn-roth-switch"
              onClick={() => setInputs(prev => ({ ...prev, iraType: 'traditional' }))}
            >
              ← Switch to Traditional IRA Calculator
            </button>
          </div>
        </div>
      )}

      {/* ── INHERITED IRA CALLOUT BANNER ── */}
      {inputs.iraType === 'inherited' && (
        <div className="iraw-roth-banner" role="note" style={{ borderColor: '#0A3D3A', background: '#F0F7F6' }}>
          <div className="iraw-roth-icon">📜</div>
          <div className="iraw-roth-body">
            <strong style={{ color: '#0A3D3A' }}>Inherited Traditional IRA Rules (SECURE Act 10-Year Rule)</strong>
            <p>
              Under the SECURE Act, non-spouse beneficiaries must empty an inherited traditional IRA within 10 years. Every distribution is taxed as ordinary income at your marginal bracket rates in the year withdrawn (no 10% early-withdrawal penalty applies to death distributions).
            </p>
          </div>
        </div>
      )}

      {/* ── CALCULATOR MAIN GRID ── */}
      <div className="iraw-main-grid">
        {/* ── LEFT COLUMN: INPUTS ── */}
        <div className="iraw-input-column">
          {/* STEP 1: IRA TYPE & WITHDRAWAL AMOUNT */}
          <div className="iraw-input-section">
            <h3 className="iraw-sec-heading">
              <span className="iraw-sec-num">1</span>
              <span>Account Type &amp; Withdrawal Amount</span>
            </h3>

            <div className="iraw-field-group">
              <label className="iraw-label">Select IRA Account Type</label>
              <div className="iraw-pill-toggle">
                <button
                  type="button"
                  className={`iraw-pill-btn ${inputs.iraType === 'traditional' ? 'active' : ''}`}
                  onClick={() => setInputs(prev => ({ ...prev, iraType: 'traditional' }))}
                >
                  Traditional IRA
                </button>
                <button
                  type="button"
                  className={`iraw-pill-btn ${inputs.iraType === 'simple' ? 'active' : ''}`}
                  onClick={() => setInputs(prev => ({ ...prev, iraType: 'simple' }))}
                >
                  SIMPLE IRA
                </button>
                <button
                  type="button"
                  className={`iraw-pill-btn ${inputs.iraType === 'inherited' ? 'active' : ''}`}
                  onClick={() => setInputs(prev => ({ ...prev, iraType: 'inherited' }))}
                >
                  Inherited IRA
                </button>
                <button
                  type="button"
                  className={`iraw-pill-btn ${inputs.iraType === 'roth' ? 'active' : ''}`}
                  onClick={() => setInputs(prev => ({ ...prev, iraType: 'roth' }))}
                >
                  Roth IRA
                </button>
              </div>
            </div>

            {/* SIMPLE IRA 2-Year Rule Option */}
            {inputs.iraType === 'simple' && (
              <div className="iraw-simple-box">
                <label className="iraw-checkbox-label">
                  <input
                    type="checkbox"
                    checked={inputs.simpleUnder2Years}
                    onChange={e => setInputs(prev => ({ ...prev, simpleUnder2Years: e.target.checked }))}
                  />
                  <span>
                    <strong>Within first 2 years of SIMPLE IRA participation:</strong> Under IRC § 72(t)(6), early withdrawals in the first 2 years trigger a <strong>25% penalty</strong> (instead of 10%).
                  </span>
                </label>
              </div>
            )}

            <div className="iraw-field-group">
              <div className="iraw-label-row">
                <label className="iraw-label" htmlFor="iraw-amount">
                  Planned IRA Withdrawal Amount ($)
                </label>
                <span className="iraw-highlight-amount">${inputs.withdrawalAmount.toLocaleString()}</span>
              </div>
              <div className="iraw-input-prefix-wrap">
                <span className="iraw-prefix">$</span>
                <input
                  id="iraw-amount"
                  type="number"
                  min="0"
                  step="500"
                  className="iraw-input-field"
                  value={inputs.withdrawalAmount || ''}
                  onChange={e => updateNumber('withdrawalAmount', e.target.value)}
                  placeholder="20,000"
                />
              </div>
              {/* Quick preset buttons */}
              <div className="iraw-preset-pills">
                <span>Quick:</span>
                {[5000, 10000, 20000, 35000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`iraw-preset-btn ${inputs.withdrawalAmount === val ? 'selected' : ''}`}
                    onClick={() => setWithdrawalPreset(val)}
                  >
                    ${(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* AGE & FILING STATUS */}
            <div className="iraw-grid-2col">
              <div className="iraw-field-group">
                <label className="iraw-label" htmlFor="iraw-age">
                  Your Age in 2026
                </label>
                <input
                  id="iraw-age"
                  type="number"
                  min="18"
                  max="105"
                  className="iraw-input-field"
                  value={inputs.age || ''}
                  onChange={e => updateNumber('age', e.target.value)}
                />
              </div>
              <div className="iraw-field-group">
                <label className="iraw-label">Tax Filing Status</label>
                <select
                  className="iraw-select-field"
                  value={inputs.filingStatus}
                  onChange={e => setInputs(prev => ({ ...prev, filingStatus: e.target.value as FilingStatus }))}
                >
                  <option value="single">Single</option>
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="mfs">Married Filing Separately</option>
                  <option value="hoh">Head of Household</option>
                  <option value="qss">Qualifying Surviving Spouse</option>
                </select>
              </div>
            </div>

            {/* Early Withdrawal Alert & Exception Checkbox */}
            {isEarly && inputs.iraType !== 'inherited' && (
              <div className="iraw-early-warning">
                <div className="iraw-early-title">
                  <span>⚠️ Under Age 59½ Early Distribution Notice</span>
                </div>
                <p className="iraw-early-text">
                  Distributions before age 59½ trigger an additional <strong>{(penaltyRate * 100).toFixed(0)}% early-distribution tax (IRC § 72(t))</strong> in addition to ordinary income tax.
                </p>
                <label className="iraw-checkbox-label">
                  <input
                    type="checkbox"
                    checked={inputs.hasEarlyException}
                    onChange={e => setInputs(prev => ({ ...prev, hasEarlyException: e.target.checked }))}
                  />
                  <span>I qualify for an IRS early distribution exception (e.g. SEPP/72(t), disability, medical &gt;7.5% AGI, first home up to $10k, or birth/adoption).</span>
                </label>
              </div>
            )}

            {/* Spouse Age 65+ for MFJ */}
            {inputs.filingStatus === 'mfj' && (
              <label className="iraw-checkbox-label" style={{ marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={inputs.spouseAge65Plus}
                  onChange={e => setInputs(prev => ({ ...prev, spouseAge65Plus: e.target.checked }))}
                />
                <span>Spouse is age 65 or older in 2026 (+ $1,650 senior deduction)</span>
              </label>
            )}

            {/* Lived Apart All Year for MFS */}
            {inputs.filingStatus === 'mfs' && (
              <label className="iraw-checkbox-label" style={{ marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={inputs.mfsLivedApartAllYear || false}
                  onChange={e => setInputs(prev => ({ ...prev, mfsLivedApartAllYear: e.target.checked }))}
                />
                <span>Lived apart from spouse for the entire year (allows standard provisional income thresholds $25,000 / $34,000)</span>
              </label>
            )}
          </div>

          {/* STEP 2: OTHER RETIREMENT INCOME */}
          <div className="iraw-input-section">
            <h3 className="iraw-sec-heading">
              <span className="iraw-sec-num">2</span>
              <span>Other Annual Income (2026)</span>
            </h3>
            <p className="iraw-sec-desc">
              Your IRA withdrawal is taxed on top of your other income. Enter other sources to calculate your incremental tax rate:
            </p>

            <div className="iraw-grid-2col">
              <div className="iraw-field-group">
                <label className="iraw-label" htmlFor="iraw-pension">
                  Pension Income ($/yr)
                </label>
                <div className="iraw-input-prefix-wrap">
                  <span className="iraw-prefix">$</span>
                  <input
                    id="iraw-pension"
                    type="number"
                    min="0"
                    step="500"
                    className="iraw-input-field"
                    value={inputs.pensionIncome || ''}
                    onChange={e => updateNumber('pensionIncome', e.target.value)}
                    placeholder="12,000"
                  />
                </div>
              </div>

              <div className="iraw-field-group">
                <label className="iraw-label" htmlFor="iraw-ss">
                  Gross Social Security ($/yr)
                </label>
                <div className="iraw-input-prefix-wrap">
                  <span className="iraw-prefix">$</span>
                  <input
                    id="iraw-ss"
                    type="number"
                    min="0"
                    step="500"
                    className="iraw-input-field"
                    value={inputs.annualSocialSecurity || ''}
                    onChange={e => updateNumber('annualSocialSecurity', e.target.value)}
                    placeholder="24,000"
                  />
                </div>
              </div>

              <div className="iraw-field-group">
                <label className="iraw-label" htmlFor="iraw-wages">
                  Wages / Work Income ($/yr)
                </label>
                <div className="iraw-input-prefix-wrap">
                  <span className="iraw-prefix">$</span>
                  <input
                    id="iraw-wages"
                    type="number"
                    min="0"
                    step="500"
                    className="iraw-input-field"
                    value={inputs.wagesIncome || ''}
                    onChange={e => updateNumber('wagesIncome', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="iraw-field-group">
                <label className="iraw-label" htmlFor="iraw-other">
                  Interest, Divs, 401(k) ($/yr)
                </label>
                <div className="iraw-input-prefix-wrap">
                  <span className="iraw-prefix">$</span>
                  <input
                    id="iraw-other"
                    type="number"
                    min="0"
                    step="500"
                    className="iraw-input-field"
                    value={inputs.otherTaxableIncome || ''}
                    onChange={e => updateNumber('otherTaxableIncome', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: DEDUCTIONS & WITHHOLDING */}
          <div className="iraw-input-section">
            <h3 className="iraw-sec-heading">
              <span className="iraw-sec-num">3</span>
              <span>Deductions &amp; Form W-4R Withholding</span>
            </h3>

            <div className="iraw-grid-2col">
              <div className="iraw-field-group">
                <label className="iraw-label">Deduction Method</label>
                <select
                  className="iraw-select-field"
                  value={inputs.deductionType}
                  onChange={e => setInputs(prev => ({ ...prev, deductionType: e.target.value as DeductionType }))}
                >
                  <option value="standard">Standard Deduction (Recommended)</option>
                  <option value="itemized">Itemized Deductions</option>
                </select>
              </div>

              {inputs.deductionType === 'itemized' && (
                <div className="iraw-field-group">
                  <label className="iraw-label" htmlFor="iraw-itemized">
                    Total Itemized Deductions ($)
                  </label>
                  <div className="iraw-input-prefix-wrap">
                    <span className="iraw-prefix">$</span>
                    <input
                      id="iraw-itemized"
                      type="number"
                      min="0"
                      className="iraw-input-field"
                      value={inputs.customItemizedDeduction || ''}
                      onChange={e => updateNumber('customItemizedDeduction', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="iraw-field-group">
                <label className="iraw-label" htmlFor="iraw-w4r">
                  Form W-4R Withholding (%)
                </label>
                <select
                  id="iraw-w4r"
                  className="iraw-select-field"
                  value={inputs.w4rWithholdingPct}
                  onChange={e => setInputs(prev => ({ ...prev, w4rWithholdingPct: parseFloat(e.target.value) || 0 }))}
                >
                  <option value="0">0% (Opt-out)</option>
                  <option value="10">10% (IRS Default Rate)</option>
                  <option value="12">12% (Common Bracket Rate)</option>
                  <option value="15">15% (Moderate Withholding)</option>
                  <option value="20">20% (Conservative Withholding)</option>
                  <option value="22">22% (Higher Bracket Rate)</option>
                  <option value="24">24%</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: RESULTS & SUMMARY ── */}
        <div className="iraw-results-column" aria-live="polite">
          {/* User Input Echo Box */}
          <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '0.85rem 1.15rem', marginBottom: '1.25rem', fontSize: '0.95rem', color: '#0D2137' }}>
            <strong>Your Inputs:</strong> Planned IRA Withdrawal: ${inputs.withdrawalAmount.toLocaleString()} · Age: {inputs.age} · Filing Status: {inputs.filingStatus === 'mfj' ? 'Married Filing Jointly' : inputs.filingStatus === 'mfs' ? 'Married Filing Separately' : inputs.filingStatus === 'hoh' ? 'Head of Household' : inputs.filingStatus === 'qss' ? 'Qualifying Surviving Spouse' : 'Single'} · Pension: ${inputs.pensionIncome.toLocaleString()} · Social Security: ${inputs.annualSocialSecurity.toLocaleString()} · Other Income: ${(inputs.wagesIncome + inputs.otherTaxableIncome).toLocaleString()}
          </div>

          {/* PRIMARY RESULTS CARD */}
          <div className="iraw-result-card">
            <div className="iraw-res-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="iraw-res-kicker">2026 ESTIMATED TAX IMPACT</span>
                <span style={{ fontSize: '0.875rem', color: '#0A3D3A', fontWeight: 700 }}>Data as of Oct 2026</span>
              </div>
              <h3 className="iraw-res-main-title">
                Withdrawal of ${inputs.withdrawalAmount.toLocaleString()}
              </h3>
            </div>

            {withState.isOverCap && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '0.5rem', padding: '0.85rem 1rem', color: '#991b1b', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>
                ⚠️ {HIGH_INCOME_MESSAGE}
              </div>
            )}

            {/* NET REMAINING HERO BOX */}
            <div className="iraw-net-hero">
              <span className="iraw-net-label">Estimated Amount Remaining (After All Taxes)</span>
              <span className="iraw-net-number">{withState.isOverCap ? 'See IRS table' : `$${Math.round(netAmountRemaining).toLocaleString()}`}</span>
              <span className="iraw-net-sub">
                Effective Tax Impact Rate: <strong>{withState.isOverCap ? 'See IRS table' : `${effectiveTaxRateOnWithdrawal.toFixed(1)}%`}</strong>
              </span>
            </div>

            {/* TAX BREAKDOWN METRICS */}
            <div className="iraw-metric-grid">
              <div className="iraw-metric-box">
                <span className="iraw-metric-title">Incremental Federal Tax</span>
                <span className="iraw-metric-val">{withState.isOverCap ? 'See IRS table' : `$${Math.round(incrementalFederalTax).toLocaleString()}`}</span>
                <span className="iraw-metric-note">Ordinary income tax caused by withdrawal</span>
              </div>

              {isEarly && inputs.iraType !== 'inherited' && (
                <div className={`iraw-metric-box ${earlyPenaltyAmount > 0 ? 'penalty-active' : ''}`}>
                  <span className="iraw-metric-title">Early Distribution Tax ({(penaltyRate * 100).toFixed(0)}%)</span>
                  <span className="iraw-metric-val">
                    {earlyPenaltyAmount > 0 ? `$${Math.round(earlyPenaltyAmount).toLocaleString()}` : '$0 (Exception applied)'}
                  </span>
                  <span className="iraw-metric-note">IRC § 72(t) under age 59½</span>
                </div>
              )}

              <div className="iraw-metric-box total-tax">
                <span className="iraw-metric-title">Total Federal Tax Impact</span>
                <span className="iraw-metric-val bold-teal">{withState.isOverCap ? 'See IRS table' : `$${Math.round(totalTaxImpact).toLocaleString()}`}</span>
                <span className="iraw-metric-note">Incremental Income Tax + Penalty</span>
              </div>

              <div className="iraw-metric-box">
                <span className="iraw-metric-title">Marginal Tax Bracket</span>
                <span className="iraw-metric-val">
                  {(baseState.marginalBracket * 100).toFixed(0)}% → {(withState.marginalBracket * 100).toFixed(0)}%
                </span>
                <span className="iraw-metric-note">
                  {baseState.marginalBracket === withState.marginalBracket
                    ? 'Stays in same bracket'
                    : 'Pushed into higher bracket'}
                </span>
              </div>
            </div>

            {/* SOCIAL SECURITY TAX TORPEDO ALERT */}
            {additionalTaxableSS > 0 && (
              <div className="iraw-torpedo-callout">
                <span className="iraw-torpedo-icon">⚡</span>
                <div className="iraw-torpedo-content">
                  <strong>Social Security Interaction (Tax Torpedo):</strong>
                  <p>
                    This ${inputs.withdrawalAmount.toLocaleString()} withdrawal causes an additional <strong>${Math.round(additionalTaxableSS).toLocaleString()}</strong> of your Social Security benefits to become taxable under IRS Publication 915 rules.
                  </p>
                </div>
              </div>
            )}

            {/* BEFORE VS. AFTER TAX WALKTHROUGH */}
            <div className="iraw-tax-walkthrough">
              <h4>Incremental Tax Breakdown (Before vs. After Withdrawal)</h4>
              <table className="iraw-mini-table">
                <tbody>
                  <tr>
                    <td>Total Income Before Withdrawal:</td>
                    <td className="text-right">${Math.round(baseState.totalIncome).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Total Income After Withdrawal (MAGI):</td>
                    <td className="text-right">${Math.round(withState.totalIncome).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>2026 standard deduction (+ additional age 65+):</td>
                    <td className="text-right">(${Math.round(withState.standardDeduction).toLocaleString()})</td>
                  </tr>
                  <tr>
                    <td>Senior deduction (2025–2028): reduced by 6% of MAGI over $75,000 ($150,000 joint):</td>
                    <td className="text-right">(${Math.round(withState.enhancedSeniorDeduction).toLocaleString()})</td>
                  </tr>
                  <tr>
                    <td>Taxable Income (With Withdrawal):</td>
                    <td className="text-right">${Math.round(withState.taxableIncome).toLocaleString()}</td>
                  </tr>
                  <tr className="iraw-divider-row">
                    <td>Est. Federal Tax <em>Without</em> Withdrawal:</td>
                    <td className="text-right">${Math.round(baseState.netTax).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Est. Federal Tax <em>With</em> Withdrawal:</td>
                    <td className="text-right">${Math.round(withState.netTax).toLocaleString()}</td>
                  </tr>
                  <tr className="iraw-highlight-row">
                    <td><strong>Additional Tax Caused by Withdrawal:</strong></td>
                    <td className="text-right"><strong>+${Math.round(incrementalFederalTax).toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* WHAT THIS MEANS (PLAIN ENGLISH) */}
            <div className="iraw-explainer-box">
              <h4>What This Means for You:</h4>
              <p>
                If you withdraw <strong>${inputs.withdrawalAmount.toLocaleString()}</strong> from your traditional IRA in 2026, it increases your estimated federal income tax bill by <strong>${Math.round(incrementalFederalTax).toLocaleString()}</strong>{earlyPenaltyAmount > 0 ? ` plus a $${Math.round(earlyPenaltyAmount).toLocaleString()} early-withdrawal penalty` : ''}.
              </p>
              <p style={{ marginBottom: 0 }}>
                After accounting for all federal taxes, you will have approximately <strong>${Math.round(netAmountRemaining).toLocaleString()}</strong> available for your living expenses.
              </p>
            </div>

            {/* UPFRONT WITHHOLDING VS FINAL TAX REALITY */}
            <div className="iraw-withholding-box">
              <div className="iraw-w4r-header">
                <strong>Form W-4R Custodian Withholding Reality Check</strong>
              </div>
              <div className="iraw-w4r-stats">
                <div className="iraw-stat-item">
                  <span>Upfront {inputs.w4rWithholdingPct}% Withheld:</span>
                  <strong>${Math.round(upfrontWithholding).toLocaleString()}</strong>
                </div>
                <div className="iraw-stat-item">
                  <span>Immediate Cash Received:</span>
                  <strong>${Math.round(immediateCashInHand).toLocaleString()}</strong>
                </div>
                <div className="iraw-stat-item">
                  <span>Projected April Tax Balance:</span>
                  <strong className={projectedAprilBalance > 0 ? 'text-red' : 'text-green'}>
                    {projectedAprilBalance > 0
                      ? `+$${Math.round(projectedAprilBalance).toLocaleString()} (Owed in April)`
                      : projectedAprilBalance < 0
                      ? `-$${Math.round(Math.abs(projectedAprilBalance)).toLocaleString()} (Refund)`
                      : '$0 (Exact Match)'}
                  </strong>
                </div>
              </div>
              <p className="iraw-w4r-note">
                <strong>Note:</strong> Withholding by your IRA custodian is simply an advance prepayment. If your 10% default withholding (${Math.round(upfrontWithholding).toLocaleString()}) is less than your actual tax impact (${Math.round(totalTaxImpact).toLocaleString()}), you will owe the remaining ${Math.round(Math.max(0, projectedAprilBalance)).toLocaleString()} when filing your Form 1040.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABBED EXPANSION: COMPARISON TABLE & ASSUMPTIONS ── */}
      <div className="iraw-tabs-section">
        <div className="iraw-tab-buttons">
          <button
            type="button"
            className={`iraw-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            📊 Withdrawal Comparison Matrix ($5k – $50k)
          </button>
          <button
            type="button"
            className={`iraw-tab-btn ${activeTab === 'assumptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('assumptions')}
          >
            ⚙️ 2026 Tax Assumptions &amp; Rules
          </button>
        </div>

        {/* TAB 1: DYNAMIC WITHDRAWAL COMPARISON */}
        {activeTab === 'calculator' && (
          <div className="iraw-tab-panel">
            <h3 className="iraw-panel-title">How Different IRA Withdrawal Amounts Change Your Tax Bill</h3>
            <p className="iraw-panel-desc">
              Compare how taking smaller vs. larger distributions in 2026 changes your tax bracket, Social Security taxability, and after-tax cash:
            </p>
            <div className="iraw-table-wrap">
              <table className="iraw-comparison-table">
                <thead>
                  <tr>
                    <th>IRA Withdrawal</th>
                    <th>Extra Taxable SS</th>
                    <th>Incremental Fed Tax</th>
                    {isEarly && inputs.iraType !== 'inherited' && <th>{(penaltyRate * 100).toFixed(0)}% Penalty</th>}
                    <th>Total Tax Impact</th>
                    <th>Effective Rate</th>
                    <th>Net Cash Left</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTiers.map((tier, idx) => (
                    <tr
                      key={idx}
                      className={tier.amount === inputs.withdrawalAmount ? 'iraw-row-active' : ''}
                    >
                      <td><strong>{tier.label}</strong></td>
                      <td>{tier.additionalTaxableSS > 0 ? `+$${Math.round(tier.additionalTaxableSS).toLocaleString()}` : '$0'}</td>
                      <td>${Math.round(tier.incrementalTax).toLocaleString()}</td>
                      {isEarly && inputs.iraType !== 'inherited' && <td>{tier.earlyPenalty > 0 ? `$${Math.round(tier.earlyPenalty).toLocaleString()}` : '$0'}</td>}
                      <td className="iraw-bold-teal">${Math.round(tier.totalTaxImpact).toLocaleString()}</td>
                      <td><strong>{tier.effectiveRate.toFixed(1)}%</strong></td>
                      <td className="iraw-bold-green">${Math.round(tier.netRemaining).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="iraw-table-note">
              * Table values dynamically calculated based on your filing status ({inputs.filingStatus.toUpperCase()}), age ({inputs.age}), and other retirement income (${(inputs.pensionIncome + inputs.wagesIncome + inputs.otherTaxableIncome).toLocaleString()}/yr).
            </p>
          </div>
        )}

        {/* TAB 2: ASSUMPTIONS PANEL */}
        {activeTab === 'assumptions' && (
          <div className="iraw-tab-panel">
            <h3 className="iraw-panel-title">2026 Federal Tax Rules &amp; Formulas Used</h3>
            <div className="iraw-assump-grid">
              <div className="iraw-assump-card">
                <strong>Standard Deduction (2026)</strong>
                <p>
                  Base deduction: <strong>${TAX_2026.standardDeductions[inputs.filingStatus].toLocaleString()}</strong>.
                  {inputs.age >= 65 && ` + $${TAX_2026.seniorAddOn[inputs.filingStatus].toLocaleString()} senior add-on.`}
                  {inputs.filingStatus === 'mfj' && inputs.spouseAge65Plus && ` + $${TAX_2026.seniorAddOn.mfj.toLocaleString()} spouse senior add-on.`}
                  <br />
                  2026 standard deduction (+ additional age 65+): <strong>(${Math.round(withState.standardDeduction).toLocaleString()})</strong>.
                </p>
              </div>

              <div className="iraw-assump-card">
                <strong>Senior Deduction (2025–2028 per IRS Pub. 6142 / Sched. 1-A)</strong>
                <p>
                  Senior deduction (2025–2028): reduced by 6% of MAGI over $75,000 ($150,000 joint). Up to $6,000 per person age 65+ ($12,000 married filing jointly). Fully phased out at $175,000 (single) or $250,000 (joint). MFS filers are ineligible.
                  <br />
                  Senior deduction applied: <strong>(${Math.round(withState.enhancedSeniorDeduction).toLocaleString()})</strong>.
                </p>
              </div>

              <div className="iraw-assump-card">
                <strong>Social Security Taxability</strong>
                <p>
                  Evaluated using official IRS Publication 915 provisional income thresholds ($25k/$34k single, $32k/$44k joint).
                </p>
              </div>

              <div className="iraw-assump-card">
                <strong>2026 Tax Brackets</strong>
                <p>
                  Full 7-tier tax brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%) per IRS Revenue Procedure 2025-32.
                </p>
              </div>

              <div className="iraw-assump-card">
                <strong>Early Distribution Rules (IRC § 72(t))</strong>
                <p>
                  10% additional tax applies if age is under 59½ (25% for SIMPLE IRAs in the first 2 years) unless a statutory exception (SEPP, disability, medical) is claimed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .iraw-calc-container {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          font-family: inherit;
        }
        .iraw-card-header {
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .iraw-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .iraw-badge-year {
          background: #0A3D3A;
          color: #FFFFFF;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .iraw-badge-authority {
          background: #F0F7F6;
          color: #0A3D3A;
          border: 1px solid #C0DBD9;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }
        .iraw-calc-title {
          font-size: clamp(1.4rem, 2.5vw, 1.8rem);
          font-weight: 800;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
        }
        .iraw-calc-subtitle {
          font-size: 1rem;
          color: #4A5568;
          margin: 0;
          line-height: 1.5;
        }
        .iraw-roth-banner {
          display: flex;
          gap: 1rem;
          background: #FFFBF0;
          border: 1.5px solid #C9933A;
          border-radius: 8px;
          padding: 1.1rem 1.25rem;
          margin-bottom: 1.5rem;
        }
        .iraw-roth-icon {
          font-size: 1.8rem;
          flex-shrink: 0;
        }
        .iraw-roth-body strong {
          display: block;
          font-size: 1.05rem;
          color: #8C6510;
          margin-bottom: 0.25rem;
        }
        .iraw-roth-body p {
          font-size: 0.92rem;
          color: #4A5568;
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        .iraw-btn-roth-switch {
          background: #0A3D3A;
          color: #FFFFFF;
          border: none;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 0.4rem 0.85rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .iraw-simple-box {
          background: #FFFBF0;
          border: 1px solid #C9933A;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 0.85rem;
        }
        .iraw-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
        @media (min-width: 900px) {
          .iraw-main-grid {
            grid-template-columns: 1.1fr 1fr;
          }
        }
        .iraw-input-column {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .iraw-input-section {
          background: #F8FBFB;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          padding: 1.2rem 1.25rem;
        }
        .iraw-sec-heading {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.1rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0 0 0.85rem 0;
        }
        .iraw-sec-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0A3D3A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .iraw-sec-desc {
          font-size: 0.88rem;
          color: #4A5568;
          margin: -0.35rem 0 0.85rem 0;
          line-height: 1.45;
        }
        .iraw-field-group {
          margin-bottom: 0.85rem;
        }
        .iraw-field-group:last-child {
          margin-bottom: 0;
        }
        .iraw-label-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.35rem;
        }
        .iraw-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 700;
          color: #2D3748;
          margin-bottom: 0.35rem;
        }
        .iraw-highlight-amount {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0A3D3A;
        }
        .iraw-input-prefix-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .iraw-prefix {
          position: absolute;
          left: 0.85rem;
          font-size: 1rem;
          font-weight: 700;
          color: #718096;
          pointer-events: none;
        }
        .iraw-input-field {
          width: 100%;
          padding: 0.65rem 0.85rem 0.65rem 1.85rem;
          font-size: 1rem;
          font-weight: 700;
          color: #1A202C;
          border: 1.5px solid #CBD5E0;
          border-radius: 6px;
          background: #FFFFFF;
          transition: border-color 0.2s;
        }
        .iraw-input-field:focus,
        .iraw-select-field:focus {
          outline: none;
          border-color: #0A3D3A;
          box-shadow: 0 0 0 3px rgba(10,61,58,0.15);
        }
        .iraw-select-field {
          width: 100%;
          padding: 0.65rem 0.85rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1A202C;
          border: 1.5px solid #CBD5E0;
          border-radius: 6px;
          background: #FFFFFF;
        }
        .iraw-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .iraw-pill-toggle {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.25rem;
          flex-wrap: wrap;
        }
        .iraw-pill-btn {
          flex: 1;
          min-width: 90px;
          padding: 0.45rem 0.6rem;
          font-size: 0.82rem;
          font-weight: 700;
          border: 1.5px solid #CBD5E0;
          border-radius: 6px;
          background: #FFFFFF;
          color: #4A5568;
          cursor: pointer;
          transition: all 0.2s;
        }
        .iraw-pill-btn.active {
          background: #0A3D3A;
          color: #FFFFFF;
          border-color: #0A3D3A;
        }
        .iraw-preset-pills {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.45rem;
          flex-wrap: wrap;
        }
        .iraw-preset-pills span {
          font-size: 0.8rem;
          font-weight: 600;
          color: #718096;
        }
        .iraw-preset-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E0;
          padding: 0.2rem 0.55rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0A3D3A;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .iraw-preset-btn:hover,
        .iraw-preset-btn.selected {
          background: #0A3D3A;
          color: #FFFFFF;
          border-color: #0A3D3A;
        }
        .iraw-early-warning {
          background: #FFF5F5;
          border: 1.5px solid #FEB2B2;
          border-radius: 6px;
          padding: 0.85rem;
          margin-top: 0.65rem;
        }
        .iraw-early-title {
          font-size: 0.9rem;
          font-weight: 800;
          color: #C53030;
          margin-bottom: 0.25rem;
        }
        .iraw-early-text {
          font-size: 0.85rem;
          color: #742A2A;
          margin: 0 0 0.5rem 0;
          line-height: 1.45;
        }
        .iraw-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #2D3748;
          cursor: pointer;
          line-height: 1.4;
        }
        .iraw-checkbox-label input {
          margin-top: 0.15rem;
          cursor: pointer;
        }
        /* Results */
        .iraw-results-column {
          display: flex;
          flex-direction: column;
        }
        .iraw-result-card {
          background: #FFFFFF;
          border: 2px solid #0A3D3A;
          border-radius: 10px;
          padding: 1.4rem;
          box-shadow: 0 4px 14px rgba(10,61,58,0.08);
        }
        .iraw-res-header {
          border-bottom: 1.5px solid #E2E8F0;
          padding-bottom: 0.85rem;
          margin-bottom: 1.1rem;
        }
        .iraw-res-kicker {
          display: block;
          font-size: 0.78rem;
          font-weight: 800;
          color: #C9933A;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .iraw-res-main-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0.2rem 0 0 0;
        }
        .iraw-net-hero {
          background: #0A3D3A;
          color: #FFFFFF;
          border-radius: 8px;
          padding: 1.25rem;
          text-align: center;
          margin-bottom: 1.25rem;
        }
        .iraw-net-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          margin-bottom: 0.25rem;
        }
        .iraw-net-number {
          display: block;
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          font-weight: 900;
          color: #FFFFFF;
          line-height: 1.1;
        }
        .iraw-net-sub {
          display: block;
          font-size: 0.88rem;
          color: #C9933A;
          margin-top: 0.35rem;
        }
        .iraw-metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
          margin-bottom: 1.1rem;
        }
        .iraw-metric-box {
          background: #F8FBFB;
          border: 1px solid #C0DBD9;
          border-radius: 6px;
          padding: 0.75rem 0.85rem;
        }
        .iraw-metric-box.penalty-active {
          background: #FFF5F5;
          border-color: #FEB2B2;
        }
        .iraw-metric-box.total-tax {
          background: #F0F7F6;
          border: 1.5px solid #0A3D3A;
        }
        .iraw-metric-title {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #4A5568;
          margin-bottom: 0.15rem;
        }
        .iraw-metric-val {
          display: block;
          font-size: 1.15rem;
          font-weight: 800;
          color: #1A202C;
        }
        .iraw-metric-val.bold-teal {
          color: #0A3D3A;
        }
        .iraw-metric-note {
          display: block;
          font-size: 0.75rem;
          color: #718096;
          margin-top: 0.15rem;
          line-height: 1.25;
        }
        .iraw-torpedo-callout {
          display: flex;
          gap: 0.65rem;
          background: #FFFBF0;
          border: 1px solid #C9933A;
          border-radius: 6px;
          padding: 0.75rem 0.9rem;
          margin-bottom: 1.1rem;
        }
        .iraw-torpedo-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .iraw-torpedo-content strong {
          display: block;
          font-size: 0.88rem;
          color: #8C6510;
          margin-bottom: 0.15rem;
        }
        .iraw-torpedo-content p {
          font-size: 0.82rem;
          color: #4A5568;
          margin: 0;
          line-height: 1.4;
        }
        .iraw-tax-walkthrough {
          background: #FAFAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 0.85rem;
          margin-bottom: 1.1rem;
        }
        .iraw-tax-walkthrough h4 {
          font-size: 0.88rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
        }
        .iraw-mini-table {
          width: 100%;
          font-size: 0.82rem;
          border-collapse: collapse;
        }
        .iraw-mini-table td {
          padding: 0.25rem 0.35rem;
        }
        .iraw-mini-table .text-right {
          text-align: right;
          font-weight: 700;
        }
        .iraw-divider-row td {
          border-top: 1px dashed #CBD5E0;
          padding-top: 0.4rem;
        }
        .iraw-highlight-row td {
          background: #F0F7F6;
          color: #0A3D3A;
          font-weight: 800;
          border-top: 1.5px solid #0A3D3A;
          padding-top: 0.35rem;
        }
        .iraw-explainer-box {
          background: #F8FBFB;
          border-left: 3.5px solid #0A3D3A;
          border-radius: 0 6px 6px 0;
          padding: 0.85rem 1rem;
          margin-bottom: 1.1rem;
        }
        .iraw-explainer-box h4 {
          font-size: 0.88rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0 0 0.35rem 0;
        }
        .iraw-explainer-box p {
          font-size: 0.84rem;
          color: #4A5568;
          line-height: 1.45;
          margin-bottom: 0.35rem;
        }
        .iraw-withholding-box {
          background: #FFFFFF;
          border: 1px solid #CBD5E0;
          border-radius: 6px;
          padding: 0.85rem;
        }
        .iraw-w4r-header {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0A3D3A;
          margin-bottom: 0.5rem;
        }
        .iraw-w4r-stats {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.84rem;
        }
        .iraw-stat-item {
          display: flex;
          justify-content: space-between;
        }
        .iraw-stat-item .text-red { color: #C53030; }
        .iraw-stat-item .text-green { color: #2E7D32; }
        .iraw-w4r-note {
          font-size: 0.78rem;
          color: #718096;
          margin: 0.5rem 0 0 0;
          line-height: 1.35;
          border-top: 1px solid #E2E8F0;
          padding-top: 0.4rem;
        }
        /* Tabs */
        .iraw-tabs-section {
          margin-top: 1.75rem;
          border-top: 2px solid #E2E8F0;
          padding-top: 1.5rem;
        }
        .iraw-tab-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .iraw-tab-btn {
          background: #F8FBFB;
          border: 1px solid #C0DBD9;
          color: #0A3D3A;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.55rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .iraw-tab-btn.active {
          background: #0A3D3A;
          color: #FFFFFF;
          border-color: #0A3D3A;
        }
        .iraw-tab-panel {
          background: #FFFFFF;
          border: 1px solid #CBD5E0;
          border-radius: 8px;
          padding: 1.25rem;
        }
        .iraw-panel-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0 0 0.35rem 0;
        }
        .iraw-panel-desc {
          font-size: 0.9rem;
          color: #4A5568;
          margin: 0 0 1rem 0;
          line-height: 1.45;
        }
        .iraw-table-wrap {
          overflow-x: auto;
        }
        .iraw-comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }
        .iraw-comparison-table th {
          background: #0A3D3A;
          color: #FFFFFF;
          padding: 0.6rem 0.75rem;
          font-weight: 700;
        }
        .iraw-comparison-table td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #E2E8F0;
        }
        .iraw-row-active td {
          background: #F0F7F6;
          font-weight: 700;
          border-left: 3px solid #0A3D3A;
        }
        .iraw-bold-teal {
          color: #0A3D3A;
          font-weight: 800;
        }
        .iraw-bold-green {
          color: #2E7D32;
          font-weight: 800;
        }
        .iraw-table-note {
          font-size: 0.8rem;
          color: #718096;
          margin: 0.75rem 0 0 0;
          font-style: italic;
        }
        .iraw-assump-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .iraw-assump-card {
          background: #F8FBFB;
          border: 1px solid #C0DBD9;
          border-radius: 6px;
          padding: 1rem;
        }
        .iraw-assump-card strong {
          display: block;
          font-size: 0.92rem;
          color: #0A3D3A;
          margin-bottom: 0.35rem;
        }
        .iraw-assump-card p {
          font-size: 0.85rem;
          color: #4A5568;
          margin: 0;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
