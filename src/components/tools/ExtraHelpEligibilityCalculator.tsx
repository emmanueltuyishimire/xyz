import React, { useState, useId } from 'react';

/**
 * ExtraHelpEligibilityCalculator.tsx
 * Tool: Extra Help (LIS) Eligibility Calculator
 * Primary keyword: extra help eligibility calculator
 * Supporting keywords: low income subsidy calculator medicare, lis eligibility
 */

export type MaritalStatus = 'single' | 'married';

interface LISResult {
  isEligible: boolean;
  tierName: string;
  monthlyIncome: number;
  incomeLimit: number;
  countableAssets: number;
  assetLimit: number;
  estimatedAnnualSavings: number;
  checklist: string[];
}

export const ExtraHelpEligibilityCalculator: React.FC = () => {
  const uid = useId();

  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single');
  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState<string>('1650');
  const [countableAssetsStr, setCountableAssetsStr] = useState<string>('8500');
  const [hasBurialFund, setHasBurialFund] = useState<boolean>(true);

  const [result, setResult] = useState<LISResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const income = Math.max(0, parseFloat(monthlyIncomeStr.replace(/[^0-9.]/g, '')) || 0);
    const rawAssets = Math.max(0, parseFloat(countableAssetsStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(income) || isNaN(rawAssets)) {
      setError('Please enter valid numeric values for income and assets.');
      setResult(null);
      return;
    }

    setError('');

    // 2026 Baseline LIS Thresholds (150% FPL + Inflation Reduction Act expanded rules)
    // Single: Income ~$1,985/mo ($23,820/yr), Assets $17,220 ($18,720 with burial)
    // Married: Income ~$2,685/mo ($32,220/yr), Assets $34,360 ($37,360 with burial)
    const burialAllowance = hasBurialFund ? (maritalStatus === 'single' ? 1500 : 3000) : 0;
    const countableAssets = Math.max(0, rawAssets - burialAllowance);

    const incomeLimit = maritalStatus === 'single' ? 1985 : 2685;
    const assetLimit = maritalStatus === 'single' ? 17220 : 34360;

    const incomePass = income <= incomeLimit;
    const assetPass = countableAssets <= assetLimit;
    const isEligible = incomePass && assetPass;

    let tierName = '';
    let estimatedAnnualSavings = 0;
    let checklist: string[] = [];

    if (isEligible) {
      tierName = 'Full Extra Help (Low Income Subsidy)';
      estimatedAnnualSavings = 5900;
      checklist = [
        'Apply online at ssa.gov/extrahelp or call Social Security at 1-800-772-1213.',
        'If approved, your Part D monthly plan premium is reduced to $0 (for benchmark basic drug plans).',
        'Your annual Part D deductible is reduced to $0.',
        'Your prescription copays are capped at ~$4.90 for generic drugs and ~$12.15 for brand-name drugs in 2026.',
        'You automatically get a Special Enrollment Period (SEP) to switch Part D plans once per calendar quarter during the first 9 months of the year.',
        'No late enrollment penalty: If you owed a Part D late enrollment penalty, it is permanently waived while on Extra Help.',
      ];
    } else if (!incomePass && !assetPass) {
      tierName = 'Income & Asset Limits Exceeded';
      checklist = [
        'Your reported income and assets exceed current federal baseline thresholds.',
        'Check if your state Medicaid office offers a Medicare Savings Program (MSP) with higher limits or asset exclusions.',
        'States like NY, CA, and CT have eliminated asset tests entirely — qualifying for MSP automatically grants Extra Help.',
        'Review income exclusions: The first $20 of unearned income and $65 + half of earned wages are excluded from countable income.',
      ];
    } else if (!incomePass) {
      tierName = 'Income Limit Exceeded';
      checklist = [
        `Your monthly income ($${income.toLocaleString()}) exceeds the limit ($${incomeLimit.toLocaleString()}/mo).`,
        'Remember that gross income calculations exclude the first $20/month of unearned income and certain wage exclusions.',
        'Apply for a Medicare Savings Program (MSP) through your state Medicaid office — MSP approval automatically qualifies you for Extra Help.',
      ];
    } else {
      tierName = 'Asset Limit Exceeded';
      checklist = [
        `Your countable assets ($${countableAssets.toLocaleString()}) exceed the threshold ($${assetLimit.toLocaleString()}).`,
        'Primary home, one car, household items, and up to $1,500/person burial funds are NOT counted as assets.',
        'Consider re-checking which items you counted as assets to make sure non-countable assets were excluded.',
      ];
    }

    setResult({
      isEligible,
      tierName,
      monthlyIncome: income,
      incomeLimit,
      countableAssets,
      assetLimit,
      estimatedAnnualSavings,
      checklist,
    });
  };

  return (
    <div
      className="lis-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Medicare Extra Help (LIS) Eligibility Calculator 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Enter your marital status, monthly income, and savings to check if you qualify for federal prescription drug assistance worth ~$5,900/year.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-status`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Marital Status &amp; Household Size
          </label>
          <select
            id={`${uid}-status`}
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
            style={{ width: '100%', maxWidth: '320px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="single">Single / Widowed / Divorced (1 person)</option>
            <option value="married">Married &amp; Living Together (2 people)</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-income`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Gross Monthly Household Income ($)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-income`}
              type="text"
              value={monthlyIncomeStr}
              onChange={(e) => setMonthlyIncomeStr(e.target.value)}
              placeholder="e.g. 1650"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Includes gross Social Security, pension, wages, and interest before deductions.
          </p>
        </div>

        <div>
          <label htmlFor={`${uid}-assets`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. Countable Savings &amp; Investments ($)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-assets`}
              type="text"
              value={countableAssetsStr}
              onChange={(e) => setCountableAssetsStr(e.target.value)}
              placeholder="e.g. 8500"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Include checking, savings, stocks, bonds, IRAs. Do NOT include primary home or 1 vehicle.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input
            id={`${uid}-burial`}
            type="checkbox"
            checked={hasBurialFund}
            onChange={(e) => setHasBurialFund(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
          />
          <label htmlFor={`${uid}-burial`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
            Deduct $1,500 per person burial expense allowance from countable assets
          </label>
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
          Check My Extra Help Eligibility →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Status Banner */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background: result.isEligible ? '#f0fdf4' : '#fffaf0',
              border: result.isEligible ? '2px solid #38a169' : '2px solid #dd6b20',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: result.isEligible ? '#276749' : '#c05621',
              }}
            >
              {result.isEligible ? '🎉 Likely Eligible for Extra Help' : '⚠️ Exceeds Federal Baseline Limits'}
            </span>
            <p style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.35rem 0 0 0', color: '#0D2137' }}>
              {result.tierName}
            </p>
            {result.isEligible && (
              <p style={{ fontSize: '1rem', color: '#0A3D3A', fontWeight: 700, margin: '0.5rem 0 0 0' }}>
                Estimated Savings: <span style={{ color: '#E8761A', fontSize: '1.25rem' }}>~$5,900 / year</span> on Medicare Part D plan costs &amp; copays.
              </p>
            )}
          </div>

          {/* Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly Income</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: result.monthlyIncome <= result.incomeLimit ? '#0A3D3A' : '#c05621' }}>
                ${result.monthlyIncome.toLocaleString()} / mo
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Limit: ${result.incomeLimit.toLocaleString()} / mo
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Countable Assets</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: result.countableAssets <= result.assetLimit ? '#0A3D3A' : '#c05621' }}>
                ${result.countableAssets.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Limit: ${result.assetLimit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checklist / Next Steps */}
          <div style={{ background: '#f0fdf4', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Next Steps &amp; Application Guidance
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {result.checklist.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.55 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', lineHeight: 1.5 }}>
            Calculations based on 2026 Social Security Administration Extra Help rules and Inflation Reduction Act provisions. Apply directly at{' '}
            <a href="https://www.ssa.gov/extrahelp" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A' }}>
              ssa.gov/extrahelp
            </a>.
          </p>
        </div>
      )}
    </div>
  );
};
