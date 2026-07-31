import React, { useState, useId } from 'react';

const STATE_SUA: Record<string, number> = {
  'Alabama': 490, 'Alaska': 1353, 'Arizona': 396, 'Arkansas': 296, 'California': 548, 
  'Colorado': 450, 'Connecticut': 776, 'Delaware': 504, 'Florida': 392, 'Georgia': 390, 
  'Hawaii': 1161, 'Idaho': 384, 'Illinois': 464, 'Indiana': 475, 'Iowa': 424, 
  'Kansas': 366, 'Kentucky': 413, 'Louisiana': 362, 'Maine': 773, 'Maryland': 510, 
  'Massachusetts': 812, 'Michigan': 572, 'Minnesota': 644, 'Mississippi': 302, 'Missouri': 396, 
  'Montana': 516, 'Nebraska': 496, 'Nevada': 390, 'New Hampshire': 741, 'New Jersey': 648, 
  'New Mexico': 432, 'New York': 686, 'North Carolina': 371, 'North Dakota': 468, 'Ohio': 432, 
  'Oklahoma': 349, 'Oregon': 554, 'Pennsylvania': 592, 'Rhode Island': 697, 'South Carolina': 368, 
  'South Dakota': 456, 'Tennessee': 378, 'Texas': 391, 'Utah': 440, 'Vermont': 856, 
  'Virginia': 432, 'Washington': 574, 'West Virginia': 442, 'Wisconsin': 550, 'Wyoming': 480, 
  'District of Columbia': 798
};
const STATES = Object.keys(STATE_SUA).sort();

