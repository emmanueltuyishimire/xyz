import React, { useState, useId } from 'react';

type Agency = 'IRS' | 'SSA' | 'Medicare' | 'Medicaid' | 'Other' | null;

interface Question {
  id: string;
  text: string;
  isHighConfidenceScamFlag: boolean;
}

const AGENCY_QUESTIONS: Record<Exclude<Agency, 'Other' | null>, Question[]> = {
  IRS: [
    { id: 'irs_1', text: 'Does the letter demand immediate payment by gift card, wire transfer, or cryptocurrency?', isHighConfidenceScamFlag: true },
    { id: 'irs_2', text: 'Does it threaten immediate arrest or deportation if you don\'t pay right now?', isHighConfidenceScamFlag: true },
    { id: 'irs_3', text: 'Does it ask you to call a phone number that is not on irs.gov?', isHighConfidenceScamFlag: true },
    { id: 'irs_4', text: 'Does it demand payment without first sending you a bill?', isHighConfidenceScamFlag: true },
    { id: 'irs_5', text: 'Is the letter addressed generically ("Dear Taxpayer") without your name?', isHighConfidenceScamFlag: false },
    { id: 'irs_6', text: 'Does it claim you owe taxes for a year before you filed returns?', isHighConfidenceScamFlag: true },
  ],
  SSA: [
    { id: 'ssa_1', text: 'Did the contact claim your Social Security number has been suspended or compromised?', isHighConfidenceScamFlag: true },
    { id: 'ssa_2', text: 'Did they say there is a warrant out for your arrest related to your SSN?', isHighConfidenceScamFlag: true },
    { id: 'ssa_3', text: 'Did they ask you to confirm your SSN by phone or email?', isHighConfidenceScamFlag: true },
    { id: 'ssa_4', text: 'Did they demand immediate payment to restore your benefits?', isHighConfidenceScamFlag: true },
    { id: 'ssa_5', text: 'Did they use threatening or urgent language about criminal charges?', isHighConfidenceScamFlag: true },
  ],
  Medicare: [
    { id: 'med_1', text: 'Did anyone call you unsolicited asking for your Medicare card number?', isHighConfidenceScamFlag: true },
    { id: 'med_2', text: 'Did they offer free equipment or services in exchange for your Medicare information?', isHighConfidenceScamFlag: true },
    { id: 'med_3', text: 'Did they ask you to confirm Medicare information to receive a benefit?', isHighConfidenceScamFlag: true },
    { id: 'med_4', text: 'Does the letter demand payment that your Medicare Explanation of Benefits (EOB) doesn\'t show?', isHighConfidenceScamFlag: true },
  ],
  Medicaid: [
    { id: 'mcaid_1', text: 'Did they claim your Medicaid is being cancelled unless you pay immediately?', isHighConfidenceScamFlag: true },
    { id: 'mcaid_2', text: 'Did they ask for payment by gift card or wire to maintain coverage?', isHighConfidenceScamFlag: true },
    { id: 'mcaid_3', text: 'Did the contact come by unsolicited phone call rather than official mail?', isHighConfidenceScamFlag: true },
  ],
};

const OFFICIAL_NUMBERS = {
  IRS: { phone: '1-800-829-1040', website: 'irs.gov/help/telephone-assistance' },
  SSA: { phone: '1-800-772-1213', website: 'ssa.gov' },
  Medicare: { phone: '1-800-633-4227', website: 'medicare.gov' },
  Medicaid: { phone: 'your state Medicaid agency', website: 'medicaid.gov' },
};

