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

  const partBAnnual = 185 * 12; // $2,220
  const medigapAnnualPrem = (parseFloat(medigapPrem) || 0) * 12;
  const partBDeductible = 257; // 2026

  const omTotal = partBAnnual + medigapAnnualPrem + partBDeductible;

  const maAnnualPrem = (parseFloat(maPrem) || 0) * 12;
  const maPrimaryCopays = primaryVisits * 20;
  const maSpecialistCopays = specialistVisits * 45;
  const maHospitalCopays = hospitalStays > 0 ? (hospitalStays === 1 ? 350 : 700) : 0;
  const maCalculated = partBAnnual + maAnnualPrem + maPrimaryCopays + maSpecialistCopays + maHospitalCopays;
  const maMaxLimit = parseFloat(maOopMax) || 6700;
  const maTotal = Math.min(maCalculated, partBAnnual + maAnnualPrem + maMaxLimit);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: teal, margin: '0 0 12px 0', fontWeight: 700 }}>Expected Healthcare Usage Inputs (2026 Rules)</h3>
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
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', border: `2px solid ${teal}`, borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '18px', color: teal, margin: '0 0 10px 0', fontWeight: 800 }}>Original Medicare + Medigap Plan G</h4>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Part B Premium: $2,220/yr ($185/mo)</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Plan G Premium: ${medigapAnnualPrem.toLocaleString()}/yr</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 12px 0' }}>Part B Deductible: $257/yr</p>
          <span style={{ fontSize: '14px', color: gray, display: 'block' }}>Estimated Total Annual Out-of-Pocket:</span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: teal }}>${omTotal.toLocaleString()}</span>
        </div>

        <div style={{ background: '#fff8f0', border: `2px solid ${amber}`, borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '18px', color: amber, margin: '0 0 10px 0', fontWeight: 800 }}>Medicare Advantage (Part C)</h4>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Part B Premium: $2,220/yr ($185/mo)</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 4px 0' }}>Plan Premium: ${maAnnualPrem.toLocaleString()}/yr</p>
          <p style={{ fontSize: '14px', color: gray, margin: '0 0 12px 0' }}>Estimated Copays: ${(maPrimaryCopays + maSpecialistCopays + maHospitalCopays).toLocaleString()}/yr</p>
          <span style={{ fontSize: '14px', color: gray, display: 'block' }}>Estimated Total Annual Out-of-Pocket:</span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: amber }}>${maTotal.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ background: '#fffbeb', border: '1.5px solid #C9933A', borderRadius: '8px', padding: '16px' }}>
        <p style={{ fontSize: '14px', color: navy, margin: 0, lineHeight: 1.6 }}>
          <strong>Note:</strong> Decision-support estimate only. Standalone Part D drug coverage is required for Original Medicare. Always verify local network providers and plan specifics at <strong>medicare.gov/plan-compare</strong> before enrolling.
        </p>
      </div>
    </div>
  );
};
