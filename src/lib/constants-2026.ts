/**
 * Tax Year 2026 Shared Constants Module
 * Version: 2026-10-18
 * Sources: IRS Rev. Proc. 2025-32, IRS Pub. 6142, IRC § 86, CMS, SSA
 */

import constantsData from './constants-2026.json' with { type: 'json' };

export interface ConstantField<T> {
  value?: T;
  source: string;
  status: string;
}

export interface StandardDeductionConstants {
  single: number;
  mfs: number;
  mfj: number;
  qss: number;
  hoh: number;
  source: string;
  status: string;
}

export interface AdditionalAgedBlindConstants {
  unmarried: number;
  married: number;
  source: string;
  status: string;
}

export interface SeniorDeductionConstants {
  amountPerPerson: number;
  firstYear: number;
  lastYear: number;
  phaseOutRate: number;
  phaseOutStartSingle: number;
  phaseOutStartJoint: number;
  fullyPhasedOutSingle: number;
  fullyPhasedOutJoint: number;
  mfsEligible: boolean;
  needsSSN: boolean;
  marriedMustFileJointly: boolean;
  source: string;
  status: string;
}

export interface BracketsConstants {
  single: [number, number][];
  mfj: [number, number][];
  note: string;
  source: string;
  status: string;
}

export interface SocialSecurityTaxThresholds {
  singleBase1: number;
  singleBase2: number;
  mfjBase1: number;
  mfjBase2: number;
  mfsLivedWithSpouseBase: number;
  maxTaxablePct: number;
  indexed: boolean;
  source: string;
  status: string;
}

export interface Medicare2026Constants {
  partBStandardPremium: number;
  partBDeductible: number;
  lepRate: number;
  irmaaTiersSingleMAGI2024: number[];
  irmaaTiersJointMAGI2024: number[];
  totalPartBByTier: number[];
  partBSurchargeByTier: number[];
  partDSurchargeByTier: number[] | null;
  partDStatus: string;
  source: string;
  status: string;
}

export interface SocialSecurityConstants {
  cola2026: number;
  cola2027: number;
  cola2027Announced: string;
  taxableMax2026: number;
  taxableMax2027: number;
  earningsTest2026: {
    underFRA: number;
    yearOfFRA: number;
  };
  earningsTest2027: {
    underFRA: number;
    yearOfFRA: number;
  };
  source: string;
  status: string;
}

export interface Projections2027Constants {
  partBPremiumTrusteesEstimate: number;
  label: string;
}

export interface Constants2026 {
  version: string;
  standardDeduction: StandardDeductionConstants;
  additionalAgedBlind: AdditionalAgedBlindConstants;
  seniorDeduction: SeniorDeductionConstants;
  brackets: BracketsConstants;
  qcdLimit: number;
  qcdSplitInterestOneTime: number;
  qcdSource: string;
  qcdStatus: string;
  socialSecurityTaxThresholds: SocialSecurityTaxThresholds;
  medicare2026: Medicare2026Constants;
  socialSecurity: SocialSecurityConstants;
  medicareOpenEnrollment: {
    start: string;
    end: string;
  };
  rmdStartAge: {
    born1951to1959: number;
    born1960plus: number;
  };
  statesTaxingSocialSecurity2026: string[];
  statesNoIncomeTax: string[];
  projections2027: Projections2027Constants;
}


export interface HhsPoverty2026Constants {
  fortyEightStates: { first: number; additional: number };
  alaska: { first: number; additional: number };
  hawaii: { first: number; additional: number };
  generalIncomeDisregardMonthly: number;
  source: string;
  status: string;
}

export interface Lis2026Constants {
  incomePctFpl: number;
  resourcesSingle: number;
  resourcesCouple: number;
  resourcesSingleWithBurial: number;
  resourcesCoupleWithBurial: number;
  burialAllowancePerPerson: number;
  copayGenericUpTo100PctFpl: number;
  copayBrandUpTo100PctFpl: number;
  copayGeneric: number;
  copayBrand: number;
  partDOutOfPocketThreshold: number;
  source: string;
  status: string;
}

export interface Msp2026Constants {
  qmbPctFpl: number;
  slmbPctFpl: number;
  qiPctFpl: number;
  resourcesSingle: number;
  resourcesCouple: number;
  officialMonthlyLimits: { qmb: [number, number]; slmb: [number, number]; qi: [number, number] };
  source: string;
  status: string;
}

export interface SnapFY2027Constants {
  effective: string;
  expires: string;
  netMonthlyLimit: Record<string, number>;
  grossMonthlyLimit130: Record<string, number>;
  standardDeduction: { '1to3': number; '4': number; '5': number; '6plus': number };
  maxAllotment: Record<string, number>;
  maxAllotmentEachAdditional: number;
  minimumAllotment: number;
  source: string;
  status: string;
}

export const CONSTANTS_2026: Constants2026 = Object.freeze(constantsData as unknown as Constants2026);

export default CONSTANTS_2026;
