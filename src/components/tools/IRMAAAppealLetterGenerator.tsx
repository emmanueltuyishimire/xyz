import React, { useState, useId } from 'react';

/**
 * IRMAAAppealLetterGenerator.tsx
 * Tool: IRMAA Appeal Letter Generator
 * Primary keyword: irmaa appeal letter generator
 */

export type EventType =
  | 'retirement'
  | 'work_reduction'
  | 'death_of_spouse'
  | 'divorce'
  | 'marriage';

interface LetterResult {
  letterText: string;
  checklist: string[];
}

export const IRMAAAppealLetterGenerator: React.FC = () => {
  const uid = useId();

  const [fullName, setFullName] = useState<string>('John Doe');
  const [ssnLast4, setSsnLast4] = useState<string>('1234');
  const [eventType, setEventType] = useState<EventType>('retirement');
  const [eventDate, setEventDate] = useState<string>('2025-06-15');
  const [currentEstIncome, setCurrentEstIncome] = useState<string>('75000');

  const [result, setResult] = useState<LetterResult | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    let eventLabel = '';
    switch (eventType) {
      case 'retirement': eventLabel = 'Work Stoppage / Retirement'; break;
      case 'work_reduction': eventLabel = 'Work Reduction (Transition to Part-Time)'; break;
      case 'death_of_spouse': eventLabel = 'Death of Spouse'; break;
      case 'divorce': eventLabel = 'Divorce / Annulment'; break;
      case 'marriage': eventLabel = 'Marriage'; break;
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const letterText = `Date: ${todayStr}

Social Security Administration
Re: Notice of Initial IRMAA Determination Appeal
Taxpayer Name: ${fullName}
SSN (Last 4 Digits): XXX-XX-${ssnLast4}

To Whom It May Concern at the Social Security Administration,

I am writing to formally request a redetermination of my Medicare Part B and Part D Income-Related Monthly Adjustment Amount (IRMAA) for the 2026 tax year, pursuant to 20 CFR § 418.1201.

The IRMAA determination I received was based on my federal income tax return from two years prior. However, I have experienced a major Life-Changing Event that resulted in a permanent reduction in my income:

Qualifying Life-Changing Event: ${eventLabel}
Date of Life-Changing Event: ${eventDate}
Estimated Current Year Modified Adjusted Gross Income (MAGI): $${parseFloat(currentEstIncome).toLocaleString() || '0'}

Because my current income is significantly lower than the tax return data utilized in your initial determination, I request that Social Security recalculate my Medicare Part B and Part D premiums using my estimated current year income, as authorized under SSA Form SSA-44 rules.

Attached to this letter please find:
1. Completed and signed Form SSA-44
2. Official supporting evidence verifying the Life-Changing Event (e.g., Employer Retirement Confirmation / Death Certificate / Marriage License / Tax Return)

Please update your records and notify me in writing of the revised premium determination. If you have any questions, please contact me at your earliest convenience.

Sincerely,

____________________________________
${fullName}
SSN Last 4: XXX-XX-${ssnLast4}`;

    const checklist = [
      'Copy or print the generated appeal letter text above.',
      'Download and complete official SSA Form SSA-44 free at ssa.gov/forms/ssa-44.pdf.',
      'Attach official proof of your Life-Changing Event (e.g., employer retirement letter, Form W-2/1099, death certificate, or divorce decree).',
      'Mail via Certified Mail with Return Receipt Requested or deliver in person to your local Social Security field office.',
      'Keep a copy of your signed letter, Form SSA-44, and postal tracking receipt permanently.',
    ];

    setResult({
      letterText,
      checklist,
    });
  };

  return (
    <div
      className="letter-generator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          IRMAA Appeal Letter &amp; Form SSA-44 Generator
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Enter your details below to generate a custom, print-ready appeal letter to submit with SSA Form SSA-44.
        </p>
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-name`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Full Taxpayer Name <span style={{ color: '#c53030' }}>*</span>
            </label>
            <input
              id={`${uid}-name`}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-ssn`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              SSN (Last 4 Digits Only) <span style={{ color: '#c53030' }}>*</span>
            </label>
            <input
              id={`${uid}-ssn`}
              type="text"
              maxLength={4}
              value={ssnLast4}
              onChange={(e) => setSsnLast4(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1234"
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-type`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Qualifying Life-Changing Event
            </label>
            <select
              id={`${uid}-type`}
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value="retirement">Work Stoppage (Full Retirement)</option>
              <option value="work_reduction">Work Reduction (Part-Time Transition)</option>
              <option value="death_of_spouse">Death of Spouse</option>
              <option value="divorce">Divorce / Annulment</option>
              <option value="marriage">Marriage</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-date`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Date of Event
            </label>
            <input
              id={`${uid}-date`}
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-est-inc`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            Estimated Current Year MAGI Income ($)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-est-inc`}
              type="text"
              value={currentEstIncome}
              onChange={(e) => setCurrentEstIncome(e.target.value)}
              placeholder="e.g. 75000"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            background: '#0A3D3A',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.05rem',
            padding: '0.85rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            marginTop: '0.5rem',
          }}
        >
          Generate My Custom IRMAA Appeal Letter →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
            Your Generated IRMAA Cover Letter (Print or Copy)
          </h3>
          <textarea
            readOnly
            rows={14}
            value={result.letterText}
            style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.9rem', background: '#f8fafc', color: '#0D2137', lineHeight: 1.5 }}
          />

          <div style={{ background: '#f0fdf4', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #bbf7d0', marginTop: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#0A3D3A', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
              Submission Checklist
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {result.checklist.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.55 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
