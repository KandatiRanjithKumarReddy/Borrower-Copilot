// ── Recommendation Engine ────────────────────────────────────────────────────
// Determines BORROW / BORROW_LESS / DONT_BORROW based on comprehensive analysis.

import type { AssessmentInput, Recommendation } from './types';
import { calculateSafeEmi, calculateSustainableIncome } from './affordability';
import { calculateEmi } from './emi';
import { calculateFairRate } from './interestRate';
import { calculateBorrowerSafeAmount } from './loanCapacity';

interface RecommendationResult {
  recommendation: Recommendation;
  reason: string;
  explanations: string[];
}

/**
 * Generate the borrow recommendation.
 *
 * DONT_BORROW is reached when:
 *   - Existing debt burden already too high (FOIR > 65%)
 *   - Safe EMI = ₹0 (no capacity)
 *   - Recent EMI bounce + high-cost debt (active financial stress)
 *   - Requested EMI > 2× safe EMI (extreme overshoot)
 *   - Income = 0
 *
 * BORROW_LESS is reached when:
 *   - Requested amount > borrower-safe amount
 *   - Requested EMI exceeds safe EMI by > 15%
 *   - High-cost existing debt but some capacity remains
 *
 * BORROW is reached when:
 *   - Safe EMI comfortably covers requested EMI
 *   - Debt burden is manageable
 *   - No immediate financial stress indicators
 */
