// ── Interest Rate Engine ─────────────────────────────────────────────────────
// Product-specific base rate bands with adjustments for credit quality,
// employment stability, and debt profile.
// All rate bands are documented in RULES.md.

import type { LoanType, BorrowerProfile, FinancialProfile } from './types';

// ── Product Rate Bands (Annual %) ────────────────────────────────────────────

export interface RateBand {
  min: number;
  max: number;
}

const PRODUCT_RATE_BANDS: Record<LoanType, RateBand> = {
  home_loan:              { min: 8.5,  max: 9.75 },
  loan_against_property:  { min: 9.0,  max: 12.0 },
  personal_loan:          { min: 10.5, max: 24.0 },
  gold_loan:              { min: 9.5,  max: 14.0 },
  two_wheeler_loan:       { min: 11.0, max: 18.0 },
  business_loan:          { min: 13.0, max: 22.0 },
  other:                  { min: 12.0, max: 24.0 },
};

// ── Credit Score Adjustment ──────────────────────────────────────────────────

function getCreditScoreAdjustment(creditScore: number | undefined): {
  minAdj: number;
  maxAdj: number;
  widening: number;
} {
  if (creditScore === undefined) {
    // Unknown: widen range significantly, don't assume worst
    return { minAdj: 1.0, maxAdj: 3.0, widening: 2.5 };
  }

  if (creditScore >= 780) {
    // Excellent
    return { minAdj: -1.0, maxAdj: -2.0, widening: 0 };
  }
  if (creditScore >= 720) {
    // Good
    return { minAdj: -0.5, maxAdj: -1.0, widening: 0 };
  }
  if (creditScore >= 650) {
    // Fair
    return { minAdj: 0.5, maxAdj: 0.5, widening: 0.5 };
  }
  // Below 650 — higher risk
  return { minAdj: 2.0, maxAdj: 4.0, widening: 2.0 };
}

// ── Employment Stability Adjustment ──────────────────────────────────────────

function getEmploymentAdjustment(borrower: BorrowerProfile): {
  minAdj: number;
  maxAdj: number;
} {
  const { employmentType, incomeStability, yearsEmployed } = borrower;

  let adj = { minAdj: 0, maxAdj: 0 };

  // Employment type base adjustment
  if (employmentType === 'self-employed') {
    adj = { minAdj: 0.5, maxAdj: 1.0 };
  } else if (employmentType === 'informal') {
    adj = { minAdj: 1.0, maxAdj: 2.0 };
  }

  // Stability adjustment
  if (incomeStability === 'highly_variable') {
    adj.minAdj += 0.5;
    adj.maxAdj += 1.5;
  } else if (incomeStability === 'variable') {
    adj.minAdj += 0.25;
    adj.maxAdj += 0.75;
  }

  // Tenure with employer / in business
  if (yearsEmployed !== undefined) {
    if (yearsEmployed >= 5) {
      adj.minAdj -= 0.25;
      adj.maxAdj -= 0.5;
    } else if (yearsEmployed < 1) {
      adj.minAdj += 0.5;
      adj.maxAdj += 1.0;
    }
  }

  return adj;
}

// ── Debt Profile Adjustment ──────────────────────────────────────────────────

function getDebtAdjustment(financial: FinancialProfile): {
  minAdj: number;
  maxAdj: number;
} {
  let minAdj = 0;
  let maxAdj = 0;

  if (financial.recentBounce) {
    minAdj += 1.0;
    maxAdj += 2.0;
  }

  if (financial.highCostDebtCount && financial.highCostDebtCount >= 2) {
    minAdj += 0.5;
    maxAdj += 1.5;
  }

  if (financial.existingOverdue && financial.existingOverdue > 0) {
    minAdj += 0.5;
    maxAdj += 1.0;
  }

  return { minAdj, maxAdj };
}

// ── Fair Rate Calculation ────────────────────────────────────────────────────

export interface FairRateResult {
  fairRateMin: number;
  fairRateMax: number;
  explanation: string;
  factors: string[];
}

