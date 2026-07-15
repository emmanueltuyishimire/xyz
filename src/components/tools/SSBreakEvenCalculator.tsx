import React, { useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { ResultsPanel } from './ResultsPanel';

/**
 * SSBreakEvenCalculator.tsx
 * Social Security Claiming Break-Even Age Calculator.
 * Compares two claiming ages and finds the crossover point where
 * delayed claiming produces more total lifetime benefits.
 */

interface BreakEvenResult {
  earlierAge: number;
  laterAge: number;
  earlierMonthlyBenefit: number;
  laterMonthlyBenefit: number;
  breakEvenYears: number;
  breakEvenAge: number;
  totalAt80Earlier: number;
  totalAt80Later: number;
}

export const SSBreakEvenCalculator: React.FC = () => {
  const [fraAge, setFraAge] = useState<number>(67);
  const [fullBenefit, setFullBenefit] = useState<number | ''>('');
  const [claimAgeEarly, setClaimAgeEarly] = useState<number>(62);
  const [claimAgeLate, setClaimAgeLate] = useState<number>(67);
  const [errors, setErrors] = useState<{ benefit?: string; ages?: string }>({});
  const [result, setResult] = useState<BreakEvenResult | null>(null);

  // Reduction/increase factors per SSA rules
  const getMonthlyBenefit = (claimAge: number, fra: number, fullBenefitAmt: number): number => {
    const monthsDiff = (claimAge - fra) * 12;
    if (monthsDiff === 0) return fullBenefitAmt;
    if (monthsDiff < 0) {
      // Early reduction: 5/9 of 1% per month for first 36 months, 5/12 of 1% after
      const earlyMonths = Math.abs(monthsDiff);
      const first36 = Math.min(earlyMonths, 36);
      const beyond36 = Math.max(0, earlyMonths - 36);
      const reductionPct = (first36 * (5 / 9 / 100)) + (beyond36 * (5 / 12 / 100));
      return fullBenefitAmt * (1 - reductionPct);
    }
    // Delayed credits: 8% per year = 2/3 of 1% per month, max at 70
    const delayMonths = Math.min(monthsDiff, (70 - fra) * 12);
    const increasePct = delayMonths * (2 / 3 / 100);
    return fullBenefitAmt * (1 + increasePct);
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { benefit?: string; ages?: string } = {};

    if (fullBenefit === '' || Number(fullBenefit) <= 0) {
      newErrors.benefit = 'Enter your estimated full benefit at FRA (from SSA.gov).';
    }
    if (claimAgeEarly >= claimAgeLate) {
      newErrors.ages = 'The early claiming age must be less than the delayed claiming age.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResult(null);
      return;
    }
    setErrors({});

    const benefit = Number(fullBenefit);
    const earlyMonthly = getMonthlyBenefit(claimAgeEarly, fraAge, benefit);
    const lateMonthly = getMonthlyBenefit(claimAgeLate, fraAge, benefit);

    // Months until the later-claimant "catches up" in total lifetime benefits
    // Total(early) = earlyMonthly * (months since early claim start)
    // Total(late)  = lateMonthly  * (months since late claim start)
    // At break-even: earlyMonthly * t_early = lateMonthly * t_late
    // t_early = t_late + (claimAgeLate - claimAgeEarly) * 12
    // So: earlyMonthly * (t_late + diff) = lateMonthly * t_late
    // => t_late = (earlyMonthly * diff) / (lateMonthly - earlyMonthly)

    const monthsDiff = (claimAgeLate - claimAgeEarly) * 12;
    let breakEvenMonthsAfterLate = Infinity;
    if (lateMonthly > earlyMonthly) {
      breakEvenMonthsAfterLate = (earlyMonthly * monthsDiff) / (lateMonthly - earlyMonthly);
    }

    const breakEvenAge = claimAgeLate + breakEvenMonthsAfterLate / 12;
    const breakEvenYears = breakEvenMonthsAfterLate / 12;

    // Compare totals at age 80
    const monthsAt80Early = (80 - claimAgeEarly) * 12;
    const monthsAt80Late = Math.max(0, (80 - claimAgeLate) * 12);

    setResult({
      earlierAge: claimAgeEarly,
      laterAge: claimAgeLate,
      earlierMonthlyBenefit: earlyMonthly,
      laterMonthlyBenefit: lateMonthly,
      breakEvenYears,
      breakEvenAge,
      totalAt80Earlier: earlyMonthly * monthsAt80Early,
      totalAt80Later: lateMonthly * monthsAt80Late,
    });
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="breakeven-wrapper">
      <form onSubmit={calculate} className="calc-form">
        <div className="calc-field-group">
          <label htmlFor="fra-select" className="calc-label">Your Full Retirement Age (FRA)</label>
          <select id="fra-select" value={fraAge} onChange={(e) => setFraAge(Number(e.target.value))} className="calc-select">
            <option value={66}>Age 66 (Born 1943–1954)</option>
            <option value={66.17}>Age 66 &amp; 2 months (Born 1955)</option>
            <option value={66.33}>Age 66 &amp; 4 months (Born 1956)</option>
            <option value={66.5}>Age 66 &amp; 6 months (Born 1957)</option>
            <option value={66.67}>Age 66 &amp; 8 months (Born 1958)</option>
            <option value={66.83}>Age 66 &amp; 10 months (Born 1959)</option>
            <option value={67}>Age 67 (Born 1960 or later)</option>
          </select>
        </div>

        <MoneyInput
          id="full-benefit"
          label="Your Estimated Full Benefit at FRA (Monthly)"
          value={fullBenefit}
          onChange={(val) => setFullBenefit(val === '' ? '' : Number(val))}
          placeholder="Enter your full benefit (e.g., 2,000)"
          helpText="Find this on your SSA.gov My Social Security statement, or use your FRA from this calculator."
          error={errors.benefit}
          min={1}
          required
        />

        <div className="date-select-grid">
          <div className="date-select-col">
            <label htmlFor="early-age" className="calc-label">Earlier Claiming Age</label>
            <select id="early-age" value={claimAgeEarly} onChange={(e) => setClaimAgeEarly(Number(e.target.value))} className="calc-select">
              {[62,63,64,65,66,67,68,69].map(a => <option key={a} value={a}>Age {a}</option>)}
            </select>
          </div>
          <div className="date-select-col">
            <label htmlFor="late-age" className="calc-label">Later Claiming Age</label>
            <select id="late-age" value={claimAgeLate} onChange={(e) => setClaimAgeLate(Number(e.target.value))} className="calc-select">
              {[63,64,65,66,67,68,69,70].map(a => <option key={a} value={a}>Age {a}</option>)}
            </select>
          </div>
        </div>
        {errors.ages && <p className="calc-error-message" role="alert"><strong>Error:</strong> {errors.ages}</p>}

        <button type="submit" className="btn btn--primary calc-submit-button">
          Find Break-Even Age
        </button>
      </form>

      {result && (
        <ResultsPanel
          title="Break-Even Analysis"
          primaryLabel="Break-Even Age"
          primaryValue={isFinite(result.breakEvenAge)
            ? `Age ${result.breakEvenAge.toFixed(1)}`
            : 'No Break-Even'
          }
          variant="info"
        >
          <div style={{ maxWidth: '100%' }}>
            <p>
              Claiming at <strong>age {result.earlierAge}</strong>: <strong>{formatCurrency(result.earlierMonthlyBenefit)}/month</strong><br />
              Claiming at <strong>age {result.laterAge}</strong>: <strong>{formatCurrency(result.laterMonthlyBenefit)}/month</strong>
            </p>
            {isFinite(result.breakEvenAge) ? (
              <p>
                If you live past age <strong>{result.breakEvenAge.toFixed(1)}</strong> (approximately <strong>{result.breakEvenYears.toFixed(1)} years</strong> after claiming at {result.laterAge}), you will collect more in lifetime total benefits by waiting to claim at age {result.laterAge}.
              </p>
            ) : (
              <p>⚠️ The later claiming age does not produce higher monthly benefits than the earlier age in this scenario. Double-check your FRA selection.</p>
            )}
            <p>
              <strong>Total lifetime benefits by age 80:</strong><br />
              Claiming at {result.earlierAge}: {formatCurrency(result.totalAt80Earlier)}<br />
              Claiming at {result.laterAge}: {formatCurrency(result.totalAt80Later)}
            </p>
          </div>
        </ResultsPanel>
      )}
    </div>
  );
};
