import React, { useState } from 'react';

const questions = [
  { id: 'q1', text: 'We have never met in person, and every time I suggested meeting, there was a reason it could not happen.', explanation: 'Romance scammers always find reasons to avoid meeting because they are not the person they pretend to be.' },
  { id: 'q2', text: 'This person expressed strong romantic feelings or love very quickly — within days or a few weeks of first contact.', explanation: 'Scammers use "love bombing" to create an intense emotional bond quickly, making it harder for you to see red flags.' },
  { id: 'q3', text: 'They claim to be overseas, in the military, working on an oil rig, or doing international humanitarian work.', explanation: 'These specific jobs are commonly used as built-in excuses for why they cannot meet you or video chat.' },
  { id: 'q4', text: 'They always have a technical problem, connection issue, or camera that does not work when I suggest a video call.', explanation: 'A consistent refusal or inability to do a live video call is a strong indicator that the person is using stolen photos.' },
  { id: 'q5', text: 'They have asked me for money, gift cards, wire transfers, or help moving money — even a small amount, or "just a loan."', explanation: 'Requests for money, especially through gift cards or wire transfers, are the ultimate goal of these scams.' },
  { id: 'q6', text: 'They asked me to keep our relationship private from my family or close friends.', explanation: 'Scammers try to isolate you from your loved ones so that no one else can point out the warning signs.' },
  { id: 'q7', text: 'Their profile or photos look unusually perfect — very attractive, professional photos — and they found me first.', explanation: 'Scammers often steal professional photos of models or military officials to create their fake profiles.' },
  { id: 'q8', text: 'They have asked for personal financial information such as my bank account, Social Security number, or address.', explanation: 'Sharing sensitive financial information can lead to identity theft and severe financial loss.' }
];

export const RomanceScamChecklist = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleToggle = (id: string) => {
    let newItems = [...checkedItems];
    if (newItems.includes(id)) {
      newItems = newItems.filter(item => item !== id);
    } else {
      newItems.push(id);
    }
    setCheckedItems(newItems);
  };

  const calculateScore = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setCheckedItems([]);
    setShowResults(false);
  };

  const count = checkedItems.length;

  let severityMessage = '';
  let severityColor = '';

  if (count === 0) {
    severityMessage = 'Low concern: These specific warning signs are not present. Keep this checklist in mind as the relationship continues.';
    severityColor = '#1A7A4E';
  } else if (count <= 2) {
    severityMessage = 'Some warning signs: One or two of these patterns are present. Romance scammers don\'t always show every sign at once — this is worth paying attention to.';
    severityColor = '#E8761A';
  } else if (count <= 4) {
    severityMessage = 'Multiple warning signs: Several documented red flags are present here. We want to make sure you have the information you need.';
    severityColor = '#E8761A';
  } else {
    severityMessage = 'High concern: This pattern closely matches how the FTC and FBI describe active romance scams. Please read the next steps carefully — not because you did anything wrong, but because this information is important.';
    severityColor = '#E8761A'; // using amber instead of red to keep it compassionate and less alarming
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #DDE3EA', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <p style={{ fontSize: '1.125rem', color: '#4B5A6E', marginBottom: '1.5rem', lineHeight: 1.6, background: '#F6F8FA', padding: '1rem', borderRadius: '0.5rem' }}>
        <strong>This checklist is completely private.</strong> Nothing you enter here is stored or shared anywhere. You can answer honestly — these questions are based on documented warning signs that the FTC and FBI have identified in romance scams.
      </p>

      {!showResults ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {questions.map(q => (
              <label key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', fontSize: '1.125rem', color: '#0D2137', minHeight: '44px', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background 0.2s', background: checkedItems.includes(q.id) ? '#f0fdf4' : 'transparent' }}>
                <input 
                  type="checkbox" 
                  checked={checkedItems.includes(q.id)}
                  onChange={() => handleToggle(q.id)}
                  style={{ width: '1.5rem', height: '1.5rem', marginTop: '0.125rem', accentColor: '#0A3D3A', cursor: 'pointer' }}
                />
                <span style={{ lineHeight: 1.5 }}>{q.text}</span>
              </label>
            ))}
          </div>

          <button 
            onClick={calculateScore}
            style={{ width: '100%', background: '#0A3D3A', color: '#fff', fontSize: '1.125rem', fontWeight: 700, padding: '1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', minHeight: '44px' }}
          >
            Review My Results
          </button>
        </>
      ) : (
        <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
          <div style={{ background: '#F6F8FA', borderLeft: `4px solid ${severityColor}`, padding: '1.5rem', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: severityColor, fontWeight: 800, margin: '0 0 1rem 0' }}>Your Results</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
              {severityMessage}
            </p>
          </div>

          {checkedItems.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0D2137', marginBottom: '1rem' }}>Understanding Your Checked Items:</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, listStyle: 'none' }}>
                {questions.filter(q => checkedItems.includes(q.id)).map(q => (
                  <li key={q.id} style={{ background: '#fff', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '1rem' }}>
                    <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: '0 0 0.5rem 0', fontStyle: 'italic' }}>"{q.text}"</p>
                    <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0, fontWeight: 500 }}>→ {q.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {count >= 5 && (
            <div style={{ background: '#fff8f0', border: '1px solid #E8761A', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0A3D3A', margin: '0 0 1rem 0', fontWeight: 800 }}>Recommended Next Steps</h4>
              <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: '0 0 1rem 0', lineHeight: 1.6 }}>
                These patterns are concerning. We encourage you to take these gentle steps to protect yourself:
              </p>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><strong>Pause:</strong> Stop sending any money or information until you have talked with a trusted family member or a counselor at <a href="https://www.shiphelp.org" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>shiphelp.org</a>.</li>
                <li><strong>Verify:</strong> You can do a reverse image search of their photo at images.google.com to see if the photo belongs to someone else.</li>
                <li><strong>Report:</strong> Contact the FTC at <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>reportfraud.ftc.gov</a> — reports help protect others from being targeted.</li>
              </ul>
              
              {checkedItems.includes('q5') && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
                  <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0 }}>
                    <strong>If money was discussed:</strong> Please use our <a href="/tools/gift-card-wire-transfer-scam-checklist/" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>Gift Card & Wire Transfer Checklist</a> for immediate action steps.
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid #DDE3EA', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
              DOJ Elder Fraud Hotline: 1-833-FRAUD-11
            </p>
            <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: 0 }}>
              This tool does not store any of your answers. Close this page whenever you are ready.
            </p>
          </div>

          <button 
            onClick={handleReset}
            style={{ background: 'transparent', border: 'none', color: '#0A3D3A', textDecoration: 'underline', fontSize: '1.125rem', cursor: 'pointer', padding: 0 }}
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};
