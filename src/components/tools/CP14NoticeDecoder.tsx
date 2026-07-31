import React, { useState, useId } from 'react';

/**
 * CP14NoticeDecoder.tsx
 * Tool: CP14 Notice Decoder & Payment Deadline Calculator
 * Primary keyword: cp14 notice
 * Supporting keywords: what is a cp14 notice, irs cp14, cp14 irs letter
 */

export type ResolutionIntent = 'pay_full' | 'payment_plan' | 'hardship' | 'dispute' | 'verify_scam';

interface DecoderResult {
  noticeDateStr: string;
  deadlineDateStr: string;
  daysRemaining: number;
  urgencyLevel: 'normal' | 'warning' | 'urgent' | 'expired';
  balanceOwed: number;
  monthlyPenaltyEst: number;
  monthlyInterestEst: number;
  resolutionIntent: ResolutionIntent;
  checklist: string[];
}

export const CP14NoticeDecoder: React.FC = () => {
  const uid = useId();

  const [noticeDate, setNoticeDate] = useState<string>('');
  const [balanceOwedStr, setBalanceOwedStr] = useState<string>('1500');
  const [resolutionIntent, setResolutionIntent] = useState<ResolutionIntent>('payment_plan');
  const [hasStateRefund, setHasStateRefund] = useState<boolean>(false);

  const [result, setResult] = useState<DecoderResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noticeDate) {
      setError('Please select or enter the Notice Date printed at the top right of your CP14 letter.');
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

    // CP14 standard payment deadline: 21 days from notice date (10 business days if >= $100k)
    const allowedDays = balanceOwed >= 100000 ? 14 : 21;
    const deadlineDate = new Date(nDate);
    deadlineDate.setDate(deadlineDate.getDate() + allowedDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgencyLevel: 'normal' | 'warning' | 'urgent' | 'expired' = 'normal';
    if (daysRemaining < 0) {
      urgencyLevel = 'expired';
    } else if (daysRemaining <= 5) {
      urgencyLevel = 'urgent';
    } else if (daysRemaining <= 10) {
      urgencyLevel = 'warning';
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

    // 0.5% Failure to Pay penalty per month
    const monthlyPenaltyEst = balanceOwed * 0.005;
    // ~8% annual interest rate (IRS Q1/Q2 2026 rate is 8% compounded daily ~0.67% monthly)
    const monthlyInterestEst = (balanceOwed * 0.08) / 12;

    let checklist: string[] = [];
    if (resolutionIntent === 'pay_full') {
      checklist = [
        'Pay online at irs.gov/payments using Direct Pay (free from bank account) or debit/credit card.',
        'If paying by check, make it payable to "United States Treasury". Include your SSN, tax year, and "CP14 Notice" on the memo line.',
        'Mail check with the CP14 payment stub to the IRS address on your notice.',
        'Save a digital or printed copy of your payment confirmation receipt for your permanent records.',
        'Check your IRS account transcript at irs.gov/account 2-3 weeks later to confirm zero balance.',
      ];
    } else if (resolutionIntent === 'payment_plan') {
      checklist = [
        'Apply for an Online Payment Agreement (OPA) immediately at irs.gov/opa.',
        'Short-term plan (up to 180 days): No setup fee if set up online. Interest and penalties still apply.',
        'Long-term Installment Agreement (monthly payments): Setup fee is $31 online with Direct Debit (automatic bank withdrawal).',
        'If balance is under $50,000, no financial statement is required to qualify.',
        'Setting up a plan immediately halts default collections and prevents wage/bank levies.',
      ];
    } else if (resolutionIntent === 'hardship') {
      checklist = [
        'Contact the IRS at 1-800-829-1040 to request Currently Not Collectible (CNC) status.',
        'Gather proof of monthly living expenses (rent/mortgage, utilities, medical bills, food).',
        'If approved for CNC, the IRS temporarily halts all collection demands and levies.',
        'Note: Interest and 0.5% monthly penalty continue to accrue while in CNC status.',
        'Consider contacting a free Taxpayer Advocate at 1-877-777-4778 if facing immediate financial crisis.',
      ];
    } else if (resolutionIntent === 'dispute') {
      checklist = [
        'Compare the CP14 balance with your filed Form 1040 (Line 37) and bank payment records.',
        'If you paid but IRS missed the payment, locate your canceled check (front and back) or electronic bank confirmation.',
        'Call the IRS phone number printed on the top right of your CP14 notice (1-800-829-1040).',
        'Mail or fax copies of your payment proof with the CP14 response stub to the address on the notice.',
        'Send via Certified Mail with Return Receipt requested to prove timely delivery.',
      ];
    } else {
      // verify_scam
      checklist = [
        'Check top right corner of letter: Must show "Notice: CP14" and your Taxpayer ID / SSN (last 4 digits).',
        'Check official IRS URL: The notice directs you ONLY to irs.gov or irs.gov/payments (never third-party payment sites).',
        'Check payment recipient: IRS payments are payable ONLY to "United States Treasury". IRS NEVER accepts gift cards, wire transfers, or crypto.',
        'Verify independently: Log into your official IRS account at irs.gov/account to check your official balance online.',
        'If suspicious, report potential tax scam to TIGTA at 1-800-366-4484 or irs.gov/phishing.',
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
    <div className="cp14-decoder-container" style={{ background: '#ffffff', borderRadius: '1rem', border: '2px solid #0A3D3A', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ borderBottom: '2px solid #e2e8f0', pb: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#0A3D3A', margin: 0, fontWeight: 700 }}>
          IRS CP14 Notice Decoder &amp; Deadline Tool
        </h2>
        <p style={{ fontSize: '0.925rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
          Enter the details from your CP14 letter to see your exact deadline, penalty accrual, and step-by-step response options.
        </p>
      </div>

      <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor={`${uid}-notice-date`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            1. Notice Date (printed on top right of your CP14 letter) <span style={{ color: '#c53030' }}>*</span>
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
            2. Total Balance Owed ($)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '320px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A3D3A' }}>$</span>
            <input
              id={`${uid}-balance-owed`}
              type="text"
              value={balanceOwedStr}
              onChange={(e) => setBalanceOwedStr(e.target.value)}
              placeholder="e.g. 1500"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Includes unpaid tax plus penalties and interest added to date.
          </p>
        </div>

        <div>
          <label htmlFor={`${uid}-resolution-intent`} style={{ display: 'block', fontWeight: 700, fontSize: '0.975rem', color: '#0D2137', marginBottom: '0.35rem' }}>
            3. What is your current situation or intent?
          </label>
          <select
            id={`${uid}-resolution-intent`}
            value={resolutionIntent}
            onChange={(e) => setResolutionIntent(e.target.value as ResolutionIntent)}
            style={{ width: '100%', maxWidth: '480px', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
          >
            <option value="pay_full">I can pay the balance in full today</option>
            <option value="payment_plan">I need a monthly payment plan (Installment Agreement)</option>
            <option value="hardship">I cannot afford to pay right now (Financial Hardship / CNC)</option>
            <option value="dispute">I already paid or I disagree with the balance</option>
            <option value="verify_scam">I want to verify if this CP14 letter is legitimate or a scam</option>
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
          Decode My CP14 Notice &rarr;
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', pt: '1.5rem', borderTop: '2px dashed #cbd5e1' }}>
          {/* Urgency Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              background:
                result.urgencyLevel === 'expired'
                  ? '#fff5f5'
                  : result.urgencyLevel === 'urgent'
                  ? '#fffaf0'
                  : result.urgencyLevel === 'warning'
                  ? '#fffff0'
                  : '#f0fdf4',
              border:
                result.urgencyLevel === 'expired'
                  ? '2px solid #e53e3e'
                  : result.urgencyLevel === 'urgent'
                  ? '2px solid #dd6b20'
                  : result.urgencyLevel === 'warning'
                  ? '2px solid #d69e2e'
                  : '2px solid #38a169',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color:
                    result.urgencyLevel === 'expired'
                      ? '#c53030'
                      : result.urgencyLevel === 'urgent'
                      ? '#c05621'
                      : result.urgencyLevel === 'warning'
                      ? '#b7791f'
                      : '#276749',
                }}
              >
                {result.urgencyLevel === 'expired'
                  ? '⚠️ Deadline Past — Immediate Action Required'
                  : result.urgencyLevel === 'urgent'
                  ? '⚡ Urgent: Payment Deadline Near'
                  : result.urgencyLevel === 'warning'
                  ? '⏳ Payment Window Active'
                  : '✅ Action Window Open'}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0D2137' }}>
                Notice Date: {result.noticeDateStr}
              </span>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0D2137' }}>
                Payment Deadline: {result.deadlineDateStr}
              </p>
              <p style={{ fontSize: '0.95rem', color: '#4B5A6E', margin: '0.25rem 0 0 0' }}>
                {result.daysRemaining > 0 ? (
                  <>You have <strong style={{ color: '#0A3D3A' }}>{result.daysRemaining} days</strong> remaining from today to respond or pay before further penalty accrual.</>
                ) : result.daysRemaining === 0 ? (
                  <strong style={{ color: '#c05621' }}>Your payment deadline is TODAY.</strong>
                ) : (
                  <>Your standard 21-day deadline passed <strong style={{ color: '#c53030' }}>{Math.abs(result.daysRemaining)} days ago</strong>. Take action now to stop further penalties.</>
                )}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>CP14 Balance Owed</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A3D3A' }}>${result.balanceOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly Failure-to-Pay (0.5%)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c05621' }}>~${result.monthlyPenaltyEst.toFixed(2)} / mo</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Monthly IRS Interest (~8% p.a.)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c05621' }}>~${result.monthlyInterestEst.toFixed(2)} / mo</span>
            </div>
          </div>

          {/* Action Checklist */}
          <div style={{ background: '#f0fdf4', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0A3D3A', margin: '0 0 0.75rem 0', fontWeight: 700 }}>
              Action Plan: Printable Response Checklist
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
