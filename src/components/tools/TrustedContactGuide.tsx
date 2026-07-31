import React, { useState, useId } from 'react';

type TabType = 'brokerage' | 'bank' | 'ssa' | 'medicare' | 'medicaid';

export function TrustedContactGuide() {
  const [activeTab, setActiveTab] = useState<TabType>('brokerage');
  
  // State for recording names and dates for print out
  const [records, setRecords] = useState({
    brokerageName: '', brokerageDate: '',
    bankName: '', bankDate: '',
    ssaName: '', ssaDate: '',
    medicareName: '', medicareDate: '',
    medicaidName: '', medicaidDate: ''
  });

  const handleRecordChange = (field: string, value: string) => {
    setRecords(prev => ({ ...prev, [field]: value }));
  };

  const nameId = useId();
  const dateId = useId();

  const handlePrint = () => {
    window.print();
  };

  const tabs: { id: TabType, label: string }[] = [
    { id: 'brokerage', label: 'Brokerage / Investment' },
    { id: 'bank', label: 'Bank Account' },
    { id: 'ssa', label: 'Social Security' },
    { id: 'medicare', label: 'Medicare' },
    { id: 'medicaid', label: 'Medicaid (State)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'inherit' }}>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '2px solid #DDE3EA', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '1.125rem',
              fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? '#0A3D3A' : '#4B5A6E',
              background: activeTab === tab.id ? '#F6F8FA' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #0A3D3A' : '3px solid transparent',
              cursor: 'pointer',
              minHeight: '44px',
              borderRadius: '0.5rem 0.5rem 0 0',
              marginBottom: '-0.6rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: '#F6F8FA', border: '1.5px solid #DDE3EA', borderRadius: '0.75rem', padding: '1.5rem' }}>
        
        {activeTab === 'brokerage' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#0A3D3A', margin: '0 0 1rem 0' }}>Brokerage & Investment Accounts</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
              FINRA Rule 4512 requires all FINRA-member brokerage firms to ask you for a trusted contact designation.
            </p>
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#1A7A4E', fontWeight: 'bold' }}>✓ Can do:</span> <span style={{ fontSize: '1.125rem' }}>Firm can contact them if concerned about unusual activity, potential financial exploitation, or health concerns.</span></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#E8761A', fontWeight: 'bold' }}>✗ Cannot do:</span> <span style={{ fontSize: '1.125rem' }}>Withdraw money, make trades, or access your detailed account information.</span></div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#0D2137' }}>How to set up:</h4>
              <p style={{ fontSize: '1.125rem', margin: 0, lineHeight: 1.6 }}>Call your brokerage's main customer service line or log in online and look for "Trusted Contact" or "Account Security" settings.</p>
              <ul style={{ margin: '0.75rem 0 0 1.5rem', fontSize: '1.125rem', lineHeight: 1.6 }}>
                <li>Fidelity: 1-800-343-3548</li>
                <li>Schwab: 1-800-435-4000</li>
                <li>Vanguard: 1-800-662-7447</li>
                <li>TIAA: 1-800-842-2252</li>
              </ul>
            </div>
            <a href="https://www.finra.org/investors/have-a-plan/trusted-contact-person" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', fontSize: '1.125rem', textDecoration: 'underline', display: 'block', marginBottom: '1.5rem' }}>
              Read FINRA Official Guidance
            </a>
          </div>
        )}

        {activeTab === 'bank' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#0A3D3A', margin: '0 0 1rem 0' }}>Bank Accounts</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
              Not all banks have a formal "trusted contact" program matching FINRA's model, but most offer alternative protective measures.
            </p>
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#1A7A4E', fontWeight: 'bold' }}>✓ Options:</span> <span style={{ fontSize: '1.125rem' }}>Ask your bank about a "convenience signer", "account monitor", or trusted contact programs.</span></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#E8761A', fontWeight: 'bold' }}>✗ Note:</span> <span style={{ fontSize: '1.125rem' }}>A POD (Payable on Death) beneficiary is different — it only affects what happens after death, not protection during your lifetime.</span></div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#0D2137' }}>How to set up:</h4>
              <p style={{ fontSize: '1.125rem', margin: 0, lineHeight: 1.6 }}>The CFPB recommends checking with your specific bank's branch manager to find out what programs they offer for elder financial protection.</p>
            </div>
            <a href="https://www.consumerfinance.gov/consumer-tools/protecting-older-consumers" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', fontSize: '1.125rem', textDecoration: 'underline', display: 'block', marginBottom: '1.5rem' }}>
              Read CFPB Official Guidance
            </a>
          </div>
        )}

        {activeTab === 'ssa' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#0A3D3A', margin: '0 0 1rem 0' }}>Social Security (SSA)</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
              You can designate an SSA Appointed Representative to help with your benefits.
            </p>
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#1A7A4E', fontWeight: 'bold' }}>✓ Can do:</span> <span style={{ fontSize: '1.125rem' }}>Help with applications, appeals, hearings, and general benefit-related matters.</span></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#E8761A', fontWeight: 'bold' }}>✗ Cannot do:</span> <span style={{ fontSize: '1.125rem' }}>Automatically control your check deposits (that requires a Representative Payee designation).</span></div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#0D2137' }}>How to set up:</h4>
              <p style={{ fontSize: '1.125rem', margin: 0, lineHeight: 1.6 }}>Complete Form SSA-1696 (Appointment of Representative) online at ssa.gov or at any local SSA field office.</p>
            </div>
            <a href="https://www.ssa.gov/representation" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', fontSize: '1.125rem', textDecoration: 'underline', display: 'block', marginBottom: '1.5rem' }}>
              Get Form SSA-1696 at SSA.gov
            </a>
          </div>
        )}

        {activeTab === 'medicare' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#0A3D3A', margin: '0 0 1rem 0' }}>Medicare</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
              You can designate an Authorized Representative to speak with Medicare on your behalf.
            </p>
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}><span style={{ color: '#1A7A4E', fontWeight: 'bold' }}>✓ Can do:</span> <span style={{ fontSize: '1.125rem' }}>Call 1-800-MEDICARE on your behalf, help dispute claims, and assist with enrollments.</span></div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#0D2137' }}>How to set up:</h4>
              <p style={{ fontSize: '1.125rem', margin: 0, lineHeight: 1.6 }}>Call 1-800-MEDICARE (1-800-633-4227) and request an Authorized Representative designation form.</p>
              <p style={{ fontSize: '1.125rem', margin: '0.5rem 0 0 0', lineHeight: 1.6 }}>You can also get free help doing this from a <a href="https://www.shiphelp.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>SHIP counselor</a>.</p>
            </div>
          </div>
        )}

        {activeTab === 'medicaid' && (
          <div>
            <h3 style={{ fontSize: '1.5rem', color: '#0A3D3A', margin: '0 0 1rem 0' }}>Medicaid (State)</h3>
            <p style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1rem' }}>
              Because Medicaid is administered by individual states, the Authorized Representative forms vary by state.
            </p>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#0D2137' }}>How to set up:</h4>
              <p style={{ fontSize: '1.125rem', margin: 0, lineHeight: 1.6 }}>Visit your state's Medicaid agency website or call their main hotline to request their specific Authorized Representative form.</p>
            </div>
          </div>
        )}

        {/* Input fields for saving records (visible on all tabs, specific to active tab) */}
        <div style={{ borderTop: '2px solid #DDE3EA', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={`${nameId}-${activeTab}`} style={{ fontSize: '0.875rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '600' }}>
              Who I named for {tabs.find(t => t.id === activeTab)?.label}:
            </label>
            <input
              id={`${nameId}-${activeTab}`}
              type="text"
              value={records[`${activeTab}Name` as keyof typeof records]}
              onChange={(e) => handleRecordChange(`${activeTab}Name`, e.target.value)}
              style={{ padding: '0.75rem', fontSize: '1.125rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '44px' }}
              placeholder="Name of contact"
            />
          </div>
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={`${dateId}-${activeTab}`} style={{ fontSize: '0.875rem', color: '#4B5A6E', marginBottom: '0.5rem', fontWeight: '600' }}>
              Date I set this up:
            </label>
            <input
              id={`${dateId}-${activeTab}`}
              type="date"
              value={records[`${activeTab}Date` as keyof typeof records]}
              onChange={(e) => handleRecordChange(`${activeTab}Date`, e.target.value)}
              style={{ padding: '0.75rem', fontSize: '1.125rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', minHeight: '44px' }}
            />
          </div>
        </div>

      </div>

      <button
        onClick={handlePrint}
        style={{
          marginTop: '1rem',
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
          justifyContent: 'center',
          alignSelf: 'flex-start'
        }}
      >
        Print Completed Checklist
      </button>

    </div>
  );
}
