import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { FarmerDashboard } from './components/FarmerDashboard';
import { SubsidyFinder } from './components/SubsidyFinder';
import { LoanAssistant } from './components/LoanAssistant';
import { MachineryMarketplace } from './components/MachineryMarketplace';
import { DocumentChecklist } from './components/DocumentChecklist';
import { ApplicationTracker } from './components/ApplicationTracker';
import { MachineryBookingsList } from './components/MachineryBookingsList';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { HelpModal } from './components/HelpModal';
import { Sprout, Phone, ShieldCheck, Heart } from 'lucide-react';

const MainApp: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login'
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedSchemeForDocs, setSelectedSchemeForDocs] = useState<number | null>(null);

  const handleNavigateToDocs = (schemeId: number) => {
    setSelectedSchemeForDocs(schemeId);
    setActiveTab('checklist');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={(mode) => setAuthModal({ open: true, mode })}
        openProfileModal={() => setProfileModalOpen(true)}
        openHelpModal={() => setHelpModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {isAuthenticated && user?.role === 'farmer' ? (
              <FarmerDashboard
                onNavigate={setActiveTab}
                openProfileModal={() => setProfileModalOpen(true)}
                openHelpModal={() => setHelpModalOpen(true)}
              />
            ) : null}

            <LandingHero
              onNavigate={setActiveTab}
              openAuthModal={(mode) => setAuthModal({ open: true, mode })}
            />
          </div>
        )}

        {activeTab === 'subsidies' && (
          <SubsidyFinder onPrepareDocuments={handleNavigateToDocs} />
        )}

        {activeTab === 'loans' && <LoanAssistant />}

        {activeTab === 'machinery' && <MachineryMarketplace />}

        {activeTab === 'checklist' && (
          <DocumentChecklist initialSchemeId={selectedSchemeForDocs} />
        )}

        {activeTab === 'applications' && <ApplicationTracker />}

        {activeTab === 'my-bookings' && <MachineryBookingsList />}

        {activeTab === 'provider' && <ProviderDashboard />}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t-4 border-emerald-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-emerald-950 font-bold">
                  <Sprout className="w-5 h-5 text-emerald-950 stroke-[2.5]" />
                </div>
                <span className="text-xl font-bold font-serif text-white">
                  {t('app_name')}
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {t('tagline')}. Connecting small and marginal farmers across Karnataka with verified government subsidies, credit facilities, and local machinery rentals.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                Platform Services
              </p>
              <ul className="space-y-1.5 text-stone-400">
                <li><button onClick={() => setActiveTab('subsidies')} className="hover:text-amber-400">Government Subsidies</button></li>
                <li><button onClick={() => setActiveTab('loans')} className="hover:text-amber-400">Agricultural Loans (KCC)</button></li>
                <li><button onClick={() => setActiveTab('machinery')} className="hover:text-amber-400">Machinery Marketplace</button></li>
                <li><button onClick={() => setActiveTab('checklist')} className="hover:text-amber-400">Bhoomi RTC & Document Checklist</button></li>
                <li><button onClick={() => setActiveTab('applications')} className="hover:text-amber-400">Application Status Tracker</button></li>
              </ul>
            </div>

            {/* Official Agricultural Resources */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                Official Karnataka Portals
              </p>
              <ul className="space-y-1.5 text-stone-400">
                <li><a href="https://raitamitra.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400">Raita Mitra Karnataka</a></li>
                <li><a href="https://landrecords.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400">Bhoomi RTC Portal</a></li>
                <li><a href="https://fruits.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400">FRUITS Karnataka (FID)</a></li>
                <li><a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400">PM-KISAN Central Portal</a></li>
                <li><a href="https://samrakshane.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400">Samrakshane (Crop Insurance)</a></li>
              </ul>
            </div>

            {/* Toll-Free Help */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                Farmer Emergency Helplines
              </p>
              <div className="space-y-2 text-stone-400">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kisan Call Centre: <strong>1800-180-1551</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Agri Dept: <strong>080-22212804</strong></span>
                </p>
                <button
                  onClick={() => setHelpModalOpen(true)}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Submit Support Ticket
                </button>
              </div>
            </div>

          </div>

          <div className="pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>
              © 2026 KrishiSetu Agritech Platform. Built for Indian Farmers with English, ಕನ್ನಡ, हिन्दी, తెలుగు, தமிழ் support.
            </p>
            <p className="flex items-center gap-1">
              <span>Empowering rural prosperity</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </p>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={() => {
            setActiveTab('home');
          }}
        />
      )}

      {profileModalOpen && (
        <FarmerProfileModal
          onClose={() => setProfileModalOpen(false)}
          onSuccess={() => {}}
        />
      )}

      {helpModalOpen && (
        <HelpModal onClose={() => setHelpModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
