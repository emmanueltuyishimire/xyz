import React, { useState } from 'react';

const HAZARDS = [
  { room: 'Bathroom', text: 'No grab bars next to toilet or in shower/tub' },
  { room: 'Bathroom', text: 'No non-slip mat inside shower/tub or on floor' },
  { room: 'Bathroom', text: 'Using towel bars or soap dishes to hold onto for balance' },
  { room: 'Bedroom', text: 'No nightlight or lamp reachable directly from bed' },
  { room: 'Bedroom', text: 'Clutter, shoes, or loose cords on the bedroom floor' },
  { room: 'Kitchen', text: 'Reaching high cabinets using a chair or unstable step stool' },
  { room: 'Kitchen', text: 'Spills or grease left on floor surface' },
  { room: 'Living Areas', text: 'Throw rugs without non-slip backing or double-sided tape' },
  { room: 'Living Areas', text: 'Electrical or phone cords crossing walking paths' },
  { room: 'Stairs & Entry', text: 'Stairs missing sturdy handrails on both sides' },
  { room: 'Stairs & Entry', text: 'Objects stored on stair steps or uneven outdoor entry steps' },
  { room: 'Footwear & Meds', text: 'Walking in socks, loose slippers, or bare feet' },
  { room: 'Footwear & Meds', text: 'Taking 4 or more daily prescription medications' },
  { room: 'Footwear & Meds', text: 'Experienced a fall or near-fall within the past 12 months' },
];

export const FallRiskChecklist: React.FC = () => {
  const [checked, setChecked] = useState<boolean[]>(Array(HAZARDS.length).fill(false));

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';

  const flagCount = checked.filter(Boolean).length;

  const toggle = (idx: number) => {
    const next = [...checked];
    next[idx] = !next[idx];
    setChecked(next);
  };

  const getRiskLevel = () => {
    if (flagCount >= 8) return { label: 'High Fall Risk', color: '#c0392b', bg: '#fff5f5' };
    if (flagCount >= 4) return { label: 'Moderate Fall Risk', color: amber, bg: '#fff8f0' };
    return { label: 'Low Fall Risk', color: '#1A7A4E', bg: '#f0fdf4' };
  };

  const risk = getRiskLevel();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '15px', color: navy, margin: 0, lineHeight: 1.6 }}>
          Walk room-by-room through your home and check every statement that is true for your living environment.
        </p>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {HAZARDS.map((item, idx) => (
          <label key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: checked[idx] ? '#fff8f0' : '#fff', border: `1.5px solid ${checked[idx] ? amber : '#DDE3EA'}`, borderRadius: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={checked[idx]} onChange={() => toggle(idx)}
              style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: amber }} />
            <span style={{ fontSize: '16px', color: navy, lineHeight: 1.5 }}>
              <strong style={{ color: teal, fontSize: '13px', display: 'block' }}>{item.room}</strong>
              {item.text}
            </span>
          </label>
        ))}
      </div>

      <div style={{ background: risk.bg, border: `2px solid ${risk.color}`, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', color: risk.color, margin: '0 0 6px 0', fontWeight: 800 }}>Result: {risk.label}</h3>
        <p style={{ fontSize: '16px', color: navy, margin: 0, lineHeight: 1.6 }}>
          You identified <strong>{flagCount} home fall hazards</strong> out of {HAZARDS.length}. Addressing simple fixes like bathroom grab bars, rug tape, and nightlights can reduce fall risk by up to 50%.
        </p>
      </div>

      <div style={{ background: teal, borderRadius: '12px', padding: '20px', color: '#fff' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#C9933A', margin: '0 0 6px 0', textTransform: 'uppercase' }}>CDC STEADI Program Advice</p>
        <p style={{ fontSize: '15px', margin: 0, lineHeight: 1.6 }}>
          Share these results with your doctor. Medicare covers fall risk screening and occupational therapy home safety assessments.
        </p>
      </div>
    </div>
  );
};
