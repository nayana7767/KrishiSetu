import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ExternalLink, 
  Volume2, 
  FileText, 
  Phone, 
  Calendar, 
  Filter, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Scheme {
  id: number;
  scheme_code: string;
  scheme_name: string;
  kannada_name?: string;
  hindi_name?: string;
  department: string;
  scheme_type: string;
  category: string;
  description: string;
  benefits_summary: string;
  financial_assistance: string;
  subsidy_percentage: number;
  min_land_acres: number;
  max_land_acres: number;
  eligible_categories: string;
  eligible_crops: string;
  eligible_irrigation: string;
  required_documents: string;
  official_url: string;
  helpline_number?: string;
  application_instructions: string;
  opening_date: string;
  closing_date: string;
  is_active: boolean;
}

interface SchemeRecommendation {
  scheme: Scheme;
  eligibility_status: 'eligible' | 'more_info_needed' | 'not_eligible';
  match_score: number;
  reasons: string[];
  missing_criteria: string[];
}

interface SubsidyFinderProps {
  onPrepareDocuments: (schemeId: number) => void;
}

export const SubsidyFinder: React.FC<SubsidyFinderProps> = ({ onPrepareDocuments }) => {
  const { t, language, speak } = useLanguage();
  const { user, token } = useAuth();

  const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eligible' | 'more_info' | 'all'>('eligible');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSchemeId, setExpandedSchemeId] = useState<number | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [user, token]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let url = '/api/schemes/recommendations';
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback guest query with default Karnataka parameters
        url += '?land_acres=2.5&farmer_category=small_marginal&crops=Paddy,Sugarcane';
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Failed to load scheme recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: t('all_categories') },
    { id: 'crop_cultivation', label: t('crop_cultivation') },
    { id: 'irrigation', label: t('irrigation') },
    { id: 'machinery', label: t('farm_machinery') },
    { id: 'dairy', label: t('dairy_livestock') },
    { id: 'infrastructure', label: t('solar_infra') },
    { id: 'insurance', label: t('crop_insurance') }
  ];

  // Filter recommendations based on tab and category
  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeTab === 'eligible' && rec.eligibility_status !== 'eligible') return false;
    if (activeTab === 'more_info' && rec.eligibility_status !== 'more_info_needed') return false;
    if (selectedCategory !== 'all' && rec.scheme.category !== selectedCategory) return false;
    return true;
  });

  const getSchemeName = (scheme: Scheme) => {
    if (language === 'kn' && scheme.kannada_name) return scheme.kannada_name;
    if (language === 'hi' && scheme.hindi_name) return scheme.hindi_name;
    return scheme.scheme_name;
  };

  const handleSpeakScheme = (rec: SchemeRecommendation) => {
    const name = getSchemeName(rec.scheme);
    const speechText = `${name}. Department: ${rec.scheme.department}. Financial assistance: ${rec.scheme.financial_assistance}. Benefits: ${rec.scheme.benefits_summary}. Eligibility explanation: ${rec.reasons.join('. ')}`;
    speak(speechText);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rule-Based Eligibility Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">
            {t('subsidies_title')}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base font-normal">
            {t('subsidies_subtitle')}
          </p>

          {user?.farmer_profile && (
            <div className="pt-2 text-xs text-amber-200 flex flex-wrap items-center gap-3">
              <span>🌾 Matched for: <strong>{user.farmer_profile.land_acres} Acres</strong></span>
              <span>📍 <strong>{user.farmer_profile.district} District</strong></span>
              <span>🌱 Crops: <strong>{user.farmer_profile.crops}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
        
        {/* Eligibility Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'eligible'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{t('tab_eligible')}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-900/40 text-emerald-100">
              {recommendations.filter((r) => r.eligibility_status === 'eligible').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('more_info')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'more_info'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-amber-200" />
            <span>{t('tab_more_info')}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-800/40 text-amber-100">
              {recommendations.filter((r) => r.eligibility_status === 'more_info_needed').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'all'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>{t('tab_all')}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-stone-700 text-stone-200">
              {recommendations.length}
            </span>
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-stone-500 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Scheme Cards List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-semibold">{t('loading')}</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
          <Info className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">No schemes found in this category</h3>
          <p className="text-sm text-stone-500">
            Try switching to 'All Schemes' or selecting a different category filter.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRecommendations.map((rec) => {
            const { scheme, eligibility_status, match_score, reasons, missing_criteria } = rec;
            const isExpanded = expandedSchemeId === scheme.id;
            const isEligible = eligibility_status === 'eligible';

            return (
              <div 
                key={scheme.id}
                className="bg-white rounded-3xl border-2 border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Top Main Info */}
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isEligible 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {isEligible ? '✓ Potentially Eligible' : '⚠ More Info Needed'}
                        </span>

                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {scheme.category.replace('_', ' ').toUpperCase()}
                        </span>

                        <span className="text-xs font-mono text-stone-400">
                          {scheme.scheme_code}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif pt-1">
                        {getSchemeName(scheme)}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-500 font-medium flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{scheme.department}</span>
                      </p>
                    </div>

                    {/* Financial Assistance Amount & Match Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                          Subsidy / Benefit
                        </p>
                        <p className="text-lg sm:text-xl font-black text-emerald-900 font-serif">
                          {scheme.financial_assistance}
                        </p>
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-full">
                        <span>{match_score}% Match</span>
                      </div>
                    </div>

                  </div>

                  {/* Brief Description */}
                  <p className="text-stone-700 text-sm leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Why You Match Explanations (Prompt Requirement) */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <p className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('eligibility_reasons')}</span>
                    </p>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>

                    {missing_criteria.length > 0 && (
                      <div className="pt-2 border-t border-stone-200/80 mt-2">
                        <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                          {t('missing_items')}
                        </p>
                        <ul className="space-y-1 text-xs text-amber-900">
                          {missing_criteria.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Audio Button */}
                      <button
                        onClick={() => handleSpeakScheme(rec)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-amber-700" />
                        <span>{t('read_aloud')}</span>
                      </button>

                      {/* Official Portal Link */}
                      <a
                        href={scheme.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-700" />
                        <span>{t('official_apply')}</span>
                      </a>

                      {/* Prepare Documents Button */}
                      <button
                        onClick={() => onPrepareDocuments(scheme.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{t('prepare_docs')}</span>
                      </button>
                    </div>

                    {/* Expand/Collapse Toggle */}
                    <button
                      onClick={() => setExpandedSchemeId(isExpanded ? null : scheme.id)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors ml-auto"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Full Details & Documents'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                  </div>

                </div>

                {/* Collapsible Expanded Details Section */}
                {isExpanded && (
                  <div className="bg-emerald-50/40 p-6 border-t border-stone-200 space-y-4 text-xs text-stone-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Required Documents */}
                      <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-700" />
                          <span>Required Documents Checklist</span>
                        </h4>
                        <p className="text-stone-600 leading-relaxed">
                          {scheme.required_documents}
                        </p>
                      </div>

                      {/* Application Steps */}
                      <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-700" />
                          <span>Application Steps & Timelines</span>
                        </h4>
                        <p className="text-stone-600 leading-relaxed">
                          {scheme.application_instructions}
                        </p>
                        <div className="pt-2 text-[11px] text-stone-500">
                          <span>Opening: <strong>{scheme.opening_date}</strong></span> • <span>Closing: <strong>{scheme.closing_date}</strong></span>
                        </div>
                      </div>

                    </div>

                    {/* Official Contact & Helpline */}
                    {scheme.helpline_number && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-700" />
                          <span>Official Department Helpline: <strong>{scheme.helpline_number}</strong></span>
                        </span>
                        <span className="text-[11px] text-amber-700 font-medium">Toll-free / District Office</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Official Disclaimer (Prompt Requirement) */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-500 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 text-stone-400 mt-0.5" />
        <p>
          <strong>Official Transparency Note:</strong> KrishiSetu evaluates potential eligibility based on verified government guidelines. Official sanction is granted solely by the concerned government authority upon field and document verification.
        </p>
      </div>
    </div>
  );
};
