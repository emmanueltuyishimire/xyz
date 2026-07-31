import React, { useState, useId } from 'react';

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

export const SeniorTransportationFinder: React.FC = () => {
  const uid = useId();
  const [situation, setSituation] = useState<'medical' | 'errands' | 'all'>('medical');
  const [medicaid, setMedicaid] = useState<boolean | null>(null);
  const [selectedState, setSelectedState] = useState<string>('CA');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const gold = '#C9933A';

  const stateName = STATES.find(s => s[0] === selectedState)?.[1] || 'your area';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <label htmlFor={`${uid}-state`} style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: navy, marginBottom: '8px' }}>
          Select State for Local Directories:
        </label>
        <select id={`${uid}-state`} value={selectedState} onChange={e => setSelectedState(e.target.value)}
          style={{ width: '100%', maxWidth: '320px', padding: '10px 14px', border: '1.5px solid #DDE3EA', borderRadius: '6px', fontSize: '16px', color: navy, background: '#fff' }}>
          {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          ['medical', '1. Rides to Medical Appointments'],
          ['errands', '2. Daily Errands & Social Rides'],
          ['all', '3. Compare All 3 Transportation Options'],
        ].map(([val, label]) => (
          <button key={val} type="button" onClick={() => setSituation(val as any)}
            style={{
              padding: '16px 14px', borderRadius: '8px', border: `2px solid ${situation === val ? teal : '#DDE3EA'}`,
              background: situation === val ? '#e8f5f3' : '#fff', color: situation === val ? teal : navy,
              fontWeight: 700, fontSize: '16px', cursor: 'pointer', textAlign: 'center',
            }}>
            {label}
          </button>
        ))}
      </div>

      {situation === 'medical' && (
        <div style={{ background: '#fff', border: `2px solid ${teal}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', color: teal, margin: '0 0 14px 0', fontWeight: 800 }}>Medical Appointment Transportation</h3>
          
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: navy, margin: '0 0 10px 0' }}>Are you enrolled in Medicaid in {stateName}?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setMedicaid(true)}
                style={{ padding: '8px 20px', borderRadius: '6px', border: `2px solid ${medicaid === true ? teal : '#DDE3EA'}`, background: medicaid === true ? teal : '#fff', color: medicaid === true ? '#fff' : navy, fontWeight: 700, cursor: 'pointer' }}>
                Yes
              </button>
              <button type="button" onClick={() => setMedicaid(false)}
                style={{ padding: '8px 20px', borderRadius: '6px', border: `2px solid ${medicaid === false ? teal : '#DDE3EA'}`, background: medicaid === false ? teal : '#fff', color: medicaid === false ? '#fff' : navy, fontWeight: 700, cursor: 'pointer' }}>
                No / Medicare Only
              </button>
            </div>
          </div>

          {medicaid === true && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #1A7A4E', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '17px', color: '#1A7A4E', margin: '0 0 6px 0', fontWeight: 800 }}>✓ Free Medicaid NEMT Coverage Available</p>
              <p style={{ fontSize: '15px', color: navy, margin: 0, lineHeight: 1.6 }}>
                As a Medicaid enrollee in {stateName}, you qualify for <strong>Non-Emergency Medical Transportation (NEMT)</strong> to covered medical visits at zero out-of-pocket cost. Call your state Medicaid plan or your health plan’s transportation line 24–48 hours in advance.
              </p>
            </div>
          )}

          {medicaid === false && (
            <div style={{ background: '#fff8f0', border: '1.5px solid #E8761A', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '16px', color: navy, margin: '0 0 6px 0', fontWeight: 700 }}>Medicare Transportation Rules:</p>
              <p style={{ fontSize: '15px', color: gray, margin: 0, lineHeight: 1.6 }}>
                Original Medicare (Parts A & B) does <em>not</em> cover routine medical transportation. However, many <strong>Medicare Advantage</strong> plans offer transportation benefits. Check your plan's Evidence of Coverage.
              </p>
            </div>
          )}

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: navy, margin: '0 0 8px 0' }}>Community & Volunteer Transportation Options:</p>
            <p style={{ fontSize: '15px', color: gray, lineHeight: 1.6, margin: '0 0 14px 0' }}>
              Local Area Agencies on Aging coordinate volunteer driver networks and senior shuttles specifically for medical visits.
            </p>
            <a href="https://eldercare.acl.gov" target="_blank" rel="noopener noreferrer"
              style={{ background: teal, color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Search Eldercare Locator Directory for {stateName} →
            </a>
          </div>
        </div>
      )}

      {situation === 'errands' && (
        <div style={{ background: '#fff', border: `2px solid ${teal}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', color: teal, margin: '0 0 14px 0', fontWeight: 800 }}>Daily Errands & Social Transportation</h3>
          <p style={{ fontSize: '16px', color: navy, lineHeight: 1.6, margin: '0 0 16px 0' }}>
            For grocery shopping, senior centers, or social visits, two main low-cost options exist:
          </p>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '16px', color: teal, margin: '0 0 6px 0', fontWeight: 700 }}>1. ADA Paratransit Services</h4>
            <p style={{ fontSize: '14px', color: gray, margin: 0, lineHeight: 1.6 }}>
              Public transit agencies are required by law to offer door-to-door paratransit for individuals unable to use standard buses. Fares are low (typically $2–$4 per trip). Contact your local city/county transit authority to apply.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', color: teal, margin: '0 0 6px 0', fontWeight: 700 }}>2. Senior Center Shuttles & Volunteer Drivers</h4>
            <p style={{ fontSize: '14px', color: gray, margin: 0, lineHeight: 1.6 }}>
              Many local senior centers operate door-to-door vans on fixed schedules for shopping and activities.
            </p>
          </div>

          <a href="https://211.org" target="_blank" rel="noopener noreferrer"
            style={{ background: gold, color: '#fff', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Connect with 211.org for Local Rides in {stateName} →
          </a>
        </div>
      )}

      {situation === 'all' && (
        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ background: teal, color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Option</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Who Qualifies</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Typical Cost</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Scheduling</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: navy }}>ADA Paratransit</td>
                <td style={{ padding: '12px', color: gray }}>Disability/functional need preventing bus use</td>
                <td style={{ padding: '12px', color: navy }}>$2 – $5 / trip</td>
                <td style={{ padding: '12px', color: gray }}>24 – 48 hrs ahead</td>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: navy }}>OAA Volunteer Driver</td>
                <td style={{ padding: '12px', color: gray }}>Seniors 60+ (priority for low-income)</td>
                <td style={{ padding: '12px', color: '#1A7A4E', fontWeight: 700 }}>Free / Donation</td>
                <td style={{ padding: '12px', color: gray }}>3 – 7 days ahead</td>
              </tr>
              <tr style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: navy }}>Medicaid NEMT</td>
                <td style={{ padding: '12px', color: gray }}>Medicaid beneficiaries (medical trips)</td>
                <td style={{ padding: '12px', color: '#1A7A4E', fontWeight: 700 }}>$0 (Free)</td>
                <td style={{ padding: '12px', color: gray }}>24 – 48 hrs ahead</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: teal, borderRadius: '12px', padding: '20px', color: '#fff' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: gold, margin: '0 0 6px 0', textTransform: 'uppercase' }}>Need Assistance Right Now?</p>
        <p style={{ fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
          Call or text <strong>211</strong> from any phone to speak with a local referral specialist 24/7.
        </p>
      </div>
    </div>
  );
};
