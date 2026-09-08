import React, { useState } from 'react';

/**
 * RetirementTaxWithholdingCalculator.tsx
 * IRS Tax Withholding Calculator for Retirees 2026
 *
 * Purpose: A 4-step withholding DECISION tool — not just a tax calculator.
 * Estimates federal tax, compares to current withholding, identifies the gap,
 * and proposes actionable withholding strategies by income source.
 *
 * Sources:
 *   IRS Rev. Proc. 2025-28 (2026 brackets & deductions)
 *   IRS Publication 505 (withholding & estimated tax)
 *   IRS Publication 915 (Social Security taxability)
 *   IRS Forms W-4V, W-4P, W-4R
 */

// ─── TAX RULES 2026 (Official IRS Inflation Adjustments IR-2025-103) ────────

const TAX_RULES = {
  2026: {
    brackets: {
      single: [
        { min: 0,       max: 12400,   rate: 0.10 },
        { min: 12400,   max: 50400,   rate: 0.12 },
        { min: 50400,   max: 105700,  rate: 0.22 },
        { min: 105700,  max: 201775,  rate: 0.24 },
        { min: 201775,  max: 256225,  rate: 0.32 },
        { min: 256225,  max: 640600,  rate: 0.35 },
        { min: 640600,  max: Infinity, rate: 0.37 },
      ],
      joint: [
        { min: 0,       max: 24800,   rate: 0.10 },
        { min: 24800,   max: 100800,  rate: 0.12 },
        { min: 100800,  max: 211400,  rate: 0.22 },
        { min: 211400,  max: 403550,  rate: 0.24 },
        { min: 403550,  max: 512450,  rate: 0.32 },
        { min: 512450,  max: 768700,  rate: 0.35 },
        { min: 768700,  max: Infinity, rate: 0.37 },
      ],
      mfs: [
        { min: 0,       max: 12400,   rate: 0.10 },
        { min: 12400,   max: 50400,   rate: 0.12 },
        { min: 50400,   max: 105700,  rate: 0.22 },
        { min: 105700,  max: 201775,  rate: 0.24 },
        { min: 201775,  max: 256225,  rate: 0.32 },
        { min: 256225,  max: 640600,  rate: 0.35 },
        { min: 640600,  max: Infinity, rate: 0.37 },
      ],
      hoh: [
        { min: 0,       max: 17700,   rate: 0.10 },
        { min: 17700,   max: 67450,   rate: 0.12 },
        { min: 67450,   max: 105700,  rate: 0.22 },
        { min: 105700,  max: 201750,  rate: 0.24 },
        { min: 201750,  max: 256200,  rate: 0.32 },
        { min: 256200,  max: 640600,  rate: 0.35 },
        { min: 640600,  max: Infinity, rate: 0.37 },
      ],
      qss: [
        { min: 0,       max: 24800,   rate: 0.10 },
        { min: 24800,   max: 100800,  rate: 0.12 },
        { min: 100800,  max: 211400,  rate: 0.22 },
        { min: 211400,  max: 403550,  rate: 0.24 },
        { min: 403550,  max: 512450,  rate: 0.32 },
        { min: 512450,  max: 768700,  rate: 0.35 },
        { min: 768700,  max: Infinity, rate: 0.37 },
      ],
    },
    standardDeduction: {
      single: 16100,
      joint:  32200,
      mfs:    16100,
      hoh:    24150,
      qss:    32200,
    },
    // Additional deduction for age 65+ (per-person under IRS Pub 554)
    seniorAddOn: {
      single: 2050,   // +$2,050 if age 65+
      joint:  1650,   // +$1,650 per qualifying spouse 65+
      mfs:    1650,
      hoh:    2050,
      qss:    1650,
    },
    // IRS Pub 915 — Social Security combined income thresholds
    ss: {
      singleThreshold50:  25000,   // above this, up to 50% of SS is taxable
      singleThreshold85:  34000,   // above this, up to 85% of SS is taxable
      jointThreshold50:   32000,
      jointThreshold85:   44000,
      mfsThreshold85:     0,       // MFS: generally 85% immediately
    },
  },
};

type FilingStatus = 'single' | 'joint' | 'mfs' | 'hoh' | 'qss';
type BracketSet = { min: number; max: number; rate: number }[];

// ─── CALCULATION ENGINE ──────────────────────────────────────────────────────

function n(val: number | ''): number {
  return val === '' ? 0 : Number(val);
}

function calculateStandardDeduction(
  filingStatus: FilingStatus,
  age: number,
  spouseAge: number,
  year: 2026
): number {
  const rules = TAX_RULES[year];
  let deduction = rules.standardDeduction[filingStatus];
  const addOn = rules.seniorAddOn[filingStatus];
  if (filingStatus === 'joint' || filingStatus === 'qss') {
    if (age >= 65) deduction += addOn;
    if (filingStatus === 'joint' && spouseAge >= 65) deduction += addOn;
  } else {
    if (age >= 65) deduction += addOn;
  }
  return deduction;
}

function calculateTaxableSocialSecurity(
  ssBenefits: number,
  otherIncome: number,
  filingStatus: FilingStatus,
  year: 2026
): number {
  if (ssBenefits <= 0) return 0;
  const rules = TAX_RULES[year].ss;

  // MFS: almost always 85% taxable (IRS Pub 915 rule)
  if (filingStatus === 'mfs') {
    return Math.min(ssBenefits, ssBenefits * 0.85);
  }

  // Combined income = other income + 50% of SS (IRS Pub 915)
  const combinedIncome = otherIncome + ssBenefits * 0.5;

  const threshold50 = filingStatus === 'joint' ? rules.jointThreshold50 : rules.singleThreshold50;
  const threshold85 = filingStatus === 'joint' ? rules.jointThreshold85 : rules.singleThreshold85;

  if (combinedIncome <= threshold50) return 0;

  if (combinedIncome <= threshold85) {
    // Up to 50% of SS benefits taxable
    const excess = combinedIncome - threshold50;
    return Math.min(ssBenefits * 0.50, excess * 0.50);
  }

  // Above 85% threshold
  const excessOver85 = combinedIncome - threshold85;
  const taxableAmount = Math.min(
    ssBenefits * 0.85,
    (threshold85 - threshold50) * 0.50 + excessOver85 * 0.85
  );
  return Math.min(taxableAmount, ssBenefits * 0.85);
}

function calculateFederalTax(taxableIncome: number, brackets: BracketSet): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let remaining = taxableIncome;
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bandWidth = bracket.max - bracket.min;
    const taxableInBand = Math.min(remaining, bandWidth);
    tax += taxableInBand * bracket.rate;
    remaining -= taxableInBand;
  }
  return Math.max(0, tax);
}

