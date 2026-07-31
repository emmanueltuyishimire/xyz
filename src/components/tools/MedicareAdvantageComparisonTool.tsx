import React, { useState, useId } from 'react';

/**
 * MedicareAdvantageComparisonTool.tsx
 * Tool: Original Medicare vs. Medicare Advantage Comparison Tool
 * Primary keyword: medicare vs medicare advantage comparison tool
 */

export type HealthNeed = 'low' | 'moderate' | 'high';
export type DoctorPreference = 'strict' | 'flexible';

interface ComparisonResult {
  originalCostEst: number;
  advantageCostEst: number;
  originalOutofPocketCap: string;
  advantageOutofPocketCap: string;
  recommendedOption: string;
  comparisonPoints: { feature: string; original: string; advantage: string }[];
}

export const MedicareAdvantageComparisonTool: React.FC = () => {
  const uid = useId();

  const [healthNeed, setHealthNeed] = useState<HealthNeed>('moderate');
  const [doctorPref, setDoctorPref] = useState<DoctorPreference>('flexible');
  const [wantsMedigap, setWantsMedigap] = useState<boolean>(true);
  const [travelsFrequently, setTravelsFrequently] = useState<boolean>(false);

  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // 2026 Baseline Cost Estimates:
    // Original Medicare Part B: $202.90
    // Medigap Plan G average: $165.00
    // Part D standalone drug plan average: $45.00
    // Total Original Medicare + Medigap + Part D = ~$412.90/mo fixed, ~$0 out-of-pocket for doctor/hospital

    // Medicare Advantage (Part C):
    // Part B premium: $202.90 (still required!)
    // Advantage plan premium: $0 to $35/mo average
    // Variable copays depending on health need (low: $200/yr, mod: $1,500/yr, high: $4,500/yr up to $8,850 OOP max)

    const basePartB = 202.90;
    const originalFixedMonthly = basePartB + (wantsMedigap ? 165 : 0) + 45;
    const originalCostEst = originalFixedMonthly * 12 + (wantsMedigap ? 240 : 1600); // $240 Part B deductible if Medigap Plan G

    let advantagePlanPrem = 15; // avg MAPD plan premium
    let advantageOopSpend = 300;
    if (healthNeed === 'moderate') advantageOopSpend = 1800;
    else if (healthNeed === 'high') advantageOopSpend = 4800;

    const advantageCostEst = (basePartB + advantagePlanPrem) * 12 + advantageOopSpend;

    let recommendedOption = '';
    if (doctorPref === 'strict' || travelsFrequently || healthNeed === 'high') {
      recommendedOption = 'Original Medicare + Medigap (Supplement Plan G)';
    } else {
      recommendedOption = 'Medicare Advantage (Part C Plan)';
    }

    const comparisonPoints = [
      {
        feature: 'Doctor & Hospital Network',
        original: 'Nationwide — See any doctor/hospital in the U.S. that accepts Medicare. No network restrictions or referrals needed.',
        advantage: 'Restricted Network — HMO or PPO network. Primary doctor referrals often required for specialists. Out-of-network care may not be covered.',
      },
      {
        feature: 'Prior Authorization Rules',
        original: 'Rare — Prior authorization is almost never required for medically necessary treatments approved by your doctor.',
        advantage: 'Frequent — Prior authorization required for many procedures, MRI scans, skilled nursing stays, and specialized treatments.',
      },
      {
        feature: 'Maximum Out-of-Pocket Risk',
        original: wantsMedigap ? '$240/year (Part B deductible only with Plan G)' : 'Unlimited (No OOP cap without Medigap)',
        advantage: 'Capped legally at up to $8,850/year for in-network care ($13,300 for in & out-of-network combined in 2026).',
      },
      {
        feature: 'Extra Benefits (Dental/Vision)',
        original: 'Not Included — Must purchase separate dental, vision, and hearing coverage.',
        advantage: 'Included — Most plans bundle basic dental, vision, hearing allowances, and gym memberships.',
      },
    ];

    setResult({
      originalCostEst,
      advantageCostEst,
      originalOutofPocketCap: wantsMedigap ? '$240/year (Plan G)' : 'Unlimited',
      advantageOutofPocketCap: '$8,850/year In-Network Cap',
      recommendedOption,
      comparisonPoints,
    });
  };

  return (
    <div
      className="ma-comparison-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Original Medicare vs. Medicare Advantage Comparison Tool
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Compare estimated annual costs, doctor network rules, prior authorization restrictions, and out-of-pocket risk side-by-side.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-health`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Expected Medical Care Needs
          </label>
          <select
            id={`${uid}-health`}
            value={healthNeed}
            onChange={(e) => setHealthNeed(e.target.value as HealthNeed)}
            style={{ width: '100%', maxWidth: '380px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="low">Low — Annual checkup, rare doctor visits</option>
            <option value="moderate">Moderate — Regular specialist visits, daily medications</option>
            <option value="high">High — Frequent treatments, upcoming surgeries, chronic conditions</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-doctor`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Doctor &amp; Hospital Preferences
          </label>
          <select
            id={`${uid}-doctor`}
            value={doctorPref}
            onChange={(e) => setDoctorPref(e.target.value as DoctorPreference)}
            style={{ width: '100%', maxWidth: '380px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="flexible">Flexible — Willing to use a local HMO/PPO doctor network</option>
            <option value="strict">Strict — Want freedom to see any specialist nationwide without referral</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id={`${uid}-medigap`}
              type="checkbox"
              checked={wantsMedigap}
              onChange={(e) => setWantsMedigap(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-medigap`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              Include Medigap (Supplement Plan G) in Original Medicare comparison
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id={`${uid}-travel`}
              type="checkbox"
              checked={travelsFrequently}
              onChange={(e) => setTravelsFrequently(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-travel`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              I travel frequently or live in multiple states throughout the year
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
          Compare Coverage Options →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Recommendation Card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Personalized Coverage Alignment
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              Recommended: {result.recommendedOption}
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, lineHeight: 1.5 }}>
              Est. Total Annual Cost (Premiums + Copays): <strong>Original Medicare: ~${result.originalCostEst.toFixed(0)}/yr</strong> vs. <strong>Medicare Advantage: ~${result.advantageCostEst.toFixed(0)}/yr</strong>.
            </p>
          </div>

          {/* Side-by-Side Table */}
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.925rem' }}>
              <thead>
                <tr style={{ background: '#0A3D3A' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Feature</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Original Medicare (+ Medigap)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#fff', fontWeight: 700 }}>Medicare Advantage (Part C)</th>
                </tr>
              </thead>
              <tbody>
                {result.comparisonPoints.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#f6f8fa' : '#ffffff' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0D2137', verticalAlign: 'top', minWidth: '150px' }}>{row.feature}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#0D2137', verticalAlign: 'top' }}>{row.original}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#0D2137', verticalAlign: 'top' }}>{row.advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
