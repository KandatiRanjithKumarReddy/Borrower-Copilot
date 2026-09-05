// ── Borrower Copilot — Type Definitions ──────────────────────────────────────

export type EmploymentType = 'salaried' | 'self-employed' | 'informal';

export type LoanPurpose =
  | 'home'
  | 'education'
  | 'medical'
  | 'wedding'
  | 'business'
  | 'vehicle'
  | 'debt_consolidation'
  | 'personal_expense'
  | 'other';

export type LoanType =
  | 'personal_loan'
  | 'home_loan'
  | 'loan_against_property'
  | 'gold_loan'
  | 'two_wheeler_loan'
  | 'business_loan'
  | 'other';

export type Recommendation = 'BORROW' | 'BORROW_LESS' | 'DONT_BORROW';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

// ── Input Structures ─────────────────────────────────────────────────────────

export interface BorrowerProfile {
  age: number;
  location: string;
  employmentType: EmploymentType;
  monthlyIncome: number;       // Net take-home for salaried; typical for self-employed/informal
  incomeLow?: number;          // Lowest recent month (variable earners)
  incomeHigh?: number;         // Highest recent month (variable earners)
  incomeStability?: 'stable' | 'mostly_stable' | 'variable' | 'highly_variable';
  yearsEmployed?: number;      // Years with employer / years in business
  employerTier?: 'large_mnc' | 'mid_size' | 'small' | 'startup';
  variablePayPercent?: number; // % of income that is variable (salaried)
  itrAnnualIncome?: number;    // Declared ITR income (self-employed)
  collateralValue?: number;    // Property / asset value (self-employed)
  businessStability?: 'stable' | 'growing' | 'declining' | 'new';
  numberOfIncomeSources?: number; // informal
  householdIncome?: number;    // Additional household member income
  expectedIncomeImprovement?: 'yes' | 'no' | 'uncertain';
}

export interface LoanDetails {
  purpose: LoanPurpose;
  loanType: LoanType;
  requestedAmount: number;
  tenure: number; // in years
}

export interface FinancialProfile {
  existingEmi: number;
  householdExpenses: number;
  rent: number;
  dependents: number;
  emergencySavings?: number;
  creditCardUtilisation?: number; // 0–100 percentage
  existingOverdue?: number;
  recentBounce?: boolean;
  highCostDebtCount?: number;
  highCostDebtAmount?: number;
  highCostDebtRate?: number;    // approximate annual rate
  upcomingLargeExpense?: boolean;
  creditScore?: number;         // undefined = unknown (never treated as 0)
}

// Combined input for the engine
export interface AssessmentInput {
  borrower: BorrowerProfile;
  loan: LoanDetails;
  financial: FinancialProfile;
}

// ── Output Structures ────────────────────────────────────────────────────────

export interface TenureOption {
  tenureYears: number;
  emi: number;
  totalInterest: number;
  totalRepayment: number;
  isRecommended: boolean;
  isAffordable: boolean;
}

export interface StressTestResult {
  scenario: string;
  normalEmi: number;
  stressedEmi: number;         // for rate-increase scenario
  normalSurplus: number;
  stressedSurplus: number;
  isManageable: boolean;
  explanation: string;
}

export interface NegotiationCardData {
  loanPurpose: string;
  amountNeeded: number;
  borrowerSafeAmount: number;
  lenderIndicativeAmount: number;
  emiCeiling: number;
  fairRateMin: number;
  fairRateMax: number;
  aprMin: number;
  aprMax: number;
  recommendedTenure: number;
  confidence: Confidence;
  recommendation: Recommendation;
  negotiationPoints: string[];
}

export interface AssessmentResult {
  // Core recommendation
  recommendation: Recommendation;
  recommendationReason: string;

  // Amounts
  lenderIndicativeAmount: number;
  borrowerSafeAmount: number;
  recommendedAmount: number;

  // EMI
  safeEmi: number;
  requestedEmi: number;
  emiCeiling: number;

  // Rates
  fairRateMin: number;
  fairRateMax: number;
  estimatedAprMin: number;
  estimatedAprMax: number;
  processingFeePercent: number;

  // Tenure
  recommendedTenure: number;
  tenureOptions: TenureOption[];

  // Stress
  stressTest: StressTestResult;

  // Confidence
  confidence: Confidence;
  confidenceReasons: string[];

  // Explainability
  explanations: string[];

  // Negotiation
  negotiationCard: NegotiationCardData;

  // Additional flags
  suggestSecuredLoan: boolean;
  securedLoanReason?: string;
  highCostDebtWarning: boolean;
  highCostDebtMessage?: string;

  // Intermediate values for transparency
  sustainableIncome: number;
  foirThreshold: number;
  totalExistingObligations: number;
  availableForNewEmi: number;
}