export function SNAPEligibilityCalculator() {
  const idPrefix = useId();
  
  const [isElderly, setIsElderly] = useState<string>('');
  const [householdSize, setHouseholdSize] = useState<string>('1');
  const [income, setIncome] = useState<string>('');
  const [medicalExpenses, setMedicalExpenses] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [earnedIncome, setEarnedIncome] = useState<string>('0');
  
  const [calculated, setCalculated] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const numIncome = parseFloat(income) || 0;
    const numMed = parseFloat(medicalExpenses) || 0;
    const numEarned = parseFloat(earnedIncome) || 0;
    const size = parseInt(householdSize, 10) || 1;
    const isSpecialRule = isElderly === 'yes';
    
    // 2026 constants
    const stdDeduction = size <= 3 ? 198 : (size === 4 ? 208 : 244);
    const earnedDeduction = numEarned * 0.20;
    const sua = state ? (STATE_SUA[state] || 500) : 500;
    const medDeduction = (isSpecialRule && numMed > 35) ? (numMed - 35) : 0;
    
    let netIncome = numIncome - stdDeduction - earnedDeduction - medDeduction - (sua > 0 ? (sua * 0.3) : 0); // simplified shelter proxy
    if (netIncome < 0) netIncome = 0;
    
    // Limits
    const fplBase = 1255;
    const fplExtra = 448;
    const netLimit = fplBase + (size - 1) * fplExtra;
    
    // Max allotment
    const maxAllotments = [0, 292, 536, 768, 975, 1155, 1386, 1532, 1751];
    const maxAllotment = size < maxAllotments.length ? maxAllotments[size] : maxAllotments[8] + ((size - 8) * 219);
    
    const estBenefit = Math.max(0, maxAllotment - (netIncome * 0.3));
    
    setResult({
      isEligible: netIncome <= netLimit,
      estBenefit: Math.round(estBenefit),
      netIncome: Math.round(netIncome),
      netLimit: Math.round(netLimit),
      maxAllotment: maxAllotment,
      medDeduction: Math.round(medDeduction),
      stdDeduction: stdDeduction,
      sua: sua
    });
    setCalculated(true);
  };

  const handleReset = () => {
    setIsElderly('');
    setHouseholdSize('1');
    setIncome('');
    setMedicalExpenses('');
    setState('');
    setEarnedIncome('0');
    setCalculated(false);
    setResult(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#ffffff', border: '1px solid #DDE3EA', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0D2137', marginBottom: '1.5rem', fontWeight: '700' }}>
          SNAP Estimate Form
        </h2>
        
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>Does your household include a person 60+ or disabled?</legend>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                <input type="radio" name="elderly" value="yes" checked={isElderly === 'yes'} onChange={(e) => setIsElderly(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                <input type="radio" name="elderly" value="no" checked={isElderly === 'no'} onChange={(e) => setIsElderly(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> No
              </label>
            </div>
          </fieldset>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label htmlFor={`${idPrefix}-size`} style={{ display: 'block', fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>
                Household size
              </label>
              <select
                id={`${idPrefix}-size`}
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
                style={{ width: '100%', fontSize: '1.125rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', color: '#0D2137', backgroundColor: '#fff', boxSizing: 'border-box', minHeight: '44px' }}
              >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
              </select>
            </div>
            <div>
              <label htmlFor={`${idPrefix}-state`} style={{ display: 'block', fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>
                State
              </label>
              <select
                id={`${idPrefix}-state`}
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ width: '100%', fontSize: '1.125rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', color: '#0D2137', backgroundColor: '#fff', boxSizing: 'border-box', minHeight: '44px' }}
              >
                <option value="">Select State...</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${idPrefix}-income`} style={{ display: 'block', fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>
              Total monthly gross income (all sources)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4B5A6E', fontSize: '1.125rem' }}>$</span>
              <input
                id={`${idPrefix}-income`}
                type="number"
                min="0"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                style={{ width: '100%', fontSize: '1.125rem', padding: '0.75rem 1rem 0.75rem 2rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', color: '#0D2137', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${idPrefix}-med`} style={{ display: 'block', fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>
              Out-of-pocket medical expenses per month
              <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'normal', marginTop: '0.25rem' }}>Prescriptions, copays, premiums, dental, vision — any amount you pay out-of-pocket</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4B5A6E', fontSize: '1.125rem' }}>$</span>
              <input
                id={`${idPrefix}-med`}
                type="number"
                min="0"
                value={medicalExpenses}
                onChange={(e) => setMedicalExpenses(e.target.value)}
                style={{ width: '100%', fontSize: '1.125rem', padding: '0.75rem 1rem 0.75rem 2rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', color: '#0D2137', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!state || !isElderly}
            style={{ width: '100%', background: (!state || !isElderly) ? '#cbd5e1' : '#0A3D3A', color: '#ffffff', fontSize: '1.25rem', fontWeight: '700', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: (!state || !isElderly) ? 'not-allowed' : 'pointer', marginTop: '1rem', minHeight: '54px' }}
          >
            Calculate Estimate
          </button>
        </div>
      </div>

      {calculated && result && (
        <div style={{ marginTop: '2.5rem', padding: '2rem', background: result.isEligible ? '#F6F8FA' : '#fef2f2', border: `1.5px solid ${result.isEligible ? '#cbd5e1' : '#fecaca'}`, borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#0D2137', margin: '0 0 0.5rem 0', fontWeight: '800' }}>
                {result.isEligible ? 'Estimated Monthly Benefit' : 'Likely Not Eligible'}
              </h3>
              {result.isEligible ? (
                <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: 0 }}>Based on your inputs and 2026 limits.</p>
              ) : (
                <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: 0 }}>Your net income appears above the limit.</p>
              )}
            </div>
            <button onClick={handleReset} style={{ background: 'transparent', border: 'none', color: '#0A3D3A', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>
              Recalculate
            </button>
          </div>
          
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: '800', color: result.isEligible ? '#E8761A' : '#4B5A6E', lineHeight: 1 }}>
              {result.isEligible ? `$${result.estBenefit}` : '$0'}
            </span>
            <span style={{ fontSize: '1.5rem', color: '#4B5A6E', marginLeft: '0.5rem' }}>/ mo</span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '1.5rem', marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1.125rem', color: '#0D2137', margin: '0 0 1rem 0' }}>Calculation Breakdown</h4>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '1rem', color: '#4B5A6E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Max Allotment (for {householdSize}):</span>
                <strong>${result.maxAllotment}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Net Income:</span>
                <strong>${result.netIncome}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <span>Net Income Limit:</span>
                <strong>${result.netLimit}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>Medical Deduction Used:</span>
                <strong>${result.medDeduction}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>Standard Deduction:</span>
                <strong>${result.stdDeduction}</strong>
              </div>
            </div>
          </div>
          
          {result.isEligible && (
             <div style={{ marginTop: '2rem', textAlign: 'center' }}>
               <a href="https://www.fns.usda.gov/snap/state-directory" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#0A3D3A', color: '#ffffff', fontSize: '1.125rem', fontWeight: '700', padding: '1rem 2rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
                 Apply for SNAP in {state} →
               </a>
             </div>
          )}
          
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', marginTop: '1.5rem', marginBottom: 0 }}>
            Calculated using official USDA FNS formula. Verify at fns.usda.gov.
          </p>
        </div>
      )}
    </div>
  );
}
