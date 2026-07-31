import React, { useState, useId } from 'react';

/**
 * CP90NoticeDecoder.tsx
 * Tool: CP90 Notice Decoder — Final Notice Before Levy of Social Security Benefits
 * Primary keyword: cp90 notice
 * Supporting keywords: what is a cp90 irs notice, irs cp90, cp90 irs letter
 */

export type CP90Intent = 'appeal_cdp' | 'pay_full' | 'payment_plan' | 'hardship' | 'verify_scam';

interface CP90Result {
  noticeDateStr: string;
  cdpDeadlineDateStr: string;
  cdpDaysRemaining: number;
  urgencyLevel: 'normal' | 'warning' | 'urgent' | 'expired';
  balanceOwed: number;
  monthlyPenaltyEst: number;
  monthlyInterestEst: number;
  intent: CP90Intent;
  checklist: string[];
  appealEligible: boolean;
}

export const CP90NoticeDecoder: React.FC = () => {
  const uid = useId();

  const [noticeDate, setNoticeDate] = useState<string>('');
  const [balanceOwedStr, setBalanceOwedStr] = useState<string>('2500');
  const [intent, setIntent] = useState<CP90Intent>('appeal_cdp');
  const [hasSsIncome, setHasSsIncome] = useState<boolean>(true);

  const [result, setResult] = useState<CP90Result | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noticeDate) {
      setError('Please enter the Notice Date printed at the top right of your CP90 letter.');
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

    // CP90: 30-day Collection Due Process appeal window from notice date
    const cdpDeadline = new Date(nDate);
    cdpDeadline.setDate(cdpDeadline.getDate() + 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = cdpDeadline.getTime() - today.getTime();
    const cdpDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgencyLevel: 'normal' | 'warning' | 'urgent' | 'expired' = 'normal';
    if (cdpDaysRemaining < 0) {
      urgencyLevel = 'expired';
    } else if (cdpDaysRemaining <= 5) {
      urgencyLevel = 'urgent';
    } else if (cdpDaysRemaining <= 10) {
      urgencyLevel = 'warning';
    }

    const cdpDeadlineDateStr = cdpDeadline.toLocaleDateString('en-US', {
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

    // 0.5% failure-to-pay per month, 8% annual interest
    const monthlyPenaltyEst = balanceOwed * 0.005;
    const monthlyInterestEst = (balanceOwed * 0.08) / 12;

    // CDP appeal eligible as long as within 30-day window
    const appealEligible = cdpDaysRemaining >= 0;

    let checklist: string[] = [];

    if (intent === 'appeal_cdp') {
      checklist = [
        'File IRS Form 12153 (Request for a Collection Due Process or Equivalent Hearing) immediately — your deadline is 30 days from the CP90 Notice Date.',
        'Mail Form 12153 via Certified Mail with Return Receipt to the IRS address printed on your CP90 notice. Keep the tracking number permanently.',
        'Check "Levy" as the type of collection action you are requesting a hearing about on Form 12153.',
        'Request an in-person, telephone, or written hearing — choose what is easiest for your situation.',
        'Filing a timely CDP hearing request immediately suspends all levy action, including Social Security benefit levy, until the hearing is resolved.',
        'Download Form 12153 free at irs.gov/pub/irs-pdf/f12153.pdf.',
        'If you need help completing the form, contact the Low Income Taxpayer Clinic (LITC) in your state — find yours at taxpayeradvocate.irs.gov/litc.',
      ];
    } else if (intent === 'pay_full') {
      checklist = [
        'Pay the full balance immediately at irs.gov/payments using IRS Direct Pay (free from checking/savings) to stop the levy process.',
        'If paying by check: Make payable to "United States Treasury". Write your SSN, tax year, and "CP90 Notice" on the memo line.',
        'Call 1-800-829-1040 to confirm payment posting and request a hold on the levy action while payment is processed.',
        'Save your payment confirmation number and keep it permanently.',
        'Check your IRS online account at irs.gov/account in 2–3 weeks to verify zero balance.',
      ];
    } else if (intent === 'payment_plan') {
      checklist = [
        'Apply for an Installment Agreement immediately at irs.gov/opa — even a pending application can pause the levy while processing.',
        'If you owe under $50,000, you can apply online in under 10 minutes with no financial statement required.',
        'A Direct Debit Installment Agreement (automatic bank transfer) reduces your failure-to-pay penalty from 0.5% to 0.25% per month.',
        'Call 1-800-829-1040 immediately to request a hold on the Social Security levy while your payment plan application is reviewed.',
        'Also consider simultaneously filing Form 12153 to request a CDP hearing as a backup protection while the payment plan is set up.',
      ];
    } else if (intent === 'hardship') {
      checklist = [
        'Contact the IRS immediately at 1-800-829-1040 to request Currently Not Collectible (CNC) status — be prepared to explain your income and essential living expenses.',
        'File Form 12153 as well to request a Collection Due Process hearing within your 30-day window — this suspends the levy while your hardship is evaluated.',
        'Gather documentation: monthly Social Security amount, rent/mortgage, medical expenses, utility bills, and food costs.',
        'Contact the Taxpayer Advocate Service at 1-877-777-4778 if you are facing immediate financial harm — they can expedite hardship relief.',
        'Note: The IRS is prohibited from levying more than 15% of your Social Security benefit under the Federal Payment Levy Program (FPLP).',
      ];
    } else {
      // verify_scam
      checklist = [
        'Check the top right corner of the letter: Must show "Notice: CP90" and your Taxpayer Identification Number / SSN (last 4 digits).',
        'Verify the IRS letterhead: Real CP90 notices come from the IRS, not debt collectors or private firms.',
        'Check payment recipient: IRS ONLY accepts payment at irs.gov/payments or checks to "United States Treasury" — never gift cards, wire transfers, or crypto.',
        'Verify your actual IRS balance at irs.gov/account — a real CP90 will show a corresponding balance in your IRS online account.',
        'If you believe it is a scam, report it to TIGTA (Treasury Inspector General) at 1-800-366-4484 or irs.gov/phishing.',
      ];
    }

    setResult({
      noticeDateStr,
      cdpDeadlineDateStr,
      cdpDaysRemaining,
      urgencyLevel,
      balanceOwed,
      monthlyPenaltyEst,
      monthlyInterestEst,
      intent,
      checklist,
      appealEligible,
    });
  };

  const urgencyBg = (level: string) => {
    switch (level) {
      case 'expired': return '#fff5f5';
      case 'urgent': return '#fffaf0';
      case 'warning': return '#fffff0';
      default: return '#f0fdf4';
    }
  };

  const urgencyBorder = (level: string) => {
    switch (level) {
      case 'expired': return '2px solid #e53e3e';
      case 'urgent': return '2px solid #dd6b20';
      case 'warning': return '2px solid #d69e2e';
      default: return '2px solid #38a169';
    }
  };

  const urgencyTextColor = (level: string) => {
    switch (level) {
      case 'expired': return '#c53030';
      case 'urgent': return '#c05621';
      case 'warning': return '#b7791f';
      default: return '#276749';
    }
  };

  const urgencyLabel = (level: string) => {
    switch (level) {
      case 'expired': return '⚠️ 30-Day CDP Appeal Window Closed — Equivalent Hearing May Still Be Available';
      case 'urgent': return '⚡ URGENT: CDP Appeal Deadline in 5 Days or Less';
      case 'warning': return '⏳ CDP Appeal Window Closing Soon — Act This Week';
      default: return '✅ CDP Appeal Window Open — 30-Day Deadline Active';
    }
  };

  return (
    <div
      className="cp90-decoder-container"
      style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
    >
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          IRS CP90 Notice Decoder — Final Notice Before Social Security Levy
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Enter the details from your CP90 letter to see your exact 30-day appeal deadline, levy explanation, and step-by-step response options.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label
            htmlFor={`${uid}-notice-date`}
            style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}
          >
            1. Notice Date (printed on top right of your CP90 letter) <span style={{ color: '#c53030' }}>*</span>
          </label>
          <input
            id={`${uid}-notice-date`}
            type="date"
            value={noticeDate}
            onChange={(e) => setNoticeDate(e.target.value)}
            required
            style={{ width: '100%', maxWidth: '320px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
          />
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Your 30-day Collection Due Process appeal deadline runs from this date.
          </p>
        </div>

        <div>
          <label
            htmlFor={`${uid}-balance-owed`}
            style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}
          >
            2. Total Balance Owed ($) shown on your CP90 notice
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-balance-owed`}
              type="text"
              value={balanceOwedStr}
              onChange={(e) => setBalanceOwedStr(e.target.value)}
              placeholder="e.g. 2500"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Includes unpaid tax, penalties, and interest added to date.
          </p>
        </div>

        <div>
          <label
            htmlFor={`${uid}-intent`}
            style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}
          >
            3. What is your current situation or goal?
          </label>
          <select
            id={`${uid}-intent`}
            value={intent}
            onChange={(e) => setIntent(e.target.value as CP90Intent)}
            style={{ width: '100%', maxWidth: '480px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
          >
            <option value="appeal_cdp">I want to appeal — request a Collection Due Process (CDP) hearing</option>
            <option value="pay_full">I can pay the balance in full to stop the levy</option>
            <option value="payment_plan">I need a monthly payment plan (Installment Agreement)</option>
            <option value="hardship">I cannot afford to pay — financial hardship</option>
            <option value="verify_scam">I want to verify if this letter is real or a scam</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <input
            id={`${uid}-ss-income`}
            type="checkbox"
            checked={hasSsIncome}
            onChange={(e) => setHasSsIncome(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#0A3D3A' }}
          />
          <label htmlFor={`${uid}-ss-income`} style={{ fontSize: '0.975rem', color: '#0D2137', fontWeight: 600, cursor: 'pointer' }}>
            I receive Social Security benefits (the IRS is threatening to levy up to 15% of my SS payments)
          </label>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

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
            transition: 'background 0.2s',
          }}
        >
          Decode My CP90 Notice →
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem' }}>
          {/* Urgency Status Banner */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background: urgencyBg(result.urgencyLevel),
              border: urgencyBorder(result.urgencyLevel),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.06em',
                  color: urgencyTextColor(result.urgencyLevel),
                }}
              >
                {urgencyLabel(result.urgencyLevel)}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D2137' }}>
                Notice Date: {result.noticeDateStr}
              </span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0D2137' }}>
                CDP Appeal Deadline: {result.cdpDeadlineDateStr}
              </p>
              <p style={{ fontSize: '0.95rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
                {result.cdpDaysRemaining > 0 ? (
                  <>You have <strong style={{ color: '#0A3D3A' }}>{result.cdpDaysRemaining} days</strong> remaining to file IRS Form 12153 and stop the Social Security levy.</>
                ) : result.cdpDaysRemaining === 0 ? (
                  <strong style={{ color: '#c05621' }}>Your 30-day CDP deadline is TODAY. File Form 12153 immediately.</strong>
                ) : (
                  <>Your 30-day CDP window closed <strong style={{ color: '#c53030' }}>{Math.abs(result.cdpDaysRemaining)} days ago</strong>. An Equivalent Hearing may still be available — file Form 12153 now and explain the delay.</>
                )}
              </p>
            </div>
          </div>

          {/* SS Levy Warning */}
          {hasSsIncome && (
            <div
              style={{
                background: '#fffbf0',
                border: '2px solid #C9933A',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#C9933A', margin: '0 0 0.25rem 0', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                ⚠️ Social Security Levy Alert
              </p>
              <p style={{ fontSize: '0.95rem', color: '#0D2137', margin: 0, lineHeight: 1.6 }}>
                Under the Federal Payment Levy Program (FPLP), the IRS can automatically deduct <strong>15% of your gross Social Security benefit</strong> each month until your balance is paid. Filing a timely CDP appeal (Form 12153) <strong>immediately suspends</strong> this levy while your hearing is pending.
              </p>
            </div>
          )}

          {/* Financial Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>CP90 Balance Owed</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A3D3A' }}>
                ${result.balanceOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly Failure-to-Pay (0.5%)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c05621' }}>
                ~${result.monthlyPenaltyEst.toFixed(2)} / mo
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly IRS Interest (~8% p.a.)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c05621' }}>
                ~${result.monthlyInterestEst.toFixed(2)} / mo
              </span>
            </div>
          </div>

          {/* Action Checklist */}
          <div style={{ background: '#f0fdf4', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Your Action Plan — Printable Response Checklist
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {result.checklist.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.55 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem', lineHeight: 1.5 }}>
            Results calculated using official IRS CP90 rules and FPLP levy procedures. Verify your result at{' '}
            <a href="https://www.irs.gov/individuals/understanding-your-cp90-notice" target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A' }}>
              irs.gov
            </a>. These results are for educational purposes only.
          </p>
        </div>
      )}
    </div>
  );
};
