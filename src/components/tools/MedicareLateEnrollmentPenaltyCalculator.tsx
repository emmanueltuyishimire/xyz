import React, { useState } from 'react';
import { ResultsPanel } from './ResultsPanel';

/**
 * MedicareLateEnrollmentPenaltyCalculator.tsx
 * Calculates Part B and Part D late enrollment penalties.
 * Based on official CMS/Medicare.gov formula.
 */

interface PenaltyResult {
  partBPenaltyPercent: number;
  partBMonthlyAdded: number;
  partBYearlyAdded: number;
  partDPenaltyPercent: number;
  partDMonthlyAdded: number;
  partDYearlyAdded: number;
}

// 2026 Standard Premiums
const STANDARD_PART_B_PREMIUM = 202.90;
const NATIONAL_BASE_PART_D_PREMIUM = 36.78; // Published annually by CMS

export const MedicareLateEnrollmentPenaltyCalculator: React.FC = () => {
  const [lateMonthsB, setLateMonthsB] = useState<number | ''>('');
  const [lateMonthsD, setLateMonthsD] = useState<number | ''>('');
  const [calcPartB, setCalcPartB] = useState(true);
  const [calcPartD, setCalcPartD] = useState(false);
  const [result, setResult] = useState<PenaltyResult | null>(null);
  const [errors, setErrors] = useState<{ partB?: string; partD?: string }>({});

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { partB?: string; partD?: string } = {};

    if (calcPartB && (lateMonthsB === '' || Number(lateMonthsB) < 0)) {
      newErrors.partB = 'Enter the number of months you were without Part B coverage (0 or more).';
    }
    if (calcPartD && (lateMonthsD === '' || Number(lateMonthsD) < 0)) {
      newErrors.partD = 'Enter the number of months you were without Part D (creditable drug) coverage (0 or more).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResult(null);
      return;
    }

    setErrors({});

    // Part B: 10% per each full 12-month period you lacked coverage
    // Must be enrolled in an employer plan or other approved coverage to avoid penalty
    const bMonths = Number(lateMonthsB) || 0;
    const bFullYears = Math.floor(bMonths / 12);
    const partBPenaltyPercent = bFullYears * 10;
    const partBMonthlyAdded = (partBPenaltyPercent / 100) * STANDARD_PART_B_PREMIUM;

    // Part D: 1% of national base beneficiary premium per month without creditable coverage
    const dMonths = Number(lateMonthsD) || 0;
    const partDPenaltyPercent = dMonths * 1; // 1% per month
    const partDMonthlyAdded = (partDPenaltyPercent / 100) * NATIONAL_BASE_PART_D_PREMIUM;

    setResult({
      partBPenaltyPercent,
      partBMonthlyAdded,
      partBYearlyAdded: partBMonthlyAdded * 12,
      partDPenaltyPercent,
      partDMonthlyAdded,
      partDYearlyAdded: partDMonthlyAdded * 12,
    });
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const hasPenalty = result && (result.partBMonthlyAdded > 0 || result.partDMonthlyAdded > 0);

  return (
    <div className="penalty-calculator-wrapper">
      <form onSubmit={calculate} className="calc-form">
        {/* Part B Toggle */}
        <div className="calc-field-group">
          <label className="calc-label checkbox-label">
            <input
              type="checkbox"
              checked={calcPartB}
              onChange={(e) => setCalcPartB(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Calculate Part B (Medical Insurance) Penalty
          </label>
        </div>

        {calcPartB && (
          <div className="calc-field-group" style={{ paddingLeft: '1rem' }}>
            <label htmlFor="late-months-b" className="calc-label">
              Months Late Enrolling in Part B
            </label>
            <p className="calc-help-text">
              Count how many full months you could have had Part B but chose not to enroll (not counting any months you had employer-sponsored coverage).
            </p>
            <input
              id="late-months-b"
              type="number"
              min={0}
              max={600}
              value={lateMonthsB}
              onChange={(e) => setLateMonthsB(e.target.value === '' ? '' : Number(e.target.value))}
              className="calc-input"
              placeholder="Enter months late (e.g., 24)"
            />
            {errors.partB && <p className="calc-error-message" role="alert"><strong>Error:</strong> {errors.partB}</p>}
          </div>
        )}

        {/* Part D Toggle */}
        <div className="calc-field-group">
          <label className="calc-label checkbox-label">
            <input
              type="checkbox"
              checked={calcPartD}
              onChange={(e) => setCalcPartD(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Calculate Part D (Drug Coverage) Penalty
          </label>
        </div>

        {calcPartD && (
          <div className="calc-field-group" style={{ paddingLeft: '1rem' }}>
            <label htmlFor="late-months-d" className="calc-label">
              Months Without Creditable Drug Coverage
            </label>
            <p className="calc-help-text">
              Count how many full months you were without Medicare Part D or equivalent employer drug coverage after first becoming eligible.
            </p>
            <input
              id="late-months-d"
              type="number"
              min={0}
              max={600}
              value={lateMonthsD}
              onChange={(e) => setLateMonthsD(e.target.value === '' ? '' : Number(e.target.value))}
              className="calc-input"
              placeholder="Enter months late (e.g., 12)"
            />
            {errors.partD && <p className="calc-error-message" role="alert"><strong>Error:</strong> {errors.partD}</p>}
          </div>
        )}

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate Penalty
        </button>
      </form>

      {result && (
        <ResultsPanel
          title="Your Late Enrollment Penalty Estimate"
          primaryLabel={hasPenalty ? 'Total Monthly Penalty Added' : 'Penalty Status'}
          primaryValue={hasPenalty
            ? formatCurrency(result.partBMonthlyAdded + result.partDMonthlyAdded)
            : 'No Penalty'
          }
          variant={hasPenalty ? 'warning' : 'success'}
        >
          <div className="penalty-results-details">
            {calcPartB && (
              <div className="penalty-section">
                <h4>Part B Penalty</h4>
                <p>
                  Penalty rate: <strong>{result.partBPenaltyPercent}%</strong> of standard premium<br />
                  Added monthly: <strong>{formatCurrency(result.partBMonthlyAdded)}</strong><br />
                  Added yearly: <strong>{formatCurrency(result.partBYearlyAdded)}</strong>
                </p>
                {result.partBPenaltyPercent === 0 && <p>✅ No Part B penalty applies.</p>}
              </div>
            )}

            {calcPartD && (
              <div className="penalty-section">
                <h4>Part D Penalty</h4>
                <p>
                  Penalty rate: <strong>{result.partDPenaltyPercent.toFixed(1)}%</strong> of national base premium ({formatCurrency(NATIONAL_BASE_PART_D_PREMIUM)})<br />
                  Added monthly: <strong>{formatCurrency(result.partDMonthlyAdded)}</strong><br />
                  Added yearly: <strong>{formatCurrency(result.partDYearlyAdded)}</strong>
                </p>
                {result.partDPenaltyPercent === 0 && <p>✅ No Part D penalty applies.</p>}
              </div>
            )}

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: '100%', marginTop: 'var(--space-3)' }}>
              Note: Part B penalties are permanent and rounded to the nearest $0.10. Part D penalties use the CMS national base beneficiary premium ({formatCurrency(NATIONAL_BASE_PART_D_PREMIUM)} in 2026), which changes annually.
            </p>
          </div>
        </ResultsPanel>
      )}

      <style>{`
        .penalty-results-details p { max-width: 100%; margin-bottom: var(--space-3); }
        .penalty-section { margin-bottom: var(--space-4); padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border); }
        .penalty-section:last-child { border-bottom: none; margin-bottom: 0; }
        .penalty-section h4 { font-size: var(--text-base); font-weight: var(--font-bold); color: var(--color-primary); margin: 0 0 var(--space-2) 0; }
        .checkbox-label { display: flex; align-items: center; cursor: pointer; }
      `}</style>
    </div>
  );
};
