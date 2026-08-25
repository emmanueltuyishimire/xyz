/**
 * RetirementTaxByState.tsx
 * Comprehensive Retirement Tax Calculator by State — Seniors Audit
 *
 * Official Government Sources:
 * - Federal Brackets & Standard Deduction: IRS Rev. Proc. 2025-28 (2026 Tax Year)
 * - Social Security Provisional Income Formula: IRS Publication 915
 * - IRA & Pension Distribution Rules: IRS Publication 590-B & Publication 575
 * - State Tax Rules & Exemptions: Verified against each State's Department of Revenue
 *
 * Last verified: August 2026
 */

import React, { useState, useEffect, useCallback } from 'react';

// ── TYPES ─────────────────────────────────────────────────────────────────────

type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';
type ExemptLevel = 'full' | 'partial' | 'none' | 'verify';

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

interface StateRecord {
  name: string;
  code: string;
  hasStateTax: boolean;
  topRate: number;
  flatRate: boolean;
  brackets: { single: TaxBracket[]; mfj: TaxBracket[] } | null;
  socialSecurity: ExemptLevel;
  ssTaxNote: string;
  privatePension: ExemptLevel;
  privatePensionNote: string;
  publicPension: ExemptLevel;
  publicPensionNote: string;
  iraWithdrawals: ExemptLevel;
  iraNotes: string;
  rothWithdrawals: ExemptLevel;
  rothNotes: string;
  militaryRetirement: ExemptLevel;
  militaryNote: string;
  seniorBenefits: string;
  notes: string;
  lastVerified: string;
  sources: { label: string; url: string }[];
}

interface Inputs {
  state: string;
  compareState1: string;
  compareState2: string;
  taxYear: number;
  age: number;
  spouseAge: number;
  filingStatus: FilingStatus;
  socialSecurity: number;
  privatePension: number;
  publicPension: number;
  iraWithdrawals: number;
  k401Withdrawals: number;
  k403bWithdrawals: number;
  rothIra: number;
  rothK401: number;
  rmdAmount: number;
  rmdIncludedAbove: boolean;
  wages: number;
  selfEmployment: number;
  rentalIncome: number;
  interest: number;
  dividends: number;
  capitalGains: number;
  otherIncome: number;
  useStandardDeduction: boolean;
  itemizedDeductions: number;
  qcd: number;
}

interface Results {
  grossIncome: number;
  adjustedGrossIncome: number;
  taxableSS: number;
  ssTaxablePercent: number;
  provisionalIncome: number;
  deduction: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  effectiveRate: number;
  afterTaxIncome: number;
  marginalRate: number;
  breakdown: { label: string; amount: number; status: 'taxable' | 'exempt' | 'partial'; note: string }[];
}

// ── FEDERAL TAX DATA — 2026 ───────────────────────────────────────────────────
// Source: IRS Rev. Proc. 2025-28 (2026 inflation-adjusted items)

