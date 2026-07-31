import React, { useState } from 'react';

export const SmartphoneSetupGuide: React.FC = () => {
  const [platform, setPlatform] = useState<'facetime' | 'zoom' | 'whatsapp'>('facetime');

  const teal = '#0A3D3A';
  const navy = '#0D2137';
  const gray = '#4B5A6E';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          ['facetime', '📱 FaceTime (iPhone/iPad)'],
          ['zoom', '💻 Zoom (All Devices)'],
          ['whatsapp', '💬 WhatsApp Video'],
        ].map(([val, label]) => (
          <button key={val} type="button" onClick={() => setPlatform(val as any)}
            style={{
              padding: '16px 14px', borderRadius: '8px', border: `2px solid ${platform === val ? teal : '#DDE3EA'}`,
              background: platform === val ? '#e8f5f3' : '#fff', color: platform === val ? teal : navy,
              fontWeight: 700, fontSize: '17px', cursor: 'pointer', textAlign: 'center', minHeight: '60px',
            }}>
            {label}
          </button>
        ))}
      </div>

      {platform === 'facetime' && (
        <div style={{ background: '#fff', border: `2px solid ${teal}`, borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '22px', color: teal, margin: '0 0 16px 0', fontWeight: 800 }}>FaceTime Guide (iPhone & iPad)</h3>
          <ol style={{ margin: 0, paddingLeft: '24px', fontSize: '18px', color: navy, lineHeight: 1.8 }}>
            <li>Find the <strong>FaceTime app</strong> icon (green background with a white video camera).</li>
            <li>Tap the FaceTime app to open it.</li>
            <li>Tap the green <strong>New FaceTime</strong> button near the top right.</li>
            <li>Type the contact name or phone number of your family member.</li>
            <li>Tap their name when it appears, then tap the green <strong>FaceTime</strong> button.</li>
            <li>Hold your phone in front of your face and wait for them to answer.</li>
            <li>To end the call, tap the red <strong>End</strong> button at the bottom of the screen.</li>
          </ol>
        </div>
      )}

      {platform === 'zoom' && (
        <div style={{ background: '#fff', border: `2px solid ${teal}`, borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '22px', color: teal, margin: '0 0 16px 0', fontWeight: 800 }}>Zoom Guide (Joining a Call)</h3>
          <ol style={{ margin: 0, paddingLeft: '24px', fontSize: '18px', color: navy, lineHeight: 1.8 }}>
            <li>Ask your family member or doctor to send you a Zoom link via email or text message.</li>
            <li>Open the text or email and tap the blue link (it starts with <code>https://zoom.us/j/...</code>).</li>
            <li>Your browser or Zoom app will open automatically. Type your first name if prompted.</li>
            <li>Tap the blue button that says <strong>Join with Video</strong>.</li>
            <li>Tap <strong>Wifi or Cellular Data</strong> when asked how to connect audio so you can hear.</li>
            <li>To leave when finished, tap the screen once and press the red <strong>Leave</strong> button at the top right.</li>
          </ol>
        </div>
      )}

      {platform === 'whatsapp' && (
        <div style={{ background: '#fff', border: `2px solid ${teal}`, borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '22px', color: teal, margin: '0 0 16px 0', fontWeight: 800 }}>WhatsApp Video Guide</h3>
          <ol style={{ margin: 0, paddingLeft: '24px', fontSize: '18px', color: navy, lineHeight: 1.8 }}>
            <li>Open WhatsApp (green speech bubble icon with a white phone).</li>
            <li>Tap the <strong>Chats</strong> tab and select your contact's name.</li>
            <li>Look at the top right corner of the screen for the <strong>video camera icon</strong>.</li>
            <li>Tap the video camera icon to start the call immediately.</li>
            <li>To end the video call, tap the red phone icon at the bottom of the screen.</li>
          </ol>
        </div>
      )}
    </div>
  );
};
