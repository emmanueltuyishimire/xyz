import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  MONTH_NAMES,
  PART_D_FIGURES,
  simulatePartD,
  type CostMode,
  type PartDYear,
} from '../../lib/partDCost';

/**
 * MedicareDonutHoleCalculator.tsx
 * Medicare Part D out-of-pocket calculator: shows when the annual cap is reached, what each remaining
 * month costs, and what the Medicare Prescription Payment Plan could look like.
 * Figures and model: see src/lib/partDCost.ts (Medicare.gov Part D cost page).
 */

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd0 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const toNumber = (s: string) => {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '48px',
  padding: '0.65rem 0.85rem',
  borderRadius: '0.5rem',
  border: '1.5px solid #94a3b8',
  fontSize: '1rem',
  background: '#fff',
  color: '#0D2137',
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.975rem',
  color: '#0D2137',
  marginBottom: '0.35rem',
};
const hintStyle: React.CSSProperties = { fontSize: '0.85rem', color: '#475569', margin: '0.3rem 0 0 0', lineHeight: 1.45 };

const MedicareDonutHoleCalculator: React.FC = () => {
  const uid = useId();

  const [year, setYear] = useState<PartDYear>(2026);
  const [startMonth, setStartMonth] = useState<number>(0);
  const [ytdStr, setYtdStr] = useState<string>('0');
  const [mode, setMode] = useState<CostMode>('copay');
  const [amountStr, setAmountStr] = useState<string>('250');
  const [deductibleStr, setDeductibleStr] = useState<string>('');
  const [coinsStr, setCoinsStr] = useState<string>('25');
  const [showResult, setShowResult] = useState<boolean>(false);

  // Start from the current month once the page is live in the browser (avoids a server/browser mismatch).
  useEffect(() => {
    const now = new Date();
    if (now.getFullYear() === 2026) setStartMonth(now.getMonth());
  }, []);

  const figures = PART_D_FIGURES[year];

  const result = useMemo(
    () =>
      simulatePartD({
        year,
        startMonth,
        ytdSpent: toNumber(ytdStr),
        mode,
        monthlyAmount: toNumber(amountStr),
        deductible: deductibleStr.trim() === '' ? undefined : toNumber(deductibleStr),
        coinsurancePct: coinsStr.trim() === '' ? undefined : toNumber(coinsStr),
      }),
    [year, startMonth, ytdStr, mode, amountStr, deductibleStr, coinsStr],
  );

  const ytd = toNumber(ytdStr);
  const monthsLeft = 12 - startMonth;

  const headline = result.alreadyAtCap
    ? 'You have reached the cap: $0 for covered drugs'
    : result.capMonth !== null
      ? `You reach the cap in ${MONTH_NAMES[result.capMonth]}`
      : `You do not reach the ${usd0(figures.cap)} cap this year`;

  const subline = result.alreadyAtCap
    ? `Your out-of-pocket total is at or above the ${year} cap of ${usd0(figures.cap)}. Covered Part D drugs cost you nothing for the rest of ${year}.`
    : result.capMonth !== null
      ? `After ${MONTH_NAMES[result.capMonth]} you pay $0 for covered Part D drugs for the remaining ${11 - result.capMonth} month${11 - result.capMonth === 1 ? '' : 's'} of ${year}. Your projected out-of-pocket total for ${year} is ${usd(result.projectedYearTotal)}.`
      : `At this pace you would pay about ${usd(result.projectedYearTotal)} out of pocket in ${year}, which is ${usd(Math.max(0, figures.cap - result.projectedYearTotal))} under the cap.`;

  return (
    <div
      className="donut-hole-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          When will you hit the Part D out-of-pocket cap?
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0.35rem 0 0 0' }}>
          There is no donut hole any more. Instead, your yearly drug spending stops at a cap. Enter what you pay and see the month it stops.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowResult(true);
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}
      >
        {/* Plan year */}
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={labelStyle}>1. Plan year</legend>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {([2026, 2027] as PartDYear[]).map((y) => (
              <label
                key={y}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '48px', padding: '0.5rem 1rem',
                  border: year === y ? '2px solid #0A3D3A' : '1.5px solid #94a3b8', borderRadius: '0.5rem',
                  background: year === y ? '#ecf6f5' : '#fff', cursor: 'pointer', fontWeight: 600, color: '#0D2137',
                }}
              >
                <input
                  type="radio"
                  name={`${uid}-year`}
                  checked={year === y}
                  onChange={() => {
                    setYear(y);
                    if (y === 2027) { setStartMonth(0); setYtdStr('0'); }
                  }}
                  style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
                />
                {y} (cap {usd0(PART_D_FIGURES[y].cap)})
              </label>
            ))}
          </div>
          {year === 2027 && (
            <p style={hintStyle}>
              Choosing a 2027 plan during Open Enrollment (October 15 – December 7)? Start in January with $0 spent to see a full year under the {usd0(PART_D_FIGURES[2027].cap)} cap.
            </p>
          )}
        </fieldset>

        {/* Where are you now */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-month`} style={labelStyle}>2. Which month are you starting from?</label>
            <select
              id={`${uid}-month`}
              value={startMonth}
              onChange={(e) => setStartMonth(parseInt(e.target.value, 10))}
              style={fieldStyle}
            >
              {MONTH_NAMES.map((n, i) => (
                <option key={n} value={i}>{n}</option>
              ))}
            </select>
            <p style={hintStyle}>The first month still to come. {monthsLeft} month{monthsLeft === 1 ? '' : 's'} counted in {year}.</p>
          </div>
          <div>
            <label htmlFor={`${uid}-ytd`} style={labelStyle}>3. Spent out of pocket so far this year ($)</label>
            <input
              id={`${uid}-ytd`}
              type="text"
              inputMode="decimal"
              value={ytdStr}
              onChange={(e) => setYtdStr(e.target.value)}
              style={fieldStyle}
            />
            <p style={hintStyle}>
              Find it on your plan's monthly Explanation of Benefits, under "True Out-of-Pocket" (TrOOP). Enter 0 in January.
            </p>
          </div>
        </div>

        {/* Costs */}
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={labelStyle}>4. What do your drugs cost?</legend>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
            {([
              ['copay', 'I know what I pay each month'],
              ['fullPrice', 'I know the full drug price'],
            ] as [CostMode, string][]).map(([m, text]) => (
              <label
                key={m}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '48px', padding: '0.5rem 1rem',
                  border: mode === m ? '2px solid #0A3D3A' : '1.5px solid #94a3b8', borderRadius: '0.5rem',
                  background: mode === m ? '#ecf6f5' : '#fff', cursor: 'pointer', fontWeight: 600, color: '#0D2137',
                }}
              >
                <input
                  type="radio"
                  name={`${uid}-mode`}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
                />
                {text}
              </label>
            ))}
          </div>
          <label htmlFor={`${uid}-amount`} style={labelStyle}>
            {mode === 'copay' ? 'Typical monthly pharmacy cost for you ($)' : 'Plan price of your drugs per month, before you pay ($)'}
          </label>
          <input
            id={`${uid}-amount`}
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            style={{ ...fieldStyle, maxWidth: '260px' }}
          />
          <p style={hintStyle}>
            {mode === 'copay'
              ? 'Add up the copays on your pill bottles or receipts for a normal month.'
              : 'Use this for expensive brand or specialty drugs. The tool applies the deductible first, then 25% of the price until the cap.'}
          </p>
        </fieldset>

        {mode === 'fullPrice' && (
          <details style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#0A3D3A', minHeight: '32px' }}>Change deductible or coinsurance (optional)</summary>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <label htmlFor={`${uid}-ded`} style={labelStyle}>Your plan's deductible ($)</label>
                <input
                  id={`${uid}-ded`}
                  type="text"
                  inputMode="decimal"
                  value={deductibleStr}
                  placeholder={`Up to ${figures.maxDeductible}`}
                  onChange={(e) => setDeductibleStr(e.target.value)}
                  style={fieldStyle}
                />
                <p style={hintStyle}>Blank uses the legal maximum, {usd0(figures.maxDeductible)} in {year}. Many plans charge less or $0.</p>
              </div>
              <div>
                <label htmlFor={`${uid}-coins`} style={labelStyle}>Your share after the deductible (%)</label>
                <input
                  id={`${uid}-coins`}
                  type="text"
                  inputMode="decimal"
                  value={coinsStr}
                  onChange={(e) => setCoinsStr(e.target.value)}
                  style={fieldStyle}
                />
                <p style={hintStyle}>Medicare.gov: 25% for generic and brand-name drugs. Plans with copays may differ.</p>
              </div>
            </div>
          </details>
        )}

        <button
          type="submit"
          style={{
            background: '#0A3D3A', color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', minHeight: '52px',
            padding: '0.85rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start',
          }}
        >
          Show my month-by-month costs →
        </button>
      </form>

      {showResult && (
        <div aria-live="polite" style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          <div
            style={{
              padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.25rem',
              background: result.capMonth !== null || result.alreadyAtCap ? '#f0fdf4' : '#fffaf0',
              border: result.capMonth !== null || result.alreadyAtCap ? '2px solid #38a169' : '2px solid #dd6b20',
            }}
          >
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0D2137', lineHeight: 1.25 }}>{headline}</div>
            <p style={{ fontSize: '1rem', color: '#0D2137', margin: '0.5rem 0 0 0', lineHeight: 1.55 }}>{subline}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'block' }}>Left until the cap</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A3D3A' }}>{usd(result.remainingToCap)}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'block' }}>Your {year} total</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0D2137' }}>{usd(ytd + result.rows.reduce((a, r) => a + r.pays, 0))}</span>
              <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block' }}>Never above {usd0(figures.cap)}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'block' }}>Months at $0</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309' }}>{result.monthsAtZero}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'block' }}>The cap saves you</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A3D3A' }}>
                {usd(Math.max(0, result.uncappedRemaining - result.rows.reduce((a, r) => a + r.pays, 0)))}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block' }}>vs. no cap, rest of {year}</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '420px' }}>
              <caption style={{ textAlign: 'left', fontWeight: 700, color: '#0A3D3A', padding: '0 0 0.5rem 0' }}>
                Month-by-month estimate for {year}
              </caption>
              <thead>
                <tr style={{ background: '#0A3D3A', color: '#fff' }}>
                  <th scope="col" style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Month</th>
                  <th scope="col" style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>You pay</th>
                  <th scope="col" style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Year total so far</th>
                  <th scope="col" style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Stage</th>
                </tr>
              </thead>
              <tbody>
                {startMonth > 0 && (
                  <tr style={{ background: '#f1f5f9' }}>
                    <th scope="row" style={{ padding: '0.55rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>January – {MONTH_NAMES[startMonth - 1]}</th>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{usd(ytd)}</td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{usd(ytd)}</td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>Already paid</td>
                  </tr>
                )}
                {result.rows.map((r) => (
                  <tr key={r.month} style={{ borderBottom: '1px solid #e2e8f0', background: r.phase === 'Cap reached' ? '#f0fdf4' : undefined }}>
                    <th scope="row" style={{ padding: '0.55rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>{r.name}</th>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: r.pays === 0 ? 700 : 400, color: r.pays === 0 ? '#166534' : undefined }}>{usd(r.pays)}</td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>{usd(r.cumulative)}</td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>{r.phase === 'Cap reached' ? 'Cap reached: $0' : r.phase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!result.alreadyAtCap && result.remainingToCap > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.1rem 1.25rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                If you join the Medicare Prescription Payment Plan
              </h3>
              <p style={{ margin: 0, fontSize: '0.975rem', lineHeight: 1.6, color: '#0D2137' }}>
                The plan spreads what you owe into monthly bills from your drug plan. Your highest monthly bill would be about{' '}
                <strong>{usd(result.paymentPlanMaxMonthly)}</strong> ({usd(result.remainingToCap)} left to the cap ÷ {monthsLeft} month{monthsLeft === 1 ? '' : 's'}),
                though your plan sets the exact amount. It does not lower what you owe in total; it only changes when you pay it.
              </p>
            </div>
          )}

          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <li style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.55 }}>
              Only covered Part D drugs count toward the cap. Premiums, drugs outside your plan's formulary, and Part B drugs given in a clinic do not.
            </li>
            <li style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.55 }}>
              If you get Extra Help, your copays are much lower than this estimate. Check your eligibility with the Extra Help calculator below.
            </li>
            <li style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.55 }}>
              This is a planning estimate based on a steady monthly amount. Your real bills move with refills, price changes and plan tiers. Your plan's statement is the final word.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export { MedicareDonutHoleCalculator };
export default MedicareDonutHoleCalculator;
