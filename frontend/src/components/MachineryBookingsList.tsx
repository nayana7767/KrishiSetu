import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Tractor, 
  Receipt, 
  Phone,
  RefreshCw,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Booking {
  id: number;
  booking_code: string;
  machinery_id: number;
  farmer_id: number;
  booking_date: string;
  time_slot: string;
  duration_hours: number;
  acreage: number;
  rental_cost: number;
  operator_cost: number;
  transport_cost: number;
  total_amount: number;
  status: string;
  farmer_village: string;
  notes?: string;
  provider_notes?: string;
  created_at: string;
  machinery?: {
    name: string;
    model_name: string;
    category: string;
    village: string;
    taluk: string;
    district: string;
    image_url?: string;
    provider?: {
      business_name: string;
      contact_name: string;
      phone: string;
    };
  };
}

export const MachineryBookingsList: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to load farmer bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Failed to cancel booking', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed by Provider',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2
        };
      case 'completed':
        return {
          label: 'Service Completed',
          color: 'bg-teal-700 text-white border-teal-800',
          icon: CheckCircle2
        };
      case 'in_progress':
        return {
          label: 'In Progress in Field',
          color: 'bg-sky-100 text-sky-900 border-sky-300',
          icon: Clock
        };
      case 'rejected':
        return {
          label: 'Rejected by Provider',
          color: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: XCircle
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-stone-200 text-stone-700 border-stone-300',
          icon: X
        };
      default:
        return {
          label: 'Requested (Awaiting Confirmation)',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Clock
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-bold uppercase">
              <Calendar className="w-3.5 h-3.5" />
              <span>Machinery Reservation Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              My Machinery Bookings
            </h1>
            <p className="text-amber-100 text-sm font-normal">
              Review reservation statuses, transparent fare breakdown, and provider contact numbers.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="p-3 rounded-2xl bg-amber-800 hover:bg-amber-600 text-white flex items-center gap-2 text-xs font-bold shrink-0 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm font-semibold">{t('loading')}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
          <Tractor className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">No machinery bookings yet</h3>
          <p className="text-sm text-stone-500">
            Browse our agricultural marketplace to rent tractors, harvesters, and sprayers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const statusConfig = getStatusBadge(b.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-amber-500 shadow-sm transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusConfig.label}</span>
                      </span>

                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {b.booking_code}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 font-serif pt-1">
                      {b.machinery?.name || 'Farm Machinery'}
                    </h3>

                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery Location: <strong>{b.farmer_village}</strong></span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[11px] font-bold text-stone-500 uppercase">Total Amount</p>
                    <p className="text-2xl font-black font-mono text-emerald-800">
                      ₹{b.total_amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {b.duration_hours} hrs • {b.acreage} acres
                    </p>
                  </div>
                </div>

                {/* Date & Time Slot Row */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 font-semibold">Scheduled Date:</span>
                    <p className="font-bold text-stone-800">{b.booking_date}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-semibold">Time Slot:</span>
                    <p className="font-bold text-stone-800 capitalize">{b.time_slot.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-semibold">Pricing Split:</span>
                    <p className="font-bold text-stone-800">
                      Rent: ₹{b.rental_cost} | Op: ₹{b.operator_cost} | Trans: ₹{b.transport_cost}
                    </p>
                  </div>
                </div>

                {/* Notes and Provider Communication */}
                {b.provider_notes && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    <strong>Provider Message:</strong> {b.provider_notes}
                  </div>
                )}

                {/* Provider Contact & Actions */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  {b.machinery?.provider && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-600">Provider: <strong>{b.machinery.provider.business_name}</strong></span>
                      <a
                        href={`tel:${b.machinery.provider.phone}`}
                        className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-amber-700" />
                        <span>{b.machinery.provider.phone}</span>
                      </a>
                    </div>
                  )}

                  {b.status === 'requested' || b.status === 'confirmed' ? (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors ml-auto"
                    >
                      Cancel Booking
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
