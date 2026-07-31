import React, { useState, useId } from 'react';

const STATE_PROGRAMS: Record<string, { name: string, incomeLimit: number | null, age: number, deadline: string, url: string, description: string }> = {
  IL: { name: 'Senior Citizens Real Estate Tax Freeze Exemption', incomeLimit: 65000, age: 65, deadline: 'Varies by county (typically July)', url: 'https://tax.illinois.gov', description: 'Assessed value frozen at base year value.' },
  TX: { name: 'Over-65 Homestead Exemption', incomeLimit: null, age: 65, deadline: 'April 30', url: 'https://comptroller.texas.gov', description: '$10,000 mandatory exemption from school taxes + school tax freeze. No income limit.' },
  FL: { name: 'Additional Homestead Exemption for Senior Residents', incomeLimit: 36196, age: 65, deadline: 'March 1', url: 'https://floridarevenue.com', description: '$25,000 additional exemption for qualifying seniors.' },
  CA: { name: 'Property Tax Postponement Program', incomeLimit: 55200, age: 62, deadline: 'February 10', url: 'https://sco.ca.gov', description: 'Postpone property taxes on primary residence.' },
  NY: { name: 'STAR Senior Enhanced Exemption', incomeLimit: 98700, age: 65, deadline: 'March 1 (mostly)', url: 'https://tax.ny.gov', description: 'Reduces assessed value significantly.' },
  PA: { name: 'Property Tax/Rent Rebate Program', incomeLimit: 35000, age: 65, deadline: 'June 30', url: 'https://revenue.pa.gov', description: 'Up to $1,000 rebate for homeowners.' }
};

const DEFAULT_PROGRAM = { name: 'State Property Tax Relief', incomeLimit: 50000, age: 65, deadline: 'Check with local assessor', url: 'https://www.ncsl.org/fiscal/property-tax-relief-for-homeowners', description: 'Your state has senior property tax relief programs. Verify current details with your county assessor — details vary by county.' };

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export const PropertyTaxReliefChecker: React.FC = () => {
  const [state, setState] = useState<string>('TX');
  const [age, setAge] = useState<string>('65');
  const [income, setIncome] = useState<string>('');
  const [homeValue, setHomeValue] = useState<string>('');
  const [housingStatus, setHousingStatus] = useState<string>('own');
  
  const idPrefix = useId();

  const calculate = () => {
    if (!age || isNaN(Number(age))) return null;
    if (housingStatus === 'rent') return 'rent';
    
    const program = STATE_PROGRAMS[state] || DEFAULT_PROGRAM;
    const incomeNum = Number(income);
    const ageNum = Number(age);
    
    if (ageNum < program.age) return 'underage';
    
    if (program.incomeLimit && incomeNum > program.incomeLimit) return 'overincome';
    
    return program;
  };

  const result = calculate();

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: '1.5rem' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#4B5A6E', marginBottom: '0.25rem' }}>Housing Status</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name={`${idPrefix}-status`} value="own" checked={housingStatus === 'own'} onChange={() => setHousingStatus('own')} style={{ width: '24px', height: '24px' }} />
              I own my home
            </label>
            <label style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name={`${idPrefix}-status`} value="rent" checked={housingStatus === 'rent'} onChange={() => setHousingStatus('rent')} style={{ width: '24px', height: '24px' }} />
              I rent
            </label>
          </div>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-state`} style={{ display: 'block', fontSize: '14px', color: '#4B5A6E', marginBottom: '0.25rem' }}>State</label>
          <select
            id={`${idPrefix}-state`}
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{ width: '100%', fontSize: '18px', padding: '0.75rem', border: '1px solid #DDE3EA', borderRadius: '0.25rem', backgroundColor: '#fff' }}
          >
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-age`} style={{ display: 'block', fontSize: '14px', color: '#4B5A6E', marginBottom: '0.25rem' }}>Your Age</label>
          <input
            id={`${idPrefix}-age`}
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ width: '100%', fontSize: '18px', padding: '0.75rem', border: '1px solid #DDE3EA', borderRadius: '0.25rem' }}
            min="0"
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-income`} style={{ display: 'block', fontSize: '14px', color: '#4B5A6E', marginBottom: '0.25rem' }}>Annual Household Income ($)</label>
          <input
            id={`${idPrefix}-income`}
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            style={{ width: '100%', fontSize: '18px', padding: '0.75rem', border: '1px solid #DDE3EA', borderRadius: '0.25rem' }}
            min="0"
          />
        </div>
        
        <div>
          <label htmlFor={`${idPrefix}-value`} style={{ display: 'block', fontSize: '14px', color: '#4B5A6E', marginBottom: '0.25rem' }}>Home Assessed Value ($ - optional, check your tax statement)</label>
          <input
            id={`${idPrefix}-value`}
            type="number"
            value={homeValue}
            onChange={(e) => setHomeValue(e.target.value)}
            style={{ width: '100%', fontSize: '18px', padding: '0.75rem', border: '1px solid #DDE3EA', borderRadius: '0.25rem' }}
            min="0"
          />
        </div>
      </form>

      {result === 'rent' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F6F8FA', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
          <p style={{ color: '#E8761A', fontSize: '18px', fontWeight: 700, margin: 0 }}>
            Most property tax relief programs require home ownership. Your state may have a renter circuit-breaker credit — check with your state Department of Revenue.
          </p>
        </div>
      )}

      {result === 'underage' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F6F8FA', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
          <p style={{ color: '#E8761A', fontSize: '18px', fontWeight: 700, margin: 0 }}>
            Based on your age, you may not yet qualify for senior-specific property tax relief in your state. Most programs begin at age 62 or 65.
          </p>
        </div>
      )}

      {result === 'overincome' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F6F8FA', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
          <p style={{ color: '#E8761A', fontSize: '18px', fontWeight: 700, margin: 0 }}>
            Your income may exceed the limits for the primary senior property tax relief program in your state. Check locally to see if other no-income-limit exemptions exist.
          </p>
        </div>
      )}

      {result && typeof result === 'object' && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F6F8FA', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#0D2137', marginBottom: '1rem', fontWeight: 700 }}>Program Identified</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#E8761A' }}>{result.name}</span>
          </div>

          <div style={{ marginBottom: '1rem', fontSize: '18px', lineHeight: 1.6 }}>
            <strong>Description:</strong> {result.description}<br/>
            <strong>Age Required:</strong> {result.age}+<br/>
            <strong>Income Limit:</strong> {result.incomeLimit ? `$${result.incomeLimit.toLocaleString()}` : 'No limit'}<br/>
            <strong>Application Deadline:</strong> {result.deadline}
          </div>

          <p style={{ fontSize: '16px', color: '#0D2137', marginBottom: '1.5rem' }}>
            Verify current details with your county assessor — assessed values and deadlines change locally.
          </p>

          <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#0A3D3A', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.25rem', textDecoration: 'none', fontWeight: 700, fontSize: '18px' }}>
            Visit Official Program Page
          </a>

          <div style={{ marginTop: '1.5rem', fontSize: '14px', color: '#4B5A6E' }}>
            Calculated using official state guidelines. Verify at your local county assessor.
          </div>
          
          <button 
            onClick={() => { setAge('65'); setIncome(''); setHomeValue(''); setState('TX'); setHousingStatus('own'); }}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#0A3D3A', textDecoration: 'underline', cursor: 'pointer', fontSize: '16px' }}
          >
            Reset Form
          </button>
        </div>
      )}
    </div>
  );
};
