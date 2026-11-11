import React, { useState } from 'react';
import { X, Sprout, Save, MapPin, Droplets, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface FarmerProfileModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const FarmerProfileModal: React.FC<FarmerProfileModalProps> = ({ onClose, onSuccess }) => {
  const { user, updateFarmerProfile } = useAuth();
  const { t } = useLanguage();

  const currentProf = user?.farmer_profile;

  const [district, setDistrict] = useState(currentProf?.district || 'Mandya');
  const [taluk, setTaluk] = useState(currentProf?.taluk || 'Mandya');
  const [village, setVillage] = useState(currentProf?.village || 'Guthalu');
  const [landAcres, setLandAcres] = useState(currentProf?.land_acres || 2.5);
  const [landOwnership, setLandOwnership] = useState(currentProf?.land_ownership || 'owned');
  const [crops, setCrops] = useState(currentProf?.crops || 'Paddy, Sugarcane');
  const [cropSeason, setCropSeason] = useState(currentProf?.crop_season || 'kharif');
  const [irrigationType, setIrrigationType] = useState(currentProf?.irrigation_type || 'canal');
  const [farmerCategory, setFarmerCategory] = useState(currentProf?.farmer_category || 'small_marginal');
  const [fruitsId, setFruitsId] = useState(currentProf?.fruits_id || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await updateFarmerProfile({
      district,
      taluk,
      village,
      land_acres: Number(landAcres),
      land_ownership: landOwnership,
      crops,
      crop_season: cropSeason,
      irrigation_type: irrigationType,
      farmer_category: farmerCategory,
      fruits_id: fruitsId || undefined
    });
    setSaving(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif">
              Update Agricultural Profile
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully updated! Recalculating scheme recommendations...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase">Cultivated Land (Acres)</label>
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
                <option value="medium">Medium Farmer (5-10 Acres)</option>
                <option value="large">Large Farmer (&gt; 10 Acres)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase">Crops Cultivated</label>
              <input
                type="text"
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
                <option value="drip">Drip Irrigation</option>
                <option value="sprinkler">Sprinkler Irrigation</option>
                <option value="borewell">Borewell</option>
                <option value="rainfed">Rainfed / Dryland</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-700 uppercase">Karnataka FRUITS ID</label>
            <input
              type="text"
              placeholder="e.g. KA-MAN-2024-98451"
              value={fruitsId}
              onChange={(e) => setFruitsId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