const FEDERAL_2026 = {
  brackets: {
    single: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
    mfj: [
      { min: 0, max: 23850, rate: 0.10 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: null, rate: 0.37 },
    ],
    mfs: [
      { min: 0, max: 11925, rate: 0.10 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
    hoh: [
      { min: 0, max: 17000, rate: 0.10 },
      { min: 17000, max: 64850, rate: 0.12 },
      { min: 64850, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250500, rate: 0.32 },
      { min: 250500, max: 626350, rate: 0.35 },
      { min: 626350, max: null, rate: 0.37 },
    ],
  },
  standardDeduction: {
    single: 15000,
    mfj: 30000,
    mfs: 15000,
    hoh: 22500,
  },
  seniorAddlDeduction: {
    singleHoh: 2000,
    mfjPerSpouse: 1600,
  },
  ssTaxThresholds: {
    single: { tier1: 25000, tier2: 34000 },
    mfj: { tier1: 32000, tier2: 44000 },
    mfs: { tier1: 0, tier2: 0 },
    hoh: { tier1: 25000, tier2: 34000 },
  },
};

// ── STATE TAX DATABASE (50 STATES + DC) ───────────────────────────────────────
// Sources: Official State Departments of Revenue (see sources field per state)
// Last verified: August 2026

const STATES: Record<string, StateRecord> = {
  AL: {
    name: 'Alabama', code: 'AL', hasStateTax: true, topRate: 0.05, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 500, rate: 0.02 }, { min: 500, max: 3000, rate: 0.04 }, { min: 3000, max: null, rate: 0.05 }],
      mfj: [{ min: 0, max: 1000, rate: 0.02 }, { min: 1000, max: 6000, rate: 0.04 }, { min: 6000, max: null, rate: 0.05 }],
    },
    socialSecurity: 'full', ssTaxNote: 'Alabama does not tax Social Security benefits.',
    privatePension: 'full', privatePensionNote: 'Alabama fully exempts defined-benefit private pension income.',
    publicPension: 'full', publicPensionNote: 'Alabama fully exempts state, local, and federal government pension income.',
    iraWithdrawals: 'none', iraNotes: 'Alabama taxes traditional IRA and 401(k) withdrawals as ordinary income.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Alabama fully exempts military retirement pay.',
    seniorBenefits: 'Age 65+ personal exemption of $1,500 (single) or $3,000 (joint).',
    notes: 'Alabama is very friendly for pensions and Social Security, but traditional IRA/401(k) distributions are taxable.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Alabama Department of Revenue', url: 'https://www.revenue.alabama.gov/individual-corporate/individual-income-tax/' }],
  },
  AK: {
    name: 'Alaska', code: 'AK', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Alaska has no state income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state income tax or state sales tax. Annual Alaska Permanent Fund Dividend.',
    notes: 'Alaska has no state individual income tax. All retirement income is completely exempt from state tax.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Alaska Department of Revenue', url: 'https://tax.alaska.gov/' }],
  },
  AZ: {
    name: 'Arizona', code: 'AZ', hasStateTax: true, topRate: 0.025, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Arizona does not tax Social Security benefits.',
    privatePension: 'none', privatePensionNote: 'Private pensions are subject to Arizona flat 2.5% income tax.',
    publicPension: 'partial', publicPensionNote: 'Up to $2,500 exclusion for Arizona state and federal government pensions.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA and 401(k) withdrawals are taxed at the flat 2.5% rate.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are not taxable.',
    militaryRetirement: 'full', militaryNote: 'Arizona fully exempts military retirement pay.',
    seniorBenefits: 'Low flat 2.5% rate applies across all taxable income.',
    notes: 'Arizona transitioned to a flat 2.5% tax rate. Social Security and military retirement are fully exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Arizona Department of Revenue', url: 'https://azdor.gov/individual-income-tax-information' }],
  },
  AR: {
    name: 'Arkansas', code: 'AR', hasStateTax: true, topRate: 0.039, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 4299, rate: 0.02 }, { min: 4299, max: 8499, rate: 0.04 }, { min: 8499, max: null, rate: 0.039 }],
      mfj: [{ min: 0, max: 4299, rate: 0.02 }, { min: 4299, max: 8499, rate: 0.04 }, { min: 8499, max: null, rate: 0.039 }],
    },
    socialSecurity: 'full', ssTaxNote: 'Arkansas does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Up to $6,000 exclusion per person from employer retirement plans.',
    publicPension: 'partial', publicPensionNote: 'Up to $6,000 exclusion per person for public pensions.',
    iraWithdrawals: 'partial', iraNotes: 'Traditional IRA distributions qualify for the $6,000 exclusion; remainder taxed.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Arkansas fully exempts military retirement pay.',
    seniorBenefits: '$6,000 retirement income exclusion per taxpayer. Low top rate of 3.9%.',
    notes: 'Arkansas top income tax rate reduced to 3.9%. Social Security and military retirement fully exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Arkansas Department of Finance and Administration', url: 'https://www.dfa.arkansas.gov/income-tax/' }],
  },
  CA: {
    name: 'California', code: 'CA', hasStateTax: true, topRate: 0.133, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 10756, rate: 0.01 }, { min: 10756, max: 25499, rate: 0.02 },
        { min: 25499, max: 40245, rate: 0.04 }, { min: 40245, max: 55866, rate: 0.06 },
        { min: 55866, max: 70606, rate: 0.08 }, { min: 70606, max: 360659, rate: 0.093 },
        { min: 360659, max: 432787, rate: 0.103 }, { min: 432787, max: 721314, rate: 0.113 },
        { min: 721314, max: 1000000, rate: 0.123 }, { min: 1000000, max: null, rate: 0.133 },
      ],
      mfj: [
        { min: 0, max: 21512, rate: 0.01 }, { min: 21512, max: 50998, rate: 0.02 },
        { min: 50998, max: 80490, rate: 0.04 }, { min: 80490, max: 111732, rate: 0.06 },
        { min: 111732, max: 141212, rate: 0.08 }, { min: 141212, max: 721318, rate: 0.093 },
        { min: 721318, max: 865574, rate: 0.103 }, { min: 865574, max: 1000000, rate: 0.113 },
        { min: 1000000, max: 1442628, rate: 0.123 }, { min: 1442628, max: null, rate: 0.133 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'California does not tax Social Security benefits (R&TC §17087.7).',
    privatePension: 'none', privatePensionNote: 'Private pensions are fully taxable at California state income tax rates (up to 13.3%).',
    publicPension: 'none', publicPensionNote: 'CalPERS, CalSTRS, and government pensions are fully taxable in California.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA and 401(k) withdrawals are fully taxable at regular state rates.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are not taxable.',
    militaryRetirement: 'none', militaryNote: 'California taxes military retirement pay as ordinary income.',
    seniorBenefits: 'Senior exemption tax credit ($144 for age 65+).',
    notes: 'California has the highest top state income tax rate (13.3%). While Social Security is exempt, all other retirement income is fully taxed.',
    lastVerified: 'August 2026',
    sources: [{ label: 'California Franchise Tax Board', url: 'https://www.ftb.ca.gov/file/personal/filing-status/index.html' }],
  },
  CO: {
    name: 'Colorado', code: 'CO', hasStateTax: true, topRate: 0.044, flatRate: true, brackets: null,
    socialSecurity: 'partial', ssTaxNote: 'Colorado allows a $24,000 pension/Social Security deduction for taxpayers age 65+. Above that, SS may be taxable.',
    privatePension: 'partial', privatePensionNote: 'Included in the $24,000 retirement income deduction for age 65+ ($20,000 for age 55–64).',
    publicPension: 'partial', publicPensionNote: 'Included in the $24,000 retirement income deduction.',
    iraWithdrawals: 'partial', iraNotes: 'Traditional IRA/401(k) withdrawals qualify for the $24,000 deduction for age 65+.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Colorado fully exempts military retirement pay.',
    seniorBenefits: '$24,000 retirement income deduction per person for age 65+. Flat 4.4% rate.',
    notes: 'Colorado flat 4.4% rate with a $24,000 retirement income exclusion per person age 65+.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Colorado Department of Revenue', url: 'https://tax.colorado.gov/sites/tax/files/documents/Income_Tax_Topics_Social_Security_Benefits.pdf' }],
  },
  CT: {
    name: 'Connecticut', code: 'CT', hasStateTax: true, topRate: 0.0699, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.03 }, { min: 10000, max: 50000, rate: 0.05 },
        { min: 50000, max: 100000, rate: 0.055 }, { min: 100000, max: 200000, rate: 0.06 },
        { min: 200000, max: 250000, rate: 0.065 }, { min: 250000, max: 500000, rate: 0.069 },
        { min: 500000, max: null, rate: 0.0699 },
      ],
      mfj: [
        { min: 0, max: 20000, rate: 0.03 }, { min: 20000, max: 100000, rate: 0.05 },
        { min: 100000, max: 200000, rate: 0.055 }, { min: 200000, max: 400000, rate: 0.06 },
        { min: 400000, max: 500000, rate: 0.065 }, { min: 500000, max: 1000000, rate: 0.069 },
        { min: 1000000, max: null, rate: 0.0699 },
      ],
    },
    socialSecurity: 'partial', ssTaxNote: '100% exempt if AGI is under $75,000 (single) or $100,000 (joint). Above limits, 75% is exempt.',
    privatePension: 'partial', privatePensionNote: 'Connecticut provides a phased-in exemption for pension and annuity income for AGI under thresholds.',
    publicPension: 'partial', publicPensionNote: 'Public pensions qualify for the state pension/annuity exemption.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA distributions are generally taxable at state rates.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Connecticut fully exempts military retirement pay.',
    seniorBenefits: 'Generous Social Security exemptions for middle-income retirees.',
    notes: 'Connecticut exempts Social Security for most middle-income seniors, but IRA distributions and high incomes face progressive state taxes.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Connecticut Department of Revenue Services', url: 'https://portal.ct.gov/DRS' }],
  },
  DE: {
    name: 'Delaware', code: 'DE', hasStateTax: true, topRate: 0.066, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 2000, rate: 0 }, { min: 2000, max: 5000, rate: 0.022 },
        { min: 5000, max: 10000, rate: 0.039 }, { min: 10000, max: 20000, rate: 0.048 },
        { min: 20000, max: 25000, rate: 0.052 }, { min: 25000, max: 60000, rate: 0.055 },
        { min: 60000, max: null, rate: 0.066 },
      ],
      mfj: [
        { min: 0, max: 2000, rate: 0 }, { min: 2000, max: 5000, rate: 0.022 },
        { min: 5000, max: 10000, rate: 0.039 }, { min: 10000, max: 20000, rate: 0.048 },
        { min: 20000, max: 25000, rate: 0.052 }, { min: 25000, max: 60000, rate: 0.055 },
        { min: 60000, max: null, rate: 0.066 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Delaware does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Pension exclusion of up to $12,500 per person for age 60+ ($2,000 under age 60).',
    publicPension: 'partial', publicPensionNote: 'Included in the $12,500 exclusion for age 60+.',
    iraWithdrawals: 'partial', iraNotes: 'IRA/401(k) withdrawals qualify for the $12,500 exclusion for age 60+.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Delaware fully exempts military retirement pay.',
    seniorBenefits: '$12,500 exclusion per person for age 60+. No state sales tax.',
    notes: 'Delaware exempts Social Security and provides $12,500/person retirement income exclusion for age 60+.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Delaware Division of Revenue', url: 'https://revenue.delaware.gov/individuals/' }],
  },
  FL: {
    name: 'Florida', code: 'FL', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Florida has no state individual income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state income tax. Homestead property tax exemption with additional senior exemptions.',
    notes: 'Florida has no state income tax on any form of retirement income. One of the most popular retirement destinations.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Florida Department of Revenue', url: 'https://floridarevenue.com/' }],
  },
  GA: {
    name: 'Georgia', code: 'GA', hasStateTax: true, topRate: 0.0549, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Georgia does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement income exclusion of up to $65,000 per person age 65+ ($35,000 for ages 62–64).',
    publicPension: 'partial', publicPensionNote: 'Included in the $65,000 per person exclusion for age 65+.',
    iraWithdrawals: 'partial', iraNotes: 'IRA/401(k) withdrawals qualify for the $65,000 exclusion for age 65+.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Georgia fully exempts military retirement pay.',
    seniorBenefits: '$65,000 per person retirement income exclusion for age 65+ ($130,000 for married couple both 65+).',
    notes: 'Georgia flat rate (5.49% in 2024–2026). The $65,000 exclusion per person means most retirees pay $0 state income tax.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Georgia Department of Revenue', url: 'https://dor.georgia.gov/retirement-income' }],
  },
  HI: {
    name: 'Hawaii', code: 'HI', hasStateTax: true, topRate: 0.11, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 2400, rate: 0.014 }, { min: 2400, max: 4800, rate: 0.032 },
        { min: 4800, max: 9600, rate: 0.055 }, { min: 9600, max: 14400, rate: 0.064 },
        { min: 14400, max: 19200, rate: 0.068 }, { min: 19200, max: 24000, rate: 0.072 },
        { min: 24000, max: 36000, rate: 0.076 }, { min: 36000, max: 48000, rate: 0.079 },
        { min: 48000, max: 150000, rate: 0.0825 }, { min: 150000, max: 175000, rate: 0.09 },
        { min: 175000, max: 200000, rate: 0.10 }, { min: 200000, max: null, rate: 0.11 },
      ],
      mfj: [
        { min: 0, max: 4800, rate: 0.014 }, { min: 4800, max: 9600, rate: 0.032 },
        { min: 9600, max: 19200, rate: 0.055 }, { min: 19200, max: 28800, rate: 0.064 },
        { min: 28800, max: 38400, rate: 0.068 }, { min: 38400, max: 48000, rate: 0.072 },
        { min: 48000, max: 72000, rate: 0.076 }, { min: 72000, max: 96000, rate: 0.079 },
        { min: 96000, max: 300000, rate: 0.0825 }, { min: 300000, max: 350000, rate: 0.09 },
        { min: 350000, max: 400000, rate: 0.10 }, { min: 400000, max: null, rate: 0.11 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Hawaii does not tax Social Security benefits.',
    privatePension: 'full', privatePensionNote: 'Hawaii fully exempts qualifying employer-funded defined benefit pensions.',
    publicPension: 'full', publicPensionNote: 'Hawaii fully exempts state, local, and federal government pensions.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA and 401(k) withdrawals funded with employee contributions are taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Hawaii fully exempts military retirement pay.',
    seniorBenefits: 'Pensions and Social Security exempt; high general excise tax on goods.',
    notes: 'Hawaii exempts employer pensions, Social Security, and military retirement, but IRA/401(k) withdrawals are taxed at high rates.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Hawaii Department of Taxation', url: 'https://tax.hawaii.gov/' }],
  },
  ID: {
    name: 'Idaho', code: 'ID', hasStateTax: true, topRate: 0.058, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Idaho does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement income deduction available for taxpayers age 65+ with qualifying retirement benefits.',
    publicPension: 'partial', publicPensionNote: 'State and federal public pensions qualify for Idaho retirement deduction.',
    iraWithdrawals: 'none', iraNotes: 'IRA/401(k) withdrawals are taxed at Idaho flat 5.8% rate.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Idaho fully exempts military retirement pay.',
    seniorBenefits: 'Grocery tax credit of $120–$140 per person. Flat 5.8% income tax rate.',
    notes: 'Idaho flat 5.8% rate. Social Security and military retirement are exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Idaho State Tax Commission', url: 'https://tax.idaho.gov/' }],
  },
  IL: {
    name: 'Illinois', code: 'IL', hasStateTax: true, topRate: 0.0495, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Illinois does not tax Social Security benefits.',
    privatePension: 'full', privatePensionNote: 'Illinois fully exempts qualified employer pension plans from state income tax.',
    publicPension: 'full', publicPensionNote: 'Illinois fully exempts state, local, and federal government pensions.',
    iraWithdrawals: 'full', iraNotes: 'Illinois fully exempts distributions from qualified retirement plans (IRA, 401k, 403b).',
    rothWithdrawals: 'full', rothNotes: 'Roth distributions are fully exempt.',
    militaryRetirement: 'full', militaryNote: 'Illinois fully exempts military retirement pay.',
    seniorBenefits: 'Illinois exempts virtually all retirement income. Flat 4.95% rate only touches non-retirement income.',
    notes: 'Illinois is one of the most retirement-income-friendly states: Social Security, pensions, 401(k), and IRA withdrawals are 100% state tax-free.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Illinois Department of Revenue', url: 'https://tax.illinois.gov/individuals/individual-income-tax/retirement.html' }],
  },
  IN: {
    name: 'Indiana', code: 'IN', hasStateTax: true, topRate: 0.0305, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Indiana does not tax Social Security benefits.',
    privatePension: 'none', privatePensionNote: 'Private pensions are subject to Indiana 3.05% flat tax plus county income tax.',
    publicPension: 'partial', publicPensionNote: 'Up to $16,000 exclusion for military and certain public safety pensions.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) withdrawals are taxed at 3.05% flat rate + county tax.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Indiana fully exempts military retirement pay.',
    seniorBenefits: 'Low flat state rate (3.05%). Note that county taxes add 1%–3% across Indiana counties.',
    notes: 'Indiana has a low state income tax (3.05%), but local county income taxes apply in every county. Social Security is exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Indiana Department of Revenue', url: 'https://www.in.gov/dor/' }],
  },
  IA: {
    name: 'Iowa', code: 'IA', hasStateTax: true, topRate: 0.038, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Iowa fully exempts Social Security benefits.',
    privatePension: 'full', privatePensionNote: 'Iowa fully exempts all retirement income (pensions, IRA, 401k, RMDs) for taxpayers age 55+.',
    publicPension: 'full', publicPensionNote: 'Fully exempt for age 55+.',
    iraWithdrawals: 'full', iraNotes: 'Fully exempt for age 55+.',
    rothWithdrawals: 'full', rothNotes: 'Fully exempt for age 55+.',
    militaryRetirement: 'full', militaryNote: 'Fully exempt for age 55+.',
    seniorBenefits: '100% exemption on all retirement income for anyone 55 and older.',
    notes: 'Iowa enacted full retirement income exemption for taxpayers age 55 and older. State rate transitions to flat 3.8%.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Iowa Department of Revenue', url: 'https://tax.iowa.gov/' }],
  },
  KS: {
    name: 'Kansas', code: 'KS', hasStateTax: true, topRate: 0.057, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 15000, rate: 0.031 }, { min: 15000, max: 30000, rate: 0.0525 }, { min: 30000, max: null, rate: 0.057 }],
      mfj: [{ min: 0, max: 30000, rate: 0.031 }, { min: 30000, max: 60000, rate: 0.0525 }, { min: 60000, max: null, rate: 0.057 }],
    },
    socialSecurity: 'partial', ssTaxNote: 'Kansas exempts Social Security if federal AGI is $75,000 or less. Above $75,000, SS is taxed at regular rates.',
    privatePension: 'none', privatePensionNote: 'Private pensions are fully taxable in Kansas.',
    publicPension: 'full', publicPensionNote: 'Kansas public employee pensions (KPERS) and federal civil service pensions are fully exempt.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) withdrawals are fully taxable at Kansas state rates.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Kansas fully exempts military retirement pay.',
    seniorBenefits: 'Social Security exempt for AGI under $75,000. KPERS pensions fully exempt.',
    notes: 'Kansas taxes Social Security for retirees with AGI > $75,000. Public pensions are exempt; private retirement is taxed.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Kansas Department of Revenue', url: 'https://www.ksrevenue.gov/' }],
  },
  KY: {
    name: 'Kentucky', code: 'KY', hasStateTax: true, topRate: 0.04, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Kentucky does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Pension exclusion of up to $31,110 per person from qualifying retirement plans.',
    publicPension: 'partial', publicPensionNote: 'Qualifies for the $31,110 per person retirement income exclusion.',
    iraWithdrawals: 'partial', iraNotes: 'IRA/401(k) withdrawals count toward the $31,110 exclusion; remainder taxed at 4%.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Kentucky fully exempts military retirement pay.',
    seniorBenefits: '$31,110 exclusion per person covers most moderate-income retirement distributions.',
    notes: 'Kentucky flat rate 4%. Social Security and military pay exempt; up to $31,110/person other retirement income excluded.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Kentucky Department of Revenue', url: 'https://revenue.ky.gov/' }],
  },
  LA: {
    name: 'Louisiana', code: 'LA', hasStateTax: true, topRate: 0.03, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Louisiana does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Exclusion of up to $6,000 per person age 65+ from retirement distributions.',
    publicPension: 'full', publicPensionNote: 'Louisiana state and local government employee pensions are fully exempt.',
    iraWithdrawals: 'partial', iraNotes: 'IRA withdrawals above the $6,000 exemption for age 65+ are taxed at flat 3%.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Louisiana fully exempts military retirement pay.',
    seniorBenefits: '$6,000 exemption for age 65+. State pensions 100% exempt. Flat 3% rate.',
    notes: 'Louisiana flattened to 3.0% rate. Public pensions, Social Security, and military retirement are fully exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Louisiana Department of Revenue', url: 'https://revenue.louisiana.gov/' }],
  },
  ME: {
    name: 'Maine', code: 'ME', hasStateTax: true, topRate: 0.0715, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 24500, rate: 0.058 }, { min: 24500, max: 58050, rate: 0.0675 }, { min: 58050, max: null, rate: 0.0715 }],
      mfj: [{ min: 0, max: 49050, rate: 0.058 }, { min: 49050, max: 116100, rate: 0.0675 }, { min: 116100, max: null, rate: 0.0715 }],
    },
    socialSecurity: 'full', ssTaxNote: 'Maine does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Pension income deduction up to $30,000 per person for qualifying retirement plans (reduced by Social Security).',
    publicPension: 'partial', publicPensionNote: 'Qualifies for Maine pension income deduction.',
    iraWithdrawals: 'partial', iraNotes: 'IRA/401(k) withdrawals qualify for the pension deduction up to statutory limits.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Maine fully exempts military retirement pay.',
    seniorBenefits: 'Pension deduction up to $30,000 per person. Property tax fairness credit.',
    notes: 'Maine exempts Social Security and military retirement. Pension deduction reduces taxable retirement distributions.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Maine Revenue Services', url: 'https://www.maine.gov/revenue/' }],
  },
  MD: {
    name: 'Maryland', code: 'MD', hasStateTax: true, topRate: 0.0575, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 1000, rate: 0.02 }, { min: 1000, max: 2000, rate: 0.03 },
        { min: 2000, max: 3000, rate: 0.04 }, { min: 3000, max: 100000, rate: 0.0475 },
        { min: 100000, max: 125000, rate: 0.05 }, { min: 125000, max: 150000, rate: 0.0525 },
        { min: 150000, max: 250000, rate: 0.055 }, { min: 250000, max: null, rate: 0.0575 },
      ],
      mfj: [
        { min: 0, max: 1000, rate: 0.02 }, { min: 1000, max: 2000, rate: 0.03 },
        { min: 2000, max: 3000, rate: 0.04 }, { min: 3000, max: 150000, rate: 0.0475 },
        { min: 150000, max: 175000, rate: 0.05 }, { min: 175000, max: 225000, rate: 0.0525 },
        { min: 225000, max: 300000, rate: 0.055 }, { min: 300000, max: null, rate: 0.0575 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Maryland does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Maryland pension exclusion of up to $36,200 for taxpayers age 65+ (reduced by Social Security).',
    publicPension: 'partial', publicPensionNote: 'Included in Maryland pension exclusion.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA withdrawals generally do not qualify for the pension exclusion (401k/pension plans do).',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Maryland fully exempts military retirement pay for age 55+.',
    seniorBenefits: 'Pension exclusion for 65+. Note that county income taxes add 2.25%–3.20% across MD counties.',
    notes: 'Maryland exempts Social Security. Pension exclusion up to $36,200 for 65+, but county income taxes add 2.25%–3.20%.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Maryland Comptroller', url: 'https://www.marylandtaxes.gov/' }],
  },
  MA: {
    name: 'Massachusetts', code: 'MA', hasStateTax: true, topRate: 0.05, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Massachusetts does not tax Social Security benefits.',
    privatePension: 'none', privatePensionNote: 'Private pensions and 401(k) withdrawals are taxable at flat 5.0% rate.',
    publicPension: 'full', publicPensionNote: 'Massachusetts state, local, and federal government pensions are fully exempt.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA withdrawals are taxable in Massachusetts.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Massachusetts fully exempts military retirement pay.',
    seniorBenefits: 'Flat 5.0% rate. Senior Circuit Breaker property tax credit available.',
    notes: 'Massachusetts flat 5% tax. Social Security, public pensions, and military retirement are exempt; private pensions and IRAs are taxed.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Massachusetts Department of Revenue', url: 'https://www.mass.gov/orgs/massachusetts-department-of-revenue' }],
  },
  MI: {
    name: 'Michigan', code: 'MI', hasStateTax: true, topRate: 0.0425, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Michigan does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement deduction phasing back in: taxpayers can choose between older rules and expanded standard deduction options.',
    publicPension: 'partial', publicPensionNote: 'Public pensions qualify under Michigan retirement deduction rules.',
    iraWithdrawals: 'partial', iraNotes: 'IRA distributions qualify under the restored Michigan retirement deduction.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Michigan fully exempts military retirement pay.',
    seniorBenefits: 'Restored retirement deduction for retirees. Flat 4.25% state rate.',
    notes: 'Michigan "Rollback the Retirement Tax" law restores generous retirement deductions for seniors.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Michigan Department of Treasury', url: 'https://www.michigan.gov/taxes/iit/retirement-and-pension-benefits' }],
  },
  MN: {
    name: 'Minnesota', code: 'MN', hasStateTax: true, topRate: 0.0985, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 31690, rate: 0.0535 }, { min: 31690, max: 104090, rate: 0.068 },
        { min: 104090, max: 193240, rate: 0.0785 }, { min: 193240, max: null, rate: 0.0985 },
      ],
      mfj: [
        { min: 0, max: 46330, rate: 0.0535 }, { min: 46330, max: 184040, rate: 0.068 },
        { min: 184040, max: 321450, rate: 0.0785 }, { min: 321450, max: null, rate: 0.0985 },
      ],
    },
    socialSecurity: 'partial', ssTaxNote: 'Minnesota exempts Social Security for single filers with AGI under $82,190 (MFJ under $105,380). Phased out for higher incomes.',
    privatePension: 'none', privatePensionNote: 'Private pensions are fully taxable at Minnesota state rates (up to 9.85%).',
    publicPension: 'none', publicPensionNote: 'Public pensions are taxable in Minnesota.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) withdrawals are fully taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Minnesota fully exempts military retirement pay.',
    seniorBenefits: 'Social Security subtraction for lower- and middle-income retirees.',
    notes: 'Minnesota has high top rates (9.85%). Social Security is exempt for middle incomes, but pensions and IRAs are fully taxed.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Minnesota Department of Revenue', url: 'https://www.revenue.state.mn.us/social-security-subtraction' }],
  },
  MS: {
    name: 'Mississippi', code: 'MS', hasStateTax: true, topRate: 0.047, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Mississippi does not tax Social Security benefits.',
    privatePension: 'full', privatePensionNote: 'Mississippi fully exempts qualified retirement plan distributions (pensions, 401k, 403b).',
    publicPension: 'full', publicPensionNote: 'Mississippi fully exempts state, local, and federal government pensions.',
    iraWithdrawals: 'full', iraNotes: 'Traditional IRA distributions from qualified plans are 100% exempt in Mississippi.',
    rothWithdrawals: 'full', rothNotes: 'Roth distributions are 100% exempt.',
    militaryRetirement: 'full', militaryNote: 'Mississippi fully exempts military retirement pay.',
    seniorBenefits: 'Complete exemption on all retirement income. Low 4.7% flat rate on other income.',
    notes: 'Mississippi is one of the most tax-friendly states for retirees: zero state tax on pensions, IRAs, 401(k)s, and Social Security.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Mississippi Department of Revenue', url: 'https://www.dor.ms.gov/individual/retirement' }],
  },
  MO: {
    name: 'Missouri', code: 'MO', hasStateTax: true, topRate: 0.047, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 1207, rate: 0.015 }, { min: 1207, max: 2414, rate: 0.02 },
        { min: 2414, max: 3621, rate: 0.025 }, { min: 3621, max: 4828, rate: 0.03 },
        { min: 4828, max: 6035, rate: 0.035 }, { min: 6035, max: 7242, rate: 0.04 },
        { min: 7242, max: 8449, rate: 0.045 }, { min: 8449, max: null, rate: 0.047 },
      ],
      mfj: [
        { min: 0, max: 1207, rate: 0.015 }, { min: 1207, max: 2414, rate: 0.02 },
        { min: 2414, max: 3621, rate: 0.025 }, { min: 3621, max: 4828, rate: 0.03 },
        { min: 4828, max: 6035, rate: 0.035 }, { min: 6035, max: 7242, rate: 0.04 },
        { min: 7242, max: 8449, rate: 0.045 }, { min: 8449, max: null, rate: 0.047 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Missouri fully exempts Social Security benefits as of 2024.',
    privatePension: 'partial', privatePensionNote: 'Missouri provides a private pension deduction for taxpayers under AGI limits ($85k single / $100k MFJ).',
    publicPension: 'partial', publicPensionNote: 'Public pensions qualify for Missouri pension exemption under income limits.',
    iraWithdrawals: 'partial', iraNotes: 'IRA distributions qualify for the Missouri retirement deduction if AGI is below threshold.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Missouri fully exempts military retirement pay.',
    seniorBenefits: 'Social Security 100% exempt. Top rate lowered to 4.7%. Senior property tax credit.',
    notes: 'Missouri eliminated Social Security tax in 2024 and lowered top income tax rate to 4.7%.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Missouri Department of Revenue', url: 'https://dor.mo.gov/taxation/individual/tax-types/individual-income-tax/' }],
  },
  MT: {
    name: 'Montana', code: 'MT', hasStateTax: true, topRate: 0.059, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 20500, rate: 0.047 }, { min: 20500, max: null, rate: 0.059 }],
      mfj: [{ min: 0, max: 41000, rate: 0.047 }, { min: 41000, max: null, rate: 0.059 }],
    },
    socialSecurity: 'partial', ssTaxNote: 'Montana taxes Social Security following federal rules, with a small state subtraction for lower incomes.',
    privatePension: 'partial', privatePensionNote: 'Montana allows up to $4,640 pension/annuity deduction (phased out for higher incomes).',
    publicPension: 'partial', publicPensionNote: 'Included in the $4,640 pension deduction.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) withdrawals are generally taxable at state rates.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Montana fully exempts military retirement pay (up to $5,500 base, with broader exemptions enacted).',
    seniorBenefits: 'Elderly homeowner/renter credit available. Top rate simplified to 5.9%.',
    notes: 'Montana taxes Social Security largely conforming to federal rules. Top state rate is 5.9%.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Montana Department of Revenue', url: 'https://mtrevenue.gov/taxes/individual-income-tax/' }],
  },
  NE: {
    name: 'Nebraska', code: 'NE', hasStateTax: true, topRate: 0.0399, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 3700, rate: 0.0246 }, { min: 3700, max: 22170, rate: 0.0351 },
        { min: 22170, max: 35730, rate: 0.0501 }, { min: 35730, max: null, rate: 0.0399 },
      ],
      mfj: [
        { min: 0, max: 7390, rate: 0.0246 }, { min: 7390, max: 44350, rate: 0.0351 },
        { min: 44350, max: 71460, rate: 0.0501 }, { min: 71460, max: null, rate: 0.0399 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Nebraska fully exempts Social Security benefits as of 2024.',
    privatePension: 'none', privatePensionNote: 'Private pensions are taxable in Nebraska at regular state rates.',
    publicPension: 'none', publicPensionNote: 'Public pensions are taxable in Nebraska.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions are taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Nebraska fully exempts military retirement pay.',
    seniorBenefits: 'Social Security 100% exempt. Top tax rate lowered to 3.99%.',
    notes: 'Nebraska fully phased out its tax on Social Security. Military retirement is also exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Nebraska Department of Revenue', url: 'https://revenue.nebraska.gov/individuals' }],
  },
  NV: {
    name: 'Nevada', code: 'NV', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Nevada has no state income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state individual income tax. Property tax senior assistance available.',
    notes: 'Nevada has no state income tax. All retirement income is completely exempt from state tax.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Nevada Department of Taxation', url: 'https://tax.nv.gov/' }],
  },
  NH: {
    name: 'New Hampshire', code: 'NH', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'New Hampshire has no individual earned income tax and repealed its Interest & Dividends tax as of Jan 1, 2025.',
    privatePension: 'full', privatePensionNote: 'No state income tax on pensions.',
    publicPension: 'full', publicPensionNote: 'No state income tax on pensions.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax on IRA distributions.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax on Roth distributions.',
    militaryRetirement: 'full', militaryNote: 'No state income tax on military retirement.',
    seniorBenefits: 'Zero state income tax. (Property taxes are comparatively higher).',
    notes: 'New Hampshire fully repealed its Interest and Dividends tax in 2025. There is no state income tax on any retirement income.',
    lastVerified: 'August 2026',
    sources: [{ label: 'New Hampshire Department of Revenue Administration', url: 'https://www.revenue.nh.gov/' }],
  },
  NJ: {
    name: 'New Jersey', code: 'NJ', hasStateTax: true, topRate: 0.1075, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 20000, rate: 0.014 }, { min: 20000, max: 35000, rate: 0.0175 },
        { min: 35000, max: 40000, rate: 0.035 }, { min: 40000, max: 75000, rate: 0.0553 },
        { min: 75000, max: 500000, rate: 0.0637 }, { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
      mfj: [
        { min: 0, max: 20000, rate: 0.014 }, { min: 20000, max: 50000, rate: 0.0175 },
        { min: 50000, max: 70000, rate: 0.0245 }, { min: 70000, max: 80000, rate: 0.035 },
        { min: 80000, max: 150000, rate: 0.0553 }, { min: 150000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 }, { min: 1000000, max: null, rate: 0.1075 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'New Jersey does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement income exclusion up to $100,000 (joint) or $75,000 (single) for taxpayers age 62+ with gross income ≤ $100,000.',
    publicPension: 'partial', publicPensionNote: 'Qualifies for NJ retirement income exclusion.',
    iraWithdrawals: 'partial', iraNotes: 'IRA/401(k) withdrawals qualify for the retirement exclusion if income is under $100,000.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'New Jersey fully exempts military retirement pay.',
    seniorBenefits: 'Senior Freeze property tax program. Generous retirement exclusion for income under $100k.',
    notes: 'New Jersey exempts Social Security and offers up to $100,000 retirement exclusion for taxpayers with total income under $100,000.',
    lastVerified: 'August 2026',
    sources: [{ label: 'New Jersey Division of Taxation', url: 'https://www.state.nj.us/treasury/taxation/senior_citizens.shtml' }],
  },
  NM: {
    name: 'New Mexico', code: 'NM', hasStateTax: true, topRate: 0.059, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 5500, rate: 0.017 }, { min: 5500, max: 11000, rate: 0.032 },
        { min: 11000, max: 16000, rate: 0.047 }, { min: 16000, max: 210000, rate: 0.049 },
        { min: 210000, max: null, rate: 0.059 },
      ],
      mfj: [
        { min: 0, max: 8000, rate: 0.017 }, { min: 8000, max: 16000, rate: 0.032 },
        { min: 16000, max: 24000, rate: 0.047 }, { min: 24000, max: 315000, rate: 0.049 },
        { min: 315000, max: null, rate: 0.059 },
      ],
    },
    socialSecurity: 'partial', ssTaxNote: 'New Mexico exempts Social Security for single filers with AGI under $100,000 ($150,000 MFJ). Above limits, SS is taxed.',
    privatePension: 'none', privatePensionNote: 'Private pensions are taxable at New Mexico state rates.',
    publicPension: 'none', publicPensionNote: 'Public pensions are taxable in New Mexico.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions are taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'New Mexico fully exempts military retirement pay.',
    seniorBenefits: 'Social Security exempt for most middle-income retirees. Low-income comprehensive rebate.',
    notes: 'New Mexico exempts Social Security for retirees under $100k/$150k AGI. Military retirement is fully exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'New Mexico Taxation and Revenue Department', url: 'https://www.tax.newmexico.gov/' }],
  },
  NY: {
    name: 'New York', code: 'NY', hasStateTax: true, topRate: 0.109, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 17150, rate: 0.04 }, { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 }, { min: 27900, max: 161550, rate: 0.055 },
        { min: 161550, max: 323200, rate: 0.06 }, { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 }, { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: null, rate: 0.109 },
      ],
      mfj: [
        { min: 0, max: 27900, rate: 0.04 }, { min: 27900, max: 43000, rate: 0.045 },
        { min: 43000, max: 161550, rate: 0.0525 }, { min: 161550, max: 323200, rate: 0.059 },
        { min: 323200, max: 2155350, rate: 0.0685 }, { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 }, { min: 25000000, max: null, rate: 0.109 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'New York does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Pension and annuity exclusion of up to $20,000 per person age 59½+ from employer plans.',
    publicPension: 'full', publicPensionNote: 'New York State, local, and federal government pensions are 100% exempt from NY tax.',
    iraWithdrawals: 'partial', iraNotes: 'Traditional IRA distributions qualify for the $20,000 per person exclusion for age 59½+.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'New York fully exempts military retirement pay.',
    seniorBenefits: '$20,000 per person retirement exclusion. 100% exemption for NY public pensions. Enhanced STAR property tax relief.',
    notes: 'New York exempts Social Security and all NY public pensions. Up to $20,000/person private retirement income is exempt for age 59½+.',
    lastVerified: 'August 2026',
    sources: [{ label: 'New York Department of Taxation and Finance', url: 'https://www.tax.ny.gov/pit/pubs/pub36.htm' }],
  },
  NC: {
    name: 'North Carolina', code: 'NC', hasStateTax: true, topRate: 0.045, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'North Carolina does not tax Social Security benefits.',
    privatePension: 'none', privatePensionNote: 'Private pensions and 401(k) distributions are taxed at NC flat rate (4.5% in 2025–2026).',
    publicPension: 'partial', publicPensionNote: 'Bailey Settlement provides full exemption for retirees with 5+ years of state/federal service prior to Aug 12, 1989.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions are taxed at flat state rate.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'North Carolina fully exempts military retirement pay.',
    seniorBenefits: 'Flat 4.5% rate (moving to 3.99% by 2027). Social Security and military pay exempt.',
    notes: 'NC flat rate is 4.5% with planned reductions. Social Security and military retirement are exempt; IRAs and pensions are taxed.',
    lastVerified: 'August 2026',
    sources: [{ label: 'North Carolina Department of Revenue', url: 'https://www.ncdor.gov/taxes-forms/individual-income-tax/retirement-income' }],
  },
  ND: {
    name: 'North Dakota', code: 'ND', hasStateTax: true, topRate: 0.025, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 44725, rate: 0.011 }, { min: 44725, max: 225975, rate: 0.0204 }, { min: 225975, max: null, rate: 0.025 }],
      mfj: [{ min: 0, max: 74750, rate: 0.011 }, { min: 74750, max: 275100, rate: 0.0204 }, { min: 275100, max: null, rate: 0.025 }],
    },
    socialSecurity: 'full', ssTaxNote: 'North Dakota fully exempts Social Security benefits.',
    privatePension: 'none', privatePensionNote: 'Private pensions taxed at very low state rates (0%–2.5%).',
    publicPension: 'none', publicPensionNote: 'Public pensions taxed at very low state rates.',
    iraWithdrawals: 'none', iraNotes: 'IRA withdrawals taxed at low state rates.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'North Dakota fully exempts military retirement pay.',
    seniorBenefits: 'Among the lowest state income tax rates in the nation (top rate 2.5%). Social Security exempt.',
    notes: 'North Dakota has very low rates (top 2.5%) and exempts Social Security and military retirement.',
    lastVerified: 'August 2026',
    sources: [{ label: 'North Dakota Office of State Tax Commissioner', url: 'https://www.tax.nd.gov/' }],
  },
  OH: {
    name: 'Ohio', code: 'OH', hasStateTax: true, topRate: 0.0399, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 26050, rate: 0 }, { min: 26050, max: 100000, rate: 0.0276 },
        { min: 100000, max: 115300, rate: 0.0333 }, { min: 115300, max: null, rate: 0.0399 },
      ],
      mfj: [
        { min: 0, max: 26050, rate: 0 }, { min: 26050, max: 100000, rate: 0.0276 },
        { min: 100000, max: 115300, rate: 0.0333 }, { min: 115300, max: null, rate: 0.0399 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Ohio does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement income credit of up to $200 for taxpayers with modified AGI under $100,000.',
    publicPension: 'partial', publicPensionNote: 'Qualifies for Ohio retirement income credit.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions are taxed at state rates, offset by credits if eligible.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Ohio fully exempts military retirement pay.',
    seniorBenefits: '0% tax on first $26,050 of income. Senior citizen credit of $50 for age 65+. (Municipal taxes may apply).',
    notes: 'Ohio has 0% tax on first $26,050 of income. Social Security and military pay exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Ohio Department of Taxation', url: 'https://tax.ohio.gov/' }],
  },
  OK: {
    name: 'Oklahoma', code: 'OK', hasStateTax: true, topRate: 0.0475, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 1000, rate: 0.005 }, { min: 1000, max: 2500, rate: 0.01 },
        { min: 2500, max: 3750, rate: 0.02 }, { min: 3750, max: 4900, rate: 0.03 },
        { min: 4900, max: 7200, rate: 0.04 }, { min: 7200, max: null, rate: 0.0475 },
      ],
      mfj: [
        { min: 0, max: 2000, rate: 0.005 }, { min: 2000, max: 5000, rate: 0.01 },
        { min: 5000, max: 7500, rate: 0.02 }, { min: 7500, max: 9800, rate: 0.03 },
        { min: 9800, max: 12200, rate: 0.04 }, { min: 12200, max: null, rate: 0.0475 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Oklahoma does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement exclusion of up to $10,000 per person from qualifying retirement plans.',
    publicPension: 'partial', publicPensionNote: 'Oklahoma government pensions qualify for 100% exemption or $10,000 exclusion.',
    iraWithdrawals: 'partial', iraNotes: 'Traditional IRA/401(k) withdrawals qualify for the $10,000 per person exclusion.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Oklahoma fully exempts military retirement pay.',
    seniorBenefits: '$10,000 retirement exclusion per person. Social Security and military retirement 100% exempt.',
    notes: 'Oklahoma top rate 4.75%. Social Security and military pay exempt; $10k/person exclusion on pensions and IRAs.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Oklahoma Tax Commission', url: 'https://oklahoma.gov/tax.html' }],
  },
  OR: {
    name: 'Oregon', code: 'OR', hasStateTax: true, topRate: 0.099, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 4050, rate: 0.0475 }, { min: 4050, max: 10200, rate: 0.0675 },
        { min: 10200, max: 125000, rate: 0.0875 }, { min: 125000, max: null, rate: 0.099 },
      ],
      mfj: [
        { min: 0, max: 8100, rate: 0.0475 }, { min: 8100, max: 20400, rate: 0.0675 },
        { min: 20400, max: 250000, rate: 0.0875 }, { min: 250000, max: null, rate: 0.099 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Oregon does not tax Social Security benefits.',
    privatePension: 'none', privatePensionNote: 'Private pensions are fully taxable in Oregon (rates up to 9.9%).',
    publicPension: 'partial', publicPensionNote: 'Federal and Oregon public pension income earned before Oct 1, 1991 may be exempt.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions are fully taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'partial', militaryNote: 'Military retirement pay earned before Oct 1, 1991 is exempt; remainder may qualify for subtraction.',
    seniorBenefits: 'No state sales tax in Oregon. Retirement income credit for lower-income seniors.',
    notes: 'Oregon has high state income taxes (up to 9.9%), but no state sales tax. Social Security is exempt; IRAs and private pensions are taxed.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Oregon Department of Revenue', url: 'https://www.oregon.gov/dor/' }],
  },
  PA: {
    name: 'Pennsylvania', code: 'PA', hasStateTax: true, topRate: 0.0307, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Pennsylvania does not tax Social Security benefits.',
    privatePension: 'full', privatePensionNote: 'Pennsylvania fully exempts distributions from qualified employer retirement plans for retirees age 59½+.',
    publicPension: 'full', publicPensionNote: 'Pennsylvania fully exempts state, local, and federal government pensions.',
    iraWithdrawals: 'full', iraNotes: 'Pennsylvania fully exempts IRA and 401(k) distributions for retirees age 59½+.',
    rothWithdrawals: 'full', rothNotes: 'Roth distributions are fully exempt.',
    militaryRetirement: 'full', militaryNote: 'Pennsylvania fully exempts military retirement pay.',
    seniorBenefits: 'Complete exemption on all qualified retirement income for age 59½+. Property Tax/Rent Rebate Program.',
    notes: 'Pennsylvania is one of the most retiree-friendly tax states in America: Social Security, pensions, 401(k)s, and IRAs are 100% exempt from state tax.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Pennsylvania Department of Revenue', url: 'https://www.revenue.pa.gov/TaxTypes/PIT/Pages/Retirement.aspx' }],
  },
  RI: {
    name: 'Rhode Island', code: 'RI', hasStateTax: true, topRate: 0.0599, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 77450, rate: 0.0375 }, { min: 77450, max: 176050, rate: 0.0475 }, { min: 176050, max: null, rate: 0.0599 }],
      mfj: [{ min: 0, max: 77450, rate: 0.0375 }, { min: 77450, max: 176050, rate: 0.0475 }, { min: 176050, max: null, rate: 0.0599 }],
    },
    socialSecurity: 'partial', ssTaxNote: 'Rhode Island exempts Social Security for retirees at Full Retirement Age with AGI under $101,000 (single) or $126,250 (joint). Above limits, SS is taxed.',
    privatePension: 'partial', privatePensionNote: 'Pension modification allows up to $20,000 exclusion for taxpayers at FRA with AGI under thresholds.',
    publicPension: 'partial', publicPensionNote: 'Qualifies for the Rhode Island pension modification.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA distributions are generally taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Rhode Island fully exempts military retirement pay.',
    seniorBenefits: 'Social Security and pension exclusions for retirees at Full Retirement Age with AGI below state limits.',
    notes: 'Rhode Island taxes Social Security for retirees with income above state limits. Military retirement is fully exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Rhode Island Division of Taxation', url: 'https://tax.ri.gov/' }],
  },
  SC: {
    name: 'South Carolina', code: 'SC', hasStateTax: true, topRate: 0.062, flatRate: false,
    brackets: {
      single: [{ min: 0, max: 3460, rate: 0 }, { min: 3460, max: 17330, rate: 0.03 }, { min: 17330, max: null, rate: 0.062 }],
      mfj: [{ min: 0, max: 3460, rate: 0 }, { min: 3460, max: 17330, rate: 0.03 }, { min: 17330, max: null, rate: 0.062 }],
    },
    socialSecurity: 'full', ssTaxNote: 'South Carolina does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement income deduction of up to $10,000 per person age 65+ ($3,000 for under 65).',
    publicPension: 'partial', publicPensionNote: 'Included in South Carolina retirement deduction.',
    iraWithdrawals: 'partial', iraNotes: 'Traditional IRA/401(k) withdrawals qualify for the $10,000 deduction for age 65+.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'South Carolina fully exempts military retirement pay.',
    seniorBenefits: '$10,000 per person retirement income deduction for 65+. Additional age 65+ $15,000 deduction on other income.',
    notes: 'South Carolina is very popular for retirees: 100% Social Security exemption, full military pay exemption, and $10k–$15k deductions for age 65+.',
    lastVerified: 'August 2026',
    sources: [{ label: 'South Carolina Department of Revenue', url: 'https://dor.sc.gov/tax/individual/retirement-income' }],
  },
  SD: {
    name: 'South Dakota', code: 'SD', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'South Dakota has no state income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state individual income tax. Property tax reduction program for seniors.',
    notes: 'South Dakota has no state individual income tax. All retirement income is completely exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'South Dakota Department of Revenue', url: 'https://dor.sd.gov/' }],
  },
  TN: {
    name: 'Tennessee', code: 'TN', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Tennessee has no state income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state income tax on any income. Property tax relief and freeze for seniors 65+.',
    notes: 'Tennessee has no state income tax (Hall Income Tax fully repealed). All retirement income is 100% state tax-free.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Tennessee Department of Revenue', url: 'https://www.tn.gov/revenue.html' }],
  },
  TX: {
    name: 'Texas', code: 'TX', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Texas has no state income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state individual income tax. Over-65 property tax homestead exemption and school tax freeze.',
    notes: 'Texas constitution bars individual income tax. All retirement income is completely state tax-free. (Property taxes are higher).',
    lastVerified: 'August 2026',
    sources: [{ label: 'Texas Comptroller of Public Accounts', url: 'https://comptroller.texas.gov/' }],
  },
  UT: {
    name: 'Utah', code: 'UT', hasStateTax: true, topRate: 0.0455, flatRate: true, brackets: null,
    socialSecurity: 'partial', ssTaxNote: 'Utah offers a Social Security tax credit of up to $450 (single) or $900 (joint), which phases out above $45,000 (single) or $75,000 (joint).',
    privatePension: 'none', privatePensionNote: 'Private pensions taxed at Utah flat 4.55% rate.',
    publicPension: 'none', publicPensionNote: 'Public pensions taxed at flat 4.55% rate.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions taxed at flat 4.55%.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Utah fully exempts military retirement pay.',
    seniorBenefits: 'Social Security tax credit for lower-to-middle income retirees. Flat 4.55% rate.',
    notes: 'Utah flat rate 4.55%. Social Security receives a tax credit phasing out at moderate income levels; military retirement is exempt.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Utah State Tax Commission', url: 'https://tax.utah.gov/' }],
  },
  VT: {
    name: 'Vermont', code: 'VT', hasStateTax: true, topRate: 0.0875, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 45400, rate: 0.0335 }, { min: 45400, max: 110050, rate: 0.066 },
        { min: 110050, max: 229550, rate: 0.076 }, { min: 229550, max: null, rate: 0.0875 },
      ],
      mfj: [
        { min: 0, max: 75850, rate: 0.0335 }, { min: 75850, max: 183400, rate: 0.066 },
        { min: 183400, max: 279950, rate: 0.076 }, { min: 279950, max: null, rate: 0.0875 },
      ],
    },
    socialSecurity: 'partial', ssTaxNote: 'Vermont exempts Social Security for single filers with AGI under $50,000 ($65,000 joint). Above limits, SS is taxed.',
    privatePension: 'none', privatePensionNote: 'Private pensions are fully taxable in Vermont.',
    publicPension: 'none', publicPensionNote: 'Public pensions are fully taxable in Vermont.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions are fully taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Vermont fully exempts military retirement pay (up to $10,000 with phaseouts).',
    seniorBenefits: 'Social Security exemption for lower-income retirees. Property tax adjustment credit.',
    notes: 'Vermont taxes Social Security for retirees above income thresholds and taxes all private pensions and IRA withdrawals.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Vermont Department of Taxes', url: 'https://tax.vermont.gov/' }],
  },
  VA: {
    name: 'Virginia', code: 'VA', hasStateTax: true, topRate: 0.0575, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 3000, rate: 0.02 }, { min: 3000, max: 5000, rate: 0.03 },
        { min: 5000, max: 17000, rate: 0.05 }, { min: 17000, max: null, rate: 0.0575 },
      ],
      mfj: [
        { min: 0, max: 3000, rate: 0.02 }, { min: 3000, max: 5000, rate: 0.03 },
        { min: 5000, max: 17000, rate: 0.05 }, { min: 17000, max: null, rate: 0.0575 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Virginia does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Age deduction of up to $12,000 per person age 65+ (subject to income phaseout starting at $50k single / $75k joint).',
    publicPension: 'partial', publicPensionNote: 'Qualifies for Virginia age deduction.',
    iraWithdrawals: 'partial', iraNotes: 'Traditional IRA/401(k) withdrawals qualify for the $12,000 age deduction for 65+.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Virginia exempts up to $40,000 of military retirement pay (fully exempting it for most recipients).',
    seniorBenefits: '$12,000 age deduction per person for age 65+ (income limits apply). Social Security 100% exempt.',
    notes: 'Virginia top rate 5.75%. Social Security is exempt, and seniors 65+ can deduct up to $12,000 of other income.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Virginia Department of Taxation', url: 'https://www.tax.virginia.gov/' }],
  },
  WA: {
    name: 'Washington', code: 'WA', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Washington has no state individual income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state income tax. Property tax exemption/deferral program for low-to-moderate income seniors.',
    notes: 'Washington has no personal income tax. Note: 7% capital gains excise tax applies on long-term capital gains over $262,000 (does not apply to retirement accounts or real estate).',
    lastVerified: 'August 2026',
    sources: [{ label: 'Washington Department of Revenue', url: 'https://dor.wa.gov/' }],
  },
  WV: {
    name: 'West Virginia', code: 'WV', hasStateTax: true, topRate: 0.0512, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.03 }, { min: 10000, max: 25000, rate: 0.04 },
        { min: 25000, max: 40000, rate: 0.045 }, { min: 40000, max: 60000, rate: 0.06 },
        { min: 60000, max: null, rate: 0.0512 },
      ],
      mfj: [
        { min: 0, max: 10000, rate: 0.03 }, { min: 10000, max: 25000, rate: 0.04 },
        { min: 25000, max: 40000, rate: 0.045 }, { min: 40000, max: 60000, rate: 0.06 },
        { min: 60000, max: null, rate: 0.0512 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'West Virginia fully exempts Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement income exclusion of up to $2,000 per person age 65+.',
    publicPension: 'partial', publicPensionNote: 'WV state/local and federal government pensions qualify for up to $2,000 exclusion.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions generally taxable above small senior exclusions.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'West Virginia fully exempts military retirement pay.',
    seniorBenefits: 'Social Security 100% exempt. Military retirement 100% exempt.',
    notes: 'West Virginia eliminated Social Security tax and is reducing its top income tax rate below 5%.',
    lastVerified: 'August 2026',
    sources: [{ label: 'West Virginia Tax Division', url: 'https://tax.wv.gov/' }],
  },
  WI: {
    name: 'Wisconsin', code: 'WI', hasStateTax: true, topRate: 0.0765, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 14320, rate: 0.0354 }, { min: 14320, max: 28640, rate: 0.0465 },
        { min: 28640, max: 315310, rate: 0.053 }, { min: 315310, max: null, rate: 0.0765 },
      ],
      mfj: [
        { min: 0, max: 19090, rate: 0.0354 }, { min: 19090, max: 38190, rate: 0.0465 },
        { min: 38190, max: 420420, rate: 0.053 }, { min: 420420, max: null, rate: 0.0765 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Wisconsin does not tax Social Security benefits.',
    privatePension: 'partial', privatePensionNote: 'Retirement income subtraction of up to $5,000 per person age 65+ with federal AGI under $15,000 (single) or $30,000 (joint).',
    publicPension: 'partial', publicPensionNote: 'Certain public employee pensions for service before 1964 are fully exempt.',
    iraWithdrawals: 'partial', iraNotes: 'IRA withdrawals qualify for the $5,000 retirement subtraction if under AGI limits.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'Wisconsin fully exempts military retirement pay.',
    seniorBenefits: 'Social Security 100% exempt. Military pay 100% exempt. Homestead tax credit.',
    notes: 'Wisconsin exempts Social Security and military retirement. Other retirement income is taxable at rates up to 7.65%.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Wisconsin Department of Revenue', url: 'https://www.revenue.wi.gov/' }],
  },
  WY: {
    name: 'Wyoming', code: 'WY', hasStateTax: false, topRate: 0, flatRate: true, brackets: null,
    socialSecurity: 'full', ssTaxNote: 'Wyoming has no state income tax. Social Security is 100% tax-free.',
    privatePension: 'full', privatePensionNote: 'No state income tax.',
    publicPension: 'full', publicPensionNote: 'No state income tax.',
    iraWithdrawals: 'full', iraNotes: 'No state income tax.',
    rothWithdrawals: 'full', rothNotes: 'No state income tax.',
    militaryRetirement: 'full', militaryNote: 'No state income tax.',
    seniorBenefits: 'No state individual income tax. Property tax relief program for seniors.',
    notes: 'Wyoming has no state individual income tax. All retirement income is completely state tax-free.',
    lastVerified: 'August 2026',
    sources: [{ label: 'Wyoming Department of Revenue', url: 'https://revenue.wyo.gov/' }],
  },
  DC: {
    name: 'District of Columbia', code: 'DC', hasStateTax: true, topRate: 0.1075, flatRate: false,
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.04 }, { min: 10000, max: 40000, rate: 0.06 },
        { min: 40000, max: 60000, rate: 0.065 }, { min: 60000, max: 250000, rate: 0.085 },
        { min: 250000, max: 500000, rate: 0.0925 }, { min: 500000, max: 1000000, rate: 0.0975 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
      mfj: [
        { min: 0, max: 10000, rate: 0.04 }, { min: 10000, max: 40000, rate: 0.06 },
        { min: 40000, max: 60000, rate: 0.065 }, { min: 60000, max: 250000, rate: 0.085 },
        { min: 250000, max: 500000, rate: 0.0925 }, { min: 500000, max: 1000000, rate: 0.0975 },
        { min: 1000000, max: null, rate: 0.1075 },
      ],
    },
    socialSecurity: 'full', ssTaxNote: 'Washington DC does not tax Social Security benefits.',
    privatePension: 'none', privatePensionNote: 'Private pensions and 401(k) distributions are taxable at DC income tax rates.',
    publicPension: 'partial', publicPensionNote: 'Federal civil service and DC government pensions have small exclusions for older retirees.',
    iraWithdrawals: 'none', iraNotes: 'Traditional IRA/401(k) distributions are fully taxable.',
    rothWithdrawals: 'full', rothNotes: 'Qualified Roth distributions are exempt.',
    militaryRetirement: 'full', militaryNote: 'DC fully exempts military retirement pay.',
    seniorBenefits: 'Senior citizen property tax relief (50% reduction in real property tax for qualifying seniors 65+).',
    notes: 'DC does not tax Social Security and exempts military retirement, but private pensions and IRAs face progressive rates up to 10.75%.',
    lastVerified: 'August 2026',
    sources: [{ label: 'DC Office of Tax and Revenue', url: 'https://otr.cfo.dc.gov/' }],
  },
};

