/**
 * irsRmdTables.ts
 * Official IRS Life Expectancy Tables & SECURE 2.0 Calculation Engine
 * 
 * Statutory & Regulatory Authorities:
 * - 26 U.S. Code § 401(a)(9) (Required Minimum Distributions)
 * - 26 CFR § 1.401(a)(9)-9 (Life Expectancy and Distribution Period Tables, Treasury Decision 9968)
 * - IRS Publication 590-B (Distributions from Individual Retirement Arrangements)
 * - SECURE 2.0 Act of 2022 (Division T of Consolidated Appropriations Act, 2023, P.L. 117-328):
 *     * Section 107: Increase in starting age for RMDs (Age 73 for born 1951-1959, Age 75 for born 1960+)
 *     * Section 302: Reduction in excise tax for missed RMDs (25% standard, 10% timely corrected)
 *     * Section 325: Exemption of designated Roth 401(k)/403(b) accounts from lifetime RMDs (effective 2024+)
 * - 26 U.S. Code § 4974 (Excise tax on certain accumulations in qualified retirement plans)
 */

import { JOINT_LIFE_MAP } from './irsJointLifeTable.ts';

/**
 * Official IRS Uniform Lifetime Table (Table III)
 * Source: 26 CFR § 1.401(a)(9)-9(c) (effective for distribution calendar years 2022 and later)
 * Used by:
 * 1. Unmarried account owners
 * 2. Married owners whose spouses are not more than 10 years younger
 * 3. Married owners whose spouses are not the sole primary beneficiary
 */
export const IRS_UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  // Ages 70-71 are not in the official 26 CFR 1.401(a)(9)-9 table (which starts at 72); kept only as fallback values.
  70: 29.1, 71: 28.2, 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7,
  77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7,
  84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2,
  91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5,  95: 8.9,  96: 8.4,  97: 7.8,
  98: 7.3,  99: 6.8,  100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9,
  105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4,
  112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5,
  119: 2.3, 120: 2.0,
};

/**
 * Returns the exact Table III Uniform Lifetime factor for a given age.
 * For ages over 120, federal regulations provide a factor of 2.0.
 */
export function getUniformLifetimeFactor(age: number): number {
  if (age < 70) {
    return 29.1;
  }
  if (age >= 120) {
    return 2.0;
  }
  return IRS_UNIFORM_LIFETIME_TABLE[age] || 2.0;
}

/**
 * Official IRS Joint Life and Last Survivor Expectancy Table (Table II) lookup.
 * Source: 26 CFR § 1.401(a)(9)-9(d) & IRS Publication 590-B Table II
 * 
 * Rules:
 * - Applicable ONLY if the spouse is the SOLE primary beneficiary AND is MORE THAN 10 YEARS younger.
 * - If spouse is not more than 10 years younger, the Uniform Lifetime Table (Table III) MUST be used.
 * - Table II factors are exact official numbers directly from federal regulations (zero linear approximations).
 */
export function getOfficialJointLifeFactor(ownerAge: number, spouseAge: number): number {
  const ageDiff = ownerAge - spouseAge;
  if (ageDiff <= 10) {
    return getUniformLifetimeFactor(ownerAge);
  }

  const key = `${ownerAge}-${spouseAge}`;
  if (JOINT_LIFE_MAP[key] !== undefined) {
    return JOINT_LIFE_MAP[key];
  }

  const clampedOwner = Math.min(Math.max(ownerAge, 70), 110);
  const clampedSpouse = Math.min(Math.max(spouseAge, 20), clampedOwner - 11);
  const fallbackKey = `${clampedOwner}-${clampedSpouse}`;
  if (JOINT_LIFE_MAP[fallbackKey] !== undefined) {
    return JOINT_LIFE_MAP[fallbackKey];
  }

  return getUniformLifetimeFactor(ownerAge);
}

/**
 * SECURE 2.0 RMD Starting Age Rules (P.L. 117-328, Division T, Section 107)
 */
