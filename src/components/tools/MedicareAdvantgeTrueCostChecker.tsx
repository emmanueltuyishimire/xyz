import React, { useState } from 'react';

export const MedicareAdvantgeTrueCostChecker: React.FC = () => {
  const [primaryVisits, setPrimaryVisits] = useState<number>(4);
  const [specialistVisits, setSpecialistVisits] = useState<number>(2);
  const [hospitalStays, setHospitalStays] = useState<number>(0);
  const [medigapPrem, setMedigapPrem] = useState<string>('140');
  const [maPrem, setMaPrem] = useState<string>('0');
  const [maOopMax, setMaOopMax] = useState<string>('6700');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';

  const partBAnnual = 202.90 * 12; // $2,434.80
  const medigapAnnualPrem = (parseFloat(medigapPrem) || 0) * 12;
  const partBDeductible = 283; // 2026

  const omTotal = partBAnnual + medigapAnnualPrem + partBDeductible;

  const maAnnualPrem = (parseFloat(maPrem) || 0) * 12;
  const maPrimaryCopays = primaryVisits * 20;
  const maSpecialistCopays = specialistVisits * 45;
  const maHospitalCopays = hospitalStays > 0 ? (hospitalStays === 1 ? 350 : 700) : 0;
  const maCalculated = partBAnnual + maAnnualPrem + maPrimaryCopays + maSpecialistCopays + maHospitalCopays;
  const maMaxLimit = parseFloat(maOopMax) || 6700;
  const maTotal = Math.min(maCalculated, partBAnnual + maAnnualPrem + maMaxLimit);

  // Merged feature from medicare-advantage-total-cost-estimator: Worst-Case Annual Ceiling
  const partDOopCap = 2100; // 2026 statutory Part D cap under Inflation Reduction Act
  const omWorstCase = partBAnnual + medigapAnnualPrem + partBDeductible + partDOopCap;
  const maWorstCase = partBAnnual + maAnnualPrem + maMaxLimit + partDOopCap;

  // Preset handlers from MedicareAdvantageComparisonTool
  const applyPreset = (level: 'low' | 'moderate' | 'high') => {
    if (level === 'low') {
      setPrimaryVisits(1);
      setSpecialistVisits(0);
      setHospitalStays(0);
    } else if (level === 'moderate') {
      setPrimaryVisits(4);
      setSpecialistVisits(3);
      setHospitalStays(0);
    } else if (level === 'high') {
      setPrimaryVisits(8);
      setSpecialistVisits(6);
      setHospitalStays(1);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', color: teal, margin: 0, fontWeight: 700 }}>Expected Healthcare Usage Inputs (2026 Rules)</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" onClick={() => applyPreset('low')} style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Low</button>
            <button type="button" onClick={() => applyPreset('moderate')} style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Moderate</button>
            <button type="button" onClick={() => applyPreset('high')} style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>High</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Primary Doctor Visits / Year</label>
            <input type="number" min="0" value={primaryVisits} onChange={e => setPrimaryVisits(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Specialist Visits / Year</label>
            <input type="number" min="0" value={specialistVisits} onChange={e => setSpecialistVisits(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Hospital Stays / Year</label>
            <select value={hospitalStays} onChange={e => setHospitalStays(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }}>
              <option value={0}>0 Stays</option>
              <option value={1}>1 Stay</option>
              <option value={2}>2+ Stays</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Medigap Plan G Mo. Premium ($)</label>
          <input type="number" min="0" value={medigapPrem} onChange={e => setMedigapPrem(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>Medicare Advantage Mo. Premium ($)</label>
          <input type="number" min="0" value={maPrem} onChange={e => setMaPrem(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: gray, marginBottom: '4px' }}>MA Out-of-Pocket Max ($)</label>
          <input type="number" min="0" value={maOopMax} onChange={e => setMaOopMax(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1.5px solid #DDE3EA', fontSize: '15px' }} />
          <span style={{ fontSize: '11px', color: gray }}>2026 legal max: $9,250 in-network</span>
        </div>
      </div>

      {/* Annual Estimated Out-of-Pocket Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', border: `2px solid ${teal}`, borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '18px', color: teal, margin: '0 0 10px 0', fontWeight: 800 }}>Original Medicare + Medigap Plan G</h4>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Part B Premium: $2,434.80/yr ($202.90/mo)</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Plan G Premium: ${medigapAnnualPrem.toLocaleString()}/yr</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 12px 0' }}>Part B Deductible: $283/yr</p>
          <span style={{ fontSize: '14px', color: gray, display: 'block' }}>Estimated Total Annual Cost (Typical):</span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: teal }}>${Math.round(omTotal).toLocaleString()}</span>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '13px', color: '#1e293b' }}>
            <strong>Worst-Case Ceiling:</strong> ${Math.round(omWorstCase).toLocaleString()}/yr (includes $2,100 Part D cap)
          </div>
        </div>

        <div style={{ background: '#fff8f0', border: `2px solid ${amber}`, borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '18px', color: amber, margin: '0 0 10px 0', fontWeight: 800 }}>Medicare Advantage (Part C)</h4>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Part B Premium: $2,434.80/yr ($202.90/mo)</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Plan Premium: ${maAnnualPrem.toLocaleString()}/yr</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 12px 0' }}>Estimated Copays: ${(maPrimaryCopays + maSpecialistCopays + maHospitalCopays).toLocaleString()}/yr</p>
          <span style={{ fontSize: '14px', color: gray, display: 'block' }}>Estimated Total Annual Cost (Typical):</span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: amber }}>${Math.round(maTotal).toLocaleString()}</span>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #fed7aa', fontSize: '13px', color: '#9a3412' }}>
            <strong>Worst-Case Ceiling:</strong> ${Math.round(maWorstCase).toLocaleString()}/yr (MOOP ${maMaxLimit.toLocaleString()} + $2,100 Part D)
          </div>
        </div>
      </div>

      {/* Merged Side-by-Side Feature Comparison Table from MedicareAdvantageComparisonTool */}
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: teal, color: '#ffffff' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Comparison Factor</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Original Medicare (+ Medigap Plan G)</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Medicare Advantage (Part C)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: navy }}>Doctor Freedom &amp; Network</td>
              <td style={{ padding: '10px 14px', color: navy }}>Any doctor or hospital nationwide accepting Medicare (~93% of physicians). No referrals required.</td>
              <td style={{ padding: '10px 14px', color: navy }}>Restricted to local HMO/PPO network. Out-of-network care may not be covered or costs significantly more.</td>
            </tr>
            <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: navy }}>Prior Authorization Rules</td>
              <td style={{ padding: '10px 14px', color: navy }}>Rare &mdash; doctor determines medical necessity. CMS rarely requires advance insurer approval.</td>
              <td style={{ padding: '10px 14px', color: navy }}>Frequent &mdash; private insurer must approve MRIs, surgeries, skilled nursing, and treatments in advance.</td>
            </tr>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: navy }}>Annual Out-of-Pocket Cap</td>
              <td style={{ padding: '10px 14px', color: navy }}>Fixed maximum risk: $283/year (Part B deductible only with Medigap Plan G).</td>
              <td style={{ padding: '10px 14px', color: navy }}>Legally capped at up to $9,250 in-network per year in 2026 ($13,300+ combined in/out-of-network).</td>
            </tr>
            <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: navy }}>Prescription Drug Coverage</td>
              <td style={{ padding: '10px 14px', color: navy }}>Requires separate standalone Part D drug plan. 2026 out-of-pocket drug spend capped at $2,100 (IRA).</td>
              <td style={{ padding: '10px 14px', color: navy }}>Usually bundled into plan (MA-PD). Shares the same 2026 $2,100 annual out-of-pocket cap under IRA.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ background: '#fffbeb', border: '1.5px solid #C9933A', borderRadius: '8px', padding: '16px' }}>
        <p style={{ fontSize: '14px', color: navy, margin: 0, lineHeight: 1.6 }}>
          <strong>Note:</strong> Decision-support estimate only. Standalone Part D drug coverage is required for Original Medicare. Always verify local network providers and plan specifics at <strong>medicare.gov/plan-compare</strong> before enrolling.
        </p>
      </div>
    </div>
  );
};
