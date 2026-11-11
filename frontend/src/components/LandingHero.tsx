import React from 'react';
import { 
  Building2, 
  Tractor, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  MapPin, 
  Sparkles, 
  UserCheck, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface LandingHeroProps {
  onNavigate: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate, openAuthModal }) => {
  const { t } = useLanguage();
  const { login, isAuthenticated } = useAuth();

  const handleDemoLogin = async (email: string, pass: string, targetTab: string) => {
    const res = await login(email, pass);
    if (res.success) {
      onNavigate(targetTab);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white shadow-2xl p-6 sm:p-10 lg:p-14 border border-emerald-700/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>{t('free_transparent')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif leading-tight">
              {t('hero_title')}
            </h1>

            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl leading-relaxed font-normal">
              {t('hero_subtitle')}
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('subsidies')}
                className="btn-farmer-secondary"
              >
                <Building2 className="w-6 h-6 stroke-[2.5]" />
                <span>{t('browse_schemes_cta')}</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>

              <button
                onClick={() => onNavigate('machinery')}
                className="btn-farmer-primary border-2 border-emerald-400/40"
              >
                <Tractor className="w-6 h-6 stroke-[2.5]" />
                <span>{t('find_machinery_cta')}</span>
              </button>
            </div>

            {/* Quick Demo One-Click Login Pills */}
            <div className="pt-4 border-t border-emerald-700/60">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                Quick One-Click Demo Test Accounts:
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleDemoLogin('farmer@krishisetu.in', 'farmer123', 'subsidies')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-amber-200 border border-emerald-500 font-medium transition-all"
                >
                  🌾 Farmer Demo (Basavaraj - 2.5 Acres Mandya)
                </button>
                <button
                  onClick={() => handleDemoLogin('provider@krishisetu.in', 'provider123', 'provider')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-amber-200 border border-emerald-500 font-medium transition-all"
                >
                  🚜 Machinery Provider Demo (Siddalingappa Agri)
                </button>
                <button
                  onClick={() => handleDemoLogin('admin@krishisetu.in', 'admin123', 'admin')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-amber-200 border border-emerald-500 font-medium transition-all"
                >
                  🛡️ Administrator Demo
                </button>
              </div>
            </div>
          </div>

          {/* Right Visual Image & Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden border-4 border-amber-400/30 shadow-2xl bg-emerald-950">
              <img
                src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=800"
                alt="Indian Farmer in field"
                className="w-full h-72 sm:h-80 object-cover brightness-95 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Karnataka Raitha Seva Sahakara</span>
                </div>
                <p className="text-xs text-stone-200 mt-1">
                  Connecting over 1,200+ farmers across Mandya, Mysuru, Belagavi and Tumakuru.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Two Prominent Service Cards Required by Vision */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Two Core Pillars of KrishiSetu
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1">
            Choose what you need today — financial schemes or farm mechanization assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card A: Financial Assistance */}
          <div 
            onClick={() => onNavigate('subsidies')}
            className="group cursor-pointer bg-gradient-to-b from-white to-amber-50/50 rounded-3xl border-2 border-amber-200/80 hover:border-amber-500 shadow-md hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Building2 className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                  Pillar 1 • Subsidy & Credit
                </span>
                <h3 className="text-2xl font-bold text-stone-900 mt-2 font-serif group-hover:text-amber-800 transition-colors">
                  {t('service_financial')}
                </h3>
              </div>

              <p className="text-stone-600 text-base leading-relaxed">
                {t('service_financial_desc')}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rule-Based Eligibility</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>KCC 0-4% Interest Loans</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Document Checklist</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Application Tracking</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-amber-200/60 flex items-center justify-between text-amber-800 font-bold">
              <span className="text-base">{t('browse_schemes_cta')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

          {/* Card B: Agricultural Machinery */}
          <div 
            onClick={() => onNavigate('machinery')}
            className="group cursor-pointer bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl border-2 border-emerald-200/80 hover:border-emerald-600 shadow-md hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Tractor className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Pillar 2 • Machinery & Tools
                </span>
                <h3 className="text-2xl font-bold text-stone-900 mt-2 font-serif group-hover:text-emerald-800 transition-colors">
                  {t('service_machinery')}
                </h3>
              </div>

              <p className="text-stone-600 text-base leading-relaxed">
                {t('service_machinery_desc')}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tractors & Harvesters</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Karnataka Map View</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Per Hour / Acre Pricing</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prevent Double-Booking</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-emerald-200/60 flex items-center justify-between text-emerald-800 font-bold">
              <span className="text-base">{t('find_machinery_cta')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* How it Works / 4 Easy Steps */}
      <section className="bg-stone-100/80 rounded-3xl p-6 sm:p-10 border border-stone-200">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-stone-900 font-serif">
            How KrishiSetu Works for Every Farmer
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Simple 4-step workflow designed for ease and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="font-bold text-stone-900">Enter Details Once</h4>
            <p className="text-xs text-stone-600">
              Provide your land acreage, crops (paddy, ragi, sugarcane), and taluk.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="font-bold text-stone-900">Personalized Matching</h4>
            <p className="text-xs text-stone-600">
              See government subsidies you are potentially eligible for with clear match reasons.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="font-bold text-stone-900">Checklist & Portals</h4>
            <p className="text-xs text-stone-600">
              Mark documents ready (RTC, Aadhaar, FID) and jump straight to official portals.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h4 className="font-bold text-stone-900">Rent Farm Machinery</h4>
            <p className="text-xs text-stone-600">
              Find nearby tractors, compare hourly rates, and reserve with operator support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