export const LetterAuthenticityChecker: React.FC = () => {
  const [agency, setAgency] = useState<Agency>(null);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [isCalculated, setIsCalculated] = useState(false);
  const formId = useId();

  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAgency(e.target.value as Agency);
    setAnswers({});
    setIsCalculated(false);
  };

  const handleAnswerChange = (questionId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateVerdict = () => {
    if (!agency || agency === 'Other') return;
    
    // Ensure all questions for the agency are answered
    const requiredQuestions = AGENCY_QUESTIONS[agency];
    const allAnswered = requiredQuestions.every(q => answers[q.id] !== undefined && answers[q.id] !== null);
    
    if (!allAnswered) {
      alert("Please answer all questions before checking the verdict.");
      return;
    }

    setIsCalculated(true);
  };

  const resetForm = () => {
    setAgency(null);
    setAnswers({});
    setIsCalculated(false);
  };

  const renderVerdict = () => {
    if (!isCalculated || !agency || agency === 'Other') return null;

    const questions = AGENCY_QUESTIONS[agency];
    const flaggedQuestions = questions.filter(q => answers[q.id] === true);
    const highConfidenceFlags = flaggedQuestions.filter(q => q.isHighConfidenceScamFlag);
    
    let verdictTitle = '';
    let verdictColor = '';
    let verdictBg = '';

    if (highConfidenceFlags.length > 0) {
      verdictTitle = 'Likely a Scam';
      verdictColor = '#E8761A';
      verdictBg = '#FFF8F0';
    } else if (flaggedQuestions.length > 0) {
      verdictTitle = 'Uncertain — Verify Directly';
      verdictColor = '#C9933A';
      verdictBg = '#FFFCF5';
    } else {
      verdictTitle = 'Likely Legitimate (But Verify)';
      verdictColor = '#0A3D3A';
      verdictBg = '#F6F8FA';
    }

    const agencyInfo = OFFICIAL_NUMBERS[agency];

    return (
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: verdictBg, border: `2px solid ${verdictColor}`, borderRadius: '0.75rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: verdictColor, margin: '0 0 1rem 0' }}>
          Verdict: {verdictTitle}
        </h3>
        
        <p style={{ fontSize: '1.125rem', color: '#0D2137', marginBottom: '1rem', lineHeight: 1.6 }}>
          <strong>Reasoning:</strong>
        </p>
        <ul style={{ fontSize: '1rem', color: '#0D2137', marginBottom: '1.5rem', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
          {flaggedQuestions.length > 0 ? (
            flaggedQuestions.map(q => (
              <li key={q.id} style={{ marginBottom: '0.5rem' }}>You answered "Yes" to: <em>{q.text}</em> (This is a known red flag)</li>
            ))
          ) : (
            <li>You answered "No" to all common scam indicators. However, scammers constantly invent new tactics.</li>
          )}
        </ul>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
          <h4 style={{ fontSize: '1.125rem', color: '#0A3D3A', margin: '0 0 0.5rem 0' }}>Your Next Step</h4>
          <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: '0 0 1rem 0', lineHeight: 1.6 }}>
            Call using the number below, taken directly from the official .gov website. <strong>Never call the number printed on the suspicious letter.</strong>
          </p>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0D2137', marginBottom: '0.5rem' }}>
            Official {agency} Number: {agencyInfo.phone}
          </div>
          <div style={{ fontSize: '1rem', color: '#4B5A6E' }}>
            Verify at: <a href={`https://${agencyInfo.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>{agencyInfo.website}</a>
          </div>
        </div>

        {agency === 'IRS' && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #DDE3EA' }}>
            <p style={{ fontSize: '1rem', color: '#0D2137', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Received a specific IRS Notice?</p>
            <p style={{ fontSize: '0.95rem', color: '#4B5A6E', margin: 0 }}>
              Use our decoders to learn what they mean: <a href="/tools/irs-cp14-notice-decoder/" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>CP14</a>, CP504, LT11, CP90, CP2000.
            </p>
          </div>
        )}

        <button 
          onClick={resetForm}
          style={{ display: 'inline-block', marginTop: '1.5rem', background: 'transparent', border: 'none', color: '#0A3D3A', textDecoration: 'underline', fontSize: '1rem', cursor: 'pointer', padding: 0 }}
        >
          Check another letter
        </button>
      </div>
    );
  };

  return (
    <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #DDE3EA' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#0D2137', margin: '0 0 1.5rem 0' }}>Authenticity Checker</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor={`${formId}-agency`} style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: '#4B5A6E', marginBottom: '0.5rem' }}>
          Which agency does the letter or caller claim to be from?
        </label>
        <select
          id={`${formId}-agency`}
          value={agency || ''}
          onChange={handleAgencyChange}
          style={{ width: '100%', padding: '0.875rem', fontSize: '1.125rem', color: '#0D2137', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', backgroundColor: '#fff', minHeight: '44px' }}
        >
          <option value="" disabled>Select an agency...</option>
          <option value="IRS">IRS (Internal Revenue Service)</option>
          <option value="SSA">SSA (Social Security Administration)</option>
          <option value="Medicare">Medicare</option>
          <option value="Medicaid">Medicaid (State Agency)</option>
          <option value="Other">Other / I'm not sure</option>
        </select>
      </div>

      {agency === 'Other' && (
        <div style={{ backgroundColor: '#F6F8FA', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
          <p style={{ fontSize: '1rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
            If you're not sure which agency contacted you, or if it was a different agency altogether, we recommend describing what the contact said using our <a href="/tools/scam-message-call-decoder/" style={{ color: '#0A3D3A', textDecoration: 'underline', fontWeight: 600 }}>Scam Message/Call Decoder</a>. It can spot generalized scam tactics used across all impersonation attempts.
          </p>
        </div>
      )}

      {agency && agency !== 'Other' && !isCalculated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#0D2137', margin: 0 }}>Answer these questions about the contact:</h3>
          
          {AGENCY_QUESTIONS[agency].map((q) => (
            <div key={q.id} style={{ backgroundColor: '#F6F8FA', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #DDE3EA' }}>
              <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: '0 0 1rem 0', fontWeight: 600, lineHeight: 1.5 }}>
                {q.text}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === true}
                    onChange={() => handleAnswerChange(q.id, true)}
                    style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', color: '#0D2137', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === false}
                    onChange={() => handleAnswerChange(q.id, false)}
                    style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
                  />
                  No
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={calculateVerdict}
            style={{
              backgroundColor: '#0A3D3A',
              color: '#ffffff',
              padding: '1rem 1.5rem',
              fontSize: '1.125rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              minHeight: '44px',
              marginTop: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#072b29'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0A3D3A'}
          >
            Check Verdict
          </button>
        </div>
      )}

      {renderVerdict()}
    </div>
  );
};
