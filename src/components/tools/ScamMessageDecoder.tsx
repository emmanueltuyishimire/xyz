import React, { useState, useId } from 'react';

const stateAgLinks: Record<string, string> = {
  'Alabama': 'https://ago.alabama.gov/divisions/consumer-protection',
  'Alaska': 'https://law.alaska.gov/department/civil/consumer',
  'Arizona': 'https://www.azag.gov/complaints/consumer',
  'Arkansas': 'https://arkansasag.gov/consumer-protection',
  'California': 'https://oag.ca.gov/consumers',
  'Colorado': 'https://coag.gov/office-sections/consumer-protection',
  'Connecticut': 'https://portal.ct.gov/ag/consumer',
  'Delaware': 'https://ago.delaware.gov/divisions/consumer/',
  'Florida': 'https://myfloridalegal.com/consumer-protection',
  'Georgia': 'https://law.georgia.gov/consumer-protection',
  'Hawaii': 'https://hawaii.gov/ag/consumer-protection',
  'Idaho': 'https://ag.idaho.gov/consumer-protection',
  'Illinois': 'https://illinoisattorneygeneral.gov/consumers',
  'Indiana': 'https://in.gov/attorneygeneral/consumer-protection',
  'Iowa': 'https://iowa.gov/ag/consumer-protection',
  'Kansas': 'https://ag.ks.gov/in-your-corner-kansas',
  'Kentucky': 'https://ag.ky.gov/consumer-protection',
  'Louisiana': 'https://ag.louisiana.gov/consumer-protection',
  'Maine': 'https://www.maine.gov/ag/consumer',
  'Maryland': 'https://www.marylandattorneygeneral.gov/pages/consumer/default.aspx',
  'Massachusetts': 'https://www.mass.gov/attorney-generals-consumer-advocacy-response-division',
  'Michigan': 'https://www.michigan.gov/ag/consumer-protection',
  'Minnesota': 'https://www.ag.state.mn.us/consumer',
  'Mississippi': 'https://www.ago.ms.gov/consumer-protection',
  'Missouri': 'https://ago.mo.gov/consumer-protection',
  'Montana': 'https://dojmt.gov/consumer',
  'Nebraska': 'https://ago.nebraska.gov/consumer-protection',
  'Nevada': 'https://ag.nv.gov/AboutUs/Contact/Consumer_Protection/',
  'New Hampshire': 'https://www.doj.nh.gov/consumer',
  'New Jersey': 'https://www.njconsumeraffairs.gov',
  'New Mexico': 'https://nmag.gov/consumer-protection',
  'New York': 'https://ag.ny.gov/consumer-protection',
  'North Carolina': 'https://ncdoj.gov/protecting-consumers',
  'North Dakota': 'https://attorneygeneral.nd.gov/consumer',
  'Ohio': 'https://www.ohioattorneygeneral.gov/individuals-and-families/consumers',
  'Oklahoma': 'https://www.oag.ok.gov/consumer-protection',
  'Oregon': 'https://www.doj.state.or.us/consumer-protection',
  'Pennsylvania': 'https://www.attorneygeneral.gov/consumers',
  'Rhode Island': 'https://riag.ri.gov/consumers',
  'South Carolina': 'https://consumer.sc.gov',
  'South Dakota': 'https://atg.sd.gov/ConsumerProtection',
  'Tennessee': 'https://www.tn.gov/attorneygeneral/consumer.html',
  'Texas': 'https://www.texasattorneygeneral.gov/consumer-protection',
  'Utah': 'https://consumerprotection.utah.gov',
  'Vermont': 'https://ago.vermont.gov/consumer-protection',
  'Virginia': 'https://www.ago.virginia.gov/divisions/consumer-protection',
  'Washington': 'https://www.atg.wa.gov/consumer-protection',
  'West Virginia': 'https://ago.wv.gov/consumer-protection',
  'Wisconsin': 'https://www.doj.state.wi.us/consumer',
  'Wyoming': 'https://ag.wyo.gov/consumer-protection',
  'DC': 'https://oag.dc.gov/consumer-protection'
};

