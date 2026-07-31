import React, { useState, useId } from 'react';

/**
 * MedicareEffectiveDateCalculator.tsx
 * Tool: Medicare Effective Date Calculator
 * Primary keyword: medicare effective date calculator
 */

export type EnrollmentTiming = 'iep_early' | 'iep_month' | 'iep_late' | 'gep' | 'sep';

interface DateResult {
  partAStartStr: string;
  partBStartStr: string;
  iepWindowStr: string;
  explanation: string;
  checklist: string[];
}

export const MedicareEffectiveDateCalculator: React.FC = () => {
  const uid = useId();

  const [birthMonth, setBirthMonth] = useState<number>(6); // June
  const [birthYear, setBirthYear] = useState<number>(1961); // Turn 65 in 2026
  const [enrollmentTiming, setEnrollmentTiming] = useState<EnrollmentTiming>('iep_early');
  const [bornOnFirst, setBornOnFirst] = useState<boolean>(false);

  const [result, setResult] = useState<DateResult | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const turn65Year = birthYear + 65;
    let targetMonth = birthMonth - 1; // 0-indexed

    // If born on 1st of month, IEP shifts to previous month!
    if (bornOnFirst) {
      targetMonth -= 1;
    }

    let effectiveYear = turn65Year;
    let effectiveMonth = targetMonth;

    if (effectiveMonth < 0) {
      effectiveMonth += 12;
      effectiveYear -= 1;
    }

    // IEP 7-month window: 3 months before, birth month, 3 months after
    const iepStartMonth = (effectiveMonth - 3 + 12) % 12;
    const iepStartYear = effectiveMonth < 3 ? effectiveYear - 1 : effectiveYear;
    const iepEndMonth = (effectiveMonth + 3) % 12;
    const iepEndYear = effectiveMonth > 8 ? effectiveYear + 1 : effectiveYear;

    const iepWindowStr = `${monthNames[iepStartMonth]} 1, ${iepStartYear} – ${monthNames[iepEndMonth]} ${new Date(iepEndYear, iepEndMonth + 1, 0).getDate()}, ${iepEndYear}`;

    let partBStartMonth = effectiveMonth;
    let partBStartYear = effectiveYear;

    let explanation = '';

    if (enrollmentTiming === 'iep_early' || enrollmentTiming === 'iep_month') {
      // Under Consolidated Appropriations Act 2023 / 2026 rules:
      // Enrolling 3 months before, in birth month, or 1-3 months after IEP all result in Part B starting 1st of the month following enrollment!
      // If enrolled in 3 months prior or birth month: Coverage starts 1st day of birth month.
      partBStartMonth = effectiveMonth;
      partBStartYear = effectiveYear;
      explanation = `Because you enroll during your Initial Enrollment Period (IEP), your Medicare Part A & B coverage begins on the 1st day of the month you turn 65 (${monthNames[partBStartMonth]} 1, ${partBStartYear}).`;
    } else if (enrollmentTiming === 'iep_late') {
      partBStartMonth = (effectiveMonth + 1) % 12;
      partBStartYear = effectiveMonth === 11 ? effectiveYear + 1 : effectiveYear;
      explanation = `Under current Medicare rules, enrolling in the 3 months after your 65th birth month means your Part B coverage starts on the 1st of the month following enrollment (${monthNames[partBStartMonth]} 1, ${partBStartYear}).`;
    } else if (enrollmentTiming === 'gep') {
      // General Enrollment Period (Jan 1 - Mar 31): Coverage starts the 1st of the month following enrollment (e.g. Feb 1, Mar 1, or Apr 1).
      partBStartMonth = 3; // April 1
      partBStartYear = 2026;
      explanation = 'Enrolling during the General Enrollment Period (Jan 1 – Mar 31) means your Part B coverage takes effect on the 1st day of the month following enrollment (no longer forced to wait until July 1!).';
    } else {
      // SEP (Special Enrollment Period - retiring after 65)
      partBStartMonth = 6; // July 1
      partBStartYear = 2026;
      explanation = 'Enrolling during a Special Enrollment Period (after leaving active group employer coverage) allows you to choose your Part B start date (typically the 1st of the month after employment ends) with zero late enrollment penalties.';
    }

    const partAStartStr = `${monthNames[effectiveMonth]} 1, ${effectiveYear}`;
    const partBStartStr = `${monthNames[partBStartMonth]} 1, ${partBStartYear}`;

    const checklist = [
      `Your 65th Birthday Month: ${monthNames[birthMonth - 1]} ${turn65Year}.`,
      bornOnFirst ? '⚠️ Born on the 1st: Your Medicare 65th birthday is treated as occurring in the prior month!' : 'Standard Birthday Rule Applies.',
      `7-Month Initial Enrollment Period (IEP): ${iepWindowStr}.`,
      `Medicare Part A Start Date: ${partAStartStr} (Retroactive up to 6 months if applying after 65).`,
      `Medicare Part B Start Date: ${partBStartStr}.`,
      'Card Delivery: Your red, white, and blue Medicare card typically arrives in the mail 2 to 3 months before your effective date.',
    ];

    setResult({
      partAStartStr,
      partBStartStr,
      iepWindowStr,
      explanation,
      checklist,
    });
  };

  return (
    <div
      className="date-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Medicare Effective Date Calculator
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Enter your birth month and enrollment timing to calculate your exact Part A and Part B coverage start dates.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-bmonth`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Birth Month
            </label>
            <select
              id={`${uid}-bmonth`}
              value={birthMonth}
              onChange={(e) => setBirthMonth(parseInt(e.target.value))}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-byear`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Birth Year
            </label>
            <input
              id={`${uid}-byear`}
              type="number"
              min={1940}
              max={1965}
              value={birthYear}
              onChange={(e) => setBirthYear(parseInt(e.target.value) || 1961)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-timing`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            When Do You Plan to Enroll?
          </label>
          <select
            id={`${uid}-timing`}
            value={enrollmentTiming}
            onChange={(e) => setEnrollmentTiming(e.target.value as EnrollmentTiming)}
            style={{ width: '100%', maxWidth: '440px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="iep_early">Initial Enrollment Period (3 Months BEFORE Birth Month)</option>
            <option value="iep_month">Initial Enrollment Period (DURING Birth Month)</option>
            <option value="iep_late">Initial Enrollment Period (1 to 3 Months AFTER Birth Month)</option>
            <option value="gep">General Enrollment Period (Jan 1 – Mar 31)</option>
            <option value="sep">Special Enrollment Period (Retiring After 65 with Employer Plan)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input
            id={`${uid}-first`}
            type="checkbox"
            checked={bornOnFirst}
            onChange={(e) => setBornOnFirst(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
          />
          <label htmlFor={`${uid}-first`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
            I was born on the 1st day of the month (e.g., June 1st)
          </label>
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
          Calculate Effective Start Dates →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f0fdf4', border: '2px solid #38a169', padding: '1.25rem', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                Medicare Part A Start Date
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0D2137', margin: '0.25rem 0' }}>
                {result.partAStartStr}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#4B5A6E' }}>Hospital Coverage Effective</span>
            </div>

            <div style={{ background: '#f0fdf4', border: '2px solid #38a169', padding: '1.25rem', borderRadius: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                Medicare Part B Start Date
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
                {result.partBStartStr}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#4B5A6E' }}>Medical/Doctor Coverage Effective</span>
            </div>
          </div>

          <p style={{ fontSize: '0.975rem', color: '#0D2137', lineHeight: 1.6, marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
            {result.explanation}
          </p>

          {/* Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Medicare Timeline Summary
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
