import React, { useState, useId } from 'react';

const STATE_COSTS: Record<string, [number, number, number, number, number]> = {
  NATIONAL: [5720, 4995, 6160, 8669, 9733],
  AL: [4481, 3600, 4560, 6540, 7756],
  AK: [26160, 8181, 10200, 34043, 34403],
  AZ: [6292, 4750, 5900, 7026, 8213],
  AR: [4576, 2979, 3800, 6570, 7500],
  CA: [6768, 5750, 7000, 10372, 11040],
  CO: [6864, 5750, 7200, 8517, 9125],
  CT: [5716, 7000, 8500, 13657, 14478],
  DE: [5720, 5310, 6600, 11528, 12167],
  FL: [5720, 4200, 5250, 9460, 10646],
  GA: [4576, 3400, 4200, 7148, 8030],
  HI: [7150, 5463, 6800, 12243, 14373],
  ID: [5529, 4045, 5000, 8122, 9125],
  IL: [5053, 4630, 5700, 7025, 8030],
  IN: [5148, 4200, 5300, 7513, 8335],
  IA: [5148, 4200, 5200, 7178, 7894],
  KS: [5148, 4200, 5200, 7513, 8335],
  KY: [4576, 3900, 4900, 7118, 7940],
  LA: [4576, 3213, 4000, 6236, 7209],
  ME: [6292, 5700, 7000, 10099, 11254],
  MD: [5720, 5400, 6600, 10950, 12410],
  MA: [6292, 6800, 8300, 13992, 15386],
  MI: [5339, 4500, 5600, 8578, 9551],
  MN: [6530, 5500, 6700, 8973, 10418],
  MS: [4099, 3094, 3800, 6540, 7026],
  MO: [4862, 3900, 4900, 6722, 7604],
  MT: [5434, 4500, 5500, 8788, 9611],
  NE: [5339, 4700, 5800, 8213, 9186],
  NV: [6006, 4898, 6000, 8911, 9915],
  NH: [5720, 6100, 7500, 10616, 11620],
  NJ: [5720, 6200, 7600, 11955, 12745],
  NM: [5148, 4000, 5000, 7178, 8213],
  NY: [5720, 5629, 6800, 13352, 14570],
  NC: [4576, 4000, 5000, 7026, 7665],
  ND: [5720, 4500, 5500, 9308, 10602],
  OH: [5339, 4500, 5600, 7696, 8700],
  OK: [4576, 3700, 4600, 6297, 7209],
  OR: [6673, 5750, 7000, 10250, 11193],
  PA: [5338, 4900, 6000, 11193, 12471],
  RI: [5720, 6100, 7500, 11741, 12775],
  SC: [4576, 3600, 4500, 7331, 8152],
  SD: [5339, 4300, 5300, 8213, 9125],
  TN: [4576, 3960, 5000, 7209, 8030],
  TX: [5148, 4398, 5500, 5414, 6540],
  UT: [5720, 4000, 5000, 8091, 9186],
  VT: [6292, 6200, 7600, 11894, 12562],
  VA: [5434, 5400, 6600, 10007, 11072],
  WA: [6768, 6500, 8000, 11741, 12836],
  WV: [4576, 4200, 5200, 8782, 9794],
  WI: [5720, 4750, 5800, 9338, 10464],
  WY: [5720, 4200, 5200, 8122, 9186],
  DC: [6292, 6500, 8000, 11406, 12562],
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

const CARE_TYPES = [
  'In-Home Health Aide (44 hrs/wk)',
  'Assisted Living Facility',
  'Memory Care Facility (Est.)',
  'Nursing Home — Semi-Private Room',
  'Nursing Home — Private Room',
];

export const CareFacilityCostComparison: React.FC = () => {
  const uid = useId();
  const [selectedState, setSelectedState] = useState<string>('CA');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';

  const stateData = STATE_COSTS[selectedState] || STATE_COSTS.NATIONAL;
  const nationalData = STATE_COSTS.NATIONAL;

  const stateName = STATES.find(s => s[0] === selectedState)?.[1] || 'National';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <label htmlFor={`${uid}-state`} style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: navy, marginBottom: '8px' }}>
          Select State to View Costs:
        </label>
        <select id={`${uid}-state`} value={selectedState} onChange={e => setSelectedState(e.target.value)}
          style={{ width: '100%', maxWidth: '320px', padding: '10px 14px', border: '1.5px solid #DDE3EA', borderRadius: '6px', fontSize: '16px', color: navy, background: '#fff' }}>
          {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ background: teal, color: '#fff' }}>
              <th style={{ padding: '12px 14px', textAlign: 'left' }}>Care Type</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>{stateName} (Monthly)</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>{stateName} (Annual)</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>US National Median (Mo)</th>
            </tr>
          </thead>
          <tbody>
            {CARE_TYPES.map((type, idx) => {
              const moCost = stateData[idx];
              const yrCost = moCost * 12;
              const usCost = nationalData[idx];
              return (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: navy }}>{type}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: teal }}>${moCost.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: navy }}>${yrCost.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: gray }}>${usCost.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#fff8f0', border: '1.5px solid #E8761A', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '15px', color: navy, margin: '0 0 6px 0', fontWeight: 700 }}>Does Medicare Pay for Long-Term Care?</p>
        <p style={{ fontSize: '14px', color: gray, margin: 0, lineHeight: 1.6 }}>
          <strong>No.</strong> Original Medicare and Medicare Advantage do NOT cover custodial long-term care in assisted living or nursing homes. Medicare covers only short-term skilled nursing care (up to 100 days) following a qualifying 3-day inpatient hospital stay. Long-term care is paid out-of-pocket, via long-term care insurance, or by Medicaid once financial thresholds are met.
        </p>
      </div>

      <p style={{ fontSize: '13px', color: '#4B5A6E', margin: 0 }}>
        Source: Benchmarks based on Genworth 2023 Cost of Care Survey data. Verify actual local facility rates directly.
      </p>
    </div>
  );
};
