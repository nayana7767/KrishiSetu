import React, { useState } from 'react';
import { 
  X, 
  Sprout, 
  Tractor, 
  ShieldCheck, 
  User as UserIcon, 
  Phone, 
  Lock, 
  Mail, 
  MapPin, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'farmer' | 'provider'>('farmer');

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Mandya');
  const [taluk, setTaluk] = useState('Mandya');
  const [village, setVillage] = useState('Guthalu');
  const [landAcres, setLandAcres] = useState(2.5);
  const [crops, setCrops] = useState('Paddy, Sugarcane');
  const [farmerCategory, setFarmerCategory] = useState('small_marginal');
  const [irrigationType, setIrrigationType] = useState('canal');
  const [fruitsId, setFruitsId] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(loginIdentifier, loginPassword);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed');
    } else {
      onSuccess();
      onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      email,
      phone,
      password,
      full_name: fullName,
      role,
      preferred_language: language,
      district,
      taluk,
      village,
      land_acres: landAcres,
      crops,
      farmer_category: farmerCategory,
      irrigation_type: irrigationType,
      fruits_id: fruitsId || null,
      business_name: role === 'provider' ? businessName : undefined
    };

    const res = await register(payload);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    } else {
      onSuccess();
      onClose();
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setLoginIdentifier(demoEmail);
    setLoginPassword(demoPass);
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`text-lg font-bold font-serif pb-1 transition-colors ${
                mode === 'login'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {t('login')}
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`text-lg font-bold font-serif pb-1 transition-colors ${
                mode === 'register'
                  ? 'text-emerald-800 border-b-2 border-emerald-700'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              {t('register')}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Quick 1-Click Demo Login Bar */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
          <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
            Quick 1-Click Demo Credentials:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickDemo('farmer@krishisetu.in', 'farmer123')}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 font-semibold hover:bg-amber-100"
            >
              🌾 Farmer Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('provider@krishisetu.in', 'provider123')}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 font-semibold hover:bg-amber-100"
            >
              🚜 Machinery Owner
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@krishisetu.in', 'admin123')}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 font-semibold hover:bg-amber-100"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        {mode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9845012345 or farmer@krishisetu.in"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-farmer-primary py-3.5 shadow-md"
            >
              <span>{loading ? t('loading') : t('login')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Role Selector (Farmer vs Machinery Provider) */}
            <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-stone-100 border border-stone-200">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'farmer'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sprout className="w-4 h-4" />
                <span>Farmer (ರೈತ)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'provider'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Tractor className="w-4 h-4" />
                <span>Machinery Provider</span>
              </button>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basavaraj Patil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9845012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. farmer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Taluk</label>
                <input
                  type="text"
                  required
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Village</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            {/* Farmer Specific Details (Prompt Requirement) */}
            {role === 'farmer' && (
              <div className="space-y-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Agricultural Profile (For Subsidy Matching)
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 uppercase">Landholding (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={landAcres}
                      onChange={(e) => setLandAcres(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 uppercase">Farmer Category</label>
                    <select
                      value={farmerCategory}
                      onChange={(e) => setFarmerCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                    >
                      <option value="small_marginal">Small & Marginal (&lt; 5 Acres)</option>
                      <option value="sc_st">SC / ST Farmer</option>
                      <option value="woman">Woman Farmer</option>
                      <option value="medium">Medium Farmer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 uppercase">Crops Cultivated</label>
                    <input
                      type="text"
                      placeholder="e.g. Paddy, Sugarcane"
                      value={crops}
                      onChange={(e) => setCrops(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700 uppercase">Irrigation Source</label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                    >
                      <option value="canal">Canal Irrigation</option>
                      <option value="borewell">Borewell</option>
                      <option value="drip">Drip Irrigation</option>
                      <option value="rainfed">Rainfed / Dryland</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 uppercase">Karnataka FRUITS ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. KA-MAN-2024-98451"
                    value={fruitsId}
                    onChange={(e) => setFruitsId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Provider Specific Details */}
            {role === 'provider' && (
              <div className="space-y-1 p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Machinery Center / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandya Kisan Agro Services"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-farmer-primary py-3.5 shadow-md"
            >
              <span>{loading ? t('loading') : t('register')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
