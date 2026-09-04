# ClaimShield AI — 3-Minute Live Hackathon Demo Script
### Microsoft Innovation Club (VIT Chennai)

---

## ⏱️ Minute 0:00 – 0:45: The Problem & The Paradigm Shift

**[Visual: Dashboard Header with "SIMULATED / DEMO DATA" badge]**

> *"Good morning judges. Every year, healthcare providers in the United States lose billions of dollars to claim denials. But the most frustrating part of Revenue Cycle Management isn't the denial itself — it's the timing.*
> 
> *Providers discover claim problems 30 to 60 days **after** submission, when the payer's 835 remittance advice arrives. By then, it costs an average of **$25 in administrative rework** to appeal, while vital cash flow sits frozen.*
> 
> *We built **ClaimShield AI** to change this paradigm: **We do not wait for the payer to tell us why a claim failed. We predict and prevent preventable denials before the claim ever leaves the provider boundary.**"*

---

## ⏱️ Minute 0:45 – 1:45: Live Prevention Studio & High-Risk Interception

**[Visual: Switch to 'Live Prevention Studio' tab -> Select Preset 1: Knee Meniscectomy]**

> *"Let’s inspect a live synthetic encounter: a knee arthroscopy (CPT 29881) billed to Aetna for $3,850.
> 
> Notice what happens when our biller clicks **'Analyze Before Submission'**:
> 
> 1. **Immediate Risk Scoring**: The engine predicts an **88% Denial Probability**, categorizing the claim into **HIGH RISK**.
> 2. **Policy Routing**: The claim is immediately routed to **`HOLD_FOR_CORRECTION`** — preventing it from leaving the building.
> 3. **Predicted CARC**: It anticipates Claim Adjustment Reason Code **CO-197** (Missing Pre-Authorization) with 85% confidence.
> 4. **Explainable Billing Drivers**: The top risk driver isn't a black box; it explicitly shows that Aetna requires pre-auth for CPT 29881, but the authorization flag is missing.
> 5. **Prescriptive Action**: It instructs the biller to obtain the pre-certification number and populate Box 23 prior to electronic 837 transmission."*

---

## ⏱️ Minute 1:45 – 2:30: The "What-If" Counterfactual Engine

**[Visual: Scroll to 'What-If Remediation Simulator' -> Toggle 'Prior Authorization: Checked' -> Click 'Recalculate Impact']**

> *"Here is the true superpower for billing teams: our **Counterfactual What-If Simulator**.
> 
> Instead of guessing, the biller contacts the payer, secures the authorization number, checks the box, and clicks **'Recalculate Impact'**.
> 
> Watch the live model score:
> The denial probability instantly plummets from **88% down to 11%** — a **-77% net risk reduction**!
> The routing decision flips immediately to **`RELEASE`**, clearing the clean claim for automated batch release.
> We just prevented an avoidable denial, saved \$25 in administrative appeal costs, and accelerated \$3,850 in cash flow."*

---

## ⏱️ Minute 2:30 – 3:00: Governance, Model Transparency & ROI

**[Visual: Switch to 'Model Transparency & ROI' tab]**

> *"Let's look under the hood:
> 
> - **Defensible Machine Learning**: Our dual-stage Random Forest achieves **76.0% accuracy** and **0.818 ROC-AUC** with strict class balancing and 5% controlled label noise.
> - **Leakage Prevention Audit**: Our automated test suite guarantees zero post-submission features (such as payment amount or remittance dates) leak into the model.
> - **Transparent Honesty**: Every metric is clearly badged as **Simulated / Demo Data**. We don't claim to replace payer adjudication; we provide a pre-submission defensive intelligence shield.
> - **Tangible Impact**: For a mid-sized clinic processing 12,000 claims a month, this engine delivers over **$300,000 in annual administrative savings** and accelerates millions in cash flow.
> 
> Thank you! We welcome your questions."*
