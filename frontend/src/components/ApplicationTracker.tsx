import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Gift, 
  FileText, 
  ArrowRight, 
  ShieldAlert, 
  HelpCircle,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface ApplicationRecord {
  id: number;
  user_id: number;
  scheme_id?: number;
  loan_id?: number;
  title: string;
  department: string;
  reference_number: string;
  submission_date: string;
  current_status: string;
  status_notes?: string;
  rejection_reason?: string;
  corrective_action?: string;
  is_official_api: boolean;
  created_at: string;
}

interface RejectionGuideItem {
  issue_code: string;
  title: string;
  explanation: string;
  corrective_steps: string[];
}

export const ApplicationTracker: React.FC = () => {
  const { t } = useLanguage();
  const { token, isAuthenticated } = useAuth();

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [rejectionGuide, setRejectionGuide] = useState<RejectionGuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Department of Agriculture, Karnataka');
  const [formRefNum, setFormRefNum] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState('submitted');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchRejectionGuide();
  }, [token]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/applications', { headers });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRejectionGuide = async () => {
    try {
      const res = await fetch('/api/applications/rejection-guide');
      if (res.ok) {
        const data = await res.json();
        setRejectionGuide(data);
      }
    } catch (err) {
      console.error('Failed to load rejection guide', err);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          department: formDepartment,
          reference_number: formRefNum,
          submission_date: formDate,
          current_status: formStatus,
          status_notes: formNotes
        })
      });

      if (res.ok) {
        const newApp = await res.json();
        setApplications([newApp, ...applications]);
        setIsModalOpen(false);
        setFormTitle('');
        setFormRefNum('');
        setFormNotes('');
      }
    } catch (err) {
      console.error('Failed to save application', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: t('status_approved'),
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2
        };
      case 'benefit_received':
        return {
          label: t('status_benefit_received'),
          color: 'bg-emerald-700 text-white border-emerald-800',
          icon: Gift
        };
      case 'under_verification':
        return {
          label: t('status_under_verification'),
          color: 'bg-sky-100 text-sky-900 border-sky-300',
          icon: Clock
        };
      case 'rejected':
        return {
          label: t('status_rejected'),
          color: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: XCircle
        };
      case 'preparation':
        return {
          label: t('status_preparation'),
          color: 'bg-stone-100 text-stone-800 border-stone-300',
          icon: FileText
        };
      default:
        return {
          label: t('status_submitted'),
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Clock
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-bold uppercase">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Farmer Self-Reported Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              {t('tracker_title')}
            </h1>
            <p className="text-emerald-100 text-sm font-normal">
              {t('tracker_subtitle')}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('record_application')}</span>
          </button>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm font-semibold">{t('loading')}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
          <ClipboardList className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">No applications recorded yet</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            When you apply for a scheme like PM-KISAN, Raitha Siri, or micro-irrigation, record your acknowledgement reference number here to track it.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
          >
            + Record Your First Application
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = getStatusBadge(app.current_status);
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={app.id}
                className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-emerald-500 shadow-sm transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusConfig.label}</span>
                      </span>

                      <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                        Ref: {app.reference_number}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 font-serif pt-1">
                      {app.title}
                    </h3>

                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-stone-400" />
                      <span>{app.department}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right text-xs text-stone-500 shrink-0">
                    <p className="flex items-center gap-1 sm:justify-end">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>Submitted: <strong>{app.submission_date}</strong></span>
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-stone-100 text-[10px] text-stone-600">
                      Farmer-Reported Record
                    </span>
                  </div>
                </div>

                {/* Status notes */}
                {app.status_notes && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700">
                    <p><strong>Status Notes:</strong> {app.status_notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Assistance & Solutions Guide (Prompt Requirement) */}
      <div className="bg-amber-50/60 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-950 font-serif">
              {t('rejection_assistance')}
            </h2>
            <p className="text-xs text-amber-800">
              {t('rejection_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rejectionGuide.map((item) => (
            <div 
              key={item.issue_code}
              className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-3"
            >
              <h4 className="font-bold text-sm text-stone-900 font-serif flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{item.title}</span>
              </h4>

              <p className="text-xs text-stone-600 leading-relaxed">
                {item.explanation}
              </p>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
                <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">
                  Recommended Corrective Steps:
                </p>
                <ul className="space-y-1">
                  {item.corrective_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold shrink-0">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xl font-bold text-stone-900 font-serif">
                {t('record_application')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Scheme or Loan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PM-KISAN 17th Installment or Raitha Siri"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    {t('reference_number')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-2024-8849"
                    value={formRefNum}
                    onChange={(e) => setFormRefNum(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Current Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="submitted">{t('status_submitted')}</option>
                  <option value="under_verification">{t('status_under_verification')}</option>
                  <option value="approved">{t('status_approved')}</option>
                  <option value="benefit_received">{t('status_benefit_received')}</option>
                  <option value="rejected">{t('status_rejected')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Notes / Department Communication
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Field inspection completed by RSK Officer."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-600 hover:bg-stone-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md"
                >
                  {submitting ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