export interface Secure2RmdDetails {
  rmdAge: number;
  firstRmdYear: number;
  requiredBeginningDate: string; // April 1 of year following firstRmdYear
  statutoryAuthority: string;
  isGrandfathered: boolean;
}

export function getSecure2RmdDetails(birthYear: number): Secure2RmdDetails {
  if (birthYear >= 1960) {
    const firstRmdYear = birthYear + 75;
    return {
      rmdAge: 75,
      firstRmdYear,
      requiredBeginningDate: `April 1, ${firstRmdYear + 1}`,
      statutoryAuthority: 'SECURE 2.0 Act § 107 (26 U.S.C. § 401(a)(9)(C)(i)(I))',
      isGrandfathered: false,
    };
  }

  if (birthYear >= 1951 && birthYear <= 1959) {
    const firstRmdYear = birthYear + 73;
    return {
      rmdAge: 73,
      firstRmdYear,
      requiredBeginningDate: `April 1, ${firstRmdYear + 1}`,
      statutoryAuthority: 'SECURE 2.0 Act § 107 (26 U.S.C. § 401(a)(9)(C)(i)(I))',
      isGrandfathered: false,
    };
  }

  const rmdAge = birthYear === 1950 || birthYear === 1949 ? 72 : 70.5;
  const firstRmdYear = Math.floor(birthYear + rmdAge);
  return {
    rmdAge,
    firstRmdYear,
    requiredBeginningDate: `April 1, ${firstRmdYear + 1}`,
    statutoryAuthority: 'SECURE Act of 2019 / Prior Federal Statute',
    isGrandfathered: true,
  };
}

/**
 * Checks whether an RMD is required in a given tax year.
 */
export function isRmdRequired(birthYear: number, taxYear: number): boolean {
  const details = getSecure2RmdDetails(birthYear);
  return taxYear >= details.firstRmdYear;
}

/**
 * Calculates official IRS penalty under 26 U.S.C. § 4974 (Excise tax on missed RMD).
 */
export interface RmdPenaltyDetails {
  standardPenalty: number;     // 25%
  correctedPenalty: number;    // 10%
  potentialSavings: number;    // 15% saved by correcting
  statutoryRateStandard: number; // 25
  statutoryRateCorrected: number; // 10
  formNumber: string;          // IRS Form 5329
  waiverRule: string;          // IRC § 4974(d)
}

export function calculateMissedRmdPenalty(rmdAmount: number): RmdPenaltyDetails {
  const standardPenalty = Math.round(rmdAmount * 0.25 * 100) / 100;
  const correctedPenalty = Math.round(rmdAmount * 0.10 * 100) / 100;
  return {
    standardPenalty,
    correctedPenalty,
    potentialSavings: Math.round((standardPenalty - correctedPenalty) * 100) / 100,
    statutoryRateStandard: 25,
    statutoryRateCorrected: 10,
    formNumber: 'IRS Form 5329',
    waiverRule: '26 U.S. Code § 4974(d) (Reasonable Cause Waiver)',
  };
}

/**
 * Calculates RMD and deadline details
 */
export interface RmdCalculationParams {
  balance: number;                   // Dec 31 prior-year balance
  birthYear: number;                 // Owner birth year
  taxYear: number;                   // Current distribution year (e.g. 2026)
  hasYoungerSpouseSoleBeneficiary?: boolean | undefined;
  spouseBirthYear?: number | undefined;
  isRothAccount?: boolean | undefined;           // Roth IRA or Roth 401(k)
}

export interface RmdCalculationResult {
  rmdAmount: number;
  monthlyEquivalent: number;
  percentageOfBalance: number;
  divisor: number;
  ownerAgeInTaxYear: number;
  spouseAgeInTaxYear?: number | undefined;
  tableUsed: 'Table III (Uniform Lifetime)' | 'Table II (Joint Life & Survivor)' | 'Exempt (Roth Account)';
  isRmdRequired: boolean;
  rmdStartingAge: number;
  firstRmdYear: number;
  isFirstYearRmd: boolean;
  deadlineDate: string;
  deadlineExplanation: string;
  penalty: RmdPenaltyDetails;
  isRothExempt: boolean;
}

