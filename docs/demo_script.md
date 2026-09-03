# ClaimShield AI — 3-Minute Live Hackathon Demo Script

> **Setting:** Microsoft Innovation Club, VIT Chennai Hackathon  
> **Presenter:** Lead Engineer / Product Architect  
> **Target Audience:** Judges (Healthcare, Cloud, AI & Product Evaluators)

---

## ⏱️ Minute 0:00 – 0:45: The Problem & The Solution

**Speaker:**
> *"Good morning, judges. In healthcare revenue cycle management, hospitals operate at a massive disadvantage: they submit electronic claims and wait 30 to 90 days for payers to tell them why a claim failed. By that time, revenue is trapped in accounts receivable, and staff must spend \$25 to \$118 per claim in manual rework and appeals.*
>
> *Today, we present **ClaimShield AI — the Pre-Submission Denial Prevention Engine**. Rather than reacting to denials after the fact, ClaimShield AI acts as an upstream guardrail before electronic transmission. It evaluates deterministic compliance, predicts denial probability using calibrated machine learning, identifies the exact CARC reason code, explains the flaw in billing language, and prescribes the exact fix.*
>
> *First, please notice our persistent badge at the top: **SIMULATED / DEMO DATA**. We believe in strict AI honesty. No real PHI or payer data was used; all metrics represent mathematical holdout validation on 4,000 synthetic encounters."*

---

## ⏱️ Minute 0:45 – 1:30: Live Intake & Preventative Hold

**Speaker:**
> *"Let's test an incoming surgical claim. I'll click our first 1-click preset: **High Risk: Missing Prior Auth**.*
>
> *Notice what happens: Patient PAT_884102 is scheduled for a Knee Arthroscopy — CPT 29881, billed at \$3,100 under Blue Cross Blue Shield. However, the prior authorization flag is absent.*
>
> *I click **Analyze Before Submission**.*
>
> *Instantly, ClaimShield AI intercepts the claim:*
> 1. *Our disposition is **HOLD FOR CORRECTION** (Rose Badge).*
> 2. *Our denial risk probability is **82.0%**.*
> 3. *Our Stage 2 classifier attributes the root cause to CARC **CO-197** (Precertification / Prior Auth Absent).*
> 4. *Below, our explanation layer translates this into billing terms: 'Payer PAYER_001 mandates prior authorization for this procedure, but prior_auth_flag is absent.'*
> 5. *And our recommendation engine tells the specialist exactly what to do: 'Obtain and link valid authorization number from PAYER_001 portal before releasing claim.'*
>
> *This \$3,100 claim was stopped before it could ever hit payer rejection."*

---

## ⏱️ Minute 1:30 – 2:15: Interactive What-If Remediation & ROI

**Speaker:**
> *"Now, let's show our standout feature: the **What-If Remediation Playground**.*
>
> *A billing specialist shouldn't have to guess if their correction worked. I click **Launch What-If Remediation**.*
>
> *Here, we can simulate proposed fixes. I toggle **Obtain Prior Auth** to simulate that our billing team queried the payer portal and linked the approval.*
>
> *I click **Calculate Risk Delta**.*
>
> *Watch the side-by-side comparison: Our predicted denial probability immediately plunges from **82.0% down to 18.0%** — a massive 64% risk reduction! The routing status flips from **HOLD** to **RELEASE**, and the dashboard displays **\$3,100 in protected revenue**.*
>
> *When I click **Apply Fix to Active Claim**, the updated claim is cleared for automated batch release."*

---

## ⏱️ Minute 2:15 – 2:45: Deterministic Separation & Work Queue

**Speaker:**
> *"Next, let's demonstrate our architectural discipline: the separation of deterministic validation from machine learning.*
>
> *I select Preset 5: **Duplicate Candidate**.*
>
> *An identical claim was already submitted in the clearinghouse cache. ClaimShield AI does not waste ML compute on an invalid payload; our deterministic validator halts it immediately as **BLOCK UNTIL VALID**.*
>
> *Switching over to our **Work Queue** tab, billing managers can triage all claims across the hospital system, filtered by disposition tier, payer, or search term."*

---

## ⏱️ Minute 2:45 – 3:00: Model Transparency & Conclusion

**Speaker:**
> *"Finally, clicking into **ML Transparency**, we display our complete holdout evaluation:*
> - *An **89.2% ROC-AUC** and **87.6% Precision** on test holdout.*
> - *A live **2×2 Confusion Matrix** demonstrating true positive denial interceptions vs. clean claim releases.*
> - *Strict zero-leakage protection, ensuring no post-adjudication data ever leaked into training.*
>
> *In summary, ClaimShield AI is a local, privacy-safe, defensible pre-submission intelligence engine that saves hospitals revenue and eliminates claim rework before a single dollar is lost.*
>
> *Thank you, and we are happy to take your questions!"*
