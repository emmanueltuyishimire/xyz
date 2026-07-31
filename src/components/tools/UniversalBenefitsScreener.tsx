import React, { useState, useId } from 'react';

const STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

interface ProgramResult {
  name: string;
  status: 'Likely eligible' | 'Possibly eligible' | 'Likely not eligible';
  value: string;
  description: string;
  linkText: string;
  linkUrl: string;
  verification: string;
  sortValue: number;
}

export function UniversalBenefitsScreener() {
  const idPrefix = useId();
  
  const [income, setIncome] = useState<string>('');
  const [householdSize, setHouseholdSize] = useState<string>('1');
  const [state, setState] = useState<string>('');
  const [age65, setAge65] = useState<string>('');
  const [disability, setDisability] = useState<string>('');
  const [medicare, setMedicare] = useState<string>('');
  const [veteran, setVeteran] = useState<string>('');
  const [ownsHome, setOwnsHome] = useState<string>('');
  const [assets, setAssets] = useState<string>('');
  
  const [results, setResults] = useState<ProgramResult[] | null>(null);

  const handleCalculate = () => {
    const numIncome = parseFloat(income) || 0;
    const numSize = parseInt(householdSize, 10) || 1;
    const numAssets = parseFloat(assets) || 0;
    const isElderlyDisabled = age65 === 'yes' || disability === 'yes';
    const isMedicare = medicare === 'yes';
    
    // 2026 FPL Base Values
    const fplBase = 1255;
    const fplExtraPerson = 448;
    const fpl100 = fplBase + (numSize - 1) * fplExtraPerson;
    const fpl135 = fpl100 * 1.35;
    const fpl150 = fpl100 * 1.50;
    
    const calculatedResults: ProgramResult[] = [];
    
    // 1. SNAP (Elderly/Disabled use Net Income test, assume potential eligibility if gross < 200% FPL)
    const snapLikely = isElderlyDisabled ? (numIncome <= fpl100 * 2) : (numIncome <= fpl100 * 1.3);
    const snapValue = numSize === 1 ? 292 * 12 : 536 * 12;
    calculatedResults.push({
      name: 'SNAP (Food Assistance)',
      status: snapLikely ? 'Likely eligible' : 'Likely not eligible',
      value: `Up to $${snapValue.toLocaleString()}/year`,
      description: 'Monthly funds on an EBT card to buy groceries. Special generous rules apply to seniors.',
      linkText: 'Check SNAP numbers',
      linkUrl: '/tools/snap-eligibility-calculator-for-seniors/',
      verification: 'Verify at fns.usda.gov',
      sortValue: snapLikely ? snapValue : 0
    });
    
    // 2. LIHEAP
    const liheapLikely = numIncome <= fpl150;
    calculatedResults.push({
      name: 'LIHEAP (Energy Assistance)',
      status: liheapLikely ? 'Likely eligible' : 'Likely not eligible',
      value: '$200 - $1,000/year',
      description: 'Help paying your home heating and cooling utility bills.',
      linkText: 'Check LIHEAP numbers',
      linkUrl: '/tools/liheap-eligibility-checker/',
      verification: 'Verify at benefits.gov',
      sortValue: liheapLikely ? 600 : 0
    });
    
    // 3. Medicare Savings Programs
    if (isMedicare) {
      let mspStatus: 'Likely eligible' | 'Possibly eligible' | 'Likely not eligible' = 'Likely not eligible';
      let mspVal = 0;
      let mspDesc = 'Helps pay Part B premiums.';
      
      const qmbAssetLimit = numSize === 1 ? 9930 : 14890;
      
      if (numIncome <= fpl100 && (assets === '' || numAssets <= qmbAssetLimit)) {
        mspStatus = 'Likely eligible';
        mspVal = 4000;
        mspDesc = 'QMB Program: Pays Part A & B premiums plus cost-sharing.';
      } else if (numIncome <= fpl100 * 1.2) {
        mspStatus = 'Likely eligible';
        mspVal = 2220;
        mspDesc = 'SLMB Program: Pays standard Part B premium.';
      } else if (numIncome <= fpl135) {
        mspStatus = 'Likely eligible';
        mspVal = 1100;
        mspDesc = 'QI Program: Helps pay Part B premium.';
      }
      
      calculatedResults.push({
        name: 'Medicare Savings Programs',
        status: mspStatus,
        value: mspStatus !== 'Likely not eligible' ? `Up to $${mspVal.toLocaleString()}/year` : '$0',
        description: mspDesc,
        linkText: 'Learn about MSP',
        linkUrl: 'https://www.medicare.gov/basics/costs/help/medicare-costs',
        verification: 'Verify at medicare.gov',
        sortValue: mspStatus !== 'Likely not eligible' ? mspVal : 0
      });
      
      // 4. Extra Help
      const ehAssetLimit = numSize === 1 ? 17220 : 34360;
      const ehLikely = numIncome <= fpl150 && (assets === '' || numAssets <= ehAssetLimit);
      calculatedResults.push({
        name: 'Extra Help / LIS',
        status: ehLikely ? 'Likely eligible' : 'Likely not eligible',
        value: ehLikely ? 'Up to $5,900/year' : '$0',
        description: 'Subsidizes Medicare Part D prescription drug plan premiums and copays.',
        linkText: 'Check Extra Help numbers',
        linkUrl: '/tools/extra-help-eligibility-calculator/',
        verification: 'Verify at ssa.gov/extrahelp',
        sortValue: ehLikely ? 5900 : 0
      });
    }
    
    // 5. SSI
    const ssiIncomeLimit = numSize === 1 ? 967 : 1450;
    const ssiAssetLimit = numSize === 1 ? 2000 : 3000;
    const ssiLikely = isElderlyDisabled && numIncome < ssiIncomeLimit && (assets === '' || numAssets <= ssiAssetLimit);
    calculatedResults.push({
      name: 'Supplemental Security Income (SSI)',
      status: ssiLikely ? 'Likely eligible' : 'Likely not eligible',
      value: ssiLikely ? `Up to $${(ssiIncomeLimit * 12).toLocaleString()}/year` : '$0',
      description: 'Monthly cash assistance for basic needs for seniors and people with disabilities with very limited income.',
      linkText: 'Learn about SSI',
      linkUrl: 'https://www.ssa.gov/ssi',
      verification: 'Verify at ssa.gov/ssi',
      sortValue: ssiLikely ? (ssiIncomeLimit * 12) : 0
    });
    
    // 6. Property Tax Relief
    if (age65 === 'yes' && ownsHome === 'yes') {
      calculatedResults.push({
        name: 'Property Tax Relief',
        status: 'Likely eligible',
        value: 'Varies by state',
        description: 'Many states offer property tax freezes or exemptions specifically for homeowners 65 and older.',
        linkText: 'Check state programs',
        linkUrl: '/tools/property-tax-relief-checker/',
        verification: 'Verify with local tax assessor',
        sortValue: 500
      });
    }
    
    // 7. Lifeline
    const lifelineLikely = numIncome <= fpl135;
    calculatedResults.push({
      name: 'Lifeline Phone Subsidy',
      status: lifelineLikely ? 'Likely eligible' : 'Likely not eligible',
      value: '$111/year',
      description: 'Provides a $9.25 monthly discount on phone or internet service.',
      linkText: 'Apply at Lifeline Support',
      linkUrl: 'https://www.lifelinesupport.org/',
      verification: 'Verify at lifelinesupport.org',
      sortValue: lifelineLikely ? 111 : 0
    });
    
    // Sort results by estimated dollar value descending
    calculatedResults.sort((a, b) => b.sortValue - a.sortValue);
    setResults(calculatedResults);
  };

  const handleReset = () => {
    setIncome('');
    setHouseholdSize('1');
    setState('');
    setAge65('');
    setDisability('');
    setMedicare('');
    setVeteran('');
    setOwnsHome('');
    setAssets('');
    setResults(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#ffffff', border: '1px solid #DDE3EA', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0D2137', marginBottom: '1.5rem', fontWeight: '700' }}>
          Universal Benefits Screener Intake Form
        </h2>
        
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label htmlFor={`${idPrefix}-income`} style={{ display: 'block', fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>
              Your total monthly income before taxes (include Social Security, pension, work, interest)
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
                <option value="4">4+ People</option>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>Are you 65 or older?</legend>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="age65" value="yes" checked={age65 === 'yes'} onChange={(e) => setAge65(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="age65" value="no" checked={age65 === 'no'} onChange={(e) => setAge65(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> No
                </label>
              </div>
            </fieldset>

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>Do you have a disability?</legend>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="disability" value="yes" checked={disability === 'yes'} onChange={(e) => setDisability(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="disability" value="no" checked={disability === 'no'} onChange={(e) => setDisability(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> No
                </label>
              </div>
            </fieldset>

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>Are you currently enrolled in Medicare?</legend>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="medicare" value="yes" checked={medicare === 'yes'} onChange={(e) => setMedicare(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="medicare" value="no" checked={medicare === 'no'} onChange={(e) => setMedicare(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> No
                </label>
              </div>
            </fieldset>

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>Are you a U.S. veteran?</legend>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="veteran" value="yes" checked={veteran === 'yes'} onChange={(e) => setVeteran(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="veteran" value="no" checked={veteran === 'no'} onChange={(e) => setVeteran(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> No
                </label>
              </div>
            </fieldset>
            
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>Do you own your home?</legend>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="ownsHome" value="yes" checked={ownsHome === 'yes'} onChange={(e) => setOwnsHome(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer', minHeight: '44px' }}>
                  <input type="radio" name="ownsHome" value="no" checked={ownsHome === 'no'} onChange={(e) => setOwnsHome(e.target.value)} style={{ width: '1.25rem', height: '1.25rem' }} /> No
                </label>
              </div>
            </fieldset>
          </div>

          <div>
            <label htmlFor={`${idPrefix}-assets`} style={{ display: 'block', fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '500' }}>
              Estimated liquid assets (savings, investments — excluding home/car) <span style={{fontWeight: 'normal'}}>(Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4B5A6E', fontSize: '1.125rem' }}>$</span>
              <input
                id={`${idPrefix}-assets`}
                type="number"
                min="0"
                value={assets}
                onChange={(e) => setAssets(e.target.value)}
                style={{ width: '100%', fontSize: '1.125rem', padding: '0.75rem 1rem 0.75rem 2rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', color: '#0D2137', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            style={{ width: '100%', background: '#0A3D3A', color: '#ffffff', fontSize: '1.25rem', fontWeight: '700', padding: '1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginTop: '1rem', minHeight: '54px' }}
          >
            Check Eligibility Now
          </button>
        </div>
      </div>

      {results && (
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#0D2137', margin: 0, fontWeight: '800' }}>Your Ranked Results</h3>
            <button onClick={handleReset} style={{ background: 'transparent', border: 'none', color: '#0A3D3A', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem' }}>
              Reset Screener
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((prog, idx) => {
              const isEligible = prog.status === 'Likely eligible';
              return (
                <div key={idx} style={{ background: isEligible ? '#F6F8FA' : '#ffffff', border: `1.5px solid ${isEligible ? '#cbd5e1' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.5rem', opacity: isEligible ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.25rem', color: '#0A3D3A', margin: 0, fontWeight: '700' }}>{prog.name}</h4>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', padding: '0.25rem 0.5rem', borderRadius: '1rem', background: isEligible ? '#e6f4ea' : '#f1f5f9', color: isEligible ? '#1A7A4E' : '#4B5A6E' }}>
                          {prog.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                        {prog.description}
                      </p>
                      {isEligible && (
                        <a href={prog.linkUrl} target={prog.linkUrl.startsWith('http') ? "_blank" : "_self"} rel={prog.linkUrl.startsWith('http') ? "noopener noreferrer" : ""} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0A3D3A', color: '#ffffff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: '600' }}>
                          {prog.linkText} →
                        </a>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', color: '#4B5A6E', margin: '0 0 0.25rem 0' }}>Estimated Value</p>
                      <p style={{ fontSize: '1.5rem', color: isEligible ? '#E8761A' : '#4B5A6E', fontWeight: '800', margin: 0 }}>
                        {prog.value}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.5rem 0 0 0' }}>
                        {prog.verification}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ background: '#fff8f0', border: '1px solid #fed7aa', borderRadius: '0.5rem', padding: '1.5rem', marginTop: '2rem' }}>
            <h4 style={{ fontSize: '1.125rem', color: '#0D2137', margin: '0 0 0.75rem 0' }}>Looking for a specific program?</h4>
            <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: '0 0 1rem 0' }}>If you already know the specific program you want numbers for, jump directly to that dedicated calculator:</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: '0 0 0 1.25rem', color: '#0A3D3A', fontSize: '1rem' }}>
              <li><a href="/tools/snap-eligibility-calculator-for-seniors/" style={{ color: '#0A3D3A' }}>SNAP Eligibility Calculator for Seniors</a></li>
              <li><a href="/tools/liheap-eligibility-checker/" style={{ color: '#0A3D3A' }}>LIHEAP Checker</a></li>
              <li><a href="/tools/extra-help-eligibility-calculator/" style={{ color: '#0A3D3A' }}>Extra Help Calculator</a></li>
              <li><a href="/tools/property-tax-relief-checker/" style={{ color: '#0A3D3A' }}>Property Tax Relief Checker</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
