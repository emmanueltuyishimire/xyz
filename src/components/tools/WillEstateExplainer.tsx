import React, { useState } from 'react';

const STATE_INTESTACY: Record<string, string> = {
  CA: 'Spouse inherits all community property + 50% of separate property if 1 child (or 33% if 2+ children); children share remainder. Small estate threshold: $184,500.',
  TX: 'Spouse inherits all community property if all children are also spouse’s. Separate personal property split 1/3 to spouse, 2/3 to children. Small estate threshold: $75,000.',
  FL: 'Spouse inherits 100% if no surviving descendants or if all descendants are shared. If spouse has outside children, 50% spouse / 50% children. Small estate threshold: $75,000.',
  NY: 'Spouse inherits first $50,000 + 50% of balance; children share remainder. Small estate threshold: $50,000.',
  IL: 'Spouse inherits 50%, children share 50%. If no children, spouse inherits 100%. Small estate threshold: $100,000.',
  PA: 'Spouse inherits first $30,000 + 50% of balance; children share remainder. Small estate threshold: $50,000.',
  OH: 'Spouse inherits 100% if all children are shared. If non-shared children exist, spouse gets first $20,000–$60,000 + 1/2 or 1/3 of balance. Small estate threshold: $35,000.',
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

export const WillEstateExplainer: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('CA');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';

  const intestacyRule = STATE_INTESTACY[selectedState] || `In ${STATES.find(s => s[0] === selectedState)?.[1] || 'your state'}, dying without a will (intestate) means statutory law determines asset distribution between surviving spouse, children, and parents. Consult a local estate attorney.`;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fffbeb', border: '1.5px solid #C9933A', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '15px', color: navy, margin: 0, lineHeight: 1.6 }}>
          <strong>Legal Disclaimer:</strong> Educational information only, not legal advice. Estate and probate rules vary by state.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #1A7A4E', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '18px', color: '#1A7A4E', margin: '0 0 10px 0', fontWeight: 800 }}>What a Will DOES Control</h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '15px', color: navy, lineHeight: 1.6 }}>
            <li>Solely-owned real estate (without joint tenancy)</li>
            <li>Personal belongings, jewelry, furniture, cars</li>
            <li>Sole bank accounts without POD (Payable on Death)</li>
            <li>Guardianship designations for minor dependents</li>
          </ul>
        </div>

        <div style={{ background: '#fff5f5', border: '1.5px solid #c0392b', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '18px', color: '#c0392b', margin: '0 0 10px 0', fontWeight: 800 }}>What a Will DOES NOT Control</h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '15px', color: navy, lineHeight: 1.6 }}>
            <li>401(k), IRA, pension accounts (beneficiary forms rule)</li>
            <li>Life insurance policy payouts</li>
            <li>Joint bank accounts or joint property with right of survivorship</li>
            <li>Assets held inside a revocable living trust</li>
          </ul>
        </div>
      </div>

      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '18px', color: teal, margin: '0 0 12px 0', fontWeight: 800 }}>State Intestacy Rules Lookup (Dying Without a Will)</h4>
        <div style={{ marginBottom: '14px' }}>
          <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
            style={{ width: '100%', maxWidth: '320px', padding: '10px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '16px' }}>
            {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: '15px', color: navy, margin: 0, lineHeight: 1.6 }}>{intestacyRule}</p>
        </div>
      </div>
    </div>
  );
};
