import { useState } from 'react';
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CreditCard,
  Info,
  Percent,
  Calendar,
  Activity,
  Eye,
} from 'lucide-react';
import type { AssessmentResult, AssessmentInput } from '../engine/types';
import {
  formatINR,
  formatLakh,
  formatPercent,
  formatRateRange,
  formatTenure,
  formatRecommendation,
  getRecommendationColor,
  getConfidenceColor,
} from '../utils/formatters';
import { NegotiationCard } from './NegotiationCard';
import { HeaderBrand } from './HeaderBrand';

interface ResultsPageProps {
  result: AssessmentResult;
  input: AssessmentInput;
  onStartOver: () => void;
  onHome?: () => void;
}

export function ResultsPage({ result, input, onStartOver, onHome }: ResultsPageProps) {
  const [showNegotiationCard, setShowNegotiationCard] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState(false);

  const recColors = getRecommendationColor(result.recommendation);
  const confColors = getConfidenceColor(result.confidence);

  if (showNegotiationCard) {
    return (
      <NegotiationCard
        data={result.negotiationCard}
        onBack={() => setShowNegotiationCard(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <HeaderBrand onClick={onHome} />
          <button onClick={onStartOver} className="btn-ghost flex items-center gap-1.5" id="start-over">
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ── Recommendation Banner ─────────────────────────────────────── */}
        <div className={`card ${recColors.bgLight} border-2 ${recColors.border} animate-fade-in-up`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${recColors.bg} flex items-center justify-center shrink-0`}>
              {result.recommendation === 'BORROW' && <CheckCircle className="w-6 h-6 text-white" />}
              {result.recommendation === 'BORROW_LESS' && <AlertTriangle className="w-6 h-6 text-white" />}
              {result.recommendation === 'DONT_BORROW' && <XCircle className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`text-2xl font-extrabold ${recColors.text}`}>
                  {formatRecommendation(result.recommendation)}
                </h2>
                <span className={`badge ${confColors.bg} ${confColors.text}`}>
                  {result.confidence} Confidence
                </span>
              </div>
              <p className="text-slate-700 mt-2 leading-relaxed">
                {result.recommendationReason}
              </p>
            </div>
          </div>
        </div>

        {/* ── Secured Loan Suggestion ───────────────────────────────────── */}
        {result.suggestSecuredLoan && result.securedLoanReason && (
          <div className="card bg-primary-50 border-2 border-primary-200 animate-fade-in-up delay-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-primary-800 mb-1">Consider a Secured Loan</h3>
                <p className="text-sm text-primary-700 leading-relaxed">{result.securedLoanReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── High-Cost Debt Warning ────────────────────────────────────── */}
        {result.highCostDebtWarning && result.highCostDebtMessage && (
          <div className="card bg-danger-50 border-2 border-danger-200 animate-fade-in-up delay-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-danger-800 mb-1">High-Cost Debt Alert</h3>
                <p className="text-sm text-danger-700 leading-relaxed">{result.highCostDebtMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Amount Comparison ──────────────────────────────────────────── */}
        <div className="card animate-fade-in-up delay-200">
          <div className="card-header">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            How Much?
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <AmountBox
              label="Your Request"
              amount={input.loan.requestedAmount}
              color="slate"
            />
            <AmountBox
              label="Lender May Offer"
              amount={result.lenderIndicativeAmount}
              color="blue"
              hint="Indicative — not a loan approval"
            />
            <AmountBox
              label="Safe to Borrow"
              amount={result.borrowerSafeAmount}
              color="green"
              highlight
              hint="Based on your real affordability"
            />
          </div>

          {/* Visual comparison bar */}
          <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden mb-3">
            {result.lenderIndicativeAmount > 0 && (
              <div
                className="absolute inset-y-0 left-0 bg-blue-200 rounded-full"
                style={{
                  width: `${Math.min(100, (result.lenderIndicativeAmount / Math.max(input.loan.requestedAmount, result.lenderIndicativeAmount, result.borrowerSafeAmount)) * 100)}%`,
                }}
              />
            )}
            {result.borrowerSafeAmount > 0 && (
              <div
                className="absolute inset-y-0 left-0 bg-emerald-400/60 rounded-full"
                style={{
                  width: `${Math.min(100, (result.borrowerSafeAmount / Math.max(input.loan.requestedAmount, result.lenderIndicativeAmount, result.borrowerSafeAmount)) * 100)}%`,
                }}
              />
            )}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-800"
              style={{
                left: `${Math.min(100, (input.loan.requestedAmount / Math.max(input.loan.requestedAmount, result.lenderIndicativeAmount, result.borrowerSafeAmount)) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Safe Amount</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-200 inline-block" /> Lender Indicative</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-800 inline-block" /> Your Request</span>
          </div>

          {result.borrowerSafeAmount < input.loan.requestedAmount && result.borrowerSafeAmount > 0 && (
            <div className="mt-4 p-3 bg-warning-50 rounded-xl border border-warning-200 text-sm text-warning-800">
              <Info className="w-4 h-4 inline mr-1.5" />
              Your safe amount is lower than your request because existing EMI and household expenses reduce your available monthly payment capacity.
            </div>
          )}
        </div>

        {/* ── Fair Rate ─────────────────────────────────────────────────── */}
        <div className="card animate-fade-in-up delay-300">
          <div className="card-header">
            <Percent className="w-5 h-5 text-primary-500" />
            Fair Interest Rate
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="stat-label mb-1">Fair Rate</div>
              <div className="stat-value text-primary-700">
                {formatRateRange(result.fairRateMin, result.fairRateMax)}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="stat-label mb-1">Approx. All-in APR</div>
              <div className="stat-value text-primary-700">
                {formatRateRange(result.estimatedAprMin, result.estimatedAprMax)}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Processing fee assumption: {formatPercent(result.processingFeePercent)} + 18% GST.
                APR includes this fee in the total cost.
              </span>
            </div>
            {result.explanations
              .filter(e => e.toLowerCase().includes('rate') || e.toLowerCase().includes('credit'))
              .slice(0, 3)
              .map((exp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </div>
              ))}
          </div>
        </div>

        {/* ── EMI Ceiling ───────────────────────────────────────────────── */}
        <div className="card animate-fade-in-up delay-300">
          <div className="card-header">
            <CreditCard className="w-5 h-5 text-primary-500" />
            EMI Ceiling
          </div>

          <div className="text-center mb-6">
            <div className="stat-label mb-1">Your EMI Ceiling</div>
            <div className="text-4xl font-extrabold text-slate-900">
              {formatINR(result.emiCeiling)}
              <span className="text-lg text-slate-500 font-normal">/month</span>
            </div>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              This is the maximum new EMI considered reasonable based on your income,
              existing obligations, and household expenses.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Requested EMI</div>
              <div className="font-bold text-slate-800">{formatINR(result.requestedEmi)}</div>
            </div>
            <div className="text-center p-3 bg-success-50 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Safe EMI</div>
              <div className="font-bold text-success-700">{formatINR(result.safeEmi)}</div>
            </div>
            <div className={`text-center p-3 rounded-xl ${result.requestedEmi > result.safeEmi ? 'bg-danger-50' : 'bg-success-50'}`}>
              <div className="text-xs text-slate-500 mb-1">Difference</div>
              <div className={`font-bold ${result.requestedEmi > result.safeEmi ? 'text-danger-700' : 'text-success-700'}`}>
                {result.requestedEmi > result.safeEmi ? '+' : ''}{formatINR(result.requestedEmi - result.safeEmi)}
              </div>
            </div>
          </div>

          {result.requestedEmi > result.safeEmi && (
            <div className="p-3 bg-warning-50 rounded-xl border border-warning-200 text-sm text-warning-800 mb-4">
              <AlertTriangle className="w-4 h-4 inline mr-1.5" />
              Your requested loan EMI is above the safe EMI level. Consider reducing the amount or extending the tenure.
            </div>
          )}

          {/* Tenure Trade-off Table */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">Tenure Trade-off</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Tenure</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">EMI</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Total Interest</th>
                    <th className="text-center py-2 px-3 text-slate-500 font-medium">Affordable</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tenureOptions.map(t => (
                    <tr
                      key={t.tenureYears}
                      className={`border-b border-slate-100 ${t.isRecommended ? 'bg-primary-50' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {formatTenure(t.tenureYears)}
                        {t.isRecommended && (
                          <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-bold">
                            Recommended
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">{formatINR(t.emi)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(t.totalInterest)}</td>
                      <td className="py-2.5 px-3 text-center">
                        {t.isAffordable ? (
                          <CheckCircle className="w-4 h-4 text-success-500 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 text-danger-400 inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Longer tenure lowers monthly EMI but increases total interest paid.
              The recommended tenure is the shortest that keeps EMI within your safe ceiling.
            </p>
          </div>
        </div>

        {/* ── Stress Test ───────────────────────────────────────────────── */}
        <div className="card animate-fade-in-up delay-400">
          <div className="card-header">
            <Activity className="w-5 h-5 text-primary-500" />
            Stress Test
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-xs text-slate-500 mb-1">Normal Case</div>
              <div className="text-sm font-medium text-slate-700">
                Monthly surplus: <span className="font-bold text-slate-900">{formatINR(result.stressTest.normalSurplus)}</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">EMI: {formatINR(result.stressTest.normalEmi)}</div>
            </div>
            <div className={`p-4 rounded-xl ${result.stressTest.isManageable ? 'bg-success-50' : 'bg-danger-50'}`}>
              <div className="text-xs text-slate-500 mb-1">Stress Case</div>
              <div className="text-sm font-medium text-slate-700">
                Monthly surplus: <span className={`font-bold ${result.stressTest.stressedSurplus >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                  {formatINR(result.stressTest.stressedSurplus)}
                </span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {result.stressTest.stressedEmi !== result.stressTest.normalEmi
                  ? `EMI: ${formatINR(result.stressTest.stressedEmi)}`
                  : 'EMI unchanged'}
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl text-sm ${result.stressTest.isManageable ? 'bg-success-50 text-success-800 border border-success-200' : 'bg-danger-50 text-danger-800 border border-danger-200'}`}>
            {result.stressTest.isManageable ? (
              <CheckCircle className="w-4 h-4 inline mr-1.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 inline mr-1.5" />
            )}
            <strong>{result.stressTest.scenario}:</strong> {result.stressTest.explanation}
          </div>
        </div>

        {/* ── Confidence ────────────────────────────────────────────────── */}
        <div className="card animate-fade-in-up delay-400">
          <div className="card-header">
            <Eye className="w-5 h-5 text-primary-500" />
            Confidence
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className={`badge text-base px-4 py-2 ${confColors.bg} ${confColors.text}`}>
              {result.confidence}
            </span>
            <span className="text-sm text-slate-600">
              {result.confidence === 'HIGH' && 'We have enough information for a reliable assessment.'}
              {result.confidence === 'MEDIUM' && 'Some information is missing — estimates are wider.'}
              {result.confidence === 'LOW' && 'Key information is missing — treat these estimates as rough ranges.'}
            </span>
          </div>

          <ul className="space-y-2">
            {result.confidenceReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* ── All Explanations ──────────────────────────────────────────── */}
        <div className="card animate-fade-in-up delay-500">
          <button
            onClick={() => setExpandedExplanations(!expandedExplanations)}
            className="card-header w-full justify-between cursor-pointer mb-0"
          >
            <span className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary-500" />
              All Explanations ({result.explanations.length})
            </span>
            {expandedExplanations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {expandedExplanations && (
            <ul className="mt-4 space-y-3">
              {result.explanations.map((exp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  {exp}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Transparency Strip ────────────────────────────────────────── */}
        <div className="p-4 bg-slate-800 text-white rounded-2xl text-center text-sm animate-fade-in delay-500">
          <Shield className="w-4 h-4 text-emerald-400 inline mr-2" />
          Your assessment was calculated locally in your browser. No data was stored or transmitted.
          This is not a loan approval.
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up delay-500">
          <button
            onClick={() => setShowNegotiationCard(true)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            id="view-negotiation-card"
          >
            <CreditCard className="w-5 h-5" />
            View Negotiation Card
          </button>
          <button
            onClick={onStartOver}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
            id="start-over-bottom"
          >
            <RotateCcw className="w-5 h-5" />
            Start Over
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Amount Box Sub-Component ─────────────────────────────────────────────────

function AmountBox({
  label,
  amount,
  color,
  highlight,
  hint,
}: {
  label: string;
  amount: number;
  color: 'slate' | 'blue' | 'green';
  highlight?: boolean;
  hint?: string;
}) {
  const bgColors = {
    slate: 'bg-slate-50',
    blue: 'bg-blue-50',
    green: 'bg-success-50',
  };

  const textColors = {
    slate: 'text-slate-800',
    blue: 'text-blue-700',
    green: 'text-success-700',
  };

  return (
    <div className={`p-4 rounded-xl ${bgColors[color]} ${highlight ? 'ring-2 ring-success-400' : ''}`}>
      <div className="text-xs text-slate-500 mb-1 font-medium">{label}</div>
      <div className={`text-xl font-bold ${textColors[color]}`}>{formatLakh(amount)}</div>
      <div className="text-xs text-slate-400 mt-0.5">{formatINR(amount)}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
