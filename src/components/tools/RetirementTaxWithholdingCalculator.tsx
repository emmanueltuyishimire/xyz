import React, { useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { ResultsPanel } from './ResultsPanel';

/**
 * RetirementTaxWithholdingCalculator.tsx
 * Estimates federal income tax withholding on retirement distributions.
 * Based on IRS Publication 15-T and Forms W-4P / W-4R.
 */

// 2026 federal tax brackets (single filer)
const TAX_BRACKETS_SINGLE = [
  { min: 0, max: 12400, rate: 0.10 },
  { min: 12400, max: 50400, rate: 0.12 },
  { min: 50400, max: 105700, rate: 0.22 },
  { min: 105700, max: 201775, rate: 0.24 },
  { min: 201775, max: 256225, rate: 0.32 },
  { min: 256225, max: 640600, rate: 0.35 },
  { min: 640600, max: Infinity, rate: 0.37 },
];

// 2026 federal tax brackets (married filing jointly)
const TAX_BRACKETS_JOINT = [
  { min: 0, max: 24800, rate: 0.10 },
  { min: 24800, max: 100800, rate: 0.12 },
  { min: 100800, max: 211400, rate: 0.22 },
  { min: 211400, max: 403550, rate: 0.24 },
  { min: 403550, max: 512450, rate: 0.32 },
  { min: 512450, max: 768600, rate: 0.35 },
  { min: 768600, max: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION_SINGLE = 16100;
const STANDARD_DEDUCTION_JOINT = 32200;

function calculateTax(taxableIncome: number, brackets: typeof TAX_BRACKETS_SINGLE): number {
  let tax = 0;
  let remaining = Math.max(0, taxableIncome);
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, bracket.max - bracket.min);
    tax += taxable * bracket.rate;
    remaining -= taxable;
  }
  return tax;
}

interface WithholdingResult {
  effectiveTaxRate: number;
  estimatedAnnualTax: number;
  suggestedMonthlyWithholding: number;
  defaultWithholding10Pct: number;
  marginalRate: number;
}

export const RetirementTaxWithholdingCalculator: React.FC = () => {
  const [annualIncome, setAnnualIncome] = useState<number | ''>('');
  const [filingStatus, setFilingStatus] = useState<'single' | 'joint'>('single');
  const [result, setResult] = useState<WithholdingResult | null>(null);
  const [errors, setErrors] = useState<{ income?: string }>({});

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (annualIncome === '' || Number(annualIncome) <= 0) {
      setErrors({ income: 'Enter your estimated total annual retirement income.' });
      setResult(null);
      return;
    }
    setErrors({});

    const income = Number(annualIncome);
    const standardDeduction = filingStatus === 'joint' ? STANDARD_DEDUCTION_JOINT : STANDARD_DEDUCTION_SINGLE;
    const brackets = filingStatus === 'joint' ? TAX_BRACKETS_JOINT : TAX_BRACKETS_SINGLE;
    const taxableIncome = Math.max(0, income - standardDeduction);
    const estimatedAnnualTax = calculateTax(taxableIncome, brackets);
    const effectiveTaxRate = income > 0 ? (estimatedAnnualTax / income) * 100 : 0;

    // Marginal rate
    let marginalRate = 0.10;
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) marginalRate = bracket.rate;
    }

    setResult({
      effectiveTaxRate,
      estimatedAnnualTax,
      suggestedMonthlyWithholding: estimatedAnnualTax / 12,
      defaultWithholding10Pct: income * 0.10 / 12,
      marginalRate,
    });
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="withholding-wrapper">
      <form onSubmit={calculate} className="calc-form">
        <div className="calc-field-group">
          <label htmlFor="filing-status-w" className="calc-label">Tax Filing Status</label>
          <select id="filing-status-w" value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as 'single' | 'joint')} className="calc-select">
            <option value="single">Single / Married Filing Separately</option>
            <option value="joint">Married Filing Jointly</option>
          </select>
        </div>

        <MoneyInput
          id="annual-income"
          label="Estimated Total Annual Retirement Income"
          value={annualIncome}
          onChange={(val) => setAnnualIncome(val === '' ? '' : Number(val))}
          placeholder="Enter your annual income (e.g., 65,000)"
          helpText="Include pension payments, IRA/401(k) withdrawals, and Social Security income (if taxable). Exclude Roth IRA distributions."
          error={errors.income}
          min={1}
          required
        />

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate Withholding
        </button>
      </form>

      {result && (
        <ResultsPanel
          title="Estimated Tax Withholding"
          primaryLabel="Suggested Monthly Withholding"
          primaryValue={formatCurrency(result.suggestedMonthlyWithholding)}
          variant="info"
        >
          <div style={{ maxWidth: '100%' }}>
            <div className="rmd-summary-grid">
              <div className="rmd-summary-item">
                <span className="rmd-item-label">Estimated Annual Tax</span>
                <strong>{formatCurrency(result.estimatedAnnualTax)}</strong>
              </div>
              <div className="rmd-summary-item">
                <span className="rmd-item-label">Effective Tax Rate</span>
                <strong>{result.effectiveTaxRate.toFixed(1)}%</strong>
              </div>
              <div className="rmd-summary-item">
                <span className="rmd-item-label">Marginal (Top) Rate</span>
                <strong>{(result.marginalRate * 100).toFixed(0)}%</strong>
              </div>
              <div className="rmd-summary-item">
                <span className="rmd-item-label">Default 10% Withholding/mo</span>
                <strong>{formatCurrency(result.defaultWithholding10Pct)}</strong>
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '100%', marginTop: 'var(--space-3)' }}>
              This estimate uses 2026 standard deductions and tax brackets. Actual tax owed may differ based on deductions, credits, and other income sources. Consult a tax professional for your specific situation.
            </p>
          </div>
        </ResultsPanel>
      )}

      <style>{`
        .rmd-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); background: var(--color-surface-alt); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-4); }
        .rmd-summary-item { display: flex; flex-direction: column; gap: 2px; }
        .rmd-item-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        @media (max-width: 500px) { .rmd-summary-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
