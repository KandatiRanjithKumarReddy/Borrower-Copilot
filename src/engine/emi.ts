// ── EMI Calculation Engine ───────────────────────────────────────────────────
// Uses standard reducing-balance formula:
//   EMI = P × r × (1+r)^n / ((1+r)^n − 1)
// Where P = principal, r = monthly rate, n = months.

/**
 * Calculate monthly EMI using reducing-balance method.
 * @param principal  Loan amount in ₹
 * @param annualRate Annual interest rate as percentage (e.g. 12 for 12%)
 * @param tenureYears Loan tenure in years
 * @returns Monthly EMI amount
 */
export function calculateEmi(
  principal: number,
  annualRate: number,
  tenureYears: number
): number {
  if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;

  const r = annualRate / 100 / 12; // monthly rate
  const n = tenureYears * 12;       // total months

  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Calculate total interest paid over the loan tenure.
 */
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  tenureYears: number
): number {
  const emi = calculateEmi(principal, annualRate, tenureYears);
  const totalPayment = emi * tenureYears * 12;
  return Math.max(0, totalPayment - principal);
}

/**
 * Calculate total repayment amount (principal + interest).
 */
export function calculateTotalRepayment(
  principal: number,
  annualRate: number,
  tenureYears: number
): number {
  const emi = calculateEmi(principal, annualRate, tenureYears);
  return emi * tenureYears * 12;
}

/**
 * Inverse EMI: given a target monthly EMI, rate and tenure, find the max principal.
 * P = EMI × ((1+r)^n − 1) / (r × (1+r)^n)
 */
export function calculateMaxPrincipal(
  targetEmi: number,
  annualRate: number,
  tenureYears: number
): number {
  if (targetEmi <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;

  const r = annualRate / 100 / 12;
  const n = tenureYears * 12;

  const principal = targetEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  return Math.round(principal);
}
