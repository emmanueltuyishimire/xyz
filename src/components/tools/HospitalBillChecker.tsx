import React, { useState, useId } from 'react';

/**
 * HospitalBillChecker.tsx
 * Guides seniors through common hospital billing error patterns.
 * All logic runs client-side — no server calls, no data stored.
 */

interface BillQuestion {
  id: string;
  question: string;
  flagTitle: string;
  flagDetail: string;
  disputeLanguage: string;
}

const QUESTIONS: BillQuestion[] = [
  {
    id: 'q1',
    question: 'Does your bill show a charge for a private or semi-private room that you did not specifically request?',
    flagTitle: 'Potential Room Upcoding',
    flagDetail: 'Room type billed should match the room type you were assigned, not a higher-cost alternative.',
    disputeLanguage: 'I was assigned a [room type] and did not request or agree to a private room. Please provide documentation showing room assignment and correct the charge accordingly.',
  },
  {
    id: 'q2',
    question: 'Are there two line items for the same test, procedure, or service on the same date?',
    flagTitle: 'Duplicate Billing',
    flagDetail: 'The same service listed twice for the same date is a common billing software error.',
    disputeLanguage: 'I see duplicate charges for [service name] on [date]. Please provide documentation that two separate services were actually performed and billed correctly.',
  },
  {
    id: 'q3',
    question: 'Does the bill include a charge for a service that was scheduled but then cancelled before it happened?',
    flagTitle: 'Phantom Charge — Service Not Rendered',
    flagDetail: 'Services that were not delivered should not appear on your bill.',
    disputeLanguage: 'The service listed as [service name] on [date] was cancelled and not performed. Please remove this charge and provide a corrected statement.',
  },
  {
    id: 'q4',
    question: 'Did you bring your own medications from home, but the hospital billed you for those same medications?',
    flagTitle: 'Duplicate Medication Charge',
    flagDetail: 'Hospitals should not charge for medications the patient provided from home.',
    disputeLanguage: 'I brought my own supply of [medication name] from home. Please remove the hospital charge for this medication and confirm in writing.',
  },
  {
    id: 'q5',
    question: 'Are there charges dated before your admission date or after your discharge date?',
    flagTitle: 'Out-of-Stay Date Error',
    flagDetail: 'Charges outside your admission and discharge dates are likely date-entry errors.',
    disputeLanguage: 'My admission was [date] and discharge was [date]. Please explain and correct the charges dated outside my stay period.',
  },
  {
    id: 'q6',
    question: 'Does the bill include a vague charge labeled "miscellaneous," "supplies," or "medical supplies" without a specific description?',
    flagTitle: 'Unbundled / Vague Supply Charge',
    flagDetail: 'You are entitled to an itemized bill showing every supply with a specific description and quantity.',
    disputeLanguage: 'Please provide a fully itemized list of all supplies included in the miscellaneous/supplies charge on [date], including item name, quantity, and unit price.',
  },
  {
    id: 'q7',
    question: 'Does your Explanation of Benefits (EOB) from Medicare or your insurer show a different approved amount compared to what the hospital is billing you directly?',
    flagTitle: 'Billing Discrepancy vs. EOB',
    flagDetail: 'The amount billed to you by the hospital should align with your insurer\'s approved amount minus your share (deductible, copay).',
    disputeLanguage: 'My Explanation of Benefits from [insurer] shows an approved amount of [EOB amount] for this service. The amount you are billing me as patient responsibility does not match. Please reconcile and provide a corrected bill.',
  },
  {
    id: 'q8',
    question: 'Did an out-of-network provider (such as an anesthesiologist, radiologist, or ER doctor) treat you during what you believed was an in-network hospital stay?',
    flagTitle: 'Potential No Surprises Act Violation',
    flagDetail: 'The No Surprises Act (effective 2022) protects patients from surprise out-of-network bills in most emergency situations and from non-emergency care by out-of-network providers at in-network facilities without prior written consent.',
    disputeLanguage: 'I received treatment from an out-of-network provider at an in-network facility without providing prior written consent. Please apply No Surprises Act protections. I am also filing a complaint with CMS at cms.gov/nosurprises.',
  },
  {
    id: 'q9',
    question: 'Is the same CPT (procedure) code listed more than once for the same date of service?',
    flagTitle: 'Duplicate CPT Code',
    flagDetail: 'The same CPT code on the same date typically means the same procedure billed twice — a common billing software error.',
    disputeLanguage: 'CPT code [code] appears twice on [date]. Please audit these line items and provide documentation that two separate procedures were performed, or issue a corrected claim removing the duplicate.',
  },
  {
    id: 'q10',
    question: 'Did you receive a surprise bill for services you were told would be fully covered by your insurance?',
    flagTitle: 'Possible Balance Billing Violation',
    flagDetail: 'In many situations, providers cannot bill you more than your in-network cost-sharing amount, especially for emergency care or out-of-network providers at in-network facilities.',
    disputeLanguage: 'I was informed this service would be covered at the in-network rate. Please review this charge for compliance with the No Surprises Act and your network contract obligations. If this is balance billing, I request it be corrected.',
  },
];