function getMarginalRate(taxableIncome: number, brackets: BracketSet): number {
  let rate = brackets[0]?.rate ?? 0.10;
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) rate = bracket.rate;
  }
  return rate;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface IncomeInputs {
  socialSecurity: number | '';
  pension: number | '';
  ira: number | '';
  retirement401k: number | '';
  rmd: number | '';
  wages: number | '';
  interest: number | '';
  dividends: number | '';
  capitalGains: number | '';
  other: number | '';
}

interface WithholdingInputs {
  socialSecurity: number | '';
  pension: number | '';
  ira: number | '';
  retirement401k: number | '';
  other: number | '';
  unknownWithholding: boolean;
}

interface DeductionInputs {
  useStandard: boolean;
  itemizedAmount: number | '';
}

interface WithholdingResult {
  grossIncome: number;
  taxableSS: number;
  otherTaxableIncome: number;
  deduction: number;
  taxableIncome: number;
  estimatedTax: number;
  effectiveRate: number;
  marginalRate: number;
  currentWithholding: number;
  gap: number;
  status: 'low' | 'close' | 'high';
  monthlyAdditional: number;
  quarterlyEstimated: number;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  joint:  'Married Filing Jointly',
  mfs:    'Married Filing Separately',
  hoh:    'Head of Household',
  qss:    'Qualifying Surviving Spouse',
};

const fmt = (val: number) =>
  val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const pct = (val: number) => `${(val * 100).toFixed(0)}%`;

