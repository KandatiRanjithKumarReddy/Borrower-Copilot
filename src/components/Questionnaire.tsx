import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  Banknote,
  CreditCard,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type {
  AssessmentInput,
  BorrowerProfile,
  LoanDetails,
  FinancialProfile,
  EmploymentType,
  LoanPurpose,
  LoanType,
} from '../engine/types';

import { HeaderBrand } from './HeaderBrand';

interface QuestionnaireProps {
  onComplete: (input: AssessmentInput) => void;
  onBack: () => void;
  onHome?: () => void;
}

const STEPS = ['Profile', 'Loan Details', 'Finances', 'Adaptive', 'Credit'];
const STEP_ICONS = [User, Briefcase, Banknote, FileText, CreditCard];

const LOAN_PURPOSES: { value: LoanPurpose; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'business', label: 'Business' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'debt_consolidation', label: 'Debt Consolidation' },
  { value: 'personal_expense', label: 'Personal Expense' },
  { value: 'other', label: 'Other' },
];

const LOAN_TYPES: { value: LoanType; label: string }[] = [
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'loan_against_property', label: 'Loan Against Property' },
  { value: 'gold_loan', label: 'Gold Loan' },
  { value: 'two_wheeler_loan', label: 'Two-Wheeler Loan' },
  { value: 'business_loan', label: 'Business Loan' },
  { value: 'other', label: 'Other' },
];

const TENURE_OPTIONS = [1, 2, 3, 5, 7, 10];

