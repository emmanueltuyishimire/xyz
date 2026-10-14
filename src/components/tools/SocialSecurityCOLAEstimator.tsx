import React, { useState, useId } from 'react';

/**
 * SocialSecurityCOLAEstimator.tsx
 * Primary keyword: Social Security COLA Calculator
 * Covers: 2026 (official 2.8%) and 2027 (official 3.6%, announced October 14, 2026)
 *
 * Exported as both SocialSecurityCOLACalculator (canonical) and
 * SocialSecurityCOLAEstimator (backward-compat alias for old estimator page).
 */

const COLA_2026_OFFICIAL = 2.8;
const COLA_2027_OFFICIAL = 3.6;

// Historical projection context — shown as reference only in 2027 tab
const PRIOR_PROJECTIONS_2027 = [
  { label: 'TSCL projected ~3.6% (matched official)', value: 3.6 },
  { label: 'AARP projected ~3.5%', value: 3.5 },
  { label: 'General range: 3.1%–3.8%', value: 0 },
];

interface CalcResult {
  currentBenefit: number;
  colaRate: number;
  monthlyIncrease: number;
  newMonthlyBenefit: number;
  annualIncrease: number;
  netMonthlyIncrease: number;
  partBOffset: number;
}

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const SocialSecurityCOLACalculator: React.FC = () => {
  const uid = useId();
  const [activeTab, setActiveTab] = useState<'2026' | '2027'>('2026');

  // Shared input
  const [benefitStr, setBenefitStr] = useState('1900');

  // Medicare offset (optional)
  const [showMedicare, setShowMedicare] = useState(false);
  const [partBOffsetStr, setPartBOffsetStr] = useState('17.90');

  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState('');

  const getActiveRate = (): number => {
    if (activeTab === '2026') return COLA_2026_OFFICIAL;
    return COLA_2027_OFFICIAL;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const benefit = Math.max(0, parseFloat(benefitStr.replace(/[^0-9.]/g, '')) || 0);
    if (!benefit) {
      setError('Please enter a valid monthly Social Security benefit amount.');
      setResult(null);
      return;
    }
    const rate = getActiveRate();
    const partBOffset = showMedicare ? Math.max(0, parseFloat(partBOffsetStr.replace(/[^0-9.]/g, '')) || 0) : 0;
    const monthly = benefit * (rate / 100);
    setError('');
    setResult({
      currentBenefit: benefit,
      colaRate: rate,
      monthlyIncrease: monthly,
      newMonthlyBenefit: benefit + monthly,
      annualIncrease: monthly * 12,
      netMonthlyIncrease: Math.max(0, monthly - partBOffset),
      partBOffset,
    });
  };

  const teal = '#0A3D3A';
  const gold = '#C9933A';
  const navy = '#0D2137';
  const border = '#DDE3EA';
  const muted = '#4B5A6E';

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: `2px solid ${teal}`, padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>

      {/* Year Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `2px solid ${border}`, paddingBottom: '0' }}>
        {(['2026', '2027'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setResult(null); setError(''); }}
            aria-pressed={activeTab === tab}
            style={{
              padding: '0.6rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              borderBottom: activeTab === tab ? `3px solid ${teal}` : '3px solid transparent',
              background: 'transparent',
              color: activeTab === tab ? teal : muted,
              cursor: 'pointer',
              borderRadius: '0.4rem 0.4rem 0 0',
              transition: 'color 0.15s',
            }}
          >
            {tab === '2026' ? '2026 — Official' : '2027 — Official'}
          </button>
        ))}
      </div>

      {/* Tab Badge */}
      {activeTab === '2026' ? (
        <div style={{ background: '#f0fdf4', border: `1px solid #38a169`, borderRadius: '0.5rem', padding: '0.65rem 1rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#276749', fontWeight: 600 }}>
          ✅ <strong>2026 Social Security COLA: 2.8% — Official</strong> (announced October 24, 2025 by the Social Security Administration)
        </div>
      ) : (
        <div style={{ background: '#f0fdf4', border: `1px solid #38a169`, borderRadius: '0.5rem', padding: '0.65rem 1rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#276749', fontWeight: 600 }}>
          ✅ <strong>2027 Social Security COLA: 3.6% — Official</strong> (announced October 14, 2026 by the Social Security Administration)
        </div>
      )}

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Benefit Input */}
        <div>
          <label htmlFor={`${uid}-benefit`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: navy, marginBottom: '0.35rem' }}>
            Your current monthly Social Security benefit <span style={{ color: '#c53030' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '280px' }}>
            <span style={{ fontWeight: 700, color: teal, fontSize: '1.1rem' }}>$</span>
            <input
              id={`${uid}-benefit`}
              type="text"
              inputMode="decimal"
              value={benefitStr}
              onChange={e => setBenefitStr(e.target.value)}
              placeholder="e.g. 1900"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: `1.5px solid ${border}`, fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: muted, margin: '0.3rem 0 0' }}>
            Enter your gross monthly benefit before Medicare Part B is deducted.{' '}
            <a href="/tools/social-security-benefits-calculator/" style={{ color: teal, fontWeight: 600 }}>
              Don't know your amount? Estimate it here ↗
            </a>
          </p>
        </div>

        {/* 2026: locked rate display */}
        {activeTab === '2026' && (
          <div style={{ background: '#f6f8fa', borderRadius: '0.5rem', padding: '0.75rem 1rem', border: `1px solid ${border}` }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: teal, display: 'block', marginBottom: '0.2rem' }}>COLA Rate (2026 Official)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: teal }}>2.8%</span>
            <span style={{ fontSize: '0.8rem', color: muted, marginLeft: '0.5rem' }}>Locked — confirmed by SSA, effective January 2026</span>
          </div>
        )}

        {/* 2027: official locked rate display */}
        {activeTab === '2027' && (
          <div style={{ background: '#f6f8fa', borderRadius: '0.5rem', padding: '0.75rem 1rem', border: `1px solid ${border}` }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: teal, display: 'block', marginBottom: '0.2rem' }}>COLA Rate (2027 Official)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: teal }}>3.6%</span>
            <span style={{ fontSize: '0.8rem', color: muted, marginLeft: '0.5rem' }}>Locked — announced October 14, 2026 by SSA, effective January 2027</span>
          </div>
        )}

        {/* Optional Medicare Offset */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', color: navy }}>
            <input
              type="checkbox"
              checked={showMedicare}
              onChange={e => setShowMedicare(e.target.checked)}
              style={{ width: '1.1rem', height: '1.1rem', accentColor: teal }}
            />
            Model Medicare Part B premium offset (optional scenario)
          </label>
          {showMedicare && (
            <div style={{ marginTop: '0.75rem', paddingLeft: '1.75rem' }}>
              <label htmlFor={`${uid}-partb`} style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: navy, marginBottom: '0.3rem' }}>
                Estimated Part B monthly premium increase
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', maxWidth: '260px' }}>
                <span style={{ fontWeight: 700, color: teal }}>$</span>
                <input
                  id={`${uid}-partb`}
                  type="text"
                  inputMode="decimal"
                  value={partBOffsetStr}
                  onChange={e => setPartBOffsetStr(e.target.value)}
                  placeholder="e.g. 17.90"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: `1.5px solid ${border}`, fontSize: '1rem' }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: muted, margin: '0.3rem 0 0', maxWidth: '56ch' }}>
                The standard Part B premium rose by $17.90 in 2026 (from $185.00 to $202.90). The 2027 Part B premium will be announced separately by CMS, typically in November 2026. Enter any amount to model the offset.{' '}
                <a href="https://www.medicare.gov/basics/costs/medicare-costs" target="_blank" rel="noopener noreferrer" style={{ color: teal }}>Check current Part B costs at medicare.gov ↗</a>
              </p>
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
          style={{ background: teal, color: '#fff', fontWeight: 700, fontSize: '1.05rem', padding: '0.85rem 1.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          Calculate My COLA Increase →
        </button>
      </form>

      {/* Results */}
      {result && (
        <div style={{ marginTop: '2rem', borderTop: `2px dashed ${border}`, paddingTop: '1.5rem' }}>

          {/* Year + official/projected badge */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-block',
              background: activeTab === '2026' ? '#dcfce7' : '#fef9c3',
              color: activeTab === '2026' ? '#166534' : '#854d0e',
              fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              padding: '0.2rem 0.65rem', borderRadius: '9999px',
            }}>
              {activeTab === '2026' ? '2026 — Official 2.8%' : `2027 — Projected ${fmt(result.colaRate, 1)}%`}
            </span>
          </div>

          {/* Primary result card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>
              Estimated New Monthly Benefit
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#E8761A', margin: '0.15rem 0' }}>
              ${fmt(result.newMonthlyBenefit)} <span style={{ fontSize: '1rem', color: muted, fontWeight: 600 }}>/ month</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: navy, margin: 0, fontWeight: 600 }}>
              Gross increase: <strong>+${fmt(result.monthlyIncrease)}/mo</strong>
              {result.partBOffset > 0 && (
                <> &nbsp;|&nbsp; Net after Part B offset: <strong>+${fmt(result.netMonthlyIncrease)}/mo</strong></>
              )}
            </p>
          </div>

          {/* Breakdown grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Monthly Increase', value: `+$${fmt(result.monthlyIncrease)}` },
              { label: 'Annual Increase', value: `+$${fmt(result.annualIncrease)}` },
              { label: 'COLA Rate', value: `${fmt(result.colaRate, 1)}%` },
              ...(result.partBOffset > 0 ? [{ label: 'Net Monthly (after Part B)', value: `+$${fmt(result.netMonthlyIncrease)}` }] : []),
            ].map(item => (
              <div key={item.label} style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '0.5rem', border: `1px solid ${border}` }}>
                <span style={{ fontSize: '0.78rem', color: muted, fontWeight: 600, display: 'block' }}>{item.label}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: teal }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Calculation detail */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.1rem', border: `1px solid ${border}`, marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.975rem', color: teal, margin: '0 0 0.65rem', fontWeight: 700 }}>Calculation Detail</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Current monthly benefit: <strong>${fmt(result.currentBenefit)}</strong></li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>COLA rate applied: <strong>{fmt(result.colaRate, 1)}%</strong>{' (official)'}</li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Gross monthly increase: <strong>+${fmt(result.monthlyIncrease)}</strong></li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>New gross monthly benefit: <strong>${fmt(result.newMonthlyBenefit)}</strong></li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Estimated annual increase: <strong>+${fmt(result.annualIncrease)}</strong></li>
              {result.partBOffset > 0 && (
                <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Part B premium offset (scenario only): <strong>−${fmt(result.partBOffset)}/mo</strong></li>
              )}
              {result.partBOffset > 0 && (
                <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Net estimated monthly increase: <strong>+${fmt(result.netMonthlyIncrease)}</strong></li>
              )}
              {activeTab === '2026' && (
                <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>COLA effective date: <strong>January 2026</strong> (SSI: December 31, 2025)</li>
              )}
              {activeTab === '2027' && (
                <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>COLA effective date: <strong>January 2027</strong> (SSI: December 31, 2026)</li>
              )}
            </ul>
          </div>

          {/* Confirmation note for official 2027 */}
          {activeTab === '2027' && (
            <div style={{ background: '#f0fdf4', borderLeft: `4px solid #38a169`, borderRadius: '0 0.4rem 0.4rem 0', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#276749', marginBottom: '1rem' }}>
              <strong>Official 2027 COLA:</strong> The SSA officially announced the 3.6% COLA on October 14, 2026. These figures reflect the official rate applied to your entered benefit amount. Illustrative only — confirm your personal amount with SSA at <a href="https://www.ssa.gov/myaccount" target="_blank" rel="noopener noreferrer" style={{ color: '#276749' }}>ssa.gov/myaccount ↗</a>
            </div>
          )}

          {/* Connected tools */}
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.1rem', border: `1.5px solid ${border}` }}>
            <h4 style={{ fontSize: '0.975rem', color: teal, margin: '0 0 0.65rem', fontWeight: 700 }}>Related Guides &amp; Tools</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <li style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.5 }}>
                <a href="/social-security/social-security-cola-2027/" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
                  Social Security COLA 2027 — Official Guide ↗
                </a>{' '}
                — Understand why the 2027 rate is 3.6%, when it takes effect, and what it means for your benefit.
              </li>
              <li style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.5 }}>
                <a href="/social-security/social-security-cola-2026/" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
                  Social Security COLA 2026 — Official Guide ↗
                </a>{' '}
                — The 2.8% rate that took effect January 2026.
              </li>
              <li style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.5 }}>
                <a href="/tools/medicare-premium-calculator/" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
                  Medicare Premium Calculator ↗
                </a>{' '}
                — Check your exact Part B premium and whether IRMAA surcharges apply to you.
              </li>
              <li style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.5 }}>
                <a href="/tools/retirement-tax-calculator/" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
                  Retirement Tax Estimator ↗
                </a>{' '}
                — See how a higher COLA benefit could affect how much of your Social Security is taxable.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Backward-compatible alias so the old estimator page import still resolves
export const SocialSecurityCOLAEstimator = SocialSecurityCOLACalculator;
