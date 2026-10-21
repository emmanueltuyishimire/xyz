/**
 * MedicareVsMedicaidCalculator.tsx
 * Medicare vs. Medicaid Calculator — Single-screen deterministic tool.
 *
 * Engine: src/lib/engine.ts (mvcCalculate, classifyMsp, screenFullMedicaid, extraHelpEligible)
 * All figures from OFFICIAL_CONSTANTS in src/data/constants.ts.
 * No data leaves the browser. No account required.
 *
 * Verdict language: "may qualify" / "unlikely" / "depends on your state"
 * Never says: "you are eligible"
 */
import React, { useState, useId, useCallback } from 'react';
import {
  mvcCalculate,
  mspMonthlyLimits,
  MEDICARE_2026,
  SSI_2026,
  type MvcInput,
  type MvcIncomeInput,
  type MvcEligibilityResult,
  type HouseholdStatus,
  type LivingSituation,
  type MspTier,
  type DualStatus,
} from '../../lib/engine';

// ─── Styles (inline, brand-consistent) ─────────────────────────────────────
const C = {
  teal:    '#0A3D3A',
  gold:    '#C9933A',
  bg:      '#F4F7F6',
  white:   '#FFFFFF',
  border:  '#DDE3EA',
  text:    '#1A1A1A',
  muted:   '#555',
  green:   '#2D6A4F',
  red:     '#C53030',
  amber:   '#B45309',
} as const;

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtWhole = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

// ─── Preset Configurations ──────────────────────────────────────────────────
const PRESETS: Array<{ label: string; description: string; values: Partial<FormState> }> = [
  {
    label: 'Turning 65 soon',
    description: 'Age 65, new to Medicare, moderate Social Security income',
    values: { age: '65', ss: '1400', workQuarters: '40', householdStatus: 'single', resources: '8000', state: 'NC', region: 'standard' },
  },
  {
    label: 'Income dropped after spouse\'s death',
    description: 'Widow/widower, income fell to single SS only',
    values: { age: '72', ss: '1150', workQuarters: '40', householdStatus: 'widowed', resources: '5000', state: 'GA', region: 'standard' },
  },
  {
    label: 'Entering a nursing facility',
    description: 'Needs long-term care Medicaid — institutional income test',
    values: { age: '78', ss: '2200', pension: '500', workQuarters: '40', householdStatus: 'single', resources: '1500', livingSituation: 'nursing_facility', facilityCost: '8000', state: 'FL', region: 'standard' },
  },
  {
    label: 'Applying for SSDI/SSI',
    description: 'Under 65, SSDI for 24+ months — Medicare eligibility',
    values: { age: '52', ss: '900', workQuarters: '32', ssdiMonths: '24', householdStatus: 'single', resources: '1800', state: 'TX', region: 'standard' },
  },
  {
    label: 'Income just above QMB limit',
    description: 'Income $20 above QMB — may still qualify for SLMB',
    values: { age: '70', ss: '1390', workQuarters: '40', householdStatus: 'single', resources: '7000', state: 'OH', region: 'standard' },
  },
  {
    label: 'January 2027 preview',
    description: 'Apply 3.6% COLA — shows 2027 effect on your benefits',
    values: { age: '70', ss: '1500', workQuarters: '40', householdStatus: 'single', resources: '8000', show2027: true, state: 'PA', region: 'standard' },
  },
];

// ─── Form State ─────────────────────────────────────────────────────────────
interface FormState {
  // Who
  age: string;
  householdStatus: HouseholdStatus | '';
  // Medicare
  workQuarters: string;
  ssdiMonths: string;
  hasESRD: boolean;
  hasALS: boolean;
  // Income
  ss: string;
  pension: string;
  wages: string;
  otherUnearned: string;
  spouseSS: string;
  spousePension: string;
  spouseWages: string;
  spouseOther: string;
  // Resources
  resources: string;
  // Expected usage
  annualPartBCharges: string;
  hospitalStays: string;
  hospitalDays: string;
  snfDays: string;
  // Living
  livingSituation: LivingSituation;
  facilityCost: string;
  // IRMAA
  magi: string;
  filingStatus: 'single' | 'mfj' | 'mfs';
  // State / Region
  state: string;          // 2-letter abbreviation or '' (empty = not selected)
  region: 'standard' | 'AK' | 'HI'; // derived from state
  // 2027 preview
  show2027: boolean;
}

const defaultForm: FormState = {
  age: '', householdStatus: '', workQuarters: '40',
  ssdiMonths: '0', hasESRD: false, hasALS: false,
  ss: '', pension: '0', wages: '0', otherUnearned: '0',
  spouseSS: '0', spousePension: '0', spouseWages: '0', spouseOther: '0',
  resources: '', annualPartBCharges: '2000',
  hospitalStays: '0', hospitalDays: '0', snfDays: '0',
  livingSituation: 'home', facilityCost: '0',
  magi: '', filingStatus: 'single', state: '', region: 'standard',
  show2027: false,
};

