import React, { useState, useId } from 'react';
import { HIGH_INCOME_MESSAGE } from '@lib/engine';
import { estimateRetirementTax, marginalCostOfNextThousand } from '@lib/retirementTax';
import type { RetirementFilingStatus, RetirementTaxResult } from '@lib/retirementTax';

/**
 * RetirementTaxEstimator.tsx
 * Federal income tax on Social Security, IRA/401(k) withdrawals, pension and interest (tax year 2026).
 * Calculation lives in src/lib/retirementTax.ts so this component and the page tables stay in step.
 */

export type FilingStatus = RetirementFilingStatus;

const money = (x: number) => '$' + Math.round(x).toLocaleString('en-US');
const parse = (s: string) => Math.max(0, parseFloat(s.replace(/[^0-9.]/g, '')) || 0);

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 700, fontSize: '1rem', color: '#0D2137', marginBottom: '0.35rem' };
const hintStyle: React.CSSProperties = { display: 'block', fontWeight: 400, fontSize: '0.85rem', color: '#4B5A6E', marginTop: '0.15rem' };
const inputStyle: React.CSSProperties = {
  width: '100%', minHeight: '48px', padding: '0.65rem 0.85rem 0.65rem 1.9rem', borderRadius: '0.5rem',
  border: '1.5px solid #8895A7', fontSize: '1.0625rem', color: '#0D2137', boxSizing: 'border-box', background: '#fff',
};

