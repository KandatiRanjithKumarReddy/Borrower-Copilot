// ── Master Assessment Engine ─────────────────────────────────────────────────
// Orchestrates all engine modules to produce a single AssessmentResult.

import type { AssessmentInput, AssessmentResult, NegotiationCardData } from './types';
import { calculateSafeEmi, calculateSustainableIncome } from './affordability';
import { calculateEmi } from './emi';
import { calculateFairRate, shouldRecommendSecuredLoan } from './interestRate';
import { calculateAprRange } from './apr';
import {
  calculateLenderIndicativeAmount,
  calculateBorrowerSafeAmount,
  calculateTenureOptions,
  findRecommendedTenure,
} from './loanCapacity';
import { calculateStressTest } from './stressTest';
import { calculateConfidence } from './confidence';
import { generateRecommendation } from './recommendation';
import { generateNegotiationPoints } from './negotiation';

/**
 * Run the complete borrower assessment.
 * This is the single entry point for the UI layer.
 *
 * All financial logic is contained within the engine modules.
 * The UI should only call this function and render the result.
 */
export function assessBorrower(input: AssessmentInput): AssessmentResult {
  const { borrower, loan, financial } = input;

  // ── 1. Core Affordability ──────────────────────────────────────────────
  const affordability = calculateSafeEmi(borrower, financial);
  const sustainableIncome = calculateSustainableIncome(borrower);

  // ── 2. Interest Rate ───────────────────────────────────────────────────
  const rateResult = calculateFairRate(loan.loanType, borrower, financial);
  const midRate = (rateResult.fairRateMin + rateResult.fairRateMax) / 2;

  // ── 3. APR ─────────────────────────────────────────────────────────────
  const aprResult = calculateAprRange(
    loan.requestedAmount,
    rateResult.fairRateMin,
    rateResult.fairRateMax,
    loan.tenure,
    loan.loanType
  );

  // ── 4. EMI ─────────────────────────────────────────────────────────────
  const requestedEmi = calculateEmi(loan.requestedAmount, midRate, loan.tenure);
  const safeEmi = affordability.safeEmi;
  const emiCeiling = safeEmi; // EMI ceiling = safe EMI

  // ── 5. Amounts ─────────────────────────────────────────────────────────
  const lenderAmount = calculateLenderIndicativeAmount(input);
  const safeAmount = calculateBorrowerSafeAmount(input);
  const recommendedAmount = Math.min(loan.requestedAmount, safeAmount);

  // ── 6. Tenure Options ──────────────────────────────────────────────────
  const tenureOptions = calculateTenureOptions(
    recommendedAmount > 0 ? recommendedAmount : loan.requestedAmount,
    midRate,
    safeEmi,
    loan.tenure
  );
  const recommendedTenure = findRecommendedTenure(tenureOptions);
  // Mark the recommended tenure
  tenureOptions.forEach(t => {
    t.isRecommended = t.tenureYears === recommendedTenure;
  });

  // ── 7. Stress Test ─────────────────────────────────────────────────────
  const stressTest = calculateStressTest(input, requestedEmi);

  // ── 8. Confidence ──────────────────────────────────────────────────────
  const confidenceResult = calculateConfidence(input);

  // ── 9. Recommendation ──────────────────────────────────────────────────
  const recommendationResult = generateRecommendation(input);

  // ── 10. Secured Loan Check ─────────────────────────────────────────────
  const securedCheck = shouldRecommendSecuredLoan(
    loan.loanType,
    loan.requestedAmount,
    borrower
  );

  // ── 11. High-Cost Debt Warning ─────────────────────────────────────────
  let highCostDebtWarning = false;
  let highCostDebtMessage: string | undefined;
  if (financial.highCostDebtCount && financial.highCostDebtCount >= 1) {
    highCostDebtWarning = true;
    const rate = financial.highCostDebtRate ? `${financial.highCostDebtRate}%+` : 'high';
    highCostDebtMessage = `You have ${financial.highCostDebtCount} existing high-cost loan(s) at ${rate} interest. Consider clearing or consolidating these before new borrowing — they significantly impact your financial health.`;
  }

  // ── 12. Build Explanations ─────────────────────────────────────────────
  const explanations = [
    ...recommendationResult.explanations,
    ...rateResult.factors,
  ];

  if (securedCheck.suggest) {
    explanations.push(securedCheck.reason);
  }

  if (highCostDebtMessage) {
    explanations.push(highCostDebtMessage);
  }

  // ── 13. Build Result ───────────────────────────────────────────────────
  const result: AssessmentResult = {
    recommendation: recommendationResult.recommendation,
    recommendationReason: recommendationResult.reason,
    lenderIndicativeAmount: lenderAmount,
    borrowerSafeAmount: safeAmount,
    recommendedAmount: recommendedAmount > 0 ? recommendedAmount : 0,
    safeEmi,
    requestedEmi,
    emiCeiling,
    fairRateMin: rateResult.fairRateMin,
    fairRateMax: rateResult.fairRateMax,
    estimatedAprMin: aprResult.aprMin,
    estimatedAprMax: aprResult.aprMax,
    processingFeePercent: aprResult.processingFeePercent,
    recommendedTenure,
    tenureOptions,
    stressTest,
    confidence: confidenceResult.confidence,
    confidenceReasons: confidenceResult.reasons,
    explanations,
    negotiationCard: {} as NegotiationCardData, // Placeholder, filled below
    suggestSecuredLoan: securedCheck.suggest,
    securedLoanReason: securedCheck.reason,
    highCostDebtWarning,
    highCostDebtMessage,
    sustainableIncome,
    foirThreshold: affordability.foirThreshold,
    totalExistingObligations: affordability.totalObligations,
    availableForNewEmi: safeEmi,
  };

  // ── 14. Negotiation Card ───────────────────────────────────────────────
  const negotiationPoints = generateNegotiationPoints(result);
  const purposeLabel = loan.purpose.replace(/_/g, ' ');

  result.negotiationCard = {
    loanPurpose: purposeLabel.charAt(0).toUpperCase() + purposeLabel.slice(1),
    amountNeeded: loan.requestedAmount,
    borrowerSafeAmount: safeAmount,
    lenderIndicativeAmount: lenderAmount,
    emiCeiling,
    fairRateMin: rateResult.fairRateMin,
    fairRateMax: rateResult.fairRateMax,
    aprMin: aprResult.aprMin,
    aprMax: aprResult.aprMax,
    recommendedTenure,
    confidence: confidenceResult.confidence,
    recommendation: recommendationResult.recommendation,
    negotiationPoints,
  };

  return result;
}

// Re-export types and individual modules for advanced usage
export type {
  AssessmentInput,
  AssessmentResult,
  BorrowerProfile,
  LoanDetails,
  FinancialProfile,
  NegotiationCardData,
  TenureOption,
  StressTestResult,
  Recommendation,
  Confidence,
  EmploymentType,
  LoanPurpose,
  LoanType,
} from './types';
