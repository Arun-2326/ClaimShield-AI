# ClaimShield AI — Production Boundary & Compliance Roadmap

## 1. Executive Context

While the current ClaimShield AI prototype operates strictly on **synthetic, non-PHI data** in an isolated local runtime, enterprise deployment within a hospital network or clearinghouse infrastructure requires adherence to healthcare data standards and federal privacy regulations.

---

## 2. Privacy & HIPAA Compliance Blueprint

### 2.1 Protected Health Information (PHI) Protection
- **De-Identification & Tokenization:** Production deployments must ingest EHR records through a de-identification gateway (HIPAA Safe Harbor standard §164.514(b) or Expert Determination method). Patient MRNs and identifiers must be replaced with irreversible cryptographic salted tokens.
- **Zero Raw PHI in Logs:** API gateways, application loggers, and model explainers must strictly redact direct identifiers (Names, DOB, Social Security Numbers, Addresses, Full Phone Numbers).
- **Data Encryption Standards:**
  - **Data at Rest:** Transparent Data Encryption (TDE) via AES-256 for persistent databases and model storage.
  - **Data in Transit:** Enforce TLS 1.3 with strict cipher suites for all microservice communication.

### 2.2 Role-Based Access Control (RBAC) & Audit Trails
- **Granular Permissions:** Implement OAuth 2.0 / OpenID Connect (OIDC) with roles:
  - `Biller`: View worklists, apply what-if corrections, release claims.
  - `RCM Manager`: Adjust risk thresholds, view aggregate financial KPIs.
  - `Compliance Officer`: Inspect immutable audit logs of routing decisions.
- **Immutable Audit Logging:** All pre-submission evaluations, routing overrides, and model predictions must be logged into tamper-evident write-once audit stores.

---

## 3. Electronic Data Interchange (EDI) & Standards Roadmap

In a production clinical environment, ClaimShield AI connects to healthcare systems through standard EDI X12 and HL7 FHIR protocols:

```
[Hospital EHR / Practice Management]
       │
       ▼ (HL7 FHIR Claim / Encounter)
[ClaimShield AI Pre-Submission Engine]
       │
       ├─► [EDI 270/271 Gateway] (Real-time Eligibility Check)
       ├─► [EDI 278 Gateway]     (Real-time Prior Auth Inquiries)
       │
       ▼ (If Cleared: RELEASE)
[Clearinghouse / Payer Gateway (EDI X12 837P / 837I)]
       │
       ▼ (30-90 Days Later)
[Remittance Outcome (EDI X12 835 / ERA)] ──► [ClaimShield AI Feedback Loop]
```

### Supported Transaction Standards:
1. **ASC X12N 837 (Version 005010X222A1):** Health Care Claim: Professional (837P) and Institutional (837I). ClaimShield AI inspects claim lines before 837 transmission.
2. **ASC X12N 835 (Version 005010X221A1):** Health Care Claim Payment / Advice. Used to capture actual adjudication CARC/RARC codes for automated model retraining.
3. **ASC X12N 270/271:** Health Care Eligibility Benefit Inquiry and Response. Triggered to verify active coverage in real time.
4. **ASC X12N 278:** Health Care Services Review — Request for Review and Response. Verifies precertification and prior authorization status.
5. **HL7 FHIR R4 / R5 Resources:**
   - `Claim`: Intake structure for encounter and financial charges.
   - `Coverage`: Real-time insurance subscriber verification.
   - `ExplanationOfBenefit` (EOB): Adjudication outcome tracking.
