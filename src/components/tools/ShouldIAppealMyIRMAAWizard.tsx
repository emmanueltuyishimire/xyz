import React, { useState, useId } from 'react';

/**
 * ShouldIAppealMyIRMAAWizard.tsx
 * Tool: Should I Appeal My IRMAA? Wizard
 * Primary keyword: should i appeal my irmaa
 */

export type LifeEvent =
  | 'marriage'
  | 'divorce'
  | 'death_of_spouse'
  | 'work_stoppage'
  | 'work_reduction'
  | 'income_property_loss'
  | 'pension_loss'
  | 'none';

interface AppealResult {
  isEligible: boolean;
  eventCategory: string;
  verdictTitle: string;
  rationale: string;
  checklist: string[];
}

export const ShouldIAppealMyIRMAAWizard: React.FC = () => {
  const uid = useId();

  const [lifeEvent, setLifeEvent] = useState<LifeEvent>('work_stoppage');
  const [eventYear, setEventYear] = useState<number>(2025);
  const [incomeDropped, setIncomeDropped] = useState<boolean>(true);
  const [receivedNotice, setReceivedNotice] = useState<boolean>(true);

  const [result, setResult] = useState<AppealResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const isEligible = lifeEvent !== 'none' && incomeDropped;

    let eventCategory = '';
    switch (lifeEvent) {
      case 'work_stoppage': eventCategory = 'Work Stoppage (Retirement)'; break;
      case 'work_reduction': eventCategory = 'Work Reduction (Part-Time / Reduced Hours)'; break;
      case 'death_of_spouse': eventCategory = 'Death of Spouse'; break;
      case 'divorce': eventCategory = 'Divorce or Annulment'; break;
      case 'marriage': eventCategory = 'Marriage'; break;
      case 'income_property_loss': eventCategory = 'Loss of Income-Producing Property'; break;
      case 'pension_loss': eventCategory = 'Loss or Reduction of Pension Income'; break;
      default: eventCategory = 'No Qualifying Life-Changing Event'; break;
    }

    let verdictTitle = '';
    let rationale = '';

    if (isEligible) {
      verdictTitle = '🎉 You Likely Qualify to Appeal Your IRMAA Surcharge!';
      rationale = `Because you experienced a qualifying Life-Changing Event (${eventCategory}) in ${eventYear} that caused your income to drop, Social Security allows you to file Form SSA-44 to request an instant recalculation of your Medicare premiums using your lower current income instead of your 2-year-old tax return.`;
    } else {
      verdictTitle = '⚠️ You May Not Qualify Under Standard SSA-44 Event Rules';
      rationale = 'Social Security only approves IRMAA appeals for specific, documented Life-Changing Events. One-time income spikes (such as selling a home, taking an annual IRA distribution, or capital gains) are not qualifying events unless accompanied by retirement, divorce, or spousal death.';
    }

    const checklist = isEligible
      ? [
          'Step 1: Download IRS Form SSA-44 free at ssa.gov/forms/ssa-44.pdf.',
          `Step 2: Check Box 1 for "${eventCategory}" on page 1 of Form SSA-44.`,
          'Step 3: Provide your updated estimate of your current year Adjusted Gross Income and tax-exempt interest (Line 2a).',
          'Step 4: Attach written proof of the event (e.g., retirement letter from employer, Form W-2/1099, death certificate, or divorce decree).',
          'Step 5: Mail or deliver Form SSA-44 to your local Social Security office (or request a appointment at 1-800-772-1213).',
          'Note: If approved, Social Security will refund any overpaid IRMAA premiums back to the effective date of your appeal.',
        ]
      : [
          'If your income spike was a one-time event (e.g., selling a home or Roth conversion), your IRMAA surcharge will automatically drop off next year when your tax return reflects lower income.',
          'If you believe the IRS sent incorrect tax data to Social Security, file Form SSA-44 under Step 2 "Amended Tax Return" with a copy of your filed Form 1040X.',
          'If facing extreme financial hardship, contact the Social Security Administration at 1-800-772-1213 to inquire about administrative review options.',
        ];

    setResult({
      isEligible,
      eventCategory,
      verdictTitle,
      rationale,
      checklist,
    });
  };

  return (
    <div
      className="appeal-wizard-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Should I Appeal My IRMAA? Eligibility Wizard
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Answer 4 quick questions to see if your situation qualifies for an SSA Form SSA-44 appeal.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-event`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Have You Experienced Any of These Life-Changing Events?
          </label>
          <select
            id={`${uid}-event`}
            value={lifeEvent}
            onChange={(e) => setLifeEvent(e.target.value as LifeEvent)}
            style={{ width: '100%', maxWidth: '440px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="work_stoppage">Work Stoppage (Full Retirement / Job Loss)</option>
            <option value="work_reduction">Work Reduction (Transitioned to Part-Time)</option>
            <option value="death_of_spouse">Death of Spouse</option>
            <option value="divorce">Divorce or Annulment</option>
            <option value="marriage">Marriage</option>
            <option value="income_property_loss">Loss of Income-Producing Property (Disaster/Arson)</option>
            <option value="pension_loss">Loss or Reduction of Pension Income</option>
            <option value="none">None of the above (One-time income spike: home sale, stock sale, etc.)</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-year`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Year the Life-Changing Event Occurred
          </label>
          <select
            id={`${uid}-year`}
            value={eventYear}
            onChange={(e) => setEventYear(parseInt(e.target.value))}
            style={{ width: '100%', maxWidth: '240px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id={`${uid}-dropped`}
              type="checkbox"
              checked={incomeDropped}
              onChange={(e) => setIncomeDropped(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-dropped`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              My current income is significantly lower than the tax return Social Security is using
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id={`${uid}-notice`}
              type="checkbox"
              checked={receivedNotice}
              onChange={(e) => setReceivedNotice(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-notice`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              I received an Initial IRMAA Determination Notice from Social Security
            </label>
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
          Check My Appeal Eligibility →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Verdict Card */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background: result.isEligible ? '#f0fdf4' : '#fffaf0',
              border: result.isEligible ? '2px solid #38a169' : '2px solid #dd6b20',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                color: result.isEligible ? '#276749' : '#c05621',
              }}
            >
              Appeal Eligibility Result
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0D2137', margin: '0.25rem 0' }}>
              {result.verdictTitle}
            </div>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: '0.5rem 0 0 0', lineHeight: 1.6 }}>
              {result.rationale}
            </p>
          </div>

          {/* Action Steps */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Next Steps for Your Appeal
            </h3>
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
