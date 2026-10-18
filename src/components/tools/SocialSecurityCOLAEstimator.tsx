import React, { useState, useId } from 'react';
import { OFFICIAL_2027_COLA } from '../../data/constants';

/**
 * SocialSecurityCOLAEstimator.tsx
 * Primary keyword: Social Security COLA Calculator
 * Official 2027 COLA: 3.6% (announced October 14, 2026 by SSA)
 * Secondary tab: 2026 COLA (2.8% official)
 *
 * Exported as both SocialSecurityCOLACalculator (canonical) and
 * SocialSecurityCOLAEstimator (backward-compat alias).
 */

const COLA_2026_OFFICIAL = 2.8;
const COLA_2027_OFFICIAL = OFFICIAL_2027_COLA.rate; // 3.6%
const SSA_AVG_RETIREMENT_INCREASE = OFFICIAL_2027_COLA.averageMonthlyIncrease; // $75

interface CalcResult {
  currentBenefit: number;
  colaRate: number;
  monthlyIncrease: number;
  newMonthlyBenefit: number;
  annualIncrease: number;
  netMonthlyIncrease: number;
  partBOffset: number;
  diffFromAvg: number;
}

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const SocialSecurityCOLACalculator: React.FC = () => {
  const uid = useId();
  // Default to 2027 tab; 2026 is secondary
  const [activeTab, setActiveTab] = useState<'2027' | '2026'>('2027');

  // Benefit input
  const [benefitStr, setBenefitStr] = useState('1900');

  // Medicare offset (optional scenario)
  const [showMedicare, setShowMedicare] = useState(false);
  const [partBOffsetStr, setPartBOffsetStr] = useState('0.00');

  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState('');

  const getActiveRate = (): number => {
    return activeTab === '2027' ? COLA_2027_OFFICIAL : COLA_2026_OFFICIAL;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanStr = benefitStr.trim();
    if (!cleanStr || cleanStr.includes('-')) {
      setError('Please enter a valid monthly Social Security benefit amount greater than $0.');
      setResult(null);
      return;
    }

    const benefit = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
    if (isNaN(benefit) || benefit <= 0) {
      setError('Please enter a valid monthly Social Security benefit amount greater than $0.');
      setResult(null);
      return;
    }

    const rate = getActiveRate();
    const partBOffset = showMedicare ? Math.max(0, parseFloat(partBOffsetStr.replace(/[^0-9.]/g, '')) || 0) : 0;
    const monthly = benefit * (rate / 100);
    const newBenefit = benefit + monthly;
    const annual = monthly * 12;
    const diffFromAvg = monthly - SSA_AVG_RETIREMENT_INCREASE;

    setError('');
    setResult({
      currentBenefit: benefit,
      colaRate: rate,
      monthlyIncrease: monthly,
      newMonthlyBenefit: newBenefit,
      annualIncrease: annual,
      netMonthlyIncrease: Math.max(0, monthly - partBOffset),
      partBOffset,
      diffFromAvg,
    });
  };

  const teal = '#0A3D3A';
  const gold = '#C9933A';
  const navy = '#0D2137';
  const border = '#DDE3EA';
  const muted = '#4B5A6E';

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: `2px solid ${teal}`, padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>

      {/* Year Tabs: 2027 (default) first, 2026 secondary */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: `2px solid ${border}`, paddingBottom: '0' }}>
        {(['2027', '2026'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setResult(null);
              setError('');
              if (tab === '2026' && partBOffsetStr === '0.00') {
                setPartBOffsetStr('17.90'); // 2026 Part B increase was $17.90
              } else if (tab === '2027' && partBOffsetStr === '17.90') {
                setPartBOffsetStr('0.00'); // 2027 Part B not yet announced
              }
            }}
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
            {tab === '2027' ? '2027 — Official (3.6%)' : '2026 — Official (2.8%)'}
          </button>
        ))}
      </div>

      {/* Tab Badge */}
      {activeTab === '2027' ? (
        <div style={{ background: '#f0fdf4', border: `1px solid #38a169`, borderRadius: '0.5rem', padding: '0.65rem 1rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
          ✅ <strong>2027 Social Security COLA: 3.6% — Official</strong> (announced October 14, 2026 by the Social Security Administration; effective January 2027 payments, SSI on December 31, 2026)
        </div>
      ) : (
        <div style={{ background: '#f8fafc', border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '0.65rem 1rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
          📋 <strong>2026 Social Security COLA: 2.8% — Official Archive</strong> (announced October 24, 2025; effective January 2026 payments).{' '}
          <a href="/social-security/social-security-cola-2026/" style={{ color: teal, textDecoration: 'underline' }}>Read the full 2026 guide ↗</a>
        </div>
      )}

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Benefit Input */}
        <div>
          <label htmlFor={`${uid}-benefit`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: navy, marginBottom: '0.35rem' }}>
            Your current monthly Social Security benefit <span style={{ color: '#c53030' }} aria-hidden="true">*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '280px' }}>
            <span style={{ fontWeight: 700, color: teal, fontSize: '1.1rem' }} aria-hidden="true">$</span>
            <input
              id={`${uid}-benefit`}
              type="text"
              inputMode="decimal"
              value={benefitStr}
              onChange={e => setBenefitStr(e.target.value)}
              placeholder="e.g. 1900"
              aria-required="true"
              aria-describedby={`${uid}-benefit-desc`}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: `1.5px solid ${border}`, fontSize: '1rem' }}
            />
          </div>
          <p id={`${uid}-benefit-desc`} style={{ fontSize: '0.825rem', color: muted, margin: '0.3rem 0 0' }}>
            Enter your gross monthly benefit before Medicare Part B is deducted.{' '}
            <a href="/tools/social-security-benefits-calculator/" style={{ color: teal, fontWeight: 600 }}>
              Don't know your amount? Estimate it here ↗
            </a>
          </p>
        </div>

        {/* Locked rate display */}
        <div style={{ background: '#f6f8fa', borderRadius: '0.5rem', padding: '0.75rem 1rem', border: `1px solid ${border}` }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: teal, display: 'block', marginBottom: '0.2rem' }}>
            COLA Rate Applied ({activeTab === '2027' ? '2027 Official' : '2026 Official'})
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: teal }}>
            {activeTab === '2027' ? '3.6%' : '2.8%'}
          </span>
          <span style={{ fontSize: '0.8rem', color: muted, marginLeft: '0.5rem' }}>
            {activeTab === '2027'
              ? 'Official SSA announcement October 14, 2026 — benefits rise January 2027'
              : 'Official SSA announcement October 24, 2025 — effective January 2026'}
          </span>
        </div>

        {/* Optional Medicare Offset */}
        {/* CMS PART B 2027 UPDATE PENDING: Revise when CMS announces official 2027 Part B standard premium in mid-November 2026 */}
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
                  placeholder="e.g. 0.00"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: `1.5px solid ${border}`, fontSize: '1rem' }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: muted, margin: '0.3rem 0 0', maxWidth: '58ch' }}>
                {activeTab === '2027' ? (
                  <>
                    <em>Note:</em> The 2027 Medicare Part B premium has <strong>not yet been announced</strong> by CMS (typically released in mid-November 2026). Enter any dollar offset to test how a premium adjustment affects your net deposit.
                  </>
                ) : (
                  <>
                    For 2026, the standard Part B premium rose by $17.90 (from $185.00 to $202.90/month).
                  </>
                )}{' '}
                <a href="https://www.medicare.gov/basics/costs/medicare-costs" target="_blank" rel="noopener noreferrer" style={{ color: teal }}>Check official Part B costs at medicare.gov ↗</a>
              </p>
            </div>
          )}
        </div>

        {error && (
          <div role="alert" style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.9rem' }}>
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
        <div style={{ marginTop: '2rem', borderTop: `2px dashed ${border}`, paddingTop: '1.5rem' }} aria-live="polite">

          {/* Year + official badge */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-block',
              background: '#dcfce7',
              color: '#166534',
              fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              padding: '0.25rem 0.75rem', borderRadius: '9999px',
            }}>
              {activeTab === '2027' ? '2027 — Official 3.6% Increase' : '2026 — Official 2.8% Increase'}
            </span>
          </div>

          {/* Primary result card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>
              New Estimated Monthly Benefit ({activeTab === '2027' ? 'Effective January 2027' : 'Effective January 2026'})
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#E8761A', margin: '0.15rem 0' }}>
              ${fmt(result.newMonthlyBenefit)} <span style={{ fontSize: '1rem', color: muted, fontWeight: 600 }}>/ month</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: navy, margin: 0, fontWeight: 600 }}>
              Gross increase: <strong>+${fmt(result.monthlyIncrease)}/mo</strong> (+${fmt(result.annualIncrease)}/year)
              {result.partBOffset > 0 && (
                <> &nbsp;|&nbsp; Net after Part B offset: <strong>+${fmt(result.netMonthlyIncrease)}/mo</strong></>
              )}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0.5rem 0 0', fontWeight: 600 }}>
              📅 Appears in {activeTab === '2027' ? 'January 2027 payments (SSI paid December 31, 2026)' : 'January 2026 payments (SSI paid December 31, 2025)'}.
            </p>
          </div>

          {/* Comparison with SSA Average & Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '0.5rem', border: `1px solid ${border}` }}>
              <span style={{ fontSize: '0.78rem', color: muted, fontWeight: 600, display: 'block' }}>Monthly Gross Increase</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: teal }}>+${fmt(result.monthlyIncrease)}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '0.5rem', border: `1px solid ${border}` }}>
              <span style={{ fontSize: '0.78rem', color: muted, fontWeight: 600, display: 'block' }}>Annual Gross Increase</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: teal }}>+${fmt(result.annualIncrease)}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '0.5rem', border: `1px solid ${border}` }}>
              <span style={{ fontSize: '0.78rem', color: muted, fontWeight: 600, display: 'block' }}>Official COLA Rate</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: teal }}>{fmt(result.colaRate, 1)}%</span>
            </div>
            {activeTab === '2027' && (
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '0.5rem', border: `1px solid ${border}` }}>
                <span style={{ fontSize: '0.78rem', color: muted, fontWeight: 600, display: 'block' }}>Vs. SSA Retired Avg (~$75)</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: result.diffFromAvg >= 0 ? '#166534' : '#854d0e' }}>
                  {result.diffFromAvg > 0 ? `+$${fmt(result.diffFromAvg)}/mo` : result.diffFromAvg < 0 ? `-$${fmt(Math.abs(result.diffFromAvg))}/mo` : 'Matches average'}
                </span>
              </div>
            )}
            {result.partBOffset > 0 && (
              <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '0.5rem', border: `1px solid ${border}` }}>
                <span style={{ fontSize: '0.78rem', color: muted, fontWeight: 600, display: 'block' }}>Net Monthly (after Part B)</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: teal }}>+${fmt(result.netMonthlyIncrease)}</span>
              </div>
            )}
          </div>

          {/* SSA Average Comparison Detail (2027) */}
          {activeTab === '2027' && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#1e3a8a' }}>
              <strong>SSA Benchmark Comparison:</strong> SSA states that the average monthly retirement benefit increases by <strong>about $75 per month</strong> starting January 2027 (based on the nationwide average retirement check of ~$2,074 before COLA). Your calculated increase of <strong>+${fmt(result.monthlyIncrease)}/mo</strong> is{' '}
              {Math.abs(result.diffFromAvg) < 0.05
                ? 'right in line with the national average.'
                : result.diffFromAvg > 0
                ? `$${fmt(result.diffFromAvg)}/month higher than the national average retired worker increase.`
                : `$${fmt(Math.abs(result.diffFromAvg))}/month lower than the national average retired worker increase.`}
            </div>
          )}

          {/* Rounding Rule Footnote */}
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '0.5rem', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#713f12', lineHeight: 1.55 }}>
            <strong>Note on SSA Benefit Rounding:</strong> Under Social Security Act § 215(i)(2)(A)(ii) (42 U.S.C. § 415(i)(2)(A)(ii)) and SSA Program Operations Manual System (POMS) RS 00601.120, after application of the 3.6% COLA to your Primary Insurance Amount, the monthly benefit is rounded down to the next lower multiple of $0.10. Furthermore, under § 215(g) and POMS RS 00601.020, final monthly payment checks after deductions are rounded down to the next lower whole dollar. Your official COLA notice from SSA may therefore differ from mathematical estimates by a few cents.
          </div>

          {/* Calculation detail */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.1rem', border: `1px solid ${border}`, marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.975rem', color: teal, margin: '0 0 0.65rem', fontWeight: 700 }}>Calculation Summary</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Current gross benefit: <strong>${fmt(result.currentBenefit)}</strong></li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Official COLA percentage: <strong>{fmt(result.colaRate, 1)}%</strong></li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Monthly increase (gross): <strong>+${fmt(result.monthlyIncrease)}</strong></li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>New gross monthly benefit: <strong>${fmt(result.newMonthlyBenefit)}</strong></li>
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Estimated annual increase: <strong>+${fmt(result.annualIncrease)}</strong></li>
              {result.partBOffset > 0 && (
                <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Part B premium offset (scenario model): <strong>−${fmt(result.partBOffset)}/mo</strong></li>
              )}
              {result.partBOffset > 0 && (
                <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>Net estimated monthly increase: <strong>+${fmt(result.netMonthlyIncrease)}</strong></li>
              )}
              <li style={{ fontSize: '0.9rem', color: navy, lineHeight: 1.5 }}>
                Payment effective date: <strong>{activeTab === '2027' ? 'January 2027 (SSI on December 31, 2026)' : 'January 2026 (SSI on December 31, 2025)'}</strong>
              </li>
            </ul>
          </div>

          {/* SSA Official Timeline Notice */}
          {activeTab === '2027' && (
            <div style={{ background: '#f0fdf4', borderLeft: `4px solid #38a169`, borderRadius: '0 0.4rem 0.4rem 0', padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#166534', marginBottom: '1rem', lineHeight: 1.6 }}>
              <strong>Official SSA Notice Timeline:</strong> Official COLA notices will be available online in <em>late November 2026</em> for beneficiaries with a <em>my Social Security</em> account created by <strong>November 18, 2026</strong>. SSA mails paper notices throughout December 2026. View your official personal notice at <a href="https://www.ssa.gov/myaccount" target="_blank" rel="noopener noreferrer" style={{ color: '#166534', fontWeight: 700, textDecoration: 'underline' }}>ssa.gov/myaccount ↗</a>
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
                — Wage base ($192,300), timeline, CPI-W inflation calculations, and full details.
              </li>
              <li style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.5 }}>
                <a href="/tools/social-security-tax-calculator/" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
                  Social Security Tax Calculator ↗
                </a>{' '}
                — See how your higher COLA benefit affects your taxable income under IRS provisional income rules.
              </li>
              <li style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.5 }}>
                <a href="/tools/medicare-premium-calculator/" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
                  Medicare Premium Calculator ↗
                </a>{' '}
                — Check your Part B and Part D premiums and whether IRMAA surcharges apply.
              </li>
              <li style={{ fontSize: '0.9rem', color: muted, lineHeight: 1.5 }}>
                <a href="/social-security/social-security-cola-2026/" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
                  Social Security COLA 2026 — Official Guide ↗
                </a>{' '}
                — Archive of the 2.8% rate that took effect January 2026.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Backward-compatible alias
export const SocialSecurityCOLAEstimator = SocialSecurityCOLACalculator;
export default SocialSecurityCOLACalculator;
