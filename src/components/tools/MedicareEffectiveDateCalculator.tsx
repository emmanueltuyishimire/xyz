import React, { useState, useId } from 'react';
import { calculateMedicareCoverageDates, partBPenaltyPerMonth } from '../../lib/engine';

/**
 * MedicareEffectiveDateCalculator.tsx
 * Tool: Medicare Effective Date Calculator
 * Primary keyword: medicare effective date calculator
 */

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
  const [bornOnFirst, setBornOnFirst] = useState<boolean>(false);
  const [signUpMonth, setSignUpMonth] = useState<number>(6); // June
  const [signUpYear, setSignUpYear] = useState<number>(2026);
  const [hasEmployerCoverage, setHasEmployerCoverage] = useState<boolean>(false);
  const [employerCoverageEndMonth, setEmployerCoverageEndMonth] = useState<number>(6);
  const [employerCoverageEndYear, setEmployerCoverageEndYear] = useState<number>(2026);
  const [delayMonths, setDelayMonths] = useState<number>(12);

  const [result, setResult] = useState<DateResult | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const birthDay = bornOnFirst ? '01' : '15';
    const birthDateStr = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${birthDay}`;
    const signUpDateStr = `${signUpYear}-${String(signUpMonth).padStart(2, '0')}`;
    const employerCoverageEndDateStr = hasEmployerCoverage
      ? `${employerCoverageEndYear}-${String(employerCoverageEndMonth).padStart(2, '0')}`
      : undefined;

    // Call engine function for deterministic date calculation
    const datesOutput = calculateMedicareCoverageDates({
      birthDate: birthDateStr,
      signUpDate: signUpDateStr,
      hasEmployerCoverage,
      employerCoverageEndDate: employerCoverageEndDateStr
    });

    const [aYear, aMonth] = datesOutput.partAEffectiveDate.split('-').map(Number);
    const partAStartStr = `${monthNames[aMonth - 1]} 1, ${aYear}`;

    let partBStartStr = datesOutput.partBEffectiveDate;
    if (datesOutput.partBEffectiveDate.includes('-')) {
      const [bYear, bMonth] = datesOutput.partBEffectiveDate.split('-').map(Number);
      partBStartStr = `${monthNames[bMonth - 1]} 1, ${bYear}`;
    }

    const [oYear, oMonth] = datesOutput.iepOpenDate.split('-').map(Number);
    const [cYear, cMonth, cDay] = datesOutput.iepCloseDate.split('-').map(Number);
    const iepOpenStr = `${monthNames[oMonth - 1]} 1, ${oYear}`;
    const iepCloseStr = `${monthNames[cMonth - 1]} ${cDay}, ${cYear}`;
    const iepWindowStr = `${iepOpenStr} – ${iepCloseStr}`;

    let latePenaltyLine: string | undefined;
    if (datesOutput.penaltyApplies && !hasEmployerCoverage) {
      const penaltyMultiplier = Math.max(1, Math.floor(delayMonths / 12));
      const penaltyAmount = partBPenaltyPerMonth(penaltyMultiplier).toFixed(2);
      latePenaltyLine = `Part B Late Enrollment Penalty: ${penaltyMultiplier * 10}% lifetime surcharge (+\$${penaltyAmount}/month added to the \$202.90 standard premium) for ${penaltyMultiplier * 12} full months without creditable coverage.`;
    } else if (hasEmployerCoverage) {
      latePenaltyLine = 'Special rule: If you had continuous active employer group coverage (20+ employees), you qualify for a Special Enrollment Period (SEP) with $0 penalty.';
    }

    const checklist = [
      `65th Birthday Benchmark: ${monthNames[birthMonth - 1]} ${birthYear + 65}.`,
      bornOnFirst ? '⚠️ Born on the 1st: Medicare statutory rule treats eligibility as occurring in the prior month.' : 'Standard Birthday Rule Applies.',
      `7-Month Initial Enrollment Period (IEP): Opens ${iepOpenStr}, Closes ${iepCloseStr}.`,
      `Medicare Part A Start Date: ${partAStartStr} (Premium-free Part A is retroactive to 65th birth month, up to 6 months).`,
      `Medicare Part B Start Date: ${partBStartStr}.`,
      'Card Delivery: Your red, white, and blue Medicare card typically arrives in the mail 2 to 4 weeks after processing.',
    ];

    setResult({
      partAStartStr,
      partBStartStr,
      iepOpenStr,
      iepCloseStr,
      iepWindowStr,
      hasGap: !!datesOutput.hasGap,
      gapWarning: datesOutput.gapLine,
      latePenaltyLine,
      explanation: datesOutput.explanation ?? '',
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
          Calculate Your Medicare Effective Dates
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Enter your birth date and actual sign-up month to calculate your exact Part A and Part B coverage start dates under current CMS rules.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Birth Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-bmonth`} style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              Birth Month
            </label>
            <select
              id={`${uid}-bmonth`}
              value={birthMonth}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value);
                setBirthMonth(newMonth);
                setSignUpMonth(newMonth);
              }}
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
              min={1930}
              max={2030}
              value={birthYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value) || 1961;
                setBirthYear(newYear);
                setSignUpYear(newYear + 65);
              }}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
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
            I was born on the 1st day of the month (shifts eligibility 1 month earlier under SSA POMS HI 00805)
          </label>
        </div>

        {/* Actual Planned Sign-Up Month & Year */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#0A3D3A', marginBottom: '0.5rem' }}>
            Actual Planned Sign-Up Month &amp; Year
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor={`${uid}-smonth`} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4B5A6E', marginBottom: '0.25rem' }}>
                Sign-Up Month
              </label>
              <select
                id={`${uid}-smonth`}
                value={signUpMonth}
                onChange={(e) => setSignUpMonth(parseInt(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-syear`} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#4B5A6E', marginBottom: '0.25rem' }}>
                Sign-Up Year
              </label>
              <select
                id={`${uid}-syear`}
                value={signUpYear}
                onChange={(e) => setSignUpYear(parseInt(e.target.value) || (birthYear + 65))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
              >
                {Array.from({ length: 12 }, (_, i) => birthYear + 64 + i).map(year => (
                  <option key={year} value={year}>{year} (Age {year - birthYear})</option>
                ))}
              </select>
            </div>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Tip: Your 7-month IEP window runs from 3 months before your 65th birthday month to 3 months after. General Enrollment Period (GEP) runs Jan 1 – Mar 31 each year.
          </p>
        </div>

        {/* Employer Coverage & End Date (Item 1b) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id={`${uid}-emp`}
              type="checkbox"
              checked={hasEmployerCoverage}
              onChange={(e) => setHasEmployerCoverage(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
            />
            <label htmlFor={`${uid}-emp`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
              I have or had active employer group health coverage (20 or more employees)
            </label>
          </div>

          {hasEmployerCoverage && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#166534', marginBottom: '0.5rem' }}>
                Date employer coverage ends (or ended):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor={`${uid}-emp-end-month`} style={{ display: 'block', fontSize: '0.85rem', color: '#14532D', marginBottom: '0.25rem' }}>
                    End Month
                  </label>
                  <select
                    id={`${uid}-emp-end-month`}
                    value={employerCoverageEndMonth}
                    onChange={(e) => setEmployerCoverageEndMonth(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.35rem', border: '1px solid #86efac', background: '#fff' }}
                  >
                    {monthNames.map((name, idx) => (
                      <option key={idx} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${uid}-emp-end-year`} style={{ display: 'block', fontSize: '0.85rem', color: '#14532D', marginBottom: '0.25rem' }}>
                    End Year
                  </label>
                  <input
                    id={`${uid}-emp-end-year`}
                    type="number"
                    min={2020}
                    max={2035}
                    value={employerCoverageEndYear}
                    onChange={(e) => setEmployerCoverageEndYear(parseInt(e.target.value) || 2026)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.35rem', border: '1px solid #86efac' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {!hasEmployerCoverage && (
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '0.85rem', borderRadius: '0.5rem' }}>
            <label htmlFor={`${uid}-delay`} style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#991b1b', marginBottom: '0.25rem' }}>
              Full 12-month periods delayed past IEP without creditable employer coverage:
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
