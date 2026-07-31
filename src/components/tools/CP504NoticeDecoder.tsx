import React, { useState, useId } from 'react';

/**
 * CP504NoticeDecoder.tsx
 * Tool: CP504 Notice Decoder & Levy Prevention Calculator
 * Primary keyword: cp504 notice
 * Supporting keywords: what is a cp504, irs cp504 letter
 */

export type CP504ResolutionIntent = 'pay_online' | 'installment_plan' | 'cdp_appeal' | 'hardship_cnc';

interface CP504DecoderResult {
  noticeDateStr: string;
  deadlineDateStr: string;
  daysRemaining: number;
  urgencyLevel: 'urgent' | 'critical' | 'expired';
  balanceOwed: number;
  monthlyPenaltyEst: number;
  monthlyInterestEst: number;
  resolutionIntent: CP504ResolutionIntent;
  checklist: string[];
}

export const CP504NoticeDecoder: React.FC = () => {
  const uid = useId();

  const [noticeDate, setNoticeDate] = useState<string>('');
  const [balanceOwedStr, setBalanceOwedStr] = useState<string>('3200');
  const [resolutionIntent, setResolutionIntent] = useState<CP504ResolutionIntent>('installment_plan');

  const [result, setResult] = useState<CP504DecoderResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noticeDate) {
      setError('Please select or enter the Notice Date printed at the top right of your CP504 letter.');
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

    const allowedDays = 30;
    const deadlineDate = new Date(nDate);
    deadlineDate.setDate(deadlineDate.getDate() + allowedDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgencyLevel: 'urgent' | 'critical' | 'expired' = 'urgent';
    if (daysRemaining < 0) {
      urgencyLevel = 'expired';
    } else if (daysRemaining <= 10) {
      urgencyLevel = 'critical';
    }

    const deadlineDateStr = deadlineDate.toLocaleDateString('en-US', {
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
    if (resolutionIntent === 'pay_online') {
      checklist = [
        'Pay the full balance immediately at irs.gov/payments via Direct Pay (bank account) or credit card.',
        'Paying in full instantly stops all pending state tax refund levies and prevents escalation to wage garnishment.',
        'Print and keep your payment confirmation receipt with your CP504 letter.',
        'Check irs.gov/account 5-7 business days later to verify your balance shows $0.',
      ];
    } else if (resolutionIntent === 'installment_plan') {
      checklist = [
        'Log into irs.gov/opa immediately to set up an Online Payment Agreement.',
        'An approved Installment Agreement automatically HALTS the CP504 state refund levy process.',
        'If balance is under $50,000, approval is automatic without presenting detailed financial records.',
        'Choose Direct Debit (automatic monthly bank transfer) for the lowest setup fee ($31).',
        'Save a copy of your approved payment plan agreement letter.',
      ];
    } else if (resolutionIntent === 'cdp_appeal') {
      checklist = [
        'Download IRS Form 12153 (Request for a Collection Due Process or Equivalent Hearing).',
        'Fill out Form 12153 stating why you object to the levy or proposing an alternative (payment plan or OIC).',
        'Mail Form 12153 to the IRS office address shown on your CP504 notice via Certified Mail before the 30-day deadline.',
        'Filing Form 12153 within the deadline legally stays (pauses) collection actions while Appeals reviews your case.',
      ];
    } else {
      checklist = [
        'Call the IRS toll-free number printed on your CP504 letter (1-800-829-1040) immediately.',
        'Explain that you are facing severe financial hardship and request Currently Not Collectible (CNC) status.',
        'Prepare to provide proof of basic necessary monthly expenses (housing, utilities, food, medical).',
        'If approved for CNC, the IRS stops active levies on your state refund and bank accounts.',
        'Contact the Taxpayer Advocate Service (1-877-777-4778) if facing eviction, utility shutoff, or severe emergency.',
      ];
    }

    setResult({
      noticeDateStr,
      deadlineDateStr,
      daysRemaining,
      urgencyLevel,
      balanceOwed,
      monthlyPenaltyEst,
      monthlyInterestEst,
      resolutionIntent,
      checklist,
    });
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #991b1b', padding: '1.5rem', boxShadow: '0 4px 12px rgba(153, 27, 27, 0.1)' }}>
      <div style={{ borderBottom: '2px solid #fee2e2', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <div style={{ display: 'inline-block', background: '#991b1b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          URGENT IRS NOTICE
        </div>
        <h2 style={{ fontSize: '1.35rem', color: '#991b1b', margin: 0, fontWeight: 700 }}>
          CP504 Notice Decoder &amp; Levy Prevention Tool
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          CP504 is a Notice of Intent to Levy State Tax Refunds. Enter your notice details to see your exact 30-day deadline and how to halt IRS action.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-notice-date`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Notice Date (top right of your CP504 letter) <span style={{ color: '#c53030' }}>*</span>
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
            2. Total Amount Owed ($)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b' }}>$</span>
            <input
              id={`${uid}-balance-owed`}
              type="text"
              value={balanceOwedStr}
              onChange={(e) => setBalanceOwedStr(e.target.value)}
              placeholder="e.g. 3200"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-resolution-intent`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. Choose your plan to stop or prevent the IRS levy:
          </label>
          <select
            id={`${uid}-resolution-intent`}
            value={resolutionIntent}
            onChange={(e) => setResolutionIntent(e.target.value as CP504ResolutionIntent)}
            style={{ width: '100%', maxWidth: '520px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
          >
            <option value="installment_plan">Set up a monthly Payment Plan online (Halts Levy)</option>
            <option value="pay_online">Pay the balance in full at irs.gov/payments</option>
            <option value="hardship_cnc">Request Financial Hardship / Currently Not Collectible</option>
            <option value="cdp_appeal">File Collection Appeal (Form 12153 Hearing)</option>
          </select>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            background: '#991b1b',
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
          Decode CP504 &amp; Check Deadline &rarr;
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px dashed #fca5a5', paddingTop: '1.5rem' }}>
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background: result.urgencyLevel === 'expired' ? '#fef2f2' : result.urgencyLevel === 'critical' ? '#fff1f2' : '#fff7ed',
              border: result.urgencyLevel === 'expired' ? '2.5px solid #991b1b' : result.urgencyLevel === 'critical' ? '2.5px solid #e11d48' : '2.5px solid #c2410c',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#991b1b' }}>
                {result.urgencyLevel === 'expired' ? '🚨 LEVY WARNING EXPIRED — IMMEDIATE ACTION NEEDED' : result.urgencyLevel === 'critical' ? '⚡ CRITICAL LEVY DEADLINE APPROACHING' : '⚠️ 30-DAY LEVY NOTICE ACTIVE'}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D2137' }}>
                Notice Date: {result.noticeDateStr}
              </span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#991b1b' }}>
                Levy Response Deadline: {result.deadlineDateStr}
              </p>
              <p style={{ fontSize: '0.975rem', color: '#0D2137', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                {result.daysRemaining > 0 ? (
                  <>You have <strong style={{ color: '#991b1b', fontSize: '1.05rem' }}>{result.daysRemaining} days remaining</strong> before the IRS can initiate seizure of your state tax refund or issue a Notice LT11 for bank/wage levies.</>
                ) : (
                  <>Your 30-day CP504 levy window expired <strong style={{ color: '#991b1b' }}>{Math.abs(result.daysRemaining)} days ago</strong>. Take action immediately to avoid bank account garnishment.</>
                )}
              </p>
            </div>
          </div>

          <div style={{ background: '#fff1f2', borderLeft: '4px solid #e11d48', padding: '1rem 1.25rem', borderRadius: '0 0.5rem 0.5rem 0', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#9f1239', fontWeight: 700 }}>What the IRS can seize under CP504:</h4>
            <p style={{ margin: 0, fontSize: '0.925rem', color: '#881337', lineHeight: 1.5 }}>
              Notice CP504 gives the IRS legal authority to seize state tax refunds. If unresolved, the IRS will issue a Final Notice (LT11 / Letter 1058) giving them authority to levy bank accounts, wages, and Social Security benefits.
            </p>
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Action Plan: How to Stop the CP504 Levy
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.checklist.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.95rem', color: '#0D2137', lineHeight: 1.5 }}>
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
