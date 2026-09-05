// ── INR Formatting and Utility Functions ─────────────────────────────────────

/**
 * Format a number as Indian Rupees with proper comma separators.
 * e.g., 800000 → "₹8,00,000"
 */
export function formatINR(amount: number): string {
  if (amount === 0) return '₹0';

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const str = absAmount.toString();

  // Indian number system: last 3 digits, then groups of 2
  if (str.length <= 3) {
    return `${isNegative ? '-' : ''}₹${str}`;
  }

  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Format amount in lakhs for display.
 * e.g., 800000 → "₹8.00 lakh"
 */
export function formatLakh(amount: number): string {
  if (amount === 0) return '₹0';

  const lakhs = amount / 100000;
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    return `₹${crores.toFixed(2)} crore`;
  }
  return `₹${lakhs.toFixed(2)} lakh`;
}

/**
 * Format amount as compact lakhs/crores.
 * e.g., 800000 → "₹8L", 1500000 → "₹15L"
 */
export function formatCompact(amount: number): string {
  if (amount === 0) return '₹0';

  const lakhs = amount / 100000;
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    return `₹${crores.toFixed(1)}Cr`;
  }
  if (lakhs >= 1) {
    return `₹${lakhs.toFixed(1)}L`;
  }
  return formatINR(amount);
}

/**
 * Format percentage with specified decimal places.
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format rate range.
 */
export function formatRateRange(min: number, max: number): string {
  return `${min.toFixed(1)}%–${max.toFixed(1)}%`;
}

/**
 * Format tenure in human-readable form.
 */
export function formatTenure(years: number): string {
  if (years === 1) return '1 year';
  return `${years} years`;
}

/**
 * Parse Indian currency string to number.
 * Removes ₹, commas, spaces and returns numeric value.
 */
export function parseINR(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Get recommendation color class.
 */
export function getRecommendationColor(rec: string): {
  bg: string;
  text: string;
  border: string;
  bgLight: string;
} {
  switch (rec) {
    case 'BORROW':
      return {
        bg: 'bg-success-500',
        text: 'text-success-700',
        border: 'border-success-500',
        bgLight: 'bg-success-50',
      };
    case 'BORROW_LESS':
      return {
        bg: 'bg-warning-500',
        text: 'text-warning-700',
        border: 'border-warning-500',
        bgLight: 'bg-warning-50',
      };
    case 'DONT_BORROW':
      return {
        bg: 'bg-danger-500',
        text: 'text-danger-700',
        border: 'border-danger-500',
        bgLight: 'bg-danger-50',
      };
    default:
      return {
        bg: 'bg-slate-500',
        text: 'text-slate-700',
        border: 'border-slate-500',
        bgLight: 'bg-slate-50',
      };
  }
}

/**
 * Get confidence color class.
 */
export function getConfidenceColor(confidence: string): {
  bg: string;
  text: string;
} {
  switch (confidence) {
    case 'HIGH':
      return { bg: 'bg-success-100', text: 'text-success-700' };
    case 'MEDIUM':
      return { bg: 'bg-warning-100', text: 'text-warning-700' };
    case 'LOW':
      return { bg: 'bg-danger-100', text: 'text-danger-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
}

/**
 * Format recommendation label for display.
 */
export function formatRecommendation(rec: string): string {
  switch (rec) {
    case 'BORROW':
      return 'Borrow';
    case 'BORROW_LESS':
      return 'Borrow Less';
    case 'DONT_BORROW':
      return "Don't Borrow";
    default:
      return rec;
  }
}
