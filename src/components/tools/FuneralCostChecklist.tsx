import React, { useState } from 'react';

export const FuneralCostChecklist: React.FC = () => {
  const [basicFee, setBasicFee] = useState<string>('2300');
  const [casketCost, setCasketCost] = useState<string>('2500');
  const [embalming, setEmbalming] = useState<string>('800');
  const [ceremony, setCeremony] = useState<string>('600');
  const [cemeteryFees, setCemeteryFees] = useState<string>('2000');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';

  const totalCost = (parseFloat(basicFee)||0) + (parseFloat(casketCost)||0) + (parseFloat(embalming)||0) + (parseFloat(ceremony)||0) + (parseFloat(cemeteryFees)||0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#f8fafc', border: `2px solid ${teal}`, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: teal, margin: '0 0 10px 0', fontWeight: 800 }}>Your Rights Under the FTC Funeral Rule</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '15px', color: navy, lineHeight: 1.6 }}>
          <li>You have the right to get an itemized <strong>General Price List (GPL)</strong> when you inquire in person or by phone.</li>
          <li>You can purchase individual goods and services — you are NOT required to buy a package deal.</li>
          <li>You can buy a casket online or from a third party; funeral homes cannot refuse it or charge a handling fee.</li>
          <li>Direct cremation or immediate burial cannot require embalming.</li>
        </ul>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #DDE3EA', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: navy, margin: '0 0 16px 0', fontWeight: 800 }}>Interactive Funeral Cost Estimator</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Basic Services Fee ($)</label>
            <input type="number" value={basicFee} onChange={e => setBasicFee(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Casket Cost ($)</label>
            <input type="number" value={casketCost} onChange={e => setCasketCost(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Embalming & Preparation ($)</label>
            <input type="number" value={embalming} onChange={e => setEmbalming(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Ceremony & Viewing Fees ($)</label>
            <input type="number" value={ceremony} onChange={e => setCeremony(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Cemetery Plot & Vault ($)</label>
            <input type="number" value={cemeteryFees} onChange={e => setCemeteryFees(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          </div>
        </div>

        <div style={{ background: '#fff8f0', border: `2px solid ${amber}`, borderRadius: '8px', padding: '16px' }}>
          <span style={{ fontSize: '14px', color: gray, display: 'block', fontWeight: 700 }}>Estimated Traditional Funeral Total:</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: amber }}>${totalCost.toLocaleString()}</span>
          <span style={{ fontSize: '13px', color: gray, display: 'block', marginTop: '4px' }}>
            (National average direct cremation range: $800 – $2,500)
          </span>
        </div>
      </div>
    </div>
  );
};