// ─── US States list (all 50 + DC) ────────────────────────────────────────────
// region: AK and HI use higher FPL baselines; all others use standard 48-state FPL
const US_STATES: Array<{ abbr: string; name: string; region: 'standard' | 'AK' | 'HI' }> = [
  { abbr: 'AL', name: 'Alabama',              region: 'standard' },
  { abbr: 'AK', name: 'Alaska',               region: 'AK'       },
  { abbr: 'AZ', name: 'Arizona',              region: 'standard' },
  { abbr: 'AR', name: 'Arkansas',             region: 'standard' },
  { abbr: 'CA', name: 'California',           region: 'standard' },
  { abbr: 'CO', name: 'Colorado',             region: 'standard' },
  { abbr: 'CT', name: 'Connecticut',          region: 'standard' },
  { abbr: 'DE', name: 'Delaware',             region: 'standard' },
  { abbr: 'DC', name: 'District of Columbia', region: 'standard' },
  { abbr: 'FL', name: 'Florida',              region: 'standard' },
  { abbr: 'GA', name: 'Georgia',              region: 'standard' },
  { abbr: 'HI', name: 'Hawaii',               region: 'HI'       },
  { abbr: 'ID', name: 'Idaho',                region: 'standard' },
  { abbr: 'IL', name: 'Illinois',             region: 'standard' },
  { abbr: 'IN', name: 'Indiana',              region: 'standard' },
  { abbr: 'IA', name: 'Iowa',                 region: 'standard' },
  { abbr: 'KS', name: 'Kansas',               region: 'standard' },
  { abbr: 'KY', name: 'Kentucky',             region: 'standard' },
  { abbr: 'LA', name: 'Louisiana',            region: 'standard' },
  { abbr: 'ME', name: 'Maine',                region: 'standard' },
  { abbr: 'MD', name: 'Maryland',             region: 'standard' },
  { abbr: 'MA', name: 'Massachusetts',        region: 'standard' },
  { abbr: 'MI', name: 'Michigan',             region: 'standard' },
  { abbr: 'MN', name: 'Minnesota',            region: 'standard' },
  { abbr: 'MS', name: 'Mississippi',          region: 'standard' },
  { abbr: 'MO', name: 'Missouri',             region: 'standard' },
  { abbr: 'MT', name: 'Montana',              region: 'standard' },
  { abbr: 'NE', name: 'Nebraska',             region: 'standard' },
  { abbr: 'NV', name: 'Nevada',               region: 'standard' },
  { abbr: 'NH', name: 'New Hampshire',        region: 'standard' },
  { abbr: 'NJ', name: 'New Jersey',           region: 'standard' },
  { abbr: 'NM', name: 'New Mexico',           region: 'standard' },
  { abbr: 'NY', name: 'New York',             region: 'standard' },
  { abbr: 'NC', name: 'North Carolina',       region: 'standard' },
  { abbr: 'ND', name: 'North Dakota',         region: 'standard' },
  { abbr: 'OH', name: 'Ohio',                 region: 'standard' },
  { abbr: 'OK', name: 'Oklahoma',             region: 'standard' },
  { abbr: 'OR', name: 'Oregon',               region: 'standard' },
  { abbr: 'PA', name: 'Pennsylvania',         region: 'standard' },
  { abbr: 'RI', name: 'Rhode Island',         region: 'standard' },
  { abbr: 'SC', name: 'South Carolina',       region: 'standard' },
  { abbr: 'SD', name: 'South Dakota',         region: 'standard' },
  { abbr: 'TN', name: 'Tennessee',            region: 'standard' },
  { abbr: 'TX', name: 'Texas',                region: 'standard' },
  { abbr: 'UT', name: 'Utah',                 region: 'standard' },
  { abbr: 'VT', name: 'Vermont',              region: 'standard' },
  { abbr: 'VA', name: 'Virginia',             region: 'standard' },
  { abbr: 'WA', name: 'Washington',           region: 'standard' },
  { abbr: 'WV', name: 'West Virginia',        region: 'standard' },
  { abbr: 'WI', name: 'Wisconsin',            region: 'standard' },
  { abbr: 'WY', name: 'Wyoming',              region: 'standard' },
];

// States that did NOT expand Medicaid (as of 2026) — adults without children / disability
// generally do not qualify for full Medicaid regardless of income.
// Source: KFF State Health Facts (cross-checked against medicaid.gov)
const NON_EXPANSION_STATES = new Set(['AL','FL','GA','ID','KS','MS','SC','SD','TN','TX','WI','WY']);

function stateToRegion(abbr: string): 'standard' | 'AK' | 'HI' {
  if (abbr === 'AK') return 'AK';
  if (abbr === 'HI') return 'HI';
  return 'standard';
}

