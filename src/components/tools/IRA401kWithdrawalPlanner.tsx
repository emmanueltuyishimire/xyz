import React, { useState, useId } from 'react';

/**
 * IRA401kWithdrawalPlanner.tsx
 * Tool: IRA / 401(k) Withdrawal Planner
 * Primary keyword: ira withdrawal planner
 */

interface PlannerResult {
  currentBalance: number;
  annualWithdrawal: number;
  monthlyWithdrawal: number;
  withdrawalRate: number;
  estimatedTaxOwed: number;
  netMonthlyIncome: number;
  yearsRemaining: number;
  isSustainable: boolean;
  checklist: string[];
}

export const IRA401kWithdrawalPlanner: React.FC = () => {
  const uid = useId();

  const [balanceStr, setBalanceStr] = useState<string>('450000');
  const [withdrawalRateInput, setWithdrawalRateInput] = useState<number>(4.0); // 4% rule
  const [taxRateInput, setTaxRateInput] = useState<number>(0.12); // 12% marginal tax
  const [expectedReturn, setExpectedReturn] = useState<number>(0.05); // 5% annual growth

  const [result, setResult] = useState<PlannerResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const balance = Math.max(0, parseFloat(balanceStr.replace(/[^0-9.]/g, '')) || 0);

    if (isNaN(balance) || balance <= 0) {
      setError('Please enter a valid total IRA/401(k) account balance.');
      setResult(null);
      return;
    }

    setError('');

    const annualWithdrawal = balance * (withdrawalRateInput / 100);
    const monthlyWithdrawal = annualWithdrawal / 12;
    const estimatedTaxOwed = annualWithdrawal * taxRateInput;
    const netMonthlyIncome = (annualWithdrawal - estimatedTaxOwed) / 12;

    // Portfolio depletion simulation (simplified constant return & constant withdrawal adjusted for 2.5% inflation)
    let currentBal = balance;
    let years = 0;
    const maxYears = 40;
    let infWithdrawal = annualWithdrawal;

    while (currentBal > 0 && years < maxYears) {
      currentBal = currentBal * (1 + expectedReturn) - infWithdrawal;
      infWithdrawal *= 1.025; // 2.5% inflation
      years++;
    }

    const isSustainable = withdrawalRateInput <= 4.2 || years >= 30;

    const checklist = [
      `Initial Portfolio Balance: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `Annual Withdrawal (${withdrawalRateInput}% Rate): $${annualWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}/year ($${monthlyWithdrawal.toFixed(2)}/month gross).`,
      `Estimated Federal Income Tax: $${estimatedTaxOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}/year (at ${(taxRateInput * 100).toFixed(0)}% tax rate).`,
      `Net Monthly Income in Your Pocket: $${netMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}/month.`,
      `Projected Portfolio Longevity: ${years >= maxYears ? '30+ Years (Sustainable)' : `~${years} Years before depletion (assuming ${expectedReturn * 100}% growth and 2.5% inflation)`}.`,
      isSustainable
        ? '✅ Safe Withdrawal Rate: A 4% initial withdrawal rate is historically sustainable over 30 years.'
        : '⚠️ Caution: Withdrawal rates above 4.5% carry an increased risk of outliving your portfolio.',
    ];

    setResult({
      currentBalance: balance,
      annualWithdrawal,
      monthlyWithdrawal,
      withdrawalRate: withdrawalRateInput,
      estimatedTaxOwed,
      netMonthlyIncome,
      yearsRemaining: years,
      isSustainable,
      checklist,
    });
  };

  return (
    <div
      className="planner-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          IRA &amp; 401(k) Withdrawal Planner
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Calculate your annual drawdown amount, net monthly spendable income after taxes, and portfolio longevity.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-balance`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Total Pre-Tax Retirement Balance (IRA + 401k) ($) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-balance`}
              type="text"
              value={balanceStr}
              onChange={(e) => setBalanceStr(e.target.value)}
              placeholder="e.g. 450000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-rate`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              2. Annual Withdrawal Rate (%)
            </label>
            <select
              id={`${uid}-rate`}
              value={withdrawalRateInput}
              onChange={(e) => setWithdrawalRateInput(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value={3.0}>3.0% (Conservative / High Preservation)</option>
              <option value={3.5}>3.5% (Very Safe)</option>
              <option value={4.0}>4.0% (Standard 4% Rule Baseline)</option>
              <option value={4.5}>4.5% (Moderate Growth Needed)</option>
              <option value={5.0}>5.0% (Aggressive Drawdown)</option>
              <option value={6.0}>6.0% (High Depletion Risk)</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-tax`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              3. Estimated Marginal Tax Rate
            </label>
            <select
              id={`${uid}-tax`}
              value={taxRateInput}
              onChange={(e) => setTaxRateInput(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value={0.10}>10% Marginal Tax Bracket</option>
              <option value={0.12}>12% Marginal Tax Bracket</option>
              <option value={0.22}>22% Marginal Tax Bracket</option>
              <option value={0.24}>24% Marginal Tax Bracket</option>
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
          Calculate Portfolio Drawdown →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Output Banner */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background: result.isSustainable ? '#f0fdf4' : '#fffaf0',
              border: result.isSustainable ? '2px solid #38a169' : '2px solid #dd6b20',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: result.isSustainable ? '#276749' : '#c05621', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Estimated Spendable Monthly Income (After Taxes)
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              ${result.netMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, fontWeight: 600 }}>
              Gross Annual Withdrawal: ${result.annualWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}/yr | Portfolio Sustainability: {result.yearsRemaining >= 30 ? '30+ Years' : `~${result.yearsRemaining} Years`}
            </p>
          </div>

          {/* Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Gross Monthly Drawdown</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>${result.monthlyWithdrawal.toFixed(2)}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Est. Annual Tax Owed</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c05621' }}>${result.estimatedTaxOwed.toFixed(2)}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Withdrawal Rate</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>{result.withdrawalRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Withdrawal Plan Summary &amp; Rules
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
