export const SAMPLE_PRESETS = [
  {
    id: 'preset_knee_missing_auth',
    label: 'High Risk: Knee Arthroscopy (Missing Pre-Auth)',
    category: 'Prior Authorization',
    expectedOutcome: 'HOLD_FOR_CORRECTION (CO-197)',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    data: {
      claim_id: 'CLM_DEMO_AUTH_01',
      patient_id: 'PAT_99201',
      payer_id: 'PAYER_001',
      cpt_codes: ['29881'],
      icd_codes: ['M23.22'],
      claim_amount: 3850.00,
      service_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      prior_auth_flag: false,
      eligibility_verified: true,
      days_since_eligibility_check: 8,
      provider_specialty: 'Orthopedic Surgery',
      documentation_complete: true,
      duplicate_candidate: false
    }
  },
  {
    id: 'preset_clean_em',
    label: 'Clean Claim: Outpatient Office Visit (Low Risk)',
    category: 'Clean / Fast-Track',
    expectedOutcome: 'RELEASE (Clean Claim)',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    data: {
      claim_id: 'CLM_DEMO_CLEAN_02',
      patient_id: 'PAT_99202',
      payer_id: 'PAYER_002',
      cpt_codes: ['99213'],
      icd_codes: ['I10'],
      claim_amount: 145.00,
      service_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      prior_auth_flag: false,
      eligibility_verified: true,
      days_since_eligibility_check: 3,
      provider_specialty: 'Family Medicine',
      documentation_complete: true,
      duplicate_candidate: false
    }
  },
  {
    id: 'preset_stale_eligibility',
    label: 'Medium Risk: CT Scan with Stale Eligibility Check',
    category: 'Eligibility Verification',
    expectedOutcome: 'REVIEW (CO-27)',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    data: {
      claim_id: 'CLM_DEMO_ELIG_03',
      patient_id: 'PAT_99203',
      payer_id: 'PAYER_004',
      cpt_codes: ['70450'],
      icd_codes: ['R07.9'],
      claim_amount: 1150.00,
      service_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      prior_auth_flag: true,
      eligibility_verified: true,
      days_since_eligibility_check: 85,
      provider_specialty: 'Radiology',
      documentation_complete: true,
      duplicate_candidate: false
    }
  },
  {
    id: 'preset_timely_filing',
    label: 'High Risk: ED Visit Exceeding 90-Day Filing Limit',
    category: 'Timely Filing',
    expectedOutcome: 'HOLD_FOR_CORRECTION (CO-29)',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    data: {
      claim_id: 'CLM_DEMO_TIME_04',
      patient_id: 'PAT_99204',
      payer_id: 'PAYER_003',
      cpt_codes: ['99283'],
      icd_codes: ['R07.9'],
      claim_amount: 920.00,
      service_date: new Date(Date.now() - 115 * 86400000).toISOString().split('T')[0],
      prior_auth_flag: true,
      eligibility_verified: true,
      days_since_eligibility_check: 115,
      provider_specialty: 'Emergency Medicine',
      documentation_complete: true,
      duplicate_candidate: false
    }
  },
  {
    id: 'preset_duplicate_candidate',
    label: 'Validation Block: Exact Duplicate Service Line',
    category: 'Duplicate Detection',
    expectedOutcome: 'BLOCK_UNTIL_VALID (CO-18)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    data: {
      claim_id: 'CLM_DEMO_DUP_05',
      patient_id: 'PAT_99205',
      payer_id: 'PAYER_001',
      cpt_codes: ['99214'],
      icd_codes: ['E11.9'],
      claim_amount: 190.00,
      service_date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      prior_auth_flag: false,
      eligibility_verified: true,
      days_since_eligibility_check: 6,
      provider_specialty: 'Internal Medicine',
      documentation_complete: true,
      duplicate_candidate: true
    }
  }
];