export function Questionnaire({ onComplete, onBack, onHome }: QuestionnaireProps) {
  const [step, setStep] = useState(0);

  // Borrower Profile
  const [age, setAge] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('salaried');
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>('');
  const [incomeLow, setIncomeLow] = useState<number | ''>('');
  const [incomeHigh, setIncomeHigh] = useState<number | ''>('');
  const [incomeStability, setIncomeStability] = useState<BorrowerProfile['incomeStability']>('stable');

  // Loan Details
  const [purpose, setPurpose] = useState<LoanPurpose>('personal_expense');
  const [loanType, setLoanType] = useState<LoanType>('personal_loan');
  const [requestedAmount, setRequestedAmount] = useState<number | ''>('');
  const [tenure, setTenure] = useState(3);

  // Financial Profile
  const [existingEmi, setExistingEmi] = useState<number | ''>(0);
  const [householdExpenses, setHouseholdExpenses] = useState<number | ''>('');
  const [rent, setRent] = useState<number | ''>(0);
  const [dependents, setDependents] = useState<number | ''>(0);
  const [emergencySavings, setEmergencySavings] = useState<number | ''>('');

  // Adaptive
  const [yearsEmployed, setYearsEmployed] = useState<number | ''>('');
  const [employerTier, setEmployerTier] = useState<BorrowerProfile['employerTier']>('mid_size');
  const [variablePayPercent, setVariablePayPercent] = useState<number | ''>(0);
  const [itrAnnualIncome, setItrAnnualIncome] = useState<number | ''>('');
  const [collateralValue, setCollateralValue] = useState<number | ''>('');
  const [businessStability, setBusinessStability] = useState<BorrowerProfile['businessStability']>('stable');
  const [householdIncome, setHouseholdIncome] = useState<number | ''>('');
  const [highCostDebtCount, setHighCostDebtCount] = useState<number | ''>(0);
  const [highCostDebtRate, setHighCostDebtRate] = useState<number | ''>('');
  const [recentBounce, setRecentBounce] = useState(false);
  const [numberOfIncomeSources, setNumberOfIncomeSources] = useState<number | ''>(1);
  const [expectedIncomeImprovement, setExpectedIncomeImprovement] = useState<BorrowerProfile['expectedIncomeImprovement']>('uncertain');

  // Credit
  const [knowsCreditScore, setKnowsCreditScore] = useState<boolean | null>(null);
  const [creditScore, setCreditScore] = useState<number | ''>('');

  const isVariableIncome = employmentType !== 'salaried';

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 0:
        return (
          age !== '' && age > 0 && age < 100 &&
          location.trim().length > 0 &&
          monthlyIncome !== '' && Number(monthlyIncome) > 0
        );
      case 1:
        return requestedAmount !== '' && Number(requestedAmount) > 0;
      case 2:
        return householdExpenses !== '' && Number(householdExpenses) >= 0;
      case 3:
        return true; // Adaptive questions are all optional
      case 4:
        return true; // Credit score can be unknown
      default:
        return false;
    }
  }, [step, age, location, monthlyIncome, requestedAmount, householdExpenses]);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      const borrower: BorrowerProfile = {
        age: Number(age),
        location,
        employmentType,
        monthlyIncome: Number(monthlyIncome),
        incomeLow: incomeLow !== '' ? Number(incomeLow) : undefined,
        incomeHigh: incomeHigh !== '' ? Number(incomeHigh) : undefined,
        incomeStability,
        yearsEmployed: yearsEmployed !== '' ? Number(yearsEmployed) : undefined,
        employerTier: employmentType === 'salaried' ? employerTier : undefined,
        variablePayPercent: variablePayPercent !== '' ? Number(variablePayPercent) : undefined,
        itrAnnualIncome: itrAnnualIncome !== '' ? Number(itrAnnualIncome) : undefined,
        collateralValue: collateralValue !== '' ? Number(collateralValue) : undefined,
        businessStability: employmentType === 'self-employed' ? businessStability : undefined,
        householdIncome: householdIncome !== '' ? Number(householdIncome) : undefined,
        numberOfIncomeSources: numberOfIncomeSources !== '' ? Number(numberOfIncomeSources) : undefined,
        expectedIncomeImprovement: employmentType === 'informal' ? expectedIncomeImprovement : undefined,
      };

      const loan: LoanDetails = {
        purpose,
        loanType,
        requestedAmount: Number(requestedAmount),
        tenure,
      };

      const financial: FinancialProfile = {
        existingEmi: Number(existingEmi) || 0,
        householdExpenses: Number(householdExpenses),
        rent: Number(rent) || 0,
        dependents: Number(dependents) || 0,
        emergencySavings: emergencySavings !== '' ? Number(emergencySavings) : undefined,
        highCostDebtCount: highCostDebtCount !== '' ? Number(highCostDebtCount) : undefined,
        highCostDebtRate: highCostDebtRate !== '' ? Number(highCostDebtRate) : undefined,
        recentBounce,
        creditScore: knowsCreditScore && creditScore !== '' ? Number(creditScore) : undefined,
      };

      onComplete({ borrower, loan, financial });
    }
  }, [
    step, age, location, employmentType, monthlyIncome, incomeLow, incomeHigh,
    incomeStability, yearsEmployed, employerTier, variablePayPercent,
    itrAnnualIncome, collateralValue, businessStability, householdIncome,
    numberOfIncomeSources, expectedIncomeImprovement, purpose, loanType,
    requestedAmount, tenure, existingEmi, householdExpenses, rent, dependents,
    emergencySavings, highCostDebtCount, highCostDebtRate, recentBounce,
    knowsCreditScore, creditScore, onComplete,
  ]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  }, [step, onBack]);

  const formatCurrencyInput = (value: number | ''): string => {
    if (value === '' || value === 0) return '';
    return value.toString();
  };

  const parseCurrencyInput = (str: string): number | '' => {
    const cleaned = str.replace(/[^0-9]/g, '');
    if (cleaned === '') return '';
    return parseInt(cleaned, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <HeaderBrand onClick={onHome} />
          <span className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-1.5 rounded-full transition-colors duration-300 ${
                    i <= step ? 'bg-primary-500' : 'bg-slate-200'
                  }`}
                />
                <div className="flex items-center gap-1">
                  <Icon className={`w-3.5 h-3.5 ${i <= step ? 'text-primary-500' : 'text-slate-400'}`} />
                  <span className={`text-xs font-medium hidden sm:inline ${i <= step ? 'text-primary-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="card animate-fade-in-up">
          {step === 0 && (
            <StepProfile
              age={age} setAge={setAge}
              location={location} setLocation={setLocation}
              employmentType={employmentType} setEmploymentType={setEmploymentType}
              monthlyIncome={monthlyIncome} setMonthlyIncome={setMonthlyIncome}
              incomeLow={incomeLow} setIncomeLow={setIncomeLow}
              incomeHigh={incomeHigh} setIncomeHigh={setIncomeHigh}
              incomeStability={incomeStability} setIncomeStability={setIncomeStability}
              isVariableIncome={isVariableIncome}
              formatCurrency={formatCurrencyInput}
              parseCurrency={parseCurrencyInput}
            />
          )}
          {step === 1 && (
            <StepLoanDetails
              purpose={purpose} setPurpose={setPurpose}
              loanType={loanType} setLoanType={setLoanType}
              requestedAmount={requestedAmount} setRequestedAmount={setRequestedAmount}
              tenure={tenure} setTenure={setTenure}
              formatCurrency={formatCurrencyInput}
              parseCurrency={parseCurrencyInput}
            />
          )}
          {step === 2 && (
            <StepFinances
              existingEmi={existingEmi} setExistingEmi={setExistingEmi}
              householdExpenses={householdExpenses} setHouseholdExpenses={setHouseholdExpenses}
              rent={rent} setRent={setRent}
              dependents={dependents} setDependents={setDependents}
              emergencySavings={emergencySavings} setEmergencySavings={setEmergencySavings}
              formatCurrency={formatCurrencyInput}
              parseCurrency={parseCurrencyInput}
            />
          )}
          {step === 3 && (
            <StepAdaptive
              employmentType={employmentType}
              yearsEmployed={yearsEmployed} setYearsEmployed={setYearsEmployed}
              employerTier={employerTier} setEmployerTier={setEmployerTier}
              variablePayPercent={variablePayPercent} setVariablePayPercent={setVariablePayPercent}
              itrAnnualIncome={itrAnnualIncome} setItrAnnualIncome={setItrAnnualIncome}
              collateralValue={collateralValue} setCollateralValue={setCollateralValue}
              businessStability={businessStability} setBusinessStability={setBusinessStability}
              householdIncome={householdIncome} setHouseholdIncome={setHouseholdIncome}
              highCostDebtCount={highCostDebtCount} setHighCostDebtCount={setHighCostDebtCount}
              highCostDebtRate={highCostDebtRate} setHighCostDebtRate={setHighCostDebtRate}
              recentBounce={recentBounce} setRecentBounce={setRecentBounce}
              numberOfIncomeSources={numberOfIncomeSources} setNumberOfIncomeSources={setNumberOfIncomeSources}
              expectedIncomeImprovement={expectedIncomeImprovement} setExpectedIncomeImprovement={setExpectedIncomeImprovement}
              formatCurrency={formatCurrencyInput}
              parseCurrency={parseCurrencyInput}
            />
          )}
          {step === 4 && (
            <StepCredit
              knowsCreditScore={knowsCreditScore} setKnowsCreditScore={setKnowsCreditScore}
              creditScore={creditScore} setCreditScore={setCreditScore}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={handleBack} className="btn-ghost flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? 'Home' : 'Back'}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2"
              id={step === STEPS.length - 1 ? 'submit-assessment' : 'next-step'}
            >
              {step === STEPS.length - 1 ? 'View Assessment' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Step 1: Profile ──────────────────────────────────────────────────────────

function StepProfile({
  age, setAge,
  location, setLocation,
  employmentType, setEmploymentType,
  monthlyIncome, setMonthlyIncome,
  incomeLow, setIncomeLow,
  incomeHigh, setIncomeHigh,
  incomeStability, setIncomeStability,
  isVariableIncome,
  formatCurrency,
  parseCurrency,
}: {
  age: number | ''; setAge: (v: number | '') => void;
  location: string; setLocation: (v: string) => void;
  employmentType: EmploymentType; setEmploymentType: (v: EmploymentType) => void;
  monthlyIncome: number | ''; setMonthlyIncome: (v: number | '') => void;
  incomeLow: number | ''; setIncomeLow: (v: number | '') => void;
  incomeHigh: number | ''; setIncomeHigh: (v: number | '') => void;
  incomeStability: BorrowerProfile['incomeStability']; setIncomeStability: (v: BorrowerProfile['incomeStability']) => void;
  isVariableIncome: boolean;
  formatCurrency: (v: number | '') => string;
  parseCurrency: (v: string) => number | '';
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">About You</h2>
        <p className="text-sm text-slate-500">Basic information to understand your borrower profile.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Age</label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g. 29"
            value={age}
            onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
            min={18}
            max={70}
            id="input-age"
          />
        </div>
        <div>
          <label className="input-label">City / Location</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Bengaluru"
            value={location}
            onChange={e => setLocation(e.target.value)}
            id="input-location"
          />
        </div>
      </div>

      <div>
        <label className="input-label">Employment Type</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'salaried', label: 'Salaried' },
            { value: 'self-employed', label: 'Self-Employed' },
            { value: 'informal', label: 'Informal / Gig' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setEmploymentType(opt.value)}
              className={`chip ${employmentType === opt.value ? 'chip-selected' : 'chip-unselected'} justify-center py-2.5`}
              id={`emp-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="input-label">
          {isVariableIncome ? 'Typical Monthly Income' : 'Net Monthly Income'}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
          <input
            type="text"
            className="input-field pl-8"
            placeholder="e.g. 110000"
            value={formatCurrency(monthlyIncome)}
            onChange={e => setMonthlyIncome(parseCurrency(e.target.value))}
            id="input-income"
          />
        </div>
        <p className="input-hint">
          {isVariableIncome
            ? 'Your typical or average monthly income'
            : 'Your net take-home salary after tax deductions'}
        </p>
      </div>

      {isVariableIncome && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="input-label">Lowest Recent Monthly</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="text"
                className="input-field pl-8"
                placeholder="e.g. 40000"
                value={formatCurrency(incomeLow)}
                onChange={e => setIncomeLow(parseCurrency(e.target.value))}
                id="input-income-low"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Highest Recent Monthly</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="text"
                className="input-field pl-8"
                placeholder="e.g. 80000"
                value={formatCurrency(incomeHigh)}
                onChange={e => setIncomeHigh(parseCurrency(e.target.value))}
                id="input-income-high"
              />
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex items-start gap-2 text-xs text-slate-500 mt-1">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>We use your lowest and typical income (not the highest) for affordability calculations to protect you.</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="input-label">Income Stability</label>
        <select
          className="select-field"
          value={incomeStability}
          onChange={e => setIncomeStability(e.target.value as BorrowerProfile['incomeStability'])}
          id="input-stability"
        >
          <option value="stable">Stable — consistent every month</option>
          <option value="mostly_stable">Mostly Stable — minor variations</option>
          <option value="variable">Variable — noticeable fluctuations</option>
          <option value="highly_variable">Highly Variable — unpredictable</option>
        </select>
      </div>
    </div>
  );
}

// ── Step 2: Loan Details ─────────────────────────────────────────────────────

function StepLoanDetails({
  purpose, setPurpose,
  loanType, setLoanType,
  requestedAmount, setRequestedAmount,
  tenure, setTenure,
  formatCurrency,
  parseCurrency,
}: {
  purpose: LoanPurpose; setPurpose: (v: LoanPurpose) => void;
  loanType: LoanType; setLoanType: (v: LoanType) => void;
  requestedAmount: number | ''; setRequestedAmount: (v: number | '') => void;
  tenure: number; setTenure: (v: number) => void;
  formatCurrency: (v: number | '') => string;
  parseCurrency: (v: string) => number | '';
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Loan Details</h2>
        <p className="text-sm text-slate-500">Tell us about the loan you're considering.</p>
      </div>

      <div>
        <label className="input-label">Loan Purpose</label>
        <div className="flex flex-wrap gap-2">
          {LOAN_PURPOSES.map(p => (
            <button
              key={p.value}
              onClick={() => setPurpose(p.value)}
              className={`chip ${purpose === p.value ? 'chip-selected' : 'chip-unselected'}`}
              id={`purpose-${p.value}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="input-label">Loan Type</label>
        <select
          className="select-field"
          value={loanType}
          onChange={e => setLoanType(e.target.value as LoanType)}
          id="input-loan-type"
        >
          {LOAN_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="input-label">Amount Wanted</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
          <input
            type="text"
            className="input-field pl-8"
            placeholder="e.g. 800000"
            value={formatCurrency(requestedAmount)}
            onChange={e => setRequestedAmount(parseCurrency(e.target.value))}
            id="input-amount"
          />
        </div>
        {requestedAmount !== '' && Number(requestedAmount) > 0 && (
          <p className="input-hint">
            ₹{(Number(requestedAmount) / 100000).toFixed(2)} lakh
          </p>
        )}
      </div>

      <div>
        <label className="input-label">Expected Tenure</label>
        <div className="flex flex-wrap gap-2">
          {TENURE_OPTIONS.map(t => (
            <button
              key={t}
              onClick={() => setTenure(t)}
              className={`chip ${tenure === t ? 'chip-selected' : 'chip-unselected'} min-w-[4.5rem] justify-center`}
              id={`tenure-${t}`}
            >
              {t === 1 ? '1 year' : `${t} years`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Finances ─────────────────────────────────────────────────────────

function StepFinances({
  existingEmi, setExistingEmi,
  householdExpenses, setHouseholdExpenses,
  rent, setRent,
  dependents, setDependents,
  emergencySavings, setEmergencySavings,
  formatCurrency,
  parseCurrency,
}: {
  existingEmi: number | ''; setExistingEmi: (v: number | '') => void;
  householdExpenses: number | ''; setHouseholdExpenses: (v: number | '') => void;
  rent: number | ''; setRent: (v: number | '') => void;
  dependents: number | ''; setDependents: (v: number | '') => void;
  emergencySavings: number | ''; setEmergencySavings: (v: number | '') => void;
  formatCurrency: (v: number | '') => string;
  parseCurrency: (v: string) => number | '';
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Financial Commitments</h2>
        <p className="text-sm text-slate-500">Your existing obligations help us calculate what you can safely afford.</p>
      </div>

      <div>
        <label className="input-label">Existing Monthly EMIs</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
          <input
            type="text"
            className="input-field pl-8"
            placeholder="0"
            value={formatCurrency(existingEmi)}
            onChange={e => setExistingEmi(parseCurrency(e.target.value))}
            id="input-existing-emi"
          />
        </div>
        <p className="input-hint">Total of all current loan EMIs combined</p>
      </div>

      <div>
        <label className="input-label">Monthly Household Expenses</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
          <input
            type="text"
            className="input-field pl-8"
            placeholder="e.g. 25000"
            value={formatCurrency(householdExpenses)}
            onChange={e => setHouseholdExpenses(parseCurrency(e.target.value))}
            id="input-expenses"
          />
        </div>
        <p className="input-hint">Groceries, utilities, transport, education, etc. (excluding rent & EMI)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Rent / Housing Cost</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
            <input
              type="text"
              className="input-field pl-8"
              placeholder="0"
              value={formatCurrency(rent)}
              onChange={e => setRent(parseCurrency(e.target.value))}
              id="input-rent"
            />
          </div>
        </div>
        <div>
          <label className="input-label">Number of Dependents</label>
          <input
            type="number"
            className="input-field"
            placeholder="0"
            value={dependents}
            onChange={e => setDependents(e.target.value === '' ? '' : parseInt(e.target.value))}
            min={0}
            max={10}
            id="input-dependents"
          />
        </div>
      </div>

      <div>
        <label className="input-label">Emergency Savings</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
          <input
            type="text"
            className="input-field pl-8"
            placeholder="e.g. 200000"
            value={formatCurrency(emergencySavings)}
            onChange={e => setEmergencySavings(parseCurrency(e.target.value))}
            id="input-savings"
          />
        </div>
        <p className="input-hint">Liquid savings you can access in an emergency</p>
      </div>
    </div>
  );
}

// ── Step 4: Adaptive ─────────────────────────────────────────────────────────

function StepAdaptive({
  employmentType,
  yearsEmployed, setYearsEmployed,
  employerTier, setEmployerTier,
  variablePayPercent, setVariablePayPercent,
  itrAnnualIncome, setItrAnnualIncome,
  collateralValue, setCollateralValue,
  businessStability, setBusinessStability,
  householdIncome, setHouseholdIncome,
  highCostDebtCount, setHighCostDebtCount,
  highCostDebtRate, setHighCostDebtRate,
  recentBounce, setRecentBounce,
  numberOfIncomeSources, setNumberOfIncomeSources,
  expectedIncomeImprovement, setExpectedIncomeImprovement,
  formatCurrency,
  parseCurrency,
}: {
  employmentType: EmploymentType;
  yearsEmployed: number | ''; setYearsEmployed: (v: number | '') => void;
  employerTier: BorrowerProfile['employerTier']; setEmployerTier: (v: BorrowerProfile['employerTier']) => void;
  variablePayPercent: number | ''; setVariablePayPercent: (v: number | '') => void;
  itrAnnualIncome: number | ''; setItrAnnualIncome: (v: number | '') => void;
  collateralValue: number | ''; setCollateralValue: (v: number | '') => void;
  businessStability: BorrowerProfile['businessStability']; setBusinessStability: (v: BorrowerProfile['businessStability']) => void;
  householdIncome: number | ''; setHouseholdIncome: (v: number | '') => void;
  highCostDebtCount: number | ''; setHighCostDebtCount: (v: number | '') => void;
  highCostDebtRate: number | ''; setHighCostDebtRate: (v: number | '') => void;
  recentBounce: boolean; setRecentBounce: (v: boolean) => void;
  numberOfIncomeSources: number | ''; setNumberOfIncomeSources: (v: number | '') => void;
  expectedIncomeImprovement: BorrowerProfile['expectedIncomeImprovement']; setExpectedIncomeImprovement: (v: BorrowerProfile['expectedIncomeImprovement']) => void;
  formatCurrency: (v: number | '') => string;
  parseCurrency: (v: string) => number | '';
}) {
  const titles: Record<EmploymentType, string> = {
    salaried: 'Salaried Details',
    'self-employed': 'Business Details',
    informal: 'Income & Debt Details',
  };

  const descriptions: Record<EmploymentType, string> = {
    salaried: 'Additional details about your employment help refine the assessment.',
    'self-employed': 'Business and income details help us estimate your sustainable borrowing capacity.',
    informal: 'Understanding your income sources and existing debt helps us give you an honest assessment.',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">{titles[employmentType]}</h2>
        <p className="text-sm text-slate-500">{descriptions[employmentType]}</p>
        <p className="text-xs text-slate-400 mt-1">All fields on this page are optional — skip any you're unsure about.</p>
      </div>

      {/* Salaried-specific */}
      {employmentType === 'salaried' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Years with Current Employer</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 5"
                value={yearsEmployed}
                onChange={e => setYearsEmployed(e.target.value === '' ? '' : parseInt(e.target.value))}
                min={0}
                id="input-years-employed"
              />
            </div>
            <div>
              <label className="input-label">Variable Pay %</label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={variablePayPercent}
                onChange={e => setVariablePayPercent(e.target.value === '' ? '' : parseInt(e.target.value))}
                min={0}
                max={100}
                id="input-variable-pay"
              />
              <p className="input-hint">Bonus / incentive portion</p>
            </div>
          </div>
          <div>
            <label className="input-label">Employer Type</label>
            <select
              className="select-field"
              value={employerTier}
              onChange={e => setEmployerTier(e.target.value as BorrowerProfile['employerTier'])}
              id="input-employer-tier"
            >
              <option value="large_mnc">Large MNC / Top-tier Company</option>
              <option value="mid_size">Mid-size Company</option>
              <option value="small">Small Company</option>
              <option value="startup">Startup</option>
            </select>
          </div>
        </>
      )}

      {/* Self-employed-specific */}
      {employmentType === 'self-employed' && (
        <>
          <div>
            <label className="input-label">Years in Business</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 14"
              value={yearsEmployed}
              onChange={e => setYearsEmployed(e.target.value === '' ? '' : parseInt(e.target.value))}
              min={0}
              id="input-years-business"
            />
          </div>
          <div>
            <label className="input-label">Annual ITR Income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="text"
                className="input-field pl-8"
                placeholder="e.g. 420000"
                value={formatCurrency(itrAnnualIncome)}
                onChange={e => setItrAnnualIncome(parseCurrency(e.target.value))}
                id="input-itr"
              />
            </div>
            <p className="input-hint">Income declared in your Income Tax Return</p>
          </div>
          <div>
            <label className="input-label">Collateral / Property Value</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="text"
                className="input-field pl-8"
                placeholder="e.g. 4500000"
                value={formatCurrency(collateralValue)}
                onChange={e => setCollateralValue(parseCurrency(e.target.value))}
                id="input-collateral"
              />
            </div>
            <p className="input-hint">Approximate value of property or assets you own</p>
          </div>
          <div>
            <label className="input-label">Business Stability</label>
            <select
              className="select-field"
              value={businessStability}
              onChange={e => setBusinessStability(e.target.value as BorrowerProfile['businessStability'])}
              id="input-biz-stability"
            >
              <option value="stable">Stable — consistent revenue</option>
              <option value="growing">Growing — increasing revenue</option>
              <option value="declining">Declining — decreasing revenue</option>
              <option value="new">New — less than 2 years</option>
            </select>
          </div>
          <div>
            <label className="input-label">Additional Household Income (spouse/family)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="text"
                className="input-field pl-8"
                placeholder="e.g. 18000"
                value={formatCurrency(householdIncome)}
                onChange={e => setHouseholdIncome(parseCurrency(e.target.value))}
                id="input-household-income"
              />
            </div>
          </div>
        </>
      )}

      {/* Informal / gig-specific */}
      {employmentType === 'informal' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Income Sources</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 2"
                value={numberOfIncomeSources}
                onChange={e => setNumberOfIncomeSources(e.target.value === '' ? '' : parseInt(e.target.value))}
                min={1}
                id="input-income-sources"
              />
            </div>
            <div>
              <label className="input-label">Household Income (others)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input
                  type="text"
                  className="input-field pl-8"
                  placeholder="0"
                  value={formatCurrency(householdIncome)}
                  onChange={e => setHouseholdIncome(parseCurrency(e.target.value))}
                  id="input-hh-income-informal"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="input-label">Expected Income Improvement</label>
            <select
              className="select-field"
              value={expectedIncomeImprovement}
              onChange={e => setExpectedIncomeImprovement(e.target.value as BorrowerProfile['expectedIncomeImprovement'])}
              id="input-income-improvement"
            >
              <option value="yes">Yes — I expect income to increase</option>
              <option value="no">No — income will stay about the same</option>
              <option value="uncertain">Uncertain</option>
            </select>
          </div>
        </>
      )}

      {/* Shared for self-employed & informal */}
      {(employmentType === 'self-employed' || employmentType === 'informal') && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Existing Debt Profile</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">High-Cost Loans (count)</label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={highCostDebtCount}
                onChange={e => setHighCostDebtCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                min={0}
                id="input-hc-debt-count"
              />
              <p className="input-hint">App loans, moneylender loans, etc.</p>
            </div>
            <div>
              <label className="input-label">Approx. Interest Rate</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 30"
                value={highCostDebtRate}
                onChange={e => setHighCostDebtRate(e.target.value === '' ? '' : parseInt(e.target.value))}
                min={0}
                max={100}
                id="input-hc-debt-rate"
              />
              <p className="input-hint">Annual % on those loans</p>
            </div>
          </div>
          <div>
            <label className="input-label">Recent EMI Bounce?</label>
            <div className="flex gap-3">
              <button
                onClick={() => setRecentBounce(true)}
                className={`chip flex-1 justify-center ${recentBounce ? 'bg-danger-50 border-danger-400 text-danger-700' : 'chip-unselected'}`}
                id="bounce-yes"
              >
                Yes
              </button>
              <button
                onClick={() => setRecentBounce(false)}
                className={`chip flex-1 justify-center ${!recentBounce ? 'chip-selected' : 'chip-unselected'}`}
                id="bounce-no"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 5: Credit ───────────────────────────────────────────────────────────

function StepCredit({
  knowsCreditScore, setKnowsCreditScore,
  creditScore, setCreditScore,
}: {
  knowsCreditScore: boolean | null; setKnowsCreditScore: (v: boolean | null) => void;
  creditScore: number | ''; setCreditScore: (v: number | '') => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Credit Profile</h2>
        <p className="text-sm text-slate-500">Your credit score helps narrow the interest rate estimate. It's okay if you don't know it.</p>
      </div>

      <div>
        <label className="input-label">Do you know your credit score?</label>
        <div className="flex gap-3">
          <button
            onClick={() => setKnowsCreditScore(true)}
            className={`chip flex-1 justify-center py-3 ${knowsCreditScore === true ? 'chip-selected' : 'chip-unselected'}`}
            id="credit-yes"
          >
            Yes, I know it
          </button>
          <button
            onClick={() => { setKnowsCreditScore(false); setCreditScore(''); }}
            className={`chip flex-1 justify-center py-3 ${knowsCreditScore === false ? 'chip-selected' : 'chip-unselected'}`}
            id="credit-no"
          >
            No / Not sure
          </button>
        </div>
      </div>

      {knowsCreditScore === true && (
        <div className="animate-fade-in">
          <label className="input-label">Your Credit Score</label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g. 750"
            value={creditScore}
            onChange={e => setCreditScore(e.target.value === '' ? '' : parseInt(e.target.value))}
            min={300}
            max={900}
            id="input-credit-score"
          />
          <p className="input-hint">Typically between 300 and 900</p>
        </div>
      )}

      {knowsCreditScore === false && (
        <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 animate-fade-in">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
            <div className="text-sm text-primary-800">
              <p className="font-semibold mb-1">That's perfectly okay.</p>
              <p>
                An unknown credit score does <strong>not</strong> mean a bad score. We'll widen the interest rate range
                and lower confidence to reflect this uncertainty — not penalise you for it.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Privacy note:</strong> We do not access or check your credit bureau report. This assessment
          uses only the information you enter. Your credit score is not stored or transmitted anywhere.
        </p>
      </div>
    </div>
  );
}
