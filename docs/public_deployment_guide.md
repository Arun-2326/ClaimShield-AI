# ClaimShield AI — Public Deployment & Hackathon Launch Guide

This guide outlines the exact, step-by-step process to publish **ClaimShield AI** publicly for judges, reviewers, and hackathon evaluation.

---

## 1. Publish Code to GitHub (Public Repository)

### Step 1: Initialize Git in the project root
Open PowerShell or your terminal in the project directory:
```powershell
cd "C:\Users\Dharsan P\.gemini\antigravity\scratch\claimshield-ai"
git init
```

### Step 2: Stage and commit all files
```powershell
git add .
git commit -m "feat: complete ClaimShield AI pre-submission RCM engine for MIC VIT Chennai"
```

### Step 3: Link to your GitHub account
1. Go to [github.com/new](https://github.com/new) and create a repository named `claimshield-ai`.
2. Keep it **Public**.
3. Push your code:
```powershell
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/claimshield-ai.git
git push -u origin main
```

---

## 2. Deploy Live Web App (Free Hosting Options)

Because ClaimShield AI is configured as a **unified application** (FastAPI serves the compiled React frontend directly from `frontend/dist` on a single port), you only need **one free web service**!

### Option A: Render (Easiest & Recommended)
1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your `claimshield-ai` repository.
4. Configure the service:
   - **Name**: `claimshield-ai`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python -m backend.ml.train && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command**:
     ```bash
     python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free`
5. Click **Deploy Web Service**.
6. Within 2–3 minutes, your application will be live at:
   `https://claimshield-ai.onrender.com`

---

### Option B: Hugging Face Spaces (Free 16 GB RAM Docker)
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Space name: `claimshield-ai`
3. License: `mit` or `apache-2.0`
4. Select Space SDK: **Docker** (Blank).
5. Clone your space locally, copy the repository files (including our `Dockerfile`), and push:
   ```bash
   git push origin main
   ```
6. Hugging Face builds the Docker container automatically and gives you a persistent public URL with zero cold-start limits.

---

### Option C: Railway or Fly.io
- Simply connect the GitHub repo; Railway reads the included `Dockerfile` or `requirements.txt` and deploys automatically on port 8000.

---

## 3. Preparing Your 3-Minute Video Demo for Judges

Judges evaluate live demos based on clarity, polish, and problem alignment.
1. Use **Loom** ([loom.com](https://www.loom.com)) or OBS Studio to record your screen and microphone.
2. Open [`docs/demo_script_3min.md`](demo_script_3min.md) and follow the exact 3-minute script:
   - **Minute 1**: The Problem (post-submission rework vs pre-submission prevention).
   - **Minute 2**: High-Risk claim (Preset 1: Knee Meniscectomy missing pre-auth) → Show the **88% risk score** & **HOLD_FOR_CORRECTION** → Use the **What-If Simulator** to check the box → Watch the score plummet live to **11% (RELEASE)**.
   - **Minute 3**: Model Transparency tab (Confusion matrix, 76.0% accuracy, ROC-AUC 0.818, synthetic data disclosure, and \$300K+ ROI calculator).
3. Upload to YouTube (Unlisted or Public) or Loom, and copy the shareable link.

---

## 4. Hackathon Submission Form Checklist

When filling out the hackathon submission (Devpost, Google Form, or portal):

- **Project Title**: `ClaimShield AI — Pre-Submission RCM Denial Prevention Engine`
- **Elevator Pitch**: 
  > *"An intelligent pre-submission layer that predicts healthcare claim denials before transmission, maps CARC reason codes, explains risk drivers, and features a live 'What-If' remediation simulator to prevent administrative rework."*
- **GitHub Repository**: `https://github.com/<YOUR_USERNAME>/claimshield-ai`
- **Live Demo URL**: `https://claimshield-ai.onrender.com` (or your chosen host)
- **Demo Video URL**: Your 3-minute Loom or YouTube video link
- **Built With**: `Python`, `FastAPI`, `scikit-learn`, `SQLAlchemy`, `React`, `Vite`, `Tailwind CSS`, `Recharts`, `Docker`
- **Synthetic Data Disclaimer**: 
  > *"All claims, patient IDs, and remittance metrics are 100% synthetic simulated demo data. Evaluated offline with zero real PHI or payer data."*