export function generateRecommendation(input: AssessmentInput): RecommendationResult {
  const { borrower, loan, financial } = input;
  const explanations: string[] = [];

  // Zero income → never recommend borrowing
  if (borrower.monthlyIncome <= 0) {
    return {
      recommendation: 'DONT_BORROW',
      reason: 'You have no reported income. Borrowing without income would create unmanageable debt.',
      explanations: ['No income reported — borrowing is not advisable.'],
    };
  }

  const sustainableIncome = calculateSustainableIncome(borrower);
  const { safeEmi, foirThreshold } = calculateSafeEmi(borrower, financial);

  // Calculate requested EMI
  const rateResult = calculateFairRate(loan.loanType, borrower, financial);
  const midRate = (rateResult.fairRateMin + rateResult.fairRateMax) / 2;
  const requestedEmi = calculateEmi(loan.requestedAmount, midRate, loan.tenure);

  // Current FOIR including existing obligations
  const currentFoir = financial.existingEmi / sustainableIncome;

  // FOIR after new loan
  const newFoir = (financial.existingEmi + requestedEmi) / sustainableIncome;

  const safeAmount = calculateBorrowerSafeAmount(input);

  // ── DON'T BORROW checks ──────────────────────────────────────────────

  // 1. Safe EMI is zero — no capacity at all
  if (safeEmi <= 0) {
    explanations.push('Your current financial obligations already consume your available income.');
    explanations.push('Taking on additional debt would push you beyond a safe affordability level.');
    return {
      recommendation: 'DONT_BORROW',
      reason: 'Your current obligations already exhaust your available payment capacity. Additional borrowing is not advisable at this time.',
      explanations,
    };
  }

  // 2. Recent EMI bounce + high-cost debt = active financial stress
  if (financial.recentBounce && financial.highCostDebtCount && financial.highCostDebtCount >= 2) {
    explanations.push('You have a recent EMI bounce combined with multiple high-cost loans.');
    explanations.push('This indicates active financial stress. Adding more debt is risky.');
    explanations.push('Consider clearing existing high-cost debt before new borrowing.');
    return {
      recommendation: 'DONT_BORROW',
      reason: 'Recent EMI bounce combined with multiple high-cost loans indicates financial stress. Focus on resolving existing debt before new borrowing.',
      explanations,
    };
  }

  // 3. Extremely high existing FOIR (>65%)
  if (currentFoir > 0.65) {
    explanations.push(`Your existing debt obligations already consume ${Math.round(currentFoir * 100)}% of your sustainable income.`);
    explanations.push('This is above the safe threshold. Adding more debt is not advisable.');
    return {
      recommendation: 'DONT_BORROW',
      reason: `Your existing debt-to-income ratio of ${Math.round(currentFoir * 100)}% already exceeds safe limits. Reduce existing obligations before new borrowing.`,
      explanations,
    };
  }

  // 4. Requested EMI > 2× safe EMI (extreme overshoot)
  if (requestedEmi > safeEmi * 2) {
    explanations.push(`Your requested EMI of ₹${requestedEmi.toLocaleString('en-IN')} is more than double your safe EMI capacity of ₹${safeEmi.toLocaleString('en-IN')}.`);
    explanations.push('This level of borrowing would create severe financial stress.');

    // If even a reduced amount isn't viable
    if (safeAmount < loan.requestedAmount * 0.3) {
      return {
        recommendation: 'DONT_BORROW',
        reason: 'The requested amount far exceeds your safe borrowing capacity. Even a significantly reduced loan would strain your finances.',
        explanations,
      };
    }
  }

  // 5. Recent bounce with overdue and requested EMI > safe
  if (financial.recentBounce && requestedEmi > safeEmi) {
    explanations.push('You have a recent EMI bounce, indicating current repayment difficulty.');
    explanations.push('Taking on additional EMI beyond your safe limit is not advisable.');
    if (financial.highCostDebtRate && financial.highCostDebtRate > 25) {
      explanations.push(`Your existing loans carry very high interest rates (${financial.highCostDebtRate}%+). Consider consolidating or clearing these first.`);
    }
    return {
      recommendation: 'DONT_BORROW',
      reason: 'A recent EMI bounce indicates current repayment difficulty. Stabilise your existing obligations before taking on new debt.',
      explanations,
    };
  }

  // ── BORROW LESS checks ────────────────────────────────────────────────

  // 1. Requested amount exceeds safe amount
  if (loan.requestedAmount > safeAmount && safeAmount > 0) {
    explanations.push(`Your requested amount of ₹${(loan.requestedAmount / 100000).toFixed(1)} lakh exceeds your safe borrowing capacity of ₹${(safeAmount / 100000).toFixed(1)} lakh.`);
    explanations.push(`Borrowing ₹${(safeAmount / 100000).toFixed(1)} lakh instead would keep your EMI within a comfortable level.`);

    if (financial.highCostDebtCount && financial.highCostDebtCount >= 1) {
      explanations.push('Consider clearing existing high-cost debt to improve your borrowing capacity.');
    }

    return {
      recommendation: 'BORROW_LESS',
      reason: `Your requested amount exceeds what you can safely afford. Consider borrowing up to ₹${(safeAmount / 100000).toFixed(1)} lakh to keep your EMI manageable.`,
      explanations,
    };
  }

  // 2. Requested EMI exceeds safe EMI by more than 15%
  if (requestedEmi > safeEmi * 1.15) {
    explanations.push(`Your requested EMI of ₹${requestedEmi.toLocaleString('en-IN')} exceeds your safe EMI ceiling of ₹${safeEmi.toLocaleString('en-IN')}.`);
    explanations.push('Consider reducing the loan amount or extending the tenure to bring EMI within safe limits.');
    return {
      recommendation: 'BORROW_LESS',
      reason: `Your requested EMI exceeds the safe ceiling by more than 15%. A lower amount or longer tenure would improve affordability.`,
      explanations,
    };
  }

  // 3. New FOIR would exceed threshold
  if (newFoir > foirThreshold) {
    explanations.push(`Adding this loan would push your total debt-to-income ratio to ${Math.round(newFoir * 100)}%, above the recommended ${Math.round(foirThreshold * 100)}% threshold.`);
    explanations.push('A smaller loan amount would keep your debt burden manageable.');
    return {
      recommendation: 'BORROW_LESS',
      reason: `This loan would push your debt-to-income ratio to ${Math.round(newFoir * 100)}%, above the safe threshold. Consider a smaller amount.`,
      explanations,
    };
  }

  // ── BORROW ────────────────────────────────────────────────────────────

  explanations.push(`Your requested EMI of ₹${requestedEmi.toLocaleString('en-IN')} is within your safe EMI ceiling of ₹${safeEmi.toLocaleString('en-IN')}.`);
  explanations.push(`Your total debt-to-income ratio would be ${Math.round(newFoir * 100)}%, within the recommended ${Math.round(foirThreshold * 100)}% threshold.`);

  if (financial.emergencySavings && financial.emergencySavings >= sustainableIncome * 3) {
    explanations.push('You have adequate emergency savings, providing a safety buffer.');
  }

  if (loan.requestedAmount <= safeAmount) {
    explanations.push(`Your requested amount of ₹${(loan.requestedAmount / 100000).toFixed(1)} lakh is within your safe borrowing capacity.`);
  }

  return {
    recommendation: 'BORROW',
    reason: 'Your loan request is within safe affordability limits. Your income and existing obligations allow for this additional borrowing.',
    explanations,
  };
}
