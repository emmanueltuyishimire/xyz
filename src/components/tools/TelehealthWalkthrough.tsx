import React, { useState } from 'react';

export const TelehealthWalkthrough: React.FC = () => {
  const [checked, setChecked] = useState<boolean[]>(Array(10).fill(false));

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const gold = '#C9933A';

  const steps = [
    'I have a smartphone, tablet, or computer with a working camera',
    'My device is charged or plugged into a wall outlet',
    'I have a stable internet connection (Wi-Fi or cellular data)',
    'I can hear audio clearly through my speakers or headphones',
    'I have tested my camera by opening my device camera app',
    'I am sitting in a quiet, well-lit room',
    'I have my complete medication list next to me',
    'I have my Medicare or insurance card visible',
    'I wrote down my top 3 questions for my doctor',
    'I received the email or text appointment link from my doctor',
  ];

  const completedCount = checked.filter(Boolean).length;

  const toggle = (idx: number) => {
    const next = [...checked];
    next[idx] = !next[idx];
    setChecked(next);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#f8fafc', border: `2px solid ${teal}`, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: teal, margin: '0 0 8px 0', fontWeight: 800 }}>Medicare Telehealth Coverage (2026 Rules)</h3>
        <p style={{ fontSize: '15px', color: navy, lineHeight: 1.6, margin: '0 0 12px 0' }}>
          Medicare covers video telehealth visits at the same coinsurance rate as in-person visits (20% after Part B deductible). Covered services include primary care, specialist consultations, mental health therapy, and diabetes education.
        </p>
        <span style={{ fontSize: '13px', background: '#e8f5f3', color: teal, padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
          Audio-Only Note: Mental health visits may be conducted by audio-only phone calls if video is unavailable.
        </span>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', color: navy, margin: 0 }}>Interactive Preparation Checklist</h3>
          <span style={{ fontSize: '15px', fontWeight: 700, color: teal }}>{completedCount} of 10 Completed</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {steps.map((text, idx) => (
            <label key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: checked[idx] ? '#f0fdf4' : '#fff', border: `1.5px solid ${checked[idx] ? '#1A7A4E' : '#DDE3EA'}`, borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={checked[idx]} onChange={() => toggle(idx)}
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: teal }} />
              <span style={{ fontSize: '16px', color: navy, lineHeight: 1.5 }}>{text}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #DDE3EA', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: navy, margin: '0 0 12px 0', fontWeight: 800 }}>How to Join Your Visit (Step-by-Step)</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '16px', color: gray, lineHeight: 1.7 }}>
          <li>Open the email or text message sent by your doctor’s office 10 minutes before your scheduled time.</li>
          <li>Click the appointment link (e.g. <code>mychart.com/join/...</code> or <code>doxy.me/...</code>).</li>
          <li>When your browser prompts "Allow camera and microphone access", click <strong>Allow</strong>.</li>
          <li>You will enter a virtual waiting room until your provider admits you.</li>
          <li>If disconnected, click the link again or call your doctor’s office immediately.</li>
        </ol>
      </div>

      <div style={{ background: '#fff8f0', border: '1.5px solid #E8761A', borderRadius: '8px', padding: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#E8761A', margin: '0 0 6px 0' }}>Need Official HHS Telehealth Guidance?</p>
        <a href="https://telehealth.hhs.gov" target="_blank" rel="noopener noreferrer" style={{ color: teal, fontWeight: 700, textDecoration: 'underline' }}>
          Visit Federal Telehealth Portal (telehealth.hhs.gov) →
        </a>
      </div>
    </div>
  );
};