export function calculateFairRate(
  loanType: LoanType,
  borrower: BorrowerProfile,
  financial: FinancialProfile
): FairRateResult {
  const baseBand = PRODUCT_RATE_BANDS[loanType] ?? PRODUCT_RATE_BANDS.other;
  const creditAdj = getCreditScoreAdjustment(financial.creditScore);
  const empAdj = getEmploymentAdjustment(borrower);
  const debtAdj = getDebtAdjustment(financial);

  let min = baseBand.min + creditAdj.minAdj + empAdj.minAdj + debtAdj.minAdj;
  let max = baseBand.max + creditAdj.maxAdj + empAdj.maxAdj + debtAdj.maxAdj;

  // Ensure min ≤ max and reasonable bounds
  min = Math.max(6, Math.round(min * 100) / 100);
  max = Math.max(min + 0.5, Math.round(max * 100) / 100);
  max = Math.min(36, max); // cap at 36%

  const factors: string[] = [];

  if (financial.creditScore === undefined) {
    factors.push('Your credit history is unknown — the rate range is wider to account for uncertainty.');
  } else if (financial.creditScore >= 750) {
    factors.push(`Your credit score of ${financial.creditScore} is excellent — you qualify for lower rates.`);
  } else if (financial.creditScore >= 650) {
    factors.push(`Your credit score of ${financial.creditScore} is fair — rates are near the mid-range.`);
  } else {
    factors.push(`Your credit score of ${financial.creditScore} is below average — expect higher rates.`);
  }

  if (borrower.employmentType === 'self-employed') {
    factors.push('Self-employed borrowers typically see slightly higher rates than salaried borrowers.');
  } else if (borrower.employmentType === 'informal') {
    factors.push('Informal / gig income attracts higher rates due to income verification challenges.');
  }

  if (financial.recentBounce) {
    factors.push('A recent EMI bounce raises your perceived risk to lenders.');
  }

  if (financial.highCostDebtCount && financial.highCostDebtCount >= 2) {
    factors.push('Multiple high-cost loans on your profile may push offered rates higher.');
  }

  const productLabel = loanType.replace(/_/g, ' ');
  const explanation = `Your fair rate range for a ${productLabel} is ${min.toFixed(1)}%–${max.toFixed(1)}% based on your profile. ${factors.join(' ')}`;

  return { fairRateMin: min, fairRateMax: max, explanation, factors };
}

// ── Secured Loan Recommendation ──────────────────────────────────────────────

export function shouldRecommendSecuredLoan(
  loanType: LoanType,
  requestedAmount: number,
  borrower: BorrowerProfile
): { suggest: boolean; reason: string } {
  // If already secured, no need
  if (['home_loan', 'loan_against_property', 'gold_loan'].includes(loanType)) {
    return { suggest: false, reason: '' };
  }

  // If borrower has collateral and is requesting a large unsecured loan
  if (borrower.collateralValue && borrower.collateralValue > 0) {
    const ltvRatio = requestedAmount / borrower.collateralValue;
    if (requestedAmount >= 500000 && ltvRatio <= 0.65) {
      const securedBand = PRODUCT_RATE_BANDS.loan_against_property;
      const unsecuredBand = PRODUCT_RATE_BANDS[loanType] ?? PRODUCT_RATE_BANDS.personal_loan;
      return {
        suggest: true,
        reason: `You have collateral worth approximately ₹${(borrower.collateralValue / 100000).toFixed(0)} lakh. `
          + `A loan against property could offer rates of ${securedBand.min}%–${securedBand.max}% `
          + `compared to ${unsecuredBand.min}%–${unsecuredBand.max}% for an unsecured ${loanType.replace(/_/g, ' ')}. `
          + `This could significantly reduce your interest cost and improve affordability.`,
      };
    }
  }

  return { suggest: false, reason: '' };
}

export function getProductRateBand(loanType: LoanType): RateBand {
  return PRODUCT_RATE_BANDS[loanType] ?? PRODUCT_RATE_BANDS.other;
}
