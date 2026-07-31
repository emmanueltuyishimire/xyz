import React, { useState, useId } from 'react';

/**
 * ShouldIDelaySocialSecurityWizard.tsx
 * Tool: Should I Delay Social Security? Wizard
 * Primary keyword: should i delay social security
 */

export type HealthStatus = 'excellent' | 'average' | 'poor';
export type NeedCash = 'urgent' | 'moderate' | 'no';
export type MaritalType = 'single' | 'married_higher' | 'married_lower' | 'widowed';

interface WizardResult {
  recommendedAge: number;
  recommendationTitle: string;
  rationale: string;
  keyFactors: string[];
}

export const ShouldIDelaySocialSecurityWizard: React.FC = () => {
  const uid = useId();

  const [currentAge, setCurrentAge] = useState<number>(62);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('average');
  const [needCash, setNeedCash] = useState<NeedCash>('no');
  const [maritalType, setMaritalType] = useState<MaritalType>('single');
  const [hasOtherIncome, setHasOtherIncome] = useState<boolean>(true);

  const [result, setResult] = useState<WizardResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    let recommendedAge = 67;
    let recommendationTitle = 'Claim at Full Retirement Age (Age 67)';
    let rationale = '';
    let keyFactors: string[] = [];

    if (needCash === 'urgent') {
      recommendedAge = 62;
      recommendationTitle = 'Claim Early at Age 62 (Immediate Income Need)';
      rationale = 'Because you have urgent monthly cash flow needs and limited alternative retirement income, claiming early at age 62 is recommended to ensure your essential living expenses are met today.';
      keyFactors = [
        'Immediate financial security takes priority over long-term benefit growth.',
        'Claiming at 62 provides an instant monthly income stream, though check size is reduced by 30% compared to FRA.',
        'If you continue working before FRA, remember that the SSA Earnings Test may temporarily withhold part of your benefit if earnings exceed $23,400.',
      ];
    } else if (healthStatus === 'poor') {
      recommendedAge = 62;
      recommendationTitle = 'Claim Early at Age 62 or 63 (Health/Longevity Consideration)';
      rationale = 'If you have health concerns or a shorter family longevity outlook, claiming early maximizes the number of monthly checks you receive and often nets a higher cumulative lifetime payout.';
      keyFactors = [
        'Break-even math for delaying to age 70 typically requires living past age 82–84.',
        'Claiming early allows you to enjoy your retirement benefits now without waiting for a break-even point in your 80s.',
        'Consider survivor implications if you are the higher earner in a marriage — your claim age sets the permanent survivor check for your spouse.',
      ];
    } else if (healthStatus === 'excellent' && needCash === 'no' && hasOtherIncome) {
      recommendedAge = 70;
      recommendationTitle = 'Delay Claiming Until Age 70 (Maximum Payout)';
      rationale = 'Because you are in excellent health, do not need immediate cash, and have other income sources (IRA, pension, savings), delaying until age 70 delivers the maximum possible monthly benefit — 24% higher than your FRA check.';
      keyFactors = [
        'Your benefit grows by 8% per year in Delayed Retirement Credits between age 67 and 70.',
        'A higher monthly benefit provides unmatched inflation protection in your 80s and 90s.',
        'If you are the higher earner in a marriage, delaying to 70 maximizes the survivor benefit for your surviving spouse.',
      ];
    } else if (maritalType === 'married_higher' && healthStatus !== 'poor') {
      recommendedAge = 70;
      recommendationTitle = 'Higher Earner: Delay to Age 70 (Survivor Benefit Strategy)';
      rationale = 'As the higher-earning spouse in good/average health, your claiming decision sets the permanent survivor benefit for your lower-earning spouse upon your passing. Delaying to 70 guarantees your spouse the largest possible safety net.';
      keyFactors = [
        'When one spouse passes away, the lower benefit disappears and the survivor keeps the higher benefit.',
        'Delaying your higher benefit to 70 maximizes the survivor check for whichever spouse lives longer.',
        'The lower-earning spouse can claim early at 62 or 67 to provide household cash flow while the higher benefit grows to 70.',
      ];
    } else {
      recommendedAge = 67;
      recommendationTitle = 'Claim at Full Retirement Age (Age 67 — Balanced Strategy)';
      rationale = 'Claiming at your Full Retirement Age (67) offers an ideal balance: you receive 100% of your unreduced Primary Insurance Amount without penalty, without waiting until 70.';
      keyFactors = [
        'Receives 100% of your earned benefit with zero early claiming reduction.',
        'Eliminates the SSA Earnings Test — you can earn unlimited income from work after reaching FRA without benefit withholding.',
        'Provides a solid baseline check while preserving your savings.',
      ];
    }

    setResult({
      recommendedAge,
      recommendationTitle,
      rationale,
      keyFactors,
    });
  };

  return (
    <div
      className="delay-wizard-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          Should I Delay Social Security? Decision Wizard
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Answer 5 quick questions to get a personalized recommendation on claiming at 62, FRA (67), or 70.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-age`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Your Current Age
          </label>
          <input
            id={`${uid}-age`}
            type="number"
            min={55}
            max={70}
            value={currentAge}
            onChange={(e) => setCurrentAge(parseInt(e.target.value) || 62)}
            style={{ width: '100%', maxWidth: '200px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label htmlFor={`${uid}-health`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Personal Health &amp; Family Longevity Outlook
          </label>
          <select
            id={`${uid}-health`}
            value={healthStatus}
            onChange={(e) => setHealthStatus(e.target.value as HealthStatus)}
            style={{ width: '100%', maxWidth: '400px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="excellent">Excellent — Expect to live into 80s or 90s</option>
            <option value="average">Average — Expect average life expectancy (~age 80–84)</option>
            <option value="poor">Health Concerns — Shorter expected lifespan</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-need-cash`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. Do You Need the Social Security Income to Cover Living Expenses Now?
          </label>
          <select
            id={`${uid}-need-cash`}
            value={needCash}
            onChange={(e) => setNeedCash(e.target.value as NeedCash)}
            style={{ width: '100%', maxWidth: '400px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="urgent">Yes, Urgent Need — Cannot cover monthly bills without it</option>
            <option value="moderate">Moderate Need — Would help, but could manage</option>
            <option value="no">No Need — Have pension, IRA, or work income</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-marital`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            4. Marital &amp; Spousal Earnings Situation
          </label>
          <select
            id={`${uid}-marital`}
            value={maritalType}
            onChange={(e) => setMaritalType(e.target.value as MaritalType)}
            style={{ width: '100%', maxWidth: '400px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem', background: '#fff' }}
          >
            <option value="single">Single / Divorced / Unmarried</option>
            <option value="married_higher">Married — I am the Higher-Earning Spouse</option>
            <option value="married_lower">Married — I am the Lower-Earning Spouse</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input
            id={`${uid}-other-inc`}
            type="checkbox"
            checked={hasOtherIncome}
            onChange={(e) => setHasOtherIncome(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
          />
          <label htmlFor={`${uid}-other-inc`} style={{ fontSize: '0.95rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
            I have other retirement assets (401k, IRA, pension, investments)
          </label>
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
          Get My Claiming Recommendation →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Main Output Card */}
          <div style={{ background: '#f0fdf4', border: '2px solid #38a169', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#276749', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Personalized Decision Recommendation
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E8761A', margin: '0.25rem 0' }}>
              {result.recommendationTitle}
            </div>
            <p style={{ fontSize: '1rem', color: '#0D2137', margin: '0.5rem 0 0 0', lineHeight: 1.6 }}>
              {result.rationale}
            </p>
          </div>

          {/* Rationale Checklist */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Key Reasons for This Recommendation
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {result.keyFactors.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.55 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
