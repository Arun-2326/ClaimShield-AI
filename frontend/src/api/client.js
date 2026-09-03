/**
 * ClaimShield AI - API Client
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  predictClaim: async (claimData) => {
    const res = await client.post('/predict', claimData);
    return res.data;
  },

  simulateWhatIf: async (originalClaim, modifiedClaim) => {
    const res = await client.post('/simulate/what-if', {
      original_claim: originalClaim,
      modified_claim: modifiedClaim
    });
    return res.data;
  },

  getClaimsQueue: async (params = {}) => {
    const res = await client.get('/claims', { params });
    return res.data;
  },

  getClaimDetail: async (claimId) => {
    const res = await client.get(`/claims/${claimId}`);
    return res.data;
  },

  getPayers: async () => {
    const res = await client.get('/payers');
    return res.data;
  },

  getMetrics: async () => {
    const res = await client.get('/metrics');
    return res.data;
  },

  logOutcome: async (claimId, actualStatus, actualReasonCode = null) => {
    const res = await client.post('/outcomes', {
      claim_id: claimId,
      actual_status: actualStatus,
      actual_reason_code: actualReasonCode
    });
    return res.data;
  },

  uploadBatchCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/claims/batch-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

export default api;
