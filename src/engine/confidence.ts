// ── Confidence Engine ────────────────────────────────────────────────────────
// Calculates dynamic confidence level (HIGH / MEDIUM / LOW) based on
// the completeness and quality of information provided.

import type { AssessmentInput, Confidence } from './types';

interface ConfidenceResult {
  confidence: Confidence;
  reasons: string[];
  score: number; // Internal 0–100, never shown to user
}

/**
 * Calculate confidence level based on information completeness.
 *
 * Each factor adds or deducts from a base score.
 * The final score maps to HIGH (≥75), MEDIUM (45–74), LOW (<45).
 *
 * This is NOT a credit score — it measures how much the engine
 * can trust its own output given the information provided.
 */
export function calculateConfidence(input: AssessmentInput): ConfidenceResult {
  const { borrower, financial } = input;
  const reasons: string[] = [];
  let score = 70; // Start with a reasonable base

  // ── Credit Score ───────────────────────────────────────────────────────
  if (financial.creditScore !== undefined) {
    score += 10;
    if (financial.creditScore >= 750) {
      reasons.push('Your credit score is known and excellent.');
    } else {
      reasons.push('Your credit score is known.');
    }
  } else {
    score -= 15;
    reasons.push('Your credit history is unavailable — rate and eligibility estimates are less certain.');
  }

  // ── Income Certainty ───────────────────────────────────────────────────
  if (borrower.employmentType === 'salaried') {
    score += 10;
    if (borrower.yearsEmployed && borrower.yearsEmployed >= 3) {
      score += 5;
      reasons.push('Stable salaried employment with good tenure.');
    }
  } else if (borrower.employmentType === 'self-employed') {
    score -= 5;
    if (borrower.itrAnnualIncome) {
      score += 5;
      reasons.push('ITR income is declared, improving income verification.');
    } else {
      score -= 10;
      reasons.push('No ITR income declared — income estimates rely on self-reported figures.');
    }
    if (borrower.incomeHigh && borrower.incomeLow) {
      const variance = (borrower.incomeHigh - borrower.incomeLow) / borrower.monthlyIncome;
      if (variance > 0.5) {
        score -= 10;
        reasons.push('Wide income variation reduces estimate reliability.');
      }
    }
  } else if (borrower.employmentType === 'informal') {
    score -= 15;
    reasons.push('Informal/gig income is harder to verify and less predictable.');
  }

  // ── Income Stability ───────────────────────────────────────────────────
  if (borrower.incomeStability === 'highly_variable') {
    score -= 10;
    reasons.push('Highly variable income increases uncertainty in affordability estimates.');
  } else if (borrower.incomeStability === 'variable') {
    score -= 5;
  }

  // ── Existing Debt Information ──────────────────────────────────────────
  if (financial.recentBounce) {
    score -= 15;
    reasons.push('A recent EMI bounce significantly reduces confidence in repayment capacity.');
  }

  if (financial.highCostDebtCount && financial.highCostDebtCount >= 2) {
    score -= 10;
    reasons.push('Multiple high-cost loans add uncertainty to overall debt sustainability.');
  }

  if (financial.existingOverdue && financial.existingOverdue > 0) {
    score -= 10;
    reasons.push('Existing overdue amounts indicate current financial stress.');
  }

  // ── Expense Information ────────────────────────────────────────────────
  if (financial.householdExpenses <= 0) {
    score -= 10;
    reasons.push('Household expenses not provided — conservative assumptions are applied.');
  }

  // ── Emergency Savings ──────────────────────────────────────────────────
  if (financial.emergencySavings !== undefined) {
    if (financial.emergencySavings >= borrower.monthlyIncome * 3) {
      score += 5;
      reasons.push('Adequate emergency savings provide a safety buffer.');
    } else if (financial.emergencySavings < borrower.monthlyIncome) {
      score -= 5;
      reasons.push('Low emergency savings reduce your financial resilience.');
    }
  }

  // ── Clamp and classify ─────────────────────────────────────────────────
  score = Math.max(0, Math.min(100, score));

  let confidence: Confidence;
  if (score >= 75) {
    confidence = 'HIGH';
  } else if (score >= 45) {
    confidence = 'MEDIUM';
  } else {
    confidence = 'LOW';
  }

  // If no specific reasons were added, provide a default
  if (reasons.length === 0) {
    reasons.push('Assessment based on the information you provided.');
  }

  return { confidence, reasons, score };
}
