import React, { useState, useId } from 'react';

const methods = [
  { id: 'giftcard', label: 'Gift cards (iTunes, Google Play, Amazon, Walmart, Target, etc.)' },
  { id: 'wire', label: 'Wire transfer (Western Union, MoneyGram, bank wire)' },
  { id: 'crypto', label: 'Cryptocurrency (Bitcoin, Ethereum, any digital currency)' },
  { id: 'cash', label: 'Cash sent by mail or overnight delivery' },
  { id: 'prepaid', label: 'Prepaid debit card (Vanilla, Green Dot, etc.)' },
  { id: 'none', label: 'None of the above' }
];

export const GiftCardScamChecklist = () => {
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [sentStatus, setSentStatus] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  
  const idPrefix = useId();

  const handleMethodChange = (id: string) => {
    if (id === 'none') {
      setSelectedMethods(['none']);
      setSentStatus(null);
      return;
    }
    
    let newMethods = [...selectedMethods];
    if (newMethods.includes('none')) {
      newMethods = newMethods.filter(m => m !== 'none');
    }
    
    if (newMethods.includes(id)) {
      newMethods = newMethods.filter(m => m !== id);
    } else {
      newMethods.push(id);
    }
    
    setSelectedMethods(newMethods);
    if (newMethods.length === 0) setSentStatus(null);
  };

  const handleReset = () => {
    setSelectedMethods([]);
    setSentStatus(null);
    setSelectedState('');
  };

  const hasMethod = (id: string) => selectedMethods.includes(id);

  return (
    <div style={{ background: '#fff', border: '1px solid #DDE3EA', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#0D2137', marginBottom: '1.5rem', fontWeight: 800 }}>Payment Method Checklist</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.125rem', color: '#0D2137', fontWeight: 700, marginBottom: '1rem' }}>
          Question 1: Were you asked to pay using any of these methods? (Select all that apply)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {methods.map(method => (
            <label key={method.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '1.125rem', color: '#4B5A6E', minHeight: '44px' }}>
              <input 
                type="checkbox" 
                checked={selectedMethods.includes(method.id)}
                onChange={() => handleMethodChange(method.id)}
                style={{ width: '1.5rem', height: '1.5rem', marginTop: '0.125rem', accentColor: '#0A3D3A', cursor: 'pointer' }}
              />
              <span style={{ lineHeight: 1.4 }}>{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedMethods.includes('none') && (
        <div style={{ background: '#F6F8FA', borderLeft: '4px solid #1A7A4E', padding: '1.25rem', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '1.125rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
            <strong>Good news:</strong> The payment method requested does not match the pattern most commonly used by scammers. That said, if anything else about the request seemed unusual, use our <a href="/tools/scam-message-call-decoder/" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>Scam Message Decoder</a> for a full check.
          </p>
        </div>
      )}

      {selectedMethods.length > 0 && !selectedMethods.includes('none') && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.125rem', color: '#0D2137', fontWeight: 700, marginBottom: '1rem' }}>
            Question 2: Have you already sent the payment, or are you deciding whether to send it now?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '1.125rem', color: '#4B5A6E', minHeight: '44px' }}>
              <input 
                type="radio" 
                name="sentStatus"
                checked={sentStatus === 'notsent'}
                onChange={() => setSentStatus('notsent')}
                style={{ width: '1.5rem', height: '1.5rem', accentColor: '#0A3D3A', cursor: 'pointer' }}
              />
              <span>I have NOT sent it yet</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '1.125rem', color: '#4B5A6E', minHeight: '44px' }}>
              <input 
                type="radio" 
                name="sentStatus"
                checked={sentStatus === 'sent'}
                onChange={() => setSentStatus('sent')}
                style={{ width: '1.5rem', height: '1.5rem', accentColor: '#0A3D3A', cursor: 'pointer' }}
              />
              <span>I already sent it</span>
            </label>
          </div>
        </div>
      )}

      {sentStatus === 'notsent' && (
        <div style={{ background: '#fff8f0', border: '2px solid #E8761A', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#E8761A', fontWeight: 800, margin: '0 0 1rem 0' }}>Stop. Do not send this payment.</h3>
          <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
            <strong>No legitimate agency or business accepts gift cards, wire transfers, or crypto as payment.</strong> This includes the IRS, courts, police, and banks.
          </p>
          <ul style={{ paddingLeft: '1.5rem', fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            <li>Do not buy the cards or initiate the wire.</li>
            <li>Hang up the phone or stop responding to messages immediately.</li>
            <li>Report the request to <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>reportfraud.ftc.gov</a>.</li>
            <li>Tell a trusted family member what happened.</li>
          </ul>
        </div>
      )}

      {sentStatus === 'sent' && (
        <div style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#E8761A', fontWeight: 800, margin: '0 0 1.5rem 0' }}>Action Required Now</h3>
          
          {hasMethod('giftcard') && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0A3D3A', margin: '0 0 0.75rem 0' }}>For Gift Cards:</h4>
              <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '0.75rem' }}>Contact the issuing retailer immediately. Recovery is rare, but possible if you act right now.</p>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
                <li><strong>Amazon:</strong> 1-888-280-4331</li>
                <li><strong>Google Play:</strong> 1-855-466-4438</li>
                <li><strong>Apple/iTunes:</strong> 1-800-275-2273</li>
                <li><strong>Walmart:</strong> 1-888-537-5503</li>
                <li><strong>Target:</strong> 1-800-440-0680</li>
                <li><strong>eBay:</strong> 1-866-961-9253</li>
              </ul>
            </div>
          )}

          {hasMethod('wire') && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0A3D3A', margin: '0 0 0.75rem 0' }}>For Wire Transfers:</h4>
              <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '0.75rem' }}>Wire transfers are very difficult to reverse once completed. Act immediately.</p>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
                <li>Contact your bank immediately and ask to recall or reverse the wire.</li>
                <li>File a complaint with FinCEN at <a href="https://fincen.gov/contact" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>fincen.gov/contact</a></li>
                <li>Report to the FBI at <a href="https://ic3.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>ic3.gov</a></li>
              </ul>
            </div>
          )}

          {hasMethod('crypto') && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0A3D3A', margin: '0 0 0.75rem 0' }}>For Cryptocurrency:</h4>
              <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '0.75rem' }}>Crypto transactions are typically irreversible.</p>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
                <li>Report the fraud to the exchange or wallet platform used.</li>
                <li>Report to the FBI at <a href="https://ic3.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>ic3.gov</a></li>
              </ul>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #DDE3EA' }}>
            <h4 style={{ fontSize: '1.25rem', color: '#0A3D3A', margin: '0 0 0.75rem 0' }}>Additional Contacts</h4>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, margin: '0 0 0.5rem 0' }}>
              <strong>DOJ Elder Fraud Hotline:</strong> 1-833-FRAUD-11
            </p>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, margin: 0 }}>
              <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#0A3D3A', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 700, marginTop: '1rem' }}>Report to the FTC</a>
            </p>
          </div>
        </div>
      )}

      {selectedMethods.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={handleReset}
            style={{ background: 'transparent', border: 'none', color: '#0A3D3A', textDecoration: 'underline', fontSize: '1rem', cursor: 'pointer', padding: 0 }}
          >
            Reset Checklist
          </button>
        </div>
      )}
    </div>
  );
};
