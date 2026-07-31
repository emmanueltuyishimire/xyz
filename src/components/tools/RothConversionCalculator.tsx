import React, { useState, useId } from 'react';

/**
 * RothConversionCalculator.tsx
 * Tool: Roth Conversion Calculator
 * Primary keyword: roth conversion calculator
 * Supporting keywords: should i convert to roth, roth ira conversion calculator retirement
 */

export type FilingStatus = 'single' | 'joint';

interface RothResult {
  conversionAmount: number;
  taxRate: number;
  estimatedTaxOwed: number;
  currentMagi: number;
  newMagi: number;
  irmaaTriggered: boolean;
  currentIrmaaTier: string;
  newIrmaaTier: string;
  annualIrmaaCost: number;
  totalCost: number; // Tax + IRMAA penalty
  breakEvenYears: number;
  checklist: string[];
}

export const RothConversionCalculator: React.FC = () => {
  const uid = useId();

  const [conversionStr, setConversionStr] = useState<string>('30000');
  const [currentMagiStr, setCurrentMagiStr] = useState<string>('95000');
  const [taxRate, setTaxRate] = useState<number>(0.22); // 22%
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [expectedReturn, setExpectedReturn] = useState<number>(0.06); // 6% annual growth

  const [result, setResult] = useState<RothResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const conversionAmount = Math.max(0, parseFloat(conversionStr.replace(/[^0-9.]/g, '')) || 0);
    const currentMagi = Math.max(0, parseFloat(currentMagiStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(conversionAmount) || conversionAmount <= 0) {
      setError('Please enter a valid conversion amount ($).');
      setResult(null);
      return;
    }

    setError('');

    const estimatedTaxOwed = conversionAmount * taxRate;
    const newMagi = currentMagi + conversionAmount;

    // Helper for 2026 IRMAA Part B monthly surcharge
    const getIrmaa = (magi: number, status: FilingStatus): { surcharge: number; tier: string } => {
      if (status === 'single') {
        if (magi > 500000) return { surcharge: 443.90, tier: 'Tier 5 (> $500k)' };
        if (magi > 193000) return { surcharge: 371.30, tier: 'Tier 4 ($193k–$500k)' };
        if (magi > 161000) return { surcharge: 265.20, tier: 'Tier 3 ($161k–$193k)' };
        if (magi > 133000) return { surcharge: 159.10, tier: 'Tier 2 ($133k–$161k)' };
        if (magi > 106000) return { surcharge: 81.20, tier: 'Tier 1 ($106k–$133k)' };
        return { surcharge: 0, tier: 'Base Bracket ($0 Surcharge)' };
      } else {
        if (magi > 750000) return { surcharge: 443.90, tier: 'Tier 5 (> $750k)' };
        if (magi > 386000) return { surcharge: 371.30, tier: 'Tier 4 ($386k–$750k)' };
        if (magi > 322000) return { surcharge: 265.20, tier: 'Tier 3 ($322k–$386k)' };
        if (magi > 266000) return { surcharge: 159.10, tier: 'Tier 2 ($266k–$322k)' };
        if (magi > 212000) return { surcharge: 81.20, tier: 'Tier 1 ($212k–$266k)' };
        return { surcharge: 0, tier: 'Base Bracket ($0 Surcharge)' };
      }
    };

    const currentIrmaa = getIrmaa(currentMagi, filingStatus);
    const newIrmaa = getIrmaa(newMagi, filingStatus);

    const irmaaTriggered = newIrmaa.surcharge > currentIrmaa.surcharge;
    const monthlyIrmaaDiff = newIrmaa.surcharge - currentIrmaa.surcharge;
    const annualIrmaaCost = monthlyIrmaaDiff * 12 * (filingStatus === 'joint' ? 2 : 1);

    const totalCost = estimatedTaxOwed + annualIrmaaCost;

    // Estimate break-even years assuming tax savings on future growth vs upfront tax + IRMAA cost
    const annualGrowth = conversionAmount * expectedReturn * taxRate;
    const breakEvenYears = annualGrowth > 0 ? Math.ceil(totalCost / annualGrowth) : 15;

    const checklist = [
      `Conversion Amount: $${conversionAmount.toLocaleString()}`,
      `Estimated Federal Income Tax Owed: $${estimatedTaxOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })} (at ${(taxRate * 100).toFixed(0)}% tax rate).`,
      `New Total MAGI: $${newMagi.toLocaleString()} (increased from $${currentMagi.toLocaleString()}).`,
      irmaaTriggered
        ? `⚠️ IRMAA Warning: This conversion pushes your MAGI into ${newIrmaa.tier}, adding an extra $${monthlyIrmaaDiff.toFixed(2)}/mo ($${annualIrmaaCost.toFixed(2)}/yr) to your Medicare Part B premium two years later.`
        : '✅ No IRMAA Spike: Your conversion amount keeps your new MAGI below the next Medicare IRMAA threshold.',
      `Combined Upfront Conversion Cost (Tax + IRMAA): $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      `Estimated Tax Savings Break-Even Window: ~${breakEvenYears} year(s) of tax-free compound growth.`,
    ];

    setResult({
      conversionAmount,
      taxRate,
      estimatedTaxOwed,
      currentMagi,
      newMagi,
      irmaaTriggered,
      currentIrmaaTier: currentIrmaa.tier,
      newIrmaaTier: newIrmaa.tier,
      annualIrmaaCost,
      totalCost,
      breakEvenYears,
      checklist,
    });
  };

  return (
    <div
      className="roth-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Roth Conversion Calculator 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Calculate your upfront tax bill and check if a Traditional-to-Roth IRA conversion triggers a Medicare IRMAA premium surcharge.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-conversion`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Amount to Convert to Roth IRA ($) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-conversion`}
              type="text"
              value={conversionStr}
              onChange={(e) => setConversionStr(e.target.value)}
              placeholder="e.g. 30000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-magi`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Current MAGI Before Conversion ($)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-magi`}
              type="text"
              value={currentMagiStr}
              onChange={(e) => setCurrentMagiStr(e.target.value)}
              placeholder="e.g. 95000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-tax-rate`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              3. Current Marginal Tax Rate
            </label>
            <select
              id={`${uid}-tax-rate`}
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value={0.10}>10% Marginal Bracket</option>
              <option value={0.12}>12% Marginal Bracket</option>
              <option value={0.22}>22% Marginal Bracket</option>
              <option value={0.24}>24% Marginal Bracket</option>
              <option value={0.32}>32% Marginal Bracket</option>
              <option value={0.35}>35% Marginal Bracket</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-filing`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              4. Tax Filing Status
            </label>
            <select
              id={`${uid}-filing`}
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value="single">Single / Head of Household</option>
              <option value="joint">Married Filing Jointly</option>
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
          Calculate Conversion Impact →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Status Card */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background: result.irmaaTriggered ? '#fffaf0' : '#f0fdf4',
              border: result.irmaaTriggered ? '2px solid #dd6b20' : '2px solid #38a169',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: result.irmaaTriggered ? '#c05621' : '#276749',
              }}
            >
              {result.irmaaTriggered ? '⚠️ IRMAA Medicare Surcharge Triggered' : '✅ No Medicare IRMAA Surcharge'}
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} Total Upfront Cost
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, lineHeight: 1.5 }}>
              Estimated Tax Owed: <strong>${result.estimatedTaxOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              {result.irmaaTriggered && (
                <> + IRMAA Medicare Cost: <strong>${result.annualIrmaaCost.toFixed(2)}/year</strong></>
              )}
            </p>
          </div>

          {/* Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Tax Owed at {(result.taxRate * 100).toFixed(0)}%</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>
                ${result.estimatedTaxOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>New MAGI</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: result.irmaaTriggered ? '#c05621' : '#0D2137' }}>
                ${result.newMagi.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{result.newIrmaaTier}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Est. Break-Even Window</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E8761A' }}>
                ~{result.breakEvenYears} Years
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Tax-free compound growth</span>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Roth Conversion Strategy Breakdown
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
