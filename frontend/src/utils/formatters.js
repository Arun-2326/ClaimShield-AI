/**
 * ClaimShield AI - Data Formatters
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return "0.0%";
  return `${(val * 100).toFixed(1)}%`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
};
