// ── Stress Test Engine ───────────────────────────────────────────────────────
// Tests borrower resilience under adverse scenarios:
//   1. Income drop (15%)
//   2. Interest rate increase (+2%)

import type { AssessmentInput, StressTestResult } from './types';
import { calculateSustainableIncome } from './affordability';
import { calculateEmi } from './emi';
import { calculateFairRate } from './interestRate';

const INCOME_DROP_PERCENT = 0.15;    // 15% income reduction
const RATE_INCREASE_BPS = 200;       // +2% rate increase

/**
 * Run the income-drop stress test.
 *
 * Scenario: Monthly income drops by 15%.
 * Recalculates remaining surplus after existing + new EMI.
 */
export function stressTestIncomeDropResult(
  input: AssessmentInput,
  newEmi: number
): StressTestResult {
  const sustainableIncome = calculateSustainableIncome(input.borrower);
  const { existingEmi, rent, householdExpenses } = input.financial;

  // Normal case
  const normalTotalObligations = existingEmi + newEmi + rent + householdExpenses;
  const normalSurplus = sustainableIncome - normalTotalObligations;

  // Stressed case: income drops by 15%
  const stressedIncome = sustainableIncome * (1 - INCOME_DROP_PERCENT);
  const stressedSurplus = stressedIncome - normalTotalObligations;

  const isManageable = stressedSurplus > 0;

  return {
    scenario: `Income drops by ${INCOME_DROP_PERCENT * 100}%`,
    normalEmi: newEmi,
    stressedEmi: newEmi, // EMI stays same, income drops
    normalSurplus: Math.round(normalSurplus),
    stressedSurplus: Math.round(stressedSurplus),
    isManageable,
    explanation: isManageable
      ? `If your income drops by ${INCOME_DROP_PERCENT * 100}%, you would still have ₹${Math.round(stressedSurplus).toLocaleString('en-IN')} monthly surplus after all obligations. Your position remains manageable.`
      : `If your income drops by ${INCOME_DROP_PERCENT * 100}%, your monthly obligations would exceed your reduced income by ₹${Math.round(Math.abs(stressedSurplus)).toLocaleString('en-IN')}. This indicates financial stress.`,
  };
}

/**
 * Run the rate-increase stress test.
 *
 * Scenario: Interest rate increases by 2%.
 * Recalculates EMI at the higher rate.
 */
export function stressTestRateIncreaseResult(
  input: AssessmentInput,
  newEmi: number
): StressTestResult {
  const sustainableIncome = calculateSustainableIncome(input.borrower);
  const { existingEmi, rent, householdExpenses } = input.financial;

  const rateResult = calculateFairRate(input.loan.loanType, input.borrower, input.financial);
  const midRate = (rateResult.fairRateMin + rateResult.fairRateMax) / 2;
  const stressedRate = midRate + RATE_INCREASE_BPS / 100;

  const stressedEmi = calculateEmi(input.loan.requestedAmount, stressedRate, input.loan.tenure);

  const normalTotalObligations = existingEmi + newEmi + rent + householdExpenses;
  const stressedTotalObligations = existingEmi + stressedEmi + rent + householdExpenses;

  const normalSurplus = sustainableIncome - normalTotalObligations;
  const stressedSurplus = sustainableIncome - stressedTotalObligations;

  const isManageable = stressedSurplus > 0;

  return {
    scenario: `Interest rate increases by ${RATE_INCREASE_BPS / 100}%`,
    normalEmi: newEmi,
    stressedEmi,
    normalSurplus: Math.round(normalSurplus),
    stressedSurplus: Math.round(stressedSurplus),
    isManageable,
    explanation: isManageable
      ? `If your interest rate rises by ${RATE_INCREASE_BPS / 100}%, your EMI would increase from ₹${newEmi.toLocaleString('en-IN')} to ₹${stressedEmi.toLocaleString('en-IN')}. You would still have ₹${Math.round(stressedSurplus).toLocaleString('en-IN')} monthly surplus.`
      : `If your interest rate rises by ${RATE_INCREASE_BPS / 100}%, your EMI would increase to ₹${stressedEmi.toLocaleString('en-IN')}, pushing your total obligations above your income.`,
  };
}

/**
 * Run the primary stress test — choose the most relevant scenario.
 * Income drop is the default; rate increase is used for variable-rate products.
 */
export function calculateStressTest(
  input: AssessmentInput,
  newEmi: number
): StressTestResult {
  // For home loans and LAP (typically floating rate), test rate increase
  const floatingRateProducts = ['home_loan', 'loan_against_property'];
  if (floatingRateProducts.includes(input.loan.loanType)) {
    return stressTestRateIncreaseResult(input, newEmi);
  }

  // For all others, test income drop
  return stressTestIncomeDropResult(input, newEmi);
}
