import React, { useState } from 'react';
import { DateInput } from './DateInput';
import { ResultsPanel } from './ResultsPanel';

/**
 * SocialSecurityFullRetirementAgeCalculator.tsx
 * Interactive React component calculating FRA based on year of birth.
 * Follows exact Social Security Administration laws.
 * WCAG 2.2 AA compliant.
 */

interface FRADetails {
  ageYears: number;
  ageMonths: number;
  payoutAt62: number; // percentage
  payoutAt70: number; // percentage
  targetDateStr: string;
}

export const SocialSecurityFullRetirementAgeCalculator: React.FC = () => {
  const [birthMonth, setBirthMonth] = useState<number>(0);
  const [birthYear, setBirthYear] = useState<number>(0);
  const [results, setResults] = useState<FRADetails | null>(null);
  const [error, setError] = useState<string>('');

  const calculateFRA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!birthMonth || !birthYear) {
      setError('Please select both your birth month and birth year.');
      setResults(null);
      return;
    }

    let ageYears = 67;
    let ageMonths = 0;
    let payoutAt62 = 70; // 30% permanent reduction if FRA is 67
    let payoutAt70 = 124; // 24% permanent increase (8% per year past 67)

    // SSA Rules based on birth year
    if (birthYear <= 1937) {
      ageYears = 65;
      ageMonths = 0;
      payoutAt62 = 80;
      payoutAt70 = 140; // 8% per year past 65 = 5 years * 8% = 40%
    } else if (birthYear === 1938) {
      ageYears = 65;
      ageMonths = 2;
      payoutAt62 = 79.17;
      payoutAt70 = 138.67;
    } else if (birthYear === 1939) {
      ageYears = 65;
      ageMonths = 4;
      payoutAt62 = 78.33;
      payoutAt70 = 137.33;
    } else if (birthYear === 1940) {
      ageYears = 65;
      ageMonths = 6;
      payoutAt62 = 77.5;
      payoutAt70 = 136;
    } else if (birthYear === 1941) {
      ageYears = 65;
      ageMonths = 8;
      payoutAt62 = 76.67;
      payoutAt70 = 134.67;
    } else if (birthYear === 1942) {
      ageYears = 65;
      ageMonths = 10;
      payoutAt62 = 75.83;
      payoutAt70 = 133.33;
    } else if (birthYear >= 1943 && birthYear <= 1954) {
      ageYears = 66;
      ageMonths = 0;
      payoutAt62 = 75; // 25% reduction
      payoutAt70 = 132; // 4 years * 8% = 32% increase
    } else if (birthYear === 1955) {
      ageYears = 66;
      ageMonths = 2;
      payoutAt62 = 74.17;
      payoutAt70 = 130.67;
    } else if (birthYear === 1956) {
      ageYears = 66;
      ageMonths = 4;
      payoutAt62 = 73.33;
      payoutAt70 = 129.33;
    } else if (birthYear === 1957) {
      ageYears = 66;
      ageMonths = 6;
      payoutAt62 = 72.5;
      payoutAt70 = 128;
    } else if (birthYear === 1958) {
      ageYears = 66;
      ageMonths = 8;
      payoutAt62 = 71.67;
      payoutAt70 = 126.67;
    } else if (birthYear === 1959) {
      ageYears = 66;
      ageMonths = 10;
      payoutAt62 = 70.83;
      payoutAt70 = 125.33;
    } else {
      // 1960 or later
      ageYears = 67;
      ageMonths = 0;
      payoutAt62 = 70; // 30% reduction
      payoutAt70 = 124; // 3 years * 8% = 24% increase
    }

    // Calculate month and year of reaching FRA
    // Month is 0-indexed in JS Date constructor (birthMonth - 1)
    const birthDate = new Date(birthYear, birthMonth - 1, 1);
    const targetDate = new Date(birthDate);
    targetDate.setFullYear(birthDate.getFullYear() + ageYears);
    targetDate.setMonth(birthDate.getMonth() + ageMonths);

    const targetDateStr = targetDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });

    setResults({
      ageYears,
      ageMonths,
      payoutAt62,
      payoutAt70,
      targetDateStr,
    });
  };

  return (
    <div className="fra-calculator-wrapper">
      <form onSubmit={calculateFRA} className="calc-form">
        <DateInput
          id="birth-date"
          legend="Select Your Month and Year of Birth"
          birthMonth={birthMonth}
          birthYear={birthYear}
          onMonthChange={setBirthMonth}
          onYearChange={setBirthYear}
          helpText="Your birth date determines your official retirement age under Social Security Administration guidelines."
          error={error}
        />

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate Retirement Age
        </button>
      </form>

      {results && (
        <ResultsPanel
          title="Your Retirement Age Details"
          primaryLabel="Your Full Retirement Age"
          primaryValue={`${results.ageYears} Years ${results.ageMonths > 0 ? `and ${results.ageMonths} Months` : ''}`}
        >
          <div className="fra-results-details">
            <p>
              You will reach your Full Retirement Age in <strong>{results.targetDateStr}</strong>. At this point, you will be eligible for 100% of your primary Social Security benefit.
            </p>
            
            <div className="fra-comparison-table-wrapper">
              <h4 className="fra-table-title">Claiming Age Payout Comparison</h4>
              <table className="fra-comparison-table">
                <thead>
                  <tr>
                    <th>Claiming Age</th>
                    <th>Payout Percentage</th>
                    <th>Payout Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Age 62</strong> (Early Claim)</td>
                    <td>{results.payoutAt62}%</td>
                    <td>Permanently Reduced</td>
                  </tr>
                  <tr>
                    <td><strong>FRA</strong> (Normal Claim)</td>
                    <td><strong>100%</strong></td>
                    <td>Full Benefit</td>
                  </tr>
                  <tr>
                    <td><strong>Age 70</strong> (Delayed Claim)</td>
                    <td>{results.payoutAt70}%</td>
                    <td>Permanently Increased</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="fra-footnote">
              * Note: The percentage figures represent the amount of your primary insurance amount (PIA) you receive. Delayed credits cease accumulating at age 70.
            </p>
          </div>
        </ResultsPanel>
      )}
    </div>
  );
};
