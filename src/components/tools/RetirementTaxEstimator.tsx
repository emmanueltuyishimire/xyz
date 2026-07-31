import React, { useState, useId } from 'react';

/**
 * RetirementTaxEstimator.tsx
 * Tool: Retirement Tax Estimator
 * Primary keyword: retirement tax estimator
 */

export type FilingStatus = 'single' | 'joint';

interface TaxResult {
  totalGrossIncome: number;
  taxableSocialSecurity: number;
  provisionalIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  estimatedFederalTax: number;
  effectiveTaxRate: number;
  checklist: string[];
}

export const RetirementTaxEstimator: React.FC = () => {
  const uid = useId();

  const [ssIncomeStr, setSsIncomeStr] = useState<string>('24000');
  const [iraWithdrawalsStr, setIraWithdrawalsStr] = useState<string>('25000');
  const [pensionIncomeStr, setPensionIncomeStr] = useState<string>('12000');
  const [interestIncomeStr, setInterestIncomeStr] = useState<string>('2000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [ageOver65, setAgeOver65] = useState<boolean>(true);

  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const ssIncome = Math.max(0, parseFloat(ssIncomeStr.replace(/[^0-9.]/g, '')) || 0);
    const iraWithdrawals = Math.max(0, parseFloat(iraWithdrawalsStr.replace(/[^0-9.]/g, '')) || 0);
    const pensionIncome = Math.max(0, parseFloat(pensionIncomeStr.replace(/[^0-9.]/g, '')) || 0);
    const interestIncome = Math.max(0, parseFloat(interestIncomeStr.replace(/[^0-9.]/g, '')) || 0);

    const totalGrossIncome = ssIncome + iraWithdrawals + pensionIncome + interestIncome;

    // Provisional Income = AGI (excluding SS) + Tax-Exempt Interest + 50% of Social Security
    const nonSsIncome = iraWithdrawals + pensionIncome + interestIncome;
    const provisionalIncome = nonSsIncome + ssIncome * 0.5;

    // Social Security Taxability Calculation (2026 thresholds):
    // Single: $25k-$34k -> up to 50%, >$34k -> up to 85%
    // Joint: $32k-$44k -> up to 50%, >$44k -> up to 85%
    let taxableSsRatio = 0;
    if (filingStatus === 'single') {
      if (provisionalIncome > 34000) taxableSsRatio = 0.85;
      else if (provisionalIncome > 25000) taxableSsRatio = 0.50;
    } else {
      if (provisionalIncome > 44000) taxableSsRatio = 0.85;
      else if (provisionalIncome > 32000) taxableSsRatio = 0.50;
    }

    const taxableSocialSecurity = Math.min(ssIncome * 0.85, ssIncome * taxableSsRatio);
    const grossTaxableBeforeDeduction = nonSsIncome + taxableSocialSecurity;

    // 2026 Standard Deduction Estimates (including extra $1,600/$2,000 for age 65+):
    let baseDeduction = filingStatus === 'single' ? 15000 : 30000;
    if (ageOver65) {
      baseDeduction += filingStatus === 'single' ? 2000 : 3200; // Extra deduction for 65+
    }
    const standardDeduction = baseDeduction;

    const taxableIncome = Math.max(0, grossTaxableBeforeDeduction - standardDeduction);

    // 2026 Federal Progressive Income Tax Brackets (Single / Joint estimates):
    let estimatedFederalTax = 0;
    if (filingStatus === 'single') {
      if (taxableIncome > 103350) {
        estimatedFederalTax = 18182 + (taxableIncome - 103350) * 0.24;
      } else if (taxableIncome > 48475) {
        estimatedFederalTax = 5696 + (taxableIncome - 48475) * 0.22;
      } else if (taxableIncome > 11925) {
        estimatedFederalTax = 1192.5 + (taxableIncome - 11925) * 0.12;
      } else {
        estimatedFederalTax = taxableIncome * 0.10;
      }
    } else {
      if (taxableIncome > 206700) {
        estimatedFederalTax = 36364 + (taxableIncome - 206700) * 0.24;
      } else if (taxableIncome > 96950) {
        estimatedFederalTax = 11392 + (taxableIncome - 96950) * 0.22;
      } else if (taxableIncome > 23850) {
        estimatedFederalTax = 2385 + (taxableIncome - 23850) * 0.12;
      } else {
        estimatedFederalTax = taxableIncome * 0.10;
      }
    }

    const effectiveTaxRate = totalGrossIncome > 0 ? (estimatedFederalTax / totalGrossIncome) * 100 : 0;

    const checklist = [
      `Total Combined Gross Retirement Income: $${totalGrossIncome.toLocaleString()}/year.`,
      `Provisional Income: $${provisionalIncome.toLocaleString()}/year (${(taxableSsRatio * 100).toFixed(0)}% of Social Security is taxable = $${taxableSocialSecurity.toLocaleString()}).`,
      `2026 Standard Deduction (with Age 65+ Bonus): $${standardDeduction.toLocaleString()}.`,
      `Final Taxable Income: $${taxableIncome.toLocaleString()}.`,
      `Estimated Federal Income Tax Bill: $${estimatedFederalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}/year ($${(estimatedFederalTax / 12).toFixed(2)}/month).`,
      `Overall Effective Tax Rate: ${effectiveTaxRate.toFixed(1)}% of total gross income.`,
    ];

    setResult({
      totalGrossIncome,
      taxableSocialSecurity,
      provisionalIncome,
      standardDeduction,
      taxableIncome,
      estimatedFederalTax,
      effectiveTaxRate,
      checklist,
    });
  };

  return (
    <div
      className="tax-estimator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Retirement Income Tax Estimator 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Enter all annual retirement income sources to estimate your total federal tax bill and Social Security taxability.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-ss`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Annual Social Security ($/yr)
            </label>
            <input
              id={`${uid}-ss`}
              type="text"
              value={ssIncomeStr}
              onChange={(e) => setSsIncomeStr(e.target.value)}
              placeholder="e.g. 24000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-ira`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Annual IRA/401(k) Withdrawals ($/yr)
            </label>
            <input
              id={`${uid}-ira`}
              type="text"
              value={iraWithdrawalsStr}
              onChange={(e) => setIraWithdrawalsStr(e.target.value)}
              placeholder="e.g. 25000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-pension`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Annual Pension Income ($/yr)
            </label>
            <input
              id={`${uid}-pension`}
              type="text"
              value={pensionIncomeStr}
              onChange={(e) => setPensionIncomeStr(e.target.value)}
              placeholder="e.g. 12000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-interest`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Interest &amp; Dividends ($/yr)
            </label>
            <input
              id={`${uid}-interest`}
              type="text"
              value={interestIncomeStr}
              onChange={(e) => setInterestIncomeStr(e.target.value)}
              placeholder="e.g. 2000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-filing`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Filing Status
            </label>
            <select
              id={`${uid}-filing`}
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value="single">Single / Head of Household</option>
              <option value="joint">Married Filing Jointly</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingTop: '1.5rem' }}>
            <input
              id={`${uid}-65plus`}
              type="checkbox"
              checked={ageOver65}
              onChange={(e) => setAgeOver65(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-65plus`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              Age 65 or older (claims additional senior standard deduction)
            </label>
          </div>
        </div>

        <button
          type="submit"
          style={{
            background: '#0A3D3A',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.05rem',
            padding: '0.85rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            marginTop: '0.5rem',
          }}
        >
          Estimate Federal Retirement Tax →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Result Card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Estimated Federal Annual Tax Bill
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.estimatedFederalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })} / yr
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, fontWeight: 600 }}>
              Monthly Withholding Needed: <strong>${(result.estimatedFederalTax / 12).toFixed(2)} / month</strong> | Effective Rate: <strong>{result.effectiveTaxRate.toFixed(1)}%</strong>
            </p>
          </div>

          {/* Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Taxable Social Security</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>${result.taxableSocialSecurity.toLocaleString()}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>2026 Standard Deduction</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>${result.standardDeduction.toLocaleString()}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Final Taxable Income</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E8761A' }}>${result.taxableIncome.toLocaleString()}</span>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Retirement Tax Calculation Details
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {result.checklist.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.55 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