function Money(props: { id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label htmlFor={props.id} style={labelStyle}>
        {props.label}
        {props.hint && <span style={hintStyle}>{props.hint}</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <span aria-hidden="true" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#4B5A6E' }}>$</span>
        <input
          id={props.id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          style={inputStyle}
        />
      </div>
    </div>
  );
}

function Row(props: { text: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #E5EAF0', fontWeight: props.strong ? 700 : 400, color: '#0D2137' }}>
      <span>{props.text}</span>
      <span style={{ whiteSpace: 'nowrap' }}>{props.value}</span>
    </div>
  );
}

export const RetirementTaxEstimator: React.FC = () => {
  const uid = useId();

  // Sample figures are pre-filled so the result is never blank; "Clear all" empties every field.
  const [ss, setSs] = useState('24000');
  const [ira, setIra] = useState('25000');
  const [pension, setPension] = useState('12000');
  const [interest, setInterest] = useState('2000');
  const [exempt, setExempt] = useState('');
  const [status, setStatus] = useState<FilingStatus>('single');
  const [age65, setAge65] = useState(true);
  const [spouse65, setSpouse65] = useState(true);

  const [result, setResult] = useState<RetirementTaxResult | null>(null);
  const [marginal, setMarginal] = useState<number | null>(null);
  const [error, setError] = useState('');

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const input = {
        socialSecurity: parse(ss),
        iraWithdrawals: parse(ira),
        pension: parse(pension),
        interestDividends: parse(interest),
        taxExemptInterest: parse(exempt),
        status,
        age65,
        spouseAge65: spouse65,
      };
      if (input.socialSecurity + input.iraWithdrawals + input.pension + input.interestDividends <= 0) {
        setResult(null);
        setError('Enter at least one income amount to see an estimate.');
        return;
      }
      setResult(estimateRetirementTax(input));
      setMarginal(marginalCostOfNextThousand(input));
      setTimeout(() => document.getElementById(`${uid}-result`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setResult(null);
      setError('Something went wrong with that calculation. Check that each box holds a plain number such as 24000, then try again.');
    }
  };

  const clearAll = () => {
    setSs(''); setIra(''); setPension(''); setInterest(''); setExempt('');
    setResult(null); setMarginal(null); setError('');
  };

  const joint = status === 'joint';

  return (
    <div
      className="tax-estimator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>Estimate your 2026 federal retirement tax</h2>
        <p style={{ fontSize: '0.95rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Yearly amounts. The boxes start with sample numbers, so replace them with yours or press Clear all.
        </p>
      </div>

      <form onSubmit={calculate} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          <Money id={`${uid}-ss`} label="Social Security per year" hint="Gross benefit before the Medicare premium is taken out" value={ss} onChange={setSs} placeholder="24000" />
          <Money id={`${uid}-ira`} label="IRA or 401(k) withdrawals per year" hint="Traditional accounts, including RMDs" value={ira} onChange={setIra} placeholder="25000" />
          <Money id={`${uid}-pension`} label="Pension or annuity per year" hint="The taxable part shown on Form 1099-R" value={pension} onChange={setPension} placeholder="12000" />
          <Money id={`${uid}-interest`} label="Interest and dividends per year" hint="Taxable interest and ordinary dividends" value={interest} onChange={setInterest} placeholder="2000" />
          <Money id={`${uid}-exempt`} label="Tax-exempt interest (optional)" hint="Municipal bond interest. Not taxed, but it counts toward Social Security taxability" value={exempt} onChange={setExempt} placeholder="0" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', alignItems: 'start' }}>
          <div>
            <label htmlFor={`${uid}-filing`} style={labelStyle}>Filing status</label>
            <select
              id={`${uid}-filing`}
              value={status}
              onChange={(e) => setStatus(e.target.value as FilingStatus)}
              style={{ ...inputStyle, padding: '0.65rem 0.85rem' }}
            >
              <option value="single">Single or head of household</option>
              <option value="joint">Married filing jointly</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', minHeight: '48px', cursor: 'pointer', fontSize: '1rem', color: '#0D2137' }}>
              <input type="checkbox" checked={age65} onChange={(e) => setAge65(e.target.checked)} style={{ width: '22px', height: '22px', marginTop: '0.1rem', accentColor: '#0A3D3A', flexShrink: 0 }} />
              <span>I am 65 or older by December 31, 2026</span>
            </label>
            {joint && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', minHeight: '48px', cursor: 'pointer', fontSize: '1rem', color: '#0D2137' }}>
                <input type="checkbox" checked={spouse65} onChange={(e) => setSpouse65(e.target.checked)} style={{ width: '22px', height: '22px', marginTop: '0.1rem', accentColor: '#0A3D3A', flexShrink: 0 }} />
                <span>My spouse is 65 or older by December 31, 2026</span>
              </label>
            )}
          </div>
        </div>

        {error && <p role="alert" style={{ margin: 0, color: '#9B1C1C', fontWeight: 600 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="submit"
            style={{ background: '#0A3D3A', color: '#ffffff', fontWeight: 700, fontSize: '1.1rem', padding: '0.85rem 1.5rem', minHeight: '52px', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            Estimate my federal tax
          </button>
          <button
            type="button"
            onClick={clearAll}
            style={{ background: 'transparent', color: '#0A3D3A', fontWeight: 600, fontSize: '1rem', padding: '0.75rem 1rem', minHeight: '48px', borderRadius: '0.5rem', border: '1.5px solid #0A3D3A', cursor: 'pointer' }}
          >
            Clear all
          </button>
        </div>
      </form>

      {result && (
        <div id={`${uid}-result`} tabIndex={-1} aria-live="polite" style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem', scrollMarginTop: '5rem' }}>
          {!result.modeled ? (
            <div style={{ background: '#FFF8E6', border: '1.5px solid #E8C36A', borderRadius: '0.75rem', padding: '1.25rem', color: '#5B4300' }}>
              <strong>This income is above the range this calculator covers.</strong>
              <p style={{ margin: '0.5rem 0 0' }}>{HIGH_INCOME_MESSAGE}. Your taxable income comes to about {money(result.taxableIncome)}.</p>
            </div>
          ) : (
            <>
              <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Estimated 2026 federal income tax
                </span>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#8A4A0B', margin: '0.25rem 0' }}>
                  {money(result.federalTax)} a year
                </div>
                <p style={{ fontSize: '1rem', color: '#0D2137', margin: 0 }}>
                  About <strong>{money(result.federalTax / 12)} a month</strong>, or <strong>{result.effectiveRatePct.toFixed(1)}%</strong> of your total income.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#4B5A6E', fontWeight: 600, display: 'block' }}>Social Security that is taxable</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0A3D3A' }}>{money(result.taxableSocialSecurity)}</span>
                  <span style={{ fontSize: '0.85rem', color: '#4B5A6E', display: 'block' }}>{result.taxableSsPercent}% of your benefit</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#4B5A6E', fontWeight: 600, display: 'block' }}>Taxable income</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>{money(result.taxableIncome)}</span>
                  <span style={{ fontSize: '0.85rem', color: '#4B5A6E', display: 'block' }}>after deductions</span>
                </div>
                {marginal !== null && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.85rem', color: '#4B5A6E', fontWeight: 600, display: 'block' }}>Tax on your next $1,000 of IRA income</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D2137' }}>{marginal}%</span>
                    <span style={{ fontSize: '0.85rem', color: '#4B5A6E', display: 'block' }}>about ${Math.round(marginal * 10)} of every $1,000</span>
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem 1.25rem', border: '1px solid #DDE3EA' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.5rem 0', fontWeight: 700 }}>How we got there</h3>
                <Row text="Total income" value={money(result.totalGrossIncome)} />
                <Row text="Provisional income (income + half of Social Security + tax-exempt interest)" value={money(result.provisionalIncome)} />
                <Row text="Taxable Social Security" value={money(result.taxableSocialSecurity)} />
                <Row text="Adjusted gross income" value={money(result.agi)} strong />
                <Row text={`Standard deduction (including the age 65+ add-on for ${result.numAged} ${result.numAged === 1 ? 'person' : 'people'})`} value={'-' + money(result.standardDeduction)} />
                <Row text="Additional senior deduction (2025 to 2028, phases out at higher income)" value={'-' + money(result.enhancedSeniorDeduction)} />
                <Row text="Taxable income" value={money(result.taxableIncome)} strong />
                <Row text="Federal income tax from the 2026 brackets" value={money(result.federalTax)} strong />
              </div>

              {marginal !== null && marginal > 20 && (
                <p style={{ margin: '1rem 0 0', padding: '0.9rem 1rem', background: '#FFF8E6', border: '1px solid #E8C36A', borderRadius: '0.5rem', color: '#5B4300' }}>
                  <strong>Watch the extra $1,000.</strong> You are in the range where each additional dollar of IRA income also makes more Social Security taxable, so its real cost is {marginal}%, above the bracket rate. This is often called the tax torpedo.
                </p>
              )}

              <p style={{ margin: '1rem 0 0', fontSize: '0.95rem', color: '#2D3B4E', lineHeight: 1.6 }}>
                <strong>What this covers:</strong> federal income tax only, using the standard deduction. State income tax is not included; the <a href="/tools/retirement-tax-calculator-by-state/" style={{ color: '#0A3D3A' }}>retirement tax calculator by state</a> adds it. To turn the number into monthly withholding, see <a href="/tools/retirement-tax-withholding-calculator/" style={{ color: '#0A3D3A' }}>how much tax to withhold in retirement</a>.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
