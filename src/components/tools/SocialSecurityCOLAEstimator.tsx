import React, { useState, useId } from 'react';

/**
 * SocialSecurityCOLAEstimator.tsx
 * Tool: Social Security COLA Estimator
 * Primary keyword: social security cola estimator
 */

interface COLAEstimateResult {
  currentMonthlyBenefit: number;
  colaPercentage: number;
  monthlyIncrease: number;
  newMonthlyBenefit: number;
  annualIncrease: number;
  netIncreaseAfterPartB: number;
  checklist: string[];
}

export const SocialSecurityCOLAEstimator: React.FC = () => {
  const uid = useId();

  const [currentBenefitStr, setCurrentBenefitStr] = useState<string>('1900');
  const [colaPercentage, setColaPercentage] = useState<number>(2.8); // 2026 projected COLA ~2.8%
  const [partBEstIncrease, setPartBEstIncrease] = useState<number>(10.30); // Est Part B premium increase

  const [result, setResult] = useState<COLAEstimateResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const currentBenefit = Math.max(0, parseFloat(currentBenefitStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(currentBenefit) || currentBenefit <= 0) {
      setError('Please enter a valid monthly Social Security benefit ($).');
      setResult(null);
      return;
    }

    setError('');

    const monthlyIncrease = currentBenefit * (colaPercentage / 100);
    const newMonthlyBenefit = currentBenefit + monthlyIncrease;
    const annualIncrease = monthlyIncrease * 12;
    const netIncreaseAfterPartB = Math.max(0, monthlyIncrease - partBEstIncrease);

    const checklist = [
      `Current Monthly Benefit: $${currentBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      `COLA Adjustment Rate: ${colaPercentage.toFixed(1)}%.`,
      `Gross Monthly Benefit Increase: +$${monthlyIncrease.toFixed(2)}/mo ($${annualIncrease.toFixed(2)}/year).`,
      `Estimated Part B Premium Increase Offset: -$${partBEstIncrease.toFixed(2)}/mo.`,
      `Estimated Net Increase in Your Deposit: +$${netIncreaseAfterPartB.toFixed(2)}/mo.`,
      `New Total Monthly Check (Gross): $${newMonthlyBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      'COLA Timing: Official SSA COLA announcements occur in mid-October, and updated benefit checks take effect with January deposits.',
    ];

    setResult({
      currentMonthlyBenefit: currentBenefit,
      colaPercentage,
      monthlyIncrease,
      newMonthlyBenefit,
      annualIncrease,
      netIncreaseAfterPartB,
      checklist,
    });
  };

  return (
    <div
      className="cola-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Social Security COLA Estimator 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Estimate your new monthly check size and net dollar increase after the annual Cost-of-Living Adjustment.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-benefit`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Current Monthly Social Security Benefit ($/mo) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-benefit`}
              type="text"
              value={currentBenefitStr}
              onChange={(e) => setCurrentBenefitStr(e.target.value)}
              placeholder="e.g. 1900"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-cola`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              2. Projected COLA Rate (%)
            </label>
            <select
              id={`${uid}-cola`}
              value={colaPercentage}
              onChange={(e) => setColaPercentage(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value={2.0}>2.0% (Low Inflation Scenario)</option>
              <option value={2.5}>2.5% (Moderate Scenario)</option>
              <option value={2.8}>2.8% (2026 Baseline Projection)</option>
              <option value={3.2}>3.2% (High Inflation Scenario)</option>
              <option value={4.0}>4.0% (Elevated Inflation)</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-partb`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              3. Estimated Monthly Part B Premium Increase
            </label>
            <select
              id={`${uid}-partb`}
              value={partBEstIncrease}
              onChange={(e) => setPartBEstIncrease(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value={0}>$0.00 (No Medicare deduction / Medicaid pays Part B)</option>
              <option value={10.30}>$10.30/mo (Standard Est. Part B Increase)</option>
              <option value={15.00}>$15.00/mo (Higher Part B Adjustment)</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

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
          Calculate COLA Increase →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Estimated New Gross Monthly Benefit
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.newMonthlyBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, fontWeight: 600 }}>
              Gross Increase: <strong>+${result.monthlyIncrease.toFixed(2)}/mo</strong> | Net Check Increase (After Part B): <strong>+${result.netIncreaseAfterPartB.toFixed(2)}/mo</strong>
            </p>
          </div>

          {/* Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly Increase</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>+${result.monthlyIncrease.toFixed(2)}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Annual Increase</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>+${result.annualIncrease.toFixed(2)}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>COLA Rate</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E8761A' }}>{result.colaPercentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              COLA Calculation Details
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
