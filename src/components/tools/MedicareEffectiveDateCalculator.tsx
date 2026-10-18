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
  iepOpenStr: string;
  iepCloseStr: string;
  iepWindowStr: string;
  hasGap: boolean;
  gapWarning?: string;
  latePenaltyLine?: string;
  explanation: string;
  checklist: string[];
}

export const MedicareEffectiveDateCalculator: React.FC = () => {
  const uid = useId();

  const [birthMonth, setBirthMonth] = useState<number>(6); // June
  const [birthYear, setBirthYear] = useState<number>(1961); // Turn 65 in 2026
  const [enrollmentTiming, setEnrollmentTiming] = useState<EnrollmentTiming>('iep_early');
  const [bornOnFirst, setBornOnFirst] = useState<boolean>(false);
  const [hasEmployerCoverage, setHasEmployerCoverage] = useState<boolean>(false);
  const [delayMonths, setDelayMonths] = useState<number>(12);

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

    const iepOpenDays = new Date(iepEndYear, iepEndMonth + 1, 0).getDate();
    const iepOpenStr = `${monthNames[iepStartMonth]} 1, ${iepStartYear}`;
    const iepCloseStr = `${monthNames[iepEndMonth]} ${iepOpenDays}, ${iepEndYear}`;
    const iepWindowStr = `${iepOpenStr} – ${iepCloseStr}`;

    let partBStartMonth = effectiveMonth;
    let partBStartYear = effectiveYear;
    let hasGap = false;
    let gapWarning: string | undefined;
    let latePenaltyLine: string | undefined;
    let explanation = '';

    if (enrollmentTiming === 'iep_early' || enrollmentTiming === 'iep_month') {
      partBStartMonth = effectiveMonth;
      partBStartYear = effectiveYear;
      explanation = `Because you enroll during your Initial Enrollment Period (IEP) before or during your 65th birth month, your Medicare Part A & B coverage begins on the 1st day of the month you turn 65 (${monthNames[partBStartMonth]} 1, ${partBStartYear}).`;
    } else if (enrollmentTiming === 'iep_late') {
      partBStartMonth = (effectiveMonth + 1) % 12;
      partBStartYear = effectiveMonth === 11 ? effectiveYear + 1 : effectiveYear;
      hasGap = true;
      gapWarning = `Coverage gap notice: Because you enroll after your 65th birth month, Part B coverage begins the first of the month following enrollment (${monthNames[partBStartMonth]} 1, ${partBStartYear}). You will have a temporary gap in outpatient medical coverage unless you have qualifying group health coverage.`;
      explanation = `Under current Medicare rules (Consolidated Appropriations Act), enrolling during the late months of your IEP means Part B takes effect on the 1st of the month following enrollment (${monthNames[partBStartMonth]} 1, ${partBStartYear}). Premium-free Part A is retroactive to your 65th birth month.`;
    } else if (enrollmentTiming === 'gep') {
      partBStartMonth = 1; // February 1 (if enrolled in January) or first of following month
      partBStartYear = 2026;
      if (!hasEmployerCoverage) {
        hasGap = true;
        const penaltyMultiplier = Math.floor(delayMonths / 12);
        if (penaltyMultiplier >= 1) {
          const penaltyAmount = (penaltyMultiplier * 0.10 * 202.90).toFixed(2);
          latePenaltyLine = `Part B Late Enrollment Penalty: ${penaltyMultiplier * 10}% lifetime surcharge (+\\$${penaltyAmount}/month added to the \\$202.90 standard premium) for ${penaltyMultiplier * 12} full months without creditable coverage.`;
        }
        gapWarning = 'General Enrollment Period enrollments take effect the 1st of the month following your application (Feb 1, Mar 1, or Apr 1). Without active employer group health coverage, you risk a gap in outpatient protection and potential late enrollment surcharges.';
      } else {
        latePenaltyLine = 'Special rule: If you had continuous active employer group coverage, you qualify for an SEP and owe zero penalty.';
      }
      explanation = 'Enrolling during the General Enrollment Period (Jan 1 – Mar 31) activates coverage on the 1st day of the month following enrollment. You are no longer forced to wait until July 1 under updated CMS regulations.';
    } else {
      // SEP
      partBStartMonth = (effectiveMonth + 1) % 12;
      partBStartYear = effectiveYear;
      explanation = 'Enrolling during a Special Enrollment Period (SEP) after leaving active employer group health coverage (>20 employees) allows your Part B coverage to begin on the 1st of the month following enrollment with $0 late enrollment penalty.';
      latePenaltyLine = 'Penalty Protection: Qualified SEP enrollees owe $0 late enrollment penalty.';
    }

    const partAStartStr = `${monthNames[effectiveMonth]} 1, ${effectiveYear}`;
    const partBStartStr = `${monthNames[partBStartMonth]} 1, ${partBStartYear}`;

    const checklist = [
      `65th Birthday Benchmark: ${monthNames[birthMonth - 1]} ${turn65Year}.`,
      bornOnFirst ? '⚠️ Born on the 1st: Medicare statutory rule treats eligibility as occurring in the prior month.' : 'Standard Birthday Rule Applies.',
      `7-Month Initial Enrollment Period (IEP): Opens ${iepOpenStr}, Closes ${iepCloseStr}.`,
      `Medicare Part A Start Date: ${partAStartStr} (Premium-free Part A is retroactive to 65th birth month).`,
      `Medicare Part B Start Date: ${partBStartStr}.`,
      'Card Delivery: Your red, white, and blue Medicare card typically arrives in the mail 2 to 4 weeks after processing.',
    ];

    setResult({
      partAStartStr,
      partBStartStr,
      iepOpenStr,
      iepCloseStr,
      iepWindowStr,
      hasGap,
      gapWarning,
      latePenaltyLine,
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
        <div role="heading" aria-level={2} style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Calculate Your Medicare Effective Dates
        </div>
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
            style={{ width: '100%', maxWidth: '480px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="iep_early">Initial Enrollment Period (3 Months BEFORE Birth Month)</option>
            <option value="iep_month">Initial Enrollment Period (DURING Birth Month)</option>
            <option value="iep_late">Initial Enrollment Period (1 to 3 Months AFTER Birth Month)</option>
            <option value="gep">General Enrollment Period (Jan 1 – Mar 31)</option>
            <option value="sep">Special Enrollment Period (Retiring After 65 with Employer Plan)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id={`${uid}-emp`}
              type="checkbox"
              checked={hasEmployerCoverage}
              onChange={(e) => setHasEmployerCoverage(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-emp`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              Delayed enrollment past 65 with active employer group health coverage (&gt;20 employees)
            </label>
          </div>
        </div>

        {enrollmentTiming === 'gep' && !hasEmployerCoverage && (
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '0.85rem', borderRadius: '0.5rem' }}>
            <label htmlFor={`${uid}-delay`} style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#991b1b', marginBottom: '0.25rem' }}>
              Full 12-month periods past IEP without creditable coverage:
            </label>
            <input
              id={`${uid}-delay`}
              type="number"
              min={0}
              max={120}
              value={delayMonths}
              onChange={(e) => setDelayMonths(parseInt(e.target.value) || 0)}
              style={{ width: '120px', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#7f1d1d', marginLeft: '0.5rem' }}>months delayed</span>
          </div>
        )}

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
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#B45309', margin: '0.25rem 0' }}>
                {result.partBStartStr}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#4B5A6E' }}>Medical/Doctor Coverage Effective</span>
            </div>
          </div>

          {result.gapWarning && (
            <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', padding: '0.9rem 1.1rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#92400e', fontSize: '0.925rem', lineHeight: 1.5 }}>
              <strong>Notice:</strong> {result.gapWarning}
            </div>
          )}

          {result.latePenaltyLine && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', padding: '0.9rem 1.1rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#991b1b', fontSize: '0.925rem', lineHeight: 1.5 }}>
              <strong>Penalty Check:</strong> {result.latePenaltyLine}
            </div>
          )}

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
