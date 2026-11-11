import React, { useState } from 'react';
import { 
  Tractor, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Phone, 
  Sparkles, 
  Receipt,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface Machinery {
  id: number;
  name: string;
  model_name: string;
  category: string;
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
  image_url?: string;
  provider?: {
    business_name: string;
    contact_name: string;
    phone: string;
  };
}

interface BookingModalProps {
  machinery: Machinery;
  onClose: () => void;
  onSuccess: () => void;
}

export const MachineryBookingModal: React.FC<BookingModalProps> = ({
  machinery,
  onClose,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { user, token } = useAuth();

  // Tomorrow's date as default
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState('morning_8_12');
  const [durationHours, setDurationHours] = useState(4);
  const [acreage, setAcreage] = useState(user?.farmer_profile?.land_acres || 2.0);
  const [withOperator, setWithOperator] = useState(machinery.has_operator);
  const [distanceKm, setDistanceKm] = useState(5.0);
  const [farmerVillage, setFarmerVillage] = useState(user?.farmer_profile?.village || 'Guthalu, Mandya');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<any | null>(null);

  // Price calculations
  const rentalCost = machinery.price_per_hour * durationHours;
  const operatorCost = withOperator && machinery.has_operator ? machinery.operator_rate_per_hour * durationHours : 0;
  const transportCost = machinery.transport_rate_per_km * distanceKm;
  const totalAmount = rentalCost + operatorCost + transportCost;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          machinery_id: machinery.id,
          booking_date: bookingDate,
          time_slot: timeSlot,
          duration_hours: durationHours,
          acreage: acreage,
          with_operator: withOperator,
          distance_km: distanceKm,
          farmer_village: farmerVillage,
          notes: notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.detail || 'Booking request failed');
      } else {
        setConfirmationData(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              {confirmationData ? 'Booking Confirmation' : t('booking_title')}
            </h3>
            <p className="text-xs text-stone-500">
              {machinery.name} • {machinery.village}, {machinery.taluk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {confirmationData ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-stone-900 font-serif">
                {t('booking_success')}
              </h4>
              <p className="text-sm text-stone-600">
                Your reservation has been sent directly to <strong>{machinery.provider?.business_name || 'the machinery provider'}</strong>.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="font-bold text-stone-600 uppercase">Booking Reference:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {confirmationData.booking_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Equipment:</span>
                <span className="font-bold text-stone-800">{machinery.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Reserved Date:</span>
                <span className="font-bold text-stone-800">{confirmationData.booking_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Time Slot:</span>
                <span className="font-bold text-stone-800 capitalize">{confirmationData.time_slot.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-sm">
                <span className="font-bold text-stone-900">Total Payable to Provider:</span>
                <span className="font-mono font-black text-emerald-800">₹{confirmationData.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Provider contact info */}
            {machinery.provider && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between text-xs">
                <div className="text-left space-y-0.5">
                  <p className="font-bold">{machinery.provider.contact_name}</p>
                  <p className="text-[11px] text-amber-800">{machinery.provider.business_name}</p>
                </div>
                <a
                  href={`tel:${machinery.provider.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {machinery.provider.phone}</span>
                </a>
              </div>
            )}

            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-md transition-colors"
            >
              View in My Bookings
            </button>
          </div>
        ) : (
          /* Booking Reservation Form */
          <form onSubmit={handleSubmitBooking} className="space-y-5">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Schedule Overlap / Double-Booking Conflict:</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Date and Slot selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  {t('select_date')}
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  {t('select_slot')}
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="morning_8_12">{t('slot_morning')}</option>
                  <option value="afternoon_12_4">{t('slot_afternoon')}</option>
                  <option value="evening_4_8">{t('slot_evening')}</option>
                  <option value="full_day">{t('slot_full_day')}</option>
                </select>
              </div>
            </div>

            {/* Duration and Acreage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  {t('duration_hours')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  {t('acreage')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={acreage}
                  onChange={(e) => setAcreage(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Operator Checkbox and Distance */}
            <div className="space-y-3 pt-1">
              {machinery.has_operator && (
                <label className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withOperator}
                    onChange={(e) => setWithOperator(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-950">
                    {t('include_operator')}
                  </span>
                </label>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase flex justify-between">
                  <span>{t('distance_km')}</span>
                  <span className="font-mono font-bold text-stone-600">{distanceKm} km (₹{transportCost})</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <p className="text-[11px] text-stone-500 italic">{t('delivery_note')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Farm Location / Village Name
                </label>
                <input
                  type="text"
                  required
                  value={farmerVillage}
                  onChange={(e) => setFarmerVillage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Transparent Pricing Breakdown Receipt (Prompt Requirement) */}
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 space-y-2 text-xs">
              <p className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('fare_summary')}</span>
              </p>
              
              <div className="flex justify-between text-stone-600">
                <span>{t('rental_charge')} ({durationHours} hrs × ₹{machinery.price_per_hour}):</span>
                <span className="font-mono font-bold">₹{rentalCost.toLocaleString('en-IN')}</span>
              </div>

              {withOperator && (
                <div className="flex justify-between text-stone-600">
                  <span>{t('operator_charge')} ({durationHours} hrs × ₹{machinery.operator_rate_per_hour}):</span>
                  <span className="font-mono font-bold">₹{operatorCost.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>{t('transport_charge')} ({distanceKm} km × ₹{machinery.transport_rate_per_km}):</span>
                <span className="font-mono font-bold">₹{transportCost.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between border-t border-stone-300 pt-2 text-sm font-black text-stone-900">
                <span>{t('total_payable')}:</span>
                <span className="font-mono text-emerald-800 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit Reservation Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-farmer-primary py-3.5 shadow-lg"
            >
              <Tractor className="w-5 h-5" />
              <span>{loading ? t('loading') : t('confirm_booking')}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
