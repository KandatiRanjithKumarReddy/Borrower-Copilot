// ── Persona Presets ──────────────────────────────────────────────────────────
// Quick-load presets for the three PRD target borrowers.

import type { AssessmentInput } from '../engine/types';

export const PERSONA_PRIYA: AssessmentInput = {
  borrower: {
    age: 29,
    location: 'Bengaluru',
    employmentType: 'salaried',
    monthlyIncome: 110000,
    incomeStability: 'stable',
    yearsEmployed: 5,
    employerTier: 'large_mnc',
    variablePayPercent: 0,
  },
  loan: {
    purpose: 'wedding',
    loanType: 'personal_loan',
    requestedAmount: 800000,
    tenure: 3,
  },
  financial: {
    existingEmi: 14000,
    householdExpenses: 20000,
    rent: 28000,
    dependents: 0,
    emergencySavings: 300000,
    creditScore: 780,
  },
};

export const PERSONA_RAVI: AssessmentInput = {
  borrower: {
    age: 42,
    location: 'Mysuru',
    employmentType: 'self-employed',
    monthlyIncome: 60000, // typical cash income
    incomeLow: 40000,
    incomeHigh: 80000,
    incomeStability: 'mostly_stable',
    yearsEmployed: 14,
    itrAnnualIncome: 420000,
    collateralValue: 4500000, // ₹45 lakh shop
    businessStability: 'stable',
    householdIncome: 18000, // wife's income
  },
  loan: {
    purpose: 'business',
    loanType: 'personal_loan', // He's asking for unsecured, engine should suggest secured
    requestedAmount: 1500000,
    tenure: 5,
  },
  financial: {
    existingEmi: 0,
    householdExpenses: 25000,
    rent: 0, // owns premises
    dependents: 2,
    emergencySavings: 100000,
    creditScore: undefined, // Unknown
  },
};

export const PERSONA_ANITA: AssessmentInput = {
  borrower: {
    age: 35,
    location: 'Hubballi',
    employmentType: 'informal',
    monthlyIncome: 28000, // typical
    incomeLow: 26000,
    incomeHigh: 30000,
    incomeStability: 'variable',
    numberOfIncomeSources: 2,
    expectedIncomeImprovement: 'uncertain',
  },
  loan: {
    purpose: 'vehicle',
    loanType: 'two_wheeler_loan',
    requestedAmount: 150000,
    tenure: 3,
  },
  financial: {
    existingEmi: 5000,
    householdExpenses: 18000,
    rent: 6000,
    dependents: 3, // 2 children + unemployed husband
    emergencySavings: 5000,
    highCostDebtCount: 3,
    highCostDebtAmount: 35000,
    highCostDebtRate: 30,
    recentBounce: true,
    creditScore: undefined,
  },
};

export const PERSONAS = {
  priya: { label: 'Priya', subtitle: 'Salaried, Bengaluru', data: PERSONA_PRIYA },
  ravi: { label: 'Ravi', subtitle: 'Self-employed, Mysuru', data: PERSONA_RAVI },
  anita: { label: 'Anita', subtitle: 'Gig worker, Hubballi', data: PERSONA_ANITA },
};
