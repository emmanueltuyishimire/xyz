import React, { useState, useId } from 'react';

/**
 * CP2000NoticeDecoder.tsx
 * Tool: CP2000 Notice Decoder & Response Deadline Calculator
 * Primary keyword: what is a cp2000 notice
 *
 * IRS Rules:
 *  - Response deadline: 30 days from Notice Date (60 days if outside US).
 *  - A CP2000 is a PROPOSAL of changes, NOT a final tax bill or audit.
 *  - If no response is received by the 30-day deadline, IRS issues a Notice of Deficiency (CP3219A).
 */

export type DisputeChoice = 'agree' | 'disagree_partial' | 'disagree_full' | 'unsure';

interface DecoderResult {
  noticeDateStr: string;
  deadlineDate: Date;
  deadlineDateStr: string;
  daysRemaining: number;
  urgencyLevel: 'normal' | 'warning' | 'urgent' | 'expired';
  proposedAmount: number;
  disputeChoice: DisputeChoice;
  incomeType: string;
  checklist: string[];
}

export const CP2000NoticeDecoder: React.FC = () => {
  const uid = useId();

  const [noticeDate, setNoticeDate]           = useState<string>('');
  const [proposedAmountStr, setProposedAmountStr] = useState<string>('');
  const [disputeChoice, setDisputeChoice]     = useState<DisputeChoice>('disagree_full');
  const [incomeType, setIncomeType]           = useState<string>('1099-R');
  const [isOutsideUS, setIsOutsideUS]         = useState<boolean>(false);

  const [result, setResult]                   = useState<DecoderResult | null>(null);
  const [error, setError]                     = useState<string>('');
  const [showSampleLetter, setShowSampleLetter] = useState<boolean>(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noticeDate) {
      setError('Please select or enter the Notice Date printed at the top right of your CP2000 letter.');
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

    const proposedAmount = parseFloat(proposedAmountStr.replace(/[^0-9.]/g, '')) || 0;

    // Response deadline: 30 days (or 60 days if abroad)
    const allowedDays = isOutsideUS ? 60 : 30;
    const deadlineDate = new Date(nDate);
    deadlineDate.setDate(deadlineDate.getDate() + allowedDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let urgencyLevel: 'normal' | 'warning' | 'urgent' | 'expired' = 'normal';
    if (daysRemaining < 0) {
      urgencyLevel = 'expired';
    } else if (daysRemaining <= 7) {
      urgencyLevel = 'urgent';
    } else if (daysRemaining <= 14) {
      urgencyLevel = 'warning';
    }

    const deadlineDateStr = deadlineDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const noticeDateStr = nDate.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // Custom Response Checklist based on DisputeChoice
    let checklist: string[] = [];
    if (disputeChoice === 'agree') {
      checklist = [
        'Sign and date Option 1 (Agreement) on the Response Form attached to your CP2000.',
        'If paying in full, attach a check payable to "United States Treasury" with your SSN and tax year on the memo line.',
        'If you need a payment plan, complete IRS Form 9465 or check the installment agreement box on the response form.',
        'Mail or fax the signed response form to the specific IRS address or fax number printed on the CP2000.',
        'Keep a complete copy of the signed form and mailing receipt for your permanent records.',
      ];
    } else if (disputeChoice === 'disagree_full' || disputeChoice === 'disagree_partial') {
      checklist = [
        'Check Option 2 (Partial/Full Disagreement) on the Response Form.',
        'Write a clear, brief explanation detailing WHY the IRS figures are incorrect (e.g. IRA rollover was non-taxable, basis was missing for stock sale, or 1099 was issued in error).',
        'Attach copies of supporting documents (e.g. Form 5498 showing IRA rollover, corrected 1099-B with cost basis, or bank records). Do NOT send original documents.',
        'Mail your response package via USPS Certified Mail with Return Receipt requested to prove timely response.',
        'Call the IRS AUR telephone number printed on your CP2000 if your 30-day deadline is within 5 days.',
      ];
    } else {
      checklist = [
        'Request a copy of your Tax Transcript from IRS.gov or call 1-800-829-1040.',
        'Gather your W-2s, 1099-Rs, 1099-SSA, and 1099-INT for the tax year in question.',
        'If your 30-day deadline is approaching, call the IRS phone number on your CP2000 to request a 30-day extension.',
        'Consult a CPA, Enrolled Agent, or Low Income Taxpayer Clinic (LITC) if you need professional guidance.',
      ];
    }

    setResult({
      noticeDateStr,
      deadlineDate,
      deadlineDateStr,
      daysRemaining,
      urgencyLevel,
      proposedAmount,
      disputeChoice,
      incomeType,
      checklist,
    });
    setShowSampleLetter(false);
  };

  const handleReset = () => {
    setNoticeDate('');
    setProposedAmountStr('');
    setDisputeChoice('disagree_full');
    setIncomeType('1099-R');
    setIsOutsideUS(false);
    setResult(null);
    setError('');
  };

  const fmtUsd = (num: number) =>
    num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  return (
    <div className="cp2000-calc-wrapper">

      {/* ── Trust notice ── */}
      <div className="cp2000-trust-bar" role="note" aria-label="Privacy notice">
        <span>🔒 100% Free &amp; Private</span>
        <span>No signup or account</span>
        <span>Instant browser decoding</span>
        <span>Data is never stored</span>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleCalculate} noValidate aria-label="CP2000 Notice Decoder Form">

        {/* Notice Date */}
        <div className="cp2000-field">
          <label htmlFor={`${uid}-ndate`} className="cp2000-label">
            Notice Date printed on your CP2000 Letter
            <span className="cp2000-required" aria-hidden="true"> *</span>
          </label>
          <p className="cp2000-hint" id={`${uid}-ndate-hint`}>
            Look at the <strong>top right corner</strong> of page 1 of your CP2000. It says "Notice Date" (e.g. October 15, 2026).
          </p>
          <input
            id={`${uid}-ndate`}
            type="date"
            value={noticeDate}
            onChange={e => setNoticeDate(e.target.value)}
            className={`cp2000-input${error ? ' cp2000-input--error' : ''}`}
            aria-describedby={`${uid}-ndate-hint${error ? ` ${uid}-ndate-err` : ''}`}
            aria-invalid={!!error}
            aria-required="true"
          />
          {error && <p id={`${uid}-ndate-err`} className="cp2000-error" role="alert">{error}</p>}
        </div>

        {/* Proposed Amount */}
        <div className="cp2000-field">
          <label htmlFor={`${uid}-amount`} className="cp2000-label">
            Proposed Amount Due (Tax + Interest + Penalties)
          </label>
          <p className="cp2000-hint" id={`${uid}-amount-hint`}>
            Look for "Proposed Amount You Owe" on page 1 of your CP2000. (Optional, for breakdown calculation).
          </p>
          <div className="cp2000-input-addon">
            <span className="cp2000-addon-symbol" aria-hidden="true">$</span>
            <input
              id={`${uid}-amount`}
              type="number"
              min="0"
              step="100"
              value={proposedAmountStr}
              onChange={e => setProposedAmountStr(e.target.value)}
              className="cp2000-input"
              placeholder="e.g. 2450"
              aria-describedby={`${uid}-amount-hint`}
            />
          </div>
        </div>

        {/* Missing Income Type */}
        <div className="cp2000-field">
          <label htmlFor={`${uid}-itype`} className="cp2000-label">
            Type of Missing / Unreported Income Flagged by IRS
          </label>
          <select
            id={`${uid}-itype`}
            value={incomeType}
            onChange={e => setIncomeType(e.target.value)}
            className="cp2000-select"
          >
            <option value="1099-R">Form 1099-R (IRA, 401k, Pension Distribution or Rollover)</option>
            <option value="1099-SSA">Form SSA-1099 (Social Security Benefits)</option>
            <option value="1099-B">Form 1099-B (Brokerage Stock Sale / Cost Basis Missing)</option>
            <option value="1099-INT">Form 1099-INT / 1099-DIV (Bank Interest or Dividends)</option>
            <option value="1099-MISC">Form 1099-MISC / 1099-NEC (Self-Employment / Freelance Income)</option>
            <option value="W2">Form W-2 (Wages or Salary)</option>
            <option value="Other">Other / Multiple Forms</option>
          </select>
        </div>

        {/* Dispute Choice */}
        <div className="cp2000-field">
          <label htmlFor={`${uid}-dispute`} className="cp2000-label">
            Do You Agree or Disagree with the IRS Proposal?
          </label>
          <select
            id={`${uid}-dispute`}
            value={disputeChoice}
            onChange={e => setDisputeChoice(e.target.value as DisputeChoice)}
            className="cp2000-select"
          >
            <option value="disagree_full">I DISAGREE fully (The IRS figures are wrong / missing info)</option>
            <option value="disagree_partial">I DISAGREE partially (Some items are correct, others are wrong)</option>
            <option value="agree">I AGREE fully (I forgot to report this income and owe the tax)</option>
            <option value="unsure">I'm UNSURE / Need time to check my tax records</option>
          </select>
        </div>

        {/* Outside US Toggle */}
        <div className="cp2000-field cp2000-field--checkbox">
          <label className="cp2000-checkbox-label">
            <input
              type="checkbox"
              checked={isOutsideUS}
              onChange={e => setIsOutsideUS(e.target.checked)}
              className="cp2000-checkbox"
            />
            I reside outside the United States (Extends deadline to 60 days)
          </label>
        </div>

        {/* Actions */}
        <div className="cp2000-actions">
          <button type="submit" className="cp2000-btn cp2000-btn--primary">
            Decode My CP2000 Notice
          </button>
          {result && (
            <button type="button" className="cp2000-btn cp2000-btn--ghost" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </form>

      {/* ── Results Output ── */}
      {result && (
        <div className="cp2000-results" role="region" aria-live="polite" aria-label="CP2000 Decoder Results">
          
          {/* Urgency Status Card */}
          <div className={`cp2000-card cp2000-card--${result.urgencyLevel}`}>
            <div className="cp2000-status-header">
              <span className={`cp2000-badge cp2000-badge--${result.urgencyLevel}`}>
                {result.urgencyLevel === 'expired' && '⚠️ DEADLINE EXPIRED — ACT IMMEDIATELY'}
                {result.urgencyLevel === 'urgent' && '🚨 URGENT: LESS THAN 7 DAYS REMAINING'}
                {result.urgencyLevel === 'warning' && '⏰ ACTION REQUIRED: DEADLINE APPROACHING'}
                {result.urgencyLevel === 'normal' && '✅ RESPONSE WINDOW OPEN'}
              </span>
              <p className="cp2000-notice-ref">Notice Date: <strong>{result.noticeDateStr}</strong></p>
            </div>

            <div className="cp2000-stat-grid">
              <div className="cp2000-stat-unit">
                <span className="cp2000-stat-val">{result.deadlineDateStr}</span>
                <span className="cp2000-stat-lbl">Your official IRS response deadline (30-day rule)</span>
              </div>
              <div className="cp2000-stat-unit cp2000-stat-unit--sec">
                <span className="cp2000-stat-val">
                  {result.daysRemaining < 0
                    ? `${Math.abs(result.daysRemaining)} days past deadline`
                    : `${result.daysRemaining} days remaining`}
                </span>
                <span className="cp2000-stat-lbl">Time left to respond to avoid Notice of Deficiency</span>
              </div>
            </div>

            {result.proposedAmount > 0 && (
              <div className="cp2000-amount-box">
                <span>Proposed Amount IRS Says You Owe:</span>
                <strong>{fmtUsd(result.proposedAmount)}</strong>
              </div>
            )}
          </div>

          {/* Plain Language Summary */}
          <div className="cp2000-summary-box">
            <h3>What This CP2000 Notice Means for You</h3>
            <p>
              <strong>1. This is NOT a bill or a formal audit.</strong> The IRS Automated Underreporter (AUR) computer matched a income document (like a {result.incomeType}) sent by a bank or employer against your tax return and found a discrepancy.
            </p>
            <p>
              <strong>2. You have the legal right to dispute it.</strong> Over 40% of CP2000 notices are incorrect or missing cost basis / non-taxable rollover details. You do not owe a dime until you agree or the IRS issues a formal statutory notice.
            </p>
          </div>

          {/* Personalized Response Checklist */}
          <div className="cp2000-checklist-box">
            <h4>Your Step-by-Step Response Checklist ({result.disputeChoice === 'agree' ? 'Agreeing' : 'Disputing / Explaining'})</h4>
            <ol className="cp2000-checklist-list">
              {result.checklist.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>

          {/* Sample Letter Toggle if Disagreeing */}
          {(result.disputeChoice === 'disagree_full' || result.disputeChoice === 'disagree_partial') && (
            <div className="cp2000-sample-letter-wrapper">
              <button
                type="button"
                className="cp2000-work-btn"
                onClick={() => setShowSampleLetter(v => !v)}
                aria-expanded={showSampleLetter}
              >
                {showSampleLetter ? '▲ Hide Sample CP2000 Dispute Letter Template' : '▼ View Printable CP2000 Response Letter Template'}
              </button>

              {showSampleLetter && (
                <div className="cp2000-letter-box" aria-label="Sample Dispute Letter">
                  <div className="cp2000-letter-header">
                    <span>Sample CP2000 Response Letter Template</span>
                    <small>Copy and fill in your details</small>
                  </div>
                  <pre className="cp2000-letter-text">
{`Internal Revenue Service
[Address printed on your CP2000 Response Form]

Re: Response to Notice CP2000
Taxpayer Name: [Your Full Name]
SSN (last 4 digits): xxx-xx-[XXXX]
Tax Year: [Tax Year from CP2000]
Notice Date: ${result.noticeDateStr}

To Whom It May Concern:

I am writing in response to the CP2000 notice dated ${result.noticeDateStr} regarding my tax return for the year [Tax Year].

I DISAGREE with the proposed changes outlined in the notice for the following reasons:

The notice flags a distribution from [Payer Name / Form ${result.incomeType}]. This amount is not taxable income because:
[Explain: e.g. "This was a direct trustee-to-trustee rollover into a qualified IRA within 60 days" OR "The 1099-B omitted my original cost basis of $XX,XXX" OR "Social Security benefits were already properly reported on Line 6a/6b"].

Attached please find copies of supporting documentation:
1. Copy of CP2000 Response Form (Option 2 checked)
2. Copy of Form 5498 / Account Statement proving non-taxable rollover or cost basis
3. Copy of [Other supporting documents]

Please update your records to reflect that no additional tax or penalty is owed.

Sincerely,

____________________________________
[Your Signature]
Date: [Today's Date]
Phone: [Your Phone Number]`}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      <style>{`
        .cp2000-calc-wrapper { font-family: inherit; }

        .cp2000-trust-bar {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem;
          font-size: 0.825rem; color: var(--color-text-muted, #64748b);
          background: var(--color-surface-alt, #f8fafc);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.5rem;
          padding: 0.6rem 1rem;
          margin-bottom: 1.5rem;
        }

        .cp2000-field { margin-bottom: 1.5rem; }
        .cp2000-field--checkbox {
          background: var(--color-surface-alt, #f8fafc);
          border: 1px dashed var(--color-border, #cbd5e1);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
        }

        .cp2000-label {
          display: block; font-size: 1rem; font-weight: 600;
          color: var(--color-primary, #0A3D3A); margin-bottom: 0.4rem;
        }
        .cp2000-required { color: var(--color-error, #c0392b); }
        .cp2000-hint {
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
          line-height: 1.5; margin: 0 0 0.6rem 0; max-width: 60ch;
        }

        .cp2000-select {
          display: block; width: 100%; max-width: 520px;
          font-size: 0.95rem; padding: 0.65rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }

        .cp2000-input-addon { display: flex; align-items: center; max-width: 260px; }
        .cp2000-addon-symbol {
          background: var(--color-surface-alt, #f1f5f9);
          border: 2px solid var(--color-border, #cbd5e1);
          border-right: none;
          border-radius: 0.5rem 0 0 0.5rem;
          padding: 0.6rem 0.85rem;
          font-weight: 700; color: var(--color-primary, #0A3D3A);
        }
        .cp2000-input {
          flex: 1; font-size: 1.05rem; padding: 0.6rem 0.85rem;
          border: 2px solid var(--color-border, #cbd5e1);
          border-radius: 0.5rem; background: #fff;
          color: var(--color-primary, #0A3D3A);
        }
        .cp2000-input-addon .cp2000-input { border-radius: 0 0.5rem 0.5rem 0; }
        .cp2000-input:focus { outline: none; border-color: var(--color-secondary, #C9933A); box-shadow: 0 0 0 3px rgba(201,147,58,0.2); }
        .cp2000-input--error { border-color: var(--color-error, #c0392b); }
        .cp2000-error { font-size: 0.875rem; color: var(--color-error, #c0392b); margin-top: 0.4rem; }

        .cp2000-checkbox-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.95rem; font-weight: 600; color: var(--color-primary, #0A3D3A); }
        .cp2000-checkbox { width: 1.2rem; height: 1.2rem; cursor: pointer; accent-color: var(--color-secondary, #C9933A); flex-shrink: 0; }

        .cp2000-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .cp2000-btn {
          font-size: 1rem; font-weight: 700; border-radius: 0.5rem;
          padding: 0.8rem 1.75rem; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;
        }
        .cp2000-btn--primary { background: var(--color-primary, #0A3D3A); color: #fff; border-color: var(--color-primary, #0A3D3A); }
        .cp2000-btn--primary:hover { background: var(--color-primary-dark, #072e2c); }
        .cp2000-btn--ghost { background: transparent; color: var(--color-text-muted, #64748b); border-color: var(--color-border, #cbd5e1); }
        .cp2000-btn:focus-visible { outline: 3px solid var(--color-secondary, #C9933A); outline-offset: 2px; }

        /* Results */
        .cp2000-results { margin-top: 2rem; }
        .cp2000-card { border-radius: 0.875rem; padding: 1.75rem; margin-bottom: 1.25rem; }
        .cp2000-card--normal { background: #f0fdf4; border: 2px solid #22c55e; }
        .cp2000-card--warning { background: #fffbeb; border: 2px solid #f59e0b; }
        .cp2000-card--urgent { background: #fff7ed; border: 2px solid #f97316; }
        .cp2000-card--expired { background: #fef2f2; border: 2px solid #ef4444; }

        .cp2000-status-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
        .cp2000-badge { font-size: 0.75rem; font-weight: 700; border-radius: 9999px; padding: 0.25rem 0.75rem; }
        .cp2000-badge--normal { background: #dcfce7; color: #15803d; }
        .cp2000-badge--warning { background: #fef3c7; color: #92400e; }
        .cp2000-badge--urgent { background: #ffedd5; color: #c2410c; }
        .cp2000-badge--expired { background: #fee2e2; color: #b91c1c; }
        .cp2000-notice-ref { font-size: 0.875rem; color: var(--color-text-muted, #64748b); margin: 0; }

        .cp2000-stat-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1rem; }
        .cp2000-stat-unit { display: flex; flex-direction: column; }
        .cp2000-stat-val { font-size: 1.6rem; font-weight: 800; color: var(--color-primary, #0A3D3A); line-height: 1.2; }
        .cp2000-stat-lbl { font-size: 0.85rem; color: var(--color-text-muted, #64748b); margin-top: 0.3rem; }
        .cp2000-stat-unit--sec .cp2000-stat-val { color: #b45309; }

        .cp2000-amount-box { background: #fff; border-radius: 0.5rem; padding: 0.75rem 1rem; display: flex; justify-content: space-between; font-size: 0.95rem; border: 1px solid #cbd5e1; }
        .cp2000-amount-box strong { color: #b45309; font-size: 1.1rem; }

        .cp2000-summary-box { background: #fff; border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.25rem; }
        .cp2000-summary-box h3 { font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #0A3D3A); margin: 0 0 0.75rem; }
        .cp2000-summary-box p { font-size: 0.95rem; line-height: 1.6; color: #334155; margin: 0 0 0.6rem; }

        .cp2000-checklist-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.25rem; }
        .cp2000-checklist-box h4 { font-size: 1.05rem; font-weight: 700; color: #15803d; margin: 0 0 0.75rem; }
        .cp2000-checklist-list { padding-left: 1.25rem; margin: 0; }
        .cp2000-checklist-list li { font-size: 0.925rem; color: #166534; line-height: 1.6; margin-bottom: 0.6rem; }

        .cp2000-work-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.875rem; color: var(--color-secondary, #C9933A);
          text-decoration: underline; padding: 0.25rem 0; display: block; margin-bottom: 1rem;
        }

        .cp2000-letter-box { background: #0f172a; color: #f8fafc; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; }
        .cp2000-letter-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; margin-bottom: 1rem; }
        .cp2000-letter-header span { font-weight: 700; color: #38bdf8; font-size: 0.95rem; }
        .cp2000-letter-header small { color: #94a3b8; font-size: 0.8rem; }
        .cp2000-letter-text { font-family: monospace; font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; color: #e2e8f0; margin: 0; max-height: 320px; overflow-y: auto; }

        @media (max-width: 640px) {
          .cp2000-select { max-width: 100%; }
          .cp2000-stat-val { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
};
