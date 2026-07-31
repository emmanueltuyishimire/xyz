import React, { useState, useId } from 'react';

const STATE_DOI: Record<string, { name: string; url: string }> = {
  AL: { name: 'Alabama Department of Insurance', url: 'https://www.aldoi.gov/consumers/complaintinformation.aspx' },
  AK: { name: 'Alaska Division of Insurance', url: 'https://www.commerce.alaska.gov/web/ins/consumer.aspx' },
  AZ: { name: 'Arizona Department of Insurance', url: 'https://insurance.az.gov/consumers' },
  AR: { name: 'Arkansas Insurance Department', url: 'https://insurance.arkansas.gov' },
  CA: { name: 'California Department of Insurance', url: 'https://www.insurance.ca.gov/0400-consumers/0300-res_assist/0100-complaint/' },
  CO: { name: 'Colorado Division of Insurance', url: 'https://doi.colorado.gov/consumers' },
  CT: { name: 'Connecticut Insurance Department', url: 'https://portal.ct.gov/cid/consumers' },
  DE: { name: 'Delaware Department of Insurance', url: 'https://delawareinsurance.gov' },
  FL: { name: 'Florida Department of Financial Services', url: 'https://www.myfloridacfo.com/division/consumers' },
  GA: { name: 'Georgia Department of Insurance', url: 'https://oci.georgia.gov/consumer-information' },
  HI: { name: 'Hawaii Insurance Division', url: 'https://insurance.ehawaii.gov/consumers' },
  ID: { name: 'Idaho Department of Insurance', url: 'https://doi.idaho.gov/consumers' },
  IL: { name: 'Illinois Department of Insurance', url: 'https://insurance.illinois.gov/consumer/filing-a-complaint' },
  IN: { name: 'Indiana Department of Insurance', url: 'https://www.in.gov/idoi/consumer' },
  IA: { name: 'Iowa Insurance Division', url: 'https://iid.iowa.gov/consumers' },
  KS: { name: 'Kansas Insurance Department', url: 'https://www.ksinsurance.org/consumers' },
  KY: { name: 'Kentucky Department of Insurance', url: 'https://insurance.ky.gov/ppc/Pages/ConsumerComplaints.aspx' },
  LA: { name: 'Louisiana Department of Insurance', url: 'https://ldi.la.gov/consumers' },
  ME: { name: 'Maine Bureau of Insurance', url: 'https://www.maine.gov/pfr/insurance/consumer-information' },
  MD: { name: 'Maryland Insurance Administration', url: 'https://insurance.maryland.gov/consumer' },
  MA: { name: 'Massachusetts Division of Insurance', url: 'https://www.mass.gov/orgs/division-of-insurance' },
  MI: { name: 'Michigan DIFS', url: 'https://www.michigan.gov/difs/consumers' },
  MN: { name: 'Minnesota Department of Commerce', url: 'https://mn.gov/commerce/consumers' },
  MS: { name: 'Mississippi Insurance Department', url: 'https://www.mid.ms.gov/consumers' },
  MO: { name: 'Missouri Department of Commerce and Insurance', url: 'https://insurance.mo.gov/consumers' },
  MT: { name: 'Montana Commissioner of Securities and Insurance', url: 'https://csimt.gov/consumers' },
  NE: { name: 'Nebraska Department of Insurance', url: 'https://doi.nebraska.gov/consumers' },
  NV: { name: 'Nevada Division of Insurance', url: 'https://doi.nv.gov/Consumers/' },
  NH: { name: 'New Hampshire Insurance Department', url: 'https://www.insurance.nh.gov/consumers' },
  NJ: { name: 'New Jersey Department of Banking and Insurance', url: 'https://www.nj.gov/dobi/consumer.htm' },
  NM: { name: 'New Mexico Office of Superintendent of Insurance', url: 'https://www.osi.state.nm.us/consumers' },
  NY: { name: 'New York Department of Financial Services', url: 'https://www.dfs.ny.gov/complaint' },
  NC: { name: 'North Carolina Department of Insurance', url: 'https://www.ncdoi.gov/consumer-services' },
  ND: { name: 'North Dakota Insurance Department', url: 'https://www.insurance.nd.gov/consumer-resources' },
  OH: { name: 'Ohio Department of Insurance', url: 'https://insurance.ohio.gov/consumer' },
  OK: { name: 'Oklahoma Insurance Department', url: 'https://www.oid.ok.gov/consumer' },
  OR: { name: 'Oregon Division of Financial Regulation', url: 'https://dfr.oregon.gov/consumers' },
  PA: { name: 'Pennsylvania Insurance Department', url: 'https://www.insurance.pa.gov/Coverage/Pages/Consumer-Resources.aspx' },
  RI: { name: 'Rhode Island Department of Business Regulation', url: 'https://dbr.ri.gov/divisions/insurance/consumer.php' },
  SC: { name: 'South Carolina Department of Insurance', url: 'https://doi.sc.gov/162/Consumer-Services' },
  SD: { name: 'South Dakota Division of Insurance', url: 'https://dlr.sd.gov/insurance/consumers' },
  TN: { name: 'Tennessee Department of Commerce and Insurance', url: 'https://www.tn.gov/commerce/divisions/insurance/consumer-insurance-services' },
  TX: { name: 'Texas Department of Insurance', url: 'https://www.tdi.texas.gov/consumer' },
  UT: { name: 'Utah Insurance Department', url: 'https://insurance.utah.gov/consumers' },
  VT: { name: 'Vermont Department of Financial Regulation', url: 'https://dfr.vermont.gov/consumers/insurance' },
  VA: { name: 'Virginia Bureau of Insurance', url: 'https://www.scc.virginia.gov/pages/insurance-consumer' },
  WA: { name: 'Washington Office of the Insurance Commissioner', url: 'https://www.insurance.wa.gov/file-complaint' },
  WV: { name: 'West Virginia Insurance Commission', url: 'https://www.wvinsurance.gov/consumer-resources' },
  WI: { name: "Wisconsin Office of the Commissioner of Insurance", url: 'https://oci.wi.gov/Pages/Consumers/Homepage.aspx' },
  WY: { name: 'Wyoming Department of Insurance', url: 'https://doi.wyo.gov/consumers' },
  DC: { name: 'DC Department of Insurance, Securities and Banking', url: 'https://disb.dc.gov/consumers' },
};

const STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
  ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],
  ['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
  ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],
  ['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
  ['DC','Washington DC'],
];

export const MedicalBillDisputeWizard: React.FC = () => {
  const uid = useId();
  const [step, setStep] = useState(1);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [eobAmount, setEobAmount] = useState('');
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [dateOfService, setDateOfService] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [disputedItems, setDisputedItems] = useState('');
  const [showLetter, setShowLetter] = useState(false);
  const [selectedState, setSelectedState] = useState('');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';
  const amber = '#E8761A';
  const gold = '#C9933A';

  const steps = ['Request Itemized Bill', 'Compare to EOB', 'Generate Dispute Letter', 'Escalate If Needed'];

  const billNum = parseFloat(billAmount) || 0;
  const eobNum = parseFloat(eobAmount) || 0;
  const hasDiscrepancy = billNum > 0 && eobNum > 0 && billNum > eobNum;

  const letterText = `[Your Name]
[Your Address]
[City, State, ZIP]
[Today's Date]

${hospitalName || '[Hospital Name]'} Billing Department
[Hospital Address]

Re: Formal Billing Dispute — Account #${accountNumber || '[Account Number]'} — Date of Service: ${dateOfService || '[Date of Service]'}

Dear Billing Department,

I am writing to formally dispute the following charges on the above account for ${patientName || '[Patient Name]'}:

${disputedItems || '[Describe each disputed charge with the line item description and reason for dispute]'}

I request the following within 30 days of this letter:
1. A written explanation of each disputed charge
2. A corrected itemized statement reflecting any adjustments
3. A pause on collection activity for the disputed amounts during the review period

I am sending this letter by certified mail with return receipt. Please respond in writing at the address above.

Sincerely,
${patientName || '[Your Name]'}`;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #DDE3EA',
    borderRadius: '6px', fontSize: '16px', color: navy, background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '14px', fontWeight: 700, color: gray, marginBottom: '6px',
  };
  const btnPrimary: React.CSSProperties = {
    background: teal, color: '#fff', border: 'none', borderRadius: '8px',
    padding: '14px 28px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', minHeight: '52px',
  };

  const doi = selectedState ? STATE_DOI[selectedState] : null;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto' }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => { if (i + 1 <= step) setStep(i + 1); }}
            style={{ flex: '1', minWidth: '80px', textAlign: 'center', padding: '10px 8px',
              background: step === i + 1 ? teal : step > i + 1 ? '#e8f5f3' : '#f6f8fa',
              borderRadius: '8px', border: `2px solid ${step === i + 1 ? teal : step > i + 1 ? '#1A7A4E' : '#DDE3EA'}`,
              cursor: i + 1 <= step ? 'pointer' : 'default' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: step === i + 1 ? '#fff' : step > i + 1 ? '#1A7A4E' : gray }}>{`Step ${i + 1}`}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: step === i + 1 ? '#fff' : navy, lineHeight: 1.3 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '22px', color: navy, marginBottom: '12px' }}>Step 1: Request Your Itemized Bill</h2>
          <p style={{ fontSize: '18px', color: gray, lineHeight: 1.7, marginBottom: '16px' }}>
            Call the hospital billing department and ask for a fully itemized statement. You are legally entitled to one.
          </p>
          <div style={{ background: '#f6f8fa', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: teal, marginBottom: '8px', textTransform: 'uppercase' }}>Exact Phone Script</p>
            <p style={{ fontSize: '17px', color: navy, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
              "Hello, I am calling to request a fully itemized statement of charges for my visit or stay on [date]. I need each service listed separately with its CPT code, description, quantity, and the charge for each item. I understand I am legally entitled to this document."
            </p>
          </div>
          <div style={{ background: '#fff8f0', border: '1.5px solid #E8761A', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '16px', color: navy, margin: 0, lineHeight: 1.6 }}>
              <strong>Tip:</strong> Ask for the itemized bill <em>before</em> paying anything on a large medical bill. Hospitals have 30 days to provide it in most states.
            </p>
          </div>
          <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '20px' }}>
            <input type="checkbox" id={`${uid}-step1`} checked={step1Done} onChange={e => setStep1Done(e.target.checked)}
              style={{ width: '22px', height: '22px', marginTop: '2px', accentColor: teal }} />
            <span style={{ fontSize: '18px', color: navy, lineHeight: 1.6 }}>I have received my itemized bill and I'm ready to compare it.</span>
          </label>
          <button style={{ ...btnPrimary, opacity: step1Done ? 1 : 0.5 }} onClick={() => step1Done && setStep(2)}>
            Continue to Step 2 →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '22px', color: navy, marginBottom: '12px' }}>Step 2: Compare to Your Explanation of Benefits (EOB)</h2>
          <div style={{ background: '#f6f8fa', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '18px', marginBottom: '20px' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: teal, margin: '0 0 8px 0' }}>Where to find your EOB:</p>
            <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '17px', color: navy, lineHeight: 1.7 }}>
              <li><strong>Original Medicare:</strong> Log in at medicare.gov or look for your Medicare Summary Notice in the mail.</li>
              <li><strong>Medicare Advantage:</strong> Log in to your plan's website or call the member services number on your card.</li>
              <li><strong>Medigap / Supplement:</strong> Compare to your Medicare Summary Notice — Medigap does not issue a separate EOB.</li>
            </ul>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle} htmlFor={`${uid}-bill`}>What your bill says you owe ($)</label>
              <input id={`${uid}-bill`} style={inputStyle} type="number" min="0" value={billAmount}
                onChange={e => setBillAmount(e.target.value)} placeholder="e.g. 3200" />
            </div>
            <div>
              <label style={labelStyle} htmlFor={`${uid}-eob`}>What your EOB shows as patient responsibility ($)</label>
              <input id={`${uid}-eob`} style={inputStyle} type="number" min="0" value={eobAmount}
                onChange={e => setEobAmount(e.target.value)} placeholder="e.g. 2310" />
            </div>
          </div>
          {hasDiscrepancy && (
            <div style={{ background: '#fff8f0', border: '2px solid #E8761A', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: amber, margin: '0 0 4px 0' }}>⚠ Discrepancy Found</p>
              <p style={{ fontSize: '17px', color: navy, margin: 0, lineHeight: 1.6 }}>
                Your bill is <strong>${(billNum - eobNum).toFixed(2)} more</strong> than your EOB patient responsibility. This difference is worth disputing before you pay.
              </p>
            </div>
          )}
          {billNum > 0 && eobNum > 0 && !hasDiscrepancy && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #1A7A4E', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '17px', color: '#1A7A4E', margin: 0, lineHeight: 1.6 }}>
                Your bill matches your EOB patient responsibility. If you still believe there is an error, continue to the dispute letter step.
              </p>
            </div>
          )}
          <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '20px' }}>
            <input type="checkbox" checked={step2Done} onChange={e => setStep2Done(e.target.checked)}
              style={{ width: '22px', height: '22px', marginTop: '2px', accentColor: teal }} />
            <span style={{ fontSize: '18px', color: navy, lineHeight: 1.6 }}>I have compared my itemized bill to my EOB and identified the disputed items.</span>
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={{ ...btnPrimary, background: '#fff', color: teal, border: `2px solid ${teal}` }} onClick={() => setStep(1)}>← Back</button>
            <button style={{ ...btnPrimary, opacity: step2Done ? 1 : 0.5 }} onClick={() => step2Done && setStep(3)}>Continue to Step 3 →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '22px', color: navy, marginBottom: '12px' }}>Step 3: Generate Your Dispute Letter</h2>
          <p style={{ fontSize: '17px', color: gray, lineHeight: 1.7, marginBottom: '20px' }}>
            Fill in the details below. Send by <strong>certified mail with return receipt</strong> and keep a copy for your records.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Your Name (Patient)</label>
              <input style={inputStyle} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label style={labelStyle}>Hospital / Facility Name</label>
              <input style={inputStyle} value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="Hospital name" />
            </div>
            <div>
              <label style={labelStyle}>Date of Service</label>
              <input style={inputStyle} type="date" value={dateOfService} onChange={e => setDateOfService(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Account / Claim Number</label>
              <input style={inputStyle} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="From your bill" />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Disputed Items (describe each charge you are disputing and why)</label>
            <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
              value={disputedItems} onChange={e => setDisputedItems(e.target.value)}
              placeholder="Example: Charge for CPT code 85025 (blood panel) appears twice on 6/12/2026, totaling $680. Only one blood panel was performed." />
          </div>
          <button style={btnPrimary} onClick={() => setShowLetter(true)}>Generate My Dispute Letter</button>
          {showLetter && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ background: '#fff', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '20px', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', color: navy, lineHeight: 1.7, overflowX: 'auto' }}>
                {letterText}
              </div>
              <button style={{ marginTop: '12px', background: '#fff', color: teal, border: `2px solid ${teal}`, borderRadius: '8px', padding: '12px 24px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => window.print()}>
                🖨 Print This Letter
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button style={{ ...btnPrimary, background: '#fff', color: teal, border: `2px solid ${teal}` }} onClick={() => setStep(2)}>← Back</button>
            <button style={btnPrimary} onClick={() => setStep(4)}>Continue to Step 4 →</button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div>
          <h2 style={{ fontSize: '22px', color: navy, marginBottom: '12px' }}>Step 4: Escalate If Not Resolved</h2>
          <p style={{ fontSize: '17px', color: gray, lineHeight: 1.7, marginBottom: '20px' }}>
            If the hospital or provider does not resolve your dispute within 30 days of your certified letter, you have additional escalation options.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#f6f8fa', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '18px' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: teal, margin: '0 0 8px 0' }}>1. State Department of Insurance (for insurance billing disputes)</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
                  style={{ ...inputStyle, maxWidth: '260px' }}>
                  <option value="">— Select your state —</option>
                  {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </div>
              {doi && (
                <div style={{ background: '#fff', border: '1.5px solid #1A7A4E', borderRadius: '6px', padding: '12px' }}>
                  <p style={{ fontSize: '17px', color: navy, margin: '0 0 6px 0', fontWeight: 700 }}>{doi.name}</p>
                  <a href={doi.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px', color: teal, textDecoration: 'underline' }}>
                    File a complaint online →
                  </a>
                </div>
              )}
            </div>
            <div style={{ background: '#f6f8fa', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '18px' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: teal, margin: '0 0 8px 0' }}>2. CMS — No Surprises Act Violations</p>
              <p style={{ fontSize: '17px', color: navy, margin: '0 0 6px 0', lineHeight: 1.6 }}>If you were billed by an out-of-network provider at an in-network facility without prior written consent:</p>
              <a href="https://www.cms.gov/nosurprises" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px', color: teal, textDecoration: 'underline', fontWeight: 700 }}>
                File at cms.gov/nosurprises →
              </a>
            </div>
            <div style={{ background: '#f6f8fa', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '18px' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: teal, margin: '0 0 8px 0' }}>3. Medicare Beneficiaries</p>
              <p style={{ fontSize: '17px', color: navy, margin: '0 0 6px 0', lineHeight: 1.6 }}>Call <strong>1-800-MEDICARE (1-800-633-4227)</strong> or file an appeal through your Medicare plan.</p>
            </div>
            <div style={{ background: '#f6f8fa', border: '1.5px solid #DDE3EA', borderRadius: '8px', padding: '18px' }}>
              <p style={{ fontSize: '16px', fontWeight: 700, color: teal, margin: '0 0 8px 0' }}>4. CFPB Consumer Complaint</p>
              <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px', color: teal, textDecoration: 'underline', fontWeight: 700 }}>
                File at consumerfinance.gov/complaint →
              </a>
            </div>
          </div>
          <div style={{ background: teal, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: gold, margin: '0 0 8px 0', textTransform: 'uppercase' }}>Free Help Available</p>
            <p style={{ fontSize: '17px', color: '#fff', margin: 0, lineHeight: 1.6 }}>
              SHIP (State Health Insurance Assistance Program) counselors can help Medicare patients navigate billing disputes at <strong>no cost</strong>. Find yours at <a href="https://www.shiphelp.org" target="_blank" rel="noopener noreferrer" style={{ color: gold }}>shiphelp.org</a> or call <strong>1-877-839-2675</strong>.
            </p>
          </div>
          <button style={{ ...btnPrimary, background: '#fff', color: teal, border: `2px solid ${teal}` }} onClick={() => setStep(3)}>← Back to Letter</button>
        </div>
      )}
    </div>
  );
};
