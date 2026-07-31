import React, { useState, useId } from 'react';

/**
 * LT11NoticeDecoder.tsx
 * Tool: LT11 / Letter 1058 Notice Decoder & CDP Appeal Deadline Calculator
 * Primary keyword: lt11 notice
 * Supporting keywords: letter 1058 irs, what is an lt11 letter
 *
 * IRS Rules:
 *  - LT11 / Letter 1058 = "Final Notice of Intent to Levy and Notice of Your Right to a Hearing"
 *  - Taxpayer has EXACTLY 30 days from Notice Date to file Form 12153 (CDP Hearing request)
 *  - Filing Form 12153 within 30 days legally SUSPENDS all levy action while Appeals reviews
 *  - Missing 30-day window: only Equivalent Hearing available (does NOT stop levy)
 *  - IRS can levy after LT11: bank accounts, wages, Social Security (15% FPLP), retirement accounts
 */

export type LT11ResolutionIntent =
  | 'cdp_hearing'
  | 'pay_full'
  | 'installment_plan'
  | 'offer_compromise'
  | 'hardship_cnc';

interface LT11DecoderResult {
  noticeDateStr: string;
  cdpDeadlineDateStr: string;
  daysRemaining: number;
  urgencyLevel: 'critical' | 'expired';
  balanceOwed: number;
  monthlyPenaltyEst: number;
  monthlyInterestEst: number;
  resolutionIntent: LT11ResolutionIntent;
  checklist: string[];
  cdpWindowOpen: boolean;
}

