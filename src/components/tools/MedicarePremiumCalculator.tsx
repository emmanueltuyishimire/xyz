import React, { useState, useId } from 'react';

/**
 * MedicarePremiumCalculator.tsx
 * Tool: Medicare Part A & B Premium Calculator
 * Primary keyword: medicare premium calculator
 * Supporting keywords: medicare part b premiums, medicare premiums by income, medicare premiums 2026
 */

export type FilingStatus = 'single' | 'joint' | 'married_separate';

interface PremiumResult {
  partAPremium: number;
  partBBase: number;
  partBIrmaa: number;
  totalPartB: number;
  totalMonthlyPremium: number;
  irmaaTierLabel: string;
  checklist: string[];
}

export const MedicarePremiumCalculator: React.FC = () => {
  const uid = useId();

  const [workQuarters, setWorkQuarters] = useState<number>(40);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [magiStr, setMagiStr] = useState<string>('85000');

  const [result, setResult] = useState<PremiumResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const magi = Math.max(0, parseFloat(magiStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(magi)) {
      setError('Please enter a valid MAGI income figure.');
      setResult(null);
      return;
    }

    setError('');

    // Part A Premium (2026 figures):
    // 40+ quarters: $0
    // 30-39 quarters: $278/mo
    // <30 quarters: $505/mo
    let partAPremium = 0;
    if (workQuarters < 30) partAPremium = 505;
    else if (workQuarters < 40) partAPremium = 278;
    else partAPremium = 0;

    // Part B Base Premium (2026): $202.90
    const partBBase = 202.90;

    // 2026 IRMAA Part B Tiers (Single / Joint / Separate):
    let partBIrmaa = 0;
    let irmaaTierLabel = 'Base Bracket (No Surcharge)';

    if (filingStatus === 'single') {
      if (magi > 500000) { partBIrmaa = 443.90; irmaaTierLabel = 'Tier 5 (MAGI > $500,000)'; }
      else if (magi > 193000) { partBIrmaa = 371.30; irmaaTierLabel = 'Tier 4 ($193,000 – $500,000)'; }
      else if (magi > 161000) { partBIrmaa = 265.20; irmaaTierLabel = 'Tier 3 ($161,000 – $193,000)'; }
      else if (magi > 133000) { partBIrmaa = 159.10; irmaaTierLabel = 'Tier 2 ($133,000 – $161,000)'; }
      else if (magi > 106000) { partBIrmaa = 81.20; irmaaTierLabel = 'Tier 1 ($106,000 – $133,000)'; }
    } else if (filingStatus === 'joint') {
      if (magi > 750000) { partBIrmaa = 443.90; irmaaTierLabel = 'Tier 5 (MAGI > $750,000)'; }
      else if (magi > 386000) { partBIrmaa = 371.30; irmaaTierLabel = 'Tier 4 ($386,000 – $750,000)'; }
      else if (magi > 322000) { partBIrmaa = 265.20; irmaaTierLabel = 'Tier 3 ($322,000 – $386,000)'; }
      else if (magi > 266000) { partBIrmaa = 159.10; irmaaTierLabel = 'Tier 2 ($266,000 – $322,000)'; }
      else if (magi > 212000) { partBIrmaa = 81.20; irmaaTierLabel = 'Tier 1 ($212,000 – $266,000)'; }
    } else {
      // Married Separate
      if (magi > 394000) { partBIrmaa = 443.90; irmaaTierLabel = 'Tier 5 (MAGI > $394,000)'; }
      else if (magi > 106000) { partBIrmaa = 371.30; irmaaTierLabel = 'Tier 4 ($106,000 – $394,000)'; }
    }

    const totalPartB = partBBase + partBIrmaa;
    const totalMonthlyPremium = partAPremium + totalPartB;

    const checklist = [
      `Part A Premium: $${partAPremium.toFixed(2)}/mo (${workQuarters >= 40 ? 'Premium-Free — 40+ work quarters achieved' : 'Reduced work quarters surcharge applies'}).`,
      `Part B Base Premium: $${partBBase.toFixed(2)}/mo (2026 standard base rate for all beneficiaries).`,
      `Part B IRMAA Surcharge: $${partBIrmaa.toFixed(2)}/mo (${irmaaTierLabel}).`,
      `Total Monthly Part B Cost: $${totalPartB.toFixed(2)}/mo.`,
      `Total Combined Out-of-Pocket Medicare Premium: $${totalMonthlyPremium.toFixed(2)}/mo ($${(totalMonthlyPremium * 12).toFixed(2)}/year).`,
      partBIrmaa > 0
        ? 'If your income dropped significantly due to a life-changing event (retirement, divorce, death of spouse), file Form SSA-44 to appeal your IRMAA surcharge.'
        : 'Your income is within the base bracket — no IRMAA surcharge applies.',
    ];

    setResult({
      partAPremium,
      partBBase,
      partBIrmaa,
      totalPartB,
      totalMonthlyPremium,
      irmaaTierLabel,
      checklist,
    });
  };

  return (
    <div
      className="premium-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Medicare Part A &amp; B Premium Calculator 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Calculate your exact total monthly Medicare premium, combining Part A work quarters and Part B income surcharges (IRMAA).
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-quarters`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Social Security Work History (Medicare Tax Quarters)
          </label>
          <select
            id={`${uid}-quarters`}
            value={workQuarters}
            onChange={(e) => setWorkQuarters(parseInt(e.target.value))}
            style={{ width: '100%', maxWidth: '360px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value={40}>40+ Quarters (10+ years worked — Premium-Free Part A $0/mo)</option>
            <option value={35}>30–39 Quarters (Part A is $278/mo in 2026)</option>
            <option value={20}>Fewer than 30 Quarters (Part A is $505/mo in 2026)</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-filing`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Tax Filing Status (from 2 tax years prior — 2024 Return)
          </label>
          <select
            id={`${uid}-filing`}
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
            style={{ width: '100%', maxWidth: '360px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="single">Single / Head of Household / Qualifying Widow(er)</option>
            <option value="joint">Married Filing Jointly</option>
            <option value="married_separate">Married Filing Separately</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-magi`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. Modified Adjusted Gross Income ($) from 2 Years Prior
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-magi`}
              type="text"
              value={magiStr}
              onChange={(e) => setMagiStr(e.target.value)}
              placeholder="e.g. 85000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            AGI plus tax-exempt municipal interest (Form 1040 Line 11 + Line 2a).
          </p>
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
          Calculate Total Premium →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Result Banner */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Total Estimated Monthly Medicare Premium
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.totalMonthlyPremium.toFixed(2)} / mo
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, fontWeight: 600 }}>
              Annual Total: ${(result.totalMonthlyPremium * 12).toLocaleString('en-US', { minimumFractionDigits: 2 })} / year
            </p>
          </div>

          {/* Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Part A Premium</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>${result.partAPremium.toFixed(2)}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{workQuarters >= 40 ? 'Free (40+ Qtrs)' : `${workQuarters} Qtrs`}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Part B Base Rate</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>${result.partBBase.toFixed(2)}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>2026 Base</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Part B IRMAA Surcharge</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: result.partBIrmaa > 0 ? '#c05621' : '#276749' }}>
                +${result.partBIrmaa.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{result.irmaaTierLabel}</span>
            </div>
          </div>

          {/* Line Item Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Premium Breakdown &amp; Verification Notes
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
