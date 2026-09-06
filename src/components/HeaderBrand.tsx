import { Sparkles } from 'lucide-react';

interface HeaderBrandProps {
  onClick?: () => void;
}

export function HeaderBrand({ onClick }: HeaderBrandProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 group cursor-pointer rounded-xl -ml-2 px-2 py-1.5 transition-all duration-200 hover:bg-slate-100/80 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-left border-none bg-transparent"
      aria-label="Borrower Copilot Home"
      title="Borrower Copilot Home"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:shadow-sm">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <span className="text-lg font-bold text-slate-800 transition-colors duration-200 group-hover:text-primary-600">
        Borrower Copilot
      </span>
    </button>
  );
}
