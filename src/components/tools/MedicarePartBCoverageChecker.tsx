import React, { useState, useId, useMemo, useCallback } from 'react';

/**
 * MedicarePartBCoverageChecker.tsx
 * Tool: Medicare Part B Coverage Checker
 * Primary keyword: what does medicare part b cover
 * Supporting keywords: medicare part b covers, medicare part b coverage, does medicare part b cover
 *
 * 2026 Verified Figures — confirmed against CMS.gov:
 *   Part B annual deductible  : $283
 *   Standard coinsurance      : 20% of Medicare-approved amount (after deductible)
 *   Standard monthly premium  : $202.90
 *   No annual out-of-pocket maximum under Original Medicare Part B
 *   Preventive services: $0 cost-sharing when frequency/eligibility rules met
 *
 * Source: cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
 */

// ─── Types ──────────────────────────────────────────────────────────────────

type CoverageType = 'standard' | 'preventive' | 'conditional' | 'not_covered';
type DeductibleStatus = 'met' | 'not_met' | 'unsure';
type FilingStatus = 'single' | 'joint' | 'married_separate';

interface ServiceEntry {
  id: string;
  label: string;
  aliases: string[];      // plain-language search terms
  category: string;
  covered: boolean;
  coverageType: CoverageType;
  deductibleApplies: boolean;
  coinsuranceRate: number | null; // 0.0 or 0.20 or null (not covered)
  notes: string;
  caveat?: string;        // Special nuance shown in yellow callout
  exampleCharge: number;  // Typical billed charge for the cost example
  officialSource: string;
  notCoveredAlternative?: string;
  internalLink?: { href: string; text: string }[];
}

// ─── 2026 Constants ──────────────────────────────────────────────────────────

const PART_B_DEDUCTIBLE_2026 = 283;
const PART_B_COINSURANCE_RATE = 0.20;
const PART_B_BASE_PREMIUM_2026 = 202.90;

// IRMAA Part B surcharges (2026, Single filer thresholds against 2024 MAGI)
const IRMAA_TIERS_SINGLE = [
  { label: 'At or below $109,000 (no surcharge)', surcharge: 0 },
  { label: '$109,001 – $137,000', surcharge: 81.20 },
  { label: '$137,001 – $171,000', surcharge: 202.90 },
  { label: '$171,001 – $205,000', surcharge: 324.60 },
  { label: '$205,001 – $500,000', surcharge: 446.30 },
  { label: 'Above $500,000', surcharge: 487.00 },
];

// ─── Service Database ────────────────────────────────────────────────────────

