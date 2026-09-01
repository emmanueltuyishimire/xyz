import React, { useState } from 'react';

/**
 * SocialSecurityFullRetirementAgeCalculator.tsx
 * Interactive React component calculating FRA based on exact date of birth.
 * Follows exact Social Security Administration statutes (Section 216(l)) and POMS GN 00302.010.
 * Human-First Data-Aware Contextual Decision Step.
 * WCAG 2.2 AA compliant.
 */

interface FRADetails {
  ageYears: number;
  ageMonths: number;
  payoutAt62: number;      // percentage
  payoutAt70: number;      // percentage
  targetDateStr: string;   // FRA calendar date
  earlyDateStr: string;    // Age 62 earliest filing date
  maxDateStr: string;      // Age 70 max date
  dollarAt62?: number;     // optional dollar amounts
  dollarAtFRA?: number;
  dollarAt70?: number;
  currentAgeApprox: number;
  birthYear: number;
  birthMonth: number;
  pia?: number;
}

function getFRAForBirthYear(birthYear: number): { ageYears: number; ageMonths: number; payoutAt62: number; payoutAt70: number } {
  if (birthYear <= 1937) {
    return { ageYears: 65, ageMonths: 0,  payoutAt62: 80.00,  payoutAt70: 140.00 };
  } else if (birthYear === 1938) {
    return { ageYears: 65, ageMonths: 2,  payoutAt62: 79.17,  payoutAt70: 138.67 };
  } else if (birthYear === 1939) {
    return { ageYears: 65, ageMonths: 4,  payoutAt62: 78.33,  payoutAt70: 137.33 };
  } else if (birthYear === 1940) {
    return { ageYears: 65, ageMonths: 6,  payoutAt62: 77.50,  payoutAt70: 136.00 };
  } else if (birthYear === 1941) {
    return { ageYears: 65, ageMonths: 8,  payoutAt62: 76.67,  payoutAt70: 134.67 };
  } else if (birthYear === 1942) {
    return { ageYears: 65, ageMonths: 10, payoutAt62: 75.83,  payoutAt70: 133.33 };
  } else if (birthYear >= 1943 && birthYear <= 1954) {
    return { ageYears: 66, ageMonths: 0,  payoutAt62: 75.00,  payoutAt70: 132.00 };
  } else if (birthYear === 1955) {
    return { ageYears: 66, ageMonths: 2,  payoutAt62: 74.17,  payoutAt70: 130.67 };
  } else if (birthYear === 1956) {
    return { ageYears: 66, ageMonths: 4,  payoutAt62: 73.33,  payoutAt70: 129.33 };
  } else if (birthYear === 1957) {
    return { ageYears: 66, ageMonths: 6,  payoutAt62: 72.50,  payoutAt70: 128.00 };
  } else if (birthYear === 1958) {
    return { ageYears: 66, ageMonths: 8,  payoutAt62: 71.67,  payoutAt70: 126.67 };
  } else if (birthYear === 1959) {
    return { ageYears: 66, ageMonths: 10, payoutAt62: 70.83,  payoutAt70: 125.33 };
  } else {
    // 1960 or later
    return { ageYears: 67, ageMonths: 0,  payoutAt62: 70.00,  payoutAt70: 124.00 };
  }
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function formatDollar(amount: number): string {
  return '$' + Math.round(amount).toLocaleString('en-US');
}

export const SocialSecurityFullRetirementAgeCalculator: React.FC = () => {
  const [birthDay, setBirthDay]     = useState<number>(0);
  const [birthMonth, setBirthMonth] = useState<number>(0);
  const [birthYear, setBirthYear]   = useState<number>(0);
  const [monthlyPIA, setMonthlyPIA] = useState<string>('');
  const [results, setResults]       = useState<FRADetails | null>(null);
  const [error, setError]           = useState<string>('');
  const [copied, setCopied]         = useState<boolean>(false);

  const calculateFRA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!birthMonth || !birthYear) {
      setError('Please select both your birth month and birth year.');
      setResults(null);
      return;
    }
    if (birthYear < 1924 || birthYear > 2010) {
      setError('Please enter a birth year between 1924 and 2010.');
      setResults(null);
      return;
    }

    // SSA POMS GN 00302.010: Attainment on the day before birthday.
    let cohortYear = birthYear;
    let baseYear = birthYear;
    let baseMonth = birthMonth; // 1 to 12

    if (birthDay === 1) {
      if (birthMonth === 1) {
        // Born Jan 1st: legally belongs to previous year's cohort and turns age in December of previous year
        cohortYear = birthYear - 1;
        baseYear = birthYear - 1;
        baseMonth = 12;
      } else {
        // Born 1st of month: attains age on last day of preceding month
        cohortYear = birthYear;
        baseYear = birthYear;
        baseMonth = birthMonth - 1;
      }
    }

    const { ageYears, ageMonths, payoutAt62, payoutAt70 } = getFRAForBirthYear(cohortYear);

    // Using 15th of the month avoids any daylight saving time or month-boundary roll issues
    const fraDate = new Date(baseYear + ageYears, (baseMonth - 1) + ageMonths, 15);
    const earlyDate = new Date(baseYear + 62, baseMonth - 1, 15);
    const maxDate = new Date(baseYear + 70, baseMonth - 1, 15);

    const pia = parseFloat(monthlyPIA.replace(/[^0-9.]/g, ''));
    let dollarAt62: number | undefined;
    let dollarAtFRA: number | undefined;
    let dollarAt70: number | undefined;
    if (!isNaN(pia) && pia > 0) {
      dollarAt62  = Math.round(pia * (payoutAt62 / 100));
      dollarAtFRA = Math.round(pia);
      dollarAt70  = Math.round(pia * (payoutAt70 / 100));
    }

    const today = new Date();
    const currentAgeApprox = today.getFullYear() - birthYear + (today.getMonth() - (birthMonth - 1)) / 12;

    setResults({
      ageYears,
      ageMonths,
      payoutAt62,
      payoutAt70,
      targetDateStr: formatMonthYear(fraDate),
      earlyDateStr:  formatMonthYear(earlyDate),
      maxDateStr:    formatMonthYear(maxDate),
      dollarAt62,
      dollarAtFRA,
      dollarAt70,
      currentAgeApprox,
      birthYear: cohortYear,
      birthMonth,
      pia: (!isNaN(pia) && pia > 0) ? pia : undefined,
    });
  };

  const handleCopy = () => {
    if (!results) return;
    const fraLabel = `${results.ageYears} years${results.ageMonths > 0 ? ` and ${results.ageMonths} months` : ''}`;
    const lines = [
      `My Social Security Full Retirement Age (FRA): ${fraLabel}`,
      `FRA Milestone Date: ${results.targetDateStr}`,
      `Earliest filing milestone (Age 62): ${results.earlyDateStr}`,
      `Maximum delayed credits milestone (Age 70): ${results.maxDateStr}`,
      `Benefit at 62: ${results.payoutAt62}%${results.dollarAt62 ? ` (${formatDollar(results.dollarAt62)}/mo)` : ''} of PIA — permanent early reduction`,
      `Benefit at FRA: 100%${results.dollarAtFRA ? ` (${formatDollar(results.dollarAtFRA)}/mo)` : ''} of PIA — full unreduced check`,
      `Benefit at 70: ${results.payoutAt70}%${results.dollarAt70 ? ` (${formatDollar(results.dollarAt70)}/mo)` : ''} of PIA — maximum delayed credits`,
      ``,
      `Calculated via Seniors Audit — https://www.seniorsaudit.com`,
      `Source: Social Security Administration statutory tables`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handlePrint = () => window.print();

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1923 }, (_, i) => currentYear - i);

  return (
    <div className="fra-calculator-wrapper">
      <form onSubmit={calculateFRA} className="calc-form fra-form" aria-label="Social Security Full Retirement Age Calculation Form">

        {/* Birth Date Input Row */}
        <fieldset className="fra-fieldset">
          <legend className="fra-legend">Select Your Date of Birth</legend>
          <p className="fra-legend-hint">
            Your birth year sets your statutory retirement age under federal law. Entering your birth day applies the SSA 1st-of-month attainment rule (POMS GN 00302.010).
          </p>
          <div className="fra-date-row">
            {/* Month */}
            <div className="fra-field">
              <label htmlFor="fra-month" className="fra-label">Month <span className="fra-required" aria-hidden="true">*</span></label>
              <select
                id="fra-month"
                name="birthMonth"
                className="fra-select"
                value={birthMonth}
                onChange={e => setBirthMonth(Number(e.target.value))}
                required
                aria-required="true"
              >
                <option value={0}>Month</option>
                {months.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div className="fra-field">
              <label htmlFor="fra-day" className="fra-label">
                Day <span className="fra-optional">(optional)</span>
              </label>
              <select
                id="fra-day"
                name="birthDay"
                className="fra-select"
                value={birthDay}
                onChange={e => setBirthDay(Number(e.target.value))}
                aria-label="Birth day — optional, improves accuracy if born on the 1st of a month"
              >
                <option value={0}>Day</option>
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="fra-field fra-field--year">
              <label htmlFor="fra-year" className="fra-label">Year <span className="fra-required" aria-hidden="true">*</span></label>
              <select
                id="fra-year"
                name="birthYear"
                className="fra-select"
                value={birthYear}
                onChange={e => setBirthYear(Number(e.target.value))}
                required
                aria-required="true"
              >
                <option value={0}>Year</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Optional PIA Dollar Input */}
        <div className="fra-pia-field">
          <label htmlFor="fra-pia" className="fra-label">
            Your estimated monthly benefit at Full Retirement Age{' '}
            <span className="fra-optional">(optional — gives calculated dollar checks)</span>
          </label>
          <div className="fra-pia-input-wrap">
            <span className="fra-pia-dollar" aria-hidden="true">$</span>
            <input
              id="fra-pia"
              name="monthlyPIA"
              type="number"
              className="fra-input"
              value={monthlyPIA}
              onChange={e => setMonthlyPIA(e.target.value)}
              placeholder="e.g. 2,200"
              min="1"
              max="9999"
              aria-describedby="fra-pia-hint"
            />
          </div>
          <p id="fra-pia-hint" className="fra-hint">
            You can find your estimated benefit at <a href="https://www.ssa.gov/myaccount" target="_blank" rel="noopener noreferrer">ssa.gov/myaccount</a>. Leave blank for percentage-only results.
          </p>
        </div>

        {error && (
          <p className="fra-error" role="alert" aria-live="polite">{error}</p>
        )}

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate My Full Retirement Age
        </button>
      </form>

      {results && (
        <div className="fra-results-wrapper" aria-live="polite" aria-atomic="true">
          {/* Primary Result Headline */}
          <div className="fra-primary-result" role="region" aria-label="Your calculated Full Retirement Age result">
            <p className="fra-primary-label">Your Full Retirement Age</p>
            <p className="fra-primary-value">
              {results.ageYears} Years{results.ageMonths > 0 ? ` and ${results.ageMonths} Months` : ''}
            </p>
            <p className="fra-primary-date">
              You reach Full Retirement Age in <strong>{results.targetDateStr}</strong>
            </p>
            <p className="fra-primary-subtext">
              Based on your birth year, your Full Retirement Age is <strong>{results.ageYears}{results.ageMonths > 0 ? ` and ${results.ageMonths} months` : ''}</strong>. This does not mean you have to wait until {results.ageYears} to claim Social Security. You can generally start retirement benefits as early as 62, but claiming before your FRA permanently reduces your monthly benefit. Waiting beyond FRA can increase your monthly benefit up to age 70.
            </p>
          </div>

          {/* Three Claiming Ages Cards */}
          <div className="fra-three-ages" aria-label="Benefit comparison by claiming age milestone">
            <div className="fra-age-card fra-age-card--early">
              <p className="fra-age-label">Age 62 — Earliest</p>
              <p className="fra-age-date">{results.earlyDateStr}</p>
              <p className="fra-age-pct">{results.payoutAt62}% of PIA</p>
              {results.dollarAt62 && (
                <p className="fra-age-dollar">{formatDollar(results.dollarAt62)}<span>/mo</span></p>
              )}
              <p className="fra-age-note">Permanent reduction for life — does not reset at FRA</p>
            </div>

            <div className="fra-age-card fra-age-card--fra">
              <p className="fra-age-label">FRA — Full Benefit ✓</p>
              <p className="fra-age-date">{results.targetDateStr}</p>
              <p className="fra-age-pct">100% of PIA</p>
              {results.dollarAtFRA && (
                <p className="fra-age-dollar">{formatDollar(results.dollarAtFRA)}<span>/mo</span></p>
              )}
              <p className="fra-age-note">No earnings penalty. You can work unlimited hours.</p>
            </div>

            <div className="fra-age-card fra-age-card--max">
              <p className="fra-age-label">Age 70 — Maximum</p>
              <p className="fra-age-date">{results.maxDateStr}</p>
              <p className="fra-age-pct">{results.payoutAt70}% of PIA</p>
              {results.dollarAt70 && (
                <p className="fra-age-dollar">{formatDollar(results.dollarAt70)}<span>/mo</span></p>
              )}
              <p className="fra-age-note">Delayed credits end at 70 — waiting longer adds nothing</p>
            </div>
          </div>

          {/* Copy and Print Utility Actions */}
          <div className="fra-actions">
            <button
              type="button"
              className="fra-action-btn"
              onClick={handleCopy}
              aria-label="Copy your retirement age results to clipboard"
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy My Results'}
            </button>
            <button
              type="button"
              className="fra-action-btn fra-action-btn--secondary"
              onClick={handlePrint}
              aria-label="Print your retirement age results"
            >
              🖨️ Print Results
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════
               NATURAL NEXT DECISION CTA (DATA-AWARE)
               ═══════════════════════════════════════════════════════ */}
          {(() => {
            const fraDisplay = `${results.ageYears}${results.ageMonths > 0 ? ` & ${results.ageMonths} mo` : ''}`;
            const params = `?birthYear=${results.birthYear}&birthMonth=${results.birthMonth}${results.pia ? `&pia=${results.pia}` : ''}`;
            
            return (
              <div className="fra-next-step-box" role="complementary" aria-label="Next logical decision step">
                <p className="fra-next-step-prompt">What could claiming at different ages mean for you?</p>
                <p className="fra-next-step-question">
                  Now that you know your Full Retirement Age, the next useful step is comparing what happens if you claim at 62, at FRA ({fraDisplay}), or wait until 70.
                </p>
                <p className="fra-next-step-desc">
                  {results.dollarAt62 && results.dollarAtFRA && results.dollarAt70 ? (
                    <>
                      Based on your estimated benefit, you would receive <strong>{formatDollar(results.dollarAt62)}/mo</strong> at 62, <strong>{formatDollar(results.dollarAtFRA)}/mo</strong> at {fraDisplay}, or <strong>{formatDollar(results.dollarAt70)}/mo</strong> at 70. See the exact break-even age where waiting pays off in total lifetime income.
                    </>
                  ) : (
                    <>
                      Claiming at 62 pays <strong>{results.payoutAt62}%</strong> of your full check, reaching your FRA pays <strong>100%</strong>, and waiting to 70 pays <strong>{results.payoutAt70}%</strong>. Compare your cumulative lifetime income across all three milestones.
                    </>
                  )}
                </p>
                <div className="fra-next-step-action-wrap">
                  <a href={`/tools/social-security-break-even-calculator/${params}`} className="fra-next-step-btn">
                    Compare Claiming Ages →
                  </a>
                  <span className="fra-next-step-skip">
                    or continue reading the complete FRA chart and guidelines below ↓
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Conceptual Clarification Footnote (FRA vs. COLA) */}
          <div className="fra-clarification-note">
            <p>
              <strong>Important Rule Distinction:</strong> Your Full Retirement Age is set strictly by statute based on your <strong>birth year</strong>.
              It does <em>not</em> change due to inflation, the year you calculate, or annual Cost-of-Living Adjustments (COLAs).
              While annual COLAs increase your monthly dollar payout after you become eligible, they never alter or postpone your Full Retirement Age milestone.
            </p>
            {birthDay === 1 && (
              <p className="fra-birthday-rule-applied">
                ✓ <strong>1st-of-the-month rule applied:</strong> Per SSA POMS GN 00302.010, your age attainment date was calculated as the final day of the preceding month, moving your eligibility milestone one calendar month earlier.
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        .fra-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .fra-fieldset { border: none; padding: 0; margin: 0; }
        .fra-legend { font-size: 1.05rem; font-weight: 700; color: #0D2137; margin-bottom: 0.35rem; }
        .fra-legend-hint { font-size: 0.875rem; color: #4B5A6E; margin: 0 0 0.85rem; line-height: 1.5; }
        .fra-date-row { display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 0.75rem; }
        @media (max-width: 480px) { .fra-date-row { grid-template-columns: 1fr 1fr; } .fra-field--year { grid-column: 1 / -1; } }
        .fra-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .fra-label { font-size: 0.875rem; font-weight: 700; color: #0D2137; }
        .fra-required { color: #C9431A; }
        .fra-optional { font-weight: 400; color: #4B5A6E; font-size: 0.8rem; }
        .fra-select, .fra-input { border: 2px solid #DDE3EA; border-radius: 6px; padding: 0.65rem 0.75rem; font-size: 1rem; background: #fff; color: #0D2137; width: 100%; transition: border-color 0.15s; }
        .fra-select:focus, .fra-input:focus { border-color: #0A3D3A; outline: 3px solid #C9933A; outline-offset: 2px; }
        .fra-pia-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .fra-pia-input-wrap { position: relative; display: flex; align-items: center; max-width: 220px; }
        .fra-pia-dollar { position: absolute; left: 0.75rem; font-weight: 700; color: #4B5A6E; font-size: 1rem; pointer-events: none; }
        .fra-input { padding-left: 1.75rem; }
        .fra-hint { font-size: 0.8rem; color: #4B5A6E; margin: 0.25rem 0 0; line-height: 1.5; }
        .fra-hint a { color: #0A3D3A; font-weight: 600; text-decoration: underline; }
        .fra-error { color: #C9431A; font-weight: 700; font-size: 0.9rem; padding: 0.5rem 0.75rem; background: #FFF0F0; border-left: 3px solid #C9431A; border-radius: 0 4px 4px 0; margin: 0; }

        /* Results Display */
        .fra-results-wrapper { margin-top: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .fra-primary-result { background: #0A3D3A; color: #fff; border-radius: 10px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 10px rgba(10,61,58,0.2); }
        .fra-primary-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #F7D070; margin: 0 0 0.5rem; }
        .fra-primary-value { font-size: clamp(1.85rem, 5vw, 2.5rem); font-weight: 800; color: #fff; margin: 0 0 0.35rem; line-height: 1.1; }
        .fra-primary-date { font-size: 1.15rem; color: #F7D070; margin: 0 0 0.5rem; font-weight: 700; }
        .fra-primary-subtext { font-size: 0.925rem; color: #E0EFEF; margin: 0; line-height: 1.55; max-width: 64ch; margin-inline: auto; }

        .fra-three-ages { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        @media (max-width: 580px) { .fra-three-ages { grid-template-columns: 1fr; } }
        .fra-age-card { border-radius: 8px; padding: 1rem; text-align: center; border: 2px solid #DDE3EA; }
        .fra-age-card--early { border-color: #E8761A; background: #FFF8F0; }
        .fra-age-card--fra   { border-color: #0A3D3A; background: #EBF4F3; }
        .fra-age-card--max   { border-color: #1A7A4E; background: #F0FDF4; }
        .fra-age-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #4B5A6E; margin: 0 0 0.25rem; }
        .fra-age-date  { font-size: 0.85rem; color: #4B5A6E; margin: 0 0 0.5rem; font-weight: 600; }
        .fra-age-pct   { font-size: 1.1rem; font-weight: 800; color: #0D2137; margin: 0 0 0.2rem; }
        .fra-age-dollar { font-size: 1.5rem; font-weight: 800; color: #0A3D3A; margin: 0 0 0.2rem; line-height: 1.1; }
        .fra-age-dollar span { font-size: 0.8rem; font-weight: 400; color: #4B5A6E; }
        .fra-age-card--fra .fra-age-pct { color: #0A3D3A; }
        .fra-age-card--fra .fra-age-dollar { color: #0A3D3A; }
        .fra-age-note { font-size: 0.75rem; color: #4B5A6E; line-height: 1.4; margin: 0.35rem 0 0; }

        .fra-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .fra-action-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: #F6F8FA; border: 1.5px solid #DDE3EA; border-radius: 6px; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 700; color: #0D2137; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
        .fra-action-btn:hover { border-color: #0A3D3A; background: #EBF4F3; }
        .fra-action-btn:focus-visible { outline: 3px solid #C9933A; outline-offset: 2px; }
        .fra-action-btn--secondary { color: #4B5A6E; }

        /* ── Data-Aware Contextual Next Step Box ── */
        .fra-next-step-box {
          background: #F0F8F7;
          border: 2px solid #0A3D3A;
          border-radius: 8px;
          padding: 1.35rem 1.5rem;
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .fra-next-step-prompt {
          font-size: 0.825rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #0A3D3A;
          margin: 0;
        }
        .fra-next-step-question {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0D2137;
          margin: 0;
          line-height: 1.4;
        }
        .fra-next-step-desc {
          font-size: 0.925rem;
          color: #4B5A6E;
          line-height: 1.55;
          margin: 0;
        }
        .fra-next-step-action-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .fra-next-step-btn {
          display: inline-block;
          background: #0A3D3A;
          color: #ffffff !important;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.7rem 1.35rem;
          border-radius: 6px;
          text-decoration: none !important;
          transition: background 0.15s, transform 0.1s;
        }
        .fra-next-step-btn:hover {
          background: #0D4F4B;
          transform: translateY(-1px);
        }
        .fra-next-step-skip {
          font-size: 0.85rem;
          color: #64748B;
        }

        /* Clarification Box */
        .fra-clarification-note {
          background: #F6F8FA;
          border-left: 3px solid #64748B;
          border-radius: 0 6px 6px 0;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: #4B5A6E;
          line-height: 1.55;
        }
        .fra-clarification-note p { margin: 0; }
        .fra-birthday-rule-applied {
          margin-top: 0.4rem !important;
          color: #0A3D3A;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
