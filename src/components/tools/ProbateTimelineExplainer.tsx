import React, { useState } from 'react';

const PROBATE_DATA: Record<string, { duration: string; threshold: number; procedure: string; cost: string }> = {
  CA: { duration: '9 – 18 months', threshold: 184500, procedure: 'Small Estate Affidavit (after 40 days)', cost: '4% – 7%' },
  TX: { duration: '2 – 12 months', threshold: 75000, procedure: 'Small Estate Affidavit / Muniment of Title', cost: '2% – 5%' },
  FL: { duration: '3 – 12 months', threshold: 75000, procedure: 'Summary Administration', cost: '3% – 5%' },
  NY: { duration: '7 – 18 months', threshold: 50000, procedure: 'Voluntary Administration (Small Estate)', cost: '4% – 7%' },
  IL: { duration: '6 – 14 months', threshold: 100000, procedure: 'Small Estate Affidavit', cost: '3% – 5%' },
  PA: { duration: '6 – 12 months', threshold: 50000, procedure: 'Small Estate Petition', cost: '3% – 6%' },
  OH: { duration: '3 – 9 months', threshold: 35000, procedure: 'Summary Release from Administration', cost: '3% – 5%' },
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

export const ProbateTimelineExplainer: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('CA');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';

  const data = PROBATE_DATA[selectedState] || {
    duration: '6 – 14 months',
    threshold: 50000,
    procedure: 'State Small Estate Affidavit',
    cost: '3% – 6%',
  };

  const stateName = STATES.find(s => s[0] === selectedState)?.[1] || 'State';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: navy, marginBottom: '8px' }}>
          Select State for Probate Benchmarks:
        </label>
        <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
          style={{ width: '100%', maxWidth: '320px', padding: '10px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '16px' }}>
          {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: `2px solid ${teal}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', color: teal, margin: '0 0 16px 0', fontWeight: 800 }}>{stateName} Probate Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: gray, fontWeight: 700, display: 'block' }}>Typical Timeline</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: navy }}>{data.duration}</span>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: gray, fontWeight: 700, display: 'block' }}>Small Estate Limit</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: teal }}>${data.threshold.toLocaleString()}</span>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: gray, fontWeight: 700, display: 'block' }}>Simplified Procedure</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: navy }}>{data.procedure}</span>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: gray, fontWeight: 700, display: 'block' }}>Est. Court & Legal Fees</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: navy }}>{data.cost}</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#f0fdf4', border: '1.5px solid #1A7A4E', borderRadius: '12px', padding: '20px' }}>
        <h4 style={{ fontSize: '18px', color: '#1A7A4E', margin: '0 0 10px 0', fontWeight: 800 }}>Assets That Bypass Probate Completely</h4>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '15px', color: navy, lineHeight: 1.6 }}>
          <li>401(k), IRA, & Roth IRA accounts with active beneficiary forms</li>
          <li>Life insurance policy payouts</li>
          <li>Bank accounts with Payable-on-Death (POD) or TOD designations</li>
          <li>Real estate held in Joint Tenancy with Right of Survivorship</li>
          <li>Assets titled in the name of a Revocable Living Trust</li>
        </ul>
      </div>
    </div>
  );
};