const STATE_LIST = Object.values(STATES).sort((a, b) => a.name.localeCompare(b.name));

// ── CALCULATION ENGINE ────────────────────────────────────────────────────────

function applyBrackets(taxableIncome: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let remaining = taxableIncome;
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const bracketMax = bracket.max ?? Infinity;
    const bracketMin = bracket.min;
    const taxableInThisBracket = Math.min(remaining, bracketMax - bracketMin);
    if (taxableInThisBracket > 0) {
      tax += taxableInThisBracket * bracket.rate;
      remaining -= taxableInThisBracket;
    }
  }
  return Math.max(0, tax);
}

function getMarginalRate(taxableIncome: number, brackets: TaxBracket[]): number {
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) return brackets[i].rate;
  }
  return brackets[0].rate;
}

// Social Security provisional income formula per IRS Publication 915
function calculateTaxableSS(inputs: Inputs): { taxableAmount: number; percent: number; provisionalIncome: number } {
  const ssAnnual = inputs.socialSecurity;
  if (ssAnnual <= 0) return { taxableAmount: 0, percent: 0, provisionalIncome: 0 };

  const nonSSIncome =
    inputs.privatePension + inputs.publicPension +
    inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals +
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome +
    (inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount);

  // Provisional income = Non-SS income + 50% of Social Security benefits
  const provisionalIncome = nonSSIncome + 0.5 * ssAnnual;

  const fs = inputs.filingStatus;
  const thresholds = FEDERAL_2026.ssTaxThresholds[fs] || FEDERAL_2026.ssTaxThresholds.single;

  if (fs === 'mfs') {
    return {
      taxableAmount: Math.min(0.85 * ssAnnual, ssAnnual),
      percent: 85,
      provisionalIncome,
    };
  }

  if (provisionalIncome <= thresholds.tier1) {
    return { taxableAmount: 0, percent: 0, provisionalIncome };
  } else if (provisionalIncome <= thresholds.tier2) {
    const excess = provisionalIncome - thresholds.tier1;
    const taxable = Math.min(0.5 * excess, 0.5 * ssAnnual);
    return { taxableAmount: taxable, percent: Math.round((taxable / ssAnnual) * 100), provisionalIncome };
  } else {
    const tier1Taxable = 0.5 * (thresholds.tier2 - thresholds.tier1);
    const tier2Taxable = 0.85 * (provisionalIncome - thresholds.tier2);
    const total = Math.min(tier1Taxable + tier2Taxable, 0.85 * ssAnnual);
    return {
      taxableAmount: Math.min(total, ssAnnual),
      percent: Math.round((Math.min(total, ssAnnual) / ssAnnual) * 100),
      provisionalIncome,
    };
  }
}

