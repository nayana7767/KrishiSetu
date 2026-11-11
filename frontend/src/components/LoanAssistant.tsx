import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  ShieldCheck, 
  ExternalLink, 
  Percent, 
  Calendar, 
  ArrowRight, 
  AlertTriangle, 
  Calculator, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LoanProduct {
  id: number;
  bank_name: string;
  loan_name: string;
  category: string;
  description: string;
  min_amount: number;
  max_amount: number;
  base_interest_rate: number;
  subsidized_interest_rate: number;
  interest_subsidy_note: string;
  max_tenure_months: number;
  collateral_required: boolean;
  collateral_details: string;
  eligibility_criteria: string;
  required_documents: string;
  application_url: string;
  contact_number?: string;
}

interface LoanCompareResult {
  loan: LoanProduct;
  estimated_monthly_emi: number;
  annual_interest_base: number;
  annual_interest_subsidized: number;
  government_interest_saving: number;
  is_collateral_free: boolean;
  match_fit: string;
}

export const LoanAssistant: React.FC = () => {
  const { t } = useLanguage();

  const [loans, setLoans] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Comparison Calculator State
  const [neededAmount, setNeededAmount] = useState<number>(100000);
  const [loanPurpose, setLoanPurpose] = useState<string>('crop');
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [compareResults, setCompareResults] = useState<LoanCompareResult[]>([]);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    runComparison();
  }, [neededAmount, loanPurpose, tenureMonths]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans');
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error('Failed to load loans', err);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/loans/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needed_amount: neededAmount,
          purpose: loanPurpose,
          tenure_months: tenureMonths
        })
      });
      if (res.ok) {
        const results = await res.json();
        setCompareResults(results);
      }
    } catch (err) {
      console.error('Error comparing loans', err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-bold uppercase">
            <Coins className="w-3.5 h-3.5" />
            <span>Zero / Low Interest Agricultural Credit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">
            {t('loans_title')}
          </h1>
          <p className="text-amber-100 text-sm sm:text-base font-normal">
            {t('loans_subtitle')}
          </p>
        </div>
      </div>

      {/* Interactive Loan Comparison Tool */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              {t('compare_calculator')}
            </h2>
            <p className="text-xs text-stone-500">
              Enter the amount needed and see government interest subvention savings in real time.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Amount Slider / Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span>{t('needed_amount')}</span>
              <span className="text-base font-extrabold text-emerald-800 font-mono">
                ₹{neededAmount.toLocaleString('en-IN')}
              </span>
            </label>
            <input
              type="range"
              min="20000"
              max="1000000"
              step="10000"
              value={neededAmount}
              onChange={(e) => setNeededAmount(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono">
              <span>₹20,000</span>
              <span>₹5,00,000</span>
              <span>₹10,00,000</span>
            </div>
          </div>

          {/* Loan Purpose */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('loan_purpose')}
            </label>
            <select
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 font-semibold text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="crop">{t('purpose_crop')}</option>
              <option value="equipment">{t('purpose_equipment')}</option>
              <option value="irrigation">{t('purpose_irrigation')}</option>
              <option value="livestock">{t('purpose_livestock')}</option>
            </select>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('tenure_months')}
            </label>
            <select
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 font-semibold text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={12}>12 Months (1 Year - Seasonal Crop)</option>
              <option value={24}>24 Months (2 Years)</option>
              <option value={36}>36 Months (3 Years)</option>
              <option value={60}>60 Months (5 Years - Machinery/Tractor)</option>
              <option value={84}>84 Months (7 Years)</option>
            </select>
          </div>

        </div>

        {/* Calculated Comparison Cards */}
        <div className="pt-4 space-y-4">
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
            Best Matched Loan Options:
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {compareResults.map((result, idx) => {
              const { loan, estimated_monthly_emi, government_interest_saving, is_collateral_free, match_fit } = result;
              return (
                <div 
                  key={loan.id}
                  className="p-5 rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-stone-50/50 hover:bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {match_fit}
                      </span>
                      {is_collateral_free && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('collateral_free')}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-stone-900 font-serif">
                      {loan.loan_name}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium">
                      Provider: {loan.bank_name}
                    </p>

                    {/* Interest Rate & Savings Breakdown */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                        <p className="text-[10px] text-stone-500 font-semibold uppercase">Base Bank Rate</p>
                        <p className="text-sm font-black text-stone-700 line-through">{loan.base_interest_rate}%</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
                        <p className="text-[10px] text-emerald-800 font-bold uppercase">Subsidized Rate</p>
                        <p className="text-sm font-black text-emerald-900">{loan.subsidized_interest_rate}%</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300">
                        <p className="text-[10px] text-amber-800 font-bold uppercase">Govt Saved/Yr</p>
                        <p className="text-sm font-black text-amber-900 font-mono">₹{government_interest_saving.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Monthly EMI Preview */}
                    <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-600">{t('monthly_emi')}:</span>
                      <span className="font-mono font-black text-base text-stone-900">
                        ₹{estimated_monthly_emi.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      💡 <strong>Subsidy Note:</strong> {loan.interest_subsidy_note}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs text-stone-500">
                      Max Tenure: <strong>{loan.max_tenure_months} Mo</strong>
                    </span>

                    <a
                      href={loan.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>{t('apply_bank')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* All Available Agricultural Loan Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-serif">
          Detailed Agricultural Credit Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loans.map((loan) => (
            <div 
              key={loan.id}
              className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-emerald-600 shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-stone-100 text-stone-800">
                    {loan.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-800 font-mono">
                    {loan.subsidized_interest_rate}% p.a.
                  </span>
                </div>

                <h3 className="text-xl font-bold text-stone-900 font-serif">
                  {loan.loan_name}
                </h3>

                <p className="text-xs text-emerald-800 font-semibold">
                  Bank / Institution: {loan.bank_name}
                </p>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {loan.description}
                </p>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <p><strong>Eligibility:</strong> {loan.eligibility_criteria}</p>
                  <p><strong>Collateral:</strong> {loan.collateral_details}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                {loan.contact_number && (
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{loan.contact_number}</span>
                  </span>
                )}
                <a
                  href={loan.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 ml-auto"
                >
                  <span>Official Bank Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Disclaimer (Prompt Requirement) */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>{t('loan_disclaimer')}</p>
      </div>
    </div>
  );
};
