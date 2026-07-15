import React, { useState } from 'react';

/**
 * MedicareEnrollmentDeadlineCalculator.tsx
 * Seniors Audit
 *
 * Calculates:
 * - Initial Enrollment Period (IEP) window (7 months) based on turning 65.
 * - Special Enrollment Period (SEP) window (8 months) if delaying due to employer group coverage.
 * - General Enrollment Period (GEP) windows and late enrollment penalty warnings.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CalculationResults {
  birthMonthName: string;
  turning65Year: number;
  iepStartMonthName: string;
  iepStartYear: number;
  iepEndMonthName: string;
  iepEndYear: number;
  coverageStartIfEarly: string;
  employerDelay: boolean;
  sepStartMonthName?: string;
  sepStartYear?: number;
  sepEndMonthName?: string;
  sepEndYear?: number;
  gepNextYear: number;
}

export const MedicareEnrollmentDeadlineCalculator: React.FC = () => {
  const [birthMonth, setBirthMonth] = useState<number | ''>('');
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [hasEmployerCover, setHasEmployerCover] = useState<string>('no');
  const [retireMonth, setRetireMonth] = useState<number | ''>('');
  const [retireYear, setRetireYear] = useState<number | ''>('');
  
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (birthMonth === '' || birthYear === '') {
      setError('Please select both your birth month and birth year.');
      setResults(null);
      return;
    }

    const monthIndex = Number(birthMonth) - 1; // 0-11
    const yearVal = Number(birthYear);
    
    // We turn 65 in (birthYear + 65)
    const turning65Year = yearVal + 65;

    // IEP is 3 months before, birth month, and 3 months after (7 months total)
    // Calculate IEP start date
    let iepStartMonth = monthIndex - 3;
    let iepStartYear = turning65Year;
    if (iepStartMonth < 0) {
      iepStartMonth += 12;
      iepStartYear -= 1;
    }

    // Calculate IEP end date
    let iepEndMonth = monthIndex + 3;
    let iepEndYear = turning65Year;
    if (iepEndMonth > 11) {
      iepEndMonth -= 12;
      iepEndYear += 1;
    }

    // Standard Coverage Start if enrolled early (months 1-3 of IEP)
    // Normally coverage begins the 1st day of your birth month.
    // Exception: If birthday is the 1st of the month, coverage starts the 1st day of the PRIOR month.
    const coverageStartIfEarly = `1st day of ${MONTH_NAMES[monthIndex]} ${turning65Year}`;

    let sepStartMonthName = '';
    let sepStartYear = 0;
    let sepEndMonthName = '';
    let sepEndYear = 0;

    if (hasEmployerCover === 'yes') {
      if (retireMonth === '' || retireYear === '') {
        setError('Please select your planned retirement/coverage end month and year.');
        setResults(null);
        return;
      }
      
      const rMonth = Number(retireMonth) - 1; // 0-11
      const rYear = Number(retireYear);

      if (rYear < turning65Year || (rYear === turning65Year && rMonth < monthIndex)) {
        setError('Retirement date cannot be before you turn 65.');
        setResults(null);
        return;
      }

      // SEP starts the month after employer coverage/employment ends, and lasts 8 months.
      let sStartMonth = rMonth + 1;
      let sStartYear = rYear;
      if (sStartMonth > 11) {
        sStartMonth -= 12;
        sStartYear += 1;
      }

      let sEndMonth = rMonth + 8;
      let sEndYear = rYear;
      if (sEndMonth > 11) {
        sEndMonth -= 12;
        sEndYear += 1;
      }

      sepStartMonthName = MONTH_NAMES[sStartMonth];
      sepStartYear = sStartYear;
      sepEndMonthName = MONTH_NAMES[sEndMonth];
      sepEndYear = sEndYear;
    }

    // Next GEP is Jan 1 - Mar 31 of the year after they turn 65, or next calendar year
    const currentYear = new Date().getFullYear();
    const gepNextYear = Math.max(turning65Year + 1, currentYear + 1);

    setResults({
      birthMonthName: MONTH_NAMES[monthIndex],
      turning65Year,
      iepStartMonthName: MONTH_NAMES[iepStartMonth],
      iepStartYear,
      iepEndMonthName: MONTH_NAMES[iepEndMonth],
      iepEndYear,
      coverageStartIfEarly,
      employerDelay: hasEmployerCover === 'yes',
      sepStartMonthName,
      sepStartYear,
      sepEndMonthName,
      sepEndYear,
      gepNextYear
    });
  };

  const years65 = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 65 + 10; y >= currentYear - 65 - 10; y--) {
    years65.push(y);
  }

  const retirementYears = [];
  for (let y = currentYear; y <= currentYear + 15; y++) {
    retirementYears.push(y);
  }

  return (
    <div className="calc-card">
      <form onSubmit={handleCalculate} className="calc-form">
        
        {/* Step 1: Birth Date Dropdowns */}
        <fieldset className="calc-fieldset">
          <legend className="calc-legend">1. Enter Your Date of Birth</legend>
          <p className="calc-help-text">We only need month and year to calculate your Medicare eligibility timeline.</p>
          <div className="date-select-grid">
            <div className="date-select-col">
              <label htmlFor="birth-month" className="sr-only">Birth Month</label>
              <select
                id="birth-month"
                className="calc-select"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">-- Select Month --</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="date-select-col">
              <label htmlFor="birth-year" className="sr-only">Birth Year</label>
              <select
                id="birth-year"
                className="calc-select"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">-- Select Year --</option>
                {years65.map(y => (
                  <option key={y} value={y}>{y} (Turns 65 in {y + 65})</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Step 2: Employer Coverage Question */}
        <fieldset className="calc-fieldset">
          <legend className="calc-legend">2. Employer Group Insurance Delay</legend>
          <p className="calc-help-text">
            Are you planning to delay enrollment past age 65 because you or your spouse have active group health coverage from a current employer with 20 or more employees?
          </p>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="employer-cover"
                value="no"
                checked={hasEmployerCover === 'no'}
                onChange={() => setHasEmployerCover('no')}
              />
              <span>No, I want to start Medicare at age 65</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="employer-cover"
                value="yes"
                checked={hasEmployerCover === 'yes'}
                onChange={() => setHasEmployerCover('yes')}
              />
              <span>Yes, I am delaying due to active group employer coverage</span>
            </label>
          </div>
        </fieldset>

        {/* Step 3: Planned Retirement Date (Conditional) */}
        {hasEmployerCover === 'yes' && (
          <fieldset className="calc-fieldset">
            <legend className="calc-legend">3. Planned Retirement / Coverage End Date</legend>
            <p className="calc-help-text">Enter the month and year you expect to retire or lose active group coverage.</p>
            <div className="date-select-grid">
              <div className="date-select-col">
                <label htmlFor="retire-month" className="sr-only">Retirement Month</label>
                <select
                  id="retire-month"
                  className="calc-select"
                  value={retireMonth}
                  onChange={(e) => setRetireMonth(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">-- Select Month --</option>
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="date-select-col">
                <label htmlFor="retire-year" className="sr-only">Retirement Year</label>
                <select
                  id="retire-year"
                  className="calc-select"
                  value={retireYear}
                  onChange={(e) => setRetireYear(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">-- Select Year --</option>
                  {retirementYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
        )}

        {error && (
          <p className="calc-error-message" role="alert">
            <strong>Error:</strong> {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate Enrollment Deadlines
        </button>
      </form>

      {/* RESULTS DISPLAY */}
      {results && (
        <div className="calc-results-wrapper" aria-live="polite">
          <h3 className="calc-results-title">Your Personalized Medicare Enrollment Timeline</h3>
          
          <div className="results-grid">
            
            {/* Box 1: IEP Window */}
            <div className="results-card">
              <h4 className="results-card-title">Initial Enrollment Period (IEP)</h4>
              <p className="results-card-desc">
                Your turning-65 enrollment window starts <strong>{results.iepStartMonthName} {results.iepStartYear}</strong> and ends <strong>{results.iepEndMonthName} {results.iepEndYear}</strong>.
              </p>
              <div className="timeline-bar">
                <span>{results.iepStartMonthName} '{String(results.iepStartYear).slice(-2)}</span>
                <span className="timeline-center">Birth Month: {results.birthMonthName}</span>
                <span>{results.iepEndMonthName} '{String(results.iepEndYear).slice(-2)}</span>
              </div>
              <p className="results-note">
                To guarantee coverage starts on your birth month ({results.birthMonthName} {results.turning65Year}), you must enroll during the first 3 months of this window.
              </p>
            </div>

            {/* Box 2: Conditional SEP Window */}
            {results.employerDelay ? (
              <div className="results-card results-card--highlight">
                <h4 className="results-card-title">Special Enrollment Period (SEP)</h4>
                <p className="results-card-desc">
                  Based on your planned coverage end date, your 8-month signup window runs from <strong>{results.sepStartMonthName} {results.sepStartYear}</strong> to <strong>{results.sepEndMonthName} {results.sepEndYear}</strong>.
                </p>
                <p className="results-note">
                  Enroll during this window to avoid any late enrollment penalty. Remember: COBRA and retiree health insurance do NOT count as active employment coverage and will not protect you from penalties if you delay past 65.
                </p>
              </div>
            ) : (
              <div className="results-card">
                <h4 className="results-card-title">General Enrollment Period (GEP)</h4>
                <p className="results-card-desc">
                  If you miss your IEP window, you must wait until the General Enrollment Period, which runs from <strong>January 1 to March 31, {results.gepNextYear}</strong>.
                </p>
                <p className="results-note">
                  <strong>Warning:</strong> Enrolling during the GEP can delay your coverage and add a permanent 10% premium penalty for each full 12-month delay.
                </p>
              </div>
            )}
          </div>
          
          <div className="results-action-box">
            <h4>Next Steps to Take:</h4>
            <ol>
              <li>If signing up now, visit <a href="https://www.ssa.gov/medicare" target="_blank" rel="noopener noreferrer">ssa.gov/medicare</a> to file your application online. It typically takes less than 10 minutes.</li>
              <li>If you are delaying Part B, request a <em>Letter of Creditable Coverage</em> from your current employer's HR department to keep in your permanent financial records.</li>
              <li>Use our <a href="/tools/medicare-late-enrollment-penalty-calculator/">Late Enrollment Penalty Calculator</a> to estimate penalty amounts if you have already missed your signup window.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
