import React, { useState, useId } from 'react';

type TripPurpose = 'medical' | 'errands';

interface Recommendation {
  id: string;
  title: string;
  badge: string;
  badgeType: 'free' | 'low-cost' | 'check';
  appliesIf: string;
  eligibility: string;
  costInfo: string;
  schedulingRule: string;
  howToBook: string;
  link?: { text: string; url: string };
  callScript: string;
}

export const SeniorTransportationFinder: React.FC = () => {
  const uid = useId();

  // State
  const [tripPurpose, setTripPurpose] = useState<TripPurpose>('medical');
  const [isMedicaid, setIsMedicaid] = useState<boolean | null>(null);
  const [isMedicareAdvantage, setIsMedicareAdvantage] = useState<boolean | null>(null);
  const [isVeteran, setIsVeteran] = useState<boolean | null>(null);
  const [hasBusDisability, setHasBusDisability] = useState<boolean | null>(null);

  // Build ranked recommendations strictly matching user's answers
  const recommendations: Recommendation[] = [];

  if (tripPurpose === 'medical') {
    // 1. Medicaid NEMT (Applies if enrolled in Medicaid)
    if (isMedicaid === true) {
      recommendations.push({
        id: 'medicaid-nemt',
        title: 'Medicaid Non-Emergency Medical Transportation (NEMT)',
        badge: 'Covered Care Benefit',
        badgeType: 'free',
        appliesIf: 'You are enrolled in Medicaid and traveling to covered medical care.',
        eligibility: 'Enrolled in Medicaid and traveling to a covered medical appointment with no other means of transportation.',
        costInfo: 'states must ensure necessary transportation to covered medical care (42 CFR § 431.53); generally no cost to you; confirm with your plan or broker.',
        schedulingRule: 'General guidance: many state Medicaid ride brokers require advance notice of about two to three business days; call early and ask your broker for its exact rule.',
        howToBook: 'Check your Medicaid managed care ID card for the transportation scheduling number, or contact your state Medicaid agency.',
        link: {
          text: 'Medicaid.gov Transportation Services',
          url: 'https://www.medicaid.gov/medicaid/benefits/transportation/index.html',
        },
        callScript:
          "Ask your plan: 'I have an upcoming covered medical appointment on [Date] at [Time]. How do I schedule non-emergency medical transportation (NEMT) through Medicaid, and what is your advance notice deadline?'",
      });
    }

    // 2. VA Beneficiary Travel (Applies if veteran)
    if (isVeteran === true) {
      recommendations.push({
        id: 'va-travel',
        title: 'VA Beneficiary Travel Program',
        badge: 'Veterans Benefit',
        badgeType: 'free',
        appliesIf: 'You are a U.S. military veteran traveling to VA medical care.',
        eligibility:
          'Eligibility depends on factors such as disability rating, the reason for travel and income. See VA.gov for current rules.',
        costInfo: 'Free special mode transportation or mileage reimbursement for approved travel.',
        schedulingRule: 'Contact the travel office at your local VA facility as soon as your appointment is scheduled.',
        howToBook:
          'Submit travel claims online via the AccessVA Beneficiary Travel portal, or contact the Beneficiary Travel Office at your nearest VA medical center.',
        link: {
          text: 'VA.gov Beneficiary Travel Details',
          url: 'https://www.va.gov/health-care/get-reimbursed-for-travel-pay/',
        },
        callScript:
          "Ask your VA clinic: 'I am a veteran with an upcoming appointment at the VA medical center on [Date]. Am I eligible for travel assistance or reimbursement under the Beneficiary Travel Program?'",
      });
    }

    // 3. Medicare Advantage NEMT (Applies if enrolled in Part C)
    if (isMedicareAdvantage === true) {
      recommendations.push({
        id: 'ma-transport',
        title: 'Medicare Advantage Supplemental Transportation Benefit',
        badge: 'Plan Benefit — Check EOC',
        badgeType: 'check',
        appliesIf: 'You have a Medicare Advantage plan offering supplemental transportation benefits.',
        eligibility:
          'Enrolled in a Medicare Advantage (Part C) plan that offers transportation as an optional supplemental benefit. Original Medicare generally does not cover routine rides.',
        costInfo: 'generally no cost to you; confirm with your plan or broker. The number of covered rides varies by plan and county.',
        schedulingRule: 'Typically 48 to 72 hours advance notice required; check with your Medicare Advantage plan or ride vendor.',
        howToBook:
          'Call the Member Services phone number on the back of your Medicare Advantage insurance card. Ask for the transportation coordinator.',
        callScript:
          "Ask your plan: 'Does my plan include a transportation benefit for medical appointments? If yes, what broker or phone number do I call to book a ride, and how many days of advance notice are required?'",
      });
    }
  }

  // 4. ADA Complementary Paratransit (One unified ADA route for medical & essential errands)
  if (hasBusDisability === true) {
    recommendations.push({
      id: 'ada-paratransit',
      title: 'ADA Complementary Paratransit Service',
      badge: 'Low Fare Public Transit',
      badgeType: 'low-cost',
      appliesIf: 'You have a disability preventing independent use of standard fixed-route public buses.',
      eligibility:
        'Required by federal law (ADA Title II & 49 CFR Part 37) for riders with a physical, cognitive, or visual impairment that prevents them from independently boarding or navigating fixed-route city buses. Transit agencies cannot restrict or prioritize trip types — paratransit can be used for medical appointments, groceries, shopping, and community errands.',
      costInfo:
        'Fares cannot legally exceed twice the standard local bus fare (typically $2.00 to $4.00 per one-way ride).',
      schedulingRule:
        'Next-day scheduling is legally required by ADA regulations for certified riders; reservations typically taken during normal business hours.',
      howToBook:
        'Contact your local municipal or regional public transit authority. Request an ADA paratransit application and in-person or functional assessment.',
      link: {
        text: 'Federal Transit Administration (FTA) ADA Paratransit Regulations',
        url: 'https://www.transit.dot.gov/regulations-and-guidance/civil-rights-ada/americans-disabilities-act',
      },
      callScript:
        "Ask your transit authority: 'I have a mobility limitation that prevents me from riding regular city buses. How do I request an application and assessment for ADA complementary paratransit in my county?'",
    });
  }

  // 5. Universal Community / Area Agency on Aging Option (One unified AAA route)
  recommendations.push({
    id: 'aaa-community',
    title: 'Area Agency on Aging (AAA) & Volunteer Drivers',
    badge: 'Community / Low-Cost',
    badgeType: 'low-cost',
    appliesIf: 'You are age 60 or older seeking local community, medical, or errand rides.',
    eligibility:
      'Seniors age 60 and older. Priority often given to older adults with greatest social or economic need under the Older Americans Act. Programs include volunteer driver networks and senior center shopping shuttles.',
    costInfo:
      'Usually free, donation-based, or low-cost subsidized vouchers depending on your local AAA program.',
    schedulingRule:
      'Volunteer programs often require 2 to 7 business days advance notice to match an available driver or reserve a shuttle.',
    howToBook:
      'Contact your local Area Agency on Aging through the national Eldercare Locator directory online or by phone at 1-800-677-1116.',
    link: {
      text: 'Eldercare Locator Directory (eldercare.acl.gov)',
      url: 'https://eldercare.acl.gov',
    },
    callScript:
      "Call 1-800-677-1116 (Eldercare Locator): 'I am a senior living in [City/County, State]. Please connect me with my local Area Agency on Aging to find volunteer driver programs or senior van shuttles in my area.'",
  });

  // 6. 211 Immediate Community Referral (One unified 211 route)
  recommendations.push({
    id: 'community-211',
    title: '211 Local Community Ride Assistance',
    badge: '24/7 Information & Referral',
    badgeType: 'check',
    appliesIf: 'You need local charitable, faith-based, or non-profit ride programs.',
    eligibility: 'Available to all community residents needing assistance with medical or essential errand transportation.',
    costInfo: 'Free referral service connecting you to local non-profit and faith-based ride programs.',
    schedulingRule: 'Varies by individual community organization.',
    howToBook: 'Call or text 2-1-1 from any mobile phone or landline, or search online at 211.org.',
    link: {
      text: '211.org Community Resources',
      url: 'https://www.211.org',
    },
    callScript:
      "Call 211: 'I am a senior living in [Zip Code]. Are there non-profit, faith-based, or municipal volunteer ride services in my neighborhood that assist with rides for seniors?'",
  });

  const answeredAny = isMedicaid !== null || isMedicareAdvantage !== null || isVeteran !== null || hasBusDisability !== null;

  return (
    <div className="stf-container" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Step 1: Trip Purpose Selector */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#0D2137', marginBottom: '8px' }}>
          What Type of Ride Do You Need?
        </label>
        <div style={{ display: 'flex', gap: '8px', maxWidth: '480px' }}>
          <button
            type="button"
            onClick={() => setTripPurpose('medical')}
            style={{
              flex: 1,
              padding: '12px 10px',
              borderRadius: '8px',
              border: `2px solid ${tripPurpose === 'medical' ? '#0A3D3A' : '#CBD5E1'}`,
              background: tripPurpose === 'medical' ? '#E6F4F1' : '#fff',
              color: tripPurpose === 'medical' ? '#0A3D3A' : '#0D2137',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            🏥 Medical Visits
          </button>
          <button
            type="button"
            onClick={() => setTripPurpose('errands')}
            style={{
              flex: 1,
              padding: '12px 10px',
              borderRadius: '8px',
              border: `2px solid ${tripPurpose === 'errands' ? '#0A3D3A' : '#CBD5E1'}`,
              background: tripPurpose === 'errands' ? '#E6F4F1' : '#fff',
              color: tripPurpose === 'errands' ? '#0A3D3A' : '#0D2137',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            🛒 Errands / Social
          </button>
        </div>
      </div>

      {/* Step 2: Questionnaire */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0A3D3A', margin: '0 0 16px 0' }}>
          Answer 4 Quick Questions to Match Your Options:
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Question 1: Medicaid */}
          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2137', margin: '0 0 8px 0' }}>
              1. Enrolled in Medicaid?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsMedicaid(true)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${isMedicaid === true ? '#0A3D3A' : '#CBD5E1'}`,
                  background: isMedicaid === true ? '#0A3D3A' : '#fff',
                  color: isMedicaid === true ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsMedicaid(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${isMedicaid === false ? '#0A3D3A' : '#CBD5E1'}`,
                  background: isMedicaid === false ? '#0A3D3A' : '#fff',
                  color: isMedicaid === false ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 2: Medicare Advantage */}
          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2137', margin: '0 0 8px 0' }}>
              2. Have a Medicare Advantage (Part C) plan?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsMedicareAdvantage(true)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${isMedicareAdvantage === true ? '#0A3D3A' : '#CBD5E1'}`,
                  background: isMedicareAdvantage === true ? '#0A3D3A' : '#fff',
                  color: isMedicareAdvantage === true ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsMedicareAdvantage(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${isMedicareAdvantage === false ? '#0A3D3A' : '#CBD5E1'}`,
                  background: isMedicareAdvantage === false ? '#0A3D3A' : '#fff',
                  color: isMedicareAdvantage === false ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                No / Original
              </button>
            </div>
          </div>

          {/* Question 3: Veteran */}
          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2137', margin: '0 0 8px 0' }}>
              3. Are you a U.S. military veteran?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsVeteran(true)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${isVeteran === true ? '#0A3D3A' : '#CBD5E1'}`,
                  background: isVeteran === true ? '#0A3D3A' : '#fff',
                  color: isVeteran === true ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsVeteran(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${isVeteran === false ? '#0A3D3A' : '#CBD5E1'}`,
                  background: isVeteran === false ? '#0A3D3A' : '#fff',
                  color: isVeteran === false ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 4: Bus / Mobility Disability */}
          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D2137', margin: '0 0 8px 0' }}>
              4. Disability preventing standard bus use?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setHasBusDisability(true)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${hasBusDisability === true ? '#0A3D3A' : '#CBD5E1'}`,
                  background: hasBusDisability === true ? '#0A3D3A' : '#fff',
                  color: hasBusDisability === true ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHasBusDisability(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1.5px solid ${hasBusDisability === false ? '#0A3D3A' : '#CBD5E1'}`,
                  background: hasBusDisability === false ? '#0A3D3A' : '#fff',
                  color: hasBusDisability === false ? '#fff' : '#0D2137',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Ranked Output ("Try these in this order") */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A3D3A', margin: 0 }}>
            Matched Options: Try These in This Order
          </h2>
          <span style={{ fontSize: '13px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '9999px', color: '#475569', fontWeight: 600 }}>
            Ranked by Cost &amp; Eligibility
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              style={{
                background: '#fff',
                border: '1.5px solid #DDE3EA',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      background: '#0A3D3A',
                      color: '#fff',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                    }}
                  >
                    {index + 1}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0D2137', margin: 0 }}>
                    {rec.title}
                  </h3>
                </div>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: rec.badgeType === 'free' ? '#DCFCE7' : rec.badgeType === 'low-cost' ? '#E0F2FE' : '#FEF3C7',
                    color: rec.badgeType === 'free' ? '#166534' : rec.badgeType === 'low-cost' ? '#0369A1' : '#92400E',
                  }}
                >
                  {rec.badge}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '14px', color: '#334155', marginBottom: '14px' }}>
                <div style={{ gridColumn: '1 / -1', background: '#F1F5F9', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}>
                  <strong style={{ color: '#0A3D3A' }}>Applies if: </strong>
                  {rec.appliesIf}
                </div>
                <div>
                  <strong style={{ color: '#0D2137' }}>Who Qualifies: </strong>
                  {rec.eligibility}
                </div>
                <div>
                  <strong style={{ color: '#0D2137' }}>Cost: </strong>
                  {rec.costInfo}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#0D2137' }}>Advance Notice Rule: </strong>
                  {rec.schedulingRule}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#0D2137' }}>How to Book: </strong>
                  {rec.howToBook}
                </div>
              </div>

              {rec.link && (
                <div style={{ marginBottom: '14px' }}>
                  <a
                    href={rec.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      color: '#0A3D3A',
                      fontWeight: 700,
                      fontSize: '14px',
                      textDecoration: 'underline',
                    }}
                  >
                    🔗 Official Directory / Details: {rec.link.text} →
                  </a>
                </div>
              )}

              {/* Call Script Box */}
              <div
                style={{
                  background: '#F0FDF4',
                  borderLeft: '4px solid #16A34A',
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 16px',
                }}
              >
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  📞 What to Say When You Call:
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#14532D', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{rec.callScript}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency / Immediate Contact Card */}
      <div
        style={{
          marginTop: '28px',
          background: '#0A3D3A',
          color: '#fff',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#C9933A' }}>
            Need Free Guidance Finding Senior Rides?
          </h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#E2E8F0', maxWidth: '540px' }}>
            Call the federal Eldercare Locator at <strong>1-800-677-1116</strong> (toll-free, Mon–Fri 9am–8pm ET) to connect with your local Area Agency on Aging.
          </p>
        </div>
        <a
          href="https://eldercare.acl.gov"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#C9933A',
            color: '#0D2137',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 800,
            textDecoration: 'none',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          Visit Eldercare Locator Online →
        </a>
      </div>
    </div>
  );
};
