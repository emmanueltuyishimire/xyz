import React, { useState, useId } from 'react';

/**
 * MedicareDonutHoleCalculator.tsx
 * Tool: Medicare Donut Hole / Coverage Gap Calculator
 * Primary keyword: medicare donut hole calculator
 * Supporting keywords: coverage gap calculator medicare, medicare coverage gap
 */

interface DonutHoleResult {
  totalOutofPocket: number;
  outOfPocketCap: number; // $2,000 in 2026
  remainingToCap: number;
  currentPhase: string;
  phaseDescription: string;
  catastrophicReached: boolean;
  checklist: string[];
}

export const MedicareDonutHoleCalculator: React.FC = () => {
  const uid = useId();

  const [ytdSpendStr, setYtdSpendStr] = useState<string>('850');
  const [monthlyDrugCostStr, setMonthlyDrugCostStr] = useState<string>('250');

  const [result, setResult] = useState<DonutHoleResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const ytdSpend = Math.max(0, parseFloat(ytdSpendStr.replace(/[^0-9.]/g, '')) || 0);
    const monthlyCost = Math.max(0, parseFloat(monthlyDrugCostStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(ytdSpend) || isNaN(monthlyCost)) {
      setError('Please enter valid numeric dollar amounts.');
      setResult(null);
      return;
    }

    setError('');

    // Under Inflation Reduction Act (2025/2026):
    // Out-of-pocket cap is strictly $2,000 for Part D prescription drugs.
    // Once out-of-pocket reaches $2,000, copays drop to $0.
    const outOfPocketCap = 2000;
    const totalOutofPocket = ytdSpend;
    const remainingToCap = Math.max(0, outOfPocketCap - totalOutofPocket);
    const catastrophicReached = totalOutofPocket >= outOfPocketCap;

    let currentPhase = '';
    let phaseDescription = '';

    if (catastrophicReached) {
      currentPhase = 'Catastrophic Phase ($0 Copays)';
      phaseDescription = 'You have reached the 2026 $2,000 out-of-pocket cap! You pay $0 for all covered Medicare Part D prescription drugs for the remainder of the calendar year.';
    } else if (totalOutofPocket < 590) {
      currentPhase = 'Deductible Phase';
      phaseDescription = `You are currently in the initial deductible phase ($590 maximum deductible in 2026). You pay 100% of retail drug costs until your deductible is met. You need $${(590 - totalOutofPocket).toFixed(2)} more in out-of-pocket spend to reach Initial Coverage.`;
    } else {
      currentPhase = 'Initial Coverage / Coverage Gap Phase';
      phaseDescription = `You pay your plan's copays or coinsurance (capped at 25% for brand and generic drugs). Under 2026 Inflation Reduction Act rules, you have $${remainingToCap.toFixed(2)} remaining before hitting the $2,000 cap, after which all covered drugs become $0.`;
    }

    // Estimate months remaining until $2,000 cap is reached
    const monthsToCap = monthlyCost > 0 ? Math.ceil(remainingToCap / (monthlyCost * 0.25)) : 99;

    const checklist = [
      `Current YTD Out-of-Pocket Spend: $${totalOutofPocket.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      `2026 Federal Out-of-Pocket Cap: $${outOfPocketCap.toLocaleString()}.`,
      catastrophicReached
        ? '🎉 $2,000 Cap Reached: All covered Part D drugs are 100% covered ($0 copay) through December 31.'
        : `Amount Remaining Until $0 Copays: $${remainingToCap.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      !catastrophicReached && monthlyCost > 0 && monthsToCap <= 12
        ? `Estimated Time to Reach $0 Copay Phase: Approximately ${monthsToCap} month(s) based on your $${monthlyCost}/mo spending.`
        : 'Note: Part D Prescription Payment Plan (M3P) allows you to spread out-of-pocket drug costs into capped monthly installments.',
      'Manufacturer discounts on brand-name drugs count toward your $2,000 out-of-pocket threshold.',
    ];

    setResult({
      totalOutofPocket,
      outOfPocketCap,
      remainingToCap,
      currentPhase,
      phaseDescription,
      catastrophicReached,
      checklist,
    });
  };

  return (
    <div
      className="donut-hole-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Medicare Donut Hole / Coverage Gap Calculator 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Track your progress toward the 2026 $2,000 Part D out-of-pocket cap under Inflation Reduction Act rules.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-ytd`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Total Out-of-Pocket Prescription Spend YTD ($) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-ytd`}
              type="text"
              value={ytdSpendStr}
              onChange={(e) => setYtdSpendStr(e.target.value)}
              placeholder="e.g. 850"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Check your monthly Explanation of Benefits (EOB) under "TrOOP" (True Out-of-Pocket).
          </p>
        </div>

        <div>
          <label htmlFor={`${uid}-monthly`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Estimated Average Monthly Out-of-Pocket Drug Cost ($/mo)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-monthly`}
              type="text"
              value={monthlyDrugCostStr}
              onChange={(e) => setMonthlyDrugCostStr(e.target.value)}
              placeholder="e.g. 250"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
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
          Calculate Coverage Gap Status →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Status Banner */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background: result.catastrophicReached ? '#f0fdf4' : '#fffaf0',
              border: result.catastrophicReached ? '2px solid #38a169' : '2px solid #dd6b20',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: result.catastrophicReached ? '#276749' : '#c05621',
              }}
            >
              Current Status: {result.currentPhase}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0D2137', margin: '0.25rem 0' }}>
              {result.catastrophicReached ? '$0 Copay Phase Reached!' : `$${result.remainingToCap.toFixed(2)} Until $0 Copays`}
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, lineHeight: 1.5 }}>
              {result.phaseDescription}
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>YTD Spend (TrOOP)</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>${result.totalOutofPocket.toFixed(2)}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>2026 Hard Cap</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>$2,000.00</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Catastrophic Copay</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E8761A' }}>$0.00</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>After $2k cap</span>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Part D Coverage Gap Rules &amp; Savings Breakdown
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
