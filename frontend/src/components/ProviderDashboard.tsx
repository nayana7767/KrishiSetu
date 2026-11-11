import React, { useState, useEffect } from 'react';
import { 
  Tractor, 
  Coins, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Power, 
  Calendar,
  X,
  Phone,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const ProviderDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [stats, setStats] = useState<any | null>(null);
  const [machinery, setMachinery] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'inventory'>('bookings');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Equipment Form State
  const [name, setName] = useState('');
  const [modelName, setModelName] = useState('');
  const [category, setCategory] = useState('tractor');
  const [horsepower, setHorsepower] = useState(45);
  const [pricePerHour, setPricePerHour] = useState(800);
  const [pricePerAcre, setPricePerAcre] = useState(1300);
  const [pricePerDay, setPricePerDay] = useState(5500);
  const [hasOperator, setHasOperator] = useState(true);
  const [operatorRate, setOperatorRate] = useState(150);
  const [transportRate, setTransportRate] = useState(25);
  const [district, setDistrict] = useState(user?.machinery_provider?.district || 'Mandya');
  const [taluk, setTaluk] = useState(user?.machinery_provider?.taluk || 'Maddur');
  const [village, setVillage] = useState(user?.machinery_provider?.village || 'Kestur');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProviderData();
  }, [token]);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, machineryRes, bookingsRes] = await Promise.all([
        fetch('/api/provider/dashboard-stats', { headers }),
        fetch('/api/provider/my-machinery', { headers }),
        fetch('/api/provider/bookings', { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (machineryRes.ok) setMachinery(await machineryRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (err) {
      console.error('Failed to load provider data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, nextStatus: string, notes?: string) => {
    try {
      const res = await fetch(`/api/provider/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: nextStatus,
          provider_notes: notes || `Updated to ${nextStatus} by provider.`
        })
      });

      if (res.ok) {
        fetchProviderData();
      }
    } catch (err) {
      console.error('Failed to update booking status', err);
    }
  };

  const handleToggleActive = async (machineryId: number) => {
    try {
      const res = await fetch(`/api/provider/machinery/${machineryId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProviderData();
      }
    } catch (err) {
      console.error('Failed to toggle equipment status', err);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/provider/machinery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          model_name: modelName,
          category,
          horsepower,
          price_per_hour: pricePerHour,
          price_per_acre: pricePerAcre,
          price_per_day: pricePerDay,
          has_operator: hasOperator,
          operator_rate_per_hour: operatorRate,
          transport_rate_per_km: transportRate,
          district,
          taluk,
          village,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=600'
        })
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        fetchProviderData();
        setName('');
        setModelName('');
      }
    } catch (err) {
      console.error('Failed to add machinery', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Machinery Provider Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              {stats?.provider_name || 'Equipment Owner Dashboard'}
            </h1>
            <p className="text-emerald-100 text-sm font-normal">
              Manage machinery listings, confirm incoming farmer reservations, and track rental earnings.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Add New Machinery</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-stone-500 uppercase">Gross Estimated Earnings</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-800">
              ₹{stats.total_estimated_earnings?.toLocaleString('en-IN') || 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>₹{stats.total_completed_earnings?.toLocaleString('en-IN') || 0} completed</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-stone-500 uppercase">Active Farm Machinery</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-stone-900">
              {stats.total_machinery}
            </p>
            <p className="text-[11px] text-stone-500 font-medium">Ready for deployment</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-stone-500 uppercase">Pending Requests</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-amber-700">
              {stats.pending_requests}
            </p>
            <p className="text-[11px] text-amber-600 font-medium">Action needed</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-xs font-bold text-stone-500 uppercase">Completed Services</p>
            <p className="text-2xl sm:text-3xl font-black font-mono text-teal-800">
              {stats.completed_bookings}
            </p>
            <p className="text-[11px] text-teal-600 font-medium">Successfully billed</p>
          </div>
        </div>
      )}

      {/* Tabs: Incoming Bookings vs Inventory */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'bookings'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>Incoming Farmer Bookings</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-400 text-emerald-950 font-black">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'inventory'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>My Machinery Inventory</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-950 text-white">
            {machinery.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Incoming Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">No booking requests yet</h3>
              <p className="text-xs text-stone-500">
                Incoming reservations from nearby farmers will appear here with accept/reject controls.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900' :
                          b.status === 'completed' ? 'bg-teal-700 text-white' :
                          b.status === 'in_progress' ? 'bg-sky-100 text-sky-900' :
                          b.status === 'rejected' ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {b.status.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-500">{b.booking_code}</span>
                      </div>

                      <h4 className="text-xl font-bold text-stone-900 font-serif pt-1">
                        {b.machinery?.name || 'Farm Equipment'}
                      </h4>

                      <p className="text-xs text-stone-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Farmer Village: <strong>{b.farmer_village}</strong></span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-[11px] text-stone-500 font-bold uppercase">Payable Total</p>
                      <p className="text-2xl font-black font-mono text-emerald-800">
                        ₹{b.total_amount?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {b.duration_hours} hrs • {b.acreage} acres
                      </p>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-stone-500 font-semibold">Date:</span>
                      <p className="font-bold text-stone-800">{b.booking_date}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold">Slot:</span>
                      <p className="font-bold text-stone-800 capitalize">{b.time_slot.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-semibold">Farmer Notes:</span>
                      <p className="font-bold text-stone-800">{b.notes || 'None provided'}</p>
                    </div>
                  </div>

                  {/* Provider Action Buttons */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-stone-500">
                      Update booking state:
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {b.status === 'requested' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'confirmed', 'Booking confirmed by owner. Machinery will arrive on schedule.')}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm"
                          >
                            ✓ Accept & Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'rejected', 'Equipment undergoing routine maintenance on this date.')}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                          >
                            ✕ Reject Request
                          </button>
                        </>
                      )}

                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'in_progress', 'Machinery deployed in field.')}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                        >
                          Mark Field Work Started
                        </button>
                      )}

                      {b.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'completed', 'Tillage completed. Payment settled.')}
                          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs"
                        >
                          Mark Completed & Billed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machinery.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl border-2 border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <img
                  src={m.image_url || "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=600"}
                  alt={m.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {m.category}
                    </span>
                    <span className="text-xs font-bold text-stone-500">
                      {m.horsepower} HP
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900 font-serif">
                    {m.name}
                  </h4>

                  <p className="text-xs text-stone-500">
                    📍 {m.village}, {m.taluk}
                  </p>

                  <div className="pt-2 text-sm font-mono font-bold text-emerald-800">
                    ₹{m.price_per_hour}/hour • ₹{m.price_per_acre || 'N/A'}/acre
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleToggleActive(m.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    m.is_active
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{m.is_active ? 'Status: Active (Visible to Farmers)' : 'Status: Inactive'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Machinery Listing Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xl font-bold text-stone-900 font-serif">
                Add New Machinery Listing
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Machinery Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swaraj 744 FE 48HP Tractor with Cultivator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Model / Make Year
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swaraj 744 FE 2024"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="tractor">Tractor</option>
                    <option value="harvester">Combine Harvester</option>
                    <option value="rotavator">Rotavator</option>
                    <option value="seed_drill">Seed Drill</option>
                    <option value="sprayer">Power Sprayer</option>
                    <option value="pump">Mobile Water Pump</option>
                    <option value="thresher">Thresher</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Price/Hr (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Price/Acre (₹)
                  </label>
                  <input
                    type="number"
                    value={pricePerAcre}
                    onChange={(e) => setPricePerAcre(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Horsepower
                  </label>
                  <input
                    type="number"
                    value={horsepower}
                    onChange={(e) => setHorsepower(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Taluk
                  </label>
                  <input
                    type="text"
                    required
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Village
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md"
                >
                  {submitting ? 'Saving...' : 'Publish Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
