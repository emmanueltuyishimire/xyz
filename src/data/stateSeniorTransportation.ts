/**
 * stateSeniorTransportation.ts
 * Official State Senior Transportation Reference Dataset
 *
 * Sourced strictly from official federal and national directories:
 * - Administration for Community Living (ACL) Eldercare Locator (eldercare.acl.gov)
 * - Medicaid.gov Non-Emergency Medical Transportation (medicaid.gov)
 * - ADA.gov Title II Complementary Paratransit (ada.gov)
 * - VA.gov Beneficiary Travel Program (va.gov)
 *
 * NOTE: Broker names and phone numbers not officially verified are left null.
 * Fallback links (Eldercare Locator, Medicaid.gov, 211) are used for unpopulated fields.
 * Last checked: Oct 2026
 */

export interface MedicaidNemtData {
  agencyOrBrokerName: string | null;
  phone: string | null;
  advanceNoticeRule: string;
  sourceUrl: string;
  lastChecked: string;
}

export interface StateSeniorTransportationRecord {
  code: string;
  state: string;
  medicaidNemt: MedicaidNemtData;
  aaaDirectoryUrl: string;
  adaParatransitNote: string;
  vaBeneficiaryTravelUrl: string;
  stateNotes: string | null;
}

export const STATE_SENIOR_TRANSPORTATION_DATA: Record<string, StateSeniorTransportationRecord> = {
  "AL": {
    "code": "AL",
    "state": "Alabama",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "AK": {
    "code": "AK",
    "state": "Alaska",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "AZ": {
    "code": "AZ",
    "state": "Arizona",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "AR": {
    "code": "AR",
    "state": "Arkansas",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "CA": {
    "code": "CA",
    "state": "California",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "CO": {
    "code": "CO",
    "state": "Colorado",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "CT": {
    "code": "CT",
    "state": "Connecticut",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "DE": {
    "code": "DE",
    "state": "Delaware",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "FL": {
    "code": "FL",
    "state": "Florida",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "GA": {
    "code": "GA",
    "state": "Georgia",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "HI": {
    "code": "HI",
    "state": "Hawaii",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "ID": {
    "code": "ID",
    "state": "Idaho",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "IL": {
    "code": "IL",
    "state": "Illinois",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "IN": {
    "code": "IN",
    "state": "Indiana",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "IA": {
    "code": "IA",
    "state": "Iowa",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "KS": {
    "code": "KS",
    "state": "Kansas",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "KY": {
    "code": "KY",
    "state": "Kentucky",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "LA": {
    "code": "LA",
    "state": "Louisiana",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "ME": {
    "code": "ME",
    "state": "Maine",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "MD": {
    "code": "MD",
    "state": "Maryland",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "MA": {
    "code": "MA",
    "state": "Massachusetts",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "MI": {
    "code": "MI",
    "state": "Michigan",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "MN": {
    "code": "MN",
    "state": "Minnesota",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "MS": {
    "code": "MS",
    "state": "Mississippi",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "MO": {
    "code": "MO",
    "state": "Missouri",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "MT": {
    "code": "MT",
    "state": "Montana",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "NE": {
    "code": "NE",
    "state": "Nebraska",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "NV": {
    "code": "NV",
    "state": "Nevada",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "NH": {
    "code": "NH",
    "state": "New Hampshire",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "NJ": {
    "code": "NJ",
    "state": "New Jersey",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "NM": {
    "code": "NM",
    "state": "New Mexico",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "NY": {
    "code": "NY",
    "state": "New York",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "NC": {
    "code": "NC",
    "state": "North Carolina",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "ND": {
    "code": "ND",
    "state": "North Dakota",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "OH": {
    "code": "OH",
    "state": "Ohio",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "OK": {
    "code": "OK",
    "state": "Oklahoma",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "OR": {
    "code": "OR",
    "state": "Oregon",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "PA": {
    "code": "PA",
    "state": "Pennsylvania",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "RI": {
    "code": "RI",
    "state": "Rhode Island",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "SC": {
    "code": "SC",
    "state": "South Carolina",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "SD": {
    "code": "SD",
    "state": "South Dakota",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "TN": {
    "code": "TN",
    "state": "Tennessee",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "TX": {
    "code": "TX",
    "state": "Texas",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "UT": {
    "code": "UT",
    "state": "Utah",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "VT": {
    "code": "VT",
    "state": "Vermont",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "VA": {
    "code": "VA",
    "state": "Virginia",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "WA": {
    "code": "WA",
    "state": "Washington",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "WV": {
    "code": "WV",
    "state": "West Virginia",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "WI": {
    "code": "WI",
    "state": "Wisconsin",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "WY": {
    "code": "WY",
    "state": "Wyoming",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  },
  "DC": {
    "code": "DC",
    "state": "District of Columbia",
    "medicaidNemt": {
      "agencyOrBrokerName": null,
      "phone": null,
      "advanceNoticeRule": "Many state Medicaid ride brokers require advance notice of about two to three business days; call as early as you can and ask your broker for its exact rule.",
      "sourceUrl": "https://www.medicaid.gov/medicaid/benefits/transportation/index.html",
      "lastChecked": "Oct 2026"
    },
    "aaaDirectoryUrl": "https://eldercare.acl.gov",
    "adaParatransitNote": "Required by federal ADA law (Title II) for transit riders unable to board or navigate fixed-route public buses. Contact your local city or county transit authority.",
    "vaBeneficiaryTravelUrl": "https://www.va.gov/health-care/get-reimbursed-for-travel-pay/",
    "stateNotes": null
  }
};