const SERVICES: ServiceEntry[] = [
  // ── Doctor Visits & Specialist Care ──────────────────────────────────────
  {
    id: 'doctor-office-visit',
    label: "Doctor's office visit (medically necessary)",
    aliases: ['doctor visit', 'primary care', 'pcp', 'office visit', 'physician', 'general practitioner', 'gp', 'internist', 'family doctor'],
    category: 'Doctor Visits & Specialist Care',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Medicare pays 80% of the Medicare-approved amount after you meet the $283 annual deductible. You pay the remaining 20% with no annual cap.',
    exampleCharge: 175,
    officialSource: 'https://www.medicare.gov/coverage/doctors-services',
    internalLink: [{ href: '/tools/original-medicare-medigap-part-d-cost-estimator/', text: 'Estimate your annual out-of-pocket exposure with Medigap →' }],
  },
  {
    id: 'specialist-visit',
    label: 'Specialist visit (cardiologist, oncologist, etc.)',
    aliases: ['specialist', 'cardiologist', 'oncologist', 'rheumatologist', 'neurologist', 'endocrinologist', 'nephrologist', 'urologist', 'dermatologist', 'referral'],
    category: 'Doctor Visits & Specialist Care',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Specialist visits are covered under Part B when medically necessary. You do not need a referral under Original Medicare — you can see any Medicare-participating specialist directly.',
    exampleCharge: 280,
    officialSource: 'https://www.medicare.gov/coverage/doctors-services',
    internalLink: [{ href: '/tools/original-medicare-medigap-part-d-cost-estimator/', text: 'Estimate your annual out-of-pocket exposure →' }],
  },
  {
    id: 'second-surgical-opinion',
    label: 'Second surgical opinion',
    aliases: ['second opinion', 'surgical opinion', 'surgery opinion', 'confirm diagnosis'],
    category: 'Doctor Visits & Specialist Care',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Medicare covers second (and in some cases third) opinions before surgery to help you make an informed decision.',
    exampleCharge: 200,
    officialSource: 'https://www.medicare.gov/coverage/second-surgical-opinions',
  },
  {
    id: 'emergency-room-visit',
    label: 'Emergency room visit (outpatient)',
    aliases: ['er', 'emergency room', 'er visit', 'urgent care', 'emergency', 'hospital emergency'],
    category: 'Doctor Visits & Specialist Care',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Outpatient emergency visits are covered under Part B. If you are admitted as an inpatient, Part A hospital coverage applies instead.',
    exampleCharge: 1800,
    officialSource: 'https://www.medicare.gov/coverage/emergency-medical-care',
    internalLink: [{ href: '/tools/original-medicare-medigap-part-d-cost-estimator/', text: 'See your worst-case exposure without Medigap →' }],
  },

  // ── Preventive & Screening Services ──────────────────────────────────────
  {
    id: 'annual-wellness-visit',
    label: 'Annual Wellness Visit (AWV)',
    aliases: ['annual wellness visit', 'awv', 'yearly checkup', 'annual checkup', 'wellness visit', 'annual physical', 'free physical', 'preventive visit'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'The Annual Wellness Visit (AWV) is covered at $0 — no deductible, no coinsurance — once every 12 months after you have had Part B for more than 12 months. It is not a physical exam; it focuses on your health history and creating a prevention plan.',
    caveat: 'Important: If your doctor performs additional tests or services beyond the AWV scope during the same visit, those additional services may be subject to the deductible and 20% coinsurance.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/wellness-visits',
  },
  {
    id: 'welcome-to-medicare-visit',
    label: 'Welcome to Medicare preventive visit (one-time)',
    aliases: ['welcome to medicare', 'initial preventive', 'first medicare visit', 'ippe', 'one time preventive'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Available once within the first 12 months of Part B enrollment. Covered at $0. Includes a review of your health and a written prevention plan.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/wellness-visits',
  },
  {
    id: 'flu-shot',
    label: 'Flu shot (influenza vaccine)',
    aliases: ['flu shot', 'flu vaccine', 'influenza vaccine', 'influenza shot', 'flu vaccination', 'flu immunization'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Covered at $0 once per flu season. If medically necessary, a second flu shot may be covered in the same season.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/flu-shots',
  },
  {
    id: 'pneumococcal-vaccine',
    label: 'Pneumococcal vaccine (pneumonia shot)',
    aliases: ['pneumonia shot', 'pneumococcal vaccine', 'pneumonia vaccine', 'prevnar', 'pneumovax', 'pneumonia vaccination'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Medicare covers two pneumococcal shots: one PCV15 or PCV20 and one PPSV23, with a gap between them. Both are covered at $0.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/pneumococcal-shots',
  },
  {
    id: 'covid-19-vaccine',
    label: 'COVID-19 vaccine',
    aliases: ['covid vaccine', 'covid shot', 'covid-19 vaccine', 'covid booster', 'coronavirus vaccine'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Medicare covers COVID-19 vaccines and boosters at $0.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/covid-19-vaccines',
  },
  {
    id: 'hepatitis-b-vaccine',
    label: 'Hepatitis B vaccine (at-risk individuals)',
    aliases: ['hepatitis b vaccine', 'hep b shot', 'hepatitis vaccine'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Covered at $0 for individuals at medium-to-high risk of hepatitis B. Risk factors include end-stage renal disease, hemophilia, and certain occupational exposures.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/hepatitis-b-shots',
  },
  {
    id: 'colonoscopy',
    label: 'Colonoscopy (colorectal cancer screening)',
    aliases: ['colonoscopy', 'colon cancer screening', 'colorectal screening', 'colon exam', 'colorectal cancer test', 'bowel exam'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Screening colonoscopy covered at $0 (no deductible, no coinsurance) every 10 years for average-risk individuals, or every 2 years for high-risk individuals.',
    caveat: 'Polyp removal during screening: If a polyp is found and removed during what began as a screening colonoscopy, that therapeutic procedure may trigger a 20% coinsurance charge on the additional treatment portion. The deductible does not apply, but coinsurance on the therapeutic portion may. Ask your provider about this before your appointment.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/colorectal-cancer-screenings',
  },
  {
    id: 'stool-dna-test',
    label: 'Colorectal cancer screening — stool tests (FIT, FOBT, Cologuard)',
    aliases: ['stool test', 'fobt', 'fit test', 'cologuard', 'fecal dna', 'fecal occult blood', 'colorectal stool', 'dna stool test', 'multitarget stool'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Fecal occult blood tests (FOBT, FIT) covered every 12 months. Multi-target stool DNA test (Cologuard) covered every 3 years for average-risk individuals age 45–85. All covered at $0.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/colorectal-cancer-screenings',
  },
  {
    id: 'mammogram',
    label: 'Mammogram (breast cancer screening)',
    aliases: ['mammogram', 'mammography', 'breast cancer screening', 'breast exam', 'breast cancer test', 'mammograms'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Screening mammograms are covered at $0 once every 12 months for women age 40+. One baseline mammogram is covered between ages 35 and 39.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/mammograms',
  },
  {
    id: 'pap-smear',
    label: 'Pap smear / pelvic exam (cervical cancer screening)',
    aliases: ['pap smear', 'pap test', 'pelvic exam', 'cervical cancer screening', 'cervical exam', 'gynecological exam', 'ob-gyn'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Pap smear and pelvic exam covered at $0 every 24 months (every 12 months if you are at high risk for cervical or vaginal cancer, or if you are of childbearing age and had an abnormal Pap smear in the past 36 months).',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/pap-tests-pelvic-exams',
  },
  {
    id: 'prostate-cancer-screening',
    label: 'Prostate cancer screening (PSA test)',
    aliases: ['psa test', 'prostate cancer screening', 'prostate exam', 'prostate screening', 'digital rectal exam'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'PSA blood test and digital rectal exam for prostate cancer covered at $0 once every 12 months for men age 50 and older.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/prostate-cancer-screenings',
  },
  {
    id: 'lung-cancer-screening',
    label: 'Lung cancer screening (low-dose CT scan)',
    aliases: ['lung cancer screening', 'ldct', 'low dose ct', 'lung ct scan', 'lung cancer ct', 'chest ct cancer screening'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Low-dose CT (LDCT) lung cancer screening covered at $0 once per year for adults age 50–77 who are current or recent smokers (quit within the past 15 years) with a 20 pack-year smoking history, who get a written order from a doctor, and have not had symptoms of lung cancer.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/lung-cancer-screenings',
  },
  {
    id: 'bone-density',
    label: 'Bone density test (osteoporosis / DEXA scan)',
    aliases: ['bone density', 'dexa scan', 'bone density test', 'osteoporosis test', 'osteoporosis screening', 'dexa', 'bone scan'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Bone density measurements covered at $0 every 24 months (more frequently if medically necessary) for individuals at risk for osteoporosis, including women age 65+ and men age 70+.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/bone-density',
  },
  {
    id: 'cardiovascular-screening',
    label: 'Cardiovascular disease screening (cholesterol, blood tests)',
    aliases: ['cardiovascular screening', 'cholesterol test', 'lipid panel', 'heart screening', 'blood cholesterol', 'cardiovascular blood test', 'lipid screening'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Blood tests for cholesterol, lipid, and triglyceride levels covered at $0 every 5 years.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/cardiovascular-disease-screenings',
  },
  {
    id: 'diabetes-screening',
    label: 'Diabetes screening (blood glucose tests)',
    aliases: ['diabetes screening', 'blood sugar test', 'glucose test', 'a1c test', 'diabetes test', 'blood glucose', 'prediabetes screening'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Covered at $0 — up to two screenings per year — for individuals with risk factors including high blood pressure, abnormal cholesterol, obesity, or a history of high blood sugar.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/diabetes-screenings',
  },
  {
    id: 'glaucoma-screening',
    label: 'Glaucoma screening',
    aliases: ['glaucoma test', 'glaucoma screening', 'eye pressure test', 'glaucoma exam'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Glaucoma tests covered at $0 once every 12 months for high-risk individuals, including those with diabetes, a family history of glaucoma, African Americans age 50+, and Hispanic Americans age 65+.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/glaucoma-tests',
  },
  {
    id: 'depression-screening',
    label: 'Depression screening',
    aliases: ['depression screening', 'mental health screening', 'depression test', 'phq-9', 'mood screening'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Annual depression screening covered at $0 in a primary care setting when the practice has staff to support care and follow-up.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/depression-screenings',
  },
  {
    id: 'alcohol-counseling',
    label: 'Alcohol misuse screening and counseling',
    aliases: ['alcohol counseling', 'alcohol screening', 'alcohol misuse', 'drinking counseling', 'alcohol abuse screening'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Annual alcohol misuse screening and up to 4 brief face-to-face counseling sessions per year covered at $0 in a primary care setting.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/alcohol-misuse-counseling',
  },
  {
    id: 'tobacco-cessation',
    label: 'Tobacco cessation counseling',
    aliases: ['smoking cessation', 'quit smoking', 'tobacco counseling', 'tobacco cessation', 'stop smoking counseling'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Up to 8 face-to-face counseling sessions per year covered at $0 for tobacco users.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/tobacco-use-cessation-counseling',
  },
  {
    id: 'hiv-screening',
    label: 'HIV screening',
    aliases: ['hiv test', 'hiv screening', 'aids test', 'hiv blood test'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Covered at $0 once per year for individuals at increased risk and all pregnant individuals.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/hiv-screening',
  },
  {
    id: 'obesity-counseling',
    label: 'Obesity screening and counseling',
    aliases: ['obesity counseling', 'weight loss counseling', 'bmi counseling', 'obesity screening', 'weight management'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'preventive',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Covered at $0 — up to 22 sessions in the first 12 months, then up to 12 sessions per year — for individuals with a BMI of 30 or more. Must occur in a primary care setting.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/obesity-screenings-and-counseling',
  },
  {
    id: 'diabetes-self-management',
    label: 'Diabetes self-management training (DSMT)',
    aliases: ['diabetes training', 'dsmt', 'diabetes management', 'diabetes education', 'diabetes self management', 'blood sugar management'],
    category: 'Preventive & Screening Services',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Diabetes Self-Management Training (DSMT) is covered for people with diabetes. Unlike pure preventive screenings, DSMT is subject to the standard 20% coinsurance after the deductible — it is a treatment service, not a screening. Up to 10 hours of initial training and 2 hours of follow-up per year may be covered.',
    exampleCharge: 300,
    officialSource: 'https://www.medicare.gov/coverage/diabetes-self-management-training',
  },

  // ── Outpatient Procedures & Surgery ──────────────────────────────────────
  {
    id: 'outpatient-surgery',
    label: 'Outpatient surgery (hospital outpatient department)',
    aliases: ['outpatient surgery', 'surgery', 'outpatient procedure', 'hospital surgery', 'day surgery', 'same day surgery', 'surgical procedure'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Outpatient surgeries performed in a hospital outpatient department are covered under Part B. You pay 20% coinsurance after the $283 deductible — with no annual cap on that 20%.',
    exampleCharge: 8000,
    officialSource: 'https://www.medicare.gov/coverage/outpatient-hospital-services',
    internalLink: [
      { href: '/tools/original-medicare-medigap-part-d-cost-estimator/', text: 'Estimate your annual Part B exposure with and without Medigap →' },
      { href: '/tools/medigap-comparison-tool/', text: 'Compare Medigap plans that cover this 20% →' },
    ],
  },
  {
    id: 'ambulatory-surgical-center',
    label: 'Ambulatory surgical center (ASC)',
    aliases: ['asc', 'ambulatory surgical center', 'surgery center', 'outpatient surgical center'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Surgery performed at a Medicare-certified ambulatory surgical center (ASC) is covered under Part B, typically at a lower cost than hospital outpatient surgery.',
    exampleCharge: 4500,
    officialSource: 'https://www.medicare.gov/coverage/ambulatory-surgical-centers',
    internalLink: [{ href: '/tools/medigap-comparison-tool/', text: 'Compare Medigap plans that cover this 20% →' }],
  },
  {
    id: 'chemotherapy',
    label: 'Chemotherapy (outpatient)',
    aliases: ['chemotherapy', 'chemo', 'cancer treatment', 'cancer infusion', 'oncology treatment', 'cancer drugs infusion'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Outpatient chemotherapy administered in a hospital outpatient department or doctor\'s office is covered under Part B. With no annual cap on the 20% coinsurance, a typical chemotherapy course can result in significant out-of-pocket costs without supplemental coverage.',
    exampleCharge: 10000,
    officialSource: 'https://www.medicare.gov/coverage/cancer-treatment',
    internalLink: [
      { href: '/tools/original-medicare-medigap-part-d-cost-estimator/', text: 'Estimate your total annual exposure →' },
      { href: '/tools/medigap-comparison-tool/', text: 'Medigap plans that cap your out-of-pocket →' },
    ],
  },
  {
    id: 'radiation-therapy',
    label: 'Radiation therapy',
    aliases: ['radiation therapy', 'radiation treatment', 'radiotherapy', 'cancer radiation', 'radiation oncology'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Outpatient radiation therapy for cancer is covered under Part B.',
    exampleCharge: 6500,
    officialSource: 'https://www.medicare.gov/coverage/cancer-treatment',
    internalLink: [{ href: '/tools/medigap-comparison-tool/', text: 'Medigap plans that cover the 20% coinsurance →' }],
  },
  {
    id: 'dialysis',
    label: 'Dialysis (kidney failure / ESRD)',
    aliases: ['dialysis', 'kidney dialysis', 'hemodialysis', 'peritoneal dialysis', 'esrd', 'kidney failure treatment'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Medicare covers dialysis for people with End-Stage Renal Disease (ESRD) at Medicare-certified outpatient dialysis facilities and at home when training and equipment requirements are met.',
    exampleCharge: 350,
    officialSource: 'https://www.medicare.gov/coverage/dialysis',
  },
  {
    id: 'lab-tests',
    label: 'Lab tests / blood work (diagnostic)',
    aliases: ['lab test', 'blood test', 'blood work', 'laboratory test', 'diagnostic test', 'lab work', 'cbc', 'metabolic panel', 'blood panel'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Diagnostic laboratory tests ordered by your doctor are covered under Part B. Clinical diagnostic laboratory tests (like blood tests for diagnosis) are often paid at 100% by Medicare — check with your lab, as Medicare assignment rules affect your cost.',
    exampleCharge: 150,
    officialSource: 'https://www.medicare.gov/coverage/lab-tests',
  },
  {
    id: 'imaging',
    label: 'Diagnostic imaging (X-ray, CT scan, MRI, ultrasound)',
    aliases: ['xray', 'x-ray', 'ct scan', 'mri', 'ultrasound', 'pet scan', 'imaging', 'diagnostic imaging', 'scan', 'radiology'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Diagnostic imaging ordered by your doctor — including X-rays, MRIs, CT scans, PET scans, and ultrasounds — is covered under Part B when medically necessary.',
    exampleCharge: 1200,
    officialSource: 'https://www.medicare.gov/coverage/x-rays',
  },
  {
    id: 'acupuncture',
    label: 'Acupuncture (chronic low back pain only)',
    aliases: ['acupuncture', 'acupuncture treatment', 'needles treatment', 'acupuncture back pain'],
    category: 'Outpatient Procedures & Surgery',
    covered: true, coverageType: 'conditional',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Medicare covers acupuncture ONLY for chronic low back pain — specifically, pain lasting 12 weeks or more that is not associated with surgery or a specific diagnosis. Coverage is limited to up to 12 visits within 90 days, extendable to 20 visits if you show improvement. No coverage for any other condition.',
    caveat: 'For any condition other than chronic low back pain, acupuncture is not covered by Medicare Part B.',
    exampleCharge: 90,
    officialSource: 'https://www.medicare.gov/coverage/acupuncture',
  },

  // ── Durable Medical Equipment (DME) ──────────────────────────────────────
  {
    id: 'wheelchair',
    label: 'Wheelchair (manual or power)',
    aliases: ['wheelchair', 'power wheelchair', 'manual wheelchair', 'motorized wheelchair', 'electric wheelchair', 'mobility wheelchair'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Manual and power wheelchairs are covered as Durable Medical Equipment (DME) when prescribed by your doctor as medically necessary and purchased from a Medicare-enrolled DME supplier.',
    exampleCharge: 2500,
    officialSource: 'https://www.medicare.gov/coverage/durable-medical-equipment-coverage',
  },
  {
    id: 'walker',
    label: 'Walker / rollator',
    aliases: ['walker', 'rollator', 'rolling walker', '4 wheel walker', 'mobility walker', 'standard walker'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Walkers and rollators are covered as DME when prescribed by your doctor as medically necessary.',
    exampleCharge: 150,
    officialSource: 'https://www.medicare.gov/coverage/durable-medical-equipment-coverage',
  },
  {
    id: 'hospital-bed',
    label: 'Hospital bed (home use)',
    aliases: ['hospital bed', 'home hospital bed', 'adjustable bed', 'medical bed home', 'electric bed'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'A hospital-grade bed for home use is covered as DME when prescribed by your doctor for a medical condition.',
    exampleCharge: 1400,
    officialSource: 'https://www.medicare.gov/coverage/durable-medical-equipment-coverage',
  },
  {
    id: 'oxygen-equipment',
    label: 'Oxygen equipment and supplies',
    aliases: ['oxygen', 'oxygen equipment', 'oxygen tank', 'supplemental oxygen', 'home oxygen', 'oxygen concentrator'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Home oxygen equipment and supplies are covered as DME when you have a chronic condition that requires supplemental oxygen and your doctor certifies the need.',
    exampleCharge: 200,
    officialSource: 'https://www.medicare.gov/coverage/oxygen-equipment-and-supplies',
  },
  {
    id: 'glucose-monitor',
    label: 'Blood glucose monitor and test strips',
    aliases: ['glucose monitor', 'blood glucose meter', 'glucose meter', 'blood sugar monitor', 'diabetic supplies', 'test strips', 'lancets'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Blood glucose monitors and test strips are covered as DME for people with diabetes. Coverage applies regardless of whether you use insulin.',
    exampleCharge: 65,
    officialSource: 'https://www.medicare.gov/coverage/blood-sugar-monitors',
  },
  {
    id: 'cpap',
    label: 'CPAP machine (sleep apnea)',
    aliases: ['cpap', 'cpap machine', 'sleep apnea machine', 'continuous positive airway', 'cpap supplies', 'sleep apnea treatment', 'bipap'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'CPAP machines and supplies are covered as DME when prescribed for obstructive sleep apnea after a Medicare-covered sleep study confirms the diagnosis. You typically rent the equipment for 13 months, after which you own it.',
    exampleCharge: 800,
    officialSource: 'https://www.medicare.gov/coverage/cpap-devices',
  },
  {
    id: 'crutches',
    label: 'Crutches',
    aliases: ['crutches', 'underarm crutch', 'forearm crutches', 'mobility crutches'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Crutches are covered as DME when prescribed by your doctor as medically necessary.',
    exampleCharge: 80,
    officialSource: 'https://www.medicare.gov/coverage/durable-medical-equipment-coverage',
  },
  {
    id: 'prosthetics',
    label: 'Prosthetics and orthotics',
    aliases: ['prosthetics', 'prosthetic limb', 'artificial limb', 'orthotics', 'brace', 'leg brace', 'arm prosthetic', 'orthotics brace'],
    category: 'Durable Medical Equipment (DME)',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Prosthetic devices that replace a body part or function, and orthotic devices that support weakened or deformed body members, are covered under Part B when prescribed by a doctor.',
    exampleCharge: 5000,
    officialSource: 'https://www.medicare.gov/coverage/prosthetic-devices',
  },

  // ── Mental Health & Behavioral Health ────────────────────────────────────
  {
    id: 'psychotherapy',
    label: 'Outpatient psychotherapy (individual or group)',
    aliases: ['therapy', 'psychotherapy', 'counseling', 'mental health therapy', 'talk therapy', 'group therapy', 'therapist', 'psychologist', 'social worker', 'counselor', 'mental health'],
    category: 'Mental Health & Behavioral Health',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Outpatient mental health services are covered under Part B at the same 20% coinsurance rate as physical health services (mental health parity law requires equal cost-sharing). Sessions with licensed clinical social workers, psychologists, and clinical nurse specialists are covered.',
    exampleCharge: 200,
    officialSource: 'https://www.medicare.gov/coverage/mental-health-care',
  },
  {
    id: 'psychiatrist-visit',
    label: 'Psychiatrist visit (outpatient)',
    aliases: ['psychiatrist', 'psychiatry', 'psychiatrist visit', 'mental health doctor', 'psychiatric evaluation', 'medication management'],
    category: 'Mental Health & Behavioral Health',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Psychiatrist visits for outpatient mental health care, including medication management and evaluation, are covered under Part B.',
    exampleCharge: 250,
    officialSource: 'https://www.medicare.gov/coverage/mental-health-care',
  },
  {
    id: 'partial-hospitalization',
    label: 'Partial hospitalization program (mental health)',
    aliases: ['partial hospitalization', 'php', 'intensive outpatient', 'iop', 'mental health program', 'day program mental health'],
    category: 'Mental Health & Behavioral Health',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Partial hospitalization programs (PHP) for mental health or substance use disorders are covered under Part B when a doctor certifies that inpatient care would otherwise be needed.',
    exampleCharge: 600,
    officialSource: 'https://www.medicare.gov/coverage/partial-hospitalization',
  },

  // ── Ambulance Services ────────────────────────────────────────────────────
  {
    id: 'ambulance-emergency',
    label: 'Ambulance transport (emergency)',
    aliases: ['ambulance', 'emergency ambulance', '911 ambulance', 'paramedic', 'emergency transport'],
    category: 'Ambulance Services',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Ground and air ambulance transport is covered under Part B in an emergency — when any other transport could endanger your health. You pay 20% after the deductible with no annual cap.',
    caveat: 'Ground ambulance must be from a Medicare-enrolled ambulance service. Air ambulance is covered only when ground transport is not appropriate due to the nature of the illness, injury, or terrain.',
    exampleCharge: 1200,
    officialSource: 'https://www.medicare.gov/coverage/ambulance-services',
    internalLink: [{ href: '/tools/original-medicare-medigap-part-d-cost-estimator/', text: 'See how Medigap covers ambulance coinsurance →' }],
  },
  {
    id: 'non-emergency-ambulance',
    label: 'Non-emergency ambulance (medically necessary)',
    aliases: ['non emergency ambulance', 'non-emergency transport', 'medical transport', 'ambulance transport non-emergency'],
    category: 'Ambulance Services',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Non-emergency ground ambulance is covered under Part B only when a doctor certifies that any other transport would be medically contraindicated and the transport is from a Medicare-enrolled service.',
    exampleCharge: 800,
    officialSource: 'https://www.medicare.gov/coverage/ambulance-services',
  },

  // ── Outpatient Hospital Services ─────────────────────────────────────────
  {
    id: 'outpatient-hospital-visit',
    label: 'Hospital outpatient visit / observation services',
    aliases: ['hospital visit', 'outpatient hospital', 'observation stay', 'hospital outpatient', 'hospital observation', 'outpatient clinic'],
    category: 'Outpatient Hospital Services',
    covered: true, coverageType: 'standard',
    deductibleApplies: true, coinsuranceRate: 0.20,
    notes: 'Hospital outpatient services and observation stays are covered under Part B. Note: If you are kept in the hospital under "observation status" rather than formally admitted, you are considered an outpatient — Part B applies, not Part A, and your cost-sharing may differ.',
    caveat: 'Observation status vs. inpatient admission matters significantly for costs. If you are under observation, you may owe more for hospital services and may not qualify for a Medicare-covered skilled nursing facility stay afterward. Always ask your care team whether you are formally admitted or under observation.',
    exampleCharge: 2500,
    officialSource: 'https://www.medicare.gov/coverage/outpatient-hospital-services',
  },

  // ── Home Health Services ──────────────────────────────────────────────────
  {
    id: 'home-health-skilled-nursing',
    label: 'Skilled nursing care at home (doctor-ordered, homebound)',
    aliases: ['home health', 'skilled nursing home', 'home nursing', 'nurse home visit', 'homebound care', 'home health aide', 'skilled care home', 'visiting nurse'],
    category: 'Home Health Services',
    covered: true, coverageType: 'standard',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Medicare covers 100% of approved home health services — with no deductible and no coinsurance — when a doctor orders part-time skilled nursing care or therapy and you are homebound. The agency must be Medicare-certified.',
    caveat: 'This covers SKILLED care only (wound dressing, injection teaching, physical or occupational therapy). Medicare does NOT cover custodial or long-term personal care (bathing, dressing, cooking) unless provided alongside skilled care. If your need is primarily custodial, coverage will not apply.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/home-health-services',
    internalLink: [{ href: '/tools/medicare-at-65-decision-checklist/', text: 'New to Medicare? Start with the Decision Checklist →' }],
  },
  {
    id: 'home-physical-therapy',
    label: 'Physical / occupational therapy at home (homebound)',
    aliases: ['home physical therapy', 'home pt', 'home occupational therapy', 'home ot', 'physical therapy home', 'at home therapy', 'homebound therapy'],
    category: 'Home Health Services',
    covered: true, coverageType: 'standard',
    deductibleApplies: false, coinsuranceRate: 0,
    notes: 'Home-based physical therapy, occupational therapy, or speech-language therapy is covered at $0 (no deductible, no coinsurance) when ordered by a doctor, provided through a Medicare-certified home health agency, and you are certified as homebound.',
    caveat: 'You must be homebound — meaning leaving home requires considerable effort due to illness or injury. Therapy received as an outpatient (you go to the therapist\'s office) is subject to the standard 20% coinsurance after the deductible.',
    exampleCharge: 0,
    officialSource: 'https://www.medicare.gov/coverage/home-health-services',
  },

  // ── Explicitly NOT Covered ────────────────────────────────────────────────
  {
    id: 'dental-routine',
    label: 'Routine dental care (cleanings, fillings, extractions, dentures)',
    aliases: ['dental', 'dentist', 'teeth cleaning', 'dental cleaning', 'fillings', 'dental filling', 'tooth extraction', 'dentures', 'dental crown', 'tooth crown', 'root canal', 'dental visit', 'oral health'],
    category: 'Not Covered by Part B',
    covered: false, coverageType: 'not_covered',
    deductibleApplies: false, coinsuranceRate: null,
    notes: 'Routine dental care — including cleanings, fillings, extractions, and dentures — is explicitly excluded from Medicare Part B coverage. The only dental exception under Part A is dental services that are an integral part of a covered hospital procedure (such as jaw reconstruction following a covered accident).',
    notCoveredAlternative: 'Alternatives: Some Medicare Advantage (Part C) plans include routine dental benefits. You can also purchase standalone dental insurance. Federally Qualified Health Centers (FQHCs) offer sliding-scale dental care regardless of insurance.',
    officialSource: 'https://www.medicare.gov/coverage/dental-services',
    internalLink: [{ href: '/medicare/does-medicare-cover-dental-vision-and-hearing/', text: 'Full guide: Does Medicare cover dental, vision, and hearing? →' }],
  },
  {
    id: 'vision-routine',
    label: 'Routine vision exam / prescription eyeglasses / contact lenses',
    aliases: ['vision exam', 'eye exam', 'glasses', 'eyeglasses', 'contact lenses', 'vision screening', 'routine eye exam', 'optometrist', 'reading glasses', 'bifocals', 'eye doctor', 'vision check'],
    category: 'Not Covered by Part B',
    covered: false, coverageType: 'not_covered',
    deductibleApplies: false, coinsuranceRate: null,
    notes: 'Routine eye exams for eyeglass or contact lens prescriptions are not covered by Part B. Eyeglasses and contact lenses are not covered, with one exception: one pair of standard frames is covered after cataract surgery with intraocular lens implant.',
    caveat: 'Exception — cataract surgery: Medicare Part B covers the cataract surgery itself and one pair of corrective lenses/frames after the procedure.',
    notCoveredAlternative: 'Alternatives: Many Medicare Advantage (Part C) plans include routine vision benefits and an eyeglass allowance. You can also purchase standalone vision insurance.',
    officialSource: 'https://www.medicare.gov/coverage/eye-exams',
    internalLink: [{ href: '/medicare/does-medicare-cover-dental-vision-and-hearing/', text: 'Full guide: Does Medicare cover dental, vision, and hearing? →' }],
  },
  {
    id: 'hearing-aids',
    label: 'Hearing aids and routine hearing exams',
    aliases: ['hearing aid', 'hearing aids', 'hearing test', 'hearing exam', 'audiologist', 'audiology', 'hearing loss', 'hard of hearing', 'deaf', 'hearing device'],
    category: 'Not Covered by Part B',
    covered: false, coverageType: 'not_covered',
    deductibleApplies: false, coinsuranceRate: null,
    notes: 'Hearing aids and the routine hearing exams to fit them are not covered by Medicare Part B. However, diagnostic hearing and balance exams ordered by your doctor to determine a medical diagnosis are covered.',
    caveat: 'Important distinction: A routine hearing exam to fit hearing aids = NOT covered. A diagnostic hearing test ordered by your doctor to investigate a medical concern = COVERED under Part B at 20% coinsurance.',
    notCoveredAlternative: 'Alternatives: Some Medicare Advantage (Part C) plans offer hearing aid allowances. Your State Health Insurance Assistance Program (SHIP) counselor can help identify MA plans in your area with hearing benefits. Call SHIP at 1-877-839-2675 or visit shiphelp.org.',
    officialSource: 'https://www.medicare.gov/coverage/hearing-services',
    internalLink: [{ href: '/medicare/does-medicare-cover-dental-vision-and-hearing/', text: 'Full guide: Does Medicare cover dental, vision, and hearing? →' }],
  },
  {
    id: 'prescription-drugs-home',
    label: 'Prescription drugs (taken at home)',
    aliases: ['prescription drugs', 'medications', 'prescriptions', 'pills', 'home medications', 'oral medications', 'pharmacy drugs', 'pharmacy'],
    category: 'Not Covered by Part B',
    covered: false, coverageType: 'not_covered',
    deductibleApplies: false, coinsuranceRate: null,
    notes: 'Most prescription drugs you take at home are not covered by Medicare Part B. They are covered instead by a separate Medicare Part D prescription drug plan.',
    caveat: 'Key exceptions covered under Part B: Drugs administered by a healthcare provider (infusions, injections in an office), certain oral cancer drugs, immunosuppressant drugs after a covered organ transplant, and some durable medical equipment-related drugs (like nebulizer medications).',
    notCoveredAlternative: 'For home prescription drug coverage: enroll in a Medicare Part D standalone plan or choose a Medicare Advantage plan that includes drug coverage.',
    officialSource: 'https://www.medicare.gov/drug-coverage-part-d',
    internalLink: [
      { href: '/tools/medicare-prescription-drug-cost-estimator/', text: 'Part D Prescription Cost Estimator →' },
      { href: '/tools/medicare-donut-hole-calculator/', text: 'Medicare Donut Hole Calculator →' },
    ],
  },
  {
    id: 'long-term-custodial-care',
    label: 'Long-term custodial care (nursing home, personal care)',
    aliases: ['nursing home', 'long term care', 'custodial care', 'assisted living', 'personal care', 'home aide', 'home care aide', 'bathing dressing assistance', 'long term nursing'],
    category: 'Not Covered by Part B',
    covered: false, coverageType: 'not_covered',
    deductibleApplies: false, coinsuranceRate: null,
    notes: 'Long-term custodial care — including help with daily activities (bathing, dressing, eating, toileting) in a nursing home or at home — is not covered by Medicare Part B or Part A. Medicare only covers skilled care in a skilled nursing facility for a limited time after a qualifying hospital stay.',
    notCoveredAlternative: 'Alternatives: Medicaid may cover long-term custodial care for those who meet income and asset eligibility rules. Long-term care insurance policies are private insurance products. Some Medicare Advantage plans offer limited personal care benefits.',
    officialSource: 'https://www.medicare.gov/coverage/long-term-care',
  },
  {
    id: 'cosmetic-surgery',
    label: 'Cosmetic surgery',
    aliases: ['cosmetic surgery', 'plastic surgery', 'facelift', 'tummy tuck', 'cosmetic procedure', 'elective cosmetic', 'breast augmentation'],
    category: 'Not Covered by Part B',
    covered: false, coverageType: 'not_covered',
    deductibleApplies: false, coinsuranceRate: null,
    notes: 'Cosmetic surgery is not covered by Medicare Part B unless it is required because of accidental injury or to improve the functioning of a malformed body part.',
    notCoveredAlternative: 'Reconstructive surgery following cancer treatment or an accident may be covered as medically necessary. Speak with your doctor about whether your procedure qualifies.',
    officialSource: 'https://www.medicare.gov/coverage/cosmetic-surgery',
  },
];

// Build search alias map for O(1) lookup
const buildSearchIndex = (services: ServiceEntry[]) => {
  return services.map(s => ({
    ...s,
    searchText: [s.label.toLowerCase(), ...s.aliases.map(a => a.toLowerCase())].join(' '),
  }));
};

const INDEXED_SERVICES = buildSearchIndex(SERVICES);

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDollars(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getCoverageLabel(service: ServiceEntry): { icon: string; text: string; color: string } {
  if (!service.covered) return { icon: '✗', text: 'Not Covered by Part B', color: '#8B1A1A' };
  if (service.coverageType === 'preventive') return { icon: '✓', text: 'Covered — $0 Cost-Sharing', color: '#1A5C2E' };
  if (service.coverageType === 'conditional') return { icon: '~', text: 'Conditionally Covered', color: '#7A4A00' };
  return { icon: '✓', text: 'Covered by Part B', color: '#1A5C2E' };
}

function calculateCost(service: ServiceEntry, deductibleStatus: DeductibleStatus): {
  deductibleNote: string;
  coinsuranceNote: string;
  exampleNote: string;
  totalExample: number | null;
} {
  if (!service.covered || service.coinsuranceRate === null) {
    return { deductibleNote: 'N/A', coinsuranceNote: 'N/A', exampleNote: 'N/A', totalExample: null };
  }
  if (service.coverageType === 'preventive') {
    return {
      deductibleNote: 'Deductible does not apply',
      coinsuranceNote: '$0 — no coinsurance for this preventive service',
      exampleNote: '$0 out-of-pocket (when Medicare\'s frequency and eligibility rules are met)',
      totalExample: 0,
    };
  }
  if (!service.deductibleApplies && service.coinsuranceRate === 0) {
    return {
      deductibleNote: 'Deductible does not apply',
      coinsuranceNote: '$0 — Medicare pays 100% of the approved amount for this service',
      exampleNote: '$0 out-of-pocket (when eligibility conditions are met)',
      totalExample: 0,
    };
  }

  const charge = service.exampleCharge;
  const rate = service.coinsuranceRate;
  const deductibleMet = deductibleStatus === 'met';
  const deductibleUnsure = deductibleStatus === 'unsure';

  if (deductibleMet) {
    const yourCost = charge * rate;
    return {
      deductibleNote: `You've met the $${PART_B_DEDUCTIBLE_2026} annual deductible — deductible does not apply to this service`,
      coinsuranceNote: `You pay 20% of the Medicare-approved amount (after deductible)`,
      exampleNote: `Example: If the Medicare-approved amount is ${formatDollars(charge)}, you pay ${formatDollars(yourCost)}`,
      totalExample: yourCost,
    };
  } else if (deductibleUnsure) {
    const costAfterDeductible = charge * rate;
    const costIncludingDeductible = Math.min(PART_B_DEDUCTIBLE_2026, charge) + Math.max(0, charge - PART_B_DEDUCTIBLE_2026) * rate;
    return {
      deductibleNote: `Part B annual deductible: $${PART_B_DEDUCTIBLE_2026}`,
      coinsuranceNote: `20% coinsurance applies after the deductible is met`,
      exampleNote: `Example with ${formatDollars(charge)} approved charge: If deductible already met → you pay ${formatDollars(costAfterDeductible)}. If deductible not yet met → you pay up to ${formatDollars(costIncludingDeductible)} (deductible portion + 20% of remainder).`,
      totalExample: costAfterDeductible,
    };
  } else {
    // Not met
    const deductiblePortion = Math.min(PART_B_DEDUCTIBLE_2026, charge);
    const remainder = Math.max(0, charge - PART_B_DEDUCTIBLE_2026);
    const coinsurancePortion = remainder * rate;
    const totalCost = deductiblePortion + coinsurancePortion;
    return {
      deductibleNote: `$${PART_B_DEDUCTIBLE_2026} annual deductible applies (you haven't met it yet)`,
      coinsuranceNote: `After the deductible, you pay 20% of the Medicare-approved amount`,
      exampleNote: `Example with ${formatDollars(charge)} approved charge: ${formatDollars(deductiblePortion)} deductible + ${formatDollars(coinsurancePortion)} coinsurance = ${formatDollars(totalCost)} total`,
      totalExample: totalCost,
    };
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

// Categories in the service database
const CATEGORIES: string[] = Array.from(new Set(SERVICES.map(s => s.category)));

// Popular quick-pick lookups for high-frequency senior questions
const QUICK_SERVICES = [
  { id: 'doctor-office-visit', label: "Doctor's Office Visit", icon: '🩺' },
  { id: 'flu-shot', label: 'Flu Shot ($0)', icon: '💉' },
  { id: 'colonoscopy', label: 'Colonoscopy Screening', icon: '🔬' },
  { id: 'wheelchair', label: 'Wheelchair / DME', icon: '🦽' },
  { id: 'psychotherapy', label: 'Psychotherapy', icon: '🧠' },
  { id: 'dental-routine', label: 'Routine Dental (Not Covered)', icon: '🦷' },
  { id: 'hearing-aids', label: 'Hearing Aids (Not Covered)', icon: '👂' },
];

export const MedicarePartBCoverageChecker: React.FC = () => {
  const uid = useId();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [deductibleStatus, setDeductibleStatus] = useState<DeductibleStatus>('unsure');
  const [irmaaTier, setIrmaaTier] = useState<number>(0); // index into IRMAA_TIERS_SINGLE

  const selectedService = useMemo(() => {
    return SERVICES.find(s => s.id === selectedServiceId) || null;
  }, [selectedServiceId]);

  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return CATEGORIES;
    }
    return [selectedCategory];
  }, [selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setSelectedCategory(newCat);
    if (newCat !== 'all' && selectedService && selectedService.category !== newCat) {
      setSelectedServiceId('');
    }
  };

  const costResult = selectedService
    ? calculateCost(selectedService, deductibleStatus)
    : null;

  const coverageLabel = selectedService ? getCoverageLabel(selectedService) : null;
  const totalMonthlyPremium = PART_B_BASE_PREMIUM_2026 + IRMAA_TIERS_SINGLE[irmaaTier].surcharge;

  const handleReset = () => {
    setSelectedServiceId('');
    setSelectedCategory('all');
    setDeductibleStatus('unsure');
    setIrmaaTier(0);
  };

  // ─── Styles ────────────────────────────────────────────────────────────────

  const s = {
    container: {
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #DDE3EA',
      padding: '32px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      fontFamily: 'inherit',
    } as React.CSSProperties,
    headerBar: {
      borderBottom: '1px solid #DDE3EA',
      paddingBottom: '1rem',
      marginBottom: '1.75rem',
    } as React.CSSProperties,
    h2: {
      fontSize: '24px', color: '#0D2137', margin: '0 0 0.5rem', fontWeight: 800,
    } as React.CSSProperties,
    subtitle: {
      fontSize: '18px', color: '#4B5A6E', margin: 0, lineHeight: 1.6,
    } as React.CSSProperties,
    label: {
      display: 'block', fontWeight: 700, fontSize: '18px', color: '#0D2137', marginBottom: '0.5rem',
    } as React.CSSProperties,
    fieldLabel: {
      display: 'block', fontSize: '14px', fontWeight: 600, color: '#4B5A6E', marginBottom: '0.4rem',
    } as React.CSSProperties,
    selectList: {
      width: '100%',
      minHeight: '52px',
      fontSize: '18px',
      padding: '0.75rem 1rem',
      border: '2px solid #DDE3EA',
      borderRadius: '8px',
      color: '#0D2137',
      background: '#fff',
      boxSizing: 'border-box' as const,
      fontWeight: 600,
      cursor: 'pointer',
      outline: 'none',
      transition: 'border-color 0.2s',
    } as React.CSSProperties,
    categorySelect: {
      width: '100%',
      minHeight: '52px',
      fontSize: '18px',
      padding: '0.75rem 1rem',
      border: '2px solid #DDE3EA',
      borderRadius: '8px',
      color: '#0D2137',
      background: '#F6F8FA',
      boxSizing: 'border-box' as const,
      cursor: 'pointer',
      outline: 'none',
    } as React.CSSProperties,
    chip: (active: boolean) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      minHeight: '44px',
      padding: '0.4rem 0.9rem',
      borderRadius: '2rem',
      fontSize: '15px',
      fontWeight: 600,
      border: `2px solid ${active ? '#0A3D3A' : '#DDE3EA'}`,
      background: active ? '#0A3D3A' : '#F6F8FA',
      color: active ? '#ffffff' : '#0D2137',
      cursor: 'pointer',
      userSelect: 'none' as const,
      transition: 'all 0.15s ease',
    } as React.CSSProperties),
    primaryBtn: {
      background: '#0A3D3A',
      color: '#ffffff',
      fontSize: '18px',
      fontWeight: 700,
      minHeight: '56px',
      minWidth: '200px',
      padding: '0.75rem 1.75rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '0.5rem',
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    radioGroup: {
      display: 'flex', flexWrap: 'wrap' as const, gap: '0.6rem', marginTop: '0.5rem',
    },
    radioLabel: {
      display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '48px', padding: '0.5rem 1.1rem',
      border: '2px solid #DDE3EA', borderRadius: '2rem', cursor: 'pointer', fontSize: '16px',
      color: '#0D2137', fontWeight: 600, userSelect: 'none' as const, background: '#ffffff',
    },
    radioLabelSelected: {
      borderColor: '#0A3D3A', background: '#0A3D3A', color: '#ffffff',
    },
    // Results area
    resultsContainer: {
      background: '#F6F8FA',
      borderLeft: '4px solid #0A3D3A',
      borderRadius: '0 8px 8px 0',
      padding: '28px',
      marginTop: '2rem',
    } as React.CSSProperties,
    primaryResultNum: {
      fontSize: '36px',
      fontWeight: 800,
      color: '#E8761A', // Alert Amber per spec
      lineHeight: 1.2,
      margin: '0 0 0.5rem',
    } as React.CSSProperties,
    interpretationText: {
      fontSize: '18px',
      fontWeight: 400,
      color: '#0D2137',
      lineHeight: 1.7,
      margin: '0 0 1rem',
    } as React.CSSProperties,
    actionBox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      fontSize: '18px',
      color: '#0D2137',
      lineHeight: 1.7,
      background: '#ffffff',
      border: '1px solid #DDE3EA',
      borderRadius: '8px',
      padding: '16px',
      margin: '1rem 0',
    } as React.CSSProperties,
    actionIcon: {
      color: '#1A7A4E', // Verification Green
      fontSize: '22px',
      fontWeight: 800,
      flexShrink: 0,
      marginTop: '2px',
    } as React.CSSProperties,
    attributionLine: {
      fontSize: '16px',
      color: '#4B5A6E',
      margin: '1.25rem 0 0.75rem',
      lineHeight: 1.7,
    } as React.CSSProperties,
    resetLink: {
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: '18px',
      fontWeight: 700,
      color: '#0A3D3A',
      textDecoration: 'underline',
      cursor: 'pointer',
      marginTop: '0.75rem',
      display: 'inline-block',
    } as React.CSSProperties,
    table: {
      width: '100%', borderCollapse: 'collapse' as const, margin: '1rem 0', fontSize: '18px',
    } as React.CSSProperties,
    th: {
      background: '#0A3D3A', color: '#ffffff', padding: '12px 16px', textAlign: 'left' as const,
      fontWeight: 700, fontSize: '16px',
    } as React.CSSProperties,
    td: {
      padding: '12px 16px', borderBottom: '1px solid #DDE3EA', color: '#0D2137', verticalAlign: 'top' as const, lineHeight: 1.7,
    } as React.CSSProperties,
    tdLabel: {
      padding: '12px 16px', borderBottom: '1px solid #DDE3EA', color: '#4B5A6E',
      fontWeight: 600, width: '45%', verticalAlign: 'top' as const, lineHeight: 1.7,
    } as React.CSSProperties,
    amberCallout: {
      background: '#FFF8F0', borderLeft: '4px solid #E8761A',
      borderRadius: '0 8px 8px 0', padding: '16px 20px', margin: '1rem 0', fontSize: '18px',
      color: '#0D2137', lineHeight: 1.7,
    } as React.CSSProperties,
    linkCallout: {
      background: '#ffffff', border: '1px solid #0A3D3A', borderRadius: '8px',
      padding: '16px', margin: '1rem 0', fontSize: '18px',
    } as React.CSSProperties,
    emptyState: {
      textAlign: 'center' as const, padding: '3rem 1.5rem', color: '#4B5A6E',
    },
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.headerBar}>
        <h2 style={s.h2}>Check Your Medicare Part B Coverage</h2>
        <p style={s.subtitle}>
          Select any medical service or item to check if Medicare Part B covers it and calculate your out-of-pocket costs.
        </p>
      </div>

      {/* ── Input 1: Select Service from List ─────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label htmlFor={`${uid}-service-select`} style={s.label}>
          Select a medical service, procedure, or item from the list
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label htmlFor={`${uid}-category-filter`} style={s.fieldLabel}>
              Filter by category (optional):
            </label>
            <select
              id={`${uid}-category-filter`}
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={s.categorySelect}
              aria-label="Filter services by category"
            >
              <option value="all">All Categories ({SERVICES.length} services)</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({SERVICES.filter(s => s.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '2 1 320px' }}>
            <label htmlFor={`${uid}-service-select`} style={s.fieldLabel}>
              Choose service:
            </label>
            <select
              id={`${uid}-service-select`}
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              style={s.selectList}
              aria-label="Select a medical service or item from the list"
            >
              <option value="">-- Click to choose a service from the list --</option>
              {displayedCategories.map(cat => {
                const catServices = SERVICES.filter(s => s.category === cat);
                if (selectedCategory !== 'all') {
                  return catServices.map(svc => (
                    <option key={svc.id} value={svc.id}>
                      {svc.label}
                    </option>
                  ));
                }
                return (
                  <optgroup key={cat} label={`── ${cat} (${catServices.length}) ──`}>
                    {catServices.map(svc => (
                      <option key={svc.id} value={svc.id}>
                        {svc.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick Pick Chips */}
        <div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#4B5A6E', display: 'block', marginBottom: '0.4rem' }}>
            Or quickly choose a common service:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {QUICK_SERVICES.map(qs => (
              <button
                key={qs.id}
                type="button"
                onClick={() => {
                  setSelectedServiceId(qs.id);
                  const svc = SERVICES.find(s => s.id === qs.id);
                  if (svc && selectedCategory !== 'all' && svc.category !== selectedCategory) {
                    setSelectedCategory('all');
                  }
                }}
                style={s.chip(selectedServiceId === qs.id)}
              >
                <span aria-hidden="true">{qs.icon}</span>
                <span>{qs.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Input 2: Deductible Status ─────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={s.label} id={`${uid}-deductible-legend`}>
          Have you met your $283 Part B deductible for 2026?
        </span>
        <div style={s.radioGroup} role="radiogroup" aria-labelledby={`${uid}-deductible-legend`}>
          {([
            ['met', 'Yes, already met'],
            ['not_met', "No, haven't met it yet"],
            ['unsure', 'Not sure'],
          ] as [DeductibleStatus, string][]).map(([value, label]) => (
            <label
              key={value}
              style={{ ...s.radioLabel, ...(deductibleStatus === value ? s.radioLabelSelected : {}) }}
            >
              <input
                type="radio"
                name={`${uid}-deductible`}
                value={value}
                checked={deductibleStatus === value}
                onChange={() => setDeductibleStatus(value)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Input 3: Income / IRMAA bracket ───────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label htmlFor={`${uid}-irmaa`} style={s.label}>
          Your 2024 income bracket (for monthly premium context)
        </label>
        <select
          id={`${uid}-irmaa`}
          value={irmaaTier}
          onChange={e => setIrmaaTier(Number(e.target.value))}
          style={s.categorySelect}
        >
          {IRMAA_TIERS_SINGLE.map((tier, i) => (
            <option key={i} value={i}>
              {tier.label} {tier.surcharge > 0 ? `(+$${tier.surcharge.toFixed(2)}/mo IRMAA)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* ── Output Panel ────────────────────────────────────────────────────── */}
      {!selectedService ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <p style={{ margin: 0, fontWeight: 700, color: '#0D2137', fontSize: '20px' }}>
            Choose a service from the list above
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '18px', color: '#4B5A6E', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Pick any medical visit, procedure, equipment, or service from the dropdown above to view its 2026 Medicare Part B coverage verdict and estimated out-of-pocket costs.
          </p>
        </div>
      ) : (
        <div style={s.resultsContainer}>
          {/* Primary Result Headline in Alert Amber 36pt bold */}
          <div style={s.primaryResultNum}>
            {!selectedService.covered
              ? 'Not Covered by Part B'
              : selectedService.coverageType === 'preventive'
                ? '$0.00 Out-of-Pocket'
                : costResult && costResult.totalExample !== null
                  ? `20% Coinsurance (est. $${costResult.totalExample.toFixed(0)})`
                  : 'Covered by Part B'}
          </div>

          {/* Plain English interpretation in Deep Authority Navy 18pt regular */}
          <p style={s.interpretationText}>
            <strong>{selectedService.label}:</strong>{' '}
            {!selectedService.covered
              ? 'Routine coverage is excluded under Medicare Part B. You would be responsible for 100% of the cost unless you have private coverage or a qualified Medicare Advantage plan.'
              : selectedService.coverageType === 'preventive'
                ? 'This is a covered preventive service. You pay $0 with no deductible and no coinsurance when received from a healthcare provider who accepts Medicare assignment.'
                : `Covered under Medicare Part B. Once you have satisfied the $283 annual deductible, Medicare pays 80% of the approved charge and you pay the remaining 20% coinsurance with no annual cap.`}
          </p>

          {/* Action step with Verification Green icon */}
          <div style={s.actionBox}>
            <span style={s.actionIcon} aria-hidden="true">✓</span>
            <div>
              <strong>Action step:</strong>{' '}
              {!selectedService.covered ? (
                <span>
                  Ask your provider if a medically necessary exception applies, or explore standalone supplemental coverage or a community health center (FQHC) offering sliding-scale fees.
                </span>
              ) : selectedService.coverageType === 'preventive' ? (
                <span>
                  Confirm when scheduling that this appointment is billed strictly as a preventive screening, and verify that your doctor accepts Medicare assignment.
                </span>
              ) : (
                <span>
                  Ask your doctor's billing office for the specific CPT procedure code and the Medicare-approved amount, so you can calculate your exact 20% share before treatment.
                </span>
              )}
            </div>
          </div>

          {/* Cost-Sharing Table */}
          {costResult && selectedService.covered && (
            <table style={s.table} role="table" aria-label="Part B Cost Sharing Breakdown">
              <thead>
                <tr>
                  <th style={s.th}>Coverage Element</th>
                  <th style={s.th}>Rule for This Service</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={s.tdLabel}>Part B Annual Deductible</td>
                  <td style={s.td}>{costResult.deductibleNote}</td>
                </tr>
                <tr style={{ background: '#ffffff' }}>
                  <td style={s.tdLabel}>Your Coinsurance</td>
                  <td style={s.td}>{costResult.coinsuranceNote}</td>
                </tr>
                <tr>
                  <td style={s.tdLabel}>Illustrative Example</td>
                  <td style={s.td}>{costResult.exampleNote}</td>
                </tr>
                <tr style={{ background: '#ffffff' }}>
                  <td style={s.tdLabel}>Annual Out-of-Pocket Cap</td>
                  <td style={{ ...s.td, fontWeight: 700, color: selectedService.coverageType === 'preventive' ? '#1A7A4E' : '#E8761A' }}>
                    {selectedService.coverageType === 'preventive'
                      ? 'N/A — $0 cost-sharing'
                      : 'None — Original Medicare Part B has NO annual limit on your 20% coinsurance'}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Nuance / Caveat Box in Alert Amber */}
          {selectedService.caveat && (
            <div style={s.amberCallout}>
              <strong>⚠️ Important nuance to know:</strong> {selectedService.caveat}
            </div>
          )}

          {/* Monthly Premium Context */}
          <div style={{ fontSize: '18px', color: '#4B5A6E', margin: '0.75rem 0', lineHeight: 1.7 }}>
            <strong>Your 2026 monthly Part B premium context:</strong> ${totalMonthlyPremium.toFixed(2)}/mo
            {IRMAA_TIERS_SINGLE[irmaaTier].surcharge > 0 && ` (includes $${IRMAA_TIERS_SINGLE[irmaaTier].surcharge.toFixed(2)} IRMAA surcharge)`}.
          </div>

          {/* Coverage Details */}
          <p style={{ fontSize: '18px', color: '#0D2137', lineHeight: 1.7, margin: '1rem 0' }}>
            <strong>Official coverage rule:</strong> {selectedService.notes}
          </p>

          {/* Related Tools */}
          {selectedService.internalLink && selectedService.internalLink.length > 0 && (
            <div style={s.linkCallout}>
              <strong style={{ color: '#0A3D3A', display: 'block', marginBottom: '0.5rem', fontSize: '18px' }}>Related Resources on Seniors Audit:</strong>
              {selectedService.internalLink.map((link, i) => (
                <div key={i} style={{ marginBottom: '0.35rem' }}>
                  <a href={link.href} style={{ color: '#0A3D3A', textDecoration: 'underline', fontSize: '18px', fontWeight: 600 }}>{link.text}</a>
                </div>
              ))}
            </div>
          )}

          {/* Official Attribution Line */}
          <p style={s.attributionLine}>
            These results are calculated using the official formula published by CMS (Centers for Medicare &amp; Medicaid Services). Verify your result directly at{' '}
            <a href={selectedService.officialSource} target="_blank" rel="noopener noreferrer" style={{ color: '#0A3D3A', textDecoration: 'underline' }}>
              medicare.gov/coverage
            </a>.
          </p>

          {/* Reset Link */}
          <button type="button" onClick={handleReset} style={s.resetLink}>
            Start over with new information
          </button>
        </div>
      )}
    </div>
  );
};
