import React, { useState, useId } from 'react';

/**
 * SocialSecuritySurvivorBenefitCalculator.tsx
 * Tool: Social Security Survivor / Widow Benefit Calculator
 * Primary keyword: social security survivor benefit calculator
 * Supporting keywords: widow benefit calculator social security, ss survivor benefits
 */

interface SurvivorResult {
  deceasedBenefit: number;
  ownPia: number;
  survivorClaimAge: number;
  survivorPercentage: number;
  monthlySurvivorCheck: number;
  ownBenefitAt70: number;
  switchStrategyRecommendation: string;
  checklist: string[];
}

export const SocialSecuritySurvivorBenefitCalculator: React.FC = () => {
  const uid = useId();

  const [deceasedBenefitStr, setDeceasedBenefitStr] = useState<string>('2400');
  const [ownPiaStr, setOwnPiaStr] = useState<string>('1800');
  const [survivorClaimAge, setSurvivorClaimAge] = useState<number>(60);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const [result, setResult] = useState<SurvivorResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const deceasedBenefit = Math.max(0, parseFloat(deceasedBenefitStr.replace(/[^0-9.]/g, '')) || 0);
    const ownPia = Math.max(0, parseFloat(ownPiaStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(deceasedBenefit) || deceasedBenefit <= 0) {
      setError("Please enter a valid monthly benefit amount for the deceased spouse.");
      setResult(null);
      return;
    }

    setError('');

    // Survivor Benefit Factors:
    // Age 60: 71.5% of deceased benefit
    // Age 61: 75.7%
    // Age 62: 79.9%
    // Age 63: 84.1%
    // Age 64: 88.3%
    // Age 65: 92.5%
    // Age 66: 96.7%
    // Age 67 (FRA): 100.0%
    let factor = 1.0;
    if (survivorClaimAge === 60) factor = 0.715;
    else if (survivorClaimAge === 61) factor = 0.757;
    else if (survivorClaimAge === 62) factor = 0.799;
    else if (survivorClaimAge === 63) factor = 0.841;
    else if (survivorClaimAge === 64) factor = 0.883;
    else if (survivorClaimAge === 65) factor = 0.925;
    else if (survivorClaimAge === 66) factor = 0.967;
    else if (survivorClaimAge >= 67) factor = 1.0;

    if (isDisabled && survivorClaimAge < 60) {
      factor = 0.715; // Disabled widow age 50-59 gets 71.5%
    }

    const monthlySurvivorCheck = deceasedBenefit * factor;
    const ownBenefitAt70 = ownPia * 1.24; // 24% delayed credits at age 70

    let switchStrategyRecommendation = '';
    if (ownBenefitAt70 > monthlySurvivorCheck) {
      switchStrategyRecommendation = `Strategic Option: You can claim Survivor Benefits now at age ${survivorClaimAge} ($${monthlySurvivorCheck.toFixed(0)}/mo) to provide immediate income while letting your own work record grow until age 70, then switch to your own higher benefit ($${ownBenefitAt70.toFixed(0)}/mo).`;
    } else {
      switchStrategyRecommendation = `Optimal Strategy: Your survivor benefit at Full Retirement Age ($${deceasedBenefit.toFixed(0)}/mo) is higher than your own max benefit at 70 ($${ownBenefitAt70.toFixed(0)}/mo). Claim survivor benefits at your FRA (67) for maximum lifetime income.`;
    }

    const checklist = [
      `Deceased Spouse's Benefit Base: $${deceasedBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      `Survivor Claiming Age: ${survivorClaimAge} (${(factor * 100).toFixed(1)}% of deceased benefit).`,
      `Estimated Monthly Survivor Check: $${monthlySurvivorCheck.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      `Your Own Benefit at Age 70 (Delayed): $${ownBenefitAt70.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo.`,
      'Dual-Claiming Rule: Widows/widowers are permitted to switch between survivor benefits and personal retirement benefits — a key tax and income strategy.',
      'Remarriage Rule: Remarrying after age 60 (or age 50 if disabled) does NOT affect your eligibility for survivor benefits on your deceased spouse\'s record.',
    ];

    setResult({
      deceasedBenefit,
      ownPia,
      survivorClaimAge,
      survivorPercentage: factor * 100,
      monthlySurvivorCheck,
      ownBenefitAt70,
      switchStrategyRecommendation,
      checklist,
    });
  };

  return (
    <div
      className="survivor-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Social Security Survivor / Widow Benefit Calculator
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Calculate your monthly widow/widower benefit at ages 60–70 and explore optimal switching strategies.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-deceased-benefit`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Deceased Spouse's Monthly Social Security Benefit ($/mo) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-deceased-benefit`}
              type="text"
              value={deceasedBenefitStr}
              onChange={(e) => setDeceasedBenefitStr(e.target.value)}
              placeholder="e.g. 2400"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            The amount the deceased spouse was receiving (or entitled to receive at FRA).
          </p>
        </div>

        <div>
          <label htmlFor={`${uid}-own-pia`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Surviving Spouse's Own Benefit at FRA (PIA) ($/mo)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-own-pia`}
              type="text"
              value={ownPiaStr}
              onChange={(e) => setOwnPiaStr(e.target.value)}
              placeholder="e.g. 1800"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Used to analyze the "claim survivor now, switch to own benefit at 70" strategy.
          </p>
        </div>

        <div>
          <label htmlFor={`${uid}-survivor-age`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. Surviving Spouse's Planned Claiming Age for Survivor Benefits
          </label>
          <select
            id={`${uid}-survivor-age`}
            value={survivorClaimAge}
            onChange={(e) => setSurvivorClaimAge(parseInt(e.target.value))}
            style={{ width: '100%', maxWidth: '340px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value={60}>Age 60 (Earliest standard — 71.5% of benefit)</option>
            <option value={61}>Age 61 (75.7% of benefit)</option>
            <option value={62}>Age 62 (79.9% of benefit)</option>
            <option value={63}>Age 63 (84.1% of benefit)</option>
            <option value={64}>Age 64 (88.3% of benefit)</option>
            <option value={65}>Age 65 (92.5% of benefit)</option>
            <option value={66}>Age 66 (96.7% of benefit)</option>
            <option value={67}>Age 67 (Full Retirement Age — 100% of benefit)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input
            id={`${uid}-disabled`}
            type="checkbox"
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
          />
          <label htmlFor={`${uid}-disabled`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
            I am a disabled widow/widower (eligible for 71.5% survivor benefit between ages 50–59)
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
          Calculate Survivor Benefit →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Output Banner */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Estimated Monthly Survivor Check at Age {result.survivorClaimAge}
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.monthlySurvivorCheck.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: '0.5rem 0 0 0', lineHeight: 1.5 }}>
              {result.switchStrategyRecommendation}
            </p>
          </div>

          {/* Key Figures Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>100% Survivor Max (at 67)</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>
                ${result.deceasedBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Full deceased benefit</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Claim Factor at Age {result.survivorClaimAge}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>
                {result.survivorPercentage.toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Percentage of deceased check</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Your Own Max Benefit at 70</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E8761A' }}>
                ${result.ownBenefitAt70.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>If switched at age 70</span>
            </div>
          </div>

          {/* Action Plan */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Key Rules &amp; Strategy Breakdown
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
