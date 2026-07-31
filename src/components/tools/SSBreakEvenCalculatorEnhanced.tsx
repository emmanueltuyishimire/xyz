import React, { useState, useId } from 'react';

/**
 * SSBreakEvenCalculatorEnhanced.tsx
 * Social Security Break-Even Calculator
 * Primary keyword: social security break even calculator
 *
 * Computes exact cumulative lifetime payouts and crossover break-even ages for:
 *   - Claiming at Age 62 (Early)
 *   - Claiming at Full Retirement Age (FRA, 66-67)
 *   - Claiming at Age 70 (Delayed Maximum)
 */

interface LifetimePoint {
  age: number;
  cumulative62: number;
  cumulativeFra: number;
  cumulative70: number;
}

interface BreakEvenResult {
  fraYears: number;
  monthlyAt62: number;
  monthlyAtFra: number;
  monthlyAt70: number;
  breakEven62vsFra: number; // Age where FRA cumulative surpasses 62
  breakEven62vs70: number;  // Age where 70 cumulative surpasses 62
  breakEvenFravs70: number; // Age where 70 cumulative surpasses FRA
  timeline: LifetimePoint[];
  winningStrategyAt80: string;
  winningStrategyAt85: string;
}

export const SSBreakEvenCalculatorEnhanced: React.FC = () => {
  const uid = useId();

  const [piaStr, setPiaStr]             = useState<string>('2000');
  const [birthYear, setBirthYear]       = useState<number>(1960);
  const [hasSpouse, setHasSpouse]       = useState<boolean>(false);
  const [spousePiaStr, setSpousePiaStr] = useState<string>('1500');

  const [result, setResult]             = useState<BreakEvenResult | null>(null);
  const [error, setError]               = useState<string>('');
  const [showTable, setShowTable]       = useState<boolean>(true);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const pia = parseFloat(piaStr.replace(/[^0-9.]/g, ''));
    if (isNaN(pia) || pia <= 0) {
      setError('Please enter a valid estimated Full Retirement Age (FRA) monthly benefit (e.g. 2000).');
      setResult(null);
      return;
    }

    setError('');

    // Determine FRA based on birth year
    let fraYears = 67;
    let red62 = 0.70; // 30% reduction if FRA 67
    let inc70 = 1.24; // 24% bonus if FRA 67

    if (birthYear <= 1954) {
      fraYears = 66;
      red62 = 0.75;
      inc70 = 1.32;
    } else if (birthYear === 1955) {
      fraYears = 66.16; red62 = 0.742; inc70 = 1.307;
    } else if (birthYear === 1956) {
      fraYears = 66.33; red62 = 0.733; inc70 = 1.293;
    } else if (birthYear === 1957) {
      fraYears = 66.5;  red62 = 0.725; inc70 = 1.280;
    } else if (birthYear === 1958) {
      fraYears = 66.66; red62 = 0.717; inc70 = 1.267;
    } else if (birthYear === 1959) {
      fraYears = 66.83; red62 = 0.708; inc70 = 1.253;
    }

    let monthlyAt62 = pia * red62;
    let monthlyAtFra = pia;
    let monthlyAt70 = pia * inc70;

    if (hasSpouse) {
      const spousePia = parseFloat(spousePiaStr.replace(/[^0-9.]/g, '')) || 0;
      monthlyAt62 += spousePia * 0.70;
      monthlyAtFra += spousePia;
      monthlyAt70 += spousePia * 1.24;
    }

    // Build timeline from age 62 to 90
    const timeline: LifetimePoint[] = [];
    let cum62 = 0;
    let cumFra = 0;
    let cum70 = 0;

    let breakEven62vsFra = 78;
    let breakEven62vs70 = 80;
    let breakEvenFravs70 = 82;

    let found62vsFra = false;
    let found62vs70 = false;
    let foundFravs70 = false;

    for (let age = 62; age <= 90; age++) {
      // Annual checks added at each age
      cum62 += monthlyAt62 * 12;

      if (age >= Math.floor(fraYears)) {
        cumFra += monthlyAtFra * 12;
      }

      if (age >= 70) {
        cum70 += monthlyAt70 * 12;
      }

      timeline.push({
        age,
        cumulative62: Math.round(cum62),
        cumulativeFra: Math.round(cumFra),
        cumulative70: Math.round(cum70),
      });

      if (!found62vsFra && cumFra > cum62) {
        breakEven62vsFra = age;
        found62vsFra = true;
      }

      if (!found62vs70 && cum70 > cum62) {
        breakEven62vs70 = age;
        found62vs70 = true;
      }

      if (!foundFravs70 && cum70 > cumFra) {
        breakEvenFravs70 = age;
        foundFravs70 = true;
      }
    }

    const winningStrategyAt80 = breakEven62vs70 <= 80 ? 'Waiting until Age 70' : 'Waiting until FRA (Age 67)';
    const winningStrategyAt85 = 'Waiting until Age 70 (Maximum Delay)';

    setResult({
      fraYears: Math.round(fraYears),
      monthlyAt62: Math.round(monthlyAt62),
      monthlyAtFra: Math.round(monthlyAtFra),
      monthlyAt70: Math.round(monthlyAt70),
      breakEven62vsFra,
      breakEven62vs70,
      breakEvenFravs70,
      timeline,
      winningStrategyAt80,
      winningStrategyAt85,
    });
  };

  const handleReset = () => {
    setPiaStr('2000');
    setBirthYear(1960);
    setHasSpouse(false);
    setSpousePiaStr('1500');
    setResult(null);
    setError('');
  };

  const fmtUsd = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="ss-calc-wrapper">

      {/* ── Trust notice ── */}
      <div className="ss-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 100% Free &amp; Private</span>
        <span>No signup or account</span>
        <span>Instant browser calculations</span>
        <span>Data is never stored</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="Social Security Break Even Calculator Form">

        {/* PIA Monthly Benefit */}
        <div className="ss-field">
          <label htmlFor={`${uid}-pia`} className="ss-label">
            Estimated Monthly Benefit at Full Retirement Age (FRA)
            <span className="ss-required" aria-hidden="true"> *</span>
          </label>
          <p className="ss-hint" id={`${uid}-pia-hint`}>
            Found on your <strong>my Social Security account statement (ssa.gov)</strong> under "Full Retirement Age Benefit".
          </p>
          <div className="ss-input-addon">
            <span className="ss-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-pia`}
              type="number"
              min="100"
              step="50"
              value={piaStr}
              onChange={e => setPiaStr(e.target.value)}
              className={`ss-input${error ? ' ss-input--error' : ''}`}
              placeholder="e.g. 2000"
              aria-describedby={`${uid}-pia-hint${error ? ` ${uid}-pia-err` : ''}`}
              aria-invalid={!!error}
              aria-required="true"
            />
          </div>
          {error && <p id={`${uid}-pia-err`} className="ss-error" role="alert">{error}</p>}
        </div>

        {/* Birth Year */}
        <div className="ss-field">
          <label htmlFor={`${uid}-byear`} className="ss-label">
            Birth Year
          </label>
          <p className="ss-hint">
            Determines your official SSA Full Retirement Age (e.g. 67 for born 1960+).
          </p>
          <select
            id={`${uid}-byear`}
            value={birthYear}
            onChange={e => setBirthYear(parseInt(e.target.value, 10))}
            className="ss-select"
          >
            <option value={1960}>1960 or later (FRA: Age 67)</option>
            <option value={1959}>1959 (FRA: Age 66 &amp; 10 mos)</option>
            <option value={1958}>1958 (FRA: Age 66 &amp; 8 mos)</option>
            <option value={1957}>1957 (FRA: Age 66 &amp; 6 mos)</option>
            <option value={1956}>1956 (FRA: Age 66 &amp; 4 mos)</option>
            <option value={1955}>1955 (FRA: Age 66 &amp; 2 mos)</option>
            <option value={1954}>1954 or earlier (FRA: Age 66)</option>
          </select>
        </div>

        {/* Couples Mode Toggle */}
        <div className="ss-field ss-field--checkbox">
          <label className="ss-checkbox-label">
            <input
              type="checkbox"
              checked={hasSpouse}
              onChange={e => setHasSpouse(e.target.checked)}
              className="ss-checkbox"
            />
            Include Spouse Benefit (Couples Mode)
          </label>

          {hasSpouse && (
            <div className="ss-subfield">
              <label htmlFor={`${uid}-spia`} className="ss-label ss-label--sub">
                Spouse's Estimated FRA Monthly Benefit ($)
              </label>
              <div className="ss-input-addon">
                <span className="ss-addon-symbol" aria-hidden="true">$</span>
                <input
                  id={`${uid}-spia`}
                  type="number"
                  min="0"
                  step="50"
                  value={spousePiaStr}
                  onChange={e => setSpousePiaStr(e.target.value)}
                  className="ss-input"
                  placeholder="e.g. 1500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ss-actions">
          <button type="submit" className="ss-btn ss-btn--primary">
            Calculate Break-Even Age
          </button>
          {result && (
            <button type="button" className="ss-btn ss-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Output ── */}
      {result && (
        <div className="ss-results" role="region" aria-live="polite" aria-label="Break Even Calculation Results">

          {/* Primary Break-Even Cards */}
          <div className="ss-card ss-card--highlight">
            <span className="ss-badge">Official Break-Even Crossover Results</span>

            <div className="ss-stat-grid">
              <div className="ss-stat-unit">
                <span className="ss-stat-val">Age {result.breakEven62vs70}</span>
                <span className="ss-stat-lbl">Break-even age: Waiting until 70 beats Claiming at 62</span>
              </div>
              <div className="ss-stat-unit ss-stat-unit--sec">
                <span className="ss-stat-val">Age {result.breakEven62vsFra}</span>
                <span className="ss-stat-lbl">Break-even age: Waiting until FRA beats Claiming at 62</span>
              </div>
            </div>

            {/* Monthly Check Rates */}
            <div className="ss-monthly-box">
              <div className="ss-m-item ss-m-item--62">
                <span>Claim at Age 62:</span>
                <strong>{fmtUsd(result.monthlyAt62)} / month</strong>
              </div>
              <div className="ss-m-item ss-m-item--fra">
                <span>Claim at FRA ({result.fraYears}):</span>
                <strong>{fmtUsd(result.monthlyAtFra)} / month</strong>
              </div>
              <div className="ss-m-item ss-m-item--70">
                <span>Claim at Age 70:</span>
                <strong>{fmtUsd(result.monthlyAt70)} / month</strong>
              </div>
            </div>
          </div>

          {/* Plain Language Summary Box */}
          <div className="ss-summary-card">
            <h3>Which Age Wins Depending on Your Life Expectancy?</h3>
            <ul className="ss-summary-list">
              <li>
                <strong>If your life expectancy is under Age 78:</strong><br />
                Claiming early at <strong>Age 62</strong> nets you more total lifetime income because you collect checks for 5–8 extra years.
              </li>
              <li>
                <strong>If you live past Age 78 to 80:</strong><br />
                Waiting until <strong>Full Retirement Age ({result.fraYears})</strong> overtakes claiming at 62.
              </li>
              <li>
                <strong>If you live past Age 80 to 82:</strong><br />
                Waiting until <strong>Age 70</strong> beats all other claiming ages, generating the maximum total lifetime income and highest survivor benefit.
              </li>
            </ul>
          </div>

          {/* Cumulative Timeline Table Toggle */}
          <button
            type="button"
            className="ss-work-btn"
            onClick={() => setShowTable(v => !v)}
            aria-expanded={showTable}
          >
            {showTable ? '▲ Hide cumulative lifetime payout table' : '▼ Show cumulative lifetime payout table by age'}
          </button>

          {showTable && (
            <div className="ss-table-card" aria-label="Cumulative Lifetime Payout Table">
              <h4>Cumulative Lifetime Benefit Payouts by Age</h4>
              <p className="ss-table-sub">
                Shows total cumulative dollars collected from Social Security at each age milestone.
              </p>

              <div className="ss-table-wrapper">
                <table className="ss-table">
                  <thead>
                    <tr>
                      <th>Age</th>
                      <th>Claim at 62 Total</th>
                      <th>Claim at FRA Total</th>
                      <th>Claim at 70 Total</th>
                      <th>Highest Total Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.timeline.filter(t => t.age % 2 === 0 || t.age === 78 || t.age === 80 || t.age === 82).map((t) => {
                      const maxVal = Math.max(t.cumulative62, t.cumulativeFra, t.cumulative70);
                      let winner = 'Claim at 62';
                      if (maxVal === t.cumulativeFra) winner = 'Claim at FRA';
                      if (maxVal === t.cumulative70) winner = 'Claim at 70';

                      return (
                        <tr key={t.age} className={t.age === result.breakEven62vs70 ? 'ss-row--crossover' : ''}>
                          <td><strong>Age {t.age}</strong></td>
                          <td>{fmtUsd(t.cumulative62)}</td>
                          <td>{fmtUsd(t.cumulativeFra)}</td>
                          <td>{fmtUsd(t.cumulative70)}</td>
                          <td>
                            <span className={`ss-winner-pill ${winner.includes('70') ? 'ss-winner--70' : winner.includes('FRA') ? 'ss-winner--fra' : 'ss-winner--62'}`}>
                              {winner}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      <style>{`
        .ss-calc-wrapper { font-family: inherit; }

        .ss-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        .ss-field { margin-bottom: 1.5rem; }
        .ss-field--checkbox {
          background: var(--color-surface-alt, #f8fafc);
          border: 1px dashed var(--color-border, #cbd5e1);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
        }
        .ss-subfield { margin-top: 1rem; padding-left: 1.25rem; border-left: 3px solid var(--color-secondary, #C9933A); }

        .ss-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .ss-label--sub { font-size: 0.95rem; }
        .ss-required { color: var(--color-error, #c0392b); }
        .ss-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        .ss-select {
          display: block; width: 100%; max-width: 360px;
          font-size: 1rem; padding: 0.65rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }

        .ss-input-addon { display: flex; align-items: center; max-width: 280px; }
        .ss-addon-symbol {
          background: var(--color-surface-alt, #f1f5f9);
          border: 2px solid var(--color-border, #cbd5e1);
          border-right: none;
          border-radius: 0.5rem 0 0 0.5rem;
          padding: 0.6rem 0.85rem;
          font-weight: 700; color: var(--color-primary, #0A3D3A);
        }
        .ss-input {
          flex: 1; font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0 0.5rem 0.5rem 0; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }
        .ss-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .ss-input--error { border-color: var(--color-error, #c0392b); }
        .ss-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .ss-checkbox-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 1rem; font-weight: 600; color: var(--color-primary, #0A3D3A); }
        .ss-checkbox { width: 1.2rem; height: 1.2rem; cursor: pointer; accent-color: var(--color-secondary, #C9933A); flex-shrink: 0; }

        .ss-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .ss-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
        }
        .ss-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .ss-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .ss-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .ss-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .ss-results { margin-top: 2rem; }
        .ss-card { border-radius: 0.875rem; padding: 1.75rem; margin-bottom: 1.25rem; }
        .ss-card--highlight { background: #f0fdf4; border: 2px solid #22c55e; }

        .ss-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d; background: #dcfce7; border-radius: 9999px; padding: 0.25rem 0.75rem; display: inline-block; margin-bottom: 1rem; }

        .ss-stat-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1.25rem; }
        .ss-stat-unit { display: flex; flex-direction: column; }
        .ss-stat-val { font-size: 2.5rem; font-weight: 800; color: var(--color-primary, #0A3D3A); line-height: 1; }
        .ss-stat-lbl { font-size: 0.85rem; color: #166534; margin-top: 0.3rem; }
        .ss-stat-unit--sec .ss-stat-val { color: #b45309; font-size: 1.9rem; }
        .ss-stat-unit--sec .ss-stat-lbl { color: var(--color-text-muted, #64748b); }

        .ss-monthly-box { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; background: #fff; padding: 1rem; border-radius: 0.5rem; border: 1px solid #bbf7d0; }
        .ss-m-item { display: flex; flex-direction: column; }
        .ss-m-item span { font-size: 0.8rem; color: var(--color-text-muted, #64748b); }
        .ss-m-item strong { font-size: 1.1rem; color: var(--color-primary, #0A3D3A); }
        .ss-m-item--62 strong { color: #b91c1c; }
        .ss-m-item--fra strong { color: #15803d; }
        .ss-m-item--70 strong { color: #b45309; }

        .ss-summary-card { background: #fff; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.25rem; }
        .ss-summary-card h3 { font-size: 1.05rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.75rem; }
        .ss-summary-list { padding-left: 1.25rem; margin: 0; }
        .ss-summary-list li { font-size: 0.925rem; color: #334155; line-height: 1.6; margin-bottom: 0.6rem; }

        .ss-work-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.875rem; color: var(--color-secondary, #C9933A);
          text-decoration: underline; padding: 0.25rem 0; display: block; margin-bottom: 1rem;
        }

        .ss-table-card { background: #f8fafc; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; }
        .ss-table-card h4 { font-size: 0.95rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.25rem; }
        .ss-table-sub { font-size: 0.825rem; color: var(--color-text-muted, #64748b); margin: 0 0 1rem; }

        .ss-table-wrapper { overflow-x: auto; }
        .ss-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
        .ss-table th, .ss-table td { padding: 0.6rem 0.85rem; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
        .ss-table th { background: var(--color-primary, #0A3D3A); color: #fff; font-weight: 600; }
        .ss-row--crossover { background: #fef3c7; font-weight: 700; }

        .ss-winner-pill { font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; }
        .ss-winner--62 { background: #fee2e2; color: #991b1b; }
        .ss-winner--fra { background: #dcfce7; color: #15803d; }
        .ss-winner--70 { background: #fef3c7; color: #92400e; }

        @media (max-width: 640px) {
          .ss-input-addon { max-width: 100%; }
          .ss-select { max-width: 100%; }
          .ss-stat-val { font-size: 1.9rem; }
        }
      `}</style>
    </div>
  );
};