export function calculateOfficialRmd(params: RmdCalculationParams): RmdCalculationResult {
  const {
    balance,
    birthYear,
    taxYear,
    hasYoungerSpouseSoleBeneficiary = false,
    spouseBirthYear,
    isRothAccount = false,
  } = params;

  if (isRothAccount) {
    const secureDetails = getSecure2RmdDetails(birthYear);
    return {
      rmdAmount: 0,
      monthlyEquivalent: 0,
      percentageOfBalance: 0,
      divisor: 0,
      ownerAgeInTaxYear: taxYear - birthYear,
      tableUsed: 'Exempt (Roth Account)',
      isRmdRequired: false,
      rmdStartingAge: secureDetails.rmdAge,
      firstRmdYear: secureDetails.firstRmdYear,
      isFirstYearRmd: false,
      deadlineDate: 'N/A',
      deadlineExplanation: 'Under IRC § 408A(c)(5) and SECURE 2.0 § 325, Roth IRAs and designated Roth 401(k)/403(b) accounts have no required minimum distributions during the owner\'s lifetime.',
      penalty: calculateMissedRmdPenalty(0),
      isRothExempt: true,
    };
  }

  const secureDetails = getSecure2RmdDetails(birthYear);
  const ownerAgeInTaxYear = taxYear - birthYear;
  const isRequired = taxYear >= secureDetails.firstRmdYear;

  let divisor = getUniformLifetimeFactor(ownerAgeInTaxYear);
  let tableUsed: 'Table III (Uniform Lifetime)' | 'Table II (Joint Life & Survivor)' = 'Table III (Uniform Lifetime)';
  let spouseAgeInTaxYear: number | undefined = undefined;

  if (hasYoungerSpouseSoleBeneficiary && spouseBirthYear) {
    spouseAgeInTaxYear = taxYear - spouseBirthYear;
    const ageDiff = ownerAgeInTaxYear - spouseAgeInTaxYear;
    if (ageDiff > 10) {
      divisor = getOfficialJointLifeFactor(ownerAgeInTaxYear, spouseAgeInTaxYear);
      tableUsed = 'Table II (Joint Life & Survivor)';
    }
  }

  const rmdAmount = isRequired && divisor > 0 ? balance / divisor : 0;
  const monthlyEquivalent = rmdAmount / 12;
  const percentageOfBalance = balance > 0 ? (rmdAmount / balance) * 100 : 0;

  const isFirstYearRmd = taxYear === secureDetails.firstRmdYear;
  const deadlineDate = isFirstYearRmd
    ? `April 1, ${taxYear + 1}`
    : `December 31, ${taxYear}`;

  const deadlineExplanation = isFirstYearRmd
    ? `For your very first RMD only, the IRS allows a grace period until April 1, ${taxYear + 1}. However, delaying to April 1 means taking TWO distributions in ${taxYear + 1}, which may increase your tax bracket.`
    : `Subsequent annual RMDs must be fully withdrawn by December 31, ${taxYear}.`;

  return {
    rmdAmount: Math.round(rmdAmount * 100) / 100,
    monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
    percentageOfBalance: Math.round(percentageOfBalance * 100) / 100,
    divisor,
    ownerAgeInTaxYear,
    spouseAgeInTaxYear,
    tableUsed,
    isRmdRequired: isRequired,
    rmdStartingAge: secureDetails.rmdAge,
    firstRmdYear: secureDetails.firstRmdYear,
    isFirstYearRmd,
    deadlineDate,
    deadlineExplanation,
    penalty: calculateMissedRmdPenalty(rmdAmount),
    isRothExempt: false,
  };
}
