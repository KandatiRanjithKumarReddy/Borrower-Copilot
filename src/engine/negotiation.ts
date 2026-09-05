// ── Negotiation Points Generator ─────────────────────────────────────────────
// Generates 3–5 actionable, concise negotiation points for the borrower
// to use directly in a lender conversation.

import type { AssessmentResult } from './types';

/**
 * Generate borrower-specific negotiation talking points.
 */
export function generateNegotiationPoints(result: AssessmentResult): string[] {
  const points: string[] = [];

  // 1. EMI ceiling point
  points.push(
    `I want to keep my EMI at or below ₹${result.emiCeiling.toLocaleString('en-IN')}/month.`
  );

  // 2. Rate range point
  points.push(
    `My estimated fair rate range is ${result.fairRateMin.toFixed(1)}%–${result.fairRateMax.toFixed(1)}%. I would like the offered rate to be within this range.`
  );

  // 3. Fee transparency point
  points.push(
    'Please share the processing fee, all one-time charges, and the total repayment amount upfront.'
  );

  // 4. APR point
  points.push(
    `Please provide the effective annualised cost (APR). My estimate is ${result.estimatedAprMin.toFixed(1)}%–${result.estimatedAprMax.toFixed(1)}%.`
  );

  // 5. Conditional points based on situation
  if (result.recommendation === 'BORROW_LESS') {
    points.push(
      `I am considering borrowing up to ₹${(result.borrowerSafeAmount / 100000).toFixed(1)} lakh rather than my initial request, to maintain comfortable repayment.`
    );
  }

  if (result.suggestSecuredLoan) {
    points.push(
      'I am open to discussing a secured loan option if it offers a significantly better rate.'
    );
  }

  if (result.recommendedTenure !== result.tenureOptions.find(t => t.isRecommended)?.tenureYears) {
    // Tenure flexibility point
    points.push(
      `I prefer a tenure of ${result.recommendedTenure} years to balance EMI affordability and total interest cost.`
    );
  }

  // Cap at 5 points
  return points.slice(0, 5);
}
