import React, { useState, useId } from 'react';

/**
 * MedigapComparisonTool.tsx
 * Tool: Medigap Plan Comparison Tool
 * Primary keyword: medigap plan comparison tool
 */

export type SelectedPlan = 'plan_g' | 'plan_n' | 'plan_a' | 'plan_f';

interface MedigapResult {
  planName: string;
  avgMonthlyPrem: number;
  partADeductibleCovered: boolean;
  partBDeductibleCovered: boolean;
  partBCoinsuranceCovered: boolean;
  excessChargesCovered: boolean;
  copayDetails: string;
  verdict: string;
}

export const MedigapComparisonTool: React.FC = () => {
  const uid = useId();

  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>('plan_g');
  const [userAge, setUserAge] = useState<number>(65);

  const [result, setResult] = useState<MedigapResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    let planName = '';
    let avgMonthlyPrem = 165;
    let partADeductibleCovered = true;
    let partBDeductibleCovered = false;
    let partBCoinsuranceCovered = true;
    let excessChargesCovered = true;
    let copayDetails = '';
    let verdict = '';

    if (selectedPlan === 'plan_g') {
      planName = 'Medigap Plan G (Most Popular Overall)';
      avgMonthlyPrem = userAge <= 67 ? 165 : 195;
      partADeductibleCovered = true;
      partBDeductibleCovered = false; // Plan G covers everything EXCEPT the $240 Part B deductible
      partBCoinsuranceCovered = true;
      excessChargesCovered = true;
      copayDetails = '$0 copays after paying annual $240 Part B deductible.';
      verdict = 'Plan G is the gold standard for new Medicare enrollees. After you pay the small annual Part B deductible ($240 in 2026), Plan G covers 100% of all Medicare-covered medical bills.';
    } else if (selectedPlan === 'plan_n') {
      planName = 'Medigap Plan N (Lower Premium Option)';
      avgMonthlyPrem = userAge <= 67 ? 125 : 150;
      partADeductibleCovered = true;
      partBDeductibleCovered = false;
      partBCoinsuranceCovered = true;
      excessChargesCovered = false; // Does not cover Part B excess charges
      copayDetails = 'Up to $20 copay per doctor visit and $50 per ER visit. Part B excess charges not covered.';
      verdict = 'Plan N offers ~25% lower monthly premiums than Plan G in exchange for small copays ($20/visit) and non-coverage of rare Part B excess charges.';
    } else if (selectedPlan === 'plan_f') {
      planName = 'Medigap Plan F (Legacy Only — Pre-2020 Enrollees)';
      avgMonthlyPrem = userAge <= 67 ? 220 : 260;
      partADeductibleCovered = true;
      partBDeductibleCovered = true; // Plan F covers 100% including Part B deductible
      partBCoinsuranceCovered = true;
      excessChargesCovered = true;
      copayDetails = '$0 out-of-pocket for all covered services.';
      verdict = 'Plan F covers 100% of all costs, but is ONLY available to beneficiaries who became eligible for Medicare before January 1, 2020. Premiums are significantly higher.';
    } else {
      planName = 'Medigap Plan A (Basic Core Coverage)';
      avgMonthlyPrem = userAge <= 67 ? 110 : 135;
      partADeductibleCovered = false; // Plan A does NOT cover Part A hospital deductible ($1,676 in 2026)
      partBDeductibleCovered = false;
      partBCoinsuranceCovered = true;
      excessChargesCovered = false;
      copayDetails = 'Does NOT cover Part A hospital deductible ($1,676 in 2026).';
      verdict = 'Plan A covers basic 20% Part B coinsurance but leaves you exposed to the large Part A hospital deductible ($1,676 per benefit period).';
    }

    setResult({
      planName,
      avgMonthlyPrem,
      partADeductibleCovered,
      partBDeductibleCovered,
      partBCoinsuranceCovered,
      excessChargesCovered,
      copayDetails,
      verdict,
    });
  };

  return (
    <div
      className="medigap-calculator-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Medigap Plan Comparison Tool 2026
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Select a Medigap plan (Plan G, N, A, or F) to view an itemized breakdown of covered benefits, copays, and premium estimates.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor={`${uid}-plan`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              1. Select Medigap Plan to Inspect
            </label>
            <select
              id={`${uid}-plan`}
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as SelectedPlan)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
            >
              <option value="plan_g">Plan G (Most Popular Overall)</option>
              <option value="plan_n">Plan N (Lower Premium + Small Copays)</option>
              <option value="plan_a">Plan A (Basic Coverage)</option>
              <option value="plan_f">Plan F (Pre-2020 Medicare Enrollees Only)</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${uid}-age`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
              2. Your Age
            </label>
            <input
              id={`${uid}-age`}
              type="number"
              min={65}
              max={95}
              value={userAge}
              onChange={(e) => setUserAge(parseInt(e.target.value) || 65)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            background: '#0A3D3A',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.05rem',
            padding: '0.85rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            marginTop: '0.5rem',
          }}
        >
          Inspect Plan Benefits &amp; Costs →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Plan Analysis &amp; Overview
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0D2137', margin: '0.25rem 0' }}>
              {result.planName}
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E8761A', margin: '0.25rem 0 0.5rem 0' }}>
              Est. Average Premium: ~${result.avgMonthlyPrem}/month
            </p>
            <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, lineHeight: 1.55 }}>
              {result.verdict}
            </p>
          </div>

          {/* Benefits Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Part A Hospital Deductible ($1,676)</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: result.partADeductibleCovered ? '#276749' : '#c05621' }}>
                {result.partADeductibleCovered ? '✅ Covered 100%' : '❌ Not Covered ($1,676 OOP)'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Part B Doctor Deductible ($240)</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: result.partBDeductibleCovered ? '#276749' : '#c05621' }}>
                {result.partBDeductibleCovered ? '✅ Covered 100%' : '❌ You Pay $240/yr'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Part B Excess Charges</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: result.excessChargesCovered ? '#276749' : '#c05621' }}>
                {result.excessChargesCovered ? '✅ Covered 100%' : '❌ Not Covered'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
