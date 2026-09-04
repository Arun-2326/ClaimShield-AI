const API_BASE = '/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', model_loaded: false, error: err.message };
  }
}

export async function predictClaim(claimData, persist = true) {
  const res = await fetch(`${API_BASE}/predict?persist=${persist}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData)
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail?.message || errBody.detail || 'Prediction failed');
  }
  return await res.json();
}

export async function batchPredictClaims(claimsList, persist = false) {
  const res = await fetch(`${API_BASE}/batch-predict?persist=${persist}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claims: claimsList })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail?.message || 'Batch prediction failed');
  }
  return await res.json();
}

export async function fetchClaimsQueue(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/claims?${query}`);
  if (!res.ok) throw new Error('Failed to fetch claims queue');
  return await res.json();
}

export async function fetchClaimDetail(claimId) {
  const res = await fetch(`${API_BASE}/claims/${claimId}`);
  if (!res.ok) throw new Error(`Failed to fetch claim ${claimId}`);
  return await res.json();
}

export async function recordOutcome(outcomeData) {
  const res = await fetch(`${API_BASE}/outcomes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outcomeData)
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || 'Failed to record outcome');
  }
  return await res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return await res.json();
}

export async function fetchReferenceTaxonomy() {
  const res = await fetch(`${API_BASE}/reference-codes`);
  if (!res.ok) throw new Error('Failed to fetch reference taxonomy');
  return await res.json();
}

export async function fetchClaimEdi837(claimData) {
  const res = await fetch(`${API_BASE}/scrubber/edi-837`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData)
  });
  if (!res.ok) throw new Error('Failed to generate X12 837P EDI stream');
  return await res.json();
}

export async function auditClaimRules(claimData) {
  const res = await fetch(`${API_BASE}/scrubber/rules-audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData)
  });
  if (!res.ok) throw new Error('Failed to execute scrubbing rules');
  return await res.json();
}

export async function applyRemediation(claimData, action, authNumber = null) {
  const res = await fetch(`${API_BASE}/scrubber/remediate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim: claimData, action, auth_number: authNumber })
  });
  if (!res.ok) throw new Error('Failed to apply 1-click remediation');
  return await res.json();
}

