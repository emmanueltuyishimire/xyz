import React, { useState, useId } from 'react';

/**
 * SocialSecuritySpousalBenefitCalculator.tsx
 * Tool: Social Security Spousal Benefit Calculator
 * Primary keyword: social security spousal benefit calculator
 * Supporting keywords: spousal benefit calculator social security, social security benefits for spouse
 */

interface SpousalResult {
  primaryPia: number;
  spousePia: number;
  maxSpousalBenefit: number; // 50% of primary PIA
  spouseClaimAge: number;
  adjustedSpousalBenefit: number;
  ownBenefitAtClaimAge: number;
  totalMonthlyCheck: number;
  spousalTopUp: number;
  recommendation: string;
  checklist: string[];
}

export const SocialSecuritySpousalBenefitCalculator: React.FC = () => {
  const uid = useId();

  const [primaryPiaStr, setPrimaryPiaStr] = useState<string>('2800');
  const [spousePiaStr, setSpousePiaStr] = useState<string>('900');
  const [spouseClaimAge, setSpouseClaimAge] = useState<number>(67);
  const [primaryFiled, setPrimaryFiled] = useState<boolean>(true);

  const [result, setResult] = useState<SpousalResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const primaryPia = Math.max(0, parseFloat(primaryPiaStr.replace(/[^0-9.]/g, '')) || 0);
    const spousePia = Math.max(0, parseFloat(spousePiaStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(primaryPia) || primaryPia <= 0) {
      setError("Please enter a valid Primary Earner monthly benefit at Full Retirement Age (PIA).");
      setResult(null);
      return;
    }

    setError('');

    // Max spousal benefit at FRA is 50% of Primary PIA
    const maxSpousalBenefit = primaryPia * 0.5;

    // Early claiming reduction for spouse (assuming FRA = 67):
    // 67: 100% of max spousal (50% of primary PIA)
    // 66: ~91.7% of max spousal
    // 65: ~83.3% of max spousal
    // 64: ~75.0% of max spousal
    // 63: ~70.0% of max spousal
    // 62: 65.0% of max spousal (32.5% of primary PIA)
    let spousalFactor = 1.0;
    if (spouseClaimAge === 62) spousalFactor = 0.65;
    else if (spouseClaimAge === 63) spousalFactor = 0.70;
    else if (spouseClaimAge === 64) spousalFactor = 0.75;
    else if (spouseClaimAge === 65) spousalFactor = 0.8333;
    else if (spouseClaimAge === 66) spousalFactor = 0.9167;
    else if (spouseClaimAge >= 67) spousalFactor = 1.0; // Delayed retirement credits do NOT apply to spousal benefits!

    // Spouse's own benefit adjustment by claim age:
    // 62: 70% of spouse PIA
    // 63: 75%
    // 64: 80%
    // 65: 86.67%
    // 66: 93.33%
    // 67: 100%
    // 68: 108%
    // 69: 116%
    // 70: 124%
    let ownFactor = 1.0;
    if (spouseClaimAge === 62) ownFactor = 0.70;
    else if (spouseClaimAge === 63) ownFactor = 0.75;
    else if (spouseClaimAge === 64) ownFactor = 0.80;
    else if (spouseClaimAge === 65) ownFactor = 0.8667;
    else if (spouseClaimAge === 66) ownFactor = 0.9333;
    else if (spouseClaimAge === 67) ownFactor = 1.0;
    else if (spouseClaimAge === 68) ownFactor = 1.08;
    else if (spouseClaimAge === 69) ownFactor = 1.16;
    else if (spouseClaimAge >= 70) ownFactor = 1.24;

    const adjustedSpousalMax = maxSpousalBenefit * spousalFactor;
    const ownBenefitAtClaimAge = spousePia * ownFactor;

    // SSA rule: Spouse gets their own benefit first.
    // If adjusted max spousal is higher than own benefit at FRA, spouse gets a top-up.
    // Top-up = Max(0, AdjustedSpousalMax - SpousePIA)
    const spousalTopUp = Math.max(0, adjustedSpousalMax - spousePia);
    const totalMonthlyCheck = ownBenefitAtClaimAge + spousalTopUp;

    let recommendation = '';
    if (spouseClaimAge > 67 && spousePia < primaryPia * 0.5) {
      recommendation = 'Notice: Spousal benefits do NOT earn delayed retirement credits after age 67. Claiming spousal benefits after Full Retirement Age (67) yields no additional spousal boost.';
    } else if (spouseClaimAge < 67) {
      recommendation = `Claiming at age ${spouseClaimAge} permanently reduces your spousal benefit from $${maxSpousalBenefit.toFixed(0)} down to $${adjustedSpousalMax.toFixed(0)}/month. Waiting until age 67 maximizes your monthly check.`;
    } else {
      recommendation = `Claiming at Full Retirement Age (67) yields your maximum allowed spousal benefit of 50% of your spouse's PIA ($${maxSpousalBenefit.toFixed(0)}/month).`;
    }

    const checklist = [
      `Max Spousal Benefit (at FRA 67): $${maxSpousalBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo (50% of primary earner's $${primaryPia.toLocaleString()} PIA).`,
      `Spouse's Own Benefit at age ${spouseClaimAge}: $${ownBenefitAtClaimAge.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      `Spousal Top-Up Addition: $${spousalTopUp.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      `Total Estimated Combined Monthly Check for Spouse: $${totalMonthlyCheck.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      primaryFiled
        ? 'Primary earner has filed: The spouse is eligible to receive spousal benefits immediately upon filing.'
        : '⚠️ Primary earner has NOT filed: The spouse cannot receive spousal top-up benefits until the primary earner files for retirement benefits.',
      'Divorced Spouse Rule: If married for 10+ years and divorced for 2+ years, you can claim spousal benefits even if your ex-spouse has not yet filed.',
    ];

    setResult({
      primaryPia,
      spousePia,
      maxSpousalBenefit,
      spouseClaimAge,
      adjustedSpousalBenefit: adjustedSpousalMax,
      ownBenefitAtClaimAge,
      totalMonthlyCheck,
      spousalTopUp,
      recommendation,
      checklist,
    });
  };

  return (
    <div
      className="spousal-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Social Security Spousal Benefit Calculator
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Compare both spouses' Full Retirement Age benefits to calculate your exact combined monthly check and optimal claiming strategy.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-primary-pia`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Higher-Earning Spouse's Benefit at FRA ($/mo) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-primary-pia`}
              type="text"
              value={primaryPiaStr}
              onChange={(e) => setPrimaryPiaStr(e.target.value)}
              placeholder="e.g. 2800"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            This is the Primary Insurance Amount (PIA) shown on the higher earner's Social Security statement.
          </p>
        </div>

        <div>
          <label htmlFor={`${uid}-spouse-pia`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Lower-Earning Spouse's Own Benefit at FRA ($/mo)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-spouse-pia`}
              type="text"
              value={spousePiaStr}
              onChange={(e) => setSpousePiaStr(e.target.value)}
              placeholder="e.g. 900 (enter 0 if no earnings history)"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Enter 0 if the lower-earning spouse has no personal Social Security work record.
          </p>
        </div>

        <div>
          <label htmlFor={`${uid}-spouse-age`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. Planned Claiming Age for Lower-Earning Spouse
          </label>
          <select
            id={`${uid}-spouse-age`}
            value={spouseClaimAge}
            onChange={(e) => setSpouseClaimAge(parseInt(e.target.value))}
            style={{ width: '100%', maxWidth: '320px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value={62}>Age 62 (Earliest — 35% reduction)</option>
            <option value={63}>Age 63 (30% reduction)</option>
            <option value={64}>Age 64 (25% reduction)</option>
            <option value={65}>Age 65 (16.7% reduction)</option>
            <option value={66}>Age 66 (8.3% reduction)</option>
            <option value={67}>Age 67 (Full Retirement Age — 100% max spousal)</option>
            <option value={68}>Age 68 (No extra spousal bonus past 67)</option>
            <option value={69}>Age 69 (No extra spousal bonus past 67)</option>
            <option value={70}>Age 70 (No extra spousal bonus past 67)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input
            id={`${uid}-primary-filed`}
            type="checkbox"
            checked={primaryFiled}
            onChange={(e) => setPrimaryFiled(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
          />
          <label htmlFor={`${uid}-primary-filed`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
            Higher-earning spouse has already filed for Social Security (or will file at/before this claim age)
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
          Calculate Spousal Benefit →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Output Card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Estimated Monthly Spousal Check
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.totalMonthlyCheck.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, lineHeight: 1.5 }}>
              {result.recommendation}
            </p>
          </div>

          {/* Detailed Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Max Spousal Benefit (at 67)</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>
                ${result.maxSpousalBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>50% of Primary PIA</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Spouse Own Benefit (Age {result.spouseClaimAge})</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>
                ${result.ownBenefitAtClaimAge.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Based on personal earnings</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Spousal Top-Up Addition</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E8761A' }}>
                +${result.spousalTopUp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Spousal boost amount</span>
            </div>
          </div>

          {/* Strategy Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Summary &amp; Key Rules for Spousal Benefits
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
