/**
 * SocialSecurityBenefitCapCalculator.tsx
 * Interactive tool: Social Security Benefit Cap Proposal Calculator 2026
 * Shows users how cap proposals, trust fund depletion, and payroll
 * tax changes affect their personal monthly benefit and take-home.
 */

import { useState, useMemo } from 'react';

// ─── 2026 Official SSA Constants ─────────────────────────────────────────────
const TAXABLE_WAGE_BASE   = 184_500;   // SSA: ssa.gov/oact/cola/cbb.html
const BEND_POINT_1        = 1_286;     // SSA: ssa.gov/oact/cola/bendpoints.html
const BEND_POINT_2        = 7_749;
const OASI_DEPLETION_YEAR = 2032;      // SSA Trustees 2026
const DEPLETION_PAY_PCT   = 0.77;      // ~77 cents per $1 at depletion
const SS2100_THRESHOLD    = 400_000;   // Rep. Larson Social Security 2100 Act
const CURRENT_YEAR        = 2026;

// Known 2026 SSA maximum monthly benefits
const MAX_BENEFIT_62  = 2_969;
const MAX_BENEFIT_FRA = 4_152;
const MAX_BENEFIT_70  = 5_181;

type FilingStatus = 'single' | 'mfj';

// ─── Helper: Full Retirement Age by birth year ────────────────────────────────
function getFRA(birthYear: number): number {
  if (birthYear <= 1937) return 65;
  if (birthYear <= 1942) return 65 + (birthYear - 1937) * 2 / 12;
  if (birthYear <= 1954) return 66;
  if (birthYear <= 1959) return 66 + (birthYear - 1954) * 2 / 12;
  return 67;
}

// ─── Helper: PIA from AIME using 2026 bend points ─────────────────────────────
function calcPIA(aime: number): number {
  let pia = 0;
  if (aime <= BEND_POINT_1) {
    pia = aime * 0.90;
  } else if (aime <= BEND_POINT_2) {
    pia = BEND_POINT_1 * 0.90 + (aime - BEND_POINT_1) * 0.32;
  } else {
    pia = BEND_POINT_1 * 0.90 + (BEND_POINT_2 - BEND_POINT_1) * 0.32 + (aime - BEND_POINT_2) * 0.15;
  }
  return Math.round(pia * 10) / 10;
}

// ─── Helper: Monthly benefit at claiming age ──────────────────────────────────
function calcMonthlyBenefit(pia: number, claimAge: number, fra: number): number {
  const monthsFromFRA = Math.round((claimAge - fra) * 12);
  let factor = 1.0;
  if (monthsFromFRA < 0) {
    const early = -monthsFromFRA;
    const first36 = Math.min(early, 36);
    const beyond36 = Math.max(0, early - 36);
    factor = 1 - (first36 * (5 / 900) + beyond36 * (5 / 1200));
  } else if (monthsFromFRA > 0) {
    factor = 1 + monthsFromFRA * (8 / 1200); // 8% per year = 2/3% per month
  }
  return Math.round(pia * factor);
}

