import React, { useState } from 'react';

export const PrescriptionPriceGuide: React.FC = () => {
  const [coverage, setCoverage] = useState<'standard' | 'extrahelp' | 'cash'>('standard');
  const [brandPrice, setBrandPrice] = useState<string>('120');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';

  const priceNum = parseFloat(brandPrice) || 0;
  const estimatedGeneric = priceNum * 0.18;
  const genericSavings = priceNum - estimatedGeneric;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          ['standard', 'Standard Part D Plan'],
          ['extrahelp', 'Extra Help (LIS) Plan'],
          ['cash', 'No Part D / Cash & Discount'],
        ].map(([val, label]) => (
          <button key={val} type="button" onClick={() => setCoverage(val as any)}
            style={{
              padding: '14px', borderRadius: '8px', border: `2px solid ${coverage === val ? teal : '#DDE3EA'}`,
              background: coverage === val ? '#e8f5f3' : '#fff', color: coverage === val ? teal : navy,
              fontWeight: 700, fontSize: '15px', cursor: 'pointer', textAlign: 'center',
            }}>
            {label}
          </button>
        ))}
      </div>

      {coverage === 'standard' && (
        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ background: teal, color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tier</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Drug Category</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Typical 2026 Copay</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Tier 1</td>
                <td style={{ padding: '10px 12px' }}>Preferred Generic</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1A7A4E', fontWeight: 700 }}>$0 – $12</td>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Tier 2</td>
                <td style={{ padding: '10px 12px' }}>Non-Preferred Generic</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: teal, fontWeight: 700 }}>$5 – $20</td>
              </tr>
              <tr style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Tier 3</td>
                <td style={{ padding: '10px 12px' }}>Preferred Brand</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: amber, fontWeight: 700 }}>$35 – $50</td>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Tier 4</td>
                <td style={{ padding: '10px 12px' }}>Non-Preferred Brand</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#c0392b', fontWeight: 700 }}>$75 – $100+</td>
              </tr>
              <tr style={{ background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Tier 5</td>
                <td style={{ padding: '10px 12px' }}>Specialty Tier</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: navy, fontWeight: 700 }}>25% – 33% Coinsurance</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '13px', color: gray, marginTop: '8px' }}>
            Note: In 2026, total annual out-of-pocket prescription costs are capped at <strong>$2,000</strong> per enrollee under Part D.
          </p>
        </div>
      )}

      {coverage === 'extrahelp' && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #1A7A4E', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#1A7A4E', margin: '0 0 10px 0', fontWeight: 800 }}>2026 Extra Help (LIS) Copays</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '16px', color: navy, lineHeight: 1.7 }}>
            <li><strong>Generic Medications:</strong> Max $4.90 per fill</li>
            <li><strong>Brand-Name Medications:</strong> Max $12.15 per fill</li>
            <li><strong>Annual Deductible:</strong> $0</li>
            <li><strong>After $2,000 Out-of-Pocket Limit:</strong> $0 copay for rest of year</li>
          </ul>
        </div>
      )}

      <div style={{ background: '#fff', border: '1.5px solid #DDE3EA', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: navy, margin: '0 0 12px 0', fontWeight: 800 }}>Generic vs. Brand Savings Estimator</h3>
        <p style={{ fontSize: '15px', color: gray, lineHeight: 1.5, margin: '0 0 14px 0' }}>
          FDA data indicates generic medications average 80% to 85% lower costs than brand-name equivalents.
        </p>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: gray, marginBottom: '6px' }}>Current Monthly Brand Price / Copay ($)</label>
          <input type="number" min="0" value={brandPrice} onChange={e => setBrandPrice(e.target.value)}
            style={{ width: '100%', maxWidth: '240px', padding: '10px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '16px' }} />
        </div>
        {priceNum > 0 && (
          <div style={{ background: '#f6f8fa', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '14px', color: gray, display: 'block' }}>Estimated Generic Cost: ~${estimatedGeneric.toFixed(2)} / month</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A7A4E' }}>Estimated Annual Savings: ~${(genericSavings * 12).toFixed(2)} / year</span>
          </div>
        )}
      </div>

      <div style={{ background: '#fff8f0', border: '1.5px solid #E8761A', borderRadius: '8px', padding: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: amber, margin: '0 0 4px 0' }}>Important Cash vs Insurance Tradeoff:</p>
        <p style={{ fontSize: '14px', color: navy, margin: 0, lineHeight: 1.6 }}>
          Using discount cards (like GoodRx) can sometimes beat your plan copay for low-tier generics. However, cash payments do <strong>not</strong> count toward your $2,000 annual Part D out-of-pocket maximum.
        </p>
      </div>
    </div>
  );
};