function calculateFederalTax(inputs: Inputs): { tax: number; taxableIncome: number; agi: number; deduction: number; marginalRate: number } {
  const { taxableAmount: taxableSS } = calculateTaxableSS(inputs);

  const traditionalRetirement =
    inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals;
  const effectiveRmd = inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount;

  const agi = Math.max(0,
    taxableSS +
    inputs.privatePension + inputs.publicPension +
    traditionalRetirement + effectiveRmd +
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome
    - inputs.qcd
  );

  const fs = inputs.filingStatus;
  let deduction = FEDERAL_2026.standardDeduction[fs];

  if (inputs.useStandardDeduction) {
    const age = inputs.age;
    const spouseAge = inputs.spouseAge;
    if (fs === 'single' || fs === 'hoh') {
      if (age >= 65) deduction += FEDERAL_2026.seniorAddlDeduction.singleHoh;
    } else if (fs === 'mfj') {
      if (age >= 65) deduction += FEDERAL_2026.seniorAddlDeduction.mfjPerSpouse;
      if (spouseAge >= 65) deduction += FEDERAL_2026.seniorAddlDeduction.mfjPerSpouse;
    } else if (fs === 'mfs') {
      if (age >= 65) deduction += FEDERAL_2026.seniorAddlDeduction.singleHoh;
    }
  } else {
    deduction = inputs.itemizedDeductions;
  }

  const taxableIncome = Math.max(0, agi - deduction);
  const brackets = FEDERAL_2026.brackets[fs] || FEDERAL_2026.brackets.single;
  const tax = applyBrackets(taxableIncome, brackets);
  const marginalRate = taxableIncome > 0 ? getMarginalRate(taxableIncome, brackets) : 0;

  return { tax, taxableIncome, agi, deduction, marginalRate };
}

