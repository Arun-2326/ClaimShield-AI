/**
 * ClaimShield AI - Constants & Demo Presets
 */

export const CARC_TAXONOMY = {
  "CO-16": {
    code: "CO-16",
    category: "Missing / Incomplete Info",
    plain_language: "Required information is missing or contains a submission error.",
    action: "Validate mandatory fields, verify provider NPI, and ensure clinical notes are attached.",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  },
  "CO-18": {
    code: "CO-18",
    category: "Exact Duplicate Service",
    plain_language: "Exact duplicate claim or service previously submitted.",
    action: "Review billing ledger before submission. Append modifier -76/-77 if distinct or void draft.",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  "CO-27": {
    code: "CO-27",
    category: "Coverage Terminated",
    plain_language: "Service occurred after insurance coverage termination date.",
    action: "Execute real-time 270/271 inquiry to verify active member coverage for date of service.",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  "CO-29": {
    code: "CO-29",
    category: "Timely Filing Expired",
    plain_language: "Timely-filing limit has expired or is nearing strict payer deadline.",
    action: "Expedite clearinghouse submission and attach proof of previous timely transmission.",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
  },
  "CO-50": {
    code: "CO-50",
    category: "Medical Necessity Mismatch",
    plain_language: "Service is not considered medically necessary based on primary ICD-10.",
    action: "Review diagnosis-procedure compatibility. Add secondary ICD-10 or clinical rationale.",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
  },
  "CO-96": {
    code: "CO-96",
    category: "Non-Covered Plan Charge",
    plain_language: "Charge is non-covered under the patient's specific benefit schedule.",
    action: "Review payer benefit plan and obtain signed Advance Beneficiary Notice (ABN).",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30"
  },
  "CO-97": {
    code: "CO-97",
    category: "NCCI Bundled Payment",
    plain_language: "Service is bundled into another primary payment under NCCI edits.",
    action: "Check NCCI column 1/2 edits. Append modifier -59 or -25 if clinically distinct.",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
  },
  "CO-197": {
    code: "CO-197",
    category: "Prior Authorization Missing",
    plain_language: "Required prior authorization or precertification is missing.",
    action: "Obtain and link valid authorization number from payer portal prior to submission.",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  }
};

export const ROUTING_CONFIG = {
  RELEASE: {
    label: "RELEASE",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    bgCard: "border-emerald-500/30 bg-emerald-950/20",
    textClass: "text-emerald-400",
    description: "Low denial risk. Cleared for automated electronic batch transmission."
  },
  REVIEW: {
    label: "REVIEW",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    bgCard: "border-amber-500/30 bg-amber-950/20",
    textClass: "text-amber-400",
    description: "Moderate denial risk or borderline confidence. Routed to specialist worklist."
  },
  HOLD_FOR_CORRECTION: {
    label: "HOLD FOR CORRECTION",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    bgCard: "border-rose-500/30 bg-rose-950/20",
    textClass: "text-rose-400",
    description: "High denial risk detected. Preventative hold placed pending manual remediation."
  },
  BLOCK_UNTIL_VALID: {
    label: "BLOCK UNTIL VALID",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    bgCard: "border-purple-500/30 bg-purple-950/20",
    textClass: "text-purple-400",
    description: "Deterministic validation error or confirmed duplicate. Transmission blocked."
  }
};

export const DEMO_PRESETS = [
  {
    id: "preset_pa",
    title: "High Risk: Missing Prior Auth",
    subtitle: "Knee arthroscopy without mandatory authorization",
    expectedOutcome: "HOLD_FOR_CORRECTION (CO-197)",
    badgeColor: "border-rose-500/40 text-rose-300 bg-rose-500/10",
    data: {
      claim_id: "CLM_DEMO_01",
      patient_id: "PAT_884102",
      payer_id: "PAYER_001",
      cpt_codes: ["29881"],
      icd_codes: ["M17.11"],
      claim_amount: 3100.0,
      service_date: "2026-08-25",
      prior_auth_flag: false,
      eligibility_verified: true,
      days_since_eligibility_check: 8,
      provider_specialty: "Orthopedic Surgery",
      documentation_complete: true,
      duplicate_candidate: false,
      timely_filing_risk: false,
      coverage_indicator: true,
      medical_necessity_indicator: true,
      bundling_indicator: false
    }
  },
  {
    id: "preset_timely",
    title: "High Risk: Timely Filing Expiry",
    subtitle: "Encounter aged 110 days exceeding 90-day filing rule",
    expectedOutcome: "HOLD_FOR_CORRECTION (CO-29)",
    badgeColor: "border-orange-500/40 text-orange-300 bg-orange-500/10",
    data: {
      claim_id: "CLM_DEMO_02",
      patient_id: "PAT_542190",
      payer_id: "PAYER_003",
      cpt_codes: ["99214", "93000"],
      icd_codes: ["I10", "R07.9"],
      claim_amount: 270.0,
      service_date: "2026-05-10",
      prior_auth_flag: true,
      eligibility_verified: true,
      days_since_eligibility_check: 14,
      provider_specialty: "Cardiology",
      documentation_complete: true,
      duplicate_candidate: false,
      timely_filing_risk: true,
      coverage_indicator: true,
      medical_necessity_indicator: true,
      bundling_indicator: false
    }
  },
  {
    id: "preset_elig",
    title: "Medium Risk: Stale Eligibility",
    subtitle: "Eligibility verified 68 days ago (>30 day threshold)",
    expectedOutcome: "REVIEW (CO-27)",
    badgeColor: "border-amber-500/40 text-amber-300 bg-amber-500/10",
    data: {
      claim_id: "CLM_DEMO_03",
      patient_id: "PAT_310944",
      payer_id: "PAYER_004",
      cpt_codes: ["99215"],
      icd_codes: ["E11.9"],
      claim_amount: 260.0,
      service_date: "2026-08-15",
      prior_auth_flag: true,
      eligibility_verified: true,
      days_since_eligibility_check: 68,
      provider_specialty: "Internal Medicine",
      documentation_complete: true,
      duplicate_candidate: false,
      timely_filing_risk: false,
      coverage_indicator: true,
      medical_necessity_indicator: true,
      bundling_indicator: false
    }
  },
  {
    id: "preset_clean",
    title: "Clean Claim: Release Ready",
    subtitle: "All parameters verified, verified within 4 days",
    expectedOutcome: "RELEASE (Low Risk)",
    badgeColor: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
    data: {
      claim_id: "CLM_DEMO_04",
      patient_id: "PAT_129481",
      payer_id: "PAYER_002",
      cpt_codes: ["99213"],
      icd_codes: ["J06.9"],
      claim_amount: 110.0,
      service_date: "2026-08-28",
      prior_auth_flag: true,
      eligibility_verified: true,
      days_since_eligibility_check: 4,
      provider_specialty: "Family Medicine",
      documentation_complete: true,
      duplicate_candidate: false,
      timely_filing_risk: false,
      coverage_indicator: true,
      medical_necessity_indicator: true,
      bundling_indicator: false
    }
  },
  {
    id: "preset_duplicate",
    title: "Hard Block: Duplicate Candidate",
    subtitle: "Identical patient and service encounter flagged",
    expectedOutcome: "BLOCK_UNTIL_VALID (CO-18)",
    badgeColor: "border-purple-500/40 text-purple-300 bg-purple-500/10",
    data: {
      claim_id: "CLM_DEMO_05",
      patient_id: "PAT_908311",
      payer_id: "PAYER_001",
      cpt_codes: ["99214"],
      icd_codes: ["M54.5"],
      claim_amount: 175.0,
      service_date: "2026-08-27",
      prior_auth_flag: true,
      eligibility_verified: true,
      days_since_eligibility_check: 6,
      provider_specialty: "Family Medicine",
      documentation_complete: true,
      duplicate_candidate: true,
      timely_filing_risk: false,
      coverage_indicator: true,
      medical_necessity_indicator: true,
      bundling_indicator: false
    }
  },
  {
    id: "preset_non_reference",
    title: "Warning: Non-Reference Codes",
    subtitle: "Non-reference CPT (99999) & ICD (Z99.9) codes",
    expectedOutcome: "VALIDATION_WARNINGS (Allowed)",
    badgeColor: "border-yellow-500/40 text-yellow-300 bg-yellow-500/10",
    data: {
      claim_id: "CLM_DEMO_06",
      patient_id: "PAT_554812",
      payer_id: "PAYER_001",
      cpt_codes: ["99999"],
      icd_codes: ["Z99.9"],
      claim_amount: 350.0,
      service_date: "2026-08-25",
      prior_auth_flag: true,
      eligibility_verified: true,
      days_since_eligibility_check: 7,
      provider_specialty: "General Practice",
      documentation_complete: true,
      duplicate_candidate: false,
      timely_filing_risk: false,
      coverage_indicator: true,
      medical_necessity_indicator: true,
      bundling_indicator: false
    }
  }
];

export const REFERENCE_CPT_CODES = [
  "99213", "99214", "99215", "99203", "99204",
  "71045", "71046", "93000", "36415", "80053",
  "85025", "97110", "97140", "29881", "43239", "45380"
];

export const REFERENCE_ICD_CODES = [
  "I10", "E11.9", "M54.5", "J06.9", "M17.11",
  "K21.9", "F41.1", "E78.5", "R05", "Z00.00"
];

