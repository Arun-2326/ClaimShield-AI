# Revenue Cycle Management (RCM) Domain Guide
### ClaimShield AI Pre-Submission Intelligence

---

## 1. Denial Taxonomy (CARC Codes)

| CARC Code | Plain-Language Meaning | Common Root Cause | Pre-Submission Preventive Remediation |
|---|---|---|---|
| **CO-16** | Required information missing or billing error | Missing NPI, incomplete patient address, or absent clinical progress notes | Validate mandatory X12 837 loops and attach documentation (PWK segment). |
| **CO-18** | Duplicate claim or service line | Resubmitting an encounter without verifying previous 837 clearinghouse status | Search clearinghouse transaction history and suppress duplicate ICNs. |
| **CO-27** | Coverage terminated / Inactive eligibility | Patient policy terminated prior to service date or subscriber lapsed | Execute real-time 270/271 eligibility check within 48 hours of service. |
| **CO-29** | Timely-filing limit expired or at risk | Claim submitted past payer contracted deadline (e.g. 90-180 days) | Prioritize filing before payer cutoff; attach proof of timely attempt if appealing. |
| **CO-50** | Medical necessity mismatch | Procedure not indicated for primary diagnosis under LCD/NCD rules | Audit diagnosis-to-procedure compatibility; ensure clinical notes support acuity. |
| **CO-96** | Non-covered service under benefit plan | Service excluded under patient's policy rider (e.g. cosmetic, experimental) | Check subscriber benefit schedule; obtain signed Advance Beneficiary Notice (ABN). |
| **CO-97** | Bundled / mutually exclusive procedure | NCCI bundling edit unbundled into separate billable line items | Review NCCI PTP edits; attach modifier -59 or -25 only when clinically distinct. |
| **CO-197** | Prior authorization missing or absent | Required pre-certification was not requested or approval number omitted | Verify payer auth policy; obtain authorization and record in Box 23 / Loop 2300. |

---

## 2. EDI 837 Loop & Segment Mapping

In standard ANSI ASC X12N 837 Health Care Claim transmissions:
- **Prior Authorization**: Loop 2300 (Claim Information), Segment `REF*G1` (Prior Authorization Number).
- **Clinical Attachments**: Loop 2300, Segment `PWK` (Paperwork Report Type and Transmission Code).
- **Service Line Procedure**: Loop 2400 (Service Line), Segment `SV1` (Professional Service with CPT & Modifiers).
- **Diagnosis Codes**: Loop 2300, Segment `HI` (Health Care Code Information / ICD-10-CM).

---

## 3. Financial ROI Model & Assumptions

The financial impact calculations in ClaimShield AI are based on standard HFMA (Healthcare Financial Management Association) and MGMA benchmarks:
1. **Administrative Cost to Appeal a Denied Claim**: **\$25.00** on average (labor for coding review, re-filing, phone follow-up).
2. **Denial Recovery Rate**: Up to 65% of denials are never reworked by providers due to time constraints, resulting in permanent bad debt.
3. **Cash Flow Acceleration**: A clean claim is typically reimbursed in 14–21 days, whereas a denied claim defers payment by 45–75 days (an average delay of **32 days**).
