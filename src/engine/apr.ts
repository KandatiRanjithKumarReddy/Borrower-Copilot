// ── APR / All-In Cost Engine ─────────────────────────────────────────────────
// Calculates the approximate Annual Percentage Rate including
// processing fees and one-time charges on top of the nominal rate.

import type { LoanType } from './types';

// ── Processing Fee Assumptions ───────────────────────────────────────────────

const PROCESSING_FEE_PERCENT: Record<LoanType, number> = {
  home_loan:              0.5,
  loan_against_property:  1.0,
  personal_loan:          2.0,
  gold_loan:              1.0,
  two_wheeler_loan:       1.5,
  business_loan:          2.0,
  other:                  2.0,
};

const GST_RATE = 0.18; // 18% GST on processing fee

/**
 * Get the assumed processing fee percentage for a loan type.
 */
export function getProcessingFeePercent(loanType: LoanType): number {
  return PROCESSING_FEE_PERCENT[loanType] ?? 2.0;
}

/**
 * Calculate the processing fee amount including GST.
 */
export function calculateProcessingFee(
  principal: number,
  loanType: LoanType
): number {
  const feePercent = getProcessingFeePercent(loanType);
  const baseFee = principal * (feePercent / 100);
  const totalFee = baseFee * (1 + GST_RATE);
  return Math.round(totalFee);
}

/**
 * Calculate approximate APR (Annual Percentage Rate).
 *
 * APR accounts for the processing fee by computing the effective rate
 * on the net disbursement (loan amount minus upfront fee).
 *
 * Method: The borrower receives (P - fee) but repays EMI based on P.
 * We find the rate that makes PV of EMI payments = (P - fee).
 * Uses Newton-Raphson iteration for accuracy.
 */
export function calculateApr(
  principal: number,
  nominalAnnualRate: number,
  tenureYears: number,
  loanType: LoanType
): number {
  if (principal <= 0 || nominalAnnualRate <= 0 || tenureYears <= 0) return 0;

  const fee = calculateProcessingFee(principal, loanType);
  const netDisbursement = principal - fee;
  const n = tenureYears * 12;

  // Calculate EMI on full principal at nominal rate
  const r = nominalAnnualRate / 100 / 12;
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);

  // Newton-Raphson to find the rate where PV of EMI payments = netDisbursement
  let guess = nominalAnnualRate / 100 / 12; // start with nominal monthly rate

  for (let iter = 0; iter < 100; iter++) {
    const g1r = Math.pow(1 + guess, n);
    const pv = emi * (g1r - 1) / (guess * g1r);
    const dpv = emi * (
      ((n * Math.pow(1 + guess, n - 1) * guess * g1r) - (g1r - 1) * (g1r + guess * n * Math.pow(1 + guess, n - 1)))
      / (guess * g1r) ** 2
    );

    const diff = pv - netDisbursement;
    if (Math.abs(diff) < 0.01) break;

    guess = guess - diff / dpv;
    if (guess <= 0) guess = 0.001; // prevent negative rate
  }

  const apr = guess * 12 * 100;
  return Math.round(apr * 100) / 100;
}

/**
 * Calculate APR range given a rate range.
 */
export function calculateAprRange(
  principal: number,
  rateMin: number,
  rateMax: number,
  tenureYears: number,
  loanType: LoanType
): { aprMin: number; aprMax: number; processingFeePercent: number; processingFeeAmount: number } {
  const aprMin = calculateApr(principal, rateMin, tenureYears, loanType);
  const aprMax = calculateApr(principal, rateMax, tenureYears, loanType);
  const processingFeePercent = getProcessingFeePercent(loanType);
  const processingFeeAmount = calculateProcessingFee(principal, loanType);

  return { aprMin, aprMax, processingFeePercent, processingFeeAmount };
}
