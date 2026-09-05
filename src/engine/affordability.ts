// ── Affordability Engine ─────────────────────────────────────────────────────
// Determines sustainable income, FOIR thresholds, and available payment capacity.
// All thresholds are documented in RULES.md.

import type { BorrowerProfile, FinancialProfile, EmploymentType } from './types';

// ── Sustainable Income ───────────────────────────────────────────────────────

/**
 * Determine the sustainable monthly income to use for affordability calculations.
 * - Salaried: Net monthly income, haircut for variable pay.
 * - Self-employed: Weighted blend of ITR-declared and typical cash income.
 * - Informal/gig: Conservative baseline from lowest recent income.
 *
 * NEVER uses the highest reported income as the base.
 */
export function calculateSustainableIncome(borrower: BorrowerProfile): number {
  const { employmentType, monthlyIncome, incomeLow, variablePayPercent, itrAnnualIncome } = borrower;

  switch (employmentType) {
    case 'salaried': {
      // If variable pay exists, haircut the variable portion by 50%
      const variablePct = variablePayPercent ?? 0;
      const fixedPortion = monthlyIncome * (1 - variablePct / 100);
      const variablePortion = monthlyIncome * (variablePct / 100) * 0.5;
      return Math.round(fixedPortion + variablePortion);
    }

    case 'self-employed': {
      // ITR income is verifiable; cash income is claimed
      const itrMonthly = itrAnnualIncome ? itrAnnualIncome / 12 : 0;
      const typicalCash = monthlyIncome;
      const lowestCash = incomeLow ?? typicalCash * 0.6;

      if (itrMonthly > 0) {
        // Weighted: 60% ITR (verifiable) + 25% typical cash + 15% lowest cash
        const blended = itrMonthly * 0.6 + typicalCash * 0.25 + lowestCash * 0.15;
        return Math.round(blended);
      }
      // No ITR: use conservative estimate between typical and low
      return Math.round(typicalCash * 0.5 + lowestCash * 0.5);
    }

    case 'informal': {
      // Conservative: 60% weight on lowest, 40% on typical
      const low = incomeLow ?? monthlyIncome * 0.7;
      const typical = monthlyIncome;
      return Math.round(low * 0.6 + typical * 0.4);
    }

    default:
      return monthlyIncome;
  }
}

// ── FOIR Threshold ───────────────────────────────────────────────────────────

/**
 * Get the maximum acceptable Fixed Obligation to Income Ratio.
 * Varies by employment type and income level.
 *
 * Lower thresholds for riskier employment profiles protect the borrower.
 *
 * Salaried:
 *   <₹50,000/mo → 50%
 *   ₹50,000–₹1,00,000/mo → 55%
 *   >₹1,00,000/mo → 60%
 *
 * Self-employed:
 *   <₹50,000/mo → 40%
 *   ≥₹50,000/mo → 50%
 *
 * Informal/Gig:
 *   All income levels → 35%
 */
export function getFoirThreshold(
  employmentType: EmploymentType,
  sustainableIncome: number
): number {
  switch (employmentType) {
    case 'salaried':
      if (sustainableIncome < 50000) return 0.50;
      if (sustainableIncome <= 100000) return 0.55;
      return 0.60;

    case 'self-employed':
      if (sustainableIncome < 50000) return 0.40;
      return 0.50;

    case 'informal':
      return 0.35;

    default:
      return 0.45;
  }
}

// ── Total Existing Obligations ───────────────────────────────────────────────

/**
 * Sums all existing fixed monthly obligations:
 * existing EMI + rent + household expenses + emergency buffer.
 */
export function calculateTotalObligations(financial: FinancialProfile): number {
  return financial.existingEmi + financial.rent + financial.householdExpenses;
}

// ── Available EMI Capacity ───────────────────────────────────────────────────

/**
 * The maximum new EMI the borrower can take on, based on two constraints:
 *
 * 1. FOIR-based: (sustainable income × FOIR threshold) − existing EMI
 *    → Total debt payments must not exceed the FOIR threshold of income.
 *
 * 2. Cash-flow-based: sustainable income − all obligations − buffer
 *    → Must have residual cash after ALL living costs and a 10% emergency buffer.
 *
 * Safe EMI = minimum of the two approaches. Never negative.
 */
export function calculateSafeEmi(
  borrower: BorrowerProfile,
  financial: FinancialProfile
): {
  safeEmi: number;
  sustainableIncome: number;
  foirThreshold: number;
  foirBasedCapacity: number;
  cashFlowBasedCapacity: number;
  totalObligations: number;
} {
  const sustainableIncome = calculateSustainableIncome(borrower);
  const foirThreshold = getFoirThreshold(borrower.employmentType, sustainableIncome);

  // FOIR-based: max total debt obligations = income × FOIR
  // New EMI room = max total debt − existing EMI
  const maxTotalDebt = sustainableIncome * foirThreshold;
  const foirBasedCapacity = Math.max(0, maxTotalDebt - financial.existingEmi);

  // Cash-flow-based: income − rent − household − existing EMI − 10% buffer
  const totalObligations = calculateTotalObligations(financial);
  const buffer = sustainableIncome * 0.10; // 10% emergency buffer on income
  const cashFlowBasedCapacity = Math.max(0, sustainableIncome - totalObligations - buffer);

  // Take the tighter (more conservative) of the two limits
  const safeEmi = Math.round(Math.min(foirBasedCapacity, cashFlowBasedCapacity));

  return {
    safeEmi,
    sustainableIncome,
    foirThreshold,
    foirBasedCapacity: Math.round(foirBasedCapacity),
    cashFlowBasedCapacity: Math.round(cashFlowBasedCapacity),
    totalObligations,
  };
}