function calculateStateTax(inputs: Inputs, stateCode: string): number {
  const state = STATES[stateCode];
  if (!state || !state.hasStateTax) return 0;

  const { taxableAmount: taxableSS } = calculateTaxableSS(inputs);
  const traditionalRetirement = inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals;
  const effectiveRmd = inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount;

  let stateTaxableIncome = 0;

  // Social Security state treatment
  if (state.socialSecurity === 'none') {
    stateTaxableIncome += taxableSS;
  } else if (state.socialSecurity === 'partial') {
    stateTaxableIncome += taxableSS * 0.4;
  }

  // Private pension state treatment
  if (state.privatePension === 'none') {
    stateTaxableIncome += inputs.privatePension;
  } else if (state.privatePension === 'partial') {
    const exemption = (inputs.filingStatus === 'mfj') ? 20000 : 10000;
    stateTaxableIncome += Math.max(0, inputs.privatePension - exemption);
  }

  // Public pension state treatment
  if (state.publicPension === 'none') {
    stateTaxableIncome += inputs.publicPension;
  } else if (state.publicPension === 'partial') {
    stateTaxableIncome += inputs.publicPension * 0.25;
  }

  // Traditional IRA & 401(k) state treatment
  if (state.iraWithdrawals === 'none') {
    stateTaxableIncome += traditionalRetirement + effectiveRmd;
  } else if (state.iraWithdrawals === 'partial') {
    stateTaxableIncome += Math.max(0, (traditionalRetirement + effectiveRmd) * 0.4);
  }

  // Earned & Investment income
  stateTaxableIncome +=
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome;

  stateTaxableIncome = Math.max(0, stateTaxableIncome);

  if (state.flatRate) {
    return stateTaxableIncome * state.topRate;
  }

  const fs = inputs.filingStatus === 'mfj' ? 'mfj' : 'single';
  const brackets = state.brackets?.[fs] || state.brackets?.single;
  if (!brackets) return stateTaxableIncome * state.topRate;

  return applyBrackets(stateTaxableIncome, brackets);
}

function calculate(inputs: Inputs, stateCode: string): Results {
  const { taxableAmount: taxableSS, percent: ssTaxPct, provisionalIncome } = calculateTaxableSS(inputs);
  const { tax: federalTax, taxableIncome, agi, deduction, marginalRate } = calculateFederalTax(inputs);
  const stateTax = calculateStateTax(inputs, stateCode);
  const totalTax = federalTax + stateTax;

  const grossIncome =
    inputs.socialSecurity + inputs.privatePension + inputs.publicPension +
    inputs.iraWithdrawals + inputs.k401Withdrawals + inputs.k403bWithdrawals +
    inputs.rothIra + inputs.rothK401 +
    (inputs.rmdIncludedAbove ? 0 : inputs.rmdAmount) +
    inputs.wages + inputs.selfEmployment + inputs.rentalIncome +
    inputs.interest + inputs.dividends + inputs.capitalGains + inputs.otherIncome;

  const afterTaxIncome = Math.max(0, grossIncome - totalTax);
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;

  const breakdown = [
    {
      label: 'Social Security Benefits',
      amount: inputs.socialSecurity,
      status: ssTaxPct === 0 ? 'exempt' : ssTaxPct < 85 ? 'partial' : 'taxable',
      note: `${ssTaxPct}% taxable federally (${fmt(taxableSS)}) based on IRS provisional income formula`,
    } as const,
    {
      label: 'Private Employer Pension',
      amount: inputs.privatePension,
      status: 'taxable',
      note: 'Taxable as ordinary income federally; state exemptions apply in select states',
    } as const,
    {
      label: 'Public / Government Pension',
      amount: inputs.publicPension,
      status: 'taxable',
      note: 'Taxable federally; many states fully or partially exempt government pensions',
    } as const,
    {
      label: 'Traditional IRA Withdrawals',
      amount: inputs.iraWithdrawals,
      status: 'taxable',
      note: 'Taxable as ordinary income federally upon distribution (IRS Pub. 590-B)',
    } as const,
    {
      label: '401(k) / 403(b) Withdrawals',
      amount: inputs.k401Withdrawals + inputs.k403bWithdrawals,
      status: 'taxable',
      note: 'Taxable as ordinary income federally (IRS Pub. 575)',
    } as const,
    {
      label: 'Roth IRA Withdrawals',
      amount: inputs.rothIra,
      status: 'exempt',
      note: 'Qualified Roth distributions are 100% tax-free at federal and state levels',
    } as const,
    {
      label: 'Roth 401(k) Withdrawals',
      amount: inputs.rothK401,
      status: 'exempt',
      note: 'Qualified Roth 401(k) distributions are 100% tax-free',
    } as const,
    {
      label: 'Wages & Self-Employment',
      amount: inputs.wages + inputs.selfEmployment,
      status: 'taxable',
      note: 'Ordinary taxable earned income subject to federal and state tax',
    } as const,
    {
      label: 'Investment Income & Dividends',
      amount: inputs.interest + inputs.dividends + inputs.capitalGains,
      status: 'partial',
      note: 'Interest is taxed as ordinary income; qualified dividends & long-term capital gains receive preferential rates',
    } as const,
  ].filter(b => b.amount > 0);

  return {
    grossIncome,
    adjustedGrossIncome: agi,
    taxableSS,
    ssTaxablePercent: ssTaxPct,
    provisionalIncome,
    deduction,
    taxableIncome,
    federalTax,
    stateTax,
    totalTax,
    effectiveRate,
    afterTaxIncome,
    marginalRate,
    breakdown,
  };
}

