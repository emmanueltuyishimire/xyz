import React, { useState, useId } from 'react';

export const CaregiverCostCalculator: React.FC = () => {
  const uid = useId();
  const [hours, setHours] = useState<string>('25');
  const [rate, setRate] = useState<string>('22');
  const [monthlyExpense, setMonthlyExpense] = useState<string>('350');
  const [years, setYears] = useState<string>('2');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';
  const gold = '#C9933A';

  const h = Math.max(0, parseFloat(hours) || 0);
  const r = Math.max(0, parseFloat(rate) || 0);
  const m = Math.max(0, parseFloat(monthlyExpense) || 0);
  const y = Math.max(0, parseFloat(years) || 0);

  const weeklyTimeVal = h * r;
  const annualTimeVal = weeklyTimeVal * 52;
  const annualCashCost = m * 12;
  const annualTotal = annualTimeVal + annualCashCost;
  const cumulativeTotal = y > 0 ? annualTotal * y : 0;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #DDE3EA',
    borderRadius: '6px', fontSize: '16px', color: navy, background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '14px', fontWeight: 700, color: gray, marginBottom: '6px',
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: gray, fontWeight: 600 }}>
        <span>🔒 Private — no data stored</span>
        <span>✓ Free, no account needed</span>
        <span>✓ Based on BLS & AARP care benchmarks</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={labelStyle} htmlFor={`${uid}-hours`}>Caregiving Hours per Week</label>
          <input id={`${uid}-hours`} style={inputStyle} type="number" min="0" max="168" value={hours} onChange={e => setHours(e.target.value)} />
          <span style={{ fontSize: '13px', color: gray, marginTop: '4px', display: 'block' }}>Includes driving, cooking, meds, personal care</span>
        </div>
        <div>
          <label style={labelStyle} htmlFor={`${uid}-rate`}>Hourly Time Value ($)</label>
          <input id={`${uid}-rate`} style={inputStyle} type="number" min="0" value={rate} onChange={e => setRate(e.target.value)} />
          <span style={{ fontSize: '13px', color: gray, marginTop: '4px', display: 'block' }}>Median home health aide rate: ~$22/hr</span>
        </div>
        <div>
          <label style={labelStyle} htmlFor={`${uid}-monthly`}>Direct Out-of-Pocket Cash Costs ($/mo)</label>
          <input id={`${uid}-monthly`} style={inputStyle} type="number" min="0" value={monthlyExpense} onChange={e => setMonthlyExpense(e.target.value)} />
          <span style={{ fontSize: '13px', color: gray, marginTop: '4px', display: 'block' }}>Supplies, copays, transport, modifications</span>
        </div>
        <div>
          <label style={labelStyle} htmlFor={`${uid}-years`}>Years Providing Care (Optional)</label>
          <input id={`${uid}-years`} style={inputStyle} type="number" min="0" value={years} onChange={e => setYears(e.target.value)} />
          <span style={{ fontSize: '13px', color: gray, marginTop: '4px', display: 'block' }}>For cumulative historical total</span>
        </div>
      </div>

      <div style={{ background: '#fff8f0', border: `2px solid ${amber}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: amber, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Caregiving Value Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '14px', color: gray, fontWeight: 700, display: 'block' }}>Annual Labor Time Value</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: navy }}>${Math.round(annualTimeVal).toLocaleString()}</span>
            <span style={{ fontSize: '13px', color: gray, display: 'block' }}>{h} hrs/wk @ ${r}/hr × 52 wks</span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: gray, fontWeight: 700, display: 'block' }}>Annual Direct Cash Costs</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: navy }}>${Math.round(annualCashCost).toLocaleString()}</span>
            <span style={{ fontSize: '13px', color: gray, display: 'block' }}>${m}/mo × 12 months</span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: gray, fontWeight: 700, display: 'block' }}>Total Annual Contribution</span>
            <span style={{ fontSize: '28px', fontWeight: 800, color: amber }}>${Math.round(annualTotal).toLocaleString()}</span>
            <span style={{ fontSize: '13px', color: gray, display: 'block' }}>Per year</span>
          </div>
        </div>

        {y > 0 && (
          <div style={{ borderTop: '1px solid #F5D0A9', paddingTop: '14px', marginTop: '14px' }}>
            <span style={{ fontSize: '15px', color: navy, fontWeight: 700 }}>Estimated Cumulative Contribution over {y} year{y !== 1 ? 's' : ''}: </span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: teal }}>${Math.round(cumulativeTotal).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div style={{ background: '#f6f8fa', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '18px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', color: teal, margin: '0 0 8px 0', fontWeight: 700 }}>Context & Tax Considerations</h4>
        <p style={{ fontSize: '15px', color: navy, lineHeight: 1.6, margin: '0 0 10px 0' }}>
          For comparison, full-time assisted living averages <strong>$4,995/month</strong> ($59,940/year) nationally. Your care contribution saves significant facility costs.
        </p>
        <p style={{ fontSize: '14px', color: gray, lineHeight: 1.6, margin: 0 }}>
          * Some out-of-pocket medical & caregiving expenses may be tax deductible if you provide more than half of the care recipient's financial support. Consult a qualified CPA or elder law professional.
        </p>
      </div>
    </div>
  );
};
