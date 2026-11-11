import React, { useState } from 'react';
import { 
  Sprout, 
  Globe, 
  Volume2, 
  VolumeX, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Tractor, 
  Building2, 
  Wallet, 
  FileCheck2, 
  ClipboardList, 
  ShieldCheck, 
  Wrench
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../i18n/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openProfileModal: () => void;
  openHelpModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openProfileModal,
  openHelpModal
}) => {
  const { language, setLanguage, languages, t, speak, isSpeaking, stopSpeaking } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(
        `${t('app_name')}. ${t('tagline')}. ${t('hero_subtitle')}`
      );
    }
  };

  const navItems = [
    { id: 'home', label: t('home'), icon: Sprout },
    { id: 'subsidies', label: t('subsidies'), icon: Building2 },
    { id: 'loans', label: t('loans'), icon: Wallet },
    { id: 'machinery', label: t('machinery'), icon: Tractor },
    { id: 'checklist', label: t('checklist'), icon: FileCheck2 },
    { id: 'applications', label: t('applications'), icon: ClipboardList }
  ];

  if (user?.role === 'provider' || user?.role === 'admin') {
    navItems.push({ id: 'provider', label: t('provider_portal'), icon: Wrench });
  }

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: t('admin_portal'), icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 bg-emerald-800 text-white shadow-lg border-b-2 border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-emerald-900 shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-8 h-8 text-emerald-900 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
                  {t('app_name')}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase bg-amber-400 text-emerald-950 rounded-full">
                  Agritech
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium hidden md:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 shadow-sm'
                      : 'text-emerald-100 hover:bg-emerald-700/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Language, Voice, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Voice Help Button (TTS) */}
            <button
              onClick={handleVoiceToggle}
              title={isSpeaking ? "Stop Voice Help" : "Listen to page instructions"}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                isSpeaking 
                  ? 'bg-amber-500 text-stone-900 border-amber-300 animate-pulse font-bold'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5 text-stone-950" />
                  <span className="text-xs hidden md:inline font-bold">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-amber-300" />
                  <span className="text-xs hidden md:inline font-semibold">{t('voice_guide')}</span>
                </>
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-sm font-semibold transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === language)?.nativeName || 'Language'}
                </span>
                <span className="sm:hidden uppercase">{language}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white text-stone-800 shadow-2xl border border-stone-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    Select Language / ಭಾಷೆ
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        language === l.code ? 'text-emerald-800 bg-emerald-50 font-bold' : 'text-stone-700'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      <span className="text-xs text-stone-400 font-normal">({l.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons / User Profile */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-700 text-white text-sm font-semibold transition-all"
                >
                  <UserIcon className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline max-w-[120px] truncate">{user.full_name}</span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl hover:bg-red-800/80 text-emerald-200 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold bg-transparent hover:bg-emerald-700 text-white transition-colors border border-emerald-600"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 transition-colors shadow-md"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl hover:bg-emerald-700 text-emerald-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-emerald-700/80 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 font-bold'
                      : 'text-emerald-100 hover:bg-emerald-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
