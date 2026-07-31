import React, { useState, useId } from 'react';

/**
 * SSDIEstimateCalculator.tsx
 * Tool: SSDI Benefit Estimate Calculator
 * Primary keyword: ssdi estimate calculator
 */

export type WorkHistoryYears = 5 | 10 | 15 | 20 | 25 | 30 | 35;

interface SSDIResult {
  estimatedAIME: number;
  estimatedPIA: number;
  estimatedMonthlyBenefit: number;
  medicareCoverage: string;
  dependentBenefits: string;
  checklist: string[];
}

export const SSDIEstimateCalculator: React.FC = () => {
  const uid = useId();

  const [avgAnnualEarningsStr, setAvgAnnualEarningsStr] = useState<string>('55000');
  const [yearsWorkedStr, setYearsWorkedStr] = useState<string>('25');
  const [currentAgeStr, setCurrentAgeStr] = useState<string>('52');
  const [hasChildren, setHasChildren] = useState<boolean>(false);
  const [numberOfChildren, setNumberOfChildren] = useState<number>(1);

  const [result, setResult] = useState<SSDIResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const avgAnnualEarnings = Math.max(0, parseFloat(avgAnnualEarningsStr.replace(/[^0-9.]/g, '')) || 0);
    const yearsWorked = parseInt(yearsWorkedStr) || 25;
    const currentAge = parseInt(currentAgeStr) || 52;

    if (avgAnnualEarnings <= 0) {
      setError('Please enter a valid average annual earnings amount.');
      setResult(null);
      return;
    }
    if (yearsWorked < 5) {
      setError('SSDI typically requires at least 5 years (20 quarters) of covered work credits. Please check years worked.');
      setResult(null);
      return;
    }

    setError('');

    // AIME = Average Indexed Monthly Earnings
    // Simplified: Take average annual earnings, index for inflation (~1.15x factor for older earnings),
    // then divide by 12 for monthly
    const indexedAnnualEarnings = Math.min(avgAnnualEarnings * 1.08, 168600); // 2026 SS wage base cap
    const estimatedAIME = Math.round(indexedAnnualEarnings / 12);

    // 2026 SSDI PIA Formula (Bend Points):
    // 90% of the first $1,226 of AIME
    // 32% of AIME between $1,226 and $7,391
    // 15% of AIME above $7,391
    let estimatedPIA = 0;
    if (estimatedAIME <= 1226) {
      estimatedPIA = estimatedAIME * 0.90;
    } else if (estimatedAIME <= 7391) {
      estimatedPIA = 1226 * 0.90 + (estimatedAIME - 1226) * 0.32;
    } else {
      estimatedPIA = 1226 * 0.90 + (7391 - 1226) * 0.32 + (estimatedAIME - 7391) * 0.15;
    }

    // SSDI benefit = Full PIA (no age reduction unlike SS retirement)
    const estimatedMonthlyBenefit = Math.round(estimatedPIA);

    // Medicare becomes available after 24-month waiting period
    const medicareEligYear = new Date().getFullYear() + 2;
    const medicareCoverage = `Medicare Part A & B eligibility begins after 24 months of receiving SSDI benefits (approx. ${medicareEligYear}).`;

    // Dependent (auxiliary) benefits: Eligible spouse/children receive up to 50% of PIA each, capped at ~150-180% family maximum
    const dependentBenefits = hasChildren && numberOfChildren > 0
      ? `Your ${numberOfChildren} qualifying child${numberOfChildren > 1 ? 'ren' : ''} may receive up to $${Math.round(estimatedPIA * 0.50).toLocaleString()}/mo each in auxiliary dependent benefits (subject to Family Maximum Benefit limits).`
      : 'No dependent child benefits applied.';

    const checklist = [
      `Estimated Average Indexed Monthly Earnings (AIME): $${estimatedAIME.toLocaleString()}/mo.`,
      `Estimated 2026 SSDI Monthly Benefit (Full PIA): $${estimatedMonthlyBenefit.toLocaleString()}/mo.`,
      `Annual SSDI Income: ~$${(estimatedMonthlyBenefit * 12).toLocaleString()}/year.`,
      medicareCoverage,
      dependentBenefits,
      `2026 Substantial Gainful Activity (SGA) Limit: $1,620/mo — earning more may disqualify your SSDI claim.`,
      'Apply via ssa.gov/apply or call 1-800-772-1213 to start your disability application.',
    ];

    setResult({
      estimatedAIME,
      estimatedPIA,
      estimatedMonthlyBenefit,
      medicareCoverage,
      dependentBenefits,
      checklist,
    });
  };

  return (
    <div
      className="ssdi-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          SSDI Benefit Estimate Calculator 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Estimate your monthly Social Security Disability Insurance check based on your average work earnings and covered work history.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-earnings`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Average Annual Earnings ($/yr) <span style={{ color: '#c53030' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
              <input
                id={`${uid}-earnings`}
                type="text"
                value={avgAnnualEarningsStr}
                onChange={(e) => setAvgAnnualEarningsStr(e.target.value)}
                placeholder="e.g. 55000"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Your average pre-disability annual wages.</p>
          </div>

          <div>
            <label htmlFor={`${uid}-years`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Years of Covered Work History
            </label>
            <select
              id={`${uid}-years`}
              value={yearsWorkedStr}
              onChange={(e) => setYearsWorkedStr(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value="5">5 Years (minimum SSDI threshold)</option>
              <option value="10">10 Years</option>
              <option value="15">15 Years</option>
              <option value="20">20 Years</option>
              <option value="25">25 Years</option>
              <option value="30">30 Years</option>
              <option value="35">35 Years</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-age`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Current Age
            </label>
            <input
              id={`${uid}-age`}
              type="number"
              min={18}
              max={64}
              value={currentAgeStr}
              onChange={(e) => setCurrentAgeStr(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id={`${uid}-children`}
              type="checkbox"
              checked={hasChildren}
              onChange={(e) => setHasChildren(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-children`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              I have qualifying dependent children (under 18 or disabled)
            </label>
          </div>
          {hasChildren && (
            <div style={{ marginLeft: '2rem' }}>
              <label htmlFor={`${uid}-numchildren`} style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#0D2137', marginBottom: '0.25rem' }}>
                Number of qualifying children:
              </label>
              <input
                id={`${uid}-numchildren`}
                type="number"
                min={1}
                max={10}
                value={numberOfChildren}
                onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 1)}
                style={{ width: '100px', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>
          )}
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
          Estimate My SSDI Monthly Benefit →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Result Card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Estimated Monthly SSDI Benefit
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.estimatedMonthlyBenefit.toLocaleString()} / mo
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, fontWeight: 600 }}>
              Annual SSDI Income: ~${(result.estimatedMonthlyBenefit * 12).toLocaleString()}/yr | AIME: ${result.estimatedAIME.toLocaleString()}/mo
            </p>
          </div>

          {/* Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              SSDI Eligibility &amp; Benefit Summary
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
