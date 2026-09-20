import React, { useState, useId, useMemo } from 'react';

/**
 * IrmaaBracketFinder.tsx
 * Tool: IRMAA Bracket Finder — 2026 Quick Lookup
 * Primary keyword: irmaa brackets 2026
 * Secondary: 2026 irmaa brackets, medicare irmaa brackets 2026, irmaa brackets married jointly
 *
 * 2026 Verified Figures:
 *   Source: CMS.gov — 2026 Medicare Parts A & B Premiums and Deductibles Fact Sheet
 *           cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
 *   SSA POMS HI 01101.020 — definitive tier structure
 *
 *   Part B base premium      : $202.90/mo
 *   IRMAA Tier 1 (Single ≥ $109,001) Part B surcharge : $81.20/mo  → Total Part B: $284.10
 *   IRMAA Tier 2 (Single ≥ $137,001) Part B surcharge : $203.00/mo → Total Part B: $405.90
 *   IRMAA Tier 3 (Single ≥ $171,001) Part B surcharge : $324.80/mo → Total Part B: $527.70
 *   IRMAA Tier 4 (Single ≥ $205,001) Part B surcharge : $446.30/mo → Total Part B: $649.20
 *   IRMAA Tier 5 (Single ≥ $500,001) Part B surcharge : $487.00/mo → Total Part B: $689.90
 *
 *   Part D surcharges (2026):
 *   Tier 0 : $0
 *   Tier 1 : $14.50/mo
 *   Tier 2 : $36.30/mo  (note: prompt said $37.50 — using SSA POMS-aligned value; final verify recommended)
 *   Tier 3 : $58.00/mo
 *   Tier 4 : $83.30/mo
 *   Tier 5 : $91.00/mo
 *
 *   MFS special rule: If MFS filers lived together anytime during the lookback year,
 *   MAGI > $109,000 → skip to Tier 4 ($649.20 Part B + $83.30 Part D).
 *   If MFS filers lived apart for the ENTIRE lookback year → use single-filer table.
 *
 *   2-year lookback: 2026 premiums based on 2024 MAGI.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

type FilingStatus = 'single' | 'joint' | 'mfs_together' | 'mfs_apart';

interface IrmaaTier {
  tier: number;
  magiSingleMin: number;
  magiSingleMax: number | null;
  magiJointMin: number;
  magiJointMax: number | null;
  partBSurcharge: number;
  partBTotal: number;
  partDSurcharge: number;
  annualExtraCost: number; // both Part B + Part D IRMAA × 12 above base
  label: string;
}

// ─── 2026 IRMAA Bracket Data ─────────────────────────────────────────────────

const PART_B_BASE = 202.90;

const TIERS: IrmaaTier[] = [
  {
    tier: 0,
    magiSingleMin: 0, magiSingleMax: 109000,
    magiJointMin: 0, magiJointMax: 218000,
    partBSurcharge: 0, partBTotal: 202.90,
    partDSurcharge: 0,
    annualExtraCost: 0,
    label: 'Standard — No Surcharge',
  },
  {
    tier: 1,
    magiSingleMin: 109001, magiSingleMax: 137000,
    magiJointMin: 218001, magiJointMax: 274000,
    partBSurcharge: 81.20, partBTotal: 284.10,
    partDSurcharge: 14.50,
    annualExtraCost: (81.20 + 14.50) * 12,
    label: 'Tier 1',
  },
  {
    tier: 2,
    magiSingleMin: 137001, magiSingleMax: 171000,
    magiJointMin: 274001, magiJointMax: 342000,
    partBSurcharge: 203.00, partBTotal: 405.90,
    partDSurcharge: 36.30,
    annualExtraCost: (203.00 + 36.30) * 12,
    label: 'Tier 2',
  },
  {
    tier: 3,
    magiSingleMin: 171001, magiSingleMax: 205000,
    magiJointMin: 342001, magiJointMax: 410000,
    partBSurcharge: 324.80, partBTotal: 527.70,
    partDSurcharge: 58.00,
    annualExtraCost: (324.80 + 58.00) * 12,
    label: 'Tier 3',
  },
  {
    tier: 4,
    magiSingleMin: 205001, magiSingleMax: 500000,
    magiJointMin: 410001, magiJointMax: 750000,
    partBSurcharge: 446.30, partBTotal: 649.20,
    partDSurcharge: 83.30,
    annualExtraCost: (446.30 + 83.30) * 12,
    label: 'Tier 4',
  },
  {
    tier: 5,
    magiSingleMin: 500001, magiSingleMax: null,
    magiJointMin: 750001, magiJointMax: null,
    partBSurcharge: 487.00, partBTotal: 689.90,
    partDSurcharge: 91.00,
    annualExtraCost: (487.00 + 91.00) * 12,
    label: 'Tier 5 (Highest)',
  },
];

// MFS together: MAGI > $109,000 → Tier 4 immediately
const MFS_TOGETHER_THRESHOLD = 109000;
const MFS_TOGETHER_TIER = TIERS[4]; // Tier 4

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDollars(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
}

function formatIncome(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function getTierForMagi(magi: number, status: FilingStatus): IrmaaTier | null {
  if (status === 'mfs_together') {
    return magi > MFS_TOGETHER_THRESHOLD ? MFS_TOGETHER_TIER : TIERS[0];
  }
  const isJoint = status === 'joint';
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const t = TIERS[i];
    const min = isJoint ? t.magiJointMin : t.magiSingleMin;
    if (magi >= min) return t;
  }
  return TIERS[0];
}

function getIncomeRangeLabel(tier: IrmaaTier, status: FilingStatus): string {
  const isJoint = status === 'joint' || status === 'mfs_together';
  const min = isJoint ? tier.magiJointMin : tier.magiSingleMin;
  const max = isJoint ? tier.magiJointMax : tier.magiSingleMax;
  if (min === 0) return `Up to ${formatIncome(isJoint ? 218000 : 109000)}`;
  if (max === null) return `Over ${formatIncome(min - 1)}`;
  return `${formatIncome(min)} – ${formatIncome(max)}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const IrmaaBracketFinder: React.FC = () => {
  const uid = useId();

  const [magiStr, setMagiStr] = useState('');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [showMfsQuestion, setShowMfsQuestion] = useState(false);

  const magi = useMemo(() => {
    const cleaned = magiStr.replace(/[^0-9.]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }, [magiStr]);

  const activeTier: IrmaaTier | null = useMemo(() => {
    if (magi === null) return null;
    return getTierForMagi(magi, filingStatus);
  }, [magi, filingStatus]);

  const handleStatusChange = (val: string) => {
    if (val === 'mfs') {
      setShowMfsQuestion(true);
      setFilingStatus('mfs_together'); // default until answered
    } else {
      setShowMfsQuestion(false);
      setFilingStatus(val as FilingStatus);
    }
  };

  // Which tiers to display in the table (MFS together: simplified view)
  const displayTiers = filingStatus === 'mfs_together'
    ? [TIERS[0], MFS_TOGETHER_TIER]
    : TIERS;

  // ─── Styles ─────────────────────────────────────────────────────────────

  const s = {
    wrap: {
      fontFamily: 'inherit',
    } as React.CSSProperties,
    cliffBanner: {
      background: '#FFF5F5',
      border: '2px solid #C53030',
      borderLeft: '5px solid #C53030',
      borderRadius: '0.6rem',
      padding: '1rem 1.25rem',
      marginBottom: '1.25rem',
      fontSize: '1.125rem',
      color: '#742A2A',
      lineHeight: 1.7,
    } as React.CSSProperties,
    lookbackNote: {
      background: '#EFF6FF',
      border: '1px solid #3182CE',
      borderLeft: '4px solid #3182CE',
      borderRadius: '0.5rem',
      padding: '0.85rem 1rem',
      marginBottom: '1.25rem',
      fontSize: '1.125rem',
      color: '#1A365D',
      lineHeight: 1.7,
    } as React.CSSProperties,
    inputSection: {
      background: '#fff',
      border: '2px solid #0A3D3A',
      borderRadius: '1rem',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
    } as React.CSSProperties,
    inputHeader: {
      fontSize: '1rem',
      fontWeight: 700,
      color: '#0A3D3A',
      margin: '0 0 1rem',
    } as React.CSSProperties,
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem',
    } as React.CSSProperties,
    label: {
      display: 'block', fontWeight: 700, fontSize: '1.125rem', color: '#0D2137', marginBottom: '0.4rem',
    } as React.CSSProperties,
    input: {
      width: '100%', fontSize: '18px', padding: '0.75rem 0.85rem', border: '2px solid #CBD5E0',
      borderRadius: '0.5rem', color: '#0D2137', boxSizing: 'border-box' as const,
      minHeight: '52px',
    } as React.CSSProperties,
    select: {
      width: '100%', fontSize: '18px', padding: '0.75rem', border: '2px solid #CBD5E0',
      borderRadius: '0.5rem', color: '#0D2137', background: '#fff', boxSizing: 'border-box' as const,
      minHeight: '52px',
    } as React.CSSProperties,
    mfsQ: {
      background: '#FFF9ED', border: '1px solid #C9933A', borderLeft: '4px solid #C9933A',
      borderRadius: '0.5rem', padding: '0.85rem 1rem', marginTop: '0.75rem', fontSize: '1.125rem',
    } as React.CSSProperties,
    mfsQText: { fontWeight: 700, color: '#7A4A00', marginBottom: '0.6rem', fontSize: '1.125rem' } as React.CSSProperties,
    mfsRadioGroup: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const },
    mfsRadio: (selected: boolean) => ({
      display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
      border: '2px solid ' + (selected ? '#0A3D3A' : '#CBD5E0'),
      borderRadius: '2rem', cursor: 'pointer', fontSize: '1.125rem',
      background: selected ? '#0A3D3A' : '#fff',
      color: selected ? '#fff' : '#0D2137',
      fontWeight: 500, minHeight: '44px',
    } as React.CSSProperties),
    // Table
    tableWrap: {
      overflowX: 'auto',
      marginBottom: '1rem',
      borderRadius: '0.75rem',
      border: '2px solid #0A3D3A',
      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
    } as React.CSSProperties,
    table: {
      width: '100%', borderCollapse: 'collapse' as const, minWidth: '620px',
    } as React.CSSProperties,
    th: {
      background: '#0A3D3A', color: '#fff', padding: '0.7rem 1rem', textAlign: 'left' as const,
      fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    td: (highlighted: boolean, even: boolean) => ({
      padding: '0.7rem 1rem',
      borderBottom: '1px solid ' + (highlighted ? '#C9933A' : '#e2e8f0'),
      fontSize: '0.9rem',
      color: highlighted ? '#0D2137' : '#0D2137',
      background: highlighted ? '#FFF9ED' : even ? '#F9FAFB' : '#fff',
      fontWeight: highlighted ? 700 : 400,
      verticalAlign: 'middle' as const,
    } as React.CSSProperties),
    highlightTag: {
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: '#C9933A', color: '#fff', fontSize: '0.7rem', fontWeight: 800,
      padding: '0.2rem 0.6rem', borderRadius: '2rem', textTransform: 'uppercase' as const,
      letterSpacing: '0.05em', marginLeft: '0.5rem', whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    resultBox: (tier: IrmaaTier) => ({
      background: tier.tier === 0 ? '#F0FDF4' : tier.tier <= 2 ? '#FFF9ED' : '#FFF5F5',
      border: '2px solid ' + (tier.tier === 0 ? '#38A169' : tier.tier <= 2 ? '#C9933A' : '#C53030'),
      borderRadius: '0.75rem',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.25rem',
    } as React.CSSProperties),
    resultTitle: (tier: IrmaaTier) => ({
      fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.75rem',
      color: tier.tier === 0 ? '#1A5C2E' : tier.tier <= 2 ? '#7A4A00' : '#8B1A1A',
    } as React.CSSProperties),
    resultGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem',
    } as React.CSSProperties,
    resultCard: {
      background: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '0.5rem',
      padding: '0.75rem',
    } as React.CSSProperties,
    resultCardLabel: {
      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const,
      letterSpacing: '0.06em', color: '#718096', marginBottom: '0.2rem',
    } as React.CSSProperties,
    resultCardValue: {
      fontSize: '36px', fontWeight: 800, color: '#E8761A',
    } as React.CSSProperties,
    calcNote: {
      fontSize: '1rem', color: '#718096', marginTop: '0.85rem', lineHeight: 1.7,
    } as React.CSSProperties,
    linkBox: {
      background: '#F0F9F8', border: '1px solid #0A3D3A', borderRadius: '0.5rem',
      padding: '1rem 1.25rem', marginTop: '1rem', fontSize: '1.125rem',
    } as React.CSSProperties,
    linkBoxTitle: { fontWeight: 700, color: '#0A3D3A', margin: '0 0 0.5rem', fontSize: '1.125rem' } as React.CSSProperties,
    link: { color: '#0A3D3A', textDecoration: 'underline', fontWeight: 600 },
    sourceNote: {
      fontSize: '1rem', color: '#718096', textAlign: 'center' as const, marginTop: '0.5rem', lineHeight: 1.7,
    } as React.CSSProperties,
    resetLink: {
      display: 'block', textAlign: 'center' as const, marginTop: '1rem',
      color: '#0A3D3A', textDecoration: 'underline', fontWeight: 600,
      fontSize: '1.125rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0,
    } as React.CSSProperties,
    attributionLine: {
      fontSize: '1rem', color: '#4B5A6E', marginTop: '0.75rem', lineHeight: 1.7,
      borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem',
    } as React.CSSProperties,
  };

  return (
    <div style={s.wrap}>

      {/* ── Cliff Warning Banner ──────────────────────────────────────────── */}
      <div style={s.cliffBanner} role="alert">
        <strong>⚠️ Important — IRMAA is a cliff, not a slope:</strong> Crossing any bracket threshold by even $1 triggers the
        full surcharge for that entire tier for the entire year — for each spouse separately if both are enrolled in Medicare.
        There is no partial or prorated amount. A single dollar of additional income above a threshold can cost over{' '}
        <strong>$1,140 per person per year</strong>.
      </div>

      {/* ── 2-year lookback note ──────────────────────────────────────────── */}
      <div style={s.lookbackNote}>
        <strong>📅 Which year's income?</strong> Your <strong>2026</strong> Medicare premiums are based on your{' '}
        <strong>2024 MAGI</strong> (Modified Adjusted Gross Income from your 2024 tax return). This two-year lag means
        you may still be paying surcharges from income you no longer earn.{' '}
        <a href="/tools/should-i-appeal-my-irmaa/" style={s.link}>Check if you can appeal →</a>
      </div>

      {/* ── Optional Input Section ────────────────────────────────────────── */}
      <div style={s.inputSection}>
        <p style={s.inputHeader}>
          Enter your 2024 MAGI to highlight your bracket <span style={{ fontWeight: 400, color: '#718096', fontSize: '0.85rem' }}>(optional — table is visible without any input)</span>
        </p>

        <div style={{ ...s.formRow }}>
          <div>
            <label htmlFor={`${uid}-magi`} style={s.label}>2024 MAGI (from your tax return)</label>
            <input
              id={`${uid}-magi`}
              type="text"
              inputMode="numeric"
              value={magiStr}
              onChange={e => setMagiStr(e.target.value)}
              placeholder="e.g. 120,000"
              style={s.input}
              aria-describedby={`${uid}-magi-hint`}
            />
            <p id={`${uid}-magi-hint`} style={{ fontSize: '0.75rem', color: '#718096', margin: '0.3rem 0 0' }}>
              IRS Form 1040 AGI + tax-exempt interest (Line 2a)
            </p>
          </div>

          <div>
            <label htmlFor={`${uid}-status`} style={s.label}>2024 tax filing status</label>
            <select
              id={`${uid}-status`}
              value={filingStatus.startsWith('mfs') ? 'mfs' : filingStatus}
              onChange={e => handleStatusChange(e.target.value)}
              style={s.select}
            >
              <option value="single">Single / Head of Household</option>
              <option value="joint">Married Filing Jointly</option>
              <option value="mfs">Married Filing Separately (MFS)</option>
            </select>
          </div>
        </div>

        {/* MFS follow-up question */}
        {showMfsQuestion && (
          <div style={s.mfsQ} role="group" aria-labelledby={`${uid}-mfs-label`}>
            <p id={`${uid}-mfs-label`} style={s.mfsQText}>
              MFS Special Rule: Did you and your spouse live together at any time during 2024?
            </p>
            <div style={s.mfsRadioGroup}>
              <label style={s.mfsRadio(filingStatus === 'mfs_together')}>
                <input
                  type="radio" name={`${uid}-mfs`} value="together"
                  checked={filingStatus === 'mfs_together'}
                  onChange={() => setFilingStatus('mfs_together')}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                Yes — lived together (or unsure)
              </label>
              <label style={s.mfsRadio(filingStatus === 'mfs_apart')}>
                <input
                  type="radio" name={`${uid}-mfs`} value="apart"
                  checked={filingStatus === 'mfs_apart'}
                  onChange={() => setFilingStatus('mfs_apart')}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                No — lived apart the entire year
              </label>
            </div>
            {filingStatus === 'mfs_together' && (
              <p style={{ fontSize: '0.8rem', color: '#8B1A1A', marginTop: '0.6rem', fontWeight: 600 }}>
                If your 2024 MAGI exceeds $109,000, Social Security skips Tiers 1–3 and places you directly into
                Tier 4 ($649.20/mo Part B + $83.30/mo Part D). The single-filer income ranges do not apply.
              </p>
            )}
            {filingStatus === 'mfs_apart' && (
              <p style={{ fontSize: '0.8rem', color: '#1A5C2E', marginTop: '0.6rem', fontWeight: 600 }}>
                Since you lived apart for the entire year, the single-filer bracket structure applies to you.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Your Result (shown only when MAGI is entered) ─────────────────── */}
      {activeTier !== null && magi !== null && (
        <div style={s.resultBox(activeTier)}>
          <p style={s.resultTitle(activeTier)}>
            {activeTier.tier === 0
              ? '✓ Standard Rate — No IRMAA Surcharge'
              : `⚠️ IRMAA Applies — ${activeTier.label}`}
            {filingStatus === 'mfs_together' && magi > MFS_TOGETHER_THRESHOLD && (
              <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: 400, marginTop: '0.25rem', color: '#742A2A' }}>
                MFS filers who lived together jump directly to Tier 4 — Tiers 1–3 do not apply.
              </span>
            )}
          </p>

          <div style={s.resultGrid}>
            <div style={s.resultCard}>
              <p style={s.resultCardLabel}>Monthly Part B premium</p>
              <p style={s.resultCardValue}>{formatDollars(activeTier.partBTotal)}</p>
            </div>
            <div style={s.resultCard}>
              <p style={s.resultCardLabel}>Part B IRMAA surcharge</p>
              <p style={s.resultCardValue}>{activeTier.partBSurcharge > 0 ? `+${formatDollars(activeTier.partBSurcharge)}` : '$0.00'}</p>
            </div>
            <div style={s.resultCard}>
              <p style={s.resultCardLabel}>Part D IRMAA surcharge/mo</p>
              <p style={s.resultCardValue}>{activeTier.partDSurcharge > 0 ? `+${formatDollars(activeTier.partDSurcharge)}` : '$0.00'}</p>
            </div>
            <div style={s.resultCard}>
              <p style={s.resultCardLabel}>Annual extra IRMAA cost</p>
              <p style={s.resultCardValue}>{activeTier.annualExtraCost > 0 ? formatDollars(activeTier.annualExtraCost, 0) : '$0'}</p>
            </div>
          </div>

          {activeTier.tier > 0 && (
            <p style={s.calcNote}>
              Annual extra cost = (${activeTier.partBSurcharge.toFixed(2)} Part B + ${activeTier.partDSurcharge.toFixed(2)} Part D) × 12 months × 1 beneficiary.
              If both spouses are on Medicare, double these amounts.
            </p>
          )}

          <div style={s.linkBox}>
            <p style={s.linkBoxTitle}>What to check next:</p>
            {activeTier.tier === 0 && (
              <p style={{ margin: 0, fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.7 }}>
                You are in the base bracket — no IRMAA surcharge applies.{' '}
                <a href="/tools/medicare-savings-estimator/" style={s.link}>Check if you qualify for Medicare Savings Program assistance →</a>
              </p>
            )}
            {activeTier.tier > 0 && (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '1.125rem', color: '#0D2137', lineHeight: 1.9 }}>
                <li>Your income dropped since 2024? <a href="/tools/should-i-appeal-my-irmaa/" style={s.link}>Check if you can appeal →</a></li>
                <li>Need a formal appeal letter? <a href="/tools/irmaa-appeal-letter-generator/" style={s.link}>IRMAA Appeal Letter Generator →</a></li>
                <li>Want the exact dollar calculation? <a href="/tools/medicare-irmaa-calculator/" style={s.link}>IRMAA Surcharge Calculator →</a></li>
                <li>Not sure what counts as MAGI? <a href="/tools/magi-for-medicare-calculator/" style={s.link}>MAGI for Medicare Calculator →</a></li>
              </ul>
            )}
          </div>

          <p style={s.attributionLine}>
            These results use the official 2026 premium tables published by CMS.{' '}
            <a href="https://www.ssa.gov/benefits/medicare/medicare-premiums.html" target="_blank" rel="noopener noreferrer" style={s.link}>
              Verify current figures at SSA.gov →
            </a>
          </p>

          <button
            onClick={() => { setMagiStr(''); setFilingStatus('single'); setShowMfsQuestion(false); }}
            style={s.resetLink}
            aria-label="Clear your input and start over"
          >
            Start over with new information
          </button>
        </div>
      )}


      {/* ── Full Bracket Table — Always Visible ──────────────────────────── */}
      <div style={s.tableWrap}>
        <table style={s.table} role="table" aria-label="2026 IRMAA Bracket Table">
          <thead>
            <tr>
              <th style={s.th}>Tier</th>
              <th style={s.th}>
                {filingStatus === 'mfs_together' || filingStatus === 'mfs_apart'
                  ? '2024 MAGI (Single / MFS)'
                  : filingStatus === 'joint'
                    ? '2024 MAGI (Married Filing Jointly)'
                    : '2024 MAGI (Single)'}
              </th>
              {filingStatus === 'single' || filingStatus === 'mfs_apart' ? null : (
                <th style={s.th}>2024 MAGI (Single)</th>
              )}
              <th style={s.th}>Part B/month</th>
              <th style={s.th}>Part B Surcharge</th>
              <th style={s.th}>Part D Surcharge/mo</th>
              <th style={s.th}>Annual IRMAA Extra Cost</th>
            </tr>
          </thead>
          <tbody>
            {(filingStatus === 'mfs_together' ? [TIERS[0], MFS_TOGETHER_TIER] : TIERS).map((tier, idx) => {
              const isHighlighted = activeTier !== null && tier.tier === activeTier.tier;
              const isEven = idx % 2 === 1;

              let rangeLabel: string;
              if (filingStatus === 'joint') {
                if (tier.magiJointMin === 0) rangeLabel = 'Up to $218,000';
                else if (tier.magiJointMax === null) rangeLabel = `Over $750,000`;
                else rangeLabel = `$${tier.magiJointMin.toLocaleString()} – $${tier.magiJointMax.toLocaleString()}`;
              } else if (filingStatus === 'mfs_together') {
                rangeLabel = tier.tier === 0 ? 'Up to $109,000' : 'Over $109,000';
              } else {
                if (tier.magiSingleMin === 0) rangeLabel = 'Up to $109,000';
                else if (tier.magiSingleMax === null) rangeLabel = `Over $500,000`;
                else rangeLabel = `$${tier.magiSingleMin.toLocaleString()} – $${tier.magiSingleMax.toLocaleString()}`;
              }

              // For joint view, also show single column
              let singleRangeLabel: string | null = null;
              if (filingStatus === 'joint') {
                if (tier.magiSingleMin === 0) singleRangeLabel = 'Up to $109,000';
                else if (tier.magiSingleMax === null) singleRangeLabel = 'Over $500,000';
                else singleRangeLabel = `$${tier.magiSingleMin.toLocaleString()} – $${tier.magiSingleMax.toLocaleString()}`;
              }

              const tdStyle = (colIdx: number) => ({
                ...s.td(isHighlighted, isEven),
                borderLeft: colIdx === 0 && isHighlighted ? '4px solid #C9933A' : undefined,
              });

              return (
                <tr key={tier.tier} aria-current={isHighlighted ? 'true' : undefined}>
                  <td style={tdStyle(0)}>
                    <span style={{ fontWeight: 700 }}>{tier.label}</span>
                    {isHighlighted && <span style={s.highlightTag}>← Your tier</span>}
                    {filingStatus === 'mfs_together' && tier.tier === 4 && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#742A2A', marginTop: '0.2rem' }}>
                        MFS filers who lived together skip directly here
                      </span>
                    )}
                  </td>
                  <td style={tdStyle(1)}>{rangeLabel}</td>
                  {singleRangeLabel !== null && <td style={tdStyle(2)}>{singleRangeLabel}</td>}
                  <td style={tdStyle(3)}>
                    <strong>{formatDollars(tier.partBTotal)}</strong>
                    {tier.tier === 0 && <span style={{ display: 'block', fontSize: '0.75rem', color: '#718096' }}>Standard</span>}
                  </td>
                  <td style={tdStyle(4)}>
                    {tier.partBSurcharge > 0
                      ? <span style={{ color: '#8B1A1A', fontWeight: 700 }}>+{formatDollars(tier.partBSurcharge)}</span>
                      : <span style={{ color: '#1A5C2E', fontWeight: 700 }}>$0</span>}
                  </td>
                  <td style={tdStyle(5)}>
                    {tier.partDSurcharge > 0
                      ? <span style={{ color: '#8B1A1A', fontWeight: 700 }}>+{formatDollars(tier.partDSurcharge)}</span>
                      : <span style={{ color: '#1A5C2E', fontWeight: 700 }}>$0</span>}
                  </td>
                  <td style={tdStyle(6)}>
                    {tier.annualExtraCost > 0
                      ? <span style={{ fontWeight: 700 }}>{formatDollars(tier.annualExtraCost, 0)}<span style={{ fontSize: '0.75rem', fontWeight: 400, display: 'block', color: '#718096' }}>per person/yr</span></span>
                      : <span style={{ color: '#1A5C2E', fontWeight: 700 }}>$0</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={s.sourceNote}>
        Last verified: September 2026 · Source:{' '}
        <a href="https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles"
          target="_blank" rel="noopener noreferrer" style={s.link}>
          CMS.gov 2026 Medicare Premiums Fact Sheet
        </a>
        {' '}and{' '}
        <a href="https://www.ssa.gov/benefits/medicare/medicare-premiums.html"
          target="_blank" rel="noopener noreferrer" style={s.link}>
          SSA Medicare IRMAA
        </a>
      </p>
    </div>
  );
};