const textPatterns = [
  { group: 'Payment Demands', matchers: [/gift card/i, /itunes/i, /google play/i, /wire transfer/i, /western union/i, /bitcoin/i, /crypto/i] },
  { group: 'Threats', matchers: [/arrest warrant/i, /police/i, /lawsuit/i, /suspended/i, /legal action/i] },
  { group: 'Urgency', matchers: [/act now/i, /today only/i, /limited time/i, /urgent/i, /immediately/i] },
  { group: 'Sensitive Info Request', matchers: [/ssn/i, /social security number/i, /medicare number/i, /account number/i] },
  { group: 'False Promises', matchers: [/you won/i, /prize/i, /lottery/i, /inheritance/i, /million/i] },
  { group: 'Government Impersonation', matchers: [/irs/i, /internal revenue/i, /ssa/i, /social security administration/i] },
  { group: 'Isolation Tactics', matchers: [/call immediately/i, /do not hang up/i, /stay on the line/i] }
];

type RiskLevel = 'Low' | 'Medium' | 'High' | null;

export const ScamMessageDecoder: React.FC = () => {
  const pasteId = useId();
  const stateId = useId();
  
  const [activeTab, setActiveTab] = useState<'paste' | 'call'>('paste');
  const [messageText, setMessageText] = useState('');
  const [callAnswers, setCallAnswers] = useState<Record<number, boolean>>({});
  
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(null);
  const [detectedFlags, setDetectedFlags] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const callQuestions = [
    { id: 1, text: 'Did they create urgency (saying you must act TODAY or this is your last chance)?', isFlag: true, weight: 1 },
    { id: 2, text: 'Did they threaten arrest, lawsuit, or benefit suspension?', isFlag: true, weight: 4 }, // threat
    { id: 3, text: 'Did they ask you to pay by gift card, wire transfer, crypto, or cash by mail?', isFlag: true, weight: 4 }, // payment
    { id: 4, text: 'Did they ask you to stay on the phone and not talk to family?', isFlag: true, weight: 1 },
    { id: 5, text: 'Did they claim to be from a government agency (IRS, SSA, Medicare, police)?', isFlag: true, weight: 1 },
    { id: 6, text: 'Did the call start with a recorded message?', isFlag: true, weight: 1 },
    { id: 7, text: 'Did they offer an unexpected prize, lottery win, or inheritance?', isFlag: true, weight: 1 },
    { id: 8, text: 'Did they ask for your Social Security number, bank account, or Medicare number?', isFlag: true, weight: 1 },
    { id: 9, text: 'Did they say your computer has a virus and offer to fix it remotely?', isFlag: true, weight: 1 },
    { id: 10, text: 'Did they claim someone in your family is in trouble and needs money now?', isFlag: true, weight: 1 },
  ];

  const handleCallAnswer = (qId: number, val: boolean) => {
    setCallAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const analyze = () => {
    setErrorMsg('');
    setRiskLevel(null);
    setDetectedFlags([]);

    let flags: string[] = [];
    let flagCount = 0;
    let autoHighRisk = false;

    if (activeTab === 'paste') {
      if (!messageText.trim()) {
        setErrorMsg('Please paste a message or email to analyze.');
        return;
      }
      textPatterns.forEach(pattern => {
        const matches = pattern.matchers.filter(regex => regex.test(messageText));
        if (matches.length > 0) {
          flags.push(`Matched pattern: ${pattern.group} (e.g., "${matches[0].source.replace(/\\/g, '').replace(/i$/,'')}")`);
          flagCount++;
          if (pattern.group === 'Payment Demands' || pattern.group === 'Threats') {
            autoHighRisk = true;
          }
        }
      });
    } else {
      if (Object.keys(callAnswers).length < 10) {
        setErrorMsg('Please answer all 10 questions to get an accurate analysis.');
        return;
      }
      callQuestions.forEach(q => {
        if (callAnswers[q.id]) {
          flags.push(`Answered Yes: ${q.text}`);
          flagCount++;
          if (q.weight >= 4) {
            autoHighRisk = true;
          }
        }
      });
    }

    setDetectedFlags(flags);

    if (autoHighRisk || flagCount >= 4) {
      setRiskLevel('High');
    } else if (flagCount >= 2) {
      setRiskLevel('Medium');
    } else {
      setRiskLevel('Low');
    }
  };

  const reset = () => {
    setMessageText('');
    setCallAnswers({});
    setRiskLevel(null);
    setDetectedFlags([]);
    setErrorMsg('');
  };

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #DDE3EA', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      {/* Tabs */}
      {!riskLevel && (
        <div style={{ display: 'flex', borderBottom: '2px solid #DDE3EA', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('paste')}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'paste' ? '4px solid #0A3D3A' : 'none',
              color: activeTab === 'paste' ? '#0A3D3A' : '#4B5A6E',
              fontWeight: activeTab === 'paste' ? 700 : 400,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Paste Message
          </button>
          <button
            onClick={() => setActiveTab('call')}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'call' ? '4px solid #0A3D3A' : 'none',
              color: activeTab === 'call' ? '#0A3D3A' : '#4B5A6E',
              fontWeight: activeTab === 'call' ? 700 : 400,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Describe a Call
          </button>
        </div>
      )}

      {!riskLevel ? (
        <>
          {activeTab === 'paste' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor={pasteId} style={{ display: 'block', fontSize: '1rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: 700 }}>
                Paste the suspicious text message or email below:
              </label>
              <textarea
                id={pasteId}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '1rem',
                  fontSize: '1.125rem',
                  border: '2px solid #DDE3EA',
                  borderRadius: '0.5rem',
                  color: '#0D2137',
                  resize: 'vertical'
                }}
                placeholder="e.g. URGENT: Your account has been suspended..."
              />
            </div>
          )}

          {activeTab === 'call' && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: 0, fontWeight: 700 }}>Answer Yes or No for each statement about the call:</p>
              {callQuestions.map(q => (
                <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F6F8FA' }}>
                  <span style={{ fontSize: '1.125rem', color: '#0D2137' }}>{q.text}</span>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleCallAnswer(q.id, true)}
                      style={{
                        padding: '0.75rem 2rem',
                        fontSize: '1.125rem',
                        borderRadius: '0.5rem',
                        border: callAnswers[q.id] === true ? '2px solid #0A3D3A' : '2px solid #DDE3EA',
                        background: callAnswers[q.id] === true ? '#0A3D3A' : '#FFFFFF',
                        color: callAnswers[q.id] === true ? '#FFFFFF' : '#4B5A6E',
                        cursor: 'pointer',
                        fontWeight: 700,
                        minHeight: '44px'
                      }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleCallAnswer(q.id, false)}
                      style={{
                        padding: '0.75rem 2rem',
                        fontSize: '1.125rem',
                        borderRadius: '0.5rem',
                        border: callAnswers[q.id] === false ? '2px solid #0A3D3A' : '2px solid #DDE3EA',
                        background: callAnswers[q.id] === false ? '#F6F8FA' : '#FFFFFF',
                        color: callAnswers[q.id] === false ? '#0D2137' : '#4B5A6E',
                        cursor: 'pointer',
                        fontWeight: 700,
                        minHeight: '44px'
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div style={{ color: '#E8761A', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>
              {errorMsg}
            </div>
          )}

          <button
            onClick={analyze}
            style={{
              width: '100%',
              background: '#0A3D3A',
              color: '#FFFFFF',
              fontSize: '1.25rem',
              fontWeight: 700,
              padding: '1rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              minHeight: '56px'
            }}
          >
            Analyze for Scam Red Flags
          </button>
        </>
      ) : (
        <div style={{ background: '#F6F8FA', borderRadius: '0.75rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#0D2137', marginBottom: '1.5rem', textAlign: 'center' }}>Analysis Results</h2>
          
          <div style={{ 
            background: '#FFFFFF', 
            border: `3px solid ${riskLevel === 'High' ? '#E8761A' : riskLevel === 'Medium' ? '#C9933A' : '#1A7A4E'}`,
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '1rem', color: '#4B5A6E', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessed Risk Level</p>
            <p style={{ fontSize: '2.5rem', color: riskLevel === 'High' ? '#E8761A' : riskLevel === 'Medium' ? '#C9933A' : '#1A7A4E', margin: 0, fontWeight: 800 }}>
              {riskLevel} RISK
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0D2137', marginBottom: '1rem' }}>Red Flags Detected:</h3>
            {detectedFlags.length > 0 ? (
              <ul style={{ paddingLeft: '1.5rem', color: '#4B5A6E', fontSize: '1.125rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {detectedFlags.map((flag, i) => <li key={i}>{flag}</li>)}
              </ul>
            ) : (
              <p style={{ fontSize: '1.125rem', color: '#4B5A6E', lineHeight: 1.6 }}>No obvious red flags detected, but always stay cautious. Never share personal information if you did not initiate the contact.</p>
            )}
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #DDE3EA' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0D2137', marginBottom: '1rem' }}>What To Do Next</h3>
            {riskLevel === 'High' ? (
              <ul style={{ paddingLeft: '1.5rem', color: '#0D2137', fontSize: '1.125rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><strong>Do not pay.</strong> Do not buy gift cards, wire money, or use cryptocurrency.</li>
                <li><strong>Stop communication.</strong> Hang up the phone immediately or delete the message. Do not respond.</li>
                <li><strong>Contact your bank.</strong> If you already gave payment info, call your bank using the number on the back of your card.</li>
                <li><strong>Report it.</strong> Help protect others by reporting this attempt.</li>
              </ul>
            ) : riskLevel === 'Medium' ? (
              <ul style={{ paddingLeft: '1.5rem', color: '#0D2137', fontSize: '1.125rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><strong>Do not click links.</strong> If it was a text or email, delete it.</li>
                <li><strong>Verify independently.</strong> If they claimed to be from a company, call that company using a known, trusted number.</li>
                <li><strong>Do not provide information.</strong> Do not confirm your name, address, or accounts.</li>
              </ul>
            ) : (
              <ul style={{ paddingLeft: '1.5rem', color: '#0D2137', fontSize: '1.125rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><strong>Stay vigilant.</strong> Scammers constantly change tactics.</li>
                <li><strong>Ignore unexpected requests.</strong> Real agencies do not demand immediate action.</li>
              </ul>
            )}

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #DDE3EA' }}>
              <h4 style={{ fontSize: '1.125rem', color: '#0D2137', marginBottom: '1rem' }}>Official Reporting Channels</h4>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor={stateId} style={{ display: 'block', fontSize: '0.875rem', color: '#4B5A6E', marginBottom: '0.25rem' }}>Find Your State Attorney General:</label>
                <select 
                  id={stateId}
                  value={selectedState} 
                  onChange={e => setSelectedState(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '1.125rem', borderRadius: '0.5rem', border: '1px solid #DDE3EA', minHeight: '44px' }}
                >
                  <option value="">Select your state...</option>
                  {Object.keys(stateAgLinks).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {selectedState && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <a href={stateAgLinks[selectedState]} target="_blank" rel="noopener noreferrer" style={{ color: '#1A7A4E', fontWeight: 700, fontSize: '1.125rem', textDecoration: 'underline' }}>
                      Report to {selectedState} Attorney General →
                    </a>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', fontSize: '1.125rem', textDecoration: 'underline' }}>FTC Report Fraud Portal</a>
                <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', fontSize: '1.125rem', textDecoration: 'underline' }}>FBI Internet Crime Complaint Center (IC3)</a>
                <p style={{ margin: 0, fontSize: '1.125rem', color: '#0D2137' }}>DOJ Elder Fraud Hotline: <strong>1-833-FRAUD-11</strong></p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={reset}
              style={{ background: 'none', border: 'none', color: '#0A3D3A', fontSize: '1.125rem', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: '0.5rem' }}
            >
              Check another message or call
            </button>
            <p style={{ fontSize: '0.875rem', color: '#4B5A6E', marginTop: '1rem', lineHeight: 1.6 }}>
              Analyzed using official FTC and FBI guidelines. Verify at <a href="https://consumer.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#4B5A6E', textDecoration: 'underline' }}>FTC.gov</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
