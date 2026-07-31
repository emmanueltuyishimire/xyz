import React, { useState, useEffect, useId } from 'react';

type PhoneType = 'iPhone' | 'Android' | 'Landline' | 'Both' | null;

interface ChecklistItem {
  id: string;
  text: string | React.ReactNode;
}

const CHECKLISTS: Record<Exclude<PhoneType, 'Both' | null>, ChecklistItem[]> = {
  iPhone: [
    { id: 'iphone_1', text: <span>Register on <a href="https://www.donotcall.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>donotcall.gov</a></span> },
    { id: 'iphone_2', text: 'Go to Settings → Phone → Silence Unknown Callers → toggle ON' },
    { id: 'iphone_3', text: 'Go to Settings → Phone → Call Blocking & Identification (to add specific numbers)' },
    { id: 'iphone_4', text: 'Contact your carrier for free blocking apps (AT&T Call Protect, Verizon Call Filter, T-Mobile Scam Shield)' },
    { id: 'iphone_5', text: <span>File FCC complaint at <a href="https://consumercomplaints.fcc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>consumercomplaints.fcc.gov</a> if robocalls continue</span> },
  ],
  Android: [
    { id: 'android_1', text: <span>Register on <a href="https://www.donotcall.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>donotcall.gov</a></span> },
    { id: 'android_2', text: 'Open Phone app → tap three-dot menu → Settings → Blocked Numbers → turn on "Block calls from unidentified callers"' },
    { id: 'android_3', text: 'For Google Pixel: Settings → Phone → Spam and call screening → enable' },
    { id: 'android_4', text: 'Contact your carrier for free blocking apps' },
    { id: 'android_5', text: <span>File FCC complaint at <a href="https://consumercomplaints.fcc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>consumercomplaints.fcc.gov</a></span> },
  ],
  Landline: [
    { id: 'landline_1', text: <span>Register on <a href="https://www.donotcall.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>donotcall.gov</a> (free, covers landlines)</span> },
    { id: 'landline_2', text: 'Contact your phone company about free robocall blocking features' },
    { id: 'landline_3', text: 'Consider a call-screening device like CPR Call Blocker' },
    { id: 'landline_4', text: <span>File FCC complaint at <a href="https://consumercomplaints.fcc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>consumercomplaints.fcc.gov</a></span> },
    { id: 'landline_5', text: 'Contact your state public utility commission for additional protections' },
  ],
};

export const RobocallGuide: React.FC = () => {
  const [phoneType, setPhoneType] = useState<PhoneType>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);
  const formId = useId();

  // Handle client-side hydration for localStorage
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('robocallGuideProgress');
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse checklist progress', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('robocallGuideProgress', JSON.stringify(checkedItems));
    }
  }, [checkedItems, isClient]);

  const handlePhoneTypeSelect = (type: PhoneType) => {
    setPhoneType(type);
  };

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getActiveChecklist = (): ChecklistItem[] => {
    if (phoneType === 'Both') {
      return [...CHECKLISTS.iPhone, ...CHECKLISTS.Android];
    }
    return phoneType ? CHECKLISTS[phoneType] : [];
  };

  const activeChecklist = getActiveChecklist();
  const completedCount = activeChecklist.filter(item => checkedItems[item.id]).length;
  const totalCount = activeChecklist.length;

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr', '@media (min-width: 768px)': { gridTemplateColumns: '2fr 1fr' } }}>
      
      {/* Main Content Area */}
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #DDE3EA' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0D2137', margin: '0 0 1.5rem 0' }}>Action Checklist</h2>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#4B5A6E', marginBottom: '1rem' }}>
            What kind of phone are you using?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {(['iPhone', 'Android', 'Landline', 'Both'] as PhoneType[]).map((type) => (
              <button
                key={type}
                onClick={() => handlePhoneTypeSelect(type)}
                style={{
                  padding: '0.875rem 1.5rem',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  backgroundColor: phoneType === type ? '#0A3D3A' : '#F6F8FA',
                  color: phoneType === type ? '#ffffff' : '#0D2137',
                  border: `2px solid ${phoneType === type ? '#0A3D3A' : '#cbd5e1'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  minHeight: '44px',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {type === 'Both' ? 'I have both / Not sure' : type}
              </button>
            ))}
          </div>
        </div>

        {phoneType && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#0D2137', margin: 0 }}>Your Protection Steps</h3>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0A3D3A', backgroundColor: '#F6F8FA', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                {completedCount} of {totalCount} completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeChecklist.map((item, index) => (
                <label 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '1rem', 
                    padding: '1.25rem', 
                    backgroundColor: checkedItems[item.id] ? '#F6F8FA' : '#ffffff',
                    border: '1px solid',
                    borderColor: checkedItems[item.id] ? '#1A7A4E' : '#DDE3EA',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item.id]}
                    onChange={() => toggleCheck(item.id)}
                    style={{ width: '24px', height: '24px', accentColor: '#1A7A4E', marginTop: '0.125rem', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4B5A6E', display: 'block', marginBottom: '0.25rem' }}>
                      STEP {index + 1}
                    </span>
                    <span style={{ fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.5, display: 'block', textDecoration: checkedItems[item.id] ? 'line-through' : 'none', opacity: checkedItems[item.id] ? 0.7 : 1 }}>
                      {item.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            
            {completedCount === totalCount && totalCount > 0 && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#e6f4ea', border: '2px solid #1A7A4E', borderRadius: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A7A4E', margin: '0 0 0.5rem 0' }}>Great Job!</p>
                <p style={{ fontSize: '1rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>You have completed all standard steps to reduce unwanted calls on your phone.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: '#F6F8FA', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #DDE3EA' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#0D2137', margin: '0 0 1rem 0' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li>
              <a href="https://www.donotcall.gov" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A3D3A', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
                <span>Do Not Call Registry</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li>
              <a href="https://consumercomplaints.fcc.gov" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A3D3A', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
                <span>File FCC Complaint</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li>
              <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A3D3A', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
                <span>Report to FTC</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li>
              <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A3D3A', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
                <span>FBI IC3 (If you lost money)</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </div>

        <div style={{ background: '#fff8f0', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E8761A' }}>
          <h3 style={{ fontSize: '1.125rem', color: '#E8761A', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span aria-hidden="true">⚠️</span> What is Caller ID Spoofing?
          </h3>
          <p style={{ fontSize: '1rem', color: '#0D2137', margin: '0 0 1rem 0', lineHeight: 1.6 }}>
            The number that appears on your screen can be anything the caller programs it to show. Even if it looks like your bank, your doctor, or the IRS, it may not be them.
          </p>
          <h4 style={{ fontSize: '1rem', color: '#0D2137', margin: '0 0 0.5rem 0' }}>3 Rules to Remember:</h4>
          <ol style={{ fontSize: '0.95rem', color: '#4B5A6E', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Don't press 1 to opt out — it confirms your number is active.</li>
            <li>Don't call back unknown numbers.</li>
            <li>If it's important, they'll leave a message or send a letter.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
