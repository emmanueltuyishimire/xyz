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
  futureTaxRate: number;
  expectedReturn: number;
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
  const [futureTaxRate, setFutureTaxRate] = useState<number>(0.22); // 22% expected future tax rate
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
        if (magi > 500000) return { surcharge: 487.00, tier: 'Tier 5 (> $500k)' };
        if (magi > 205000) return { surcharge: 446.30, tier: 'Tier 4 ($205k–$500k)' };
        if (magi > 171000) return { surcharge: 324.60, tier: 'Tier 3 ($171k–$205k)' };
        if (magi > 137000) return { surcharge: 202.90, tier: 'Tier 2 ($137k–$171k)' };
        if (magi > 109000) return { surcharge: 81.20, tier: 'Tier 1 ($109k–$137k)' };
        return { surcharge: 0, tier: 'Base Bracket ($0 Surcharge)' };
      } else {
        if (magi > 750000) return { surcharge: 487.00, tier: 'Tier 5 (> $750k)' };
        if (magi > 410000) return { surcharge: 446.30, tier: 'Tier 4 ($410k–$750k)' };
        if (magi > 342000) return { surcharge: 324.60, tier: 'Tier 3 ($342k–$410k)' };
        if (magi > 274000) return { surcharge: 202.90, tier: 'Tier 2 ($274k–$342k)' };
        if (magi > 218000) return { surcharge: 81.20, tier: 'Tier 1 ($218k–$274k)' };
        return { surcharge: 0, tier: 'Base Bracket ($0 Surcharge)' };
      }
    };

    const currentIrmaa = getIrmaa(currentMagi, filingStatus);
    const newIrmaa = getIrmaa(newMagi, filingStatus);

    const irmaaTriggered = newIrmaa.surcharge > currentIrmaa.surcharge;
    const monthlyIrmaaDiff = newIrmaa.surcharge - currentIrmaa.surcharge;
    const annualIrmaaCost = monthlyIrmaaDiff * 12 * (filingStatus === 'joint' ? 2 : 1);

    const totalCost = estimatedTaxOwed + annualIrmaaCost;

    // ─────────────────────────────────────────────────────────────────────
    // BREAK-EVEN WINDOW CALCULATION
    //
    // Break-even measures how many years of tax-free compound growth it
    // takes for cumulative tax savings on investment earnings to recoup
    // the upfront cost (conversion tax + any Medicare IRMAA surcharge).
    //
    // Over N years at annual growth rate r:
    //   Cumulative Investment Growth = C × ((1 + r)^N - 1)
    //   Future Tax Savings on Growth = futureTaxRate × C × ((1 + r)^N - 1)
    //
    // Upfront Cost = estimatedTaxOwed + annualIrmaaCost
    //
    // Setting Future Tax Savings = Upfront Cost:
    //   futureTaxRate × C × ((1 + r)^N - 1) = totalCost
    //   (1 + r)^N - 1 = totalCost / (C × futureTaxRate)
    //   (1 + r)^N = 1 + totalCost / (C × futureTaxRate)
    //   N = ln(1 + totalCost / (C × futureTaxRate)) / ln(1 + r)
    //
    // Edge cases:
    //  • futureTaxRate <= 0: Cannot recoup via future tax savings (set to 99)
    //  • expectedReturn <= 0: No investment growth (set to 99)
    // ─────────────────────────────────────────────────────────────────────
    let breakEvenYears: number;
    if (expectedReturn <= 0 || futureTaxRate <= 0) {
      breakEvenYears = 99;
    } else {
      const taxHurdleRatio = totalCost / (conversionAmount * futureTaxRate);
      const exactYears = Math.log(1 + taxHurdleRatio) / Math.log(1 + expectedReturn);
      breakEvenYears = Math.max(1, Math.ceil(exactYears));
    }

    const checklist = [
      `Conversion Amount: $${conversionAmount.toLocaleString()}`,
      `Estimated Federal Income Tax Owed: $${estimatedTaxOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })} (at ${(taxRate * 100).toFixed(0)}% tax rate).`,
      `New Total MAGI: $${newMagi.toLocaleString()} (increased from $${currentMagi.toLocaleString()}).`,
      irmaaTriggered
        ? `⚠️ IRMAA Warning: This conversion pushes your MAGI into ${newIrmaa.tier}, adding an extra $${monthlyIrmaaDiff.toFixed(2)}/mo ($${annualIrmaaCost.toFixed(2)}/yr) to your Medicare Part B premium two years later.`
        : '✅ No IRMAA Spike: Your conversion amount keeps your new MAGI below the next Medicare IRMAA threshold.',
      `Combined Upfront Conversion Cost (Tax + IRMAA): $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      `Estimated Tax Savings Break-Even Window: ~${breakEvenYears} year(s) of tax-free compound growth at ${(expectedReturn * 100).toFixed(0)}%/yr, assuming a ${(futureTaxRate * 100).toFixed(0)}% future tax bracket.`,
    ];

    setResult({
      conversionAmount,
      taxRate,
      futureTaxRate,
      expectedReturn,
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

        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0A3D3A', margin: '0 0 0.75rem 0' }}>
            Break-Even Assumptions (Growth &amp; Retirement Bracket)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor={`${uid}-future-tax`} style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#0D2137', marginBottom: '0.35rem' }}>
                5. Expected Retirement Tax Bracket
              </label>
              <select
                id={`${uid}-future-tax`}
                value={futureTaxRate}
                onChange={(e) => setFutureTaxRate(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value={0.10}>10% Bracket in Retirement</option>
                <option value={0.12}>12% Bracket in Retirement</option>
                <option value={0.22}>22% Bracket in Retirement</option>
                <option value={0.24}>24% Bracket in Retirement</option>
                <option value={0.32}>32% Bracket in Retirement</option>
                <option value={0.35}>35% Bracket in Retirement</option>
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-return`} style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#0D2137', marginBottom: '0.35rem' }}>
                6. Expected Annual Investment Return
              </label>
              <select
                id={`${uid}-return`}
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value={0.04}>4% Annual Return (Conservative)</option>
                <option value={0.05}>5% Annual Return (Moderate-Conservative)</option>
                <option value={0.06}>6% Annual Return (Moderate — Default)</option>
                <option value={0.07}>7% Annual Return (Moderate-Aggressive)</option>
                <option value={0.08}>8% Annual Return (Aggressive)</option>
              </select>
            </div>
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
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                At {(result.expectedReturn * 100).toFixed(0)}% return &amp; {(result.futureTaxRate * 100).toFixed(0)}% future tax
              </span>
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

          {/* Contextual Next-Step CTA */}
          <div
            style={{
              marginTop: '1.5rem',
              background: result.irmaaTriggered ? '#fffaf0' : '#f0fdf4',
              border: result.irmaaTriggered ? '2px solid #dd6b20' : '2px solid #0A3D3A',
              borderRadius: '0.75rem',
              padding: '1.25rem 1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden="true">
                {result.irmaaTriggered ? '⚠️' : '🎯'}
              </span>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: result.irmaaTriggered ? '#c05621' : '#0A3D3A',
                    marginBottom: '0.25rem',
                  }}
                >
                  Recommended Next Step
                </span>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', color: '#0D2137', fontWeight: 700 }}>
                  {result.irmaaTriggered
                    ? 'Verify Your Combined Part B & Part D IRMAA Surcharge'
                    : 'Calculate How Much This Conversion Shrinks Your Future RMDs'}
                </h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.925rem', color: '#4B5A6E', lineHeight: 1.55 }}>
                  {result.irmaaTriggered
                    ? `Your planned ${result.conversionAmount.toLocaleString()} conversion pushes your MAGI into ${result.newIrmaaTier}. Check your full Medicare cost — including Part D prescription drug surcharges — before executing this conversion.`
                    : 'Your conversion safely stays below the Medicare IRMAA cliff. Your next planning priority is checking how many thousands this removes from mandatory distributions starting at age 73 or 75.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={result.irmaaTriggered ? '/tools/medicare-irmaa-calculator/' : '/tools/rmd-calculator/'}
                    style={{
                      display: 'inline-block',
                      background: '#0A3D3A',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '0.5rem',
                      boxShadow: '0 2px 6px rgba(10,61,58,0.2)',
                    }}
                  >
                    {result.irmaaTriggered
                      ? 'Check Combined Part B + D Surcharges →'
                      : 'Calculate Future RMD Reductions →'}
                  </a>
                  <a
                    href={result.irmaaTriggered ? '/tools/rmd-calculator/' : '/tools/medicare-irmaa-calculator/'}
                    style={{
                      fontSize: '0.875rem',
                      color: '#0A3D3A',
                      textDecoration: 'underline',
                      fontWeight: 600,
                    }}
                  >
                    {result.irmaaTriggered
                      ? 'Or calculate future RMD impact'
                      : 'Or double-check IRMAA safe harbor limits'}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
