import React, { useState, useId } from 'react';

const STATE_DATA: Record<string, {
  notarizationRequired: boolean;
  witnessCount: number;
  witnessRestrictions: string;
  formName: string;
  formLink: string;
  notes: string;
}> = {
  CA: { notarizationRequired: false, witnessCount: 2, witnessRestrictions: 'Cannot be healthcare provider, facility employee, operator, spouse, heir, or person who benefits financially from death', formName: 'California Advance Health Care Directive', formLink: 'https://caringinfo.org/planning/advance-directives/advance-directive-by-state/', notes: 'Both witnesses must sign in presence of each other.' },
  FL: { notarizationRequired: false, witnessCount: 2, witnessRestrictions: 'One witness cannot be a spouse or blood relative', formName: 'Florida Living Will and Health Care Surrogate Designation', formLink: 'https://caringinfo.org/planning/advance-directives/advance-directive-by-state/', notes: 'Healthcare surrogate (POA) is a separate document from living will in Florida.' },
  NY: { notarizationRequired: false, witnessCount: 2, witnessRestrictions: 'Cannot be the healthcare agent named in the document', formName: 'New York Health Care Proxy', formLink: 'https://caringinfo.org/planning/advance-directives/advance-directive-by-state/', notes: 'New York form is called a Health Care Proxy — it names an agent but does not need to specify all treatment preferences.' },
  TX: { notarizationRequired: false, witnessCount: 2, witnessRestrictions: 'Cannot be a potential heir or person who benefits financially', formName: 'Texas Directive to Physicians and Family or Surrogates', formLink: 'https://caringinfo.org/planning/advance-directives/advance-directive-by-state/', notes: 'Texas also has a Medical Power of Attorney as a separate document.' },
  IL: { notarizationRequired: false, witnessCount: 2, witnessRestrictions: 'Cannot be a care provider, heir, or person with financial interest in the estate', formName: 'Illinois Statutory Advance Directive for Health Care', formLink: 'https://caringinfo.org/planning/advance-directives/advance-directive-by-state/', notes: 'Illinois has both a Living Will and a Healthcare Power of Attorney.' },
  AL: { notarizationRequired: true, witnessCount: 2, witnessRestrictions: 'Cannot be a healthcare provider, facility employee, heir, or beneficiary', formName: 'Alabama Advance Directive for Health Care', formLink: 'https://caringinfo.org/planning/advance-directives/advance-directive-by-state/', notes: 'Alabama requires EITHER notarization OR two witnesses.' },
};

const STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
  ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],
  ['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
  ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],
  ['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
  ['DC','Washington DC'],
];

export const AdvanceDirectiveGuide: React.FC = () => {
  const uid = useId();
  const [selectedState, setSelectedState] = useState<string>('CA');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';
  const gold = '#C9933A';

  const info = STATE_DATA[selectedState] || {
    notarizationRequired: false,
    witnessCount: 2,
    witnessRestrictions: 'Cannot be a healthcare provider or potential heir',
    formName: `${STATES.find(s => s[0] === selectedState)?.[1] || 'State'} Advance Directive`,
    formLink: 'https://caringinfo.org/planning/advance-directives/advance-directive-by-state/',
    notes: 'Verify current requirements with your state bar association or licensed elder law attorney.',
  };

  const stateName = STATES.find(s => s[0] === selectedState)?.[1] || 'State';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fffbeb', border: `2px solid ${gold}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#92400e', margin: '0 0 4px 0' }}>Legal Disclaimer</p>
        <p style={{ fontSize: '15px', color: navy, margin: 0, lineHeight: 1.6 }}>
          This is educational information, not legal advice. Advance directive requirements are set by state law. Consult a licensed attorney for specific legal counsel.
        </p>
      </div>

      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <label htmlFor={`${uid}-state`} style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: navy, marginBottom: '8px' }}>
          Select State for Official Requirements & Forms:
        </label>
        <select id={`${uid}-state`} value={selectedState} onChange={e => setSelectedState(e.target.value)}
          style={{ width: '100%', maxWidth: '320px', padding: '10px 14px', border: '1.5px solid #DDE3EA', borderRadius: '6px', fontSize: '16px', color: navy, background: '#fff' }}>
          {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: `2px solid ${teal}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', color: teal, margin: '0 0 16px 0', fontWeight: 800 }}>{stateName} Statutory Requirements</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: gray, fontWeight: 700, display: 'block' }}>Notarization Required?</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: info.notarizationRequired ? amber : '#1A7A4E' }}>
              {info.notarizationRequired ? 'Yes (or 2 witnesses)' : 'No (Witnesses sufficient)'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: gray, fontWeight: 700, display: 'block' }}>Witnesses Required</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: navy }}>{info.witnessCount} Witnesses</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: gray, fontWeight: 700, display: 'block' }}>Official Form Name</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: navy }}>{info.formName}</span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', color: gray, fontWeight: 700, display: 'block', marginBottom: '4px' }}>Who CANNOT serve as a witness in {stateName}:</span>
          <p style={{ fontSize: '15px', color: navy, lineHeight: 1.6, margin: 0 }}>{info.witnessRestrictions}</p>
        </div>

        {info.notes && (
          <div style={{ background: '#f6f8fa', borderLeft: `4px solid ${gold}`, padding: '12px 14px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: navy, margin: 0, lineHeight: 1.5 }}><strong>State Note:</strong> {info.notes}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href={info.formLink} target="_blank" rel="noopener noreferrer"
            style={{ background: teal, color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Get Free Official {stateName} Form (CaringInfo) →
          </a>
          <a href="https://polst.org/form-finder/" target="_blank" rel="noopener noreferrer"
            style={{ background: '#fff', color: teal, border: `2px solid ${teal}`, padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Find {stateName} POLST Form →
          </a>
        </div>
      </div>
    </div>
  );
};
