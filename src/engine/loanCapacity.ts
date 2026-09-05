// ── Loan Capacity Engine ─────────────────────────────────────────────────────
// Calculates two distinct amounts:
//   A. Lender-Indicative Amount — what a bank might potentially sanction
//   B. Borrower-Safe Amount — what the borrower can responsibly afford

import type { AssessmentInput, TenureOption } from './types';
import { calculateSafeEmi } from './affordability';
import { calculateEmi, calculateMaxPrincipal, calculateTotalInterest, calculateTotalRepayment } from './emi';
import { calculateFairRate } from './interestRate';

// ── Lender-Indicative Amount ─────────────────────────────────────────────────

/**
 * Estimate what a lender might sanction.
 * Uses standard lender FOIR multipliers which are typically more generous
 * than borrower-safe thresholds.
 *
 * Lender FOIR is typically:
 *   Salaried: 55–65% of gross/net income
 *   Self-employed: 50–55% of ITR income
 *   Informal: 40–45%
 *
 * This is NOT an approval — it's an indicative calculation.
 */
export function calculateLenderIndicativeAmount(input: AssessmentInput): number {
  const { borrower, loan, financial } = input;
  const { employmentType, monthlyIncome, itrAnnualIncome } = borrower;

  // Lender uses declared/verifiable income
  let lenderIncome: number;
  switch (employmentType) {
    case 'salaried':
      lenderIncome = monthlyIncome;
      break;
    case 'self-employed':
      // Lenders typically use ITR income
      lenderIncome = itrAnnualIncome ? itrAnnualIncome / 12 : monthlyIncome * 0.5;
      break;
    case 'informal':
      lenderIncome = monthlyIncome * 0.5; // Lenders heavily discount informal income
      break;
    default:
      lenderIncome = monthlyIncome;
  }

  // Lender FOIR thresholds (more generous than borrower-safe)
  let lenderFoir: number;
  switch (employmentType) {
    case 'salaried':
      lenderFoir = lenderIncome >= 100000 ? 0.65 : lenderIncome >= 50000 ? 0.60 : 0.55;
      break;
    case 'self-employed':
      lenderFoir = 0.55;
      break;
    case 'informal':
      lenderFoir = 0.45;
      break;
    default:
      lenderFoir = 0.55;
  }

  // Max EMI lender would allow
  const maxLenderEmi = Math.max(0, lenderIncome * lenderFoir - financial.existingEmi);

  // Use midpoint of fair rate range for calculation
  const rateResult = calculateFairRate(loan.loanType, borrower, financial);
  const midRate = (rateResult.fairRateMin + rateResult.fairRateMax) / 2;

  // Max principal at that EMI and rate
  const lenderAmount = calculateMaxPrincipal(maxLenderEmi, midRate, loan.tenure);

  return Math.round(lenderAmount / 10000) * 10000; // Round to nearest ₹10,000
}

// ── Borrower-Safe Amount ─────────────────────────────────────────────────────

/**
 * Calculate what the borrower can safely borrow.
 * Uses the more conservative borrower-side FOIR and cash-flow constraints.
 */
export function calculateBorrowerSafeAmount(input: AssessmentInput): number {
  const { borrower, loan, financial } = input;

  const { safeEmi } = calculateSafeEmi(borrower, financial);

  if (safeEmi <= 0) return 0;

  // Use the lower end of rate range (optimistic but fair)
  const rateResult = calculateFairRate(loan.loanType, borrower, financial);
  const rateForCalc = (rateResult.fairRateMin + rateResult.fairRateMax) / 2;

  const safeAmount = calculateMaxPrincipal(safeEmi, rateForCalc, loan.tenure);

  return Math.round(safeAmount / 10000) * 10000; // Round to nearest ₹10,000
}

// ── Tenure Options ───────────────────────────────────────────────────────────

/**
 * Generate tenure trade-off table showing EMI and total interest for
 * multiple tenure options.
 */
export function calculateTenureOptions(
  amount: number,
  rate: number,
  safeEmi: number,
  currentTenure: number
): TenureOption[] {
  const possibleTenures = [1, 2, 3, 5, 7, 10];

  // Ensure the current tenure is included
  const tenures = [...new Set([...possibleTenures, currentTenure])].sort((a, b) => a - b);

  return tenures.map(t => {
    const emi = calculateEmi(amount, rate, t);
    const totalInterest = calculateTotalInterest(amount, rate, t);
    const totalRepayment = calculateTotalRepayment(amount, rate, t);
    const isAffordable = emi <= safeEmi || safeEmi === 0;

    return {
      tenureYears: t,
      emi,
      totalInterest,
      totalRepayment,
      isRecommended: false, // Will be set by recommendation engine
      isAffordable,
    };
  });
}

/**
 * Find the shortest affordable tenure.
 */
export function findRecommendedTenure(tenureOptions: TenureOption[]): number {
  // Find shortest tenure where EMI is affordable
  const affordable = tenureOptions.filter(t => t.isAffordable && t.emi > 0);
  if (affordable.length > 0) {
    return affordable[0].tenureYears;
  }
  // If nothing is affordable, return the longest available
  return tenureOptions[tenureOptions.length - 1]?.tenureYears ?? 5;
}