export const RetirementTaxWithholdingCalculator: React.FC = () => {
  const TAX_YEAR = 2026;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [age, setAge] = useState<number | ''>('');
  const [spouseAge, setSpouseAge] = useState<number | ''>('');
  const [showOtherIncome, setShowOtherIncome] = useState(false);

  const [income, setIncome] = useState<IncomeInputs>({
    socialSecurity: '', pension: '', ira: '', retirement401k: '',
    rmd: '', wages: '', interest: '', dividends: '', capitalGains: '', other: '',
  });

  const [withholding, setWithholding] = useState<WithholdingInputs>({
    socialSecurity: '', pension: '', ira: '', retirement401k: '', other: '',
    unknownWithholding: false,
  });

  const [deductions, setDeductions] = useState<DeductionInputs>({
    useStandard: true, itemizedAmount: '',
  });

  const [showMath, setShowMath] = useState(false);
  const [result, setResult] = useState<WithholdingResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Navigation ──────────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (age === '' || Number(age) < 18 || Number(age) > 110) errs.age = 'Enter a valid age (18–110).';
    if ((filingStatus === 'joint') && (spouseAge === '' || Number(spouseAge) < 18)) errs.spouseAge = 'Enter your spouse\'s age.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const totalIncome = n(income.socialSecurity) + n(income.pension) + n(income.ira) +
      n(income.retirement401k) + n(income.rmd) + n(income.wages) +
      n(income.interest) + n(income.dividends) + n(income.capitalGains) + n(income.other);
    if (totalIncome <= 0) {
      setErrors({ income: 'Please enter at least one income source.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4);
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4);
    setResult(null);
  };

  // ── Calculation ─────────────────────────────────────────────────────────────

  const calculate = () => {
    const yr = TAX_YEAR;
    const rules = TAX_RULES[yr];
    const brackets = rules.brackets[filingStatus];

    const ssBenefits  = n(income.socialSecurity);
    const pensionInc  = n(income.pension);
    const iraInc      = n(income.ira);
    const k401Inc     = n(income.retirement401k);
    const rmdInc      = n(income.rmd);
    const wagesInc    = n(income.wages);
    const interestInc = n(income.interest);
    const divsInc     = n(income.dividends);
    const cgInc       = n(income.capitalGains);
    const otherInc    = n(income.other);

    // Non-SS taxable income
    const otherTaxable = pensionInc + iraInc + k401Inc + rmdInc + wagesInc + interestInc + divsInc + cgInc + otherInc;

    // Taxable SS (IRS Pub 915 formula)
    const taxableSS = calculateTaxableSocialSecurity(ssBenefits, otherTaxable, filingStatus, yr);

    const grossIncome = ssBenefits + otherTaxable;

    // Deduction
    const standardDeduction = calculateStandardDeduction(filingStatus, n(age), n(spouseAge), yr);
    const deduction = deductions.useStandard
      ? standardDeduction
      : Math.max(standardDeduction, n(deductions.itemizedAmount));

    const taxableIncome = Math.max(0, taxableSS + otherTaxable - deduction);
    const estimatedTax  = calculateFederalTax(taxableIncome, brackets);
    const effectiveRate = grossIncome > 0 ? estimatedTax / grossIncome : 0;
    const marginalRate  = getMarginalRate(taxableIncome, brackets);

    // Current withholding
    const currentWithholding = withholding.unknownWithholding ? 0 :
      n(withholding.socialSecurity) + n(withholding.pension) + n(withholding.ira) +
      n(withholding.retirement401k) + n(withholding.other);

    const gap = estimatedTax - currentWithholding;
    const monthlyAdditional = gap > 0 ? gap / 12 : 0;
    const quarterlyEstimated = gap > 0 ? gap / 4 : 0;

    // Status: within $500 = close, positive = low, negative = high
    let status: 'low' | 'close' | 'high';
    if (Math.abs(gap) <= 500) status = 'close';
    else if (gap > 0) status = 'low';
    else status = 'high';

    setResult({
      grossIncome, taxableSS, otherTaxableIncome: otherTaxable, deduction,
      taxableIncome, estimatedTax, effectiveRate, marginalRate,
      currentWithholding, gap, status, monthlyAdditional, quarterlyEstimated,
    });
    setShowMath(false);
  };

  // ── Income helper ───────────────────────────────────────────────────────────

  const setIncomeField = (field: keyof IncomeInputs, raw: string) => {
    const num = raw === '' ? '' : Math.max(0, parseFloat(raw.replace(/[^0-9.]/g, '')) || 0);
    setIncome(prev => ({ ...prev, [field]: num }));
  };

  const setWithholdingField = (field: keyof Omit<WithholdingInputs, 'unknownWithholding'>, raw: string) => {
    const num = raw === '' ? '' : Math.max(0, parseFloat(raw.replace(/[^0-9.]/g, '')) || 0);
    setWithholding(prev => ({ ...prev, [field]: num }));
  };

  const totalCurrentWithholding =
    n(withholding.socialSecurity) + n(withholding.pension) + n(withholding.ira) +
    n(withholding.retirement401k) + n(withholding.other);

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="wdc-wrapper">

      {/* ── Progress Indicator ──────────────────────────────────── */}
      <div className="wdc-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
        {([1, 2, 3, 4] as const).map(s => (
          <div key={s} className={`wdc-step-dot ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
            <span className="wdc-step-num">{step > s ? '✓' : s}</span>
            <span className="wdc-step-label">
              {s === 1 ? 'Tax Situation' : s === 2 ? 'Income' : s === 3 ? 'Withholding' : 'Deductions'}
            </span>
          </div>
        ))}
        <div className="wdc-progress-track">
          <div className="wdc-progress-fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        </div>
      </div>

      {/* ── Privacy Badge ───────────────────────────────────────── */}
      <div className="wdc-privacy-badge">
        🔒 No account needed &nbsp;·&nbsp; Inputs stay in your browser &nbsp;·&nbsp; No email required
      </div>

      {/* ══════════════════════════════════════════════════════════
           STEP 1 — TAX SITUATION
          ══════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="wdc-step-panel">
          <h2 className="wdc-step-title">Step 1 — Your Tax Situation</h2>

          <div className="wdc-field-group">
            <label className="wdc-label" htmlFor="wdc-tax-year">Tax Year</label>
            <select id="wdc-tax-year" className="wdc-select" defaultValue="2026" disabled>
              <option value="2026">2026</option>
            </select>
            <span className="wdc-hint">Using 2026 IRS tax brackets and standard deductions.</span>
          </div>

          <div className="wdc-field-group">
            <label className="wdc-label" htmlFor="wdc-filing">Filing Status</label>
            <select
              id="wdc-filing"
              className="wdc-select"
              value={filingStatus}
              onChange={e => setFilingStatus(e.target.value as FilingStatus)}
            >
              {(Object.entries(FILING_STATUS_LABELS) as [FilingStatus, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="wdc-field-row">
            <div className="wdc-field-group">
              <label className="wdc-label" htmlFor="wdc-age">Your Age</label>
              <input
                id="wdc-age"
                type="number"
                className={`wdc-input ${errors.age ? 'wdc-input--error' : ''}`}
                value={age}
                onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                min={18} max={110}
                placeholder="e.g. 68"
                aria-describedby={errors.age ? 'wdc-age-err' : undefined}
              />
              {errors.age && <span id="wdc-age-err" className="wdc-error" role="alert">{errors.age}</span>}
              <span className="wdc-hint">Age affects the senior standard deduction add-on (age 65+).</span>
            </div>

            {filingStatus === 'joint' && (
              <div className="wdc-field-group">
                <label className="wdc-label" htmlFor="wdc-spouse-age">Spouse's Age</label>
                <input
                  id="wdc-spouse-age"
                  type="number"
                  className={`wdc-input ${errors.spouseAge ? 'wdc-input--error' : ''}`}
                  value={spouseAge}
                  onChange={e => setSpouseAge(e.target.value === '' ? '' : Number(e.target.value))}
                  min={18} max={110}
                  placeholder="e.g. 66"
                />
                {errors.spouseAge && <span className="wdc-error" role="alert">{errors.spouseAge}</span>}
              </div>
            )}
          </div>

          <button className="wdc-btn-primary" onClick={goNext}>
            Continue to Income &rarr;
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
           STEP 2 — RETIREMENT INCOME
          ══════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="wdc-step-panel">
          <h2 className="wdc-step-title">Step 2 — Your Retirement Income</h2>
          <p className="wdc-step-desc">Enter your estimated annual amounts. Leave blank if you don't have that income source.</p>

          {errors.income && <div className="wdc-error-banner" role="alert">{errors.income}</div>}

          <fieldset className="wdc-fieldset">
            <legend className="wdc-legend">Social Security</legend>
            <div className="wdc-field-group">
              <label className="wdc-label" htmlFor="wdc-ss">Annual Social Security Benefits</label>
              <div className="wdc-money-wrap">
                <span className="wdc-dollar">$</span>
                <input id="wdc-ss" type="number" className="wdc-input wdc-input--money" min={0}
                  value={income.socialSecurity}
                  onChange={e => setIncomeField('socialSecurity', e.target.value)}
                  placeholder="0" />
              </div>
              <span className="wdc-hint">Enter your total annual benefit — before any Medicare premium deductions. The calculator will estimate how much may be taxable using the IRS Pub 915 combined-income formula. For a detailed Social Security tax analysis, use our <a href="/tools/social-security-tax-calculator/" className="wdc-link">Social Security Tax Calculator ↗</a>.</span>
            </div>
          </fieldset>

          <fieldset className="wdc-fieldset">
            <legend className="wdc-legend">Pension / Annuity</legend>
            <div className="wdc-field-group">
              <label className="wdc-label" htmlFor="wdc-pension">Annual Pension or Annuity Income</label>
              <div className="wdc-money-wrap">
                <span className="wdc-dollar">$</span>
                <input id="wdc-pension" type="number" className="wdc-input wdc-input--money" min={0}
                  value={income.pension}
                  onChange={e => setIncomeField('pension', e.target.value)}
                  placeholder="0" />
              </div>
              <span className="wdc-hint">Include all periodic pension, defined-benefit, or annuity payments. Periodic payments use Form W-4P for withholding.</span>
            </div>
          </fieldset>

          <fieldset className="wdc-fieldset">
            <legend className="wdc-legend">IRA Distributions (Traditional / Pre-Tax)</legend>
            <div className="wdc-field-group">
              <label className="wdc-label" htmlFor="wdc-ira">Annual IRA Withdrawal Amount</label>
              <div className="wdc-money-wrap">
                <span className="wdc-dollar">$</span>
                <input id="wdc-ira" type="number" className="wdc-input wdc-input--money" min={0}
                  value={income.ira}
                  onChange={e => setIncomeField('ira', e.target.value)}
                  placeholder="0" />
              </div>
              <span className="wdc-hint">Enter traditional (pre-tax) IRA withdrawals only. <strong>Do not include qualified Roth IRA distributions</strong> — those are generally tax-free and don't affect this estimate. Non-periodic IRA distributions typically use Form W-4R with a 10% default withholding rate.</span>
            </div>
          </fieldset>

          <fieldset className="wdc-fieldset">
            <legend className="wdc-legend">401(k) / 403(b) / Other Plan Distributions</legend>
            <div className="wdc-field-group">
              <label className="wdc-label" htmlFor="wdc-401k">Annual Distribution Amount</label>
              <div className="wdc-money-wrap">
                <span className="wdc-dollar">$</span>
                <input id="wdc-401k" type="number" className="wdc-input wdc-input--money" min={0}
                  value={income.retirement401k}
                  onChange={e => setIncomeField('retirement401k', e.target.value)}
                  placeholder="0" />
              </div>
              <span className="wdc-hint">Pre-tax 401(k), 403(b), 457(b), or other employer-plan distributions. For detailed 401(k) tax analysis, see our <a href="/tools/401k-withdrawal-tax-calculator/" className="wdc-link">401(k) Withdrawal Tax Calculator ↗</a>.</span>
            </div>
          </fieldset>

          <fieldset className="wdc-fieldset">
            <legend className="wdc-legend">Required Minimum Distributions (RMDs)</legend>
            <div className="wdc-field-group">
              <label className="wdc-label" htmlFor="wdc-rmd">Annual RMD Amount</label>
              <div className="wdc-money-wrap">
                <span className="wdc-dollar">$</span>
                <input id="wdc-rmd" type="number" className="wdc-input wdc-input--money" min={0}
                  value={income.rmd}
                  onChange={e => setIncomeField('rmd', e.target.value)}
                  placeholder="0" />
              </div>
              <span className="wdc-hint">Enter your RMD amount if it's separate from the IRA/401(k) amounts above. <a href="/tools/rmd-calculator-by-age/" className="wdc-link">Need help calculating your RMD? Use our free RMD Calculator by Age ↗</a></span>
            </div>
          </fieldset>

          <button
            type="button"
            className="wdc-expand-btn"
            onClick={() => setShowOtherIncome(!showOtherIncome)}
            aria-expanded={showOtherIncome}
          >
            {showOtherIncome ? '▲ Hide other income' : '▼ Add other income (wages, interest, dividends, capital gains)'}
          </button>

          {showOtherIncome && (
            <div className="wdc-other-income-panel">
              {([
                { key: 'wages', label: 'Wages / Part-Time Earnings', placeholder: '0' },
                { key: 'interest', label: 'Taxable Interest', placeholder: '0' },
                { key: 'dividends', label: 'Ordinary Dividends', placeholder: '0' },
                { key: 'capitalGains', label: 'Net Capital Gains', placeholder: '0' },
                { key: 'other', label: 'Other Taxable Income', placeholder: '0' },
              ] as { key: keyof IncomeInputs; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                <div className="wdc-field-group wdc-field-group--inline" key={key}>
                  <label className="wdc-label" htmlFor={`wdc-${key}`}>{label}</label>
                  <div className="wdc-money-wrap">
                    <span className="wdc-dollar">$</span>
                    <input id={`wdc-${key}`} type="number" className="wdc-input wdc-input--money" min={0}
                      value={income[key]}
                      onChange={e => setIncomeField(key, e.target.value)}
                      placeholder={placeholder} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="wdc-btn-row">
            <button className="wdc-btn-secondary" onClick={goBack}>&larr; Back</button>
            <button className="wdc-btn-primary" onClick={goNext}>Continue to Withholding &rarr;</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
           STEP 3 — CURRENT WITHHOLDING
          ══════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="wdc-step-panel">
          <h2 className="wdc-step-title">Step 3 — Your Current Federal Withholding</h2>
          <p className="wdc-step-desc">How much federal income tax are you currently having withheld each year from each source? Check your most recent benefit statement, Form 1099-R, or ask your plan administrator.</p>

          <div className="wdc-field-group">
            <label className="wdc-checkbox-label">
              <input
                type="checkbox"
                className="wdc-checkbox"
                checked={withholding.unknownWithholding}
                onChange={e => setWithholding(prev => ({ ...prev, unknownWithholding: e.target.checked }))}
              />
              &nbsp;I don't know my current withholding amounts
            </label>
            {withholding.unknownWithholding && (
              <div className="wdc-callout wdc-callout--info">
                <strong>How to find your withholding amounts:</strong>
                <ul className="wdc-list">
                  <li><strong>Social Security:</strong> Check Box 6 on your SSA-1099 (mailed each January) or call SSA at 1-800-772-1213.</li>
                  <li><strong>Pension/IRA/401(k):</strong> Check Box 4 on your Form 1099-R from your plan administrator.</li>
                  <li><strong>Year-to-date:</strong> Review your most recent benefit statement or account statement.</li>
                </ul>
                <p style={{marginBottom: 0}}>We'll assume $0 withholding and show you the full amount to cover. You can come back and re-run with your actual amounts once you find them.</p>
              </div>
            )}
          </div>

          {!withholding.unknownWithholding && (
            <>
              {n(income.socialSecurity) > 0 && (
                <div className="wdc-field-group">
                  <label className="wdc-label" htmlFor="wdc-w-ss">Social Security — Federal Tax Withheld (annual)</label>
                  <div className="wdc-money-wrap">
                    <span className="wdc-dollar">$</span>
                    <input id="wdc-w-ss" type="number" className="wdc-input wdc-input--money" min={0}
                      value={withholding.socialSecurity}
                      onChange={e => setWithholdingField('socialSecurity', e.target.value)}
                      placeholder="0" />
                  </div>
                  <span className="wdc-hint">Found on your SSA-1099, Box 6. SSA offers 7%, 10%, 12%, or 22% voluntary withholding via Form W-4V. See our <a href="/tools/social-security-tax-withholding-calculator/" className="wdc-link">SS Tax Withholding Calculator ↗</a> for details.</span>
                </div>
              )}

              {n(income.pension) > 0 && (
                <div className="wdc-field-group">
                  <label className="wdc-label" htmlFor="wdc-w-pension">Pension / Annuity — Federal Tax Withheld (annual)</label>
                  <div className="wdc-money-wrap">
                    <span className="wdc-dollar">$</span>
                    <input id="wdc-w-pension" type="number" className="wdc-input wdc-input--money" min={0}
                      value={withholding.pension}
                      onChange={e => setWithholdingField('pension', e.target.value)}
                      placeholder="0" />
                  </div>
                  <span className="wdc-hint">Found on your Form 1099-R, Box 4. Pension withholding uses Form W-4P. Note: Default pension withholding typically only accounts for pension income — it doesn't include your Social Security or IRA income.</span>
                </div>
              )}

              {(n(income.ira) > 0 || n(income.rmd) > 0) && (
                <div className="wdc-field-group">
                  <label className="wdc-label" htmlFor="wdc-w-ira">IRA / RMD — Federal Tax Withheld (annual)</label>
                  <div className="wdc-money-wrap">
                    <span className="wdc-dollar">$</span>
                    <input id="wdc-w-ira" type="number" className="wdc-input wdc-input--money" min={0}
                      value={withholding.ira}
                      onChange={e => setWithholdingField('ira', e.target.value)}
                      placeholder="0" />
                  </div>
                  <span className="wdc-hint">Found on Form 1099-R, Box 4. The IRS default for non-periodic IRA distributions is 10% — often insufficient if your total income puts you in the 22% bracket.</span>
                </div>
              )}

              {n(income.retirement401k) > 0 && (
                <div className="wdc-field-group">
                  <label className="wdc-label" htmlFor="wdc-w-401k">401(k) / 403(b) — Federal Tax Withheld (annual)</label>
                  <div className="wdc-money-wrap">
                    <span className="wdc-dollar">$</span>
                    <input id="wdc-w-401k" type="number" className="wdc-input wdc-input--money" min={0}
                      value={withholding.retirement401k}
                      onChange={e => setWithholdingField('retirement401k', e.target.value)}
                      placeholder="0" />
                  </div>
                </div>
              )}

              <div className="wdc-field-group">
                <label className="wdc-label" htmlFor="wdc-w-other">Other Federal Tax Withheld (annual)</label>
                <div className="wdc-money-wrap">
                  <span className="wdc-dollar">$</span>
                  <input id="wdc-w-other" type="number" className="wdc-input wdc-input--money" min={0}
                    value={withholding.other}
                    onChange={e => setWithholdingField('other', e.target.value)}
                    placeholder="0" />
                </div>
              </div>

              <div className="wdc-total-row">
                <span>Total estimated annual withholding:</span>
                <strong className="wdc-total-val">{fmt(totalCurrentWithholding)}</strong>
              </div>
            </>
          )}

          <div className="wdc-btn-row">
            <button className="wdc-btn-secondary" onClick={goBack}>&larr; Back</button>
            <button className="wdc-btn-primary" onClick={goNext}>Continue to Deductions &rarr;</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
           STEP 4 — DEDUCTIONS
          ══════════════════════════════════════════════════════════ */}
      {step === 4 && !result && (
        <div className="wdc-step-panel">
          <h2 className="wdc-step-title">Step 4 — Deductions</h2>
          <p className="wdc-step-desc">Most retirees take the standard deduction. In 2026, the basic standard deduction is $16,100 (single) or $32,200 (joint), plus an additional $2,050 (single) or $1,650 per spouse (joint) for each person age 65 or older.</p>

          <div className="wdc-field-group">
            <fieldset className="wdc-radio-group" aria-label="Deduction method">
              <label className="wdc-radio-label">
                <input type="radio" name="deduction-type" className="wdc-radio"
                  checked={deductions.useStandard}
                  onChange={() => setDeductions(prev => ({ ...prev, useStandard: true }))} />
                &nbsp;Take the standard deduction (recommended for most retirees)
              </label>
              <label className="wdc-radio-label">
                <input type="radio" name="deduction-type" className="wdc-radio"
                  checked={!deductions.useStandard}
                  onChange={() => setDeductions(prev => ({ ...prev, useStandard: false }))} />
                &nbsp;I plan to itemize deductions
              </label>
            </fieldset>
          </div>

          {!deductions.useStandard && (
            <div className="wdc-field-group">
              <label className="wdc-label" htmlFor="wdc-itemized">Estimated Total Itemized Deductions</label>
              <div className="wdc-money-wrap">
                <span className="wdc-dollar">$</span>
                <input id="wdc-itemized" type="number" className="wdc-input wdc-input--money" min={0}
                  value={deductions.itemizedAmount}
                  onChange={e => setDeductions(prev => ({ ...prev, itemizedAmount: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="e.g. 25000" />
              </div>
              <span className="wdc-hint">Common itemized deductions include mortgage interest, state and local taxes (up to $10,000 SALT cap), charitable donations, and large medical expenses exceeding 7.5% of AGI. The calculator will use the higher of your itemized amount or the standard deduction.</span>
            </div>
          )}

          <div className="wdc-deduction-preview">
            <span>Your estimated deduction:</span>
            <strong className="wdc-total-val">
              {fmt(calculateStandardDeduction(filingStatus, n(age), n(spouseAge), TAX_YEAR))}
              {!deductions.useStandard && n(deductions.itemizedAmount) > calculateStandardDeduction(filingStatus, n(age), n(spouseAge), TAX_YEAR)
                ? ` → ${fmt(n(deductions.itemizedAmount))} (itemized)`
                : ' (standard)'}
            </strong>
          </div>

          <div className="wdc-btn-row">
            <button className="wdc-btn-secondary" onClick={goBack}>&larr; Back</button>
            <button className="wdc-btn-primary wdc-btn-calc" onClick={() => { calculate(); }}>
              Calculate My Withholding Gap →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
           RESULTS DASHBOARD
          ══════════════════════════════════════════════════════════ */}
      {result && (
        <div className="wdc-result-panel">

          {/* ── Status Banner ──────────────────────────────────── */}
          {result.status === 'low' && (
            <div className="wdc-status-banner wdc-status-banner--low" role="alert">
              <span className="wdc-status-icon">⚠️</span>
              <div>
                <strong>You may be underwithholding by about {fmt(result.gap)} this year.</strong>
                <p>Without adjustment, you could owe this amount when you file — plus a possible underpayment penalty if the gap exceeds $1,000 and you haven't met a safe-harbor threshold.</p>
              </div>
            </div>
          )}
          {result.status === 'close' && (
            <div className="wdc-status-banner wdc-status-banner--close" role="status">
              <span className="wdc-status-icon">✅</span>
              <strong>Your estimated withholding is close to your estimated tax.</strong>
            </div>
          )}
          {result.status === 'high' && (
            <div className="wdc-status-banner wdc-status-banner--high" role="status">
              <span className="wdc-status-icon">💡</span>
              <strong>You appear to be overwithholding by about {fmt(Math.abs(result.gap))}.</strong>
              <p>You're on track for a refund. You could reduce withholding to keep more cash during the year.</p>
            </div>
          )}

          {/* ── Primary Numbers ────────────────────────────────── */}
          <div className="wdc-primary-grid">
            <div className="wdc-primary-card">
              <span className="wdc-primary-label">Estimated Federal Tax</span>
              <strong className="wdc-primary-val">{fmt(result.estimatedTax)}</strong>
              <span className="wdc-primary-sub">/ year &nbsp;·&nbsp; Effective rate: {(result.effectiveRate * 100).toFixed(1)}%</span>
            </div>
            <div className="wdc-primary-card">
              <span className="wdc-primary-label">Current Withholding</span>
              <strong className="wdc-primary-val wdc-primary-val--muted">{fmt(result.currentWithholding)}</strong>
              <span className="wdc-primary-sub">/ year</span>
            </div>
            {result.status === 'low' && (
              <div className="wdc-primary-card wdc-primary-card--highlight">
                <span className="wdc-primary-label">Additional Withholding Needed</span>
                <strong className="wdc-primary-val wdc-primary-val--gold">{fmt(result.monthlyAdditional)}</strong>
                <span className="wdc-primary-sub">/ month &nbsp;·&nbsp; {fmt(result.gap)} / year</span>
              </div>
            )}
          </div>

          {/* ── Withholding Strategy ───────────────────────────── */}
          {result.status === 'low' && (
            <div className="wdc-strategy-section">
              <h3 className="wdc-strategy-title">One approach to covering the gap</h3>
              <p className="wdc-strategy-desc">These are examples — not recommendations. Any combination that covers your estimated gap works. Choose what fits your situation best.</p>

              <div className="wdc-strategy-cards">
                {n(income.pension) > 0 && (
                  <div className="wdc-strategy-card">
                    <div className="wdc-strategy-header">
                      <span className="wdc-strategy-badge">Option A</span>
                      <strong>Increase Pension Withholding</strong>
                    </div>
                    <p>Add <strong>{fmt(result.monthlyAdditional)}/month</strong> to your pension withholding using <strong>IRS Form W-4P</strong>.</p>
                    <p className="wdc-strategy-note">Submit to your pension administrator. Takes effect with your next payment cycle.</p>
                    <a href="https://www.irs.gov/pub/irs-pdf/fw4p.pdf" target="_blank" rel="noopener noreferrer" className="wdc-form-link">Download Form W-4P (IRS PDF) ↗</a>
                  </div>
                )}

                {n(income.socialSecurity) > 0 && (
                  <div className="wdc-strategy-card">
                    <div className="wdc-strategy-header">
                      <span className="wdc-strategy-badge">Option {n(income.pension) > 0 ? 'B' : 'A'}</span>
                      <strong>Add Social Security Withholding</strong>
                    </div>
                    <p>Request voluntary withholding from your Social Security benefit. Available rates: <strong>7%, 10%, 12%, or 22%</strong>.</p>
                    <p>At 10%: {fmt(n(income.socialSecurity) * 0.10)}/yr &nbsp;|&nbsp; At 12%: {fmt(n(income.socialSecurity) * 0.12)}/yr &nbsp;|&nbsp; At 22%: {fmt(n(income.socialSecurity) * 0.22)}/yr</p>
                    <p className="wdc-strategy-note">Use <strong>Form W-4V</strong> — mail or deliver to your local SSA office. For a detailed SS withholding analysis, see our <a href="/tools/social-security-tax-withholding-calculator/" className="wdc-link">SS Tax Withholding Calculator ↗</a></p>
                    <a href="https://www.irs.gov/pub/irs-pdf/fw4v.pdf" target="_blank" rel="noopener noreferrer" className="wdc-form-link">Download Form W-4V (IRS PDF) ↗</a>
                  </div>
                )}

                {(n(income.ira) > 0 || n(income.rmd) > 0 || n(income.retirement401k) > 0) && (
                  <div className="wdc-strategy-card">
                    <div className="wdc-strategy-header">
                      <span className="wdc-strategy-badge">Option C</span>
                      <strong>Increase IRA / Retirement Plan Withholding</strong>
                    </div>
                    <p>Elect a higher withholding rate on your IRA or retirement plan distributions using <strong>IRS Form W-4R</strong>.</p>
                    <p className="wdc-strategy-note">The IRS default is 10% for non-periodic distributions. Your marginal rate is {pct(result.marginalRate)} — the default 10% may be insufficient.</p>
                    <p className="wdc-strategy-note"><strong>Important:</strong> Eligible rollover distributions generally have 20% mandatory withholding unless directly rolled over. Form W-4R applies to non-periodic distributions only.</p>
                    <a href="https://www.irs.gov/pub/irs-pdf/fw4r.pdf" target="_blank" rel="noopener noreferrer" className="wdc-form-link">Download Form W-4R (IRS PDF) ↗</a>
                  </div>
                )}

                <div className="wdc-strategy-card">
                  <div className="wdc-strategy-header">
                    <span className="wdc-strategy-badge">Option D</span>
                    <strong>Make Quarterly Estimated Tax Payments</strong>
                  </div>
                  <p>Pay approximately <strong>{fmt(result.quarterlyEstimated)}/quarter</strong> using <strong>IRS Form 1040-ES</strong>.</p>
                  <p className="wdc-strategy-note">Quarterly due dates: April 15, June 16, September 15, and January 15. Useful if you prefer not to change withholding on any income source.</p>
                  <a href="https://www.irs.gov/forms-pubs/about-form-1040-es" target="_blank" rel="noopener noreferrer" className="wdc-form-link">IRS Form 1040-ES Information ↗</a>
                </div>
              </div>
            </div>
          )}

          {/* ── What Your Result Means ─────────────────────────── */}
          <div className="wdc-meaning-box">
            <h3 className="wdc-meaning-title">What this estimate means</h3>
            <p>
              Your estimated federal income tax is approximately <strong>{fmt(result.estimatedTax)}</strong> for the year.
              You currently expect to have approximately <strong>{fmt(result.currentWithholding)}</strong> withheld.
              {result.status === 'low' && ` That leaves an estimated gap of ${fmt(result.gap)}. If your income and tax situation remain similar, you could consider increasing withholding by approximately ${fmt(result.monthlyAdditional)} per month.`}
              {result.status === 'close' && ' Your withholding appears to be well-matched to your estimated tax. Monitor for any changes in income during the year.'}
              {result.status === 'high' && ` You appear to be withholding about ${fmt(Math.abs(result.gap))} more than needed. You may receive a refund, or you could reduce withholding to have more take-home income during the year.`}
            </p>
            <div className="wdc-disclaimer-inline">
              <strong>Educational estimate only.</strong> This is not an IRS determination of your tax liability. Actual results depend on credits, additional deductions, state taxes, and other factors. Consult a qualified tax professional or use <a href="https://www.irs.gov/publications/p505" target="_blank" rel="noopener noreferrer" className="wdc-link">IRS Publication 505</a> for official guidance.
            </div>
          </div>

          {/* ── Show the Math ─────────────────────────────────────── */}
          <button
            className="wdc-math-toggle"
            onClick={() => setShowMath(!showMath)}
            aria-expanded={showMath}
          >
            {showMath ? '▲ Hide calculation details' : '▼ Show the math — how we estimated this'}
          </button>

          {showMath && (
            <div className="wdc-math-panel">
              <table className="wdc-math-table">
                <tbody>
                  <tr>
                    <td>Gross income entered</td>
                    <td className="wdc-math-val">{fmt(result.grossIncome)}</td>
                  </tr>
                  <tr className="wdc-math-alt">
                    <td>Estimated taxable Social Security (IRS Pub 915 formula)</td>
                    <td className="wdc-math-val">{fmt(result.taxableSS)}</td>
                  </tr>
                  <tr>
                    <td>Other taxable retirement income</td>
                    <td className="wdc-math-val">{fmt(result.otherTaxableIncome)}</td>
                  </tr>
                  <tr className="wdc-math-alt">
                    <td>Less: standard / itemized deduction</td>
                    <td className="wdc-math-val">– {fmt(result.deduction)}</td>
                  </tr>
                  <tr>
                    <td><strong>Estimated taxable income</strong></td>
                    <td className="wdc-math-val"><strong>{fmt(result.taxableIncome)}</strong></td>
                  </tr>
                  <tr className="wdc-math-alt">
                    <td><strong>Estimated federal income tax</strong> (2026 brackets)</td>
                    <td className="wdc-math-val"><strong>{fmt(result.estimatedTax)}</strong></td>
                  </tr>
                  <tr>
                    <td>Marginal (top) tax rate</td>
                    <td className="wdc-math-val">{pct(result.marginalRate)}</td>
                  </tr>
                  <tr className="wdc-math-alt">
                    <td>Effective tax rate</td>
                    <td className="wdc-math-val">{(result.effectiveRate * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td>Current annual withholding</td>
                    <td className="wdc-math-val">{fmt(result.currentWithholding)}</td>
                  </tr>
                  <tr className="wdc-math-alt">
                    <td><strong>Estimated withholding gap</strong></td>
                    <td className={`wdc-math-val ${result.gap > 0 ? 'wdc-math-gap--low' : result.gap < 0 ? 'wdc-math-gap--high' : ''}`}>
                      <strong>{result.gap >= 0 ? '+' : ''}{fmt(result.gap)}</strong>
                    </td>
                  </tr>
                  {result.gap > 0 && <>
                    <tr>
                      <td>Suggested additional monthly withholding</td>
                      <td className="wdc-math-val">{fmt(result.monthlyAdditional)}/mo</td>
                    </tr>
                    <tr className="wdc-math-alt">
                      <td>Alternative: quarterly estimated payment</td>
                      <td className="wdc-math-val">{fmt(result.quarterlyEstimated)}/quarter</td>
                    </tr>
                  </>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Reset ──────────────────────────────────────────── */}
          <div className="wdc-reset-row">
            <button className="wdc-btn-secondary" onClick={() => { setResult(null); }}>
              ← Adjust Inputs
            </button>
            <button className="wdc-btn-secondary" onClick={() => { setResult(null); setStep(1); setIncome({ socialSecurity: '', pension: '', ira: '', retirement401k: '', rmd: '', wages: '', interest: '', dividends: '', capitalGains: '', other: '' }); setWithholding({ socialSecurity: '', pension: '', ira: '', retirement401k: '', other: '', unknownWithholding: false }); setDeductions({ useStandard: true, itemizedAmount: '' }); }}>
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* ── Styles ──────────────────────────────────────────────────────────── */}
      <style>{`
        .wdc-wrapper { font-family: var(--font-body, system-ui, sans-serif); max-width: 720px; margin: 0 auto; }

        /* Progress */
        .wdc-progress { position: relative; display: flex; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 0.5rem; }
        .wdc-progress-track { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: #E2E8F0; border-radius: 99px; }
        .wdc-progress-fill { height: 3px; background: #0A3D3A; border-radius: 99px; transition: width 0.35s ease; }
        .wdc-step-dot { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; z-index: 1; }
        .wdc-step-num { width: 2rem; height: 2rem; border-radius: 50%; background: #E2E8F0; color: #64748B; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; transition: all 0.2s; }
        .wdc-step-dot.active .wdc-step-num { background: #0A3D3A; color: #fff; }
        .wdc-step-dot.done .wdc-step-num { background: #C9933A; color: #fff; }
        .wdc-step-label { font-size: 0.7rem; color: #64748B; text-align: center; white-space: nowrap; }
        .wdc-step-dot.active .wdc-step-label { color: #0A3D3A; font-weight: 600; }

        /* Privacy */
        .wdc-privacy-badge { font-size: 0.8rem; color: #4B5A6E; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 0.5rem 0.75rem; margin-bottom: 1.5rem; text-align: center; }

        /* Step panel */
        .wdc-step-panel { background: #fff; border: 1.5px solid #DDE3EA; border-radius: 12px; padding: 1.75rem; }
        .wdc-step-title { font-size: clamp(1.1rem, 3vw, 1.4rem); font-weight: 800; color: #0A3D3A; margin: 0 0 0.5rem 0; }
        .wdc-step-desc { font-size: 1rem; color: #4B5A6E; margin: 0 0 1.5rem 0; line-height: 1.6; }

        /* Fields */
        .wdc-field-group { margin-bottom: 1.25rem; }
        .wdc-field-group--inline { margin-bottom: 0.75rem; }
        .wdc-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .wdc-label { display: block; font-size: 1rem; font-weight: 600; color: #0D2137; margin-bottom: 0.4rem; }
        .wdc-input { width: 100%; font-size: 1.1rem; padding: 0.65rem 0.85rem; border: 2px solid #CBD5E1; border-radius: 8px; color: #0D2137; box-sizing: border-box; transition: border-color 0.2s; appearance: textfield; }
        .wdc-input:focus { outline: none; border-color: #0A3D3A; box-shadow: 0 0 0 3px rgba(10,61,58,0.12); }
        .wdc-input--error { border-color: #E8761A; }
        .wdc-input--money { padding-left: 2rem; }
        .wdc-money-wrap { position: relative; }
        .wdc-dollar { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #64748B; font-size: 1rem; pointer-events: none; }
        .wdc-select { width: 100%; font-size: 1.05rem; padding: 0.65rem 0.85rem; border: 2px solid #CBD5E1; border-radius: 8px; color: #0D2137; background: #fff; cursor: pointer; }
        .wdc-select:focus { outline: none; border-color: #0A3D3A; }
        .wdc-hint { display: block; font-size: 0.875rem; color: #4B5A6E; margin-top: 0.35rem; line-height: 1.5; }
        .wdc-error { display: block; font-size: 0.875rem; color: #C0380E; margin-top: 0.25rem; font-weight: 600; }
        .wdc-error-banner { background: #FFF5EC; border-left: 4px solid #E8761A; padding: 0.75rem 1rem; border-radius: 0 6px 6px 0; color: #7A2E00; font-size: 0.95rem; margin-bottom: 1rem; }

        /* Fieldset */
        .wdc-fieldset { border: none; padding: 0; margin: 0 0 0.5rem 0; }
        .wdc-legend { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #0A3D3A; margin-bottom: 0.5rem; }

        /* Radio & checkbox */
        .wdc-radio-group { display: flex; flex-direction: column; gap: 0.5rem; border: none; padding: 0; margin: 0; }
        .wdc-radio-label, .wdc-checkbox-label { font-size: 1rem; color: #0D2137; cursor: pointer; display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.5; }
        .wdc-radio, .wdc-checkbox { width: 1.1rem; height: 1.1rem; accent-color: #0A3D3A; cursor: pointer; flex-shrink: 0; margin-top: 2px; }

        /* Callout */
        .wdc-callout { border-radius: 8px; padding: 1rem 1.1rem; margin-top: 0.75rem; font-size: 0.95rem; line-height: 1.6; }
        .wdc-callout--info { background: #EFF6FF; border-left: 4px solid #3B82F6; color: #1E3A5F; }
        .wdc-list { margin: 0.5rem 0 0.75rem 1.25rem; padding: 0; }
        .wdc-list li { margin-bottom: 0.4rem; }

        /* Total row */
        .wdc-total-row, .wdc-deduction-preview { display: flex; justify-content: space-between; align-items: center; background: #F1F5F9; border-radius: 8px; padding: 0.75rem 1rem; margin-top: 1.25rem; font-size: 1rem; color: #0D2137; }
        .wdc-total-val { font-size: 1.15rem; color: #0A3D3A; }

        /* Expand button */
        .wdc-expand-btn { background: none; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 0.5rem 0.85rem; font-size: 0.9rem; color: #0A3D3A; cursor: pointer; margin: 0.5rem 0 1rem; width: 100%; text-align: left; }
        .wdc-expand-btn:hover { border-color: #0A3D3A; background: #F0FDF4; }
        .wdc-other-income-panel { background: #F8FAFC; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }

        /* Buttons */
        .wdc-btn-row { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .wdc-btn-primary { background: #0A3D3A; color: #fff; border: none; border-radius: 8px; padding: 0.8rem 1.5rem; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .wdc-btn-primary:hover { background: #0D4F4B; }
        .wdc-btn-calc { width: 100%; margin-top: 0.5rem; font-size: 1.1rem; padding: 1rem; }
        .wdc-btn-secondary { background: #fff; color: #0A3D3A; border: 2px solid #0A3D3A; border-radius: 8px; padding: 0.75rem 1.25rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
        .wdc-btn-secondary:hover { background: #F0FDF4; }

        /* Result panel */
        .wdc-result-panel { display: flex; flex-direction: column; gap: 1.5rem; }

        /* Status banners */
        .wdc-status-banner { display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 1.25rem; border-radius: 10px; font-size: 1rem; line-height: 1.6; }
        .wdc-status-banner p { margin: 0.25rem 0 0 0; font-size: 0.9rem; }
        .wdc-status-banner--low { background: #FFF5EC; border-left: 5px solid #E8761A; color: #6B2F00; }
        .wdc-status-banner--low strong { color: #C0380E; }
        .wdc-status-banner--close { background: #F0FDF4; border-left: 5px solid #22C55E; color: #14532D; }
        .wdc-status-banner--high { background: #EFF6FF; border-left: 5px solid #3B82F6; color: #1E3A5F; }
        .wdc-status-icon { font-size: 1.5rem; flex-shrink: 0; }

        /* Primary grid */
        .wdc-primary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .wdc-primary-card { background: #0A3D3A; border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .wdc-primary-card--highlight { background: #071C1A; }
        .wdc-primary-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.7); font-weight: 600; }
        .wdc-primary-val { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 800; color: #fff; }
        .wdc-primary-val--muted { color: rgba(255,255,255,0.85); }
        .wdc-primary-val--gold { color: #C9933A; }
        .wdc-primary-sub { font-size: 0.8rem; color: rgba(255,255,255,0.6); }

        /* Strategy */
        .wdc-strategy-section { background: #F8FAFC; border-radius: 10px; padding: 1.5rem; }
        .wdc-strategy-title { font-size: 1.15rem; font-weight: 800; color: #0D2137; margin: 0 0 0.25rem 0; }
        .wdc-strategy-desc { font-size: 0.875rem; color: #4B5A6E; margin: 0 0 1rem 0; }
        .wdc-strategy-cards { display: flex; flex-direction: column; gap: 0.75rem; }
        .wdc-strategy-card { background: #fff; border: 1.5px solid #DDE3EA; border-radius: 8px; padding: 1rem 1.1rem; }
        .wdc-strategy-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .wdc-strategy-badge { background: #0A3D3A; color: #fff; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 4px; }
        .wdc-strategy-card strong { font-size: 1rem; color: #0D2137; }
        .wdc-strategy-card p { font-size: 0.95rem; color: #0D2137; margin: 0.35rem 0; line-height: 1.5; }
        .wdc-strategy-note { font-size: 0.85rem !important; color: #4B5A6E !important; }
        .wdc-form-link { display: inline-block; font-size: 0.85rem; color: #0A3D3A; font-weight: 600; margin-top: 0.25rem; }

        /* Meaning box */
        .wdc-meaning-box { background: #fff; border: 1.5px solid #DDE3EA; border-radius: 10px; padding: 1.25rem 1.5rem; }
        .wdc-meaning-title { font-size: 1.05rem; font-weight: 700; color: #0D2137; margin: 0 0 0.5rem 0; }
        .wdc-meaning-box p { font-size: 1rem; color: #0D2137; line-height: 1.7; margin: 0 0 0.75rem 0; }
        .wdc-disclaimer-inline { font-size: 0.875rem; color: #4B5A6E; background: #F8FAFC; border-radius: 6px; padding: 0.75rem 1rem; line-height: 1.6; }
        .wdc-disclaimer-inline a { color: #0A3D3A; }

        /* Show the Math */
        .wdc-math-toggle { background: none; border: 1.5px solid #CBD5E1; border-radius: 6px; padding: 0.6rem 1rem; font-size: 0.9rem; color: #0A3D3A; cursor: pointer; width: 100%; text-align: left; font-weight: 600; }
        .wdc-math-toggle:hover { border-color: #0A3D3A; background: #F0FDF4; }
        .wdc-math-panel { background: #F8FAFC; border-radius: 8px; overflow: hidden; }
        .wdc-math-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .wdc-math-table td { padding: 0.6rem 1rem; color: #0D2137; }
        .wdc-math-table td:last-child { text-align: right; }
        .wdc-math-alt { background: #F1F5F9; }
        .wdc-math-val { font-variant-numeric: tabular-nums; }
        .wdc-math-gap--low { color: #C0380E; }
        .wdc-math-gap--high { color: #15803D; }

        /* Reset row */
        .wdc-reset-row { display: flex; gap: 0.75rem; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid #E2E8F0; }

        /* Link */
        .wdc-link { color: #0A3D3A; text-decoration: underline; }

        /* Mobile */
        @media (max-width: 600px) {
          .wdc-step-panel { padding: 1.25rem 1rem; }
          .wdc-field-row { grid-template-columns: 1fr; }
          .wdc-primary-grid { grid-template-columns: 1fr; }
          .wdc-btn-row { flex-direction: column; }
          .wdc-btn-primary, .wdc-btn-secondary { width: 100%; text-align: center; }
          .wdc-step-label { display: none; }
          .wdc-reset-row { flex-direction: column; }
        }

        /* Remove number input spinners */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
};

