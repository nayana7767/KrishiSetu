import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Info, 
  Building, 
  Save, 
  Sparkles, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface DocumentItem {
  key: string;
  name: string;
  description: string;
  issuing_authority: string;
  how_to_get: string;
  is_ready: boolean;
  notes?: string;
}

interface DocumentChecklistProps {
  initialSchemeId?: number | null;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ initialSchemeId }) => {
  const { t } = useLanguage();
  const { token, isAuthenticated } = useAuth();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchChecklist();
  }, [initialSchemeId, token]);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      let url = '/api/documents/checklist';
      if (initialSchemeId) {
        url += `?scheme_id=${initialSchemeId}`;
      }
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load document checklist', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = async (key: string, currentStatus: boolean, docName: string) => {
    const nextStatus = !currentStatus;
    // Update local state immediately for fast responsive feedback
    setDocuments((prev) =>
      prev.map((doc) => (doc.key === key ? { ...doc, is_ready: nextStatus } : doc))
    );

    // Persist to backend if logged in
    if (token) {
      try {
        await fetch('/api/documents/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            document_key: key,
            document_name: docName,
            is_ready: nextStatus,
            scheme_id: initialSchemeId
          })
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) {
        console.error('Failed to update status', err);
      }
    }
  };

  const readyCount = documents.filter((d) => d.is_ready).length;
  const progressPercent = documents.length > 0 ? Math.round((readyCount / documents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-bold uppercase">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Single-Window Document Preparation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif">
            {t('checklist_title')}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base font-normal">
            {t('checklist_subtitle')}
          </p>
        </div>
      </div>

      {/* Readiness Progress Bar Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              {t('readiness_progress')}
            </h2>
            <p className="text-xs text-stone-500">
              {readyCount} of {documents.length} verified documents marked as acquired and ready.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}
            <span className="text-2xl font-black font-mono text-emerald-800">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress bar visual */}
        <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Karnataka Official Portals Quick Links */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-stone-600 uppercase mr-1">Official Portals:</span>
          <a
            href="https://landrecords.karnataka.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1"
          >
            <span>Bhoomi RTC Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://nadakacheri.karnataka.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1"
          >
            <span>Nadakacheri (Caste/Income)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://fruits.karnataka.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1"
          >
            <span>FRUITS Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://myaadhaar.uidai.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1"
          >
            <span>Aadhaar Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Documents Interactive List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm font-semibold">{t('loading')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            return (
              <div
                key={doc.key}
                onClick={() => toggleDocument(doc.key, doc.is_ready, doc.name)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  doc.is_ready
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                {/* Left check and details */}
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      doc.is_ready
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-300 border border-stone-300'
                    }`}
                  >
                    {doc.is_ready ? (
                      <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-base font-bold font-serif ${
                        doc.is_ready ? 'text-emerald-950' : 'text-stone-900'
                      }`}>
                        {doc.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        doc.is_ready 
                          ? 'bg-emerald-200 text-emerald-900' 
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {doc.is_ready ? t('ready_status') : t('pending_status')}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {doc.description}
                    </p>

                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-stone-400" />
                        <span><strong>{t('issuing_office')}</strong> {doc.issuing_authority}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right How to Get advice box */}
                <div className="sm:max-w-xs w-full p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 shrink-0">
                  <p className="font-bold text-stone-700 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('how_to_obtain')}</span>
                  </p>
                  <p className="leading-snug text-stone-600">
                    {doc.how_to_get}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
