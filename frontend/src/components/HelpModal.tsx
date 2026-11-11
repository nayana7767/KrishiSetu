import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Phone, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const { token, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [category, setCategory] = useState('machinery_booking');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please login first to submit a tracked grievance ticket.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          subject,
          description
        })
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit ticket', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900 font-serif">
                Farmer Support & Grievances
              </h3>
              <p className="text-xs text-stone-500">
                Official toll-free hotlines & ticket resolution
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verified Toll-Free Karnataka Helplines */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Official Toll-Free Agricultural Helplines:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a
              href="tel:18001801551"
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 flex items-center justify-between"
            >
              <div>
                <p className="font-bold">Kisan Call Centre</p>
                <p className="text-[11px] text-emerald-700">All India Toll-Free</p>
              </div>
              <span className="font-mono font-bold text-emerald-800">1800-180-1551</span>
            </a>

            <a
              href="tel:08022212804"
              className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 flex items-center justify-between"
            >
              <div>
                <p className="font-bold">Raita Mitra Karnataka</p>
                <p className="text-[11px] text-amber-700">Agriculture Dept</p>
              </div>
              <span className="font-mono font-bold text-amber-800">080-22212804</span>
            </a>

            <a
              href="tel:08022113255"
              className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-between"
            >
              <div>
                <p className="font-bold">Bhoomi RTC Helpdesk</p>
                <p className="text-[11px] text-stone-500">Land Records</p>
              </div>
              <span className="font-mono font-bold text-stone-700">080-22113255</span>
            </a>

            <a
              href="tel:08022340316"
              className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-between"
            >
              <div>
                <p className="font-bold">Nadakacheri Helpline</p>
                <p className="text-[11px] text-stone-500">Caste/Income RD</p>
              </div>
              <span className="font-mono font-bold text-stone-700">080-22340316</span>
            </a>
          </div>
        </div>

        {/* Grievance Ticket Form */}
        <div className="pt-2 border-t border-stone-100 space-y-3">
          <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Submit a Help or Complaint Ticket:
          </p>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-emerald-950 text-sm">Ticket Submitted Successfully!</p>
              <p className="text-xs text-emerald-800">
                An agriculture department assistant will review your request.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="machinery_booking">Machinery Booking or Rental Price Dispute</option>
                  <option value="subsidy_application">Government Scheme or DBT Subsidy Query</option>
                  <option value="loan_issue">KCC or Bank Crop Loan Assistance</option>
                  <option value="technical">App or Document Portal Issue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tractor owner not responding to booking KS-2611-T091"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase">Details / Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain your problem with village name and reference details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Send Ticket'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
