/**
 * stateRetirementTaxes.ts
 * Dated Dataset: State Retirement Tax Rules, Rates & Exclusions
 *
 * NOTE: All state rates and exemptions below are dated as of August 2026.
 * Per master accuracy requirements, all state data is marked as UNVERIFIED FOR 2026
 * (several states changed tax rates and exemption laws during 2024-2026 legislative sessions).
 * Needs human verification against official 2026 state revenue department publications.
 */

export type ExemptLevel = 'full' | 'partial' | 'none' | 'verify';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface RetirementExclusion {
  description: string;
  minAge?: number | null;
  cap?: number | null;
}

export interface StateRecord {
  state: string;
  name: string;
  code: string;
  hasStateTax: boolean;
  topRate: number;
  flatRate: boolean;
  brackets: { single: TaxBracket[]; mfj: TaxBracket[] } | null;
  ssTreatment: ExemptLevel;
  socialSecurity: ExemptLevel;
  ssTaxNote: string;
  retirementExclusion: RetirementExclusion;
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
  sourceUrl: string;
  sources: { label: string; url: string }[];
  lastCheckedDate: string;
  lastVerified: string;
  status: 'unverified-2026';
}

export const STATE_RETIREMENT_TAX_DATA: Record<string, StateRecord> = {
  "AL": {
    "state": "Alabama",
    "name": "Alabama",
    "code": "AL",
    "hasStateTax": true,
    "topRate": 0.05,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 500,
          "rate": 0.02
        },
        {
          "min": 500,
          "max": 3000,
          "rate": 0.04
        },
        {
          "min": 3000,
          "max": null,
          "rate": 0.05
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 1000,
          "rate": 0.02
        },
        {
          "min": 1000,
          "max": 6000,
          "rate": 0.04
        },
        {
          "min": 6000,
          "max": null,
          "rate": 0.05
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Alabama does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Age 65+ personal exemption of $1,500 (single) or $3,000 (joint).",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "Alabama fully exempts defined-benefit private pension income.",
    "publicPension": "full",
    "publicPensionNote": "Alabama fully exempts state, local, and federal government pension income.",
    "iraWithdrawals": "none",
    "iraNotes": "Alabama taxes traditional IRA and 401(k) withdrawals as ordinary income.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Alabama fully exempts military retirement pay.",
    "seniorBenefits": "Age 65+ personal exemption of $1,500 (single) or $3,000 (joint).",
    "notes": "Alabama is very friendly for pensions and Social Security, but traditional IRA/401(k) distributions are taxable.",
    "sourceUrl": "https://www.revenue.alabama.gov/individual-corporate/individual-income-tax/",
    "sources": [
      {
        "label": "Alabama Department of Revenue",
        "url": "https://www.revenue.alabama.gov/individual-corporate/individual-income-tax/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "AK": {
    "state": "Alaska",
    "name": "Alaska",
    "code": "AK",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Alaska has no state income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state income tax or state sales tax. Annual Alaska Permanent Fund Dividend.",
    "notes": "Alaska has no state individual income tax. All retirement income is completely exempt from state tax.",
    "sourceUrl": "https://tax.alaska.gov/",
    "sources": [
      {
        "label": "Alaska Department of Revenue",
        "url": "https://tax.alaska.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "AZ": {
    "state": "Arizona",
    "name": "Arizona",
    "code": "AZ",
    "hasStateTax": true,
    "topRate": 0.025,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Arizona does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Low flat 2.5% rate applies across all taxable income.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are subject to Arizona flat 2.5% income tax.",
    "publicPension": "partial",
    "publicPensionNote": "Up to $2,500 exclusion for Arizona state and federal government pensions.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA and 401(k) withdrawals are taxed at the flat 2.5% rate.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are not taxable.",
    "militaryRetirement": "full",
    "militaryNote": "Arizona fully exempts military retirement pay.",
    "seniorBenefits": "Low flat 2.5% rate applies across all taxable income.",
    "notes": "Arizona transitioned to a flat 2.5% tax rate. Social Security and military retirement are fully exempt.",
    "sourceUrl": "https://azdor.gov/individual-income-tax-information",
    "sources": [
      {
        "label": "Arizona Department of Revenue",
        "url": "https://azdor.gov/individual-income-tax-information"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "AR": {
    "state": "Arkansas",
    "name": "Arkansas",
    "code": "AR",
    "hasStateTax": true,
    "topRate": 0.039,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 4299,
          "rate": 0.02
        },
        {
          "min": 4299,
          "max": 8499,
          "rate": 0.04
        },
        {
          "min": 8499,
          "max": null,
          "rate": 0.039
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 4299,
          "rate": 0.02
        },
        {
          "min": 4299,
          "max": 8499,
          "rate": 0.04
        },
        {
          "min": 8499,
          "max": null,
          "rate": 0.039
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Arkansas does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "$6,000 retirement income exclusion per taxpayer.",
      "minAge": null,
      "cap": 6000
    },
    "privatePension": "partial",
    "privatePensionNote": "Up to $6,000 exclusion per person from employer retirement plans.",
    "publicPension": "partial",
    "publicPensionNote": "Up to $6,000 exclusion per person for public pensions.",
    "iraWithdrawals": "partial",
    "iraNotes": "Traditional IRA distributions qualify for the $6,000 exclusion; remainder taxed.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Arkansas fully exempts military retirement pay.",
    "seniorBenefits": "$6,000 retirement income exclusion per taxpayer. Low top rate of 3.9%.",
    "notes": "Arkansas top income tax rate reduced to 3.9%. Social Security and military retirement fully exempt.",
    "sourceUrl": "https://www.dfa.arkansas.gov/income-tax/",
    "sources": [
      {
        "label": "Arkansas Department of Finance and Administration",
        "url": "https://www.dfa.arkansas.gov/income-tax/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "CA": {
    "state": "California",
    "name": "California",
    "code": "CA",
    "hasStateTax": true,
    "topRate": 0.133,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 10756,
          "rate": 0.01
        },
        {
          "min": 10756,
          "max": 25499,
          "rate": 0.02
        },
        {
          "min": 25499,
          "max": 40245,
          "rate": 0.04
        },
        {
          "min": 40245,
          "max": 55866,
          "rate": 0.06
        },
        {
          "min": 55866,
          "max": 70606,
          "rate": 0.08
        },
        {
          "min": 70606,
          "max": 360659,
          "rate": 0.093
        },
        {
          "min": 360659,
          "max": 432787,
          "rate": 0.103
        },
        {
          "min": 432787,
          "max": 721314,
          "rate": 0.113
        },
        {
          "min": 721314,
          "max": 1000000,
          "rate": 0.123
        },
        {
          "min": 1000000,
          "max": null,
          "rate": 0.133
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 21512,
          "rate": 0.01
        },
        {
          "min": 21512,
          "max": 50998,
          "rate": 0.02
        },
        {
          "min": 50998,
          "max": 80490,
          "rate": 0.04
        },
        {
          "min": 80490,
          "max": 111732,
          "rate": 0.06
        },
        {
          "min": 111732,
          "max": 141212,
          "rate": 0.08
        },
        {
          "min": 141212,
          "max": 721318,
          "rate": 0.093
        },
        {
          "min": 721318,
          "max": 865574,
          "rate": 0.103
        },
        {
          "min": 865574,
          "max": 1000000,
          "rate": 0.113
        },
        {
          "min": 1000000,
          "max": 1442628,
          "rate": 0.123
        },
        {
          "min": 1442628,
          "max": null,
          "rate": 0.133
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "California does not tax Social Security benefits (R&TC §17087.7).",
    "retirementExclusion": {
      "description": "Senior exemption tax credit ($144 for age 65+).",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are fully taxable at California state income tax rates (up to 13.3%).",
    "publicPension": "none",
    "publicPensionNote": "CalPERS, CalSTRS, and government pensions are fully taxable in California.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA and 401(k) withdrawals are fully taxable at regular state rates.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are not taxable.",
    "militaryRetirement": "none",
    "militaryNote": "California taxes military retirement pay as ordinary income.",
    "seniorBenefits": "Senior exemption tax credit ($144 for age 65+).",
    "notes": "California has the highest top state income tax rate (13.3%). While Social Security is exempt, all other retirement income is fully taxed.",
    "sourceUrl": "https://www.ftb.ca.gov/file/personal/filing-status/index.html",
    "sources": [
      {
        "label": "California Franchise Tax Board",
        "url": "https://www.ftb.ca.gov/file/personal/filing-status/index.html"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "CO": {
    "state": "Colorado",
    "name": "Colorado",
    "code": "CO",
    "hasStateTax": true,
    "topRate": 0.044,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "Colorado allows taxpayers age 65 and older to deduct all federally taxable Social Security benefits from state income.",
    "retirementExclusion": {
      "description": "Age 65+ can deduct all federally taxable Social Security and up to $24,000 of other retirement income.",
      "minAge": 65,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Included in the $24,000 retirement income deduction for age 65+ ($20,000 for age 55–64).",
    "publicPension": "partial",
    "publicPensionNote": "Included in the $24,000 retirement income deduction.",
    "iraWithdrawals": "partial",
    "iraNotes": "Traditional IRA/401(k) withdrawals qualify for the $24,000 deduction for age 65+.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Colorado fully exempts military retirement pay.",
    "seniorBenefits": "$24,000 retirement income deduction per person for age 65+. Flat 4.4% rate.",
    "notes": "Colorado flat 4.4% rate with a $24,000 retirement income exclusion per person age 65+.",
    "sourceUrl": "https://tax.colorado.gov/sites/tax/files/documents/Income_Tax_Topics_Social_Security_Benefits.pdf",
    "sources": [
      {
        "label": "Colorado Department of Revenue",
        "url": "https://tax.colorado.gov/sites/tax/files/documents/Income_Tax_Topics_Social_Security_Benefits.pdf"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "CT": {
    "state": "Connecticut",
    "name": "Connecticut",
    "code": "CT",
    "hasStateTax": true,
    "topRate": 0.0699,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 10000,
          "rate": 0.03
        },
        {
          "min": 10000,
          "max": 50000,
          "rate": 0.05
        },
        {
          "min": 50000,
          "max": 100000,
          "rate": 0.055
        },
        {
          "min": 100000,
          "max": 200000,
          "rate": 0.06
        },
        {
          "min": 200000,
          "max": 250000,
          "rate": 0.065
        },
        {
          "min": 250000,
          "max": 500000,
          "rate": 0.069
        },
        {
          "min": 500000,
          "max": null,
          "rate": 0.0699
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 20000,
          "rate": 0.03
        },
        {
          "min": 20000,
          "max": 100000,
          "rate": 0.05
        },
        {
          "min": 100000,
          "max": 200000,
          "rate": 0.055
        },
        {
          "min": 200000,
          "max": 400000,
          "rate": 0.06
        },
        {
          "min": 400000,
          "max": 500000,
          "rate": 0.065
        },
        {
          "min": 500000,
          "max": 1000000,
          "rate": 0.069
        },
        {
          "min": 1000000,
          "max": null,
          "rate": 0.0699
        }
      ]
    },
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "100% exempt if AGI is under $75,000 (single) or $100,000 (joint). Above limits, 75% is exempt.",
    "retirementExclusion": {
      "description": "Generous Social Security exemptions for middle-income retirees.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Connecticut provides a phased-in exemption for pension and annuity income for AGI under thresholds.",
    "publicPension": "partial",
    "publicPensionNote": "Public pensions qualify for the state pension/annuity exemption.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA distributions are generally taxable at state rates.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Connecticut fully exempts military retirement pay.",
    "seniorBenefits": "Generous Social Security exemptions for middle-income retirees.",
    "notes": "Connecticut exempts Social Security for most middle-income seniors, but IRA distributions and high incomes face progressive state taxes.",
    "sourceUrl": "https://portal.ct.gov/DRS",
    "sources": [
      {
        "label": "Connecticut Department of Revenue Services",
        "url": "https://portal.ct.gov/DRS"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "DE": {
    "state": "Delaware",
    "name": "Delaware",
    "code": "DE",
    "hasStateTax": true,
    "topRate": 0.066,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 2000,
          "rate": 0
        },
        {
          "min": 2000,
          "max": 5000,
          "rate": 0.022
        },
        {
          "min": 5000,
          "max": 10000,
          "rate": 0.039
        },
        {
          "min": 10000,
          "max": 20000,
          "rate": 0.048
        },
        {
          "min": 20000,
          "max": 25000,
          "rate": 0.052
        },
        {
          "min": 25000,
          "max": 60000,
          "rate": 0.055
        },
        {
          "min": 60000,
          "max": null,
          "rate": 0.066
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 2000,
          "rate": 0
        },
        {
          "min": 2000,
          "max": 5000,
          "rate": 0.022
        },
        {
          "min": 5000,
          "max": 10000,
          "rate": 0.039
        },
        {
          "min": 10000,
          "max": 20000,
          "rate": 0.048
        },
        {
          "min": 20000,
          "max": 25000,
          "rate": 0.052
        },
        {
          "min": 25000,
          "max": 60000,
          "rate": 0.055
        },
        {
          "min": 60000,
          "max": null,
          "rate": 0.066
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Delaware does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Pension exclusion of up to $12,500 per person for age 60+ ($2,000 under age 60).",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Pension exclusion of up to $12,500 per person for age 60+ ($2,000 under age 60).",
    "publicPension": "partial",
    "publicPensionNote": "Included in the $12,500 exclusion for age 60+.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA/401(k) withdrawals qualify for the $12,500 exclusion for age 60+.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Delaware fully exempts military retirement pay.",
    "seniorBenefits": "$12,500 exclusion per person for age 60+. No state sales tax.",
    "notes": "Delaware exempts Social Security and provides $12,500/person retirement income exclusion for age 60+.",
    "sourceUrl": "https://revenue.delaware.gov/individuals/",
    "sources": [
      {
        "label": "Delaware Division of Revenue",
        "url": "https://revenue.delaware.gov/individuals/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "FL": {
    "state": "Florida",
    "name": "Florida",
    "code": "FL",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Florida has no state individual income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state income tax. Homestead property tax exemption with additional senior exemptions.",
    "notes": "Florida has no state income tax on any form of retirement income. One of the most popular retirement destinations.",
    "sourceUrl": "https://floridarevenue.com/",
    "sources": [
      {
        "label": "Florida Department of Revenue",
        "url": "https://floridarevenue.com/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "GA": {
    "state": "Georgia",
    "name": "Georgia",
    "code": "GA",
    "hasStateTax": true,
    "topRate": 0.0549,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Georgia does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "$65,000 exclusion per person age 65+ ($130,000 married filing jointly).",
      "minAge": 65,
      "cap": 65000
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement income exclusion of up to $65,000 per person age 65+ ($35,000 for ages 62–64).",
    "publicPension": "partial",
    "publicPensionNote": "Included in the $65,000 per person exclusion for age 65+.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA/401(k) withdrawals qualify for the $65,000 exclusion for age 65+.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Georgia fully exempts military retirement pay.",
    "seniorBenefits": "$65,000 per person retirement income exclusion for age 65+ ($130,000 for married couple both 65+).",
    "notes": "Georgia flat rate (5.49% in 2024–2026). The $65,000 exclusion per person means most retirees pay $0 state income tax.",
    "sourceUrl": "https://dor.georgia.gov/retirement-income",
    "sources": [
      {
        "label": "Georgia Department of Revenue",
        "url": "https://dor.georgia.gov/retirement-income"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "HI": {
    "state": "Hawaii",
    "name": "Hawaii",
    "code": "HI",
    "hasStateTax": true,
    "topRate": 0.11,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 2400,
          "rate": 0.014
        },
        {
          "min": 2400,
          "max": 4800,
          "rate": 0.032
        },
        {
          "min": 4800,
          "max": 9600,
          "rate": 0.055
        },
        {
          "min": 9600,
          "max": 14400,
          "rate": 0.064
        },
        {
          "min": 14400,
          "max": 19200,
          "rate": 0.068
        },
        {
          "min": 19200,
          "max": 24000,
          "rate": 0.072
        },
        {
          "min": 24000,
          "max": 36000,
          "rate": 0.076
        },
        {
          "min": 36000,
          "max": 48000,
          "rate": 0.079
        },
        {
          "min": 48000,
          "max": 150000,
          "rate": 0.0825
        },
        {
          "min": 150000,
          "max": 175000,
          "rate": 0.09
        },
        {
          "min": 175000,
          "max": 200000,
          "rate": 0.1
        },
        {
          "min": 200000,
          "max": null,
          "rate": 0.11
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 4800,
          "rate": 0.014
        },
        {
          "min": 4800,
          "max": 9600,
          "rate": 0.032
        },
        {
          "min": 9600,
          "max": 19200,
          "rate": 0.055
        },
        {
          "min": 19200,
          "max": 28800,
          "rate": 0.064
        },
        {
          "min": 28800,
          "max": 38400,
          "rate": 0.068
        },
        {
          "min": 38400,
          "max": 48000,
          "rate": 0.072
        },
        {
          "min": 48000,
          "max": 72000,
          "rate": 0.076
        },
        {
          "min": 72000,
          "max": 96000,
          "rate": 0.079
        },
        {
          "min": 96000,
          "max": 300000,
          "rate": 0.0825
        },
        {
          "min": 300000,
          "max": 350000,
          "rate": 0.09
        },
        {
          "min": 350000,
          "max": 400000,
          "rate": 0.1
        },
        {
          "min": 400000,
          "max": null,
          "rate": 0.11
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Hawaii does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Pensions and Social Security exempt; high general excise tax on goods.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "Hawaii fully exempts qualifying employer-funded defined benefit pensions.",
    "publicPension": "full",
    "publicPensionNote": "Hawaii fully exempts state, local, and federal government pensions.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA and 401(k) withdrawals funded with employee contributions are taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Hawaii fully exempts military retirement pay.",
    "seniorBenefits": "Pensions and Social Security exempt; high general excise tax on goods.",
    "notes": "Hawaii exempts employer pensions, Social Security, and military retirement, but IRA/401(k) withdrawals are taxed at high rates.",
    "sourceUrl": "https://tax.hawaii.gov/",
    "sources": [
      {
        "label": "Hawaii Department of Taxation",
        "url": "https://tax.hawaii.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "ID": {
    "state": "Idaho",
    "name": "Idaho",
    "code": "ID",
    "hasStateTax": true,
    "topRate": 0.058,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Idaho does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Grocery tax credit of $120–$140 per person. Flat 5.8% income tax rate.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement income deduction available for taxpayers age 65+ with qualifying retirement benefits.",
    "publicPension": "partial",
    "publicPensionNote": "State and federal public pensions qualify for Idaho retirement deduction.",
    "iraWithdrawals": "none",
    "iraNotes": "IRA/401(k) withdrawals are taxed at Idaho flat 5.8% rate.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Idaho fully exempts military retirement pay.",
    "seniorBenefits": "Grocery tax credit of $120–$140 per person. Flat 5.8% income tax rate.",
    "notes": "Idaho flat 5.8% rate. Social Security and military retirement are exempt.",
    "sourceUrl": "https://tax.idaho.gov/",
    "sources": [
      {
        "label": "Idaho State Tax Commission",
        "url": "https://tax.idaho.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "IL": {
    "state": "Illinois",
    "name": "Illinois",
    "code": "IL",
    "hasStateTax": true,
    "topRate": 0.0495,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Illinois does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "100% exempts qualified pensions, Traditional IRAs, and 401(k) distributions.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "Illinois fully exempts qualified employer pension plans from state income tax.",
    "publicPension": "full",
    "publicPensionNote": "Illinois fully exempts state, local, and federal government pensions.",
    "iraWithdrawals": "full",
    "iraNotes": "Illinois fully exempts distributions from qualified retirement plans (IRA, 401k, 403b).",
    "rothWithdrawals": "full",
    "rothNotes": "Roth distributions are fully exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Illinois fully exempts military retirement pay.",
    "seniorBenefits": "Illinois exempts virtually all retirement income. Flat 4.95% rate only touches non-retirement income.",
    "notes": "Illinois is one of the most retirement-income-friendly states: Social Security, pensions, 401(k), and IRA withdrawals are 100% state tax-free.",
    "sourceUrl": "https://tax.illinois.gov/individuals/individual-income-tax/retirement.html",
    "sources": [
      {
        "label": "Illinois Department of Revenue",
        "url": "https://tax.illinois.gov/individuals/individual-income-tax/retirement.html"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "IN": {
    "state": "Indiana",
    "name": "Indiana",
    "code": "IN",
    "hasStateTax": true,
    "topRate": 0.0305,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Indiana does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Low flat state rate (3.05%). Note that county taxes add 1%–3% across Indiana counties.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are subject to Indiana 3.05% flat tax plus county income tax.",
    "publicPension": "partial",
    "publicPensionNote": "Up to $16,000 exclusion for military and certain public safety pensions.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) withdrawals are taxed at 3.05% flat rate + county tax.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Indiana fully exempts military retirement pay.",
    "seniorBenefits": "Low flat state rate (3.05%). Note that county taxes add 1%–3% across Indiana counties.",
    "notes": "Indiana has a low state income tax (3.05%), but local county income taxes apply in every county. Social Security is exempt.",
    "sourceUrl": "https://www.in.gov/dor/",
    "sources": [
      {
        "label": "Indiana Department of Revenue",
        "url": "https://www.in.gov/dor/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "IA": {
    "state": "Iowa",
    "name": "Iowa",
    "code": "IA",
    "hasStateTax": true,
    "topRate": 0.038,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Iowa fully exempts Social Security benefits.",
    "retirementExclusion": {
      "description": "Residents age 55+ fully exempt from state tax on retirement income.",
      "minAge": 55,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "Iowa fully exempts all retirement income (pensions, IRA, 401k, RMDs) for taxpayers age 55+.",
    "publicPension": "full",
    "publicPensionNote": "Fully exempt for age 55+.",
    "iraWithdrawals": "full",
    "iraNotes": "Fully exempt for age 55+.",
    "rothWithdrawals": "full",
    "rothNotes": "Fully exempt for age 55+.",
    "militaryRetirement": "full",
    "militaryNote": "Fully exempt for age 55+.",
    "seniorBenefits": "100% exemption on all retirement income for anyone 55 and older.",
    "notes": "Iowa enacted full retirement income exemption for taxpayers age 55 and older. State rate transitions to flat 3.8%.",
    "sourceUrl": "https://tax.iowa.gov/",
    "sources": [
      {
        "label": "Iowa Department of Revenue",
        "url": "https://tax.iowa.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "KS": {
    "state": "KS",
    "name": "KS",
    "code": "KS",
    "hasStateTax": true,
    "topRate": 0.057,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 15000,
          "rate": 0.031
        },
        {
          "min": 15000,
          "max": 30000,
          "rate": 0.0525
        },
        {
          "min": 30000,
          "max": null,
          "rate": 0.057
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 30000,
          "rate": 0.031
        },
        {
          "min": 30000,
          "max": 60000,
          "rate": 0.0525
        },
        {
          "min": 60000,
          "max": null,
          "rate": 0.057
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "KS fully exempts Social Security benefits.",
    "retirementExclusion": {
      "description": "Social Security benefits are completely exempt from KS state income tax.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are fully taxable in KS.",
    "publicPension": "full",
    "publicPensionNote": "KS public employee pensions (KPERS) and federal civil service pensions are fully exempt.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) withdrawals are fully taxable at KS state rates.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "KS fully exempts military retirement pay.",
    "seniorBenefits": "Social Security benefits are completely exempt from KS state income tax.",
    "notes": "KS repealed state income tax on Social Security. Public pensions are exempt; private retirement is taxed.",
    "sourceUrl": "https://www.ksrevenue.gov/",
    "sources": [
      {
        "label": "KS Department of Revenue",
        "url": "https://www.ksrevenue.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "KY": {
    "state": "Kentucky",
    "name": "Kentucky",
    "code": "KY",
    "hasStateTax": true,
    "topRate": 0.04,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Kentucky does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Excludes up to $31,110 of retirement income per person.",
      "minAge": null,
      "cap": 31110
    },
    "privatePension": "partial",
    "privatePensionNote": "Pension exclusion of up to $31,110 per person from qualifying retirement plans.",
    "publicPension": "partial",
    "publicPensionNote": "Qualifies for the $31,110 per person retirement income exclusion.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA/401(k) withdrawals count toward the $31,110 exclusion; remainder taxed at 4%.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Kentucky fully exempts military retirement pay.",
    "seniorBenefits": "$31,110 exclusion per person covers most moderate-income retirement distributions.",
    "notes": "Kentucky flat rate 4%. Social Security and military pay exempt; up to $31,110/person other retirement income excluded.",
    "sourceUrl": "https://revenue.ky.gov/",
    "sources": [
      {
        "label": "Kentucky Department of Revenue",
        "url": "https://revenue.ky.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "LA": {
    "state": "Louisiana",
    "name": "Louisiana",
    "code": "LA",
    "hasStateTax": true,
    "topRate": 0.03,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Louisiana does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "$6,000 exemption for age 65+. State pensions 100% exempt. Flat 3% rate.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Exclusion of up to $6,000 per person age 65+ from retirement distributions.",
    "publicPension": "full",
    "publicPensionNote": "Louisiana state and local government employee pensions are fully exempt.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA withdrawals above the $6,000 exemption for age 65+ are taxed at flat 3%.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Louisiana fully exempts military retirement pay.",
    "seniorBenefits": "$6,000 exemption for age 65+. State pensions 100% exempt. Flat 3% rate.",
    "notes": "Louisiana flattened to 3.0% rate. Public pensions, Social Security, and military retirement are fully exempt.",
    "sourceUrl": "https://revenue.louisiana.gov/",
    "sources": [
      {
        "label": "Louisiana Department of Revenue",
        "url": "https://revenue.louisiana.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "ME": {
    "state": "Maine",
    "name": "Maine",
    "code": "ME",
    "hasStateTax": true,
    "topRate": 0.0715,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 24500,
          "rate": 0.058
        },
        {
          "min": 24500,
          "max": 58050,
          "rate": 0.0675
        },
        {
          "min": 58050,
          "max": null,
          "rate": 0.0715
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 49050,
          "rate": 0.058
        },
        {
          "min": 49050,
          "max": 116100,
          "rate": 0.0675
        },
        {
          "min": 116100,
          "max": null,
          "rate": 0.0715
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Maine does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Pension deduction up to $30,000 per person. Property tax fairness credit.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Pension income deduction up to $30,000 per person for qualifying retirement plans (reduced by Social Security).",
    "publicPension": "partial",
    "publicPensionNote": "Qualifies for Maine pension income deduction.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA/401(k) withdrawals qualify for the pension deduction up to statutory limits.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Maine fully exempts military retirement pay.",
    "seniorBenefits": "Pension deduction up to $30,000 per person. Property tax fairness credit.",
    "notes": "Maine exempts Social Security and military retirement. Pension deduction reduces taxable retirement distributions.",
    "sourceUrl": "https://www.maine.gov/revenue/",
    "sources": [
      {
        "label": "Maine Revenue Services",
        "url": "https://www.maine.gov/revenue/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "MD": {
    "state": "Maryland",
    "name": "Maryland",
    "code": "MD",
    "hasStateTax": true,
    "topRate": 0.0575,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 1000,
          "rate": 0.02
        },
        {
          "min": 1000,
          "max": 2000,
          "rate": 0.03
        },
        {
          "min": 2000,
          "max": 3000,
          "rate": 0.04
        },
        {
          "min": 3000,
          "max": 100000,
          "rate": 0.0475
        },
        {
          "min": 100000,
          "max": 125000,
          "rate": 0.05
        },
        {
          "min": 125000,
          "max": 150000,
          "rate": 0.0525
        },
        {
          "min": 150000,
          "max": 250000,
          "rate": 0.055
        },
        {
          "min": 250000,
          "max": null,
          "rate": 0.0575
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 1000,
          "rate": 0.02
        },
        {
          "min": 1000,
          "max": 2000,
          "rate": 0.03
        },
        {
          "min": 2000,
          "max": 3000,
          "rate": 0.04
        },
        {
          "min": 3000,
          "max": 150000,
          "rate": 0.0475
        },
        {
          "min": 150000,
          "max": 175000,
          "rate": 0.05
        },
        {
          "min": 175000,
          "max": 225000,
          "rate": 0.0525
        },
        {
          "min": 225000,
          "max": 300000,
          "rate": 0.055
        },
        {
          "min": 300000,
          "max": null,
          "rate": 0.0575
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Maryland does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Maryland pension exclusion of up to $36,200 for taxpayers age 65+ (reduced by Social Security).",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Maryland pension exclusion of up to $36,200 for taxpayers age 65+ (reduced by Social Security).",
    "publicPension": "partial",
    "publicPensionNote": "Included in Maryland pension exclusion.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA withdrawals generally do not qualify for the pension exclusion (401k/pension plans do).",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Maryland fully exempts military retirement pay for age 55+.",
    "seniorBenefits": "Pension exclusion for 65+. Note that county income taxes add 2.25%–3.20% across MD counties.",
    "notes": "Maryland exempts Social Security. Pension exclusion up to $36,200 for 65+, but county income taxes add 2.25%–3.20%.",
    "sourceUrl": "https://www.marylandtaxes.gov/",
    "sources": [
      {
        "label": "Maryland Comptroller",
        "url": "https://www.marylandtaxes.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "MA": {
    "state": "Massachusetts",
    "name": "Massachusetts",
    "code": "MA",
    "hasStateTax": true,
    "topRate": 0.05,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Massachusetts does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Flat 5.0% rate. Senior Circuit Breaker property tax credit available.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions and 401(k) withdrawals are taxable at flat 5.0% rate.",
    "publicPension": "full",
    "publicPensionNote": "Massachusetts state, local, and federal government pensions are fully exempt.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA withdrawals are taxable in Massachusetts.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Massachusetts fully exempts military retirement pay.",
    "seniorBenefits": "Flat 5.0% rate. Senior Circuit Breaker property tax credit available.",
    "notes": "Massachusetts flat 5% tax. Social Security, public pensions, and military retirement are exempt; private pensions and IRAs are taxed.",
    "sourceUrl": "https://www.mass.gov/orgs/massachusetts-department-of-revenue",
    "sources": [
      {
        "label": "Massachusetts Department of Revenue",
        "url": "https://www.mass.gov/orgs/massachusetts-department-of-revenue"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "MI": {
    "state": "Michigan",
    "name": "Michigan",
    "code": "MI",
    "hasStateTax": true,
    "topRate": 0.0425,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Michigan does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Restored retirement deduction for retirees. Flat 4.25% state rate.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement deduction phasing back in: taxpayers can choose between older rules and expanded standard deduction options.",
    "publicPension": "partial",
    "publicPensionNote": "Public pensions qualify under Michigan retirement deduction rules.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA distributions qualify under the restored Michigan retirement deduction.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Michigan fully exempts military retirement pay.",
    "seniorBenefits": "Restored retirement deduction for retirees. Flat 4.25% state rate.",
    "notes": "Michigan \"Rollback the Retirement Tax\" law restores generous retirement deductions for seniors.",
    "sourceUrl": "https://www.michigan.gov/taxes/iit/retirement-and-pension-benefits",
    "sources": [
      {
        "label": "Michigan Department of Treasury",
        "url": "https://www.michigan.gov/taxes/iit/retirement-and-pension-benefits"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "MN": {
    "state": "Minnesota",
    "name": "Minnesota",
    "code": "MN",
    "hasStateTax": true,
    "topRate": 0.0985,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 31690,
          "rate": 0.0535
        },
        {
          "min": 31690,
          "max": 104090,
          "rate": 0.068
        },
        {
          "min": 104090,
          "max": 193240,
          "rate": 0.0785
        },
        {
          "min": 193240,
          "max": null,
          "rate": 0.0985
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 46330,
          "rate": 0.0535
        },
        {
          "min": 46330,
          "max": 184040,
          "rate": 0.068
        },
        {
          "min": 184040,
          "max": 321450,
          "rate": 0.0785
        },
        {
          "min": 321450,
          "max": null,
          "rate": 0.0985
        }
      ]
    },
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "Minnesota exempts Social Security for single filers with AGI under $82,190 (MFJ under $105,380). Phased out for higher incomes.",
    "retirementExclusion": {
      "description": "Social Security subtraction for lower- and middle-income retirees.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are fully taxable at Minnesota state rates (up to 9.85%).",
    "publicPension": "none",
    "publicPensionNote": "Public pensions are taxable in Minnesota.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) withdrawals are fully taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Minnesota fully exempts military retirement pay.",
    "seniorBenefits": "Social Security subtraction for lower- and middle-income retirees.",
    "notes": "Minnesota has high top rates (9.85%). Social Security is exempt for middle incomes, but pensions and IRAs are fully taxed.",
    "sourceUrl": "https://www.revenue.state.mn.us/social-security-subtraction",
    "sources": [
      {
        "label": "Minnesota Department of Revenue",
        "url": "https://www.revenue.state.mn.us/social-security-subtraction"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "MS": {
    "state": "Mississippi",
    "name": "Mississippi",
    "code": "MS",
    "hasStateTax": true,
    "topRate": 0.047,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Mississippi does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "100% exempts qualified pensions, Traditional IRAs, and 401(k) distributions.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "Mississippi fully exempts qualified retirement plan distributions (pensions, 401k, 403b).",
    "publicPension": "full",
    "publicPensionNote": "Mississippi fully exempts state, local, and federal government pensions.",
    "iraWithdrawals": "full",
    "iraNotes": "Traditional IRA distributions from qualified plans are 100% exempt in Mississippi.",
    "rothWithdrawals": "full",
    "rothNotes": "Roth distributions are 100% exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Mississippi fully exempts military retirement pay.",
    "seniorBenefits": "Complete exemption on all retirement income. Low 4.7% flat rate on other income.",
    "notes": "Mississippi is one of the most tax-friendly states for retirees: zero state tax on pensions, IRAs, 401(k)s, and Social Security.",
    "sourceUrl": "https://www.dor.ms.gov/individual/retirement",
    "sources": [
      {
        "label": "Mississippi Department of Revenue",
        "url": "https://www.dor.ms.gov/individual/retirement"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "MO": {
    "state": "Missouri",
    "name": "Missouri",
    "code": "MO",
    "hasStateTax": true,
    "topRate": 0.047,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 1207,
          "rate": 0.015
        },
        {
          "min": 1207,
          "max": 2414,
          "rate": 0.02
        },
        {
          "min": 2414,
          "max": 3621,
          "rate": 0.025
        },
        {
          "min": 3621,
          "max": 4828,
          "rate": 0.03
        },
        {
          "min": 4828,
          "max": 6035,
          "rate": 0.035
        },
        {
          "min": 6035,
          "max": 7242,
          "rate": 0.04
        },
        {
          "min": 7242,
          "max": 8449,
          "rate": 0.045
        },
        {
          "min": 8449,
          "max": null,
          "rate": 0.047
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 1207,
          "rate": 0.015
        },
        {
          "min": 1207,
          "max": 2414,
          "rate": 0.02
        },
        {
          "min": 2414,
          "max": 3621,
          "rate": 0.025
        },
        {
          "min": 3621,
          "max": 4828,
          "rate": 0.03
        },
        {
          "min": 4828,
          "max": 6035,
          "rate": 0.035
        },
        {
          "min": 6035,
          "max": 7242,
          "rate": 0.04
        },
        {
          "min": 7242,
          "max": 8449,
          "rate": 0.045
        },
        {
          "min": 8449,
          "max": null,
          "rate": 0.047
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Missouri fully exempts Social Security benefits as of 2024.",
    "retirementExclusion": {
      "description": "Social Security 100% exempt. Top rate lowered to 4.7%. Senior property tax credit.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Missouri provides a private pension deduction for taxpayers under AGI limits ($85k single / $100k MFJ).",
    "publicPension": "partial",
    "publicPensionNote": "Public pensions qualify for Missouri pension exemption under income limits.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA distributions qualify for the Missouri retirement deduction if AGI is below threshold.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Missouri fully exempts military retirement pay.",
    "seniorBenefits": "Social Security 100% exempt. Top rate lowered to 4.7%. Senior property tax credit.",
    "notes": "Missouri eliminated Social Security tax in 2024 and lowered top income tax rate to 4.7%.",
    "sourceUrl": "https://dor.mo.gov/taxation/individual/tax-types/individual-income-tax/",
    "sources": [
      {
        "label": "Missouri Department of Revenue",
        "url": "https://dor.mo.gov/taxation/individual/tax-types/individual-income-tax/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "MT": {
    "state": "Montana",
    "name": "Montana",
    "code": "MT",
    "hasStateTax": true,
    "topRate": 0.059,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 20500,
          "rate": 0.047
        },
        {
          "min": 20500,
          "max": null,
          "rate": 0.059
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 41000,
          "rate": 0.047
        },
        {
          "min": 41000,
          "max": null,
          "rate": 0.059
        }
      ]
    },
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "Montana taxes Social Security following federal rules, with a small state subtraction for lower incomes.",
    "retirementExclusion": {
      "description": "Elderly homeowner/renter credit available. Top rate simplified to 5.9%.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Montana allows up to $4,640 pension/annuity deduction (phased out for higher incomes).",
    "publicPension": "partial",
    "publicPensionNote": "Included in the $4,640 pension deduction.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) withdrawals are generally taxable at state rates.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Montana fully exempts military retirement pay (up to $5,500 base, with broader exemptions enacted).",
    "seniorBenefits": "Elderly homeowner/renter credit available. Top rate simplified to 5.9%.",
    "notes": "Montana taxes Social Security largely conforming to federal rules. Top state rate is 5.9%.",
    "sourceUrl": "https://mtrevenue.gov/taxes/individual-income-tax/",
    "sources": [
      {
        "label": "Montana Department of Revenue",
        "url": "https://mtrevenue.gov/taxes/individual-income-tax/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "NE": {
    "state": "Nebraska",
    "name": "Nebraska",
    "code": "NE",
    "hasStateTax": true,
    "topRate": 0.0399,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 3700,
          "rate": 0.0246
        },
        {
          "min": 3700,
          "max": 22170,
          "rate": 0.0351
        },
        {
          "min": 22170,
          "max": 35730,
          "rate": 0.0501
        },
        {
          "min": 35730,
          "max": null,
          "rate": 0.0399
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 7390,
          "rate": 0.0246
        },
        {
          "min": 7390,
          "max": 44350,
          "rate": 0.0351
        },
        {
          "min": 44350,
          "max": 71460,
          "rate": 0.0501
        },
        {
          "min": 71460,
          "max": null,
          "rate": 0.0399
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Nebraska fully exempts Social Security benefits as of 2024.",
    "retirementExclusion": {
      "description": "Social Security 100% exempt. Top tax rate lowered to 3.99%.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are taxable in Nebraska at regular state rates.",
    "publicPension": "none",
    "publicPensionNote": "Public pensions are taxable in Nebraska.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions are taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Nebraska fully exempts military retirement pay.",
    "seniorBenefits": "Social Security 100% exempt. Top tax rate lowered to 3.99%.",
    "notes": "Nebraska fully phased out its tax on Social Security. Military retirement is also exempt.",
    "sourceUrl": "https://revenue.nebraska.gov/individuals",
    "sources": [
      {
        "label": "Nebraska Department of Revenue",
        "url": "https://revenue.nebraska.gov/individuals"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "NV": {
    "state": "Nevada",
    "name": "Nevada",
    "code": "NV",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Nevada has no state income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state individual income tax. Property tax senior assistance available.",
    "notes": "Nevada has no state income tax. All retirement income is completely exempt from state tax.",
    "sourceUrl": "https://tax.nv.gov/",
    "sources": [
      {
        "label": "Nevada Department of Taxation",
        "url": "https://tax.nv.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "NH": {
    "state": "New Hampshire",
    "name": "New Hampshire",
    "code": "NH",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "New Hampshire has no individual earned income tax and repealed its Interest & Dividends tax as of Jan 1, 2025.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax on pensions.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax on pensions.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax on IRA distributions.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax on Roth distributions.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax on military retirement.",
    "seniorBenefits": "Zero state income tax. (Property taxes are comparatively higher).",
    "notes": "New Hampshire fully repealed its Interest and Dividends tax in 2025. There is no state income tax on any retirement income.",
    "sourceUrl": "https://www.revenue.nh.gov/",
    "sources": [
      {
        "label": "New Hampshire Department of Revenue Administration",
        "url": "https://www.revenue.nh.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "NJ": {
    "state": "New Jersey",
    "name": "New Jersey",
    "code": "NJ",
    "hasStateTax": true,
    "topRate": 0.1075,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 20000,
          "rate": 0.014
        },
        {
          "min": 20000,
          "max": 35000,
          "rate": 0.0175
        },
        {
          "min": 35000,
          "max": 40000,
          "rate": 0.035
        },
        {
          "min": 40000,
          "max": 75000,
          "rate": 0.0553
        },
        {
          "min": 75000,
          "max": 500000,
          "rate": 0.0637
        },
        {
          "min": 500000,
          "max": 1000000,
          "rate": 0.0897
        },
        {
          "min": 1000000,
          "max": null,
          "rate": 0.1075
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 20000,
          "rate": 0.014
        },
        {
          "min": 20000,
          "max": 50000,
          "rate": 0.0175
        },
        {
          "min": 50000,
          "max": 70000,
          "rate": 0.0245
        },
        {
          "min": 70000,
          "max": 80000,
          "rate": 0.035
        },
        {
          "min": 80000,
          "max": 150000,
          "rate": 0.0553
        },
        {
          "min": 150000,
          "max": 500000,
          "rate": 0.0637
        },
        {
          "min": 500000,
          "max": 1000000,
          "rate": 0.0897
        },
        {
          "min": 1000000,
          "max": null,
          "rate": 0.1075
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "New Jersey does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Retirement income exclusion up to $100,000 (joint) or $75,000 (single) for taxpayers age 62+ with gross income ≤ $100,000.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement income exclusion up to $100,000 (joint) or $75,000 (single) for taxpayers age 62+ with gross income ≤ $100,000.",
    "publicPension": "partial",
    "publicPensionNote": "Qualifies for NJ retirement income exclusion.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA/401(k) withdrawals qualify for the retirement exclusion if income is under $100,000.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "New Jersey fully exempts military retirement pay.",
    "seniorBenefits": "Senior Freeze property tax program. Generous retirement exclusion for income under $100k.",
    "notes": "New Jersey exempts Social Security and offers up to $100,000 retirement exclusion for taxpayers with total income under $100,000.",
    "sourceUrl": "https://www.state.nj.us/treasury/taxation/senior_citizens.shtml",
    "sources": [
      {
        "label": "New Jersey Division of Taxation",
        "url": "https://www.state.nj.us/treasury/taxation/senior_citizens.shtml"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "NM": {
    "state": "New Mexico",
    "name": "New Mexico",
    "code": "NM",
    "hasStateTax": true,
    "topRate": 0.059,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 5500,
          "rate": 0.017
        },
        {
          "min": 5500,
          "max": 11000,
          "rate": 0.032
        },
        {
          "min": 11000,
          "max": 16000,
          "rate": 0.047
        },
        {
          "min": 16000,
          "max": 210000,
          "rate": 0.049
        },
        {
          "min": 210000,
          "max": null,
          "rate": 0.059
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 8000,
          "rate": 0.017
        },
        {
          "min": 8000,
          "max": 16000,
          "rate": 0.032
        },
        {
          "min": 16000,
          "max": 24000,
          "rate": 0.047
        },
        {
          "min": 24000,
          "max": 315000,
          "rate": 0.049
        },
        {
          "min": 315000,
          "max": null,
          "rate": 0.059
        }
      ]
    },
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "Social Security benefits are fully deductible for taxpayers with AGI below $100,000 (single) or $150,000 (married filing jointly).",
    "retirementExclusion": {
      "description": "Social Security fully deductible below $100,000 AGI single / $150,000 joint.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are taxable at New Mexico state rates.",
    "publicPension": "none",
    "publicPensionNote": "Public pensions are taxable in New Mexico.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions are taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "New Mexico fully exempts military retirement pay.",
    "seniorBenefits": "Social Security exempt for most middle-income retirees. Low-income comprehensive rebate.",
    "notes": "New Mexico exempts Social Security for retirees under $100k/$150k AGI. Military retirement is fully exempt.",
    "sourceUrl": "https://www.tax.newmexico.gov/",
    "sources": [
      {
        "label": "New Mexico Taxation and Revenue Department",
        "url": "https://www.tax.newmexico.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "NY": {
    "state": "New York",
    "name": "New York",
    "code": "NY",
    "hasStateTax": true,
    "topRate": 0.109,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 17150,
          "rate": 0.04
        },
        {
          "min": 17150,
          "max": 23600,
          "rate": 0.045
        },
        {
          "min": 23600,
          "max": 27900,
          "rate": 0.0525
        },
        {
          "min": 27900,
          "max": 161550,
          "rate": 0.055
        },
        {
          "min": 161550,
          "max": 323200,
          "rate": 0.06
        },
        {
          "min": 323200,
          "max": 2155350,
          "rate": 0.0685
        },
        {
          "min": 2155350,
          "max": 5000000,
          "rate": 0.0965
        },
        {
          "min": 5000000,
          "max": 25000000,
          "rate": 0.103
        },
        {
          "min": 25000000,
          "max": null,
          "rate": 0.109
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 27900,
          "rate": 0.04
        },
        {
          "min": 27900,
          "max": 43000,
          "rate": 0.045
        },
        {
          "min": 43000,
          "max": 161550,
          "rate": 0.0525
        },
        {
          "min": 161550,
          "max": 323200,
          "rate": 0.059
        },
        {
          "min": 323200,
          "max": 2155350,
          "rate": 0.0685
        },
        {
          "min": 2155350,
          "max": 5000000,
          "rate": 0.0965
        },
        {
          "min": 5000000,
          "max": 25000000,
          "rate": 0.103
        },
        {
          "min": 25000000,
          "max": null,
          "rate": 0.109
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "New York does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Excludes up to $20,000 per person age 59½+ on pension and IRA distributions.",
      "minAge": 59.5,
      "cap": 20000
    },
    "privatePension": "partial",
    "privatePensionNote": "Pension and annuity exclusion of up to $20,000 per person age 59½+ from employer plans.",
    "publicPension": "full",
    "publicPensionNote": "New York State, local, and federal government pensions are 100% exempt from NY tax.",
    "iraWithdrawals": "partial",
    "iraNotes": "Traditional IRA distributions qualify for the $20,000 per person exclusion for age 59½+.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "New York fully exempts military retirement pay.",
    "seniorBenefits": "$20,000 per person retirement exclusion. 100% exemption for NY public pensions. Enhanced STAR property tax relief.",
    "notes": "New York exempts Social Security and all NY public pensions. Up to $20,000/person private retirement income is exempt for age 59½+.",
    "sourceUrl": "https://www.tax.ny.gov/pit/pubs/pub36.htm",
    "sources": [
      {
        "label": "New York Department of Taxation and Finance",
        "url": "https://www.tax.ny.gov/pit/pubs/pub36.htm"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "NC": {
    "state": "North Carolina",
    "name": "North Carolina",
    "code": "NC",
    "hasStateTax": true,
    "topRate": 0.045,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "North Carolina does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Flat 4.5% rate (moving to 3.99% by 2027). Social Security and military pay exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions and 401(k) distributions are taxed at NC flat rate (4.5% in 2025–2026).",
    "publicPension": "partial",
    "publicPensionNote": "Bailey Settlement provides full exemption for retirees with 5+ years of state/federal service prior to Aug 12, 1989.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions are taxed at flat state rate.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "North Carolina fully exempts military retirement pay.",
    "seniorBenefits": "Flat 4.5% rate (moving to 3.99% by 2027). Social Security and military pay exempt.",
    "notes": "NC flat rate is 4.5% with planned reductions. Social Security and military retirement are exempt; IRAs and pensions are taxed.",
    "sourceUrl": "https://www.ncdor.gov/taxes-forms/individual-income-tax/retirement-income",
    "sources": [
      {
        "label": "North Carolina Department of Revenue",
        "url": "https://www.ncdor.gov/taxes-forms/individual-income-tax/retirement-income"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "ND": {
    "state": "North Dakota",
    "name": "North Dakota",
    "code": "ND",
    "hasStateTax": true,
    "topRate": 0.025,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 44725,
          "rate": 0.011
        },
        {
          "min": 44725,
          "max": 225975,
          "rate": 0.0204
        },
        {
          "min": 225975,
          "max": null,
          "rate": 0.025
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 74750,
          "rate": 0.011
        },
        {
          "min": 74750,
          "max": 275100,
          "rate": 0.0204
        },
        {
          "min": 275100,
          "max": null,
          "rate": 0.025
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "North Dakota fully exempts Social Security benefits.",
    "retirementExclusion": {
      "description": "Among the lowest state income tax rates in the nation (top rate 2.5%). Social Security exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions taxed at very low state rates (0%–2.5%).",
    "publicPension": "none",
    "publicPensionNote": "Public pensions taxed at very low state rates.",
    "iraWithdrawals": "none",
    "iraNotes": "IRA withdrawals taxed at low state rates.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "North Dakota fully exempts military retirement pay.",
    "seniorBenefits": "Among the lowest state income tax rates in the nation (top rate 2.5%). Social Security exempt.",
    "notes": "North Dakota has very low rates (top 2.5%) and exempts Social Security and military retirement.",
    "sourceUrl": "https://www.tax.nd.gov/",
    "sources": [
      {
        "label": "North Dakota Office of State Tax Commissioner",
        "url": "https://www.tax.nd.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "OH": {
    "state": "Ohio",
    "name": "Ohio",
    "code": "OH",
    "hasStateTax": true,
    "topRate": 0.0399,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 26050,
          "rate": 0
        },
        {
          "min": 26050,
          "max": 100000,
          "rate": 0.0276
        },
        {
          "min": 100000,
          "max": 115300,
          "rate": 0.0333
        },
        {
          "min": 115300,
          "max": null,
          "rate": 0.0399
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 26050,
          "rate": 0
        },
        {
          "min": 26050,
          "max": 100000,
          "rate": 0.0276
        },
        {
          "min": 100000,
          "max": 115300,
          "rate": 0.0333
        },
        {
          "min": 115300,
          "max": null,
          "rate": 0.0399
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Ohio does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "0% tax on first $26,050 of income. Senior citizen credit of $50 for age 65+. (Municipal taxes may apply).",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement income credit of up to $200 for taxpayers with modified AGI under $100,000.",
    "publicPension": "partial",
    "publicPensionNote": "Qualifies for Ohio retirement income credit.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions are taxed at state rates, offset by credits if eligible.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Ohio fully exempts military retirement pay.",
    "seniorBenefits": "0% tax on first $26,050 of income. Senior citizen credit of $50 for age 65+. (Municipal taxes may apply).",
    "notes": "Ohio has 0% tax on first $26,050 of income. Social Security and military pay exempt.",
    "sourceUrl": "https://tax.ohio.gov/",
    "sources": [
      {
        "label": "Ohio Department of Taxation",
        "url": "https://tax.ohio.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "OK": {
    "state": "Oklahoma",
    "name": "Oklahoma",
    "code": "OK",
    "hasStateTax": true,
    "topRate": 0.0475,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 1000,
          "rate": 0.005
        },
        {
          "min": 1000,
          "max": 2500,
          "rate": 0.01
        },
        {
          "min": 2500,
          "max": 3750,
          "rate": 0.02
        },
        {
          "min": 3750,
          "max": 4900,
          "rate": 0.03
        },
        {
          "min": 4900,
          "max": 7200,
          "rate": 0.04
        },
        {
          "min": 7200,
          "max": null,
          "rate": 0.0475
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 2000,
          "rate": 0.005
        },
        {
          "min": 2000,
          "max": 5000,
          "rate": 0.01
        },
        {
          "min": 5000,
          "max": 7500,
          "rate": 0.02
        },
        {
          "min": 7500,
          "max": 9800,
          "rate": 0.03
        },
        {
          "min": 9800,
          "max": 12200,
          "rate": 0.04
        },
        {
          "min": 12200,
          "max": null,
          "rate": 0.0475
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Oklahoma does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Retirement exclusion of up to $10,000 per person from qualifying retirement plans.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement exclusion of up to $10,000 per person from qualifying retirement plans.",
    "publicPension": "partial",
    "publicPensionNote": "Oklahoma government pensions qualify for 100% exemption or $10,000 exclusion.",
    "iraWithdrawals": "partial",
    "iraNotes": "Traditional IRA/401(k) withdrawals qualify for the $10,000 per person exclusion.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Oklahoma fully exempts military retirement pay.",
    "seniorBenefits": "$10,000 retirement exclusion per person. Social Security and military retirement 100% exempt.",
    "notes": "Oklahoma top rate 4.75%. Social Security and military pay exempt; $10k/person exclusion on pensions and IRAs.",
    "sourceUrl": "https://oklahoma.gov/tax.html",
    "sources": [
      {
        "label": "Oklahoma Tax Commission",
        "url": "https://oklahoma.gov/tax.html"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "OR": {
    "state": "Oregon",
    "name": "Oregon",
    "code": "OR",
    "hasStateTax": true,
    "topRate": 0.099,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 4050,
          "rate": 0.0475
        },
        {
          "min": 4050,
          "max": 10200,
          "rate": 0.0675
        },
        {
          "min": 10200,
          "max": 125000,
          "rate": 0.0875
        },
        {
          "min": 125000,
          "max": null,
          "rate": 0.099
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 8100,
          "rate": 0.0475
        },
        {
          "min": 8100,
          "max": 20400,
          "rate": 0.0675
        },
        {
          "min": 20400,
          "max": 250000,
          "rate": 0.0875
        },
        {
          "min": 250000,
          "max": null,
          "rate": 0.099
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Oregon does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "No state sales tax in Oregon. Retirement income credit for lower-income seniors.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are fully taxable in Oregon (rates up to 9.9%).",
    "publicPension": "partial",
    "publicPensionNote": "Federal and Oregon public pension income earned before Oct 1, 1991 may be exempt.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions are fully taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "partial",
    "militaryNote": "Military retirement pay earned before Oct 1, 1991 is exempt; remainder may qualify for subtraction.",
    "seniorBenefits": "No state sales tax in Oregon. Retirement income credit for lower-income seniors.",
    "notes": "Oregon has high state income taxes (up to 9.9%), but no state sales tax. Social Security is exempt; IRAs and private pensions are taxed.",
    "sourceUrl": "https://www.oregon.gov/dor/",
    "sources": [
      {
        "label": "Oregon Department of Revenue",
        "url": "https://www.oregon.gov/dor/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "PA": {
    "state": "Pennsylvania",
    "name": "Pennsylvania",
    "code": "PA",
    "hasStateTax": true,
    "topRate": 0.0307,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Pennsylvania does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "100% exempts qualified pensions, Traditional IRAs, and 401(k) distributions.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "Pennsylvania fully exempts distributions from qualified employer retirement plans for retirees age 59½+.",
    "publicPension": "full",
    "publicPensionNote": "Pennsylvania fully exempts state, local, and federal government pensions.",
    "iraWithdrawals": "full",
    "iraNotes": "Pennsylvania fully exempts IRA and 401(k) distributions for retirees age 59½+.",
    "rothWithdrawals": "full",
    "rothNotes": "Roth distributions are fully exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Pennsylvania fully exempts military retirement pay.",
    "seniorBenefits": "Complete exemption on all qualified retirement income for age 59½+. Property Tax/Rent Rebate Program.",
    "notes": "Pennsylvania is one of the most retiree-friendly tax states in America: Social Security, pensions, 401(k)s, and IRAs are 100% exempt from state tax.",
    "sourceUrl": "https://www.revenue.pa.gov/TaxTypes/PIT/Pages/Retirement.aspx",
    "sources": [
      {
        "label": "Pennsylvania Department of Revenue",
        "url": "https://www.revenue.pa.gov/TaxTypes/PIT/Pages/Retirement.aspx"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "RI": {
    "state": "Rhode Island",
    "name": "Rhode Island",
    "code": "RI",
    "hasStateTax": true,
    "topRate": 0.0599,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 77450,
          "rate": 0.0375
        },
        {
          "min": 77450,
          "max": 176050,
          "rate": 0.0475
        },
        {
          "min": 176050,
          "max": null,
          "rate": 0.0599
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 77450,
          "rate": 0.0375
        },
        {
          "min": 77450,
          "max": 176050,
          "rate": 0.0475
        },
        {
          "min": 176050,
          "max": null,
          "rate": 0.0599
        }
      ]
    },
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "Rhode Island exempts Social Security for retirees at Full Retirement Age with AGI under $101,000 (single) or $126,250 (joint). Above limits, SS is taxed.",
    "retirementExclusion": {
      "description": "Pension modification allows up to $20,000 exclusion for taxpayers at FRA with AGI under thresholds.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Pension modification allows up to $20,000 exclusion for taxpayers at FRA with AGI under thresholds.",
    "publicPension": "partial",
    "publicPensionNote": "Qualifies for the Rhode Island pension modification.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA distributions are generally taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Rhode Island fully exempts military retirement pay.",
    "seniorBenefits": "Social Security and pension exclusions for retirees at Full Retirement Age with AGI below state limits.",
    "notes": "Rhode Island taxes Social Security for retirees with income above state limits. Military retirement is fully exempt.",
    "sourceUrl": "https://tax.ri.gov/",
    "sources": [
      {
        "label": "Rhode Island Division of Taxation",
        "url": "https://tax.ri.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "SC": {
    "state": "South Carolina",
    "name": "South Carolina",
    "code": "SC",
    "hasStateTax": true,
    "topRate": 0.062,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 3460,
          "rate": 0
        },
        {
          "min": 3460,
          "max": 17330,
          "rate": 0.03
        },
        {
          "min": 17330,
          "max": null,
          "rate": 0.062
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 3460,
          "rate": 0
        },
        {
          "min": 3460,
          "max": 17330,
          "rate": 0.03
        },
        {
          "min": 17330,
          "max": null,
          "rate": 0.062
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "South Carolina does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Excludes up to $10,000 per person age 65+ on retirement income.",
      "minAge": 65,
      "cap": 10000
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement income deduction of up to $10,000 per person age 65+ ($3,000 for under 65).",
    "publicPension": "partial",
    "publicPensionNote": "Included in South Carolina retirement deduction.",
    "iraWithdrawals": "partial",
    "iraNotes": "Traditional IRA/401(k) withdrawals qualify for the $10,000 deduction for age 65+.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "South Carolina fully exempts military retirement pay.",
    "seniorBenefits": "$10,000 per person retirement income deduction for 65+. Additional age 65+ $15,000 deduction on other income.",
    "notes": "South Carolina is very popular for retirees: 100% Social Security exemption, full military pay exemption, and $10k–$15k deductions for age 65+.",
    "sourceUrl": "https://dor.sc.gov/tax/individual/retirement-income",
    "sources": [
      {
        "label": "South Carolina Department of Revenue",
        "url": "https://dor.sc.gov/tax/individual/retirement-income"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "SD": {
    "state": "South Dakota",
    "name": "South Dakota",
    "code": "SD",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "South Dakota has no state income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state individual income tax. Property tax reduction program for seniors.",
    "notes": "South Dakota has no state individual income tax. All retirement income is completely exempt.",
    "sourceUrl": "https://dor.sd.gov/",
    "sources": [
      {
        "label": "South Dakota Department of Revenue",
        "url": "https://dor.sd.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "TN": {
    "state": "Tennessee",
    "name": "Tennessee",
    "code": "TN",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Tennessee has no state income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state income tax on any income. Property tax relief and freeze for seniors 65+.",
    "notes": "Tennessee has no state income tax (Hall Income Tax fully repealed). All retirement income is 100% state tax-free.",
    "sourceUrl": "https://www.tn.gov/revenue.html",
    "sources": [
      {
        "label": "Tennessee Department of Revenue",
        "url": "https://www.tn.gov/revenue.html"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "TX": {
    "state": "Texas",
    "name": "Texas",
    "code": "TX",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Texas has no state income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state individual income tax. Over-65 property tax homestead exemption and school tax freeze.",
    "notes": "Texas constitution bars individual income tax. All retirement income is completely state tax-free. (Property taxes are higher).",
    "sourceUrl": "https://comptroller.texas.gov/",
    "sources": [
      {
        "label": "Texas Comptroller of Public Accounts",
        "url": "https://comptroller.texas.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "UT": {
    "state": "Utah",
    "name": "Utah",
    "code": "UT",
    "hasStateTax": true,
    "topRate": 0.0455,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "Utah offers a Social Security tax credit of up to $450 (single) or $900 (joint), which phases out above $45,000 (single) or $75,000 (joint).",
    "retirementExclusion": {
      "description": "Social Security tax credit for lower-to-middle income retirees. Flat 4.55% rate.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions taxed at Utah flat 4.55% rate.",
    "publicPension": "none",
    "publicPensionNote": "Public pensions taxed at flat 4.55% rate.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions taxed at flat 4.55%.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Utah fully exempts military retirement pay.",
    "seniorBenefits": "Social Security tax credit for lower-to-middle income retirees. Flat 4.55% rate.",
    "notes": "Utah flat rate 4.55%. Social Security receives a tax credit phasing out at moderate income levels; military retirement is exempt.",
    "sourceUrl": "https://tax.utah.gov/",
    "sources": [
      {
        "label": "Utah State Tax Commission",
        "url": "https://tax.utah.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "VT": {
    "state": "Vermont",
    "name": "Vermont",
    "code": "VT",
    "hasStateTax": true,
    "topRate": 0.0875,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 45400,
          "rate": 0.0335
        },
        {
          "min": 45400,
          "max": 110050,
          "rate": 0.066
        },
        {
          "min": 110050,
          "max": 229550,
          "rate": 0.076
        },
        {
          "min": 229550,
          "max": null,
          "rate": 0.0875
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 75850,
          "rate": 0.0335
        },
        {
          "min": 75850,
          "max": 183400,
          "rate": 0.066
        },
        {
          "min": 183400,
          "max": 279950,
          "rate": 0.076
        },
        {
          "min": 279950,
          "max": null,
          "rate": 0.0875
        }
      ]
    },
    "ssTreatment": "partial",
    "socialSecurity": "partial",
    "ssTaxNote": "Vermont exempts Social Security for single filers with AGI under $50,000 ($65,000 joint). Above limits, SS is taxed.",
    "retirementExclusion": {
      "description": "Social Security exemption for lower-income retirees. Property tax adjustment credit.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions are fully taxable in Vermont.",
    "publicPension": "none",
    "publicPensionNote": "Public pensions are fully taxable in Vermont.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions are fully taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Vermont fully exempts military retirement pay (up to $10,000 with phaseouts).",
    "seniorBenefits": "Social Security exemption for lower-income retirees. Property tax adjustment credit.",
    "notes": "Vermont taxes Social Security for retirees above income thresholds and taxes all private pensions and IRA withdrawals.",
    "sourceUrl": "https://tax.vermont.gov/",
    "sources": [
      {
        "label": "Vermont Department of Taxes",
        "url": "https://tax.vermont.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "VA": {
    "state": "Virginia",
    "name": "Virginia",
    "code": "VA",
    "hasStateTax": true,
    "topRate": 0.0575,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 3000,
          "rate": 0.02
        },
        {
          "min": 3000,
          "max": 5000,
          "rate": 0.03
        },
        {
          "min": 5000,
          "max": 17000,
          "rate": 0.05
        },
        {
          "min": 17000,
          "max": null,
          "rate": 0.0575
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 3000,
          "rate": 0.02
        },
        {
          "min": 3000,
          "max": 5000,
          "rate": 0.03
        },
        {
          "min": 5000,
          "max": 17000,
          "rate": 0.05
        },
        {
          "min": 17000,
          "max": null,
          "rate": 0.0575
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Virginia does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "$12,000 age deduction per person for age 65+ (income limits apply). Social Security 100% exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Age deduction of up to $12,000 per person age 65+ (subject to income phaseout starting at $50k single / $75k joint).",
    "publicPension": "partial",
    "publicPensionNote": "Qualifies for Virginia age deduction.",
    "iraWithdrawals": "partial",
    "iraNotes": "Traditional IRA/401(k) withdrawals qualify for the $12,000 age deduction for 65+.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Virginia exempts up to $40,000 of military retirement pay (fully exempting it for most recipients).",
    "seniorBenefits": "$12,000 age deduction per person for age 65+ (income limits apply). Social Security 100% exempt.",
    "notes": "Virginia top rate 5.75%. Social Security is exempt, and seniors 65+ can deduct up to $12,000 of other income.",
    "sourceUrl": "https://www.tax.virginia.gov/",
    "sources": [
      {
        "label": "Virginia Department of Taxation",
        "url": "https://www.tax.virginia.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "WA": {
    "state": "Washington",
    "name": "Washington",
    "code": "WA",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Washington has no state individual income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state income tax. Property tax exemption/deferral program for low-to-moderate income seniors.",
    "notes": "Washington has no state individual income tax. All retirement income is completely exempt from state tax.",
    "sourceUrl": "https://dor.wa.gov/",
    "sources": [
      {
        "label": "Washington Department of Revenue",
        "url": "https://dor.wa.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "WV": {
    "state": "West Virginia",
    "name": "West Virginia",
    "code": "WV",
    "hasStateTax": true,
    "topRate": 0.0512,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 10000,
          "rate": 0.03
        },
        {
          "min": 10000,
          "max": 25000,
          "rate": 0.04
        },
        {
          "min": 25000,
          "max": 40000,
          "rate": 0.045
        },
        {
          "min": 40000,
          "max": 60000,
          "rate": 0.06
        },
        {
          "min": 60000,
          "max": null,
          "rate": 0.0512
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 10000,
          "rate": 0.03
        },
        {
          "min": 10000,
          "max": 25000,
          "rate": 0.04
        },
        {
          "min": 25000,
          "max": 40000,
          "rate": 0.045
        },
        {
          "min": 40000,
          "max": 60000,
          "rate": 0.06
        },
        {
          "min": 60000,
          "max": null,
          "rate": 0.0512
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "West Virginia fully exempts Social Security benefits.",
    "retirementExclusion": {
      "description": "Retirement income exclusion of up to $2,000 per person age 65+.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement income exclusion of up to $2,000 per person age 65+.",
    "publicPension": "partial",
    "publicPensionNote": "WV state/local and federal government pensions qualify for up to $2,000 exclusion.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions generally taxable above small senior exclusions.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "West Virginia fully exempts military retirement pay.",
    "seniorBenefits": "Social Security 100% exempt. Military retirement 100% exempt.",
    "notes": "West Virginia eliminated Social Security tax and is reducing its top income tax rate below 5%.",
    "sourceUrl": "https://tax.wv.gov/",
    "sources": [
      {
        "label": "West Virginia Tax Division",
        "url": "https://tax.wv.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "WI": {
    "state": "Wisconsin",
    "name": "Wisconsin",
    "code": "WI",
    "hasStateTax": true,
    "topRate": 0.0765,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 14320,
          "rate": 0.0354
        },
        {
          "min": 14320,
          "max": 28640,
          "rate": 0.0465
        },
        {
          "min": 28640,
          "max": 315310,
          "rate": 0.053
        },
        {
          "min": 315310,
          "max": null,
          "rate": 0.0765
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 19090,
          "rate": 0.0354
        },
        {
          "min": 19090,
          "max": 38190,
          "rate": 0.0465
        },
        {
          "min": 38190,
          "max": 420420,
          "rate": 0.053
        },
        {
          "min": 420420,
          "max": null,
          "rate": 0.0765
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Wisconsin does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Social Security 100% exempt. Military pay 100% exempt. Homestead tax credit.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "partial",
    "privatePensionNote": "Retirement income subtraction of up to $5,000 per person age 65+ with federal AGI under $15,000 (single) or $30,000 (joint).",
    "publicPension": "partial",
    "publicPensionNote": "Certain public employee pensions for service before 1964 are fully exempt.",
    "iraWithdrawals": "partial",
    "iraNotes": "IRA withdrawals qualify for the $5,000 retirement subtraction if under AGI limits.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "Wisconsin fully exempts military retirement pay.",
    "seniorBenefits": "Social Security 100% exempt. Military pay 100% exempt. Homestead tax credit.",
    "notes": "Wisconsin exempts Social Security and military retirement. Other retirement income is taxable at rates up to 7.65%.",
    "sourceUrl": "https://www.revenue.wi.gov/",
    "sources": [
      {
        "label": "Wisconsin Department of Revenue",
        "url": "https://www.revenue.wi.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "WY": {
    "state": "Wyoming",
    "name": "Wyoming",
    "code": "WY",
    "hasStateTax": false,
    "topRate": 0,
    "flatRate": true,
    "brackets": null,
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Wyoming has no state income tax. Social Security is 100% tax-free.",
    "retirementExclusion": {
      "description": "No state income tax; 100% of retirement income is exempt.",
      "minAge": null,
      "cap": null
    },
    "privatePension": "full",
    "privatePensionNote": "No state income tax.",
    "publicPension": "full",
    "publicPensionNote": "No state income tax.",
    "iraWithdrawals": "full",
    "iraNotes": "No state income tax.",
    "rothWithdrawals": "full",
    "rothNotes": "No state income tax.",
    "militaryRetirement": "full",
    "militaryNote": "No state income tax.",
    "seniorBenefits": "No state individual income tax. Property tax relief program for seniors.",
    "notes": "Wyoming has no state individual income tax. All retirement income is completely state tax-free.",
    "sourceUrl": "https://revenue.wyo.gov/",
    "sources": [
      {
        "label": "Wyoming Department of Revenue",
        "url": "https://revenue.wyo.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  },
  "DC": {
    "state": "District of Columbia",
    "name": "District of Columbia",
    "code": "DC",
    "hasStateTax": true,
    "topRate": 0.1075,
    "flatRate": false,
    "brackets": {
      "single": [
        {
          "min": 0,
          "max": 10000,
          "rate": 0.04
        },
        {
          "min": 10000,
          "max": 40000,
          "rate": 0.06
        },
        {
          "min": 40000,
          "max": 60000,
          "rate": 0.065
        },
        {
          "min": 60000,
          "max": 250000,
          "rate": 0.085
        },
        {
          "min": 250000,
          "max": 500000,
          "rate": 0.0925
        },
        {
          "min": 500000,
          "max": 1000000,
          "rate": 0.0975
        },
        {
          "min": 1000000,
          "max": null,
          "rate": 0.1075
        }
      ],
      "mfj": [
        {
          "min": 0,
          "max": 10000,
          "rate": 0.04
        },
        {
          "min": 10000,
          "max": 40000,
          "rate": 0.06
        },
        {
          "min": 40000,
          "max": 60000,
          "rate": 0.065
        },
        {
          "min": 60000,
          "max": 250000,
          "rate": 0.085
        },
        {
          "min": 250000,
          "max": 500000,
          "rate": 0.0925
        },
        {
          "min": 500000,
          "max": 1000000,
          "rate": 0.0975
        },
        {
          "min": 1000000,
          "max": null,
          "rate": 0.1075
        }
      ]
    },
    "ssTreatment": "full",
    "socialSecurity": "full",
    "ssTaxNote": "Washington DC does not tax Social Security benefits.",
    "retirementExclusion": {
      "description": "Senior citizen property tax relief (50% reduction in real property tax for qualifying seniors 65+).",
      "minAge": null,
      "cap": null
    },
    "privatePension": "none",
    "privatePensionNote": "Private pensions and 401(k) distributions are taxable at DC income tax rates.",
    "publicPension": "partial",
    "publicPensionNote": "Federal civil service and DC government pensions have small exclusions for older retirees.",
    "iraWithdrawals": "none",
    "iraNotes": "Traditional IRA/401(k) distributions are fully taxable.",
    "rothWithdrawals": "full",
    "rothNotes": "Qualified Roth distributions are exempt.",
    "militaryRetirement": "full",
    "militaryNote": "DC fully exempts military retirement pay.",
    "seniorBenefits": "Senior citizen property tax relief (50% reduction in real property tax for qualifying seniors 65+).",
    "notes": "DC does not tax Social Security and exempts military retirement, but private pensions and IRAs face progressive rates up to 10.75%.",
    "sourceUrl": "https://otr.cfo.dc.gov/",
    "sources": [
      {
        "label": "DC Office of Tax and Revenue",
        "url": "https://otr.cfo.dc.gov/"
      }
    ],
    "lastCheckedDate": "August 2026",
    "lastVerified": "August 2026",
    "status": "unverified-2026"
  }
};

export const STATES = STATE_RETIREMENT_TAX_DATA;