// ─── Helper: Format currency ──────────────────────────────────────────────────
function fmt(n: number, decimals = 0): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SocialSecurityBenefitCapCalculator() {
  const [birthYear,    setBirthYear]    = useState<number>(1960);
  const [earnings,     setEarnings]     = useState<number>(65_000);
  const [claimAge,     setClaimAge]     = useState<number>(67);
  const [yearsWorked,  setYearsWorked]  = useState<number>(30);
  const [showResults,  setShowResults]  = useState(false);
  const [activeTab,    setActiveTab]    = useState<'benefit'|'depletion'|'tax'|'compare'>('benefit');

  const calc = useMemo(() => {
    const currentAge  = CURRENT_YEAR - birthYear;
    const fra         = getFRA(birthYear);
    const ageIn2032   = OASI_DEPLETION_YEAR - birthYear;

    // AIME estimation: cap annual earnings at taxable wage base, average over 35 years
    // We use yearsWorked/35 as a weight so shorter careers produce lower AIME
    const cappedAnnual = Math.min(earnings, TAXABLE_WAGE_BASE);
    const aime = Math.round((cappedAnnual / 12) * Math.min(yearsWorked, 35) / 35);

    const pia            = calcPIA(aime);
    const monthlyBenefit = calcMonthlyBenefit(pia, claimAge, fra);
    const annualBenefit  = monthlyBenefit * 12;

    // Cap at known SSA maximums
    const benefitAtFRA   = calcMonthlyBenefit(pia, fra, fra);
    const cappedBenefit  = Math.min(monthlyBenefit, MAX_BENEFIT_70);

    // 2032 Depletion scenario
    const isAlreadyCollecting = claimAge <= ageIn2032 - currentAge + claimAge; // collecting by 2032?
    const willCollectBy2032   = (currentAge + (claimAge - currentAge)) <= ageIn2032 ||
                                 claimAge <= ageIn2032;
    const depletedBenefit     = Math.round(cappedBenefit * DEPLETION_PAY_PCT);
    const monthlyLoss         = cappedBenefit - depletedBenefit;
    const annualLoss          = monthlyLoss * 12;
    const yearsUntilDepletion = Math.max(0, OASI_DEPLETION_YEAR - CURRENT_YEAR); // 6 years

    // ── Payroll Tax Impact ──────────────────────────────────────────────────
    // Current law: 6.2% on earnings up to $184,500
    const currentPayrollTax = Math.min(earnings, TAXABLE_WAGE_BASE) * 0.062;

    // Moreno-Warren: 6.2% on ALL earnings (no ceiling)
    const mwTax        = earnings * 0.062;
    const mwAdditional = Math.max(0, mwTax - currentPayrollTax);

    // Social Security 2100 Act: restart at $400,000+
    const ss2100Earnings = earnings > SS2100_THRESHOLD
      ? (Math.min(earnings, TAXABLE_WAGE_BASE) * 0.062) + ((earnings - SS2100_THRESHOLD) * 0.062)
      : currentPayrollTax;
    const ss2100Additional = Math.max(0, ss2100Earnings - currentPayrollTax);

    // Effective tax rates
    const effectiveCurrentRate = earnings > 0 ? (currentPayrollTax / earnings) * 100 : 0;
    const effectiveMWRate      = earnings > 0 ? (mwTax / earnings) * 100 : 0;

    // Is this person affected by cap proposals?
    const affectedByMW    = earnings > TAXABLE_WAGE_BASE;
    const affectedBySS2100 = earnings > SS2100_THRESHOLD;

    return {
      currentAge, fra, ageIn2032, aime, pia,
      monthlyBenefit: cappedBenefit,
      annualBenefit: cappedBenefit * 12,
      depletedBenefit, monthlyLoss, annualLoss,
      yearsUntilDepletion,
      willCollectBy2032,
      currentPayrollTax, mwTax, mwAdditional,
      ss2100Earnings, ss2100Additional,
      effectiveCurrentRate, effectiveMWRate,
      affectedByMW, affectedBySS2100,
    };
  }, [birthYear, earnings, claimAge, yearsWorked]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    setActiveTab('benefit');
  };

  const tabs = [
    { id: 'benefit',   label: '📊 Your Benefit',       shortLabel: 'Benefit'   },
    { id: 'depletion', label: '⚠️ 2032 Depletion',      shortLabel: '2032 Risk' },
    { id: 'tax',       label: '💰 Payroll Tax Impact',  shortLabel: 'Tax Impact'},
    { id: 'compare',   label: '⚖️ Full Comparison',     shortLabel: 'Compare'   },
  ] as const;

  return (
    <div className="sscap-wrap">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="sscap-header">
        <span className="sscap-badge">2026 · SSA Formula · Official Data</span>
        <h2 className="sscap-title">Social Security Benefit Cap Proposal Calculator</h2>
        <p className="sscap-subtitle">
          Enter your profile below to see your estimated benefit under <strong>current law</strong>,
          the <strong>2032 trust fund depletion</strong> scenario, and how <strong>payroll tax cap proposals</strong> affect what you pay.
        </p>
      </div>

      {/* ── INPUT FORM ──────────────────────────────────────────────────── */}
      <form onSubmit={handleCalculate} className="sscap-form">
        <div className="sscap-form-grid">

          {/* Birth Year */}
          <div className="sscap-field">
            <label className="sscap-label" htmlFor="sscap-birthyear">Your Birth Year</label>
            <input
              id="sscap-birthyear"
              type="number"
              min={1940} max={1970}
              value={birthYear}
              onChange={e => setBirthYear(Number(e.target.value))}
              className="sscap-input"
            />
            <span className="sscap-hint">Age in 2026: <strong>{2026 - birthYear}</strong> · Full Retirement Age: <strong>{getFRA(birthYear) === 67 ? '67' : getFRA(birthYear).toFixed(0) + ' yrs ' + Math.round((getFRA(birthYear) % 1) * 12) + ' mo'}</strong></span>
          </div>

          {/* Annual Earnings */}
          <div className="sscap-field">
            <label className="sscap-label" htmlFor="sscap-earnings">Current Annual Earnings (gross)</label>
            <div className="sscap-input-prefix">
              <span className="sscap-prefix-sym">$</span>
              <input
                id="sscap-earnings"
                type="number"
                min={0} max={2_000_000} step={1000}
                value={earnings}
                onChange={e => setEarnings(Number(e.target.value))}
                className="sscap-input sscap-input-has-prefix"
              />
            </div>
            <span className="sscap-hint">
              {earnings > TAXABLE_WAGE_BASE
                ? `${fmt(earnings - TAXABLE_WAGE_BASE)} above the $184,500 taxable wage base`
                : `Within the $184,500 taxable wage base`}
            </span>
          </div>

          {/* Years Worked */}
          <div className="sscap-field">
            <label className="sscap-label" htmlFor="sscap-years">Total Years of Work History</label>
            <select
              id="sscap-years"
              value={yearsWorked}
              onChange={e => setYearsWorked(Number(e.target.value))}
              className="sscap-select"
            >
              {[10,15,20,25,30,35,40].map(y => (
                <option key={y} value={y}>{y} years{y >= 35 ? ' (maximum credit)' : ''}</option>
              ))}
            </select>
            <span className="sscap-hint">SSA uses your 35 highest-earning years</span>
          </div>

          {/* Planned Claim Age */}
          <div className="sscap-field">
            <label className="sscap-label" htmlFor="sscap-claim">Planned Claiming Age</label>
            <select
              id="sscap-claim"
              value={claimAge}
              onChange={e => setClaimAge(Number(e.target.value))}
              className="sscap-select"
            >
              {[62,63,64,65,66,67,68,69,70].map(a => (
                <option key={a} value={a}>
                  Age {a}{a === 62 ? ' (earliest)' : a === getFRA(birthYear) ? ' (your FRA)' : a === 70 ? ' (maximum)' : ''}
                </option>
              ))}
            </select>
            <span className="sscap-hint">
              {claimAge < getFRA(birthYear)
                ? `${Math.round((getFRA(birthYear) - claimAge) * 12)} months before your FRA — benefit reduced`
                : claimAge > getFRA(birthYear)
                ? `${Math.round((claimAge - getFRA(birthYear)) * 12)} months after FRA — +${Math.round((claimAge - getFRA(birthYear)) * 8)}% delayed credit`
                : 'At your Full Retirement Age — no reduction or credit'}
            </span>
          </div>
        </div>

        <button type="submit" className="sscap-btn">
          Calculate My Scenarios →
        </button>
      </form>

      {/* ── RESULTS ─────────────────────────────────────────────────────── */}
      {showResults && (
        <div className="sscap-results">

          {/* Key metric row */}
          <div className="sscap-key-metrics">
            <div className="sscap-metric sscap-metric-green">
              <span className="sscap-metric-label">Estimated Monthly Benefit</span>
              <span className="sscap-metric-value">{fmt(calc.monthlyBenefit)}</span>
              <span className="sscap-metric-sub">At age {claimAge} under current law</span>
            </div>
            <div className="sscap-metric sscap-metric-red">
              <span className="sscap-metric-label">If Trust Fund Depletes (2032)</span>
              <span className="sscap-metric-value">{fmt(calc.depletedBenefit)}</span>
              <span className="sscap-metric-sub">~{fmt(calc.monthlyLoss)}/mo less · no reform</span>
            </div>
            <div className={`sscap-metric ${calc.affectedByMW ? 'sscap-metric-amber' : 'sscap-metric-neutral'}`}>
              <span className="sscap-metric-label">Extra Payroll Tax (Moreno-Warren)</span>
              <span className="sscap-metric-value">{calc.affectedByMW ? fmt(calc.mwAdditional) + '/yr' : 'No change'}</span>
              <span className="sscap-metric-sub">{calc.affectedByMW ? 'Additional annual tax if cap eliminated' : 'Earnings within current wage base'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="sscap-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`sscap-tab ${activeTab === t.id ? 'sscap-tab-active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="sscap-tab-long">{t.label}</span>
                <span className="sscap-tab-short">{t.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* ── TAB: Your Benefit ── */}
          {activeTab === 'benefit' && (
            <div className="sscap-panel">
              <h3 className="sscap-panel-title">Your Estimated Social Security Benefit</h3>
              <div className="sscap-info-grid">
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Estimated AIME</span>
                  <span className="sscap-info-val">{fmt(calc.aime)}/mo</span>
                  <span className="sscap-info-note">Average Indexed Monthly Earnings (simplified)</span>
                </div>
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Primary Insurance Amount (PIA)</span>
                  <span className="sscap-info-val">{fmt(calc.pia)}/mo</span>
                  <span className="sscap-info-note">Benefit at exact FRA before age adjustments</span>
                </div>
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Your Full Retirement Age</span>
                  <span className="sscap-info-val">{getFRA(birthYear) === 67 ? '67' : getFRA(birthYear) % 1 === 0 ? getFRA(birthYear) : `${Math.floor(getFRA(birthYear))} yrs ${Math.round((getFRA(birthYear) % 1) * 12)} mo`}</span>
                  <span className="sscap-info-note">Based on your {birthYear} birth year</span>
                </div>
                <div className="sscap-info-block sscap-info-block-highlight">
                  <span className="sscap-info-label">Monthly Benefit at Age {claimAge}</span>
                  <span className="sscap-info-val sscap-info-val-lg">{fmt(calc.monthlyBenefit)}</span>
                  <span className="sscap-info-note">{fmt(calc.annualBenefit)} annually</span>
                </div>
              </div>

              {/* Age comparison table */}
              <h4 className="sscap-sub-title">Benefit at Every Claiming Age</h4>
              <div className="sscap-table-wrap">
                <table className="sscap-table">
                  <thead>
                    <tr>
                      <th>Claiming Age</th>
                      <th>Monthly Benefit</th>
                      <th>Annual Total</th>
                      <th>vs. FRA Benefit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[62,63,64,65,66,67,68,69,70].map(age => {
                      const fra = getFRA(birthYear);
                      const b   = Math.min(calcMonthlyBenefit(calc.pia, age, fra), MAX_BENEFIT_70);
                      const fra_b = Math.min(calcMonthlyBenefit(calc.pia, fra, fra), MAX_BENEFIT_FRA);
                      const diff = b - fra_b;
                      return (
                        <tr key={age} className={age === claimAge ? 'sscap-tr-selected' : ''}>
                          <td>Age {age}{age === claimAge ? ' ← your choice' : ''}{age === Math.round(fra) ? ' (FRA)' : ''}</td>
                          <td><strong>{fmt(b)}</strong></td>
                          <td>{fmt(b * 12)}</td>
                          <td style={{color: diff >= 0 ? '#1a7a4a' : '#b91c1c'}}>
                            {diff >= 0 ? '+' : ''}{fmt(diff)}/mo
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="sscap-disclaimer-sm">
                ⚠️ This estimate uses current earnings as a proxy for your full career and the 2026 SSA bend-point formula.
                Your actual benefit may differ. For a personalized figure, log in at{' '}
                <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer">ssa.gov/myaccount</a>.
              </p>
            </div>
          )}

          {/* ── TAB: 2032 Depletion ── */}
          {activeTab === 'depletion' && (
            <div className="sscap-panel">
              <h3 className="sscap-panel-title">The 2032 Trust Fund Depletion Scenario</h3>

              <div className="sscap-alert sscap-alert-amber">
                <strong>What the 2026 SSA Trustees Report says:</strong> The OASI trust fund is projected to be depleted in the fourth quarter of 2032 — about {calc.yearsUntilDepletion} years from now. At that point, incoming payroll taxes alone would cover only an estimated 72–77% of scheduled benefits.
              </div>

              <div className="sscap-info-grid">
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Your age in 2032</span>
                  <span className="sscap-info-val">{calc.ageIn2032}</span>
                  <span className="sscap-info-note">
                    {calc.ageIn2032 >= claimAge
                      ? `You plan to claim at ${claimAge} — you may be collecting by 2032`
                      : `You plan to claim at ${claimAge} — you would not yet be collecting in 2032`}
                  </span>
                </div>
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Benefit under current law</span>
                  <span className="sscap-info-val" style={{color:'#1a7a4a'}}>{fmt(calc.monthlyBenefit)}/mo</span>
                  <span className="sscap-info-note">{fmt(calc.annualBenefit)} per year</span>
                </div>
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Benefit if trust fund depletes</span>
                  <span className="sscap-info-val" style={{color:'#b91c1c'}}>{fmt(calc.depletedBenefit)}/mo</span>
                  <span className="sscap-info-note">{fmt(calc.depletedBenefit * 12)} per year (~77% of scheduled)</span>
                </div>
                <div className="sscap-info-block sscap-info-block-red">
                  <span className="sscap-info-label">Monthly shortfall</span>
                  <span className="sscap-info-val sscap-info-val-lg" style={{color:'#b91c1c'}}>-{fmt(calc.monthlyLoss)}</span>
                  <span className="sscap-info-note">-{fmt(calc.annualLoss)} per year</span>
                </div>
              </div>

              {/* Visual bar */}
              <h4 className="sscap-sub-title">Your Benefit — Current Law vs. Depletion Cut</h4>
              <div className="sscap-bar-wrap">
                <div className="sscap-bar-row">
                  <span className="sscap-bar-label">Current Law ({fmt(calc.monthlyBenefit)}/mo)</span>
                  <div className="sscap-bar-track">
                    <div className="sscap-bar-fill sscap-bar-green" style={{width:'100%'}} />
                  </div>
                </div>
                <div className="sscap-bar-row">
                  <span className="sscap-bar-label">After Depletion ({fmt(calc.depletedBenefit)}/mo)</span>
                  <div className="sscap-bar-track">
                    <div className="sscap-bar-fill sscap-bar-red" style={{width:'77%'}} />
                    <div className="sscap-bar-fill sscap-bar-ghost" style={{width:'23%'}} />
                  </div>
                </div>
              </div>

              <div className="sscap-alert sscap-alert-teal">
                <strong>Important context:</strong> Congress has never allowed an automatic cut to take effect since Social Security's founding in 1935. But no law currently prevents it. The 2032 deadline is the main reason reform legislation is being debated — every year without action shrinks the available options.
              </div>

              <h4 className="sscap-sub-title">What Would Reform Need to Look Like?</h4>
              <table className="sscap-table">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Revenue / Savings Over 10 Years</th>
                    <th>Closes Funding Gap?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Eliminate payroll tax cap entirely (Moreno-Warren)</td>
                    <td>~$3.0–$3.4 trillion</td>
                    <td>~Two-thirds of gap</td>
                  </tr>
                  <tr>
                    <td>Apply tax above $400k only (SS 2100 Act)</td>
                    <td>Smaller — donut hole reduces revenue</td>
                    <td>Partial</td>
                  </tr>
                  <tr>
                    <td>Raise full retirement age to 68 or 69</td>
                    <td>Significant — by reducing benefit years</td>
                    <td>Partial (benefit cut)</td>
                  </tr>
                  <tr>
                    <td>Combination approach</td>
                    <td>Varies by design</td>
                    <td>Potentially full</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB: Payroll Tax Impact ── */}
          {activeTab === 'tax' && (
            <div className="sscap-panel">
              <h3 className="sscap-panel-title">How Payroll Tax Cap Proposals Affect You</h3>

              {!calc.affectedByMW && (
                <div className="sscap-alert sscap-alert-teal">
                  <strong>Good news for your tax bill:</strong> Your earnings of {fmt(earnings)} are below the current $184,500 taxable wage base. Neither the Moreno-Warren proposal nor the Social Security 2100 Act would increase your annual payroll tax — both proposals only affect earnings above $184,500.
                </div>
              )}
              {calc.affectedByMW && !calc.affectedBySS2100 && (
                <div className="sscap-alert sscap-alert-amber">
                  <strong>Moreno-Warren proposal would affect you:</strong> Your earnings of {fmt(earnings)} exceed the $184,500 wage base. The Moreno-Warren proposal would apply the 6.2% tax to all your earnings. The Social Security 2100 Act's $400,000 threshold would not affect you.
                </div>
              )}
              {calc.affectedBySS2100 && (
                <div className="sscap-alert sscap-alert-amber">
                  <strong>Both proposals would affect you:</strong> Your earnings of {fmt(earnings)} exceed both the $184,500 wage base and the Social Security 2100 Act's $400,000 threshold.
                </div>
              )}

              <div className="sscap-info-grid">
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Annual earnings</span>
                  <span className="sscap-info-val">{fmt(earnings)}</span>
                  <span className="sscap-info-note">Your gross annual income entered above</span>
                </div>
                <div className="sscap-info-block">
                  <span className="sscap-info-label">Current payroll tax (employee share)</span>
                  <span className="sscap-info-val">{fmt(calc.currentPayrollTax)}/yr</span>
                  <span className="sscap-info-note">6.2% on up to $184,500 · Employer matches this</span>
                </div>
                {calc.affectedByMW && (
                  <div className="sscap-info-block sscap-info-block-amber">
                    <span className="sscap-info-label">Under Moreno-Warren (cap eliminated)</span>
                    <span className="sscap-info-val">{fmt(calc.mwTax)}/yr</span>
                    <span className="sscap-info-note" style={{color:'#b91c1c'}}>+{fmt(calc.mwAdditional)}/yr additional tax</span>
                  </div>
                )}
                {calc.affectedBySS2100 && (
                  <div className="sscap-info-block sscap-info-block-amber">
                    <span className="sscap-info-label">Under SS 2100 Act ($400k+ taxed)</span>
                    <span className="sscap-info-val">{fmt(calc.ss2100Earnings)}/yr</span>
                    <span className="sscap-info-note" style={{color:'#b91c1c'}}>+{fmt(calc.ss2100Additional)}/yr additional tax</span>
                  </div>
                )}
              </div>

              <h4 className="sscap-sub-title">Proposal-by-Proposal Comparison</h4>
              <div className="sscap-table-wrap">
                <table className="sscap-table">
                  <thead>
                    <tr>
                      <th>Proposal</th>
                      <th>Your Annual Payroll Tax</th>
                      <th>Additional vs. Current Law</th>
                      <th>Affects You?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Current Law (2026)</strong></td>
                      <td>{fmt(calc.currentPayrollTax)}</td>
                      <td>—</td>
                      <td>✅ In effect now</td>
                    </tr>
                    <tr className={calc.affectedByMW ? 'sscap-tr-amber' : ''}>
                      <td><strong>Moreno-Warren</strong><br /><span style={{fontSize:'0.8rem',color:'#666'}}>All earnings taxed · No cap</span></td>
                      <td>{fmt(calc.mwTax)}</td>
                      <td style={{color: calc.affectedByMW ? '#b91c1c' : 'inherit'}}>
                        {calc.affectedByMW ? '+' + fmt(calc.mwAdditional) : 'No change'}
                      </td>
                      <td>{calc.affectedByMW ? '⚠️ Yes' : '✅ No — under wage base'}</td>
                    </tr>
                    <tr className={calc.affectedBySS2100 ? 'sscap-tr-amber' : ''}>
                      <td><strong>SS 2100 Act (Larson)</strong><br /><span style={{fontSize:'0.8rem',color:'#666'}}>Taxed again above $400,000</span></td>
                      <td>{fmt(calc.ss2100Earnings)}</td>
                      <td style={{color: calc.affectedBySS2100 ? '#b91c1c' : 'inherit'}}>
                        {calc.affectedBySS2100 ? '+' + fmt(calc.ss2100Additional) : 'No change'}
                      </td>
                      <td>{calc.affectedBySS2100 ? '⚠️ Yes' : '✅ No — under $400k threshold'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="sscap-disclaimer-sm">
                Note: These figures show the employee share (6.2%) only. Employers pay a matching 6.2%. Self-employed individuals pay both shares (12.4%). Neither proposal has been enacted into law as of August 2026.
              </p>

              <div className="sscap-alert sscap-alert-teal">
                <strong>Key distinction:</strong> Raising the payroll tax cap increases <em>revenue into the program</em>. It does not automatically increase your monthly benefit — especially under the Moreno-Warren version, which would not grant additional benefit credits for the extra taxes paid above $184,500.
              </div>
            </div>
          )}

          {/* ── TAB: Full Comparison ── */}
          {activeTab === 'compare' && (
            <div className="sscap-panel">
              <h3 className="sscap-panel-title">Your Full Scenario Comparison</h3>
              <p style={{marginTop:0,color:'#555'}}>
                All scenarios below are based on your inputs: born {birthYear}, claiming at age {claimAge}, earning {fmt(earnings)}/year.
              </p>

              <div className="sscap-table-wrap">
                <table className="sscap-table sscap-table-compare">
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>Monthly Benefit</th>
                      <th>Annual Benefit</th>
                      <th>Annual Payroll Tax</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="sscap-tr-green">
                      <td>
                        <strong>Current Law — No Change</strong>
                        <br /><span className="sscap-row-note">2026 rules stay in effect</span>
                      </td>
                      <td><strong>{fmt(calc.monthlyBenefit)}</strong></td>
                      <td>{fmt(calc.annualBenefit)}</td>
                      <td>{fmt(calc.currentPayrollTax)}</td>
                      <td>✅ In effect</td>
                    </tr>
                    <tr className="sscap-tr-red">
                      <td>
                        <strong>Trust Fund Depletion — No Reform</strong>
                        <br /><span className="sscap-row-note">Projected 2032 · ~23% automatic cut</span>
                      </td>
                      <td style={{color:'#b91c1c'}}><strong>{fmt(calc.depletedBenefit)}</strong></td>
                      <td style={{color:'#b91c1c'}}>{fmt(calc.depletedBenefit * 12)}</td>
                      <td>{fmt(calc.currentPayrollTax)}</td>
                      <td>⚠️ Projected risk</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Moreno-Warren Reform Passes</strong>
                        <br /><span className="sscap-row-note">Cap eliminated · Fund shored up</span>
                      </td>
                      <td><strong>{fmt(calc.monthlyBenefit)}</strong></td>
                      <td>{fmt(calc.annualBenefit)}</td>
                      <td style={{color: calc.affectedByMW ? '#b91c1c' : 'inherit'}}>
                        {fmt(calc.mwTax)}
                        {calc.affectedByMW && <><br /><span style={{fontSize:'0.8rem',color:'#b91c1c'}}>+{fmt(calc.mwAdditional)} more</span></>}
                      </td>
                      <td>📋 Proposed</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>SS 2100 Act Passes</strong>
                        <br /><span className="sscap-row-note">Tax restarts above $400,000</span>
                      </td>
                      <td><strong>{fmt(calc.monthlyBenefit)}</strong></td>
                      <td>{fmt(calc.annualBenefit)}</td>
                      <td style={{color: calc.affectedBySS2100 ? '#b91c1c' : 'inherit'}}>
                        {fmt(calc.ss2100Earnings)}
                        {calc.affectedBySS2100 && <><br /><span style={{fontSize:'0.8rem',color:'#b91c1c'}}>+{fmt(calc.ss2100Additional)} more</span></>}
                      </td>
                      <td>📋 Proposed</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom-line takeaway */}
              <div className="sscap-takeaway">
                <p className="sscap-takeaway-title">📌 Your Bottom Line</p>
                <ul className="sscap-takeaway-list">
                  <li>Under current law, your estimated benefit at age {claimAge} is <strong>{fmt(calc.monthlyBenefit)}/month</strong>.</li>
                  <li>If the OASI trust fund depletes in 2032 without reform, that could drop to approximately <strong>{fmt(calc.depletedBenefit)}/month</strong> — a loss of <strong>{fmt(calc.monthlyLoss)}/month</strong>.</li>
                  {!calc.affectedByMW && (
                    <li>Your earnings are within the current $184,500 wage base — neither payroll tax cap proposal would increase your Social Security tax.</li>
                  )}
                  {calc.affectedByMW && !calc.affectedBySS2100 && (
                    <li>The Moreno-Warren proposal would increase your annual payroll tax by <strong>{fmt(calc.mwAdditional)}</strong>. The Social Security 2100 Act's $400,000 threshold would not affect you.</li>
                  )}
                  {calc.affectedBySS2100 && (
                    <li>Both proposals would increase your payroll tax — by <strong>{fmt(calc.mwAdditional)}</strong> under Moreno-Warren and <strong>{fmt(calc.ss2100Additional)}</strong> under the SS 2100 Act.</li>
                  )}
                  <li>No proposal currently before Congress would reduce your monthly benefit once you are receiving it.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STYLES ──────────────────────────────────────────────────────── */}
      <style>{`
        .sscap-wrap { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; color: #1a1a2e; }
        .sscap-header { text-align:center; margin-bottom:2rem; }
        .sscap-badge { display:inline-block; background:#0A3D3A; color:#C9933A; font-size:0.75rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:0.25rem 0.75rem; border-radius:4px; margin-bottom:0.75rem; }
        .sscap-title { font-size:clamp(1.4rem,3vw,1.9rem); font-weight:800; color:#08111F; margin:0 0 0.5rem 0; line-height:1.2; }
        .sscap-subtitle { color:#555; font-size:1rem; margin:0; max-width:680px; margin:0 auto; }

        .sscap-form { background:#f8f9fa; border:1px solid #e0e0e0; border-radius:10px; padding:1.5rem; margin-bottom:2rem; }
        .sscap-form-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1.25rem; margin-bottom:1.25rem; }
        .sscap-field { display:flex; flex-direction:column; gap:0.3rem; }
        .sscap-label { font-size:0.85rem; font-weight:700; color:#08111F; }
        .sscap-input, .sscap-select { border:2px solid #ccc; border-radius:6px; padding:0.55rem 0.75rem; font-size:1rem; color:#1a1a2e; background:#fff; transition:border-color 0.2s; width:100%; box-sizing:border-box; }
        .sscap-input:focus, .sscap-select:focus { outline:none; border-color:#0A3D3A; }
        .sscap-input-prefix { position:relative; }
        .sscap-prefix-sym { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:#555; font-weight:600; pointer-events:none; }
        .sscap-input-has-prefix { padding-left:1.5rem; }
        .sscap-hint { font-size:0.78rem; color:#666; line-height:1.4; }
        .sscap-btn { display:block; width:100%; background:#0A3D3A; color:#fff; font-size:1.05rem; font-weight:700; padding:0.85rem 1.5rem; border:none; border-radius:8px; cursor:pointer; transition:background 0.2s; }
        .sscap-btn:hover { background:#0d4f4b; }

        .sscap-key-metrics { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1rem; margin-bottom:1.5rem; }
        .sscap-metric { padding:1.25rem; border-radius:8px; display:flex; flex-direction:column; gap:0.2rem; }
        .sscap-metric-green { background:#f0faf5; border:1px solid #a7d9bd; }
        .sscap-metric-red   { background:#fff5f5; border:1px solid #fca5a5; }
        .sscap-metric-amber { background:#fffbeb; border:1px solid #fcd34d; }
        .sscap-metric-neutral{ background:#f5f5f5; border:1px solid #d1d5db; }
        .sscap-metric-label { font-size:0.8rem; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.04em; }
        .sscap-metric-value { font-size:1.7rem; font-weight:800; color:#08111F; }
        .sscap-metric-sub   { font-size:0.8rem; color:#666; }

        .sscap-tabs { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0; border-bottom:2px solid #e0e0e0; }
        .sscap-tab { background:none; border:none; border-bottom:3px solid transparent; padding:0.65rem 1rem; font-size:0.85rem; font-weight:600; color:#555; cursor:pointer; transition:all 0.2s; margin-bottom:-2px; border-radius:6px 6px 0 0; }
        .sscap-tab:hover { background:#f0faf5; color:#0A3D3A; }
        .sscap-tab-active { color:#0A3D3A; border-bottom-color:#C9933A; background:#f0faf5; }
        .sscap-tab-long { display:inline; }
        .sscap-tab-short { display:none; }
        @media(max-width:540px) { .sscap-tab-long{display:none;} .sscap-tab-short{display:inline;} .sscap-tab{padding:0.55rem 0.65rem;font-size:0.8rem;} }

        .sscap-panel { background:#fff; border:1px solid #e0e0e0; border-top:none; border-radius:0 0 10px 10px; padding:1.5rem; }
        .sscap-panel-title { margin:0 0 1.25rem 0; font-size:1.2rem; font-weight:800; color:#08111F; border-bottom:1px solid #eee; padding-bottom:0.75rem; }
        .sscap-sub-title { font-size:1rem; font-weight:700; color:#08111F; margin:1.5rem 0 0.75rem 0; }

        .sscap-info-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:1rem; margin-bottom:1rem; }
        .sscap-info-block { background:#f8f9fa; border:1px solid #e8e8e8; border-radius:8px; padding:1rem; display:flex; flex-direction:column; gap:0.25rem; }
        .sscap-info-block-highlight { background:#f0faf5; border-color:#a7d9bd; }
        .sscap-info-block-red  { background:#fff5f5; border-color:#fca5a5; }
        .sscap-info-block-amber{ background:#fffbeb; border-color:#fcd34d; }
        .sscap-info-label { font-size:0.78rem; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.04em; }
        .sscap-info-val { font-size:1.3rem; font-weight:800; color:#08111F; }
        .sscap-info-val-lg { font-size:1.7rem; }
        .sscap-info-note { font-size:0.78rem; color:#666; }

        .sscap-table-wrap { overflow-x:auto; margin-bottom:1rem; }
        .sscap-table { width:100%; border-collapse:collapse; font-size:0.88rem; }
        .sscap-table th { background:#08111F; color:#C9933A; text-align:left; padding:0.65rem 0.85rem; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; }
        .sscap-table td { padding:0.6rem 0.85rem; border-bottom:1px solid #eee; vertical-align:top; }
        .sscap-table tbody tr:hover { background:#f8f9fa; }
        .sscap-tr-selected { background:#f0faf5 !important; font-weight:700; }
        .sscap-tr-green { background:#f0faf5; }
        .sscap-tr-red   { background:#fff5f5; }
        .sscap-tr-amber { background:#fffbeb; }
        .sscap-row-note { font-size:0.78rem; color:#666; font-weight:400; }

        .sscap-bar-wrap { display:flex; flex-direction:column; gap:0.75rem; margin:1rem 0; }
        .sscap-bar-row { display:flex; align-items:center; gap:0.75rem; }
        .sscap-bar-label { font-size:0.82rem; font-weight:600; min-width:220px; color:#333; }
        .sscap-bar-track { flex:1; height:28px; background:#eee; border-radius:4px; display:flex; overflow:hidden; }
        .sscap-bar-fill { height:100%; border-radius:4px; }
        .sscap-bar-green { background:#1a7a4a; }
        .sscap-bar-red   { background:#b91c1c; }
        .sscap-bar-ghost { background:#fca5a5; }

        .sscap-alert { padding:1rem 1.25rem; border-radius:6px; margin:1rem 0; font-size:0.9rem; line-height:1.6; }
        .sscap-alert-amber { background:#fffbeb; border-left:4px solid #f59e0b; }
        .sscap-alert-teal  { background:#f0faf5; border-left:4px solid #0A3D3A; }

        .sscap-takeaway { background:#f0faf5; border:1px solid #a7d9bd; border-radius:8px; padding:1.25rem; margin-top:1rem; }
        .sscap-takeaway-title { font-weight:800; color:#08111F; margin:0 0 0.75rem 0; font-size:1rem; }
        .sscap-takeaway-list { margin:0; padding-left:1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
        .sscap-takeaway-list li { font-size:0.9rem; line-height:1.6; color:#333; }

        .sscap-disclaimer-sm { font-size:0.8rem; color:#666; background:#f5f5f5; padding:0.75rem 1rem; border-radius:6px; margin-top:0.5rem; line-height:1.6; }
        .sscap-disclaimer-sm a { color:#0A3D3A; }
      `}</style>
    </div>
  );
}