export const HospitalBillChecker: React.FC = () => {
  const uid = useId();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [dateOfService, setDateOfService] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [disputedItems, setDisputedItems] = useState('');
  const [showLetter, setShowLetter] = useState(false);

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const flagged = QUESTIONS.filter(q => checked[q.id]);
  const flagCount = flagged.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowLetter(false);
  };

  const reset = () => {
    setChecked({});
    setSubmitted(false);
    setShowLetter(false);
    setPatientName('');
    setHospitalName('');
    setDateOfService('');
    setAccountNumber('');
    setDisputedItems('');
  };

  const getDisputeLetterText = () => {
    const itemsList = flagged.map((q, i) =>
      `${i + 1}. ${q.flagTitle}: ${q.disputeLanguage}`
    ).join('\n\n');

    return `[Your Name]
[Your Address]
[City, State, ZIP]
[Date]

${hospitalName || '[Hospital Name]'} Billing Department
[Hospital Address]

Re: Formal Dispute of Charges — Account #${accountNumber || '[Account Number]'} — Date of Service: ${dateOfService || '[Date of Service]'}

Dear Billing Department,

I am writing to formally dispute the following charges on the account referenced above for ${patientName || '[Patient Name]'}. I have reviewed my itemized bill and Explanation of Benefits and identified the following discrepancies:

${itemsList || '[Describe disputed items]'}

I respectfully request:
1. A written response addressing each disputed item within 30 days.
2. A corrected itemized statement reflecting any adjustments.
3. That collection activity be paused on disputed amounts during the review period.

Please contact me in writing at the address above. I am sending this letter by certified mail and retaining a copy for my records.

Sincerely,
${patientName || '[Your Name]'}`;
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #DDE3EA',
    borderRadius: '6px',
    fontSize: '16px',
    color: '#0D2137',
    background: '#fff',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 700,
    color: '#4B5A6E',
    marginBottom: '6px',
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Trust bar */}
      <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#4B5A6E', fontWeight: 600 }}>
        <span>🔒 Private — nothing stored</span>
        <span>✓ Free, no account</span>
        <span>✓ Based on CMS and FTC guidance</span>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} noValidate>
          <p style={{ fontSize: '18px', color: '#0D2137', lineHeight: 1.7, marginBottom: '20px' }}>
            Check each statement that applies to your bill. A "Yes" to any question may indicate a billing error worth disputing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {QUESTIONS.map((q, i) => (
              <label key={q.id} htmlFor={`${uid}-${q.id}`} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: checked[q.id] ? '#fff8f0' : '#fff', border: `1.5px solid ${checked[q.id] ? '#E8761A' : '#DDE3EA'}`, borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                <input
                  type="checkbox"
                  id={`${uid}-${q.id}`}
                  checked={!!checked[q.id]}
                  onChange={() => toggle(q.id)}
                  style={{ marginTop: '3px', width: '20px', height: '20px', flexShrink: 0, accentColor: '#E8761A' }}
                />
                <span style={{ fontSize: '18px', color: '#0D2137', lineHeight: 1.6 }}>
                  <strong style={{ color: '#4B5A6E', fontSize: '13px', display: 'block', marginBottom: '2px' }}>Question {i + 1}</strong>
                  {q.question}
                </span>
              </label>
            ))}
          </div>

          <button type="submit" style={{ background: '#0A3D3A', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px 32px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', width: '100%', minHeight: '56px' }}>
            Review My Bill for Errors →
          </button>
        </form>
      ) : (
        <div>
          {/* Result header */}
          {flagCount === 0 ? (
            <div style={{ background: '#f0fdf4', border: '2px solid #1A7A4E', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#1A7A4E', margin: '0 0 8px 0' }}>✓ No Obvious Red Flags Found</p>
              <p style={{ fontSize: '18px', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
                Based on your answers, your bill does not show the most common billing error patterns. You may still want to compare it line-by-line to your Explanation of Benefits (EOB) from your insurer.
              </p>
            </div>
          ) : (
            <div style={{ background: '#fff8f0', border: '2px solid #E8761A', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#E8761A', margin: '0 0 8px 0' }}>
                ⚠ {flagCount} Potential Issue{flagCount !== 1 ? 's' : ''} Found
              </p>
              <p style={{ fontSize: '18px', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
                We found {flagCount} issue{flagCount !== 1 ? 's' : ''} that may be worth disputing. Review each item below before paying.
              </p>
            </div>
          )}

          {/* Flagged items */}
          {flagged.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '20px', color: '#0D2137', marginBottom: '16px' }}>Flagged Items</h3>
              {flagged.map(q => (
                <div key={q.id} style={{ background: '#fff', border: '1.5px solid #E8761A', borderRadius: '8px', padding: '18px', marginBottom: '12px', borderLeft: '5px solid #E8761A' }}>
                  <p style={{ fontSize: '17px', fontWeight: 700, color: '#E8761A', margin: '0 0 6px 0' }}>{q.flagTitle}</p>
                  <p style={{ fontSize: '17px', color: '#0D2137', margin: '0 0 8px 0', lineHeight: 1.6 }}>{q.flagDetail}</p>
                  <p style={{ fontSize: '15px', color: '#4B5A6E', margin: 0, lineHeight: 1.6 }}>
                    <strong>Dispute language:</strong> {q.disputeLanguage}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Dispute letter generator */}
          {flagged.length > 0 && (
            <div style={{ background: '#F6F8FA', border: '1.5px solid #DDE3EA', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', color: '#0D2137', marginBottom: '16px' }}>Generate Your Dispute Letter</h3>
              <p style={{ fontSize: '17px', color: '#4B5A6E', marginBottom: '20px', lineHeight: 1.6 }}>
                Fill in the details below to generate a formal dispute letter. Send it by certified mail with return receipt.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle} htmlFor={`${uid}-patient-name`}>Your Name (Patient)</label>
                  <input id={`${uid}-patient-name`} style={inputStyle} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label style={labelStyle} htmlFor={`${uid}-hospital-name`}>Hospital / Facility Name</label>
                  <input id={`${uid}-hospital-name`} style={inputStyle} value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="Hospital name" />
                </div>
                <div>
                  <label style={labelStyle} htmlFor={`${uid}-dos`}>Date of Service</label>
                  <input id={`${uid}-dos`} style={inputStyle} type="date" value={dateOfService} onChange={e => setDateOfService(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor={`${uid}-account`}>Account / Claim Number</label>
                  <input id={`${uid}-account`} style={inputStyle} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="From your bill" />
                </div>
              </div>

              <button type="button" onClick={() => setShowLetter(true)} style={{ background: '#0A3D3A', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 28px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', minHeight: '52px' }}>
                Generate Dispute Letter
              </button>

              {showLetter && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ background: '#fff', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '20px', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', color: '#0D2137', lineHeight: 1.7 }}>
                    {getDisputeLetterText()}
                  </div>
                  <button type="button" onClick={() => window.print()} style={{ marginTop: '12px', background: '#fff', color: '#0A3D3A', border: '2px solid #0A3D3A', borderRadius: '8px', padding: '12px 24px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
                    🖨 Print This Letter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Next steps */}
          <div style={{ background: '#0A3D3A', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#C9933A', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next Steps</p>
            <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#fff', fontSize: '17px', lineHeight: 1.7 }}>
              <li>Call the billing department and ask to speak with a billing supervisor.</li>
              <li>Send your dispute letter by certified mail with return receipt — keep a copy.</li>
              <li>Follow up in 30 days if you have not received a written response.</li>
              <li>If unresolved: file a complaint with your state Department of Insurance or at <a href="https://www.cms.gov/nosurprises" target="_blank" rel="noopener noreferrer" style={{ color: '#C9933A' }}>cms.gov/nosurprises</a>.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/tools/how-to-dispute-a-medical-bill/" style={{ background: '#E8761A', color: '#fff', borderRadius: '8px', padding: '14px 24px', fontSize: '17px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Step-by-Step Dispute Wizard →
            </a>
            <button type="button" onClick={reset} style={{ background: '#fff', color: '#0A3D3A', border: '2px solid #0A3D3A', borderRadius: '8px', padding: '14px 24px', fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
