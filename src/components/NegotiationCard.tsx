import {
  Sparkles,
  ArrowLeft,
  Printer,
  Shield,
  MessageSquare,
} from 'lucide-react';
import type { NegotiationCardData } from '../engine/types';
import {
  formatINR,
  formatLakh,
  formatRateRange,
  formatTenure,
  formatRecommendation,
  getRecommendationColor,
  getConfidenceColor,
} from '../utils/formatters';

interface NegotiationCardProps {
  data: NegotiationCardData;
  onBack: () => void;
}

export function NegotiationCard({ data, onBack }: NegotiationCardProps) {
  const recColors = getRecommendationColor(data.recommendation);
  const confColors = getConfidenceColor(data.confidence);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Header — hidden when printing */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="btn-ghost flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 py-2 px-4">
            <Printer className="w-4 h-4" />
            Print Card
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-6 md:px-8 md:py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/80 text-sm font-medium">Borrower Copilot</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              My Negotiation Card
            </h1>
            <p className="text-primary-200 text-sm mt-1">
              Prepared for lender discussion • Generated locally
            </p>
          </div>

          {/* Card Body */}
          <div className="px-6 py-6 md:px-8 md:py-8 space-y-6">
            {/* Recommendation Badge */}
            <div className="flex items-center gap-3">
              <span className={`badge text-sm px-4 py-2 ${recColors.bg} text-white`}>
                {formatRecommendation(data.recommendation)}
              </span>
              <span className={`badge text-sm px-3 py-1.5 ${confColors.bg} ${confColors.text}`}>
                {data.confidence} Confidence
              </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricRow label="Loan Purpose" value={data.loanPurpose} />
              <MetricRow label="Amount I Need" value={formatINR(data.amountNeeded)} />
              <MetricRow
                label="Borrower-Safe Amount"
                value={formatLakh(data.borrowerSafeAmount)}
                highlight="green"
              />
              <MetricRow
                label="Lender Indicative"
                value={formatLakh(data.lenderIndicativeAmount)}
                highlight="blue"
              />
              <MetricRow
                label="EMI Ceiling"
                value={`${formatINR(data.emiCeiling)}/mo`}
                highlight="green"
              />
              <MetricRow
                label="Fair Rate"
                value={formatRateRange(data.fairRateMin, data.fairRateMax)}
              />
              <MetricRow
                label="Approx. All-in APR"
                value={formatRateRange(data.aprMin, data.aprMax)}
              />
              <MetricRow
                label="Recommended Tenure"
                value={formatTenure(data.recommendedTenure)}
              />
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-slate-200" />

            {/* Negotiation Points */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-slate-800">Negotiation Points</h3>
              </div>
              <ul className="space-y-3">
                {data.negotiationPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5" />
                <span>
                  Generated by Borrower Copilot • Calculated locally • Not a loan approval •
                  Based on self-reported information
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'blue';
}) {
  const valueColor = highlight === 'green'
    ? 'text-success-700'
    : highlight === 'blue'
    ? 'text-blue-700'
    : 'text-slate-900';

  return (
    <div className="py-2">
      <div className="text-xs text-slate-500 font-medium mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}
