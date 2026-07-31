import React, { useState, useId } from 'react';

const ADL_ITEMS = [
  'Bathing or showering',
  'Getting dressed and choosing appropriate clothing',
  'Eating meals independently',
  'Using the toilet and managing continence',
  'Moving from bed to chair or around the home',
  'Personal hygiene (brushing teeth, grooming)',
];

const IADL_ITEMS = [
  'Preparing meals and cooking safely',
  'Managing medications (correct dose at the correct time)',
  'Managing finances and paying bills',
  'Using the telephone to make and receive calls',
  'Shopping for groceries or clothing',
  'Doing laundry and light housekeeping',
  'Using transportation to get to appointments',
];

const SAFETY_ITEMS = [
  'Left the stove or oven on unattended',
  'Got lost in familiar places (neighborhood, grocery store)',
  'Had a fall in the past 6 months',
  'Missed or accidentally double-taken medications',
  'Shown confusion about the time of day, day of week, or season',
];

type HelpLevel = '' | 'none' | 'some' | 'cannot';

export const CareOptionsWizard: React.FC = () => {
  const uid = useId();
  const [adl, setAdl] = useState<HelpLevel[]>(Array(ADL_ITEMS.length).fill(''));
  const [iadl, setIadl] = useState<HelpLevel[]>(Array(IADL_ITEMS.length).fill(''));
  const [safety, setSafety] = useState<boolean[]>(Array(SAFETY_ITEMS.length).fill(false));
  const [submitted, setSubmitted] = useState(false);
  const [zip, setZip] = useState('');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';
  const gold = '#C9933A';

  const allAnswered = adl.every(v => v !== '') && iadl.every(v => v !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitted(true);
  };

  const adlIssues = adl.filter(v => v === 'some' || v === 'cannot').length;
  const adlCannot = adl.filter(v => v === 'cannot').length;
  const iadlIssues = iadl.filter(v => v === 'some' || v === 'cannot').length;
  const safetyFlags = safety.filter(Boolean).length;

  const getTier = () => {
    if (adlCannot >= 1 || safetyFlags >= 2) return 'safety';
    if (adlIssues >= 4 || iadlIssues >= 5) return 'assisted';
    if (adlIssues >= 2 || iadlIssues >= 3) return 'inhome';
    return 'monitor';
  };

  const TIERS = {
    monitor: {
      badge: '✓ No Immediate Action Needed',
      color: '#1A7A4E',
      bg: '#f0fdf4',
      border: '#1A7A4E',
      text: 'Based on your answers, there are no immediate indicators of unmet care needs. Continue to monitor over time — needs can change gradually. This tool can be used again in 6-12 months or any time you notice a change.',
    },
    inhome: {
      badge: 'Consider In-Home Help',
      color: amber,
      bg: '#fff8f0',
      border: amber,
      text: 'Your answers suggest that some additional support at home could help with daily tasks. A part-time home care aide for a few hours per week can extend independence significantly. Contact your local Area Agency on Aging for an in-home assessment and a list of licensed providers.',
    },
    assisted: {
      badge: 'Consider Assisted Living Evaluation',
      color: amber,
      bg: '#fff8f0',
      border: amber,
      text: 'Your answers indicate difficulty with multiple daily activities. Assisted living communities provide help with meals, housekeeping, medication management, and personal care while preserving meaningful independence. Contact your local Area Agency on Aging to discuss options.',
    },
    safety: {
      badge: '⚠ Safety Concerns — Professional Evaluation Recommended',
      color: '#c0392b',
      bg: '#fff5f5',
      border: '#c0392b',
      text: 'Your answers include safety concerns — falls, medication confusion, or significant cognitive changes — that warrant a professional evaluation. Speak with a physician as soon as possible and contact your local Area Agency on Aging for an in-home safety assessment.',
    },
  };

  const tier = getTier();
  const result = TIERS[tier];

  const selectStyle = (selected: HelpLevel, value: HelpLevel): React.CSSProperties => ({
    flex: 1, padding: '10px 6px', border: `2px solid ${selected === value ? teal : '#DDE3EA'}`,
    borderRadius: '6px', fontSize: '14px', fontWeight: selected === value ? 700 : 400,
    color: selected === value ? teal : gray, background: selected === value ? '#e8f5f3' : '#fff',
    cursor: 'pointer', textAlign: 'center',
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Disclaimer */}
      <div style={{ background: '#fffbeb', border: `2px solid ${gold}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', margin: '0 0 4px 0' }}>Important Notice</p>
        <p style={{ fontSize: '16px', color: navy, margin: 0, lineHeight: 1.6 }}>
          This tool is an <strong>educational starting point only</strong> — not a clinical assessment. Only a physician or licensed geriatric care professional can conduct a proper evaluation. If you have urgent safety concerns, contact a doctor now.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          {/* ADL Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '20px', color: navy, marginBottom: '4px' }}>Section 1: Basic Daily Activities (ADLs)</h3>
            <p style={{ fontSize: '16px', color: gray, marginBottom: '16px', lineHeight: 1.6 }}>For each activity, select how much help is currently needed:</p>
            {ADL_ITEMS.map((item, i) => (
              <div key={i} style={{ marginBottom: '14px', background: '#fff', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '14px 16px' }}>
                <p style={{ fontSize: '17px', color: navy, margin: '0 0 10px 0', fontWeight: 600 }}>{item}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[['none', 'No help needed'], ['some', 'Some help needed'], ['cannot', 'Cannot do alone']].map(([v, label]) => (
                    <button type="button" key={v} onClick={() => { const n = [...adl]; n[i] = v as HelpLevel; setAdl(n); }}
                      style={selectStyle(adl[i], v as HelpLevel)}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* IADL Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '20px', color: navy, marginBottom: '4px' }}>Section 2: Household & Instrumental Activities (IADLs)</h3>
            <p style={{ fontSize: '16px', color: gray, marginBottom: '16px', lineHeight: 1.6 }}>These activities support independent living:</p>
            {IADL_ITEMS.map((item, i) => (
              <div key={i} style={{ marginBottom: '14px', background: '#fff', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '14px 16px' }}>
                <p style={{ fontSize: '17px', color: navy, margin: '0 0 10px 0', fontWeight: 600 }}>{item}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[['none', 'No help needed'], ['some', 'Some help needed'], ['cannot', 'Cannot do alone']].map(([v, label]) => (
                    <button type="button" key={v} onClick={() => { const n = [...iadl]; n[i] = v as HelpLevel; setIadl(n); }}
                      style={selectStyle(iadl[i], v as HelpLevel)}>{label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Safety Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '20px', color: navy, marginBottom: '4px' }}>Section 3: Safety and Memory Concerns</h3>
            <p style={{ fontSize: '16px', color: gray, marginBottom: '16px', lineHeight: 1.6 }}>Check any that have occurred in the past 6 months:</p>
            {SAFETY_ITEMS.map((item, i) => (
              <label key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: safety[i] ? '#fff8f0' : '#fff', border: `1.5px solid ${safety[i] ? amber : '#DDE3EA'}`, borderRadius: '8px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={safety[i]} onChange={e => { const n = [...safety]; n[i] = e.target.checked; setSafety(n); }}
                  style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: amber }} />
                <span style={{ fontSize: '17px', color: navy, lineHeight: 1.6 }}>{item}</span>
              </label>
            ))}
          </div>

          <button type="submit" style={{ background: teal, color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 32px', fontSize: '18px', fontWeight: 700, cursor: allAnswered ? 'pointer' : 'not-allowed', width: '100%', minHeight: '56px', opacity: allAnswered ? 1 : 0.6 }}>
            See My Recommendation →
          </button>
          {!allAnswered && <p style={{ fontSize: '14px', color: amber, marginTop: '8px', textAlign: 'center' }}>Please answer all questions in Sections 1 and 2 above.</p>}
        </form>
      ) : (
        <div>
          <div style={{ background: result.bg, border: `2px solid ${result.border}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '20px', fontWeight: 800, color: result.color, margin: '0 0 8px 0' }}>{result.badge}</p>
            <p style={{ fontSize: '18px', color: navy, margin: 0, lineHeight: 1.7 }}>{result.text}</p>
          </div>

          {safetyFlags >= 3 && (
            <div style={{ background: '#fff5f5', border: '2px solid #c0392b', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '17px', color: '#c0392b', margin: 0, lineHeight: 1.6, fontWeight: 700 }}>
                ⚠ Multiple safety flags detected. Please speak with a physician about a falls risk assessment and memory evaluation. A geriatrician or neurologist referral may be appropriate.
              </p>
            </div>
          )}

          <div style={{ background: teal, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: gold, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Find Local Help</p>
            <p style={{ fontSize: '17px', color: '#fff', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              The Eldercare Locator connects you to free local Area Agency on Aging services — including free in-home assessments, care coordination, and caregiver support.
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={zip} onChange={e => setZip(e.target.value)} placeholder="Enter ZIP code"
                style={{ padding: '10px 14px', borderRadius: '6px', border: 'none', fontSize: '16px', width: '160px' }} />
              <a href={`https://eldercare.acl.gov/Public/Index.aspx${zip ? `?search_zip=${zip}` : ''}`} target="_blank" rel="noopener noreferrer"
                style={{ background: gold, color: '#fff', padding: '12px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>
                Search Eldercare Locator →
              </a>
            </div>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
              Or call <strong>1-800-677-1116</strong> (Monday–Friday, 9am–8pm ET) for free referrals.
            </p>
          </div>

          <p style={{ fontSize: '14px', color: gray, lineHeight: 1.6, margin: '0 0 20px 0' }}>
            This tool does not store any answers you entered. Nothing you shared here leaves your browser.
          </p>

          <button onClick={() => { setSubmitted(false); setAdl(Array(ADL_ITEMS.length).fill('')); setIadl(Array(IADL_ITEMS.length).fill('')); setSafety(Array(SAFETY_ITEMS.length).fill(false)); }}
            style={{ background: '#fff', color: teal, border: `2px solid ${teal}`, borderRadius: '8px', padding: '14px 28px', fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};
