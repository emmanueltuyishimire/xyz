import React, { useState, useId } from 'react';

export function AIVoiceCloneVerification() {
  const [safeWord, setSafeWord] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [setupDate, setSetupDate] = useState('');

  const safeWordId = useId();
  const membersId = useId();
  const dateId = useId();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SECTION 1: The Emergency Protocol */}
      <div style={{ background: '#F6F8FA', border: '1.5px solid #DDE3EA', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0D2137', marginBottom: '1rem', marginTop: '0' }}>
          Emergency Protocol: What to Do Under Pressure
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          
          <div style={{ background: '#FFFFFF', border: '2px solid #E8761A', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#E8761A', margin: '0 0 0.5rem 0', fontWeight: '800' }}>1. STOP</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
              Say: "I need to call you back." Even if they protest.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '2px solid #E8761A', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#E8761A', margin: '0 0 0.5rem 0', fontWeight: '800' }}>2. HANG UP</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
              End the call completely. A real emergency can wait 3 minutes.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '2px solid #0A3D3A', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0A3D3A', margin: '0 0 0.5rem 0', fontWeight: '800' }}>3. CALL BACK</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
              Dial your grandchild's real number from <strong>YOUR contacts</strong> — not the number the caller gave you.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '2px solid #1A7A4E', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#1A7A4E', margin: '0 0 0.5rem 0', fontWeight: '800' }}>4. CONFIRM</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
              Call one other family member before doing anything else.
            </p>
          </div>

        </div>
      </div>

      {/* Quick Action Card */}
      <div style={{ background: '#0A3D3A', color: '#FFFFFF', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', color: '#C9933A' }}>Quick Action Contacts</h3>
        <p style={{ fontSize: '1.125rem', margin: '0 0 0.5rem 0', lineHeight: 1.6 }}>
          • Before calling back: Dial grandchild at <strong>real number from contacts</strong>
        </p>
        <p style={{ fontSize: '1.125rem', margin: '0 0 0.5rem 0', lineHeight: 1.6 }}>
          • Also call: another trusted family contact at <strong>their number</strong>
        </p>
        <p style={{ fontSize: '1.125rem', margin: '0', lineHeight: 1.6 }}>
          • Report to: <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#C9933A', textDecoration: 'underline' }}>reportfraud.ftc.gov</a> | <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#C9933A', textDecoration: 'underline' }}>ic3.gov</a> | DOJ Elder Fraud: <strong>1-833-FRAUD-11</strong>
        </p>
      </div>

      {/* SECTION 2: Family Safe Word Setup */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid #DDE3EA', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0D2137', marginBottom: '0.75rem', marginTop: '0' }}>
          Family Safe Word Setup
        </h2>
        <p style={{ fontSize: '1.125rem', color: '#4B5A6E', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          A family safe word is a code word that only real family members know. If someone claims to be in trouble, they can prove it is really them by using this word. Set yours up now, before a call happens.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={safeWordId} style={{ fontSize: '0.875rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '600' }}>
              Safe word or phrase
            </label>
            <input
              id={safeWordId}
              type="text"
              value={safeWord}
              onChange={(e) => setSafeWord(e.target.value)}
              style={{ padding: '0.75rem', fontSize: '1.125rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '44px' }}
              placeholder="e.g., Sunflower or Purple Elephant"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={membersId} style={{ fontSize: '0.875rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '600' }}>
              Who knows this word?
            </label>
            <input
              id={membersId}
              type="text"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(e.target.value)}
              style={{ padding: '0.75rem', fontSize: '1.125rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '44px' }}
              placeholder="e.g., Mom, Dad, Sarah"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={dateId} style={{ fontSize: '0.875rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '600' }}>
              Date we set this up
            </label>
            <input
              id={dateId}
              type="date"
              value={setupDate}
              onChange={(e) => setSetupDate(e.target.value)}
              style={{ padding: '0.75rem', fontSize: '1.125rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '44px' }}
            />
          </div>

        </div>

        <button
          onClick={handlePrint}
          style={{
            marginTop: '2rem',
            background: '#E8761A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '1rem 1.5rem',
            fontSize: '1.125rem',
            fontWeight: '700',
            cursor: 'pointer',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Print or Save This Protocol
        </button>
      </div>

    </div>
  );
}
