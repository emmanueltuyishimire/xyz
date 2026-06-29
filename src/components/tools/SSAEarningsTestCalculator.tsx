import React, { useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { ResultsPanel } from './ResultsPanel';

/**
 * SSAEarningsTestCalculator.tsx
 * Social Security Retirement Earnings Test Calculator.
 * Source: SSA.gov — retirement earnings test exempt amounts.
 * 2026 thresholds — updated annually.
 */

// 2026 SSA Earnings Test Limits
const BELOW_FRA_EXEMPT = 22320;   // Annual exempt amount if below FRA all year
const FRA_YEAR_EXEMPT  = 59520;   // Annual exempt amount in the year you reach FRA
const BELOW_FRA_RATE   = 2;       // $1 withheld per $2 over exempt amount
const FRA_YEAR_RATE    = 3;       // $1 withheld per $3 over exempt amount

interface EarningsTestResult {
  annualWithheld: number;
  monthlyWithheld: number;
  monthsBenefitStopped: number;
  exempt: number;
  scenario: 'below-fra' | 'fra-year' | 'no-test';
}

export const SSAEarningsTestCalculator: React.FC = () => {
  const [annualEarnings, setAnnualEarnings] = useState<number | ''>('');
  const [scenario, setScenario] = useState<'below-fra' | 'fra-year' | 'after-fra'>('below-fra');
  const [estimatedBenefit, setEstimatedBenefit] = useState<number | ''>('');
  const [result, setResult] = useState<EarningsTestResult | null>(null);
  const [errors, setErrors] = useState<{ earnings?: string; benefit?: string }>({});

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { earnings?: string; benefit?: string } = {};

    if (annualEarnings === '' || Number(annualEarnings) < 0) {
      newErrors.earnings = 'Enter your annual gross employment earnings (wages or self-employment income).';
    }
    if (estimatedBenefit === '' || Number(estimatedBenefit) <= 0) {
      newErrors.benefit = 'Enter your estimated monthly Social Security benefit amount.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setResult(null);
      return;
    }

    setErrors({});

    if (scenario === 'after-fra') {
      setResult({ annualWithheld: 0, monthlyWithheld: 0, monthsBenefitStopped: 0, exempt: 0, scenario: 'no-test' });
      return;
    }

    const earnings = Number(annualEarnings);
    const benefit = Number(estimatedBenefit);
    const exempt = scenario === 'fra-year' ? FRA_YEAR_EXEMPT : BELOW_FRA_EXEMPT;
    const rate = scenario === 'fra-year' ? FRA_YEAR_RATE : BELOW_FRA_RATE;

    const excess = Math.max(0, earnings - exempt);
    const annualWithheld = Math.floor(excess / rate);
    const monthlyWithheld = annualWithheld / 12;
    const monthsBenefitStopped = benefit > 0 ? Math.min(12, Math.ceil(annualWithheld / benefit)) : 0;

    setResult({
      annualWithheld,
      monthlyWithheld,
      monthsBenefitStopped,
      exempt,
      scenario,
    });
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="earnings-test-wrapper">
      <form onSubmit={calculate} className="calc-form">
        <div className="calc-field-group">
          <label htmlFor="retirement-scenario" className="calc-label">
            Your Retirement Status This Year
          </label>
          <select
            id="retirement-scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value as typeof scenario)}
            className="calc-select"
          >
            <option value="below-fra">I am below my Full Retirement Age (FRA) all year</option>
            <option value="fra-year">I will reach my FRA sometime during this year</option>
            <option value="after-fra">I have already passed my FRA</option>
          </select>
        </div>

        {scenario !== 'after-fra' && (
          <>
            <MoneyInput
              id="annual-earnings"
              label="Annual Employment or Self-Employment Earnings"
              value={annualEarnings}
              onChange={(val) => setAnnualEarnings(val === '' ? '' : Number(val))}
              helpText="Enter gross wages or net self-employment income. Investment income, pensions, and rental income do NOT count."
              error={errors.earnings}
              min={0}
              required
            />

            <MoneyInput
              id="monthly-benefit"
              label="Your Estimated Monthly Social Security Benefit"
              value={estimatedBenefit}
              onChange={(val) => setEstimatedBenefit(val === '' ? '' : Number(val))}
              helpText="Find this on your SSA.gov My Social Security account statement."
              error={errors.benefit}
              min={1}
              required
            />
          </>
        )}

        <button type="submit" className="btn btn--primary calc-submit-button">
          Calculate Earnings Test
        </button>
      </form>

      {result && (
        <ResultsPanel
          title="Earnings Test Result"
          primaryLabel={result.scenario === 'no-test' ? 'Earnings Test' : 'Annual Benefits Withheld'}
          primaryValue={result.scenario === 'no-test' ? 'Does Not Apply' : formatCurrency(result.annualWithheld)}
          variant={result.annualWithheld > 0 ? 'warning' : 'success'}
        >
          <div style={{ maxWidth: '100%' }}>
            {result.scenario === 'no-test' ? (
              <p>✅ After reaching Full Retirement Age, there is <strong>no earnings test</strong>. You can earn any amount without any benefit being withheld.</p>
            ) : result.annualWithheld === 0 ? (
              <p>✅ Your earnings of <strong>{formatCurrency(Number(annualEarnings))}</strong> are below the annual exempt amount of <strong>{formatCurrency(result.exempt)}</strong>. No benefits will be withheld.</p>
            ) : (
              <div>
                <p>Your earnings exceed the annual exempt amount of <strong>{formatCurrency(result.exempt)}</strong>. Approximately <strong>{formatCurrency(result.annualWithheld)}</strong> in benefits ({formatCurrency(result.monthlyWithheld)}/month) will be withheld this year.</p>
                <p>This is roughly equivalent to about <strong>{result.monthsBenefitStopped} month{result.monthsBenefitStopped !== 1 ? 's' : ''}</strong> of your benefit being stopped.</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '100%', marginTop: 'var(--space-2)' }}>
                  💡 <strong>Good News:</strong> Withheld amounts are not lost. Once you reach Full Retirement Age, the SSA recalculates your benefit upward to account for the months it was withheld.
                </p>
              </div>
            )}
          </div>
        </ResultsPanel>
      )}
    </div>
  );
};
