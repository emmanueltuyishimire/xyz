import React, { useState, useId } from 'react';
import { estimateSnap, SNAP_MEDICAL_THRESHOLD } from '../../lib/snapCalc';
import type { SnapResult } from '../../lib/snapCalc';

const STATES = [
  'Alabama', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia',
  'Florida', 'Georgia', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
  'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
  'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];
const OTHER_AREA = 'Alaska, Hawaii, Guam or U.S. Virgin Islands';

const money = (x: number) => '$' + Math.round(x).toLocaleString('en-US');

const label: React.CSSProperties = { display: 'block', fontSize: '1rem', color: '#2D3B4E', marginBottom: '0.4rem', fontWeight: 600 };
const hint: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 400, color: '#4B5A6E', marginTop: '0.2rem', lineHeight: 1.4 };
const inputBase: React.CSSProperties = {
  width: '100%', fontSize: '1.125rem', padding: '0.75rem 1rem 0.75rem 2rem', borderRadius: '0.5rem',
  border: '1.5px solid #8895A7', color: '#0D2137', boxSizing: 'border-box', minHeight: '48px', background: '#fff',
};
const selectBase: React.CSSProperties = { ...inputBase, padding: '0.75rem 1rem' };

function MoneyField(props: {
  id: string; text: string; help?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={props.id} style={label}>
        {props.text}
        {props.help && <span style={hint}>{props.help}</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <span aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4B5A6E', fontSize: '1.125rem' }}>$</span>
        <input
          id={props.id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={props.value}
          placeholder="0"
          onChange={(e) => props.onChange(e.target.value)}
          style={inputBase}
        />
      </div>
    </div>
  );
}

function Row(props: { text: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.45rem 0', borderBottom: '1px solid #E5EAF0', fontWeight: props.strong ? 700 : 400, color: props.muted ? '#4B5A6E' : '#0D2137' }}>
      <span>{props.text}</span>
      <span style={{ whiteSpace: 'nowrap' }}>{props.value}</span>
    </div>
  );
}

export function SNAPEligibilityCalculator() {
  const id = useId();
  const [senior, setSenior] = useState<'' | 'yes' | 'no'>('');
  const [size, setSize] = useState('1');
  const [area, setArea] = useState('');
  const [unearned, setUnearned] = useState('');
  const [earned, setEarned] = useState('');
  const [premiums, setPremiums] = useState('');
  const [otherMedical, setOtherMedical] = useState('');
  const [housing, setHousing] = useState('');
  const [utilities, setUtilities] = useState('');
  const [age5564, setAge5564] = useState(false);
  const [result, setResult] = useState<SnapResult | null>(null);
  const [error, setError] = useState('');

  const ready = senior !== '' && area !== '';
  const otherArea = area === OTHER_AREA;

  const run = () => {
    if (otherArea) { setResult(null); setError(''); return; }
    const hasIncome = (parseFloat(unearned) || 0) + (parseFloat(earned) || 0) > 0;
    if (!hasIncome) {
      setError('Enter your monthly income (even a rough figure) so the estimate has something to work with.');
      setResult(null);
      return;
    }
    setError('');
    setResult(estimateSnap({
      size: parseInt(size, 10) || 1,
      senior: senior === 'yes',
      unearned: parseFloat(unearned) || 0,
      earned: parseFloat(earned) || 0,
      medicarePremiums: parseFloat(premiums) || 0,
      otherMedical: parseFloat(otherMedical) || 0,
      housing: parseFloat(housing) || 0,
      utilities: parseFloat(utilities) || 0,
    }));
    setTimeout(() => document.getElementById(`${id}-result`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const reset = () => {
    setSenior(''); setSize('1'); setArea(''); setUnearned(''); setEarned(''); setPremiums('');
    setOtherMedical(''); setHousing(''); setUtilities(''); setAge5564(false); setResult(null); setError('');
  };

  const isSenior = senior === 'yes';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <form
        onSubmit={(e) => { e.preventDefault(); if (ready) run(); }}
        style={{ background: '#ffffff', border: '1px solid #DDE3EA', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
      >
        <h2 style={{ fontSize: '1.5rem', color: '#0D2137', margin: '0 0 0.25rem', fontWeight: 700 }}>SNAP estimate for your household</h2>
        <p style={{ margin: '0 0 1.25rem', color: '#4B5A6E', fontSize: '0.95rem' }}>
          Monthly amounts only. Rough numbers are fine. Nothing you type is saved or sent anywhere.
        </p>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={label}>
              Is anyone in your household 60 or older, or getting disability benefits?
              <span style={hint}>This unlocks the senior rules: no gross income test, medical and shelter deductions.</span>
            </legend>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {(['yes', 'no'] as const).map((v) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '48px' }}>
                  <input type="radio" name={`${id}-senior`} value={v} checked={senior === v} onChange={() => setSenior(v)} style={{ width: '1.25rem', height: '1.25rem' }} />
                  {v === 'yes' ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
          </fieldset>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label htmlFor={`${id}-size`} style={label}>People who buy and cook food together</label>
              <select id={`${id}-size`} value={size} onChange={(e) => setSize(e.target.value)} style={selectBase}>
                <option value="1">1 person</option>
                <option value="2">2 people (for example, a couple)</option>
                <option value="3">3 people</option>
                <option value="4">4 people</option>
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-state`} style={label}>Where do you live?</label>
              <select id={`${id}-state`} value={area} onChange={(e) => setArea(e.target.value)} style={selectBase}>
                <option value="">Select a state...</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value={OTHER_AREA}>{OTHER_AREA}</option>
              </select>
            </div>
          </div>

          {otherArea && (
            <p role="status" style={{ margin: 0, padding: '0.9rem 1rem', background: '#FFF8E6', border: '1px solid #E8C36A', borderRadius: '0.5rem', color: '#5B4300' }}>
              SNAP limits and deductions are higher in Alaska, Hawaii, Guam and the U.S. Virgin Islands, and this calculator uses the 48-state and D.C. figures. Contact your area's SNAP office for an accurate estimate.
            </p>
          )}

          <MoneyField id={`${id}-unearned`} text="Social Security, pension and other monthly income" help="The gross amount before Medicare or tax is taken out. Add everyone in the household." value={unearned} onChange={setUnearned} />
          <MoneyField id={`${id}-earned`} text="Wages or self-employment income per month" help="Leave at 0 if nobody works. Work income gets a 20% deduction." value={earned} onChange={setEarned} />
          <MoneyField id={`${id}-prem`} text="Medicare and health insurance premiums you pay" help="Part B, Part D, Medigap, Medicare Advantage. Count what actually comes out of your pocket or your Social Security check." value={premiums} onChange={setPremiums} />
          <MoneyField id={`${id}-med`} text="Other medical costs you pay yourself" help="Prescriptions, copays, dental, vision, hearing aids, medical supplies. Only the part above $35 a month counts." value={otherMedical} onChange={setOtherMedical} />
          <MoneyField id={`${id}-rent`} text="Rent or mortgage per month" help="Add property tax and homeowners insurance if you pay them. Enter 0 if you pay no housing cost." value={housing} onChange={setHousing} />
          <MoneyField id={`${id}-util`} text="Utilities you pay per month" help="Heating, cooling, electric, water, trash, phone. Your state may use a standard amount that is higher than your bills." value={utilities} onChange={setUtilities} />

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '1rem', color: '#0D2137', cursor: 'pointer', minHeight: '48px' }}>
            <input type="checkbox" checked={age5564} onChange={(e) => setAge5564(e.target.checked)} style={{ width: '1.25rem', height: '1.25rem', marginTop: '0.2rem', flexShrink: 0 }} />
            <span>Someone in my household is 55 to 64, not disabled, and able to work</span>
          </label>

          {error && <p role="alert" style={{ margin: 0, color: '#9B1C1C', fontWeight: 600 }}>{error}</p>}

          <button
            type="submit"
            disabled={!ready}
            style={{ width: '100%', background: ready ? '#0A3D3A' : '#B8C2CE', color: ready ? '#ffffff' : '#2D3B4E', fontSize: '1.25rem', fontWeight: 700, padding: '1rem', minHeight: '56px', borderRadius: '0.5rem', border: 'none', cursor: ready ? 'pointer' : 'not-allowed' }}
          >
            {ready ? 'Estimate my SNAP benefit' : 'Answer the first two questions to continue'}
          </button>
        </div>
      </form>

      {result && (
        <div
          id={`${id}-result`}
          tabIndex={-1}
          aria-live="polite"
          style={{ marginTop: '2rem', padding: '1.5rem', background: result.eligible ? '#F3F9F6' : '#FEF4F4', border: `1.5px solid ${result.eligible ? '#9CCDB5' : '#F0B4B4'}`, borderRadius: '0.75rem', scrollMarginTop: '5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#0D2137', margin: 0, fontWeight: 800 }}>
              {result.eligible ? 'You likely qualify' : 'You likely do not qualify right now'}
            </h3>
            <button type="button" onClick={reset} style={{ background: 'transparent', border: 'none', color: '#0A3D3A', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', minHeight: '44px' }}>
              Start over
            </button>
          </div>

          <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
            <span style={{ fontSize: '3.25rem', fontWeight: 800, color: result.eligible ? '#8A4A0B' : '#2D3B4E', lineHeight: 1 }}>
              {result.eligible ? money(result.benefit) : '$0'}
            </span>
            <span style={{ fontSize: '1.25rem', color: '#4B5A6E', marginLeft: '0.5rem' }}>estimated per month</span>
          </div>

          {!result.passesGross && (
            <p style={{ margin: '0 0 1rem', color: '#7A1F1F', fontWeight: 600 }}>
              Your gross income of {money(result.gross)} is above the {money(result.grossLimit)} gross limit. Households with no member 60+ or disabled must pass this test as well as the net income test.
            </p>
          )}
          {result.passesGross && !result.passesNet && (
            <p style={{ margin: '0 0 1rem', color: '#7A1F1F', fontWeight: 600 }}>
              After deductions your net income is {money(result.netIncome)}, which is {money(result.netIncome - result.netLimit)} above the {money(result.netLimit)} limit.
              {isSenior ? ' Check that you counted every medical cost and your full rent and utilities, since those are the deductions that move this number.' : ''}
            </p>
          )}

          <div style={{ background: '#fff', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '1rem 1.25rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#0D2137' }}>How we got there</h4>
            <Row text="Monthly income counted" value={money(result.gross)} />
            <Row text="Minus standard deduction" value={'-' + money(result.standardDeduction)} muted />
            {result.earnedDeduction > 0 && <Row text="Minus 20% of work income" value={'-' + money(result.earnedDeduction)} muted />}
            {isSenior && (
              <Row
                text={`Minus medical costs above $${SNAP_MEDICAL_THRESHOLD} (you entered ${money(result.medicalCosts)})`}
                value={'-' + money(result.medicalDeduction)}
                muted
              />
            )}
            <Row text="Income after those deductions" value={money(result.incomeAfterDeductions)} strong />
            <Row text={`Rent and utilities (${money(result.shelterCosts)}) minus half of that income`} value={'-' + money(result.excessShelter)} muted />
            {result.shelterCapped && <Row text="Shelter deduction capped at $769 (no cap for 60+ or disabled households)" value="" muted />}
            <Row text="Net income" value={money(result.netIncome)} strong />
            <Row text="Net income limit for your household size" value={money(result.netLimit)} />
            {!isSenior && <Row text="Gross income limit" value={money(result.grossLimit)} />}
            {result.eligible && (
              <>
                <Row text="Maximum monthly benefit for your household size" value={money(result.maxAllotment)} />
                <Row text="Minus 30% of net income" value={'-' + money(result.netIncome * 0.3)} muted />
                <Row text="Estimated monthly benefit" value={money(result.benefit)} strong />
              </>
            )}
          </div>

          {isSenior && result.medicalDeductionValue > 0 && (
            <p style={{ margin: '1rem 0 0', color: '#14452F' }}>
              <strong>The medical deduction is adding about {money(result.medicalDeductionValue)} a month</strong> to your benefit. Keep your receipts and premium statements for the interview.
            </p>
          )}

          {age5564 && (
            <p style={{ margin: '1rem 0 0', padding: '0.9rem 1rem', background: '#FFF8E6', border: '1px solid #E8C36A', borderRadius: '0.5rem', color: '#5B4300' }}>
              <strong>Work rule:</strong> adults 18 to 64 who are able to work generally must work or take part in a program 80 hours a month, or SNAP stops after 3 months in a 3-year period, unless an exemption applies (for example, a disability or caring for a child under 14). Ask your state office which exemption fits you.
            </p>
          )}

          <p style={{ margin: '1rem 0 0', fontSize: '0.9rem', color: '#4B5A6E', lineHeight: 1.5 }}>
            This estimate uses federal fiscal year 2027 figures for the 48 states and D.C. (October 1, 2026 to September 30, 2027). Your state sets its own utility allowance and may use a standard medical deduction, so the caseworker's number can differ. Only your state office can decide eligibility.
          </p>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <a href="https://www.fns.usda.gov/snap/state-directory" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#0A3D3A', color: '#ffffff', fontSize: '1.125rem', fontWeight: 700, padding: '0.9rem 1.75rem', minHeight: '48px', borderRadius: '0.5rem', textDecoration: 'none' }}>
              Find the {area && !otherArea ? area : 'state'} SNAP office to apply
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
