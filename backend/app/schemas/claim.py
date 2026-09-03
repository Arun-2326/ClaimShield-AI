"""
ClaimShield AI - Claim Pydantic Schemas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date

class ValidationWarning(BaseModel):
    code: str
    message: str
    severity: str = "warning"

class ClaimBase(BaseModel):
    claim_id: str = Field(..., description="Unique synthetic claim identifier", examples=["CLM_100429"])
    patient_id: str = Field(..., description="Synthetic opaque patient identifier", examples=["PAT_098231"])
    payer_id: str = Field(..., description="Synthetic payer identifier", examples=["PAYER_001"])
    cpt_codes: List[str] = Field(..., min_length=1, description="List of CPT / HCPCS procedure codes", examples=[["99214"]])
    icd_codes: List[str] = Field(..., min_length=1, description="List of ICD-10 diagnosis codes", examples=[["I10"]])
    claim_amount: float = Field(..., description="Billed claim charge in USD", examples=[350.0])
    service_date: str = Field(..., description="Date of medical service (YYYY-MM-DD)", examples=["2026-08-25"])
    submission_date: Optional[str] = Field(None, description="Proposed date of submission (YYYY-MM-DD)")
    prior_auth_flag: bool = Field(False, description="Whether prior authorization is on file")
    eligibility_verified: bool = Field(True, description="Whether member eligibility was verified")
    days_since_eligibility_check: Optional[int] = Field(0, ge=0, description="Days elapsed since last 270/271 check")
    provider_specialty: str = Field("Family Medicine", description="Provider clinical specialty")
    documentation_complete: bool = Field(True, description="Whether clinical notes/charts are fully attached")
    duplicate_candidate: Optional[bool] = Field(False, description="Flagged by pre-check as possible duplicate")
    timely_filing_risk: Optional[bool] = Field(False, description="Service date age nearing payer filing limit")
    coverage_indicator: Optional[bool] = Field(True, description="Procedure covered under active plan contract")
    medical_necessity_indicator: Optional[bool] = Field(True, description="Diagnosis supports medical necessity of procedure")
    bundling_indicator: Optional[bool] = Field(False, description="Procedure at risk of NCCI unbundling edit")

class ClaimCreate(ClaimBase):
    pass

class ClaimResponse(ClaimBase):
    status: str
    created_at: str
    model_config = ConfigDict(from_attributes=True)

class BatchClaimUpload(BaseModel):
    claims: List[ClaimCreate]
