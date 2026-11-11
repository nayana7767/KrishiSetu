import React from 'react';
import { 
  Building2, 
  Wallet, 
  Tractor, 
  ClipboardList, 
  Calendar, 
  HelpCircle, 
  Edit3, 
  MapPin, 
  Sprout, 
  Droplets, 
  BadgeCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface FarmerDashboardProps {
  onNavigate: (tab: string) => void;
  openProfileModal: () => void;
  openHelpModal: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onNavigate,
  openProfileModal,
  openHelpModal
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const profile = user?.farmer_profile;

  const quickCards = [
    {
      id: 'subsidies',
      label: t('quick_find_subsidy'),
      desc: 'Government subsidy schemes matching your land & crop',
      icon: Building2,
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      iconColor: 'bg-white/20 text-white'
    },
    {
      id: 'loans',
      label: t('quick_apply_loan'),
      desc: 'Kisan Credit Card & low interest agricultural credit',
      icon: Wallet,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      iconColor: 'bg-white/20 text-white'
    },
    {
      id: 'machinery',
      label: t('quick_find_machinery'),
      desc: 'Tractors, harvesters & farm implements for rent',
      icon: Tractor,
      color: 'bg-emerald-800 hover:bg-emerald-900 text-white',
      iconColor: 'bg-white/20 text-white'
    },
    {
      id: 'applications',
      label: t('quick_my_applications'),
      desc: 'Track status of your submitted scheme applications',
      icon: ClipboardList,
      color: 'bg-teal-700 hover:bg-teal-800 text-white',
      iconColor: 'bg-white/20 text-white'
    },
    {
      id: 'my-bookings',
      label: t('quick_my_bookings'),
      desc: 'View your tractor and machinery reservations',
      icon: Calendar,
      color: 'bg-amber-700 hover:bg-amber-800 text-white',
      iconColor: 'bg-white/20 text-white'
    },
    {
      id: 'help',
      label: t('quick_get_help'),
      desc: 'Voice support, Kisan helpline & rejection assistance',
      icon: HelpCircle,
      color: 'bg-stone-800 hover:bg-stone-900 text-white',
      iconColor: 'bg-white/20 text-white'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Farmer Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              <BadgeCheck className="w-4 h-4 text-emerald-700" />
              <span>Registered Farmer Profile</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              {t('welcome_farmer')} {user?.full_name || 'Farmer Brother'}!
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {profile?.village}, {profile?.taluk}, {profile?.district || 'Karnataka'}
              </span>
              <span className="flex items-center gap-1 font-semibold text-stone-800">
                <Sprout className="w-4 h-4 text-emerald-600" />
                {profile?.land_acres || 2.5} Acres ({profile?.land_ownership || 'Owned'})
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-4 h-4 text-sky-600" />
                {profile?.irrigation_type?.toUpperCase() || 'CANAL'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {profile?.fruits_id && (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Karnataka FRUITS ID
                </p>
                <p className="font-mono font-bold text-sm">{profile.fruits_id}</p>
              </div>
            )}

            <button
              onClick={openProfileModal}
              className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm flex items-center justify-center gap-2 border border-stone-300 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Farm Profile</span>
            </button>
          </div>

        </div>

        {/* Crops summary tags */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase mr-1">Cultivated Crops:</span>
          {(profile?.crops || 'Paddy, Sugarcane').split(',').map((crop, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              🌾 {crop.trim()}
            </span>
          ))}
          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
            Season: {profile?.crop_season || 'Kharif'}
          </span>
        </div>
      </div>

      {/* 6 Large Tactile Visual Action Cards */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-stone-900 font-serif">
            What would you like to do today?
          </h2>
          <p className="text-xs text-stone-500">
            Tap any large card below to access subsidies, machinery, loans, or applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => {
                  if (card.id === 'help') {
                    openHelpModal();
                  } else {
                    onNavigate(card.id);
                  }
                }}
                className={`text-left p-6 rounded-3xl ${card.color} shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between h-48 group`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`w-14 h-14 rounded-2xl ${card.iconColor} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <ChevronRight className="w-6 h-6 opacity-75 group-hover:translate-x-1 transition-transform" />
                </div>

                <div>
                  <h3 className="text-2xl font-black font-serif tracking-tight">
                    {card.label}
                  </h3>
                  <p className="text-xs text-white/90 line-clamp-2 mt-1 font-medium">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
