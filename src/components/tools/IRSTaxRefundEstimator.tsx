import React, { useState } from 'react';

/**
 * IRSTaxRefundEstimator.tsx
 * IRS Tax Refund Estimator 2026 — Seniors Audit
 *
 * Purpose: A 4-step refund DECISION tool. Estimates federal tax liability,
 * compares to tax already paid, and shows whether the user expects a refund
 * or owes additional tax — with a plain-English explanation of why.
 *
 * Official Sources:
 *   IRS IR-2025-103 / Rev. Proc. 2025-32 (2026 brackets & standard deductions)
 *   IRS Publication 505 (Withholding & estimated tax)
 *   IRS Publication 915 (Social Security taxability — provisional income formula)
 *   IRS Publication 554 (Tax Guide for Seniors — additional standard deduction for age 65+)
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
    seniorAddOn: {
      single: 2050,
      joint:  1650,
      mfs:    1650,
      hoh:    2050,
      qss:    1650,
    },
    ss: {
      singleThreshold50: 25000,
      singleThreshold85: 34000,
      jointThreshold50:  32000,
      jointThreshold85:  44000,
    },
    ltcgRates: {
      single: [
        { max: 49450,  rate: 0.00 },
        { max: 545500, rate: 0.15 },
        { max: Infinity, rate: 0.20 },
      ],
      joint: [
        { max: 98900,  rate: 0.00 },
        { max: 613700, rate: 0.15 },
        { max: Infinity, rate: 0.20 },
      ],
      mfs: [
        { max: 49450,  rate: 0.00 },
        { max: 306850, rate: 0.15 },
        { max: Infinity, rate: 0.20 },
      ],
      hoh: [
        { max: 66200,  rate: 0.00 },
        { max: 579600, rate: 0.15 },
        { max: Infinity, rate: 0.20 },
      ],
      qss: [
        { max: 98900,  rate: 0.00 },
        { max: 613700, rate: 0.15 },
        { max: Infinity, rate: 0.20 },
      ],
    },
  },
} as const;

type FilingStatus = 'single' | 'joint' | 'mfs' | 'hoh' | 'qss';
type BracketSet = readonly { min: number; max: number; rate: number }[];
type LTCGSet = readonly { max: number; rate: number }[];

// ─── UTILITY ─────────────────────────────────────────────────────────────────

const n = (v: number | ''): number => (v === '' || isNaN(Number(v)) ? 0 : Math.max(0, Number(v)));
const fmt = (v: number): string => '$' + Math.abs(Math.round(v)).toLocaleString('en-US');

function calcTax(taxableIncome: number, brackets: BracketSet): number {
  let tax = 0;
  let remaining = Math.max(0, taxableIncome);
  for (const b of brackets) {
    if (remaining <= 0) break;
    const width = b.max - b.min;
    const inBand = Math.min(remaining, width);
    tax += inBand * b.rate;
    remaining -= inBand;
  }
  return Math.max(0, tax);
}

function calcLTCGTax(ltcg: number, ordinaryTaxableIncome: number, rates: LTCGSet): number {
  if (ltcg <= 0) return 0;
  let tax = 0;
  let remaining = ltcg;
  let stacked = Math.max(0, ordinaryTaxableIncome);
  for (const tier of rates) {
    if (remaining <= 0) break;
    const room = Math.max(0, tier.max - stacked);
    const inTier = Math.min(remaining, room);
    tax += inTier * tier.rate;
    remaining -= inTier;
    stacked += inTier;
  }
  return Math.max(0, tax);
}

function calcTaxableSS(
  annualSS: number,
  otherIncome: number,
  taxExemptInterest: number,
  status: FilingStatus
): number {
  if (annualSS <= 0) return 0;
  const rules = TAX_RULES[2026].ss;
  const provisional = otherIncome + taxExemptInterest + annualSS * 0.5;

  if (status === 'mfs') return Math.min(annualSS * 0.85, annualSS);

  const t50 = status === 'joint' ? rules.jointThreshold50 : rules.singleThreshold50;
  const t85 = status === 'joint' ? rules.jointThreshold85 : rules.singleThreshold85;

  if (provisional <= t50) return 0;
  if (provisional <= t85) return Math.min(0.5 * (provisional - t50), annualSS * 0.50);
  const tier1 = Math.min(0.5 * (t85 - t50), annualSS * 0.50);
  const tier2 = Math.min(0.85 * (provisional - t85), annualSS * 0.85 - tier1);
  return Math.min(tier1 + tier2, annualSS * 0.85);
}

// ─── STATE TYPES ─────────────────────────────────────────────────────────────

interface FilingInputs {
  status: FilingStatus;
  taxpayerAge65: boolean;
  spouseAge65: boolean;
}

interface IncomeInputs {
  wages: number | '';
  socialSecurity: number | '';
  pension: number | '';
  ira: number | '';
  fourOhOneK: number | '';
  rmd: number | '';
  interest: number | '';
  taxExemptInterest: number | '';
  dividends: number | '';
  capitalGains: number | '';
  other: number | '';
}

interface PaidInputs {
  withheldWages: number | '';
  withheldPension: number | '';
  withheldSS: number | '';
  withheldIRA: number | '';
  withheld401k: number | '';
  withheldOther: number | '';
  estimatedPayments: number | '';
}

interface DeductionInputs {
  method: 'standard' | 'itemized';
  medical: number | '';
  saltTaxes: number | '';
  mortgageInterest: number | '';
  charitable: number | '';
  otherItemized: number | '';
}

interface CreditInputs {
  childTaxCredit: number | '';
  otherCredits: number | '';
}

interface CalcResult {
  grossIncome: number;
  taxableSS: number;
  totalIncomeSubjectToTax: number;
  deduction: number;
  taxableIncome: number;
  estimatedTax: number;
  totalCredits: number;
  netTaxLiability: number;
  totalPaid: number;
  refundOrOwed: number;
  ssPercent: number;
  effectiveRate: number;
  marginalRate: number;
  deductionMethod: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export const IRSTaxRefundEstimator: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showMath, setShowMath] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);

  const [filing, setFiling] = useState<FilingInputs>({
    status: 'single',
    taxpayerAge65: false,
    spouseAge65: false,
  });

  const [income, setIncome] = useState<IncomeInputs>({
    wages: '', socialSecurity: '', pension: '', ira: '',
    fourOhOneK: '', rmd: '', interest: '', taxExemptInterest: '',
    dividends: '', capitalGains: '', other: '',
  });

  const [paid, setPaid] = useState<PaidInputs>({
    withheldWages: '', withheldPension: '', withheldSS: '',
    withheldIRA: '', withheld401k: '', withheldOther: '', estimatedPayments: '',
  });

  const [deductions, setDeductions] = useState<DeductionInputs>({
    method: 'standard', medical: '', saltTaxes: '',
    mortgageInterest: '', charitable: '', otherItemized: '',
  });

  const [credits, setCredits] = useState<CreditInputs>({
    childTaxCredit: '', otherCredits: '',
  });

  // ─── VALIDATE ──────────────────────────────────────────────────────────────

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 2) {
      const allZero = (Object.keys(income) as (keyof IncomeInputs)[])
        .filter(k => k !== 'taxExemptInterest')
        .every(k => n(income[k] as number | '') === 0);
      if (allZero) e['income'] = 'Please enter at least one income amount to calculate your estimate.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── CALCULATE ─────────────────────────────────────────────────────────────

  const calculate = () => {
    const rules = TAX_RULES[2026];
    const st = filing.status;

    const wages      = n(income.wages);
    const ss         = n(income.socialSecurity);
    const pension    = n(income.pension);
    const ira        = n(income.ira);
    const fourK      = n(income.fourOhOneK);
    const rmd        = n(income.rmd);
    const interest   = n(income.interest);
    const taxExInt   = n(income.taxExemptInterest);
    const dividends  = n(income.dividends);
    const capGains   = n(income.capitalGains);
    const other      = n(income.other);

    const grossIncome = wages + ss + pension + ira + fourK + rmd + interest + dividends + capGains + other;

    const otherForSS = wages + pension + ira + fourK + rmd + interest + dividends + capGains + other;
    const taxableSS = calcTaxableSS(ss, otherForSS, taxExInt, st);
    const ssPercent = ss > 0 ? Math.round((taxableSS / ss) * 100) : 0;

    const totalIncomeSubjectToTax = wages + taxableSS + pension + ira + fourK + rmd + interest + dividends + capGains + other;

    // Deduction calculation
    let baseSD = rules.standardDeduction[st];
    let seniorAdd = 0;
    if (filing.taxpayerAge65) seniorAdd += rules.seniorAddOn[st];
    if (filing.spouseAge65 && st === 'joint') seniorAdd += rules.seniorAddOn.joint;
    const standardDeduction = baseSD + seniorAdd;

    let itemizedTotal = 0;
    let deductionMethod = 'standard';
    if (deductions.method === 'itemized') {
      const agi = totalIncomeSubjectToTax;
      const medFloor = agi * 0.075;
      const medDeduct = Math.max(0, n(deductions.medical) - medFloor);
      const salt = Math.min(n(deductions.saltTaxes), 10000);
      itemizedTotal = medDeduct + salt + n(deductions.mortgageInterest) + n(deductions.charitable) + n(deductions.otherItemized);
      if (itemizedTotal > standardDeduction) {
        deductionMethod = 'itemized';
      }
    }
    const deduction = deductions.method === 'itemized' && itemizedTotal > standardDeduction
      ? itemizedTotal
      : standardDeduction;

    // Tax on ordinary income vs LTCG
    const ordinaryIncome = totalIncomeSubjectToTax - Math.max(0, capGains);
    const ordinaryTaxable = Math.max(0, ordinaryIncome - deduction);
    const deductionOnOrdinary = Math.min(deduction, ordinaryIncome);
    const remainingDeduction = Math.max(0, deduction - deductionOnOrdinary);
    const ltcgTaxable = Math.max(0, capGains - remainingDeduction);
    const taxableIncome = Math.max(0, totalIncomeSubjectToTax - deduction);

    const brackets = rules.brackets[st];
    const ordinaryTax = calcTax(ordinaryTaxable, brackets);
    const ltcgRates = rules.ltcgRates[st];
    const ltcgTax = calcLTCGTax(ltcgTaxable, ordinaryTaxable, ltcgRates);
    const estimatedTax = ordinaryTax + ltcgTax;

    // Credits
    const rawCredits = n(credits.childTaxCredit) + n(credits.otherCredits);
    const totalCredits = Math.min(estimatedTax, rawCredits);
    const netTaxLiability = Math.max(0, estimatedTax - totalCredits);

    // Already paid
    const totalPaid =
      n(paid.withheldWages) + n(paid.withheldPension) + n(paid.withheldSS) +
      n(paid.withheldIRA) + n(paid.withheld401k) + n(paid.withheldOther) +
      n(paid.estimatedPayments);

    const refundOrOwed = totalPaid - netTaxLiability;
    const effectiveRate = grossIncome > 0 ? (netTaxLiability / grossIncome) * 100 : 0;

    let marginalRate = brackets[0]?.rate ?? 0.10;
    for (const b of brackets) {
      if (taxableIncome > b.min) marginalRate = b.rate;
    }

    setResult({
      grossIncome, taxableSS, totalIncomeSubjectToTax, deduction,
      taxableIncome, estimatedTax, totalCredits, netTaxLiability,
      totalPaid, refundOrOwed, ssPercent, effectiveRate, marginalRate, deductionMethod,
    });
    setStep(5);
  };

  const next = () => {
    if (!validateStep(step)) return;
    if (step === 4) { calculate(); return; }
    setStep(s => Math.min(5, s + 1) as 1 | 2 | 3 | 4 | 5);
  };
  const back = () => setStep(s => Math.max(1, s - 1) as 1 | 2 | 3 | 4 | 5);
  const restart = () => { setStep(1); setResult(null); setShowMath(false); };

  // ─── EXPLANATIONS ─────────────────────────────────────────────────────────

  const getExplanation = (r: CalcResult): string => {
    const overpaid = r.totalPaid > r.netTaxLiability;
    if (overpaid) {
      if (r.totalPaid > r.netTaxLiability * 1.20) {
        return 'Your estimated refund is notably large because ' + fmt(r.totalPaid) + ' in federal tax payments exceeds your estimated ' + fmt(r.netTaxLiability) + ' liability. This over-withholding is an interest-free loan to the IRS — consider adjusting Form W-4P or W-4V to keep more money in your monthly checks during the year.';
      }
      return 'Your estimated refund of ' + fmt(r.refundOrOwed) + ' reflects that your total federal tax payments of ' + fmt(r.totalPaid) + ' are higher than your estimated federal tax liability of ' + fmt(r.netTaxLiability) + '.';
    }
    const owed = Math.abs(r.refundOrOwed);
    if (r.totalPaid === 0) {
      return 'You may owe ' + fmt(owed) + ' because no withholding or estimated tax payments were entered. Retirees without automatic withholding should make quarterly estimated payments using Form 1040-ES to avoid a large April balance and potential IRS underpayment penalties under IRC § 6654.';
    }
    return 'You may owe ' + fmt(owed) + ' because your estimated federal tax liability of ' + fmt(r.netTaxLiability) + ' exceeds the ' + fmt(r.totalPaid) + ' already paid through withholding and estimated payments. Increasing withholding on your pension (Form W-4P), Social Security (Form W-4V), or IRA (Form W-4R) can close this gap before year-end.';
  };

  const getSeniorInsight = (r: CalcResult): string | null => {
    const ss = n(income.socialSecurity);
    const pension = n(income.pension);
    const ira = n(income.ira) + n(income.fourOhOneK) + n(income.rmd);
    if (ss > 0 && r.ssPercent > 0) {
      return 'About ' + r.ssPercent + '% of your Social Security benefit — ' + fmt(r.taxableSS) + ' — is subject to federal income tax under the IRS Pub 915 provisional income formula. The taxable portion is not automatic; it depends on your total income from all sources combined. If your combined income stays below ' + (filing.status === 'joint' ? '$32,000' : '$25,000') + ', none of your Social Security benefit is taxable.';
    }
    if (pension > 0 && ss === 0) {
      return 'Your pension is a primary income source. Pension plan administrators typically calculate default withholding based only on the pension check, without any visibility into your other income. Submitting a revised Form W-4P to your plan is the most direct way to match withholding to your actual tax obligation.';
    }
    if (ira > 0 && pension === 0 && ss === 0) {
      return 'IRA and 401(k) distributions are generally fully taxable as ordinary income. The IRS default withholding on nonperiodic distributions is 10% (Form W-4R), which can be too low if your total income places you in a higher bracket. Review the marginal rate shown above and adjust accordingly.';
    }
    return null;
  };

  // ─── STYLES ───────────────────────────────────────────────────────────────

  const sty = {
    wrap:           { fontFamily: 'Georgia, serif', maxWidth: 680, margin: '0 auto', color: '#1a1a1a' } as React.CSSProperties,
    progress:       { display: 'flex', gap: 4, marginBottom: 24 } as React.CSSProperties,
    dot:            { flex: 1, height: 6, borderRadius: 3, background: '#e0e0e0' } as React.CSSProperties,
    dotActive:      { background: '#0A3D3A' } as React.CSSProperties,
    dotDone:        { background: '#C9933A' } as React.CSSProperties,
    stepTitle:      { fontSize: 20, fontWeight: 700, color: '#0A3D3A', marginBottom: 4 } as React.CSSProperties,
    stepSub:        { fontSize: 15, color: '#555', marginBottom: 20, fontFamily: 'sans-serif' } as React.CSSProperties,
    label:          { display: 'block', fontWeight: 600, fontSize: 16, marginBottom: 6, color: '#1a1a1a' } as React.CSSProperties,
    hint:           { fontSize: 13, color: '#666', marginBottom: 8, fontStyle: 'italic', fontFamily: 'sans-serif', display: 'block' } as React.CSSProperties,
    input:          { width: '100%', padding: '12px 14px', fontSize: 17, borderRadius: 6, border: '2px solid #ccc', boxSizing: 'border-box' as const, marginBottom: 16, fontFamily: 'Georgia, serif', color: '#1a1a1a', background: '#fafafa' } as React.CSSProperties,
    select:         { width: '100%', padding: '12px 14px', fontSize: 17, borderRadius: 6, border: '2px solid #ccc', boxSizing: 'border-box' as const, marginBottom: 16, fontFamily: 'Georgia, serif', color: '#1a1a1a', background: '#fafafa' } as React.CSSProperties,
    checkbox:       { width: 20, height: 20, marginRight: 10, accentColor: '#0A3D3A', cursor: 'pointer' } as React.CSSProperties,
    checkLabel:     { fontSize: 16, display: 'flex', alignItems: 'center', marginBottom: 14, cursor: 'pointer' } as React.CSSProperties,
    row:            { display: 'flex', gap: 16, flexWrap: 'wrap' as const } as React.CSSProperties,
    col:            { flex: '1 1 260px' } as React.CSSProperties,
    btnRow:         { display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' as const } as React.CSSProperties,
    btnPrimary:     { padding: '14px 32px', fontSize: 17, fontWeight: 700, borderRadius: 6, border: 'none', background: '#0A3D3A', color: '#fff', cursor: 'pointer', flex: '1 1 auto' } as React.CSSProperties,
    btnSecondary:   { padding: '14px 24px', fontSize: 16, borderRadius: 6, border: '2px solid #0A3D3A', background: '#fff', color: '#0A3D3A', cursor: 'pointer', fontWeight: 600 } as React.CSSProperties,
    btnOutline:     { padding: '12px 24px', fontSize: 15, borderRadius: 6, border: '2px solid #C9933A', background: '#fff', color: '#C9933A', cursor: 'pointer', fontWeight: 600 } as React.CSSProperties,
    sectionBox:     { background: '#f5f9f8', borderRadius: 10, padding: '20px 24px', marginBottom: 20, border: '1px solid #d4e5e3' } as React.CSSProperties,
    error:          { background: '#fff3cd', border: '1px solid #E8761A', borderRadius: 6, padding: '10px 14px', marginBottom: 12, fontSize: 14, color: '#7a3d00', fontFamily: 'sans-serif' } as React.CSSProperties,
    radioGroup:     { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 16 } as React.CSSProperties,
    radioOpt:       { flex: '1 1 140px', border: '2px solid #ccc', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', fontSize: 15, textAlign: 'center' as const, userSelect: 'none' as const } as React.CSSProperties,
    radioOptActive: { borderColor: '#0A3D3A', background: '#f0f8f7', fontWeight: 700, color: '#0A3D3A' } as React.CSSProperties,
    resultRefund:   { background: '#0A3D3A', borderRadius: 12, padding: '28px 24px', marginBottom: 20, textAlign: 'center' as const, color: '#fff' } as React.CSSProperties,
    resultOwed:     { background: '#6b2600', borderRadius: 12, padding: '28px 24px', marginBottom: 20, textAlign: 'center' as const, color: '#fff' } as React.CSSProperties,
    resultLabel:    { fontSize: 15, textTransform: 'uppercase' as const, letterSpacing: 1, opacity: 0.85, fontFamily: 'sans-serif', marginBottom: 8 } as React.CSSProperties,
    resultAmount:   { fontSize: 52, fontWeight: 700, color: '#C9933A', lineHeight: 1.1 } as React.CSSProperties,
    resultSub:      { fontSize: 14, opacity: 0.85, marginTop: 8, fontFamily: 'sans-serif' } as React.CSSProperties,
    table:          { width: '100%', borderCollapse: 'collapse' as const, fontSize: 15, marginTop: 4 } as React.CSSProperties,
    th:             { background: '#0A3D3A', color: '#fff', padding: '10px 14px', textAlign: 'left' as const, fontWeight: 600 } as React.CSSProperties,
    thR:            { background: '#0A3D3A', color: '#fff', padding: '10px 14px', textAlign: 'right' as const, fontWeight: 600 } as React.CSSProperties,
    td:             { padding: '10px 14px', borderBottom: '1px solid #e0e0e0' } as React.CSSProperties,
    tdR:            { padding: '10px 14px', borderBottom: '1px solid #e0e0e0', textAlign: 'right' as const, fontFamily: 'monospace' } as React.CSSProperties,
    trAlt:          { background: '#f0f8f7' } as React.CSSProperties,
    insightBox:     { background: '#fffbf0', border: '2px solid #C9933A', borderRadius: 8, padding: '16px 20px', marginBottom: 16, fontSize: 15, color: '#3d2b00', fontFamily: 'sans-serif', lineHeight: 1.6 } as React.CSSProperties,
    warningBox:     { background: '#fff8f0', border: '2px solid #E8761A', borderRadius: 8, padding: '16px 20px', marginBottom: 16, fontSize: 14, color: '#4a2000', fontFamily: 'sans-serif', lineHeight: 1.6 } as React.CSSProperties,
    trackBox:       { border: '2px solid #0A3D3A', borderRadius: 8, padding: '20px', marginTop: 20, background: '#f5f9f8', fontFamily: 'sans-serif' } as React.CSSProperties,
    disclaimer:     { background: '#071C1A', borderRadius: 8, padding: '16px 20px', marginTop: 20, fontSize: 13, color: '#ccc', fontFamily: 'sans-serif', lineHeight: 1.6 } as React.CSSProperties,
    toggleBtn:      { background: 'none', border: 'none', color: '#0A3D3A', fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '8px 0', textDecoration: 'underline', fontFamily: 'Georgia, serif' } as React.CSSProperties,
    rateCard:       { flex: '1 1 140px', background: '#f5f9f8', border: '1px solid #d4e5e3', borderRadius: 8, padding: '12px 16px', textAlign: 'center' as const } as React.CSSProperties,
  };

  // ─── STANDARD DEDUCTION DISPLAY ──────────────────────────────────────────

  const stdDisplay = () => {
    const r = TAX_RULES[2026];
    let base = r.standardDeduction[filing.status];
    if (filing.taxpayerAge65) base += r.seniorAddOn[filing.status];
    if (filing.spouseAge65 && filing.status === 'joint') base += r.seniorAddOn.joint;
    return fmt(base);
  };

  // ─── STEPS ───────────────────────────────────────────────────────────────

  const renderProgress = () => (
    <div style={sty.progress} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
      {([1,2,3,4] as const).map(i => (
        <div key={i} style={{ ...sty.dot, ...(i < step ? sty.dotDone : {}), ...(i === step ? sty.dotActive : {}) }} />
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <div style={sty.stepTitle}>Step 1 of 4 — Filing Status & Age</div>
      <div style={sty.stepSub}>Your filing status and age determine your 2026 tax brackets and standard deduction.</div>

      <label style={sty.label} htmlFor="filing-status">Filing Status</label>
      <select id="filing-status" style={sty.select}
        value={filing.status} onChange={e => setFiling(f => ({ ...f, status: e.target.value as FilingStatus }))}>
        <option value="single">Single</option>
        <option value="joint">Married Filing Jointly</option>
        <option value="mfs">Married Filing Separately</option>
        <option value="hoh">Head of Household</option>
        <option value="qss">Qualifying Surviving Spouse</option>
      </select>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#0A3D3A' }}>Additional Standard Deduction for Age 65+</div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif', marginBottom: 12 }}>
          Under IRS Publication 554, taxpayers who are 65 or older receive an additional standard deduction —
          {filing.status === 'joint' ? ' $1,650 per qualifying spouse' : ' $2,050'} for the 2026 tax year.
        </p>
        <label style={sty.checkLabel}>
          <input type="checkbox" style={sty.checkbox} checked={filing.taxpayerAge65}
            onChange={e => setFiling(f => ({ ...f, taxpayerAge65: e.target.checked }))} />
          I am age 65 or older (or will turn 65 during 2026)
        </label>
        {filing.status === 'joint' && (
          <label style={sty.checkLabel}>
            <input type="checkbox" style={sty.checkbox} checked={filing.spouseAge65}
              onChange={e => setFiling(f => ({ ...f, spouseAge65: e.target.checked }))} />
            My spouse is age 65 or older (or will turn 65 during 2026)
          </label>
        )}
      </div>

      <div style={sty.btnRow}>
        <button style={sty.btnPrimary} onClick={next}>Continue to Income →</button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={sty.stepTitle}>Step 2 of 4 — Income</div>
      <div style={sty.stepSub}>Enter your annual 2026 income amounts. Leave any category blank that does not apply.</div>
      {errors['income'] && <div style={sty.error}>{errors['income']}</div>}

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 10 }}>Employment Income</div>
        <label style={sty.label} htmlFor="wages">Wages, Salaries, Tips</label>
        <input id="wages" type="number" min="0" style={sty.input} placeholder="0" value={income.wages}
          onChange={e => setIncome(i => ({ ...i, wages: e.target.value === '' ? '' : +e.target.value }))} />
      </div>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 6 }}>Social Security Benefits</div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif', marginBottom: 10 }}>
          Enter the <strong>total annual benefit from your SSA-1099 Box 5</strong>. The calculator applies the IRS Pub 915
          provisional income formula — not every dollar of Social Security is taxable.
        </p>
        <label style={sty.label} htmlFor="ss-income">Total Annual Social Security Benefit</label>
        <input id="ss-income" type="number" min="0" style={sty.input} placeholder="0" value={income.socialSecurity}
          onChange={e => setIncome(i => ({ ...i, socialSecurity: e.target.value === '' ? '' : +e.target.value }))} />
        <label style={sty.label} htmlFor="tax-exempt-int">Tax-Exempt Interest <span style={{ fontWeight: 400, color: '#666' }}>(municipal bonds, etc.)</span></label>
        <span style={sty.hint}>Not taxable income, but counted in the Social Security provisional income formula (IRS Pub 915).</span>
        <input id="tax-exempt-int" type="number" min="0" style={sty.input} placeholder="0" value={income.taxExemptInterest}
          onChange={e => setIncome(i => ({ ...i, taxExemptInterest: e.target.value === '' ? '' : +e.target.value }))} />
      </div>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 10 }}>Retirement Account Income</div>
        <div style={sty.row}>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="pension-inc">Pension / Annuity Income</label>
            <input id="pension-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.pension}
              onChange={e => setIncome(i => ({ ...i, pension: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="ira-inc">Traditional IRA Withdrawals</label>
            <input id="ira-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.ira}
              onChange={e => setIncome(i => ({ ...i, ira: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        </div>
        <div style={sty.row}>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="fourk-inc">401(k) / 403(b) Distributions</label>
            <input id="fourk-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.fourOhOneK}
              onChange={e => setIncome(i => ({ ...i, fourOhOneK: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="rmd-inc">Required Minimum Distributions (RMDs)</label>
            <input id="rmd-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.rmd}
              onChange={e => setIncome(i => ({ ...i, rmd: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif', margin: '4px 0 0' }}>
          <strong>Do not include Roth IRA distributions</strong> — qualified Roth withdrawals are tax-free and do not affect this estimate.
        </p>
      </div>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 10 }}>Investment & Other Income</div>
        <div style={sty.row}>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="int-inc">Taxable Interest</label>
            <input id="int-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.interest}
              onChange={e => setIncome(i => ({ ...i, interest: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="div-inc">Ordinary Dividends</label>
            <input id="div-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.dividends}
              onChange={e => setIncome(i => ({ ...i, dividends: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        </div>
        <div style={sty.row}>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="ltcg-inc">Net Long-Term Capital Gains</label>
            <span style={sty.hint}>Investments held over 12 months. Taxed at preferential LTCG rates (0%, 15%, or 20%).</span>
            <input id="ltcg-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.capitalGains}
              onChange={e => setIncome(i => ({ ...i, capitalGains: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="other-inc">Other Taxable Income</label>
            <input id="other-inc" type="number" min="0" style={sty.input} placeholder="0" value={income.other}
              onChange={e => setIncome(i => ({ ...i, other: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        </div>
      </div>

      <div style={sty.btnRow}>
        <button style={sty.btnSecondary} onClick={back}>← Back</button>
        <button style={sty.btnPrimary} onClick={next}>Continue to Tax Paid →</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div style={sty.stepTitle}>Step 3 of 4 — Federal Tax Already Paid</div>
      <div style={sty.stepSub}>
        Enter tax withheld from each income source and any quarterly estimated payments made to the IRS.
        Find these amounts on your W-2 (Box 2), 1099-R (Box 4), and SSA-1099 (Box 6).
      </div>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 10 }}>Federal Income Tax Withheld</div>
        <div style={sty.row}>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="wh-wages">From Wages (W-2, Box 2)</label>
            <input id="wh-wages" type="number" min="0" style={sty.input} placeholder="0" value={paid.withheldWages}
              onChange={e => setPaid(p => ({ ...p, withheldWages: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="wh-pension">From Pension (1099-R, Box 4)</label>
            <input id="wh-pension" type="number" min="0" style={sty.input} placeholder="0" value={paid.withheldPension}
              onChange={e => setPaid(p => ({ ...p, withheldPension: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        </div>
        <div style={sty.row}>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="wh-ss">From Social Security (SSA-1099, Box 6)</label>
            <input id="wh-ss" type="number" min="0" style={sty.input} placeholder="0" value={paid.withheldSS}
              onChange={e => setPaid(p => ({ ...p, withheldSS: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="wh-ira">From IRA / 401(k) (1099-R, Box 4)</label>
            <input id="wh-ira" type="number" min="0" style={sty.input} placeholder="0" value={paid.withheldIRA}
              onChange={e => setPaid(p => ({ ...p, withheldIRA: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        </div>
        <label style={sty.label} htmlFor="wh-other">Other Federal Tax Withheld</label>
        <input id="wh-other" type="number" min="0" style={sty.input} placeholder="0" value={paid.withheldOther}
          onChange={e => setPaid(p => ({ ...p, withheldOther: e.target.value === '' ? '' : +e.target.value }))} />
      </div>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 6 }}>Quarterly Estimated Tax Payments (Form 1040-ES)</div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif', marginBottom: 10 }}>
          If you made direct payments to the IRS during 2026, enter the <strong>total of all four payments</strong>.
        </p>
        <label style={sty.label} htmlFor="est-pay">Total Estimated Tax Payments</label>
        <input id="est-pay" type="number" min="0" style={sty.input} placeholder="0" value={paid.estimatedPayments}
          onChange={e => setPaid(p => ({ ...p, estimatedPayments: e.target.value === '' ? '' : +e.target.value }))} />
      </div>

      <div style={sty.btnRow}>
        <button style={sty.btnSecondary} onClick={back}>← Back</button>
        <button style={sty.btnPrimary} onClick={next}>Continue to Deductions →</button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <div style={sty.stepTitle}>Step 4 of 4 — Deductions & Credits</div>
      <div style={sty.stepSub}>Choose your deduction method. Most retirees benefit from the standard deduction.</div>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 12 }}>Deduction Method</div>
        <div style={sty.radioGroup}>
          {[
            { val: 'standard', label: 'Standard Deduction (' + stdDisplay() + ')' },
            { val: 'itemized', label: 'Itemized Deductions' },
          ].map(opt => (
            <div key={opt.val} role="radio" tabIndex={0} aria-checked={deductions.method === opt.val}
              style={{ ...sty.radioOpt, ...(deductions.method === opt.val ? sty.radioOptActive : {}) }}
              onClick={() => setDeductions(d => ({ ...d, method: opt.val as 'standard' | 'itemized' }))}
              onKeyDown={e => e.key === 'Enter' && setDeductions(d => ({ ...d, method: opt.val as 'standard' | 'itemized' }))}>
              {opt.label}
            </div>
          ))}
        </div>

        {deductions.method === 'itemized' && (
          <div>
            <p style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif', marginBottom: 14 }}>
              Medical expenses are deductible above 7.5% of AGI. State and local taxes are capped at $10,000.
              If your itemized total is less than your standard deduction, the calculator uses the standard deduction.
            </p>
            <div style={sty.row}>
              <div style={sty.col}>
                <label style={sty.label} htmlFor="ded-med">Medical & Dental Expenses (total paid)</label>
                <span style={sty.hint}>Only the amount above 7.5% of your AGI is deductible.</span>
                <input id="ded-med" type="number" min="0" style={sty.input} placeholder="0" value={deductions.medical}
                  onChange={e => setDeductions(d => ({ ...d, medical: e.target.value === '' ? '' : +e.target.value }))} />
              </div>
              <div style={sty.col}>
                <label style={sty.label} htmlFor="ded-salt">State & Local Taxes (SALT)</label>
                <span style={sty.hint}>Capped at $10,000 under current law.</span>
                <input id="ded-salt" type="number" min="0" style={sty.input} placeholder="0" value={deductions.saltTaxes}
                  onChange={e => setDeductions(d => ({ ...d, saltTaxes: e.target.value === '' ? '' : +e.target.value }))} />
              </div>
            </div>
            <div style={sty.row}>
              <div style={sty.col}>
                <label style={sty.label} htmlFor="ded-mort">Mortgage Interest</label>
                <input id="ded-mort" type="number" min="0" style={sty.input} placeholder="0" value={deductions.mortgageInterest}
                  onChange={e => setDeductions(d => ({ ...d, mortgageInterest: e.target.value === '' ? '' : +e.target.value }))} />
              </div>
              <div style={sty.col}>
                <label style={sty.label} htmlFor="ded-char">Charitable Contributions</label>
                <input id="ded-char" type="number" min="0" style={sty.input} placeholder="0" value={deductions.charitable}
                  onChange={e => setDeductions(d => ({ ...d, charitable: e.target.value === '' ? '' : +e.target.value }))} />
              </div>
            </div>
            <label style={sty.label} htmlFor="ded-other">Other Itemized Deductions</label>
            <input id="ded-other" type="number" min="0" style={sty.input} placeholder="0" value={deductions.otherItemized}
              onChange={e => setDeductions(d => ({ ...d, otherItemized: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        )}
      </div>

      <div style={sty.sectionBox}>
        <div style={{ fontWeight: 600, color: '#0A3D3A', marginBottom: 6 }}>Tax Credits <span style={{ fontWeight: 400, fontSize: 14 }}>(optional)</span></div>
        <p style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif', marginBottom: 14 }}>
          Credits reduce your tax liability dollar-for-dollar. Only include credits you are confident you qualify for.
          Full eligibility requirements are set by the IRS and may be beyond the scope of this estimator.
        </p>
        <div style={sty.row}>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="cred-child">Child / Dependent Care Credit</label>
            <input id="cred-child" type="number" min="0" style={sty.input} placeholder="0" value={credits.childTaxCredit}
              onChange={e => setCredits(c => ({ ...c, childTaxCredit: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
          <div style={sty.col}>
            <label style={sty.label} htmlFor="cred-other">Other Federal Tax Credits</label>
            <input id="cred-other" type="number" min="0" style={sty.input} placeholder="0" value={credits.otherCredits}
              onChange={e => setCredits(c => ({ ...c, otherCredits: e.target.value === '' ? '' : +e.target.value }))} />
          </div>
        </div>
      </div>

      <div style={sty.btnRow}>
        <button style={sty.btnSecondary} onClick={back}>← Back</button>
        <button style={sty.btnPrimary} onClick={next}>Calculate My Estimate →</button>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;
    const r = result;
    const isRefund = r.refundOrOwed >= 0;
    const seniorInsight = getSeniorInsight(r);
    const bigOwed = !isRefund && Math.abs(r.refundOrOwed) >= 1000;

    return (
      <div>
        <div style={isRefund ? sty.resultRefund : sty.resultOwed}>
          <div style={sty.resultLabel}>{isRefund ? 'Estimated Federal Refund' : 'Estimated Federal Tax Owed'}</div>
          <div style={sty.resultAmount}>{fmt(Math.abs(r.refundOrOwed))}</div>
          <div style={sty.resultSub}>
            {isRefund
              ? 'Your federal tax payments appear to exceed your estimated federal tax liability.'
              : 'Your estimated tax liability appears to exceed your federal payments so far.'}
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ ...sty.sectionBox, padding: '4px 0 0' }}>
          <table style={sty.table} aria-label="Tax estimate breakdown">
            <thead>
              <tr>
                <th style={sty.th}>Calculation Item</th>
                <th style={sty.thR}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={sty.td}>Total gross income</td><td style={sty.tdR}>{fmt(r.grossIncome)}</td></tr>
              {n(income.socialSecurity) > 0 && (
                <tr style={sty.trAlt}>
                  <td style={sty.td}>Taxable Social Security ({r.ssPercent}% of benefit — IRS Pub 915)</td>
                  <td style={sty.tdR}>{fmt(r.taxableSS)}</td>
                </tr>
              )}
              <tr><td style={sty.td}>Income subject to federal tax</td><td style={sty.tdR}>{fmt(r.totalIncomeSubjectToTax)}</td></tr>
              <tr style={sty.trAlt}>
                <td style={sty.td}>{r.deductionMethod === 'itemized' ? 'Itemized deduction (used — larger than standard)' : '2026 standard deduction (includes senior add-on)'}</td>
                <td style={sty.tdR}>− {fmt(r.deduction)}</td>
              </tr>
              <tr><td style={{ ...sty.td, fontWeight: 700 }}>Taxable income</td><td style={{ ...sty.tdR, fontWeight: 700 }}>{fmt(r.taxableIncome)}</td></tr>
              <tr style={sty.trAlt}><td style={sty.td}>Estimated federal income tax (2026 brackets — IR-2025-103)</td><td style={sty.tdR}>{fmt(r.estimatedTax)}</td></tr>
              {r.totalCredits > 0 && (
                <tr><td style={sty.td}>Tax credits applied</td><td style={sty.tdR}>− {fmt(r.totalCredits)}</td></tr>
              )}
              <tr><td style={{ ...sty.td, fontWeight: 700 }}>Net federal tax liability</td><td style={{ ...sty.tdR, fontWeight: 700 }}>{fmt(r.netTaxLiability)}</td></tr>
              <tr style={sty.trAlt}><td style={sty.td}>Federal tax already paid (withholding + estimated payments)</td><td style={sty.tdR}>{fmt(r.totalPaid)}</td></tr>
              <tr>
                <td style={{ ...sty.td, fontWeight: 700, color: isRefund ? '#0A3D3A' : '#6b2600', borderTop: '2px solid #0A3D3A' }}>
                  {isRefund ? 'Estimated Refund' : 'Estimated Amount Owed'}
                </td>
                <td style={{ ...sty.tdR, fontWeight: 700, color: isRefund ? '#0A3D3A' : '#6b2600', borderTop: '2px solid #0A3D3A' }}>
                  {fmt(Math.abs(r.refundOrOwed))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rate cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 16 }}>
          <div style={sty.rateCard}>
            <div style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif' }}>Effective Tax Rate</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0A3D3A' }}>{r.effectiveRate.toFixed(1)}%</div>
          </div>
          <div style={sty.rateCard}>
            <div style={{ fontSize: 13, color: '#555', fontFamily: 'sans-serif' }}>Marginal Tax Bracket</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0A3D3A' }}>{(r.marginalRate * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Why */}
        <div style={sty.insightBox}>
          <strong style={{ display: 'block', marginBottom: 6 }}>Why you got this result</strong>
          {getExplanation(r)}
        </div>

        {/* Senior insight */}
        {seniorInsight && (
          <div style={sty.insightBox}>
            <strong style={{ display: 'block', marginBottom: 6 }}>What this means for your retirement income</strong>
            {seniorInsight}
          </div>
        )}

        {/* Underpayment warning */}
        {bigOwed && (
          <div style={sty.warningBox}>
            <strong>Potential IRS Underpayment Penalty</strong><br />
            If you owe more than $1,000 and did not pay at least 90% of your 2026 tax or 100% of your 2025 tax
            during the year, the IRS may charge an underpayment penalty under IRC § 6654. Increasing withholding
            or making a fourth-quarter estimated payment before January 15, 2027 can reduce or eliminate this.
          </div>
        )}

        {/* How we estimated this */}
        <button style={sty.toggleBtn} onClick={() => setShowMath(!showMath)} aria-expanded={showMath}>
          {showMath ? '▲ Hide the math' : '▼ How we estimated this'}
        </button>
        {showMath && (
          <div style={{ ...sty.sectionBox, marginTop: 8, fontSize: 14, fontFamily: 'sans-serif', lineHeight: 1.7 }}>
            <p><strong>Step 1 — Gross income:</strong> All income categories added together = {fmt(r.grossIncome)}</p>
            {n(income.socialSecurity) > 0 && (
              <p><strong>Step 2 — Taxable Social Security:</strong> Applied IRS Pub 915 provisional income formula
              (other income + tax-exempt interest + 50% of SS). Result: {r.ssPercent}% of SS is taxable = {fmt(r.taxableSS)}</p>
            )}
            <p><strong>Step 3 — Income subject to tax:</strong> Replaces full SS amount with taxable portion = {fmt(r.totalIncomeSubjectToTax)}</p>
            <p><strong>Step 4 — Deduction:</strong> {r.deductionMethod === 'itemized'
              ? 'Itemized deductions exceeded standard deduction'
              : '2026 standard deduction from IRS IR-2025-103 (includes senior add-on if applicable)'} = {fmt(r.deduction)}</p>
            <p><strong>Step 5 — Taxable income:</strong> {fmt(r.totalIncomeSubjectToTax)} − {fmt(r.deduction)} = {fmt(r.taxableIncome)}</p>
            <p><strong>Step 6 — Federal tax:</strong> Applied official 2026 {filing.status} filing status brackets from IRS IR-2025-103 / Rev. Proc. 2025-32 = {fmt(r.estimatedTax)}</p>
            {r.totalCredits > 0 && <p><strong>Step 7 — Credits:</strong> Subtracted {fmt(r.totalCredits)} = net liability {fmt(r.netTaxLiability)}</p>}
            <p><strong>Step {r.totalCredits > 0 ? '8' : '7'} — Already paid:</strong> Withholding + estimated payments = {fmt(r.totalPaid)}</p>
            <p><strong>Result:</strong> {fmt(r.totalPaid)} paid − {fmt(r.netTaxLiability)} owed = <strong>{isRefund ? (fmt(r.refundOrOwed) + ' estimated refund') : (fmt(Math.abs(r.refundOrOwed)) + ' estimated amount owed')}</strong></p>
          </div>
        )}

        {/* Estimate vs. Track */}
        <div style={sty.trackBox}>
          <div style={{ fontWeight: 700, color: '#0A3D3A', fontSize: 16, marginBottom: 8 }}>Estimating vs. Tracking Your Refund</div>
          <p style={{ fontSize: 14, margin: '0 0 10px', lineHeight: 1.6 }}>
            <strong>This tool estimates</strong> whether you may receive a refund — based on the income, withholding, and deductions you entered.
            It does not have access to your IRS account, your filed tax return, or your actual refund processing status.
          </p>
          <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Once you file your return, track the actual status at the official IRS{' '}
            <a href="https://www.irs.gov/refunds" target="_blank" rel="noopener noreferrer"
              style={{ color: '#0A3D3A', fontWeight: 600 }}>
              Where's My Refund?
            </a>{' '}
            tool at irs.gov/refunds — available 24 hours after e-filing.
          </p>
        </div>

        <div style={sty.disclaimer}>
          <strong>Educational estimate only.</strong> This tool provides an approximate estimate for educational purposes — not an official IRS tax calculation or a tax filing. Your actual refund or amount owed may differ based on additional income, deductions, credits, IRS adjustments, or tax situations not captured here. Consult official IRS resources at irs.gov or a qualified tax professional for your specific circumstances.
        </div>

        <div style={{ ...sty.btnRow, marginTop: 20 }}>
          <button style={sty.btnSecondary} onClick={back}>← Adjust Inputs</button>
          <button style={sty.btnOutline} onClick={restart}>Start Over</button>
        </div>
      </div>
    );
  };

  // ─── ROOT ─────────────────────────────────────────────────────────────────

  return (
    <div style={sty.wrap}>
      {step < 5 && renderProgress()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderResults()}
    </div>
  );
};