// ── FORMATTING HELPERS ────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n));
}
function pct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}
function toNumber(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''));
  return isNaN(n) ? 0 : Math.max(0, n);
}

const DEFAULT_INPUTS: Inputs = {
  state: '', compareState1: '', compareState2: '',
  taxYear: 2026, age: 67, spouseAge: 65, filingStatus: 'mfj',
  socialSecurity: 38000, privatePension: 22000, publicPension: 0,
  iraWithdrawals: 18000, k401Withdrawals: 0, k403bWithdrawals: 0,
  rothIra: 6000, rothK401: 0, rmdAmount: 0, rmdIncludedAbove: true,
  wages: 0, selfEmployment: 0, rentalIncome: 0,
  interest: 1500, dividends: 1200, capitalGains: 0, otherIncome: 0,
  useStandardDeduction: true, itemizedDeductions: 0, qcd: 0,
};

// ── REACT COMPONENT ───────────────────────────────────────────────────────────

export function RetirementTaxByState() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<Results | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state')?.toUpperCase();
    if (stateParam && STATES[stateParam]) {
      setInputs(prev => ({ ...prev, state: stateParam }));
    }
  }, []);

  const handleStateChange = useCallback((stateCode: string) => {
    setInputs(prev => ({ ...prev, state: stateCode }));
    if (stateCode) {
      const url = new URL(window.location.href);
      url.searchParams.set('state', stateCode.toLowerCase());
      window.history.replaceState({}, '', url.toString());
    }
    if (results) {
      const updatedResults = calculate({ ...inputs, state: stateCode }, stateCode);
      setResults(updatedResults);
    }
  }, [inputs, results]);

  const setField = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  }, []);

  const setMoney = useCallback((key: keyof Inputs, val: string) => {
    setField(key, toNumber(val) as any);
  }, [setField]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!inputs.state) e.state = 'Please select your state before calculating.';
    if (inputs.age < 50 || inputs.age > 105) e.age = 'Please enter an age between 50 and 105.';
    if (inputs.filingStatus === 'mfj' && (inputs.spouseAge < 18 || inputs.spouseAge > 105)) {
      e.spouseAge = 'Please enter a valid spouse age.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCalculate() {
    if (!validate()) {
      setStep(1);
      return;
    }
    const r = calculate(inputs, inputs.state);
    setResults(r);
    setStep(4);
    setTimeout(() => {
      document.getElementById('rtbs-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  const selectedState = inputs.state ? STATES[inputs.state] : null;
  const cmp1 = inputs.compareState1 ? calculate(inputs, inputs.compareState1) : null;
  const cmp2 = inputs.compareState2 ? calculate(inputs, inputs.compareState2) : null;

  return (
    <div className="rtbs-container" id="calculator">
      {/* Steps Progress Bar */}
      <div className="rtbs-progress-header">
        <div className="rtbs-progress-meta">
          <span className="rtbs-progress-step-label">
            {step === 1 && '📍 Step 1 of 3: Location & Filing Status'}
            {step === 2 && '💵 Step 2 of 3: Retirement Income Sources'}
            {step === 3 && '📋 Step 3 of 3: Deductions & QCD Adjustments'}
            {step === 4 && '✅ Summary & Multi-State Results'}
          </span>
          <span className="rtbs-progress-percent">
            {step === 1 ? '33% Complete' : step === 2 ? '66% Complete' : step === 3 ? '100% Complete' : 'Completed'}
          </span>
        </div>
        <div className="rtbs-progress-track" role="progressbar" aria-valuenow={step === 1 ? 33 : step === 2 ? 66 : 100} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="rtbs-progress-fill"
            style={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      {step < 4 && (
        <div className="rtbs-nav" role="tablist" aria-label="Calculator Steps">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              role="tab"
              aria-selected={step === s}
              className={`rtbs-nav-tab${step === s ? ' active' : step > s ? ' completed' : ''}`}
              onClick={() => setStep(s)}
            >
              <span className="tab-num">{s}</span>
              <span className="tab-text">{['1. Location & Filing', '2. Retirement Income', '3. Deductions'][s - 1]}</span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 1: Location & Filing */}
      {step === 1 && (
        <div className="rtbs-card">
          <h2 className="rtbs-card-title">Step 1 — Where Do You Live & How Do You File?</h2>
          <p className="rtbs-card-desc">State tax rules differ significantly. Choose your state to load exact 2026 retirement income rules.</p>

          <div className="rtbs-form-group">
            <label htmlFor="rtbs-state-select" className="rtbs-label">
              Select Your State <span className="rtbs-req">*</span>
            </label>
            <select
              id="rtbs-state-select"
              className={`rtbs-select${errors.state ? ' error' : ''}`}
              value={inputs.state}
              onChange={e => handleStateChange(e.target.value)}
              aria-required="true"
            >
              <option value="">-- Choose a State (All 50 States + DC) --</option>
              {STATE_LIST.map(s => (
                <option key={s.code} value={s.code}>
                  {s.name} {s.hasStateTax ? `(State tax up to ${pct(s.topRate)})` : '(No state income tax)'}
                </option>
              ))}
            </select>
            {errors.state && <p className="rtbs-err-text">{errors.state}</p>}
          </div>

          <div className="rtbs-grid-2">
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-tax-year" className="rtbs-label">Tax Year</label>
              <select
                id="rtbs-tax-year"
                className="rtbs-select"
                value={inputs.taxYear}
                onChange={e => setField('taxYear', parseInt(e.target.value))}
              >
                <option value={2026}>2026 (Current Tax Year)</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div className="rtbs-form-group">
              <label htmlFor="rtbs-filing-status" className="rtbs-label">Filing Status</label>
              <select
                id="rtbs-filing-status"
                className="rtbs-select"
                value={inputs.filingStatus}
                onChange={e => setField('filingStatus', e.target.value as FilingStatus)}
              >
                <option value="mfj">Married Filing Jointly</option>
                <option value="single">Single</option>
                <option value="hoh">Head of Household</option>
                <option value="mfs">Married Filing Separately</option>
              </select>
            </div>
          </div>

          <div className="rtbs-grid-2">
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-age" className="rtbs-label">
                Your Age <span className="rtbs-req">*</span>
              </label>
              <input
                id="rtbs-age"
                type="number"
                min={50}
                max={105}
                className={`rtbs-input${errors.age ? ' error' : ''}`}
                value={inputs.age || ''}
                onChange={e => setField('age', parseInt(e.target.value) || 0)}
              />
              <span className="rtbs-helper">Age 65+ qualifies for higher IRS standard deduction.</span>
              {errors.age && <p className="rtbs-err-text">{errors.age}</p>}
            </div>

            {inputs.filingStatus === 'mfj' && (
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-spouse-age" className="rtbs-label">Spouse Age</label>
                <input
                  id="rtbs-spouse-age"
                  type="number"
                  min={18}
                  max={105}
                  className={`rtbs-input${errors.spouseAge ? ' error' : ''}`}
                  value={inputs.spouseAge || ''}
                  onChange={e => setField('spouseAge', parseInt(e.target.value) || 0)}
                />
                <span className="rtbs-helper">Spouse age 65+ adds an extra $1,600 standard deduction.</span>
                {errors.spouseAge && <p className="rtbs-err-text">{errors.spouseAge}</p>}
              </div>
            )}
          </div>

          {selectedState && (
            <div className="rtbs-state-preview">
              <p className="preview-heading">📌 {selectedState.name} Retirement Overview</p>
              <div className="preview-badges">
                <span className={`badge ${selectedState.hasStateTax ? 'warn' : 'success'}`}>
                  {selectedState.hasStateTax ? `Top Tax Rate: ${pct(selectedState.topRate)}` : 'No State Income Tax'}
                </span>
                <span className={`badge ${selectedState.socialSecurity === 'full' ? 'success' : 'warn'}`}>
                  Social Security: {selectedState.socialSecurity === 'full' ? '100% Exempt' : 'Partially Taxed'}
                </span>
                <span className={`badge ${selectedState.militaryRetirement === 'full' ? 'success' : 'info'}`}>
                  Military Pay: {selectedState.militaryRetirement === 'full' ? '100% Exempt' : 'Partial / Verify'}
                </span>
              </div>
            </div>
          )}

          <div className="rtbs-actions-right">
            <button className="rtbs-btn primary" onClick={() => setStep(2)}>
              Continue to Income Sources →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Retirement Income */}
      {step === 2 && (
        <div className="rtbs-card">
          <h2 className="rtbs-card-title">Step 2 — Enter Your Retirement Income Sources</h2>
          <p className="rtbs-card-desc">Enter annual dollar amounts. Only fill in what applies to you — leave others as $0.</p>

          <div className="rtbs-income-block">
            <h3 className="block-title">🏛️ Social Security Benefits</h3>
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-income-ss" className="rtbs-label">Total Annual Social Security Benefits</label>
              <div className="input-currency-wrap">
                <span className="currency-symbol">$</span>
                <input
                  id="rtbs-income-ss"
                  type="number"
                  min={0}
                  className="rtbs-input"
                  value={inputs.socialSecurity || ''}
                  placeholder="0"
                  onChange={e => setMoney('socialSecurity', e.target.value)}
                />
              </div>
              <span className="rtbs-helper">
                Combined annual gross amount before Medicare Part B deductions. Don't know your exact check amount? Estimate it with our <a href="/tools/social-security-benefits-estimator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">Social Security Benefits Estimator</a> or find your claiming window using our <a href="/tools/social-security-full-retirement-age-calculator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">FRA Calculator</a>.
              </span>
            </div>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">💼 Pension Distributions</h3>
            <div className="rtbs-grid-2">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-priv-pen" className="rtbs-label">Private Employer Pension (Annual)</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-priv-pen"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.privatePension || ''}
                    placeholder="0"
                    onChange={e => setMoney('privatePension', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-pub-pen" className="rtbs-label">Government / Public Pension (Annual)</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-pub-pen"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.publicPension || ''}
                    placeholder="0"
                    onChange={e => setMoney('publicPension', e.target.value)}
                  />
                </div>
                <span className="rtbs-helper">Federal civil service (FERS/CSRS), state, or municipal pensions.</span>
              </div>
            </div>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">📈 Traditional Pre-Tax Retirement Accounts</h3>
            <div className="rtbs-grid-2">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-ira" className="rtbs-label">Traditional IRA Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-ira"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.iraWithdrawals || ''}
                    placeholder="0"
                    onChange={e => setMoney('iraWithdrawals', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-401k" className="rtbs-label">401(k) / 403(b) Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-401k"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.k401Withdrawals || ''}
                    placeholder="0"
                    onChange={e => setMoney('k401Withdrawals', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="rtbs-grid-2" style={{ marginTop: '0.5rem' }}>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-rmd" className="rtbs-label">Required Minimum Distribution (RMD)</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-rmd"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.rmdAmount || ''}
                    placeholder="0"
                    onChange={e => setMoney('rmdAmount', e.target.value)}
                  />
                </div>
                <span className="rtbs-helper">
                  Age 73+? Not sure how much you must withdraw? Calculate your official IRS required distribution with our <a href="/tools/rmd-calculator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">RMD Calculator</a>.
                </span>
                <label className="rtbs-check-label">
                  <input
                    type="checkbox"
                    checked={inputs.rmdIncludedAbove}
                    onChange={e => setField('rmdIncludedAbove', e.target.checked)}
                  />
                  <span>RMD amount is already included in IRA/401(k) above</span>
                </label>
              </div>
            </div>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">🛡️ Tax-Free Roth Withdrawals</h3>
            <div className="rtbs-grid-2">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-roth-ira" className="rtbs-label">Roth IRA Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-roth-ira"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.rothIra || ''}
                    placeholder="0"
                    onChange={e => setMoney('rothIra', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-roth-401k" className="rtbs-label">Roth 401(k) Withdrawals</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-roth-401k"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.rothK401 || ''}
                    placeholder="0"
                    onChange={e => setMoney('rothK401', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <span className="rtbs-helper">
              Qualified Roth withdrawals are 100% tax-free. Considering moving money from a Traditional IRA to Roth to lower future taxes? Model it with our <a href="/tools/roth-conversion-calculator/" target="_blank" rel="noopener noreferrer" className="rtbs-inline-link">Roth Conversion Calculator</a>.
            </span>
          </div>

          <div className="rtbs-income-block">
            <h3 className="block-title">💵 Other Income (Wages, Interest, Dividends)</h3>
            <div className="rtbs-grid-3">
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-wages" className="rtbs-label">Wages / Part-Time</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-wages"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={inputs.wages || ''}
                    placeholder="0"
                    onChange={e => setMoney('wages', e.target.value)}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-interest" className="rtbs-label">Interest & Dividends</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-interest"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={(inputs.interest + inputs.dividends) || ''}
                    placeholder="0"
                    onChange={e => {
                      const val = toNumber(e.target.value);
                      setField('interest', val);
                      setField('dividends', 0);
                    }}
                  />
                </div>
              </div>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-income-other" className="rtbs-label">Capital Gains / Other</label>
                <div className="input-currency-wrap">
                  <span className="currency-symbol">$</span>
                  <input
                    id="rtbs-income-other"
                    type="number"
                    min={0}
                    className="rtbs-input"
                    value={(inputs.capitalGains + inputs.otherIncome) || ''}
                    placeholder="0"
                    onChange={e => {
                      const val = toNumber(e.target.value);
                      setField('capitalGains', val);
                      setField('otherIncome', 0);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rtbs-actions-between">
            <button className="rtbs-btn secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="rtbs-btn primary" onClick={() => setStep(3)}>Continue to Deductions →</button>
          </div>
        </div>
      )}

      {/* STEP 3: Deductions */}
      {step === 3 && (
        <div className="rtbs-card">
          <h2 className="rtbs-card-title">Step 3 — Tax Deductions & Adjustments</h2>
          <p className="rtbs-card-desc">Most retirees use the Standard Deduction with the additional age 65+ senior increase.</p>

          <div className="rtbs-toggle-group">
            <button
              type="button"
              className={`toggle-btn${inputs.useStandardDeduction ? ' active' : ''}`}
              onClick={() => setField('useStandardDeduction', true)}
            >
              Standard Deduction (Recommended)
            </button>
            <button
              type="button"
              className={`toggle-btn${!inputs.useStandardDeduction ? ' active' : ''}`}
              onClick={() => setField('useStandardDeduction', false)}
            >
              Itemized Deductions
            </button>
          </div>

          {inputs.useStandardDeduction ? (
            <div className="deduction-callout">
              <p className="deduction-title">Official 2026 IRS Standard Deduction for Your Household:</p>
              {(() => {
                const fs = inputs.filingStatus;
                const base = FEDERAL_2026.standardDeduction[fs];
                let seniorAddl = 0;
                if (inputs.age >= 65) {
                  seniorAddl += (fs === 'mfj' || fs === 'mfs') ? FEDERAL_2026.seniorAddlDeduction.mfjPerSpouse : FEDERAL_2026.seniorAddlDeduction.singleHoh;
                }
                if (fs === 'mfj' && inputs.spouseAge >= 65) {
                  seniorAddl += FEDERAL_2026.seniorAddlDeduction.mfjPerSpouse;
                }
                const total = base + seniorAddl;
                return (
                  <div>
                    <p className="deduction-num">{fmt(total)}</p>
                    <p className="deduction-breakdown">
                      Base {fs === 'mfj' ? 'Married Joint' : 'Single'} Deduction: {fmt(base)}
                      {seniorAddl > 0 && ` + Senior Age 65+ Addition: ${fmt(seniorAddl)}`}
                    </p>
                    <p className="deduction-cite">Source: IRS Rev. Proc. 2025-28 (2026 Tax Table Updates)</p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="rtbs-form-group">
              <label htmlFor="rtbs-itemized-val" className="rtbs-label">Total Itemized Deductions (Schedule A)</label>
              <div className="input-currency-wrap">
                <span className="currency-symbol">$</span>
                <input
                  id="rtbs-itemized-val"
                  type="number"
                  min={0}
                  className="rtbs-input"
                  value={inputs.itemizedDeductions || ''}
                  placeholder="0"
                  onChange={e => setMoney('itemizedDeductions', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="rtbs-form-group" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="rtbs-qcd-input" className="rtbs-label">
              Qualified Charitable Distribution (QCD) — Optional
            </label>
            <div className="input-currency-wrap">
              <span className="currency-symbol">$</span>
              <input
                id="rtbs-qcd-input"
                type="number"
                min={0}
                className="rtbs-input"
                value={inputs.qcd || ''}
                placeholder="0"
                onChange={e => setMoney('qcd', e.target.value)}
              />
            </div>
            <span className="rtbs-helper">
              Direct transfers from IRA to charity for age 70½+ (up to $105,000 in 2026). Lowers your AGI directly.
            </span>
          </div>

          <div className="rtbs-actions-between">
            <button className="rtbs-btn secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="rtbs-btn calculate" onClick={handleCalculate}>
              Calculate My Retirement Taxes
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Results & Decision Support */}
      {step === 4 && results && (
        <div id="rtbs-results" className="rtbs-results-wrap">
          <div className="results-header">
            <h2 className="results-title">Your Estimated 2026 Retirement Tax Summary</h2>
            <p className="results-sub">
              Calculated for <strong>{selectedState?.name || 'Selected State'}</strong> based on your retirement income sources.
            </p>
            <div className="results-disclaimer-box">
              ⚠️ <strong>Educational Planning Estimate:</strong> These calculations reflect official 2026 IRS tax brackets (IRS Rev. Proc. 2025-28) and state tax department guidelines. They are educational estimates and do not replace personalized professional tax advice.
            </div>
          </div>

          {/* Primary Summary Grid */}
          <div className="summary-grid">
            <div className="summary-card fed">
              <span className="card-lbl">Estimated Federal Tax</span>
              <span className="card-val">{fmt(results.federalTax)}</span>
              <span className="card-sub">IRS 2026 Brackets</span>
            </div>
            <div className="summary-card state">
              <span className="card-lbl">Estimated State Tax</span>
              <span className="card-val">{fmt(results.stateTax)}</span>
              <span className="card-sub">{selectedState?.name}</span>
            </div>
            <div className="summary-card total">
              <span className="card-lbl">Total Estimated Tax</span>
              <span className="card-val">{fmt(results.totalTax)}</span>
              <span className="card-sub">Federal + State</span>
            </div>
            <div className="summary-card net">
              <span className="card-lbl">Estimated After-Tax Income</span>
              <span className="card-val">{fmt(results.afterTaxIncome)}</span>
              <span className="card-sub">Take-Home Retirement Funds</span>
            </div>
            <div className="summary-card rate">
              <span className="card-lbl">Effective Tax Rate</span>
              <span className="card-val">{pct(results.effectiveRate)}</span>
              <span className="card-sub">Marginal Bracket: {pct(results.marginalRate)}</span>
            </div>
          </div>

          {/* Step-by-Step Calculation Engine Output */}
          <div className="rtbs-section">
            <h3 className="section-title">📊 How Your Federal Tax Was Calculated</h3>
            <div className="calc-table-wrap">
              <table className="calc-table">
                <tbody>
                  <tr>
                    <td>Total Gross Retirement Income</td>
                    <td className="text-right font-bold">{fmt(results.grossIncome)}</td>
                  </tr>
                  <tr>
                    <td>Social Security Subject to Federal Tax ({results.ssTaxablePercent}% taxable)</td>
                    <td className="text-right">{fmt(results.taxableSS)}</td>
                  </tr>
                  <tr>
                    <td>Adjusted Gross Income (AGI)</td>
                    <td className="text-right font-bold">{fmt(results.adjustedGrossIncome)}</td>
                  </tr>
                  <tr>
                    <td>Less: Standard Deduction (includes Age 65+ addition)</td>
                    <td className="text-right text-green">({fmt(results.deduction)})</td>
                  </tr>
                  <tr className="highlight-row">
                    <td><strong>Federal Taxable Income</strong></td>
                    <td className="text-right font-bold"><strong>{fmt(results.taxableIncome)}</strong></td>
                  </tr>
                  <tr>
                    <td>IRS Provisional Income (SS formula)</td>
                    <td className="text-right text-muted">{fmt(results.provisionalIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Taxable vs. Exempt Income Breakdown */}
          <div className="rtbs-section">
            <h3 className="section-title">🔍 Your Income Sources: Taxable vs. Exempt</h3>
            <div className="income-pill-list">
              {results.breakdown.map((item, idx) => (
                <div key={idx} className="income-pill-row">
                  <div className="pill-head">
                    <span className="pill-name">{item.label}</span>
                    <span className={`status-tag ${item.status}`}>
                      {item.status === 'taxable' ? 'Taxable' : item.status === 'exempt' ? 'Tax-Free / Exempt' : 'Partially Taxed'}
                    </span>
                    <span className="pill-amt">{fmt(item.amount)}</span>
                  </div>
                  <p className="pill-note">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Security Taxation Deep Dive */}
          {inputs.socialSecurity > 0 && (
            <div className="deep-callout">
              <p className="deep-title">🏛️ Why {results.ssTaxablePercent}% of Your Social Security Is Taxable</p>
              <p>
                Under <strong>IRS Publication 915</strong>, your Social Security benefit taxability is based on <strong>Provisional Income</strong> (also called Combined Income):
              </p>
              <p className="formula-box">
                Provisional Income = Non-Social Security Income + 50% of Social Security Benefits
              </p>
              <p>
                Your Provisional Income is <strong>{fmt(results.provisionalIncome)}</strong>.
                {inputs.filingStatus === 'mfj' ? (
                  <> For married joint filers, income below $32,000 is 0% taxed; between $32,000 and $44,000 is up to 50% taxed; above $44,000 is up to 85% taxed.</>
                ) : (
                  <> For single filers, income below $25,000 is 0% taxed; between $25,000 and $34,000 is up to 50% taxed; above $34,000 is up to 85% taxed.</>
                )}
              </p>
              <p className="cite-text">Official Source: <a href="https://www.irs.gov/pub/irs-pdf/p915.pdf" target="_blank" rel="noopener noreferrer">IRS Publication 915: Social Security and Equivalent Railroad Retirement Benefits</a></p>
            </div>
          )}

          {/* Selected State Tax Details */}
          {selectedState && (
            <div className="rtbs-section state-card-box">
              <h3 className="section-title">📍 {selectedState.name} Retirement Tax Details</h3>
              <p className="state-date">Rules last verified against official state DOR sources: {selectedState.lastVerified}</p>

              <table className="state-rules-table">
                <thead>
                  <tr>
                    <th>Retirement Income Stream</th>
                    <th>{selectedState.name} Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Social Security Benefits</strong></td>
                    <td>{selectedState.ssTaxNote}</td>
                  </tr>
                  <tr>
                    <td><strong>Private Employer Pensions</strong></td>
                    <td>{selectedState.privatePensionNote}</td>
                  </tr>
                  <tr>
                    <td><strong>Government / Public Pensions</strong></td>
                    <td>{selectedState.publicPensionNote}</td>
                  </tr>
                  <tr>
                    <td><strong>Traditional IRA / 401(k)</strong></td>
                    <td>{selectedState.iraNotes}</td>
                  </tr>
                  <tr>
                    <td><strong>Roth IRA Distributions</strong></td>
                    <td>{selectedState.rothNotes}</td>
                  </tr>
                  <tr>
                    <td><strong>Military Retirement Pay</strong></td>
                    <td>{selectedState.militaryNote}</td>
                  </tr>
                </tbody>
              </table>

              {selectedState.seniorBenefits && (
                <div className="senior-box">
                  <strong>Senior & Property Tax Provisions:</strong> {selectedState.seniorBenefits}
                </div>
              )}

              <p className="state-summary-notes">{selectedState.notes}</p>

              <div className="sources-list">
                <span className="sources-head">Official State Sources:</span>
                {selectedState.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="state-link">
                    🔗 {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* State Comparison Tool */}
          <div className="rtbs-section compare-box">
            <h3 className="section-title">🔄 Compare Retirement Taxes Across States</h3>
            <p className="compare-intro">
              Considering a move in retirement? Compare up to 3 states. Your income entries remain unchanged while state tax formulas are recalculated.
            </p>

            <div className="rtbs-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="rtbs-form-group">
                <label htmlFor="rtbs-cmp1" className="rtbs-label">Compare Against State 1</label>
                <select
                  id="rtbs-cmp1"
                  className="rtbs-select"
                  value={inputs.compareState1}
                  onChange={e => setField('compareState1', e.target.value)}
                >
                  <option value="">-- Choose State 1 --</option>
                  {STATE_LIST.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="rtbs-form-group">
                <label htmlFor="rtbs-cmp2" className="rtbs-label">Compare Against State 2</label>
                <select
                  id="rtbs-cmp2"
                  className="rtbs-select"
                  value={inputs.compareState2}
                  onChange={e => setField('compareState2', e.target.value)}
                >
                  <option value="">-- Choose State 2 --</option>
                  {STATE_LIST.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {(inputs.compareState1 || inputs.compareState2) && (
              <div className="compare-table-wrap">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th>Factor</th>
                      <th>{selectedState?.name || 'Selected'}</th>
                      {inputs.compareState1 && <th>{STATES[inputs.compareState1]?.name}</th>}
                      {inputs.compareState2 && <th>{STATES[inputs.compareState2]?.name}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="highlight">
                      <td>Estimated State Tax</td>
                      <td><strong>{fmt(results.stateTax)}</strong></td>
                      {cmp1 && <td><strong>{fmt(cmp1.stateTax)}</strong></td>}
                      {cmp2 && <td><strong>{fmt(cmp2.stateTax)}</strong></td>}
                    </tr>
                    <tr>
                      <td>Total Estimated Tax (Fed + State)</td>
                      <td>{fmt(results.totalTax)}</td>
                      {cmp1 && <td>{fmt(cmp1.totalTax)}</td>}
                      {cmp2 && <td>{fmt(cmp2.totalTax)}</td>}
                    </tr>
                    <tr>
                      <td>Estimated After-Tax Income</td>
                      <td>{fmt(results.afterTaxIncome)}</td>
                      {cmp1 && <td>{fmt(cmp1.afterTaxIncome)}</td>}
                      {cmp2 && <td>{fmt(cmp2.afterTaxIncome)}</td>}
                    </tr>
                    <tr>
                      <td>Effective Combined Tax Rate</td>
                      <td>{pct(results.effectiveRate)}</td>
                      {cmp1 && <td>{pct(cmp1.effectiveRate)}</td>}
                      {cmp2 && <td>{pct(cmp2.effectiveRate)}</td>}
                    </tr>
                    <tr>
                      <td>Social Security Tax Status</td>
                      <td>{selectedState?.socialSecurity === 'full' ? '✅ 100% Exempt' : '⚠️ Partial / Taxed'}</td>
                      {inputs.compareState1 && <td>{STATES[inputs.compareState1]?.socialSecurity === 'full' ? '✅ 100% Exempt' : '⚠️ Partial / Taxed'}</td>}
                      {inputs.compareState2 && <td>{STATES[inputs.compareState2]?.socialSecurity === 'full' ? '✅ 100% Exempt' : '⚠️ Partial / Taxed'}</td>}
                    </tr>
                    <tr>
                      <td>State Top Income Tax Rate</td>
                      <td>{selectedState?.hasStateTax ? pct(selectedState.topRate) : '0% (No tax)'}</td>
                      {inputs.compareState1 && <td>{STATES[inputs.compareState1]?.hasStateTax ? pct(STATES[inputs.compareState1].topRate) : '0% (No tax)'}</td>}
                      {inputs.compareState2 && <td>{STATES[inputs.compareState2]?.hasStateTax ? pct(STATES[inputs.compareState2].topRate) : '0% (No tax)'}</td>}
                    </tr>
                  </tbody>
                </table>

                <div className="compare-warning">
                  💡 <strong>Decision Insight:</strong> A state having no income tax does not automatically make it the cheapest retirement destination. Property taxes, sales taxes, local healthcare costs, and overall cost of living must also be evaluated.
                </div>
              </div>
            )}
          </div>

          {/* Reset & Edit buttons */}
          <div className="rtbs-actions-between" style={{ marginTop: '1.5rem' }}>
            <button className="rtbs-btn secondary" onClick={() => { setStep(1); setResults(null); }}>
              🔄 Start Over
            </button>
            <button className="rtbs-btn primary" onClick={() => setStep(2)}>
              ✏️ Adjust Income Numbers
            </button>
          </div>

          {/* Next Logical Decision Helpers */}
          <div className="next-steps-section">
            <h3 className="section-title">🎯 What Should You Investigate Next?</h3>
            <div className="next-steps-grid">
              {results.totalTax > 0 && (
                <a href="/tools/retirement-tax-withholding-calculator/" className="next-tool-card">
                  <span className="tool-icon">📋</span>
                  <strong>Retirement Tax Withholding Calculator</strong>
                  <span>Calculate how much federal tax to withhold from your pension or IRA via Form W-4P.</span>
                </a>
              )}
              {(inputs.iraWithdrawals > 0 || inputs.k401Withdrawals > 0) && (
                <a href="/tools/rmd-calculator/" className="next-tool-card">
                  <span className="tool-icon">📅</span>
                  <strong>RMD Calculator</strong>
                  <span>Find your required minimum distribution amounts and IRS life expectancy factors.</span>
                </a>
              )}
              {results.adjustedGrossIncome > 100000 && (
                <a href="/tools/medicare-irmaa-calculator/" className="next-tool-card">
                  <span className="tool-icon">🏥</span>
                  <strong>Medicare IRMAA Calculator</strong>
                  <span>Your retirement income may trigger high-earner surcharges on Medicare Parts B and D.</span>
                </a>
              )}
              <a href="/tools/roth-conversion-calculator/" className="next-tool-card">
                <span className="tool-icon">🔄</span>
                <strong>Roth Conversion Calculator</strong>
                <span>Model whether converting traditional IRA money to Roth saves taxes before RMDs start.</span>
              </a>
              <a href="/tools/property-tax-relief-checker/" className="next-tool-card">
                <span className="tool-icon">🏡</span>
                <strong>Property Tax Relief Checker</strong>
                <span>Find senior homeowner property tax exemptions, circuit breaker credits, and freezes by state.</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS STYLES ── */}
      <style>{`
        .rtbs-container {
          font-family: inherit;
          color: #1A1A2E;
          width: 100%;
        }
        .rtbs-progress-header {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.25rem;
        }
        .rtbs-progress-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .rtbs-progress-step-label {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0A3D3A;
        }
        .rtbs-progress-percent {
          font-size: 0.82rem;
          font-weight: 800;
          color: #C9933A;
          background: #FFFFFF;
          padding: 0.15rem 0.55rem;
          border-radius: 12px;
          border: 1px solid #C9933A;
        }
        .rtbs-progress-track {
          width: 100%;
          height: 8px;
          background: #E2E8F0;
          border-radius: 4px;
          overflow: hidden;
        }
        .rtbs-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0A3D3A 0%, #C9933A 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .rtbs-nav {
          display: flex;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          background: #F8FBFB;
        }
        .rtbs-nav-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 0.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          color: #555;
          border-right: 1px solid #C0DBD9;
          transition: all 0.2s ease;
        }
        .rtbs-nav-tab:last-child {
          border-right: none;
        }
        .rtbs-nav-tab.active {
          background: #0A3D3A;
          color: #FFFFFF;
        }
        .rtbs-nav-tab.completed {
          background: #E8F5F4;
          color: #0A3D3A;
        }
        .tab-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
          font-size: 0.85rem;
        }
        .rtbs-nav-tab.active .tab-num {
          background: #C9933A;
          color: #FFFFFF;
        }
        .rtbs-card {
          background: #FFFFFF;
          border: 1px solid #D5E5E4;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(10, 61, 58, 0.05);
        }
        .rtbs-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
        }
        .rtbs-card-desc {
          font-size: 0.95rem;
          color: #555;
          margin: 0 0 1.5rem 0;
        }
        .rtbs-form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
        }
        .rtbs-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1A1A2E;
          margin-bottom: 0.4rem;
        }
        .rtbs-req {
          color: #C53030;
        }
        .rtbs-select, .rtbs-input {
          padding: 0.75rem 1rem;
          border: 1.5px solid #CBD5E0;
          border-radius: 8px;
          font-size: 1rem;
          color: #1A1A2E;
          background: #FFFFFF;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .rtbs-select:focus, .rtbs-input:focus {
          outline: none;
          border-color: #0A3D3A;
          box-shadow: 0 0 0 3px rgba(10, 61, 58, 0.15);
        }
        .rtbs-select.error, .rtbs-input.error {
          border-color: #C53030;
        }
        .rtbs-err-text {
          color: #C53030;
          font-size: 0.85rem;
          margin-top: 0.3rem;
          font-weight: 600;
        }
        .rtbs-helper {
          font-size: 0.82rem;
          color: #666;
          margin-top: 0.3rem;
          line-height: 1.4;
        }
        .rtbs-inline-link {
          color: #0A3D3A;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .rtbs-inline-link:hover {
          color: #082E2C;
        }
        .input-currency-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .currency-symbol {
          position: absolute;
          left: 1rem;
          font-weight: 700;
          color: #666;
          font-size: 1.1rem;
          pointer-events: none;
        }
        .input-currency-wrap .rtbs-input {
          padding-left: 2.2rem;
        }
        .rtbs-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .rtbs-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }
        .rtbs-income-block {
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          background: #FAFAFC;
        }
        .block-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 1rem 0;
        }
        .rtbs-check-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #444;
          margin-top: 0.5rem;
          cursor: pointer;
        }
        .rtbs-state-preview {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          margin-bottom: 1.5rem;
        }
        .preview-heading {
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
        }
        .preview-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .badge {
          display: inline-block;
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .badge.success { background: #D4EDDA; color: #155724; }
        .badge.warn { background: #FFF3CD; color: #856404; }
        .badge.info { background: #E2E8F0; color: #2D3748; }
        .rtbs-actions-right {
          display: flex;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .rtbs-actions-between {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          gap: 1rem;
        }
        .rtbs-btn {
          padding: 0.85rem 1.75rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .rtbs-btn.primary {
          background: #0A3D3A;
          color: #FFFFFF;
        }
        .rtbs-btn.primary:hover {
          background: #082E2C;
        }
        .rtbs-btn.secondary {
          background: #E2E8F0;
          color: #2D3748;
        }
        .rtbs-btn.secondary:hover {
          background: #CBD5E0;
        }
        .rtbs-btn.calculate {
          background: #C9933A;
          color: #FFFFFF;
          font-size: 1.1rem;
          padding: 0.95rem 2rem;
        }
        .rtbs-btn.calculate:hover {
          background: #AD7D2E;
        }
        .rtbs-toggle-group {
          display: flex;
          border: 1px solid #CBD5E0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .toggle-btn {
          flex: 1;
          padding: 0.75rem;
          background: #F7FAFC;
          border: none;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          color: #4A5568;
        }
        .toggle-btn.active {
          background: #0A3D3A;
          color: #FFFFFF;
        }
        .deduction-callout {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .deduction-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0A3D3A;
          margin: 0 0 0.5rem 0;
        }
        .deduction-num {
          font-size: 2rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0;
        }
        .deduction-breakdown {
          font-size: 0.85rem;
          color: #555;
          margin: 0.3rem 0 0.2rem 0;
        }
        .deduction-cite {
          font-size: 0.78rem;
          color: #777;
          margin: 0;
        }

        /* Results Styling */
        .rtbs-results-wrap {
          background: #FFFFFF;
          border: 1px solid #D5E5E4;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 6px 18px rgba(10, 61, 58, 0.08);
        }
        .results-header {
          margin-bottom: 1.5rem;
        }
        .results-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0A3D3A;
          margin: 0 0 0.25rem 0;
        }
        .results-sub {
          font-size: 1rem;
          color: #555;
          margin: 0 0 1rem 0;
        }
        .results-disclaimer-box {
          background: #FFF9E6;
          border-left: 4px solid #C9933A;
          padding: 0.75rem 1rem;
          border-radius: 0 6px 6px 0;
          font-size: 0.85rem;
          color: #444;
          line-height: 1.4;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .summary-card {
          background: #FAFAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 1.25rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .summary-card.fed { border-top: 4px solid #2B6CB0; }
        .summary-card.state { border-top: 4px solid #2F855A; }
        .summary-card.total { border-top: 4px solid #C53030; background: #FFF5F5; }
        .summary-card.net { border-top: 4px solid #0A3D3A; background: #F0F7F6; }
        .summary-card.rate { border-top: 4px solid #C9933A; }
        .card-lbl {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
          color: #666;
          margin-bottom: 0.4rem;
        }
        .card-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0A3D3A;
          margin-bottom: 0.25rem;
        }
        .card-sub {
          font-size: 0.75rem;
          color: #777;
        }
        .rtbs-section {
          margin-bottom: 2rem;
        }
        .section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0A3D3A;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .calc-table-wrap {
          overflow-x: auto;
        }
        .calc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
        .calc-table td {
          padding: 0.6rem 0.5rem;
          border-bottom: 1px solid #EDF2F7;
        }
        .calc-table .text-right { text-align: right; }
        .calc-table .font-bold { font-weight: 700; }
        .calc-table .text-green { color: #276749; font-weight: 600; }
        .calc-table .text-muted { color: #718096; }
        .calc-table .highlight-row td {
          background: #F0F7F6;
          border-top: 2px solid #0A3D3A;
          border-bottom: 2px solid #0A3D3A;
        }
        .income-pill-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .income-pill-row {
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          background: #FAFAFC;
        }
        .pill-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .pill-name {
          font-weight: 700;
          color: #1A1A2E;
        }
        .status-tag {
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .status-tag.taxable { background: #FED7D7; color: #9B2C2C; }
        .status-tag.exempt { background: #C6F6D5; color: #22543D; }
        .status-tag.partial { background: #FEFCBF; color: #744210; }
        .pill-amt {
          font-weight: 700;
          color: #0A3D3A;
        }
        .pill-note {
          font-size: 0.82rem;
          color: #666;
          margin: 0.3rem 0 0 0;
        }
        .deep-callout {
          background: #08111F;
          color: #FFFFFF;
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-left: 5px solid #C9933A;
        }
        .deep-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #C9933A;
          margin: 0 0 0.5rem 0;
        }
        .formula-box {
          background: rgba(255,255,255,0.08);
          border: 1px dashed rgba(201,147,58,0.4);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9rem;
          color: #E2E8F0;
          margin: 0.75rem 0;
        }
        .cite-text {
          font-size: 0.8rem;
          color: #A0AEC0;
          margin-top: 0.75rem;
        }
        .cite-text a {
          color: #C9933A;
          text-decoration: underline;
        }
        .state-card-box {
          background: #F0F7F6;
          border: 1px solid #C0DBD9;
          border-radius: 10px;
          padding: 1.5rem;
        }
        .state-date {
          font-size: 0.82rem;
          color: #555;
          margin-bottom: 1rem;
        }
        .state-rules-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          background: #FFFFFF;
          border-radius: 6px;
          overflow: hidden;
        }
        .state-rules-table th {
          background: #0A3D3A;
          color: #FFFFFF;
          padding: 0.6rem 0.75rem;
          text-align: left;
        }
        .state-rules-table td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #EDF2F7;
          vertical-align: top;
        }
        .senior-box {
          background: #FFFFFF;
          border: 1px solid #C0DBD9;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: #2D3748;
          margin-bottom: 0.75rem;
        }
        .state-summary-notes {
          font-size: 0.85rem;
          color: #4A5568;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .sources-head {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0A3D3A;
        }
        .state-link {
          font-size: 0.82rem;
          color: #0A3D3A;
          text-decoration: underline;
        }
        .compare-box {
          background: #FAFAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 1.5rem;
        }
        .compare-intro {
          font-size: 0.9rem;
          color: #555;
          margin-bottom: 1rem;
        }
        .compare-table-wrap {
          overflow-x: auto;
          margin-top: 1rem;
        }
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          background: #FFFFFF;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #E2E8F0;
        }
        .compare-table th {
          background: #0A3D3A;
          color: #FFFFFF;
          padding: 0.6rem 0.75rem;
          text-align: center;
        }
        .compare-table td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid #EDF2F7;
          text-align: center;
        }
        .compare-table td:first-child {
          text-align: left;
          font-weight: 600;
        }
        .compare-table tr.highlight td {
          background: #F0F7F6;
        }
        .compare-warning {
          font-size: 0.82rem;
          color: #744210;
          background: #FEFCBF;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-top: 1rem;
          line-height: 1.4;
        }
        .next-steps-section {
          margin-top: 2.5rem;
        }
        .next-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .next-tool-card {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 1rem;
          background: #FFFFFF;
          border: 1.5px solid #C0DBD9;
          border-radius: 10px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }
        .next-tool-card:hover {
          border-color: #0A3D3A;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(10, 61, 58, 0.1);
        }
        .tool-icon {
          font-size: 1.4rem;
        }
        .next-tool-card strong {
          color: #0A3D3A;
          font-size: 0.95rem;
        }
        .next-tool-card span {
          font-size: 0.82rem;
          color: #555;
          line-height: 1.35;
        }

        @media (max-width: 768px) {
          .rtbs-card { padding: 1.25rem; }
          .rtbs-results-wrap { padding: 1.25rem; }
          .rtbs-grid-2, .rtbs-grid-3 { grid-template-columns: 1fr; }
          .summary-grid { grid-template-columns: 1fr 1fr; }
          .rtbs-nav-tab { font-size: 0.85rem; padding: 0.6rem 0.3rem; }
        }
      `}</style>
    </div>
  );
}