export const LT11NoticeDecoder: React.FC = () => {
  const uid = useId();

  const [noticeDate, setNoticeDate] = useState<string>('');
  const [balanceOwedStr, setBalanceOwedStr] = useState<string>('4500');
  const [resolutionIntent, setResolutionIntent] = useState<LT11ResolutionIntent>('cdp_hearing');

  const [result, setResult] = useState<LT11DecoderResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noticeDate) {
      setError('Please enter the Notice Date printed at the top of your LT11 or Letter 1058.');
      setResult(null);
      return;
    }

    const nDate = new Date(noticeDate + 'T00:00:00');
    if (isNaN(nDate.getTime())) {
      setError('Please enter a valid notice date.');
      setResult(null);
      return;
    }

    setError('');

    const balanceOwed = Math.max(0, parseFloat(balanceOwedStr.replace(/[^0-9.]/g, '')) || 0);

    // CDP hearing request deadline: strictly 30 days from Notice Date
    const cdpDeadlineDate = new Date(nDate);
    cdpDeadlineDate.setDate(cdpDeadlineDate.getDate() + 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = cdpDeadlineDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const cdpWindowOpen = daysRemaining >= 0;

    const urgencyLevel: 'critical' | 'expired' = daysRemaining < 0 ? 'expired' : 'critical';

    const cdpDeadlineDateStr = cdpDeadlineDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const noticeDateStr = nDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const monthlyPenaltyEst = balanceOwed * 0.005;
    const monthlyInterestEst = (balanceOwed * 0.08) / 12;

    let checklist: string[] = [];
    if (resolutionIntent === 'cdp_hearing') {
      if (cdpWindowOpen) {
        checklist = [
          'Download IRS Form 12153 "Request for a Collection Due Process or Equivalent Hearing" from irs.gov/forms.',
          'Complete Part 1: Enter your name, SSN/EIN, address, and the tax year(s) on your LT11.',
          'In Part 2, select your reason for requesting a hearing (dispute the liability, propose installment plan, offer in compromise, or hardship).',
          'Mail Form 12153 via USPS Certified Mail with Return Receipt to the IRS address printed on your LT11 letter — NOT your local IRS office.',
          'Keep the green Return Receipt card as proof of your timely filing — this is critical if your CDP rights are later challenged.',
          'Once your timely-filed Form 12153 is received, ALL IRS levy actions are legally suspended until Appeals issues a determination.',
        ];
      } else {
        checklist = [
          'Your 30-day CDP window has closed. You may still file Form 12153 for an Equivalent Hearing within 1 year of the LT11 date.',
          'Important: An Equivalent Hearing does NOT suspend levy action. The IRS can proceed with levies while your Equivalent Hearing is pending.',
          'File Form 12153 as soon as possible, checking the "Equivalent Hearing" box, to preserve your right to Appeals review.',
          'Contact the IRS at 1-800-829-1040 immediately to discuss payment options and request a temporary collection hold while filing.',
          'Consider contacting the Taxpayer Advocate Service at 1-877-777-4778 if levy action is imminent or you face financial hardship.',
        ];
      }
    } else if (resolutionIntent === 'pay_full') {
      checklist = [
        'Pay the full balance immediately at irs.gov/payments via Direct Pay (free, from bank account) or card.',
        'Full payment stops all levy action and satisfies the LT11 notice entirely.',
        'Call the IRS at 1-800-829-1040 after payment to request a Collection Hold while payment processes.',
        'Save your payment confirmation receipt and check irs.gov/account after 5-7 business days to confirm $0 balance.',
      ];
    } else if (resolutionIntent === 'installment_plan') {
      checklist = [
        'Apply immediately at irs.gov/opa for an Online Payment Agreement.',
        'An approved Installment Agreement can stop levy enforcement — contact the IRS at 1-800-829-1040 to confirm your plan halts pending levy action.',
        'If balance is under $50,000, online approval is usually automatic within minutes with no financial statement required.',
        'Choose Direct Debit (auto bank transfer) for the lowest setup fee ($31 online).',
        'File Form 12153 simultaneously if you are within the 30-day window, to protect your CDP rights while the plan is processed.',
      ];
    } else if (resolutionIntent === 'offer_compromise') {
      checklist = [
        'An IRS Offer in Compromise (OIC) allows you to settle your tax debt for less than the full amount owed.',
        'Filing a valid OIC (Form 656 + Form 433-A/B) typically suspends IRS levy action while the OIC is under review.',
        'Use the IRS OIC Pre-Qualifier tool at irs.gov/oic-prequalifier to check if you likely qualify before applying.',
        'File Form 12153 within 30 days of your LT11 to preserve CDP rights while the OIC is processed.',
        'Attach Form 433-A (Collection Information Statement for Wage Earners) to document your assets, income, and expenses.',
      ];
    } else {
      // hardship_cnc
      checklist = [
        'Call the IRS immediately at 1-800-829-1040 and request Currently Not Collectible (CNC) status based on financial hardship.',
        'CNC status temporarily halts all levy enforcement while you cannot afford basic living expenses.',
        'Gather proof of your monthly expenses: housing, utilities, food, out-of-pocket medical costs, and transportation.',
        'File Form 12153 within 30 days of your LT11 to preserve CDP hearing rights while the CNC request is reviewed.',
        'Contact the Taxpayer Advocate Service (1-877-777-4778) if facing eviction, utility shutoff, or immediate financial crisis.',
      ];
    }

    setResult({
      noticeDateStr,
      cdpDeadlineDateStr,
      daysRemaining,
      urgencyLevel,
      balanceOwed,
      monthlyPenaltyEst,
      monthlyInterestEst,
      resolutionIntent,
      checklist,
      cdpWindowOpen,
    });
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #7c2d12', padding: '1.5rem', boxShadow: '0 4px 16px rgba(124, 45, 18, 0.12)' }}>
      <div style={{ borderBottom: '2px solid #fed7aa', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-block', background: '#7c2d12', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            FINAL LEVY NOTICE
          </span>
          <span style={{ display: 'inline-block', background: '#b45309', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            30-DAY APPEAL WINDOW
          </span>
        </div>
        <h2 style={{ fontSize: '1.35rem', color: '#7c2d12', margin: 0, fontWeight: 700 }}>
          LT11 / Letter 1058 Notice Decoder &amp; CDP Appeal Tool
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
          Enter your notice date to calculate your exact 30-day CDP appeal deadline and see your options to halt IRS levy action.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-notice-date`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Notice Date (printed at the top of your LT11 or Letter 1058) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <input
            id={`${uid}-notice-date`}
            type="date"
            value={noticeDate}
            onChange={(e) => setNoticeDate(e.target.value)}
            required
            style={{ width: '100%', maxWidth: '320px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label htmlFor={`${uid}-balance-owed`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            2. Total Balance Owed on Notice ($)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7c2d12' }}>$</span>
            <input
              id={`${uid}-balance-owed`}
              type="text"
              value={balanceOwedStr}
              onChange={(e) => setBalanceOwedStr(e.target.value)}
              placeholder="e.g. 4500"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-resolution-intent`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. What is your plan to respond to this notice?
          </label>
          <select
            id={`${uid}-resolution-intent`}
            value={resolutionIntent}
            onChange={(e) => setResolutionIntent(e.target.value as LT11ResolutionIntent)}
            style={{ width: '100%', maxWidth: '520px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
          >
            <option value="cdp_hearing">Request a CDP Hearing (Form 12153 — Stops Levy)</option>
            <option value="pay_full">Pay the balance in full at irs.gov/payments</option>
            <option value="installment_plan">Set up a monthly Payment Plan (Installment Agreement)</option>
            <option value="offer_compromise">Submit an Offer in Compromise (Form 656)</option>
            <option value="hardship_cnc">Request Financial Hardship / Currently Not Collectible</option>
          </select>
        </div>

        {error && (
          <div role="alert" style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            background: '#7c2d12',
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
          Decode LT11 &amp; Check Appeal Deadline &rarr;
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #fed7aa', paddingTop: '1.5rem' }}>

          {/* CDP Deadline Banner */}
          <div style={{
            padding: '1.25rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            background: result.cdpWindowOpen ? '#fff7ed' : '#fef2f2',
            border: result.cdpWindowOpen ? '2.5px solid #b45309' : '2.5px solid #991b1b',
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: result.cdpWindowOpen ? '#b45309' : '#991b1b' }}>
                {result.cdpWindowOpen ? '⚡ CDP APPEAL WINDOW ACTIVE' : '🚨 CDP WINDOW CLOSED — EQUIVALENT HEARING ONLY'}
              </span>
            </div>

            <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#0D2137' }}>
              CDP Form 12153 Deadline: {result.cdpDeadlineDateStr}
            </p>

            {result.cdpWindowOpen ? (
              <p style={{ fontSize: '0.975rem', color: '#0D2137', margin: 0, lineHeight: 1.5 }}>
                You have <strong style={{ color: '#b45309' }}>{result.daysRemaining} day{result.daysRemaining !== 1 ? 's' : ''} remaining</strong> to file Form 12153 and legally halt all IRS levy enforcement.
              </p>
            ) : (
              <p style={{ fontSize: '0.975rem', color: '#0D2137', margin: 0, lineHeight: 1.5 }}>
                Your 30-day CDP window closed <strong style={{ color: '#991b1b' }}>{Math.abs(result.daysRemaining)} days ago</strong>. You may still file for an <strong>Equivalent Hearing</strong> within 1 year, but it will <em>not</em> stop levy action.
              </p>
            )}
          </div>

          {/* What IRS Can Now Levy */}
          <div style={{ background: '#fef3c7', borderLeft: '4px solid #b45309', padding: '1rem 1.25rem', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#78350f', fontWeight: 700 }}>What the IRS can seize after LT11 / Letter 1058:</h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#78350f', lineHeight: 1.6 }}>
              <li>Bank account balances (full account balance seized)</li>
              <li>Wages and salary (continuous levy — ongoing paycheck garnishment)</li>
              <li>Social Security benefits (up to 15% per month under the FPLP)</li>
              <li>Retirement account distributions (IRA, 401k withdrawals)</li>
              <li>State income tax refunds</li>
              <li>Real property (requires additional steps and court involvement)</li>
            </ul>
          </div>

          {/* Financial Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Balance on LT11</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c2d12' }}>${result.balanceOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly Penalty (0.5%)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>~${result.monthlyPenaltyEst.toFixed(2)} / mo</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly Interest (~8% p.a.)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>~${result.monthlyInterestEst.toFixed(2)} / mo</span>
            </div>
          </div>

          {/* Action Checklist */}
          <div style={{ background: '#f0fdf4', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Your Action Checklist
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {result.checklist.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.6 }}>
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
