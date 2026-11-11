import React, { useState, useEffect } from 'react';
import { 
  Tractor, 
  MapPin, 
  Phone, 
  Map as MapIcon, 
  LayoutGrid, 
  Search, 
  Filter, 
  CheckCircle2, 
  Gauge, 
  Sparkles, 
  Coins, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MachineryMap } from './MachineryMap';
import { MachineryBookingModal } from './MachineryBookingModal';

interface Machinery {
  id: number;
  provider_id: number;
  name: string;
  model_name: string;
  category: string;
  description?: string;
  image_url?: string;
  price_per_hour: number;
  price_per_acre?: number;
  price_per_day?: number;
  has_operator: boolean;
  operator_rate_per_hour: number;
  transport_rate_per_km: number;
  equipment_condition: string;
  horsepower: number;
  district: string;
  taluk: string;
  village: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  provider?: {
    business_name: string;
    contact_name: string;
    phone: string;
  };
}

export const MachineryMarketplace: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [machineryList, setMachineryList] = useState<Machinery[]>([]);
  const [mapPins, setMapPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [withOperatorOnly, setWithOperatorOnly] = useState(false);

  // Booking Modal
  const [selectedMachineForBooking, setSelectedMachineForBooking] = useState<Machinery | null>(null);

  useEffect(() => {
    fetchMachinery();
    fetchMapPins();
  }, [selectedDistrict, selectedCategory, withOperatorOnly]);

  const fetchMachinery = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (selectedDistrict !== 'all') queryParams.append('district', selectedDistrict);
      if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      if (withOperatorOnly) queryParams.append('has_operator', 'true');
      if (searchQuery) queryParams.append('search', searchQuery);

      const res = await fetch(`/api/machinery?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMachineryList(data);
      }
    } catch (err) {
      console.error('Failed to load machinery listings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMapPins = async () => {
    try {
      const res = await fetch('/api/machinery/map-pins');
      if (res.ok) {
        const data = await res.json();
        setMapPins(data);
      }
    } catch (err) {
      console.error('Failed to load map pins', err);
    }
  };

  const handleSelectFromMap = (id: number) => {
    const item = machineryList.find((m) => m.id === id);
    if (item) {
      setSelectedMachineForBooking(item);
    }
  };

  const categories = [
    { id: 'all', label: 'All Equipment' },
    { id: 'tractor', label: 'Tractors' },
    { id: 'harvester', label: 'Combine Harvesters' },
    { id: 'rotavator', label: 'Rotavators / Tillers' },
    { id: 'seed_drill', label: 'Seed Drills' },
    { id: 'sprayer', label: 'Power Sprayers' },
    { id: 'pump', label: 'Mobile Water Pumps' },
    { id: 'thresher', label: 'Multi-Crop Threshers' }
  ];

  const districts = ['all', 'Mandya', 'Mysuru', 'Belagavi', 'Tumakuru', 'Hassan', 'Davanagere'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-bold uppercase">
              <Tractor className="w-3.5 h-3.5" />
              <span>Verified Local Agricultural Machinery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              {t('machinery_title')}
            </h1>
            <p className="text-emerald-100 text-sm font-normal">
              {t('machinery_subtitle')}
            </p>
          </div>

          {/* View Toggle: Grid vs Leaflet Map */}
          <div className="flex items-center bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-700/60 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{t('view_grid')}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>{t('view_map')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder={t('search_machinery')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMachinery()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* District Select */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-stone-400 hidden sm:block" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'all' ? 'All Karnataka Districts' : `${d} District`}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Operator Checkbox Filter */}
          <div className="flex items-center px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl">
            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={withOperatorOnly}
                onChange={(e) => setWithOperatorOnly(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
              <span>{t('with_operator_only')}</span>
            </label>
          </div>

        </div>
      </div>

      {/* Main View: Map View OR Grid View */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <MachineryMap
            pins={mapPins}
            onSelectMachine={handleSelectFromMap}
          />
        </div>
      ) : (
        /* Machinery Grid View */
        <div>
          {loading ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-stone-500 text-sm font-semibold">{t('loading')}</p>
            </div>
          ) : machineryList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
              <Tractor className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">No machinery matching your filter</h3>
              <p className="text-xs text-stone-500">
                Try selecting "All Karnataka Districts" or clearing the category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {machineryList.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl border-2 border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Machinery Image Header */}
                    <div className="relative h-48 w-full bg-stone-200 overflow-hidden">
                      <img
                        src={m.image_url || "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=600"}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
                        {m.category.replace('_', ' ')}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-stone-900 text-xs font-bold shadow-sm">
                        {m.horsepower} HP
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 font-serif leading-snug group-hover:text-emerald-800 transition-colors">
                          {m.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{m.village}, {m.taluk}, {m.district}</span>
                        </p>
                      </div>

                      {/* Transparent Pricing Badges */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                          <p className="text-[10px] font-bold text-emerald-800 uppercase">Hourly Rate</p>
                          <p className="text-base font-black text-emerald-900 font-mono">
                            ₹{m.price_per_hour}/hr
                          </p>
                        </div>

                        {m.price_per_acre ? (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                            <p className="text-[10px] font-bold text-amber-800 uppercase">Acreage Rate</p>
                            <p className="text-base font-black text-amber-900 font-mono">
                              ₹{m.price_per_acre}/acre
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                            <p className="text-[10px] font-bold text-stone-500 uppercase">Day Rate</p>
                            <p className="text-base font-black text-stone-800 font-mono">
                              ₹{m.price_per_day || m.price_per_hour * 8}/day
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Operator & Transport conditions */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                          m.has_operator ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {m.has_operator ? '✓ Operator Available' : 'Self-Operated'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px]">
                          Transport: ₹{m.transport_rate_per_km}/km
                        </span>
                      </div>

                      {/* Provider contact preview */}
                      {m.provider && (
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                          <span className="font-semibold truncate max-w-[150px]">
                            {m.provider.business_name}
                          </span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setSelectedMachineForBooking(m)}
                      className="w-full btn-farmer-primary py-3 text-sm shadow-md"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t('book_now')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal Popup */}
      {selectedMachineForBooking && (
        <MachineryBookingModal
          machinery={selectedMachineForBooking}
          onClose={() => setSelectedMachineForBooking(null)}
          onSuccess={() => {
            fetchMachinery();
          }}
        />
      )}
    </div>
  );
};