function getStateName(abbr: string): string {
  return US_STATES.find(s => s.abbr === abbr)?.name ?? abbr;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseNum(s: string, fallback = 0): number {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? fallback : n;
}

function buildInput(f: FormState): MvcInput | null {
  const age = parseNum(f.age);
  if (!age || !f.householdStatus) return null;

  const income: MvcIncomeInput = {
    socialSecurity: parseNum(f.ss),
    pension:        parseNum(f.pension),
    wages:          parseNum(f.wages),
    otherUnearned:  parseNum(f.otherUnearned),
  };
  const spouseIncome: MvcIncomeInput | undefined = (f.householdStatus === 'married_together') ? {
    socialSecurity: parseNum(f.spouseSS),
    pension:        parseNum(f.spousePension),
    wages:          parseNum(f.spouseWages),
    otherUnearned:  parseNum(f.spouseOther),
  } : undefined;

  return {
    age,
    householdStatus: f.householdStatus as HouseholdStatus,
    resources:       parseNum(f.resources),
    income, spouseIncome,
    workQuarters:    parseNum(f.workQuarters, 40),
    ssdiMonths:      parseNum(f.ssdiMonths),
    hasESRD:         f.hasESRD,
    hasALS:          f.hasALS,
    magi:            f.magi ? parseNum(f.magi) : undefined,
    filingStatus:    f.filingStatus,
    annualPartBCharges: parseNum(f.annualPartBCharges, 2000),
    hospitalStays:   parseNum(f.hospitalStays),
    hospitalDays:    parseNum(f.hospitalDays),
    snfDays:         parseNum(f.snfDays),
    livingSituation: f.livingSituation,
    facilityCost:    parseNum(f.facilityCost),
    region:          f.state ? stateToRegion(f.state) : f.region,
  };
}

// ─── Verdict tile colors ─────────────────────────────────────────────────────
function verdictColor(v: 'may' | 'unlikely' | 'depends'): string {
  return v === 'may' ? C.green : v === 'unlikely' ? C.red : C.amber;
}

function dualStatusLabel(s: DualStatus): string {
  const m: Record<DualStatus, string> = {
    full_dual:     'Full Dual Eligible',
    qmb_plus:      'QMB-Plus Dual Eligible',
    qmb_only:      'QMB-Only (MSP, not full Medicaid)',
    slmb_only:     'SLMB-Only (Part B premium covered)',
    qi_only:       'QI-Only (Part B premium covered)',
    medicare_only: 'Medicare Only',
    medicaid_only: 'Medicaid Only (not yet Medicare-eligible)',
    none:          'Not currently enrolled in either',
  };
  return m[s] ?? s;
}

function mspTierLabel(t: MspTier): string {
  const m: Record<MspTier, string> = {
    QMB:  'Qualified Medicare Beneficiary (QMB) — $0 Medicare cost-sharing',
    SLMB: 'Specified Low-Income Beneficiary (SLMB) — Part B premium paid',
    QI:   'Qualifying Individual (QI) — Part B premium paid',
    QDWI: 'Qualified Disabled & Working Individual (QDWI) — Part A premium paid',
    none: 'No Medicare Savings Program (at these income/resource levels)',
  };
  return m[t] ?? t;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function VerdictTile({ title, verdict, detail, source }: {
  title: string; verdict: 'may' | 'unlikely' | 'depends';
  detail: string; source?: string;
}) {
  const color = verdictColor(verdict);
  const label = verdict === 'may' ? '✓ May qualify' : verdict === 'unlikely' ? '✗ Unlikely' : '⚑ Depends on your state';
  return (
    <div style={{ border: `2px solid ${color}`, borderRadius: 10, padding: '18px 20px', marginBottom: 16, background: C.white }}>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{detail}</div>
      {source && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Source: {source}</div>}
    </div>
  );
}

function CostTable({ result, show2027, ss2026 }: {
  result: MvcEligibilityResult; show2027: boolean; ss2026: number;
}) {
  const { costs, msp } = result;
  const cola2027 = 1.036;
  const ss27 = Math.round(ss2026 * cola2027 * 100) / 100;
  const rows = [
    { label: 'Part A premium (annual)', medicare: fmtWhole(costs.partAPremiumAnnual), withMSP: msp.tier === 'QMB' ? '$0' : fmtWhole(costs.partAPremiumAnnual), dual: '$0' },
    { label: 'Part B premium (annual)', medicare: fmtWhole(costs.partBPremiumAnnual), withMSP: (msp.tier === 'QMB' || msp.tier === 'SLMB' || msp.tier === 'QI') ? '$0' : fmtWhole(costs.partBPremiumAnnual), dual: '$0' },
    { label: 'Part B deductible', medicare: fmt(costs.partBDeductibleAmount), withMSP: msp.tier === 'QMB' ? '$0' : fmt(costs.partBDeductibleAmount), dual: '$0' },
    { label: 'Part B coinsurance (20%)', medicare: fmt(costs.partBCoinsurance), withMSP: msp.tier === 'QMB' ? '$0' : fmt(costs.partBCoinsurance), dual: '$0', note: 'No annual cap on Part B coinsurance.' },
    { label: 'Hospital stays', medicare: fmtWhole(costs.hospitalCost), withMSP: msp.tier === 'QMB' ? '$0' : fmtWhole(costs.hospitalCost), dual: '$0' },
    { label: 'Skilled nursing (days 21-100)', medicare: fmtWhole(costs.snfCost), withMSP: msp.tier === 'QMB' ? '$0' : fmtWhole(costs.snfCost), dual: '$0' },
  ];
  const mspLabel = msp.tier !== 'none' ? `With ${msp.tier}` : 'With MSP (if eligible)';
  return (
    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <caption style={{ textAlign: 'left', fontWeight: 700, marginBottom: 8, color: C.teal, fontSize: 15 }}>
          Estimated Annual Cost Comparison — 2026
        </caption>
        <thead>
          <tr style={{ background: C.teal, color: C.white }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Cost Item</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Original Medicare Only</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>{mspLabel}</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>With Full Medicaid</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} style={{ background: i % 2 === 0 ? C.bg : C.white }}>
              <td style={{ padding: '9px 12px', color: C.text }}>{r.label}{r.note && <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{r.note}</span>}</td>
              <td style={{ padding: '9px 12px', textAlign: 'right' }}>{r.medicare}</td>
              <td style={{ padding: '9px 12px', textAlign: 'right', color: r.withMSP === '$0.00' || r.withMSP === '$0' ? C.green : undefined }}>{r.withMSP}</td>
              <td style={{ padding: '9px 12px', textAlign: 'right', color: C.green }}>{r.dual}</td>
            </tr>
          ))}
          <tr style={{ background: C.teal, color: C.white, fontWeight: 700 }}>
            <td style={{ padding: '10px 12px' }}>Estimated Annual Total</td>
            <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmt(costs.medicareOnlyCost)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'right' }}>{msp.tier === 'QMB' ? '$0.00' : msp.tier === 'SLMB' || msp.tier === 'QI' ? fmt(costs.withSlmbCost) : '—'}</td>
            <td style={{ padding: '10px 12px', textAlign: 'right' }}>$0.00</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
        * Part B coinsurance has no annual cap. Medigap, Medicare Advantage, and Part D plan premiums are excluded.
        Dental, vision, and hearing spending may be covered by full Medicaid — verify with your state Medicaid office.
      </p>
      {show2027 && (
        <div style={{ background: '#FFF8E1', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '12px 16px', marginTop: 12 }}>
          <strong style={{ color: C.amber }}>January 2027 Preview (3.6% COLA applied):</strong>
          <p style={{ margin: '6px 0 0', fontSize: 14 }}>
            Your Social Security income would increase from {fmt(ss2026)}/mo to approximately {fmt(ss27)}/mo.
            2027 Part B premiums and poverty guidelines are <strong>pending</strong> (CMS publishes mid-November 2026; HHS publishes January 2027).
            MSP limits may shift — re-check eligibility in early 2027.
          </p>
          <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>
            P.L. 119-21 Sec. 71112: Medicaid retroactive coverage for expansion adults changes to 1 month (from 3 months) effective January 1, 2027.
          </p>
        </div>
      )}
    </div>
  );
}

function WhoPaysFIrst({ result }: { result: MvcEligibilityResult }) {
  const { msp, fullMedicaidLikely: fullMedicaid } = result;
  const hasMSP = msp.tier !== 'none';
  const rows = [
    { service: 'Doctor visit / outpatient', first: 'Medicare Part B', second: hasMSP || fullMedicaid ? 'State Medicaid' : 'You (20% coinsurance)', you: hasMSP ? '$0 (QMB)' : fullMedicaid ? '$0 (full Medicaid)' : '20%' },
    { service: 'Hospital inpatient stay', first: 'Medicare Part A', second: hasMSP || fullMedicaid ? 'State Medicaid' : 'You (deductible + days)', you: msp.tier === 'QMB' ? '$0' : fullMedicaid ? '$0' : `$${MEDICARE_2026.partADeductible.toLocaleString()} deductible` },
    { service: 'Skilled nursing (days 21-100)', first: 'Medicare Part A', second: hasMSP || fullMedicaid ? 'State Medicaid' : 'You', you: msp.tier === 'QMB' ? '$0' : fullMedicaid ? '$0' : '$217/day' },
    { service: 'Prescriptions (Part D)', first: 'Medicare Part D plan', second: result.extraHelpQualifies ? 'Extra Help covers copays' : 'You pay copays', you: result.extraHelpQualifies ? `$${MEDICARE_2026.partDBasePremium}/mo base premium (covered)` : 'Plan copays apply' },
    { service: 'Dental / vision / hearing', first: 'Medicare (does NOT cover routine)', second: fullMedicaid ? 'State Medicaid (varies by state)' : 'You (not covered by Medicare)', you: fullMedicaid ? 'May be $0 — verify with state' : 'Out of pocket' },
    { service: 'Long-term nursing home care', first: 'Medicare (up to 100 days SNF only)', second: fullMedicaid ? 'Medicaid (indefinite, income test applies)' : 'You (after 100 Medicare days)', you: fullMedicaid && result.institutionalIncomeOk ? 'May be covered — state applies income test' : 'Private pay required' },
  ];
  return (
    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <caption style={{ textAlign: 'left', fontWeight: 700, marginBottom: 8, color: C.teal, fontSize: 15 }}>
          Who Pays First — Coordination of Benefits
        </caption>
        <thead>
          <tr style={{ background: C.teal, color: C.white }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Service</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Primary Payer</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Secondary Payer</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Your Estimated Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.service} style={{ background: i % 2 === 0 ? C.bg : C.white }}>
              <td style={{ padding: '9px 12px', fontWeight: 600, color: C.teal }}>{r.service}</td>
              <td style={{ padding: '9px 12px' }}>{r.first}</td>
              <td style={{ padding: '9px 12px' }}>{r.second}</td>
              <td style={{ padding: '9px 12px', fontWeight: 600, color: r.you === '$0' || r.you.startsWith('$0') ? C.green : C.text }}>{r.you}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IncomeHeadroom({ result }: { result: MvcEligibilityResult }) {
  const { msp } = result;
  if (msp.tier === 'none') return null;
  const current = msp.countableIncome;
  const deltas = [-200, -100, 0, 100, 200];

  const tierAt = (income: number): MspTier => {
    if (!msp.resourcesPass) return 'none';
    if (income <= msp.limits.qmb) return 'QMB';
    if (income <= msp.limits.slmb) return 'SLMB';
    if (income <= msp.limits.qi) return 'QI';
    return 'none';
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ color: C.teal, fontSize: 16, marginBottom: 12 }}>Income Headroom & What-If Scenarios</h3>
      {msp.headroomToNextTier !== null && (
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          Your countable income is <strong>{fmt(current)}/month</strong>.
          You have <strong>{fmt(msp.headroomToNextTier)}/month</strong> of headroom before your MSP tier changes.
        </p>
      )}
      <table style={{ borderCollapse: 'collapse', fontSize: 14, width: '100%', maxWidth: 500 }}>
        <thead>
          <tr style={{ background: C.teal, color: C.white }}>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Income Change</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Countable Income</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>MSP Tier</th>
          </tr>
        </thead>
        <tbody>
          {deltas.map((d, i) => {
            const inc = current + d;
            const tier = tierAt(Math.max(0, inc));
            return (
              <tr key={d} style={{ background: i % 2 === 0 ? C.bg : C.white, fontWeight: d === 0 ? 700 : 400 }}>
                <td style={{ padding: '8px 12px' }}>{d === 0 ? 'Current' : (d > 0 ? '+' : '') + '$' + Math.abs(d) + '/mo'}</td>
                <td style={{ padding: '8px 12px' }}>{fmt(Math.max(0, inc))}</td>
                <td style={{ padding: '8px 12px', color: tier === 'none' ? C.red : C.green }}>{tier === 'none' ? 'No MSP' : tier}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NextSteps({ result }: { result: MvcEligibilityResult }) {
  const { msp, fullMedicaidLikely: fullMed, medicareEligible, extraHelpQualifies } = result;
  const steps: string[] = [];

  if (!medicareEligible) {
    steps.push('Contact Social Security (1-800-772-1213) to confirm your Medicare eligibility date based on your disability or SSDI status.');
  }
  if (medicareEligible) {
    steps.push('Enroll in Medicare at ssa.gov or 1-800-772-1213 if not already enrolled. Gather: Social Security card, birth certificate, and any employer coverage information.');
  }
  if (msp.tier !== 'none') {
    steps.push('Apply for your ' + msp.tier + ' Medicare Savings Program at your state Medicaid office. This will stop the $202.90/month Part B deduction from your Social Security check. Application is free.');
    steps.push('You automatically receive Extra Help (Low-Income Subsidy) for Part D prescriptions when you have ' + msp.tier + '. Tell your pharmacist you have Extra Help.');
  }
  if (msp.tier === 'none' && extraHelpQualifies) {
    steps.push('Apply for Extra Help (Low-Income Subsidy) at ssa.gov or 1-800-772-1213 to reduce Part D prescription drug costs.');
  }
  if (fullMed) {
    steps.push('Apply for full Medicaid at your state Medicaid office or medicaid.gov to potentially eliminate deductibles, coinsurance, and gain dental/vision/hearing coverage.');
  }
  if (result.institutional) {
    steps.push('For nursing facility Medicaid, contact your state Medicaid office immediately. Bring 60 months of financial records (5-year look-back period). Consider an elder law attorney for asset protection guidance.');
    steps.push('Visit /tools/medicaid-spend-down-calculator/ for long-term care planning scenarios.');
  }
  steps.push('Contact a free SHIP (State Health Insurance Assistance Program) counselor at shiphelp.org for personalized, unbiased guidance at no cost.');
  steps.push('Gather these documents before your appointment: Social Security award letter, bank statements, investment account statements, recent tax return, and Medicare card (if enrolled).');

  return (
    <div style={{ background: C.bg, borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
      <h3 style={{ color: C.teal, fontSize: 16, marginTop: 0, marginBottom: 12 }}>Your Next Steps & Documents Checklist</h3>
      <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 2, fontSize: 14 }}>
        {steps.map((s, i) => <li key={i} style={{ marginBottom: 8 }}>{s}</li>)}
      </ol>
    </div>
  );
}

function MethodPanel({ result }: { result: MvcEligibilityResult }) {
  const [open, setOpen] = useState(false);
  const { msp, costs } = result;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: C.teal, fontSize: 14 }}
        aria-expanded={open}
      >
        {open ? '▼' : '▶'} How we calculated this — Method & Sources
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px', fontSize: 13, lineHeight: 1.8, color: C.text }}>
          <p><strong>MSP income calculation:</strong> Countable income = (unearned − $20 general exclusion) + (earned − $65 − remaining exclusion) ÷ 2. Source: 20 CFR 416.1112; SSA POMS SI 00810.420.</p>
          <p><strong>MSP limits:</strong> QMB = $1,350/mo (100% FPL ÷ 12 + $20, rounded up); SLMB = $1,616/mo (120%); QI = $1,816/mo (135%). Source: medicare.gov/basics/costs/help/medicare-savings-programs. Data year: 2026.</p>
          <p><strong>Resource test:</strong> Federal baseline $9,950 (individual) / $14,910 (couple). Source: same Medicare.gov page.</p>
          <p><strong>Your countable income:</strong> {fmt(msp.countableIncome)}/month.</p>
          <p><strong>Part B coinsurance:</strong> 20% of (charges − $283 deductible). No annual cap. Source: CMS Nov 2025 fact sheet.</p>
          <p><strong>Hospital cost:</strong> ${MEDICARE_2026.partADeductible.toLocaleString()} per benefit period (days 1-60); +${MEDICARE_2026.partACoin6190}/day (days 61-90); +${MEDICARE_2026.partALifetimeReserve}/day (lifetime reserve days 91-150). Source: CMS Nov 2025.</p>
          <p><strong>SNF coinsurance:</strong> $0 for days 1-20; ${MEDICARE_2026.snfCoin2190}/day for days 21-100; 100% after day 100. Source: CMS Nov 2025.</p>
          <p><strong>SSI limits (UNVERIFIED):</strong> Individual $994/month, couple $1,491/month — derived from 2027 COLA back-calculation. Full Medicaid income screening uses SSI FBR. Verify at ssa.gov.</p>
          <p><strong>Institutional Medicaid:</strong> Special income level = 300% SSI = $2,982/month (COMPUTED — verify with your state). Source: SSA 20 CFR 416; POMS.</p>
          <p><strong>Data years:</strong> Medicare figures 2026 (CMS Nov 14, 2025); FPL 2026 (HHS Jan 15, 2026); MSP 2026 (medicare.gov); SSI 2026 (UNVERIFIED); SSI 2027 (SSA Oct 14, 2026).</p>
          <p><strong>No data leaves your browser.</strong> All calculations are performed locally. Nothing is transmitted to any server.</p>
        </div>
      )}
    </div>
  );
}

// ─── Input Field Components ───────────────────────────────────────────────────
function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6, color: C.teal }}>
        {label}{required && <span style={{ color: C.red }} aria-hidden> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`,
  borderRadius: 6, fontSize: 15, boxSizing: 'border-box', color: C.text, background: C.white,
};
const selectStyle: React.CSSProperties = { ...inputStyle };

// ─── Main Component ───────────────────────────────────────────────────────────
export const MedicareVsMedicaidCalculator: React.FC = () => {
  const uid = useId();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [result, setResult] = useState<MvcEligibilityResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setForm(f => ({ ...defaultForm, ...p.values }));
    setResult(null); setErrors([]);
  };

  const handleCalculate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!form.age || parseNum(form.age) < 1) errs.push('Please enter a valid age.');
    if (!form.householdStatus) errs.push('Please select your household status.');
    if (!form.state) errs.push('Please select your state.');
    if (!form.ss && !form.pension && !form.wages && !form.otherUnearned) errs.push('Please enter at least one income source.');
    if (form.resources === '') errs.push('Please enter your countable resources (enter 0 if none).');
    setErrors(errs);
    if (errs.length > 0) return;

    const input = buildInput(form);
    if (!input) { setErrors(['Please fill in all required fields.']); return; }
    const res = mvcCalculate(input);
    setResult(res);
    // Scroll to results
    setTimeout(() => document.getElementById(uid + '-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [form, uid]);

  const showSpouse = form.householdStatus === 'married_together';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: C.text, maxWidth: 820, margin: '0 auto' }}>

      {/* Presets */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Common situations — click to pre-fill the form:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              title={p.description}
              style={{ padding: '7px 14px', fontSize: 13, borderRadius: 20, border: `1.5px solid ${C.teal}`, background: C.white, color: C.teal, cursor: 'pointer', fontWeight: 600 }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleCalculate} noValidate>
        {/* Section 1: About You */}
        <fieldset style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <legend style={{ fontWeight: 700, color: C.teal, fontSize: 15, padding: '0 8px' }}>About You</legend>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <Field id={uid+'-age'} label="Your age" required>
              <input id={uid+'-age'} type="number" min={0} max={120} value={form.age} onChange={set('age')} style={inputStyle} aria-required="true" placeholder="e.g. 70" />
            </Field>
            <Field id={uid+'-hs'} label="Household status" required>
              <select id={uid+'-hs'} value={form.householdStatus} onChange={set('householdStatus')} style={selectStyle} aria-required="true">
                <option value="">— Select —</option>
                <option value="single">Single / never married</option>
                <option value="married_together">Married, living together</option>
                <option value="married_apart">Married, living apart</option>
                <option value="widowed">Widowed</option>
              </select>
            </Field>
            <Field id={uid+'-state'} label="Your state" required>
              <select
                id={uid+'-state'}
                value={form.state}
                onChange={e => {
                  const abbr = e.target.value;
                  setForm(f => ({ ...f, state: abbr, region: stateToRegion(abbr) }));
                }}
                style={selectStyle}
                aria-required="true"
              >
                <option value="">— Select your state —</option>
                {US_STATES.map(s => (
                  <option key={s.abbr} value={s.abbr}>{s.name}</option>
                ))}
              </select>
              {form.state && form.state === 'AK' && (
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Alaska uses higher federal poverty guidelines.</p>
              )}
              {form.state && form.state === 'HI' && (
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Hawaii uses higher federal poverty guidelines.</p>
              )}
            </Field>
          </div>
        </fieldset>

        {/* Section 2: Medicare Status */}
        <fieldset style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <legend style={{ fontWeight: 700, color: C.teal, fontSize: 15, padding: '0 8px' }}>Medicare Status</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <Field id={uid+'-wq'} label="Work quarters (for Part A)">
              <select id={uid+'-wq'} value={form.workQuarters} onChange={set('workQuarters')} style={selectStyle}>
                <option value="40">40+ quarters (free Part A)</option>
                <option value="35">30-39 quarters ($311/mo)</option>
                <option value="25">Under 30 quarters ($565/mo)</option>
              </select>
            </Field>
            <Field id={uid+'-ssdi'} label="Months of SSDI received (if under 65)">
              <input id={uid+'-ssdi'} type="number" min={0} value={form.ssdiMonths} onChange={set('ssdiMonths')} style={inputStyle} placeholder="0" />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={form.hasESRD} onChange={set('hasESRD')} />
              End-Stage Renal Disease (ESRD)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={form.hasALS} onChange={set('hasALS')} />
              ALS (Amyotrophic Lateral Sclerosis)
            </label>
          </div>
        </fieldset>

        {/* Section 3: Income */}
        <fieldset style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <legend style={{ fontWeight: 700, color: C.teal, fontSize: 15, padding: '0 8px' }}>Monthly Income (gross, before deductions)</legend>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 14px' }}>Enter your full Social Security check before any Medicare deductions.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Field id={uid+'-ss'} label="Social Security / SSDI" required>
              <input id={uid+'-ss'} type="number" min={0} value={form.ss} onChange={set('ss')} style={inputStyle} placeholder="$0" />
            </Field>
            <Field id={uid+'-pen'} label="Pension / annuity">
              <input id={uid+'-pen'} type="number" min={0} value={form.pension} onChange={set('pension')} style={inputStyle} placeholder="$0" />
            </Field>
            <Field id={uid+'-wages'} label="Wages / self-employment">
              <input id={uid+'-wages'} type="number" min={0} value={form.wages} onChange={set('wages')} style={inputStyle} placeholder="$0" />
            </Field>
            <Field id={uid+'-other'} label="Other (rent, interest, etc.)">
              <input id={uid+'-other'} type="number" min={0} value={form.otherUnearned} onChange={set('otherUnearned')} style={inputStyle} placeholder="$0" />
            </Field>
          </div>
          {showSpouse && (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.teal, margin: '16px 0 10px' }}>Spouse monthly income:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <Field id={uid+'-sss'} label="Spouse Social Security">
                  <input id={uid+'-sss'} type="number" min={0} value={form.spouseSS} onChange={set('spouseSS')} style={inputStyle} placeholder="$0" />
                </Field>
                <Field id={uid+'-spen'} label="Spouse pension">
                  <input id={uid+'-spen'} type="number" min={0} value={form.spousePension} onChange={set('spousePension')} style={inputStyle} placeholder="$0" />
                </Field>
                <Field id={uid+'-swg'} label="Spouse wages">
                  <input id={uid+'-swg'} type="number" min={0} value={form.spouseWages} onChange={set('spouseWages')} style={inputStyle} placeholder="$0" />
                </Field>
                <Field id={uid+'-soth'} label="Spouse other income">
                  <input id={uid+'-soth'} type="number" min={0} value={form.spouseOther} onChange={set('spouseOther')} style={inputStyle} placeholder="$0" />
                </Field>
              </div>
            </>
          )}
        </fieldset>

        {/* Section 4: Resources */}
        <fieldset style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <legend style={{ fontWeight: 700, color: C.teal, fontSize: 15, padding: '0 8px' }}>Countable Resources</legend>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 14px' }}>
            <strong>What counts:</strong> cash, checking/savings accounts, stocks, bonds, mutual funds, CDs, second home or car.<br/>
            <strong>What does NOT count:</strong> your primary home, one vehicle, household goods, personal belongings, and up to $1,500/person set aside for burial expenses.
          </p>
          <Field id={uid+'-res'} label="Total countable resources ($)" required>
            <input id={uid+'-res'} type="number" min={0} value={form.resources} onChange={set('resources')} style={{ ...inputStyle, maxWidth: 280 }} placeholder="e.g. 8000" aria-required="true" />
          </Field>
        </fieldset>

        {/* Section 5: Expected Medicare Usage */}
        <fieldset style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <legend style={{ fontWeight: 700, color: C.teal, fontSize: 15, padding: '0 8px' }}>Expected Medicare Usage (this year)</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Field id={uid+'-partb'} label="Expected Part B charges (annual)">
              <input id={uid+'-partb'} type="number" min={0} value={form.annualPartBCharges} onChange={set('annualPartBCharges')} style={inputStyle} placeholder="2000" />
            </Field>
            <Field id={uid+'-hosp'} label="Hospital stays (number)">
              <input id={uid+'-hosp'} type="number" min={0} value={form.hospitalStays} onChange={set('hospitalStays')} style={inputStyle} placeholder="0" />
            </Field>
            <Field id={uid+'-hdays'} label="Total hospital days">
              <input id={uid+'-hdays'} type="number" min={0} value={form.hospitalDays} onChange={set('hospitalDays')} style={inputStyle} placeholder="0" />
            </Field>
            <Field id={uid+'-snf'} label="Skilled nursing facility days">
              <input id={uid+'-snf'} type="number" min={0} value={form.snfDays} onChange={set('snfDays')} style={inputStyle} placeholder="0" />
            </Field>
          </div>
        </fieldset>

        {/* Section 6: Living Situation */}
        <fieldset style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <legend style={{ fontWeight: 700, color: C.teal, fontSize: 15, padding: '0 8px' }}>Living Situation</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <Field id={uid+'-living'} label="Where do you live?">
              <select id={uid+'-living'} value={form.livingSituation} onChange={set('livingSituation')} style={selectStyle}>
                <option value="home">At home / community</option>
                <option value="assisted_living">Assisted living facility</option>
                <option value="nursing_facility">Nursing facility (long-term care)</option>
              </select>
            </Field>
            {form.livingSituation !== 'home' && (
              <Field id={uid+'-faccost'} label="Monthly facility cost ($)">
                <input id={uid+'-faccost'} type="number" min={0} value={form.facilityCost} onChange={set('facilityCost')} style={inputStyle} placeholder="0" />
              </Field>
            )}
          </div>
        </fieldset>

        {/* Section 7: Optional — IRMAA and 2027 */}
        <details style={{ border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 20 }}>
          <summary style={{ padding: '14px 18px', cursor: 'pointer', fontWeight: 600, color: C.teal, fontSize: 14 }}>
            Optional: IRMAA (high income) and 2027 preview
          </summary>
          <div style={{ padding: '0 18px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 14 }}>
              <Field id={uid+'-magi'} label="2024 MAGI (for IRMAA — leave blank if under $109,000)">
                <input id={uid+'-magi'} type="number" min={0} value={form.magi} onChange={set('magi')} style={inputStyle} placeholder="Leave blank if not applicable" />
              </Field>
              <Field id={uid+'-fs'} label="Tax filing status (for IRMAA)">
                <select id={uid+'-fs'} value={form.filingStatus} onChange={set('filingStatus')} style={selectStyle}>
                  <option value="single">Single</option>
                  <option value="mfj">Married filing jointly</option>
                  <option value="mfs">Married filing separately</option>
                </select>
              </Field>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, marginTop: 8 }}>
              <input type="checkbox" checked={form.show2027} onChange={set('show2027')} />
              Show January 2027 preview (3.6% COLA applied; 2027 poverty guidelines are pending)
            </label>
          </div>
        </details>

        {/* Errors */}
        {errors.length > 0 && (
          <div role="alert" style={{ background: '#FFF0F0', border: `1.5px solid ${C.red}`, borderRadius: 8, padding: '12px 18px', marginBottom: 16 }}>
            <strong style={{ color: C.red }}>Please fix the following:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              {errors.map((e, i) => <li key={i} style={{ color: C.red, fontSize: 14 }}>{e}</li>)}
            </ul>
          </div>
        )}

        <button
          type="submit"
          style={{ width: '100%', padding: '16px', background: C.teal, color: C.white, border: 'none', borderRadius: 8, fontSize: 17, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 }}
        >
          Calculate My Medicare vs. Medicaid Comparison
        </button>
      </form>

      {/* Results */}
      {result && (
        <div id={uid + '-results'} style={{ marginTop: 32 }}>
          <h2 style={{ color: C.teal, fontSize: 22, borderBottom: `3px solid ${C.gold}`, paddingBottom: 10, marginBottom: 24 }}>
            Your Results
          </h2>

          {/* Data Notice */}
          <div style={{ background: '#FFF8E1', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 13 }}>
            <strong style={{ color: C.amber }}>⚑ Data Notice:</strong> Full Medicaid income limits use SSI Federal Benefit Rates ($994/month individual) which are <strong>UNVERIFIED</strong> for 2026 — derived by back-calculating the 3.6% COLA. MSP limits ($1,350/$1,616/$1,816) are officially verified. All results are estimates — verify with your state Medicaid office or a SHIP counselor.
          </div>

          {/* State-specific note */}
          {form.state && (
            <div style={{ background: '#EEF6F5', border: `1.5px solid ${C.teal}`, borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 13 }}>
              <strong style={{ color: C.teal }}>📍 {getStateName(form.state)} results:</strong>{' '}
              {NON_EXPANSION_STATES.has(form.state)
                ? <span><strong>{getStateName(form.state)} did not expand Medicaid</strong> under the ACA. Adults under 65 without a qualifying disability or dependent children generally do not qualify for full Medicaid regardless of income. However, seniors 65+ may still qualify under Aged, Blind &amp; Disabled (ABD) Medicaid rules — and Medicare Savings Programs (QMB/SLMB/QI) are available in all 50 states. <em>Verify at your state Medicaid office.</em></span>
                : <span>{getStateName(form.state)} expanded Medicaid under the ACA. Adults with income up to 138% FPL may qualify for full Medicaid. Seniors 65+ qualify under Aged, Blind &amp; Disabled rules with income and asset tests. MSP limits shown use the standard federal baseline — <em>your state may have higher thresholds or waived resource tests. Verify at your state Medicaid agency.</em></span>
              }
              {form.state === 'AK' && <span> Alaska's higher FPL (<strong>$24,690 / yr individual</strong>) is applied to all poverty-linked calculations.</span>}
              {form.state === 'HI' && <span> Hawaii's higher FPL (<strong>$22,540 / yr individual</strong>) is applied to all poverty-linked calculations.</span>}
            </div>
          )}

          {/* 3 Verdict Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            <VerdictTile
              title="Medicare"
              verdict={result.medicareEligible ? 'may' : 'unlikely'}
              detail={result.medicareReason + (result.medicareEligible ? ' Part A premium: $' + result.partAPremium + '/month.' : '')}
              source="CMS Medicare eligibility rules"
            />
            <VerdictTile
              title={'Medicare Savings Program — ' + (result.msp.tier !== 'none' ? result.msp.tier : 'MSP')}
              verdict={result.msp.tier !== 'none' ? 'may' : result.msp.resourcesPass ? 'unlikely' : 'depends'}
              detail={mspTierLabel(result.msp.tier) + '. Countable income: $' + result.msp.countableIncome.toFixed(0) + '/mo. Resource test: ' + (result.msp.resourcesPass ? 'Passed' : 'Failed — federal limit. Some states waive the resource test.')}
              source="medicare.gov MSP limits 2026"
            />
            <VerdictTile
              title={'Dual Status: ' + dualStatusLabel(result.dualStatus)}
              verdict={result.dualStatus === 'full_dual' || result.dualStatus === 'qmb_only' ? 'may' : result.dualStatus === 'medicare_only' ? 'unlikely' : 'depends'}
              detail={result.fullMedicaidReason + (result.extraHelpQualifies ? ' Extra Help for Part D: may qualify.' : '')}
              source="CMS/SSA federal baseline — state verification required"
            />
          </div>

          {/* Cost Table */}
          <CostTable result={result} show2027={form.show2027} ss2026={parseNum(form.ss)} />

          {/* Who Pays First */}
          <WhoPaysFIrst result={result} />

          {/* Income Headroom */}
          <IncomeHeadroom result={result} />

          {/* Next Steps */}
          <NextSteps result={result} />

          {/* Method Panel */}
          <MethodPanel result={result} />

          {/* Unreviewed label per spec §8 */}
          <div style={{ background: '#F9FAFB', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 18px', fontSize: 13, color: C.muted, marginBottom: 16 }}>
            <strong>⚑ Unreviewed:</strong> This calculator has not yet been reviewed by a qualified SHIP counselor or Medicare specialist. Treat all outputs as estimates only. When a qualified reviewer verifies the tool, this notice will be replaced with their name and date.
          </div>

          {/* Print */}
          <button
            onClick={() => window.print()}
            style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 6, padding: '10px 20px', fontSize: 14, cursor: 'pointer', color: C.teal, fontWeight: 600 }}
          >
            🖨 Print / Save Summary
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicareVsMedicaidCalculator;
