import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Tractor, 
  Building2, 
  ClipboardList, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3,
  Power,
  MessageSquare,
  Search,
  Check
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [stats, setStats] = useState<any | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schemes' | 'complaints'>('overview');
  const [resolveText, setResolveText] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, schemesRes, complaintsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/schemes', { headers }),
        fetch('/api/admin/complaints', { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (schemesRes.ok) setSchemes(await schemesRes.json());
      if (complaintsRes.ok) setComplaints(await complaintsRes.json());
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScheme = async (schemeId: number) => {
    try {
      const res = await fetch(`/api/admin/schemes/${schemeId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle scheme', err);
    }
  };

  const handleResolveComplaint = async (complaintId: number) => {
    const responseText = resolveText[complaintId] || 'Issue investigated and resolved by Karnataka Agriculture Helpdesk.';
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/resolve?admin_response=${encodeURIComponent(responseText)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to resolve ticket', err);
    }
  };

  const COLORS = ['#047857', '#d97706', '#0f766e', '#1d4ed8', '#7c3aed', '#b91c1c'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>State Agritech Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              KrishiSetu Admin Master Console
            </h1>
            <p className="text-stone-300 text-sm font-normal">
              Manage schemes, verify machinery providers, monitor platform transactions, and resolve farmer grievances.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase">Farmers</p>
            <p className="text-2xl font-black font-mono text-emerald-800">{stats.total_farmers}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase">Providers</p>
            <p className="text-2xl font-black font-mono text-stone-900">{stats.total_providers}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase">Live Machinery</p>
            <p className="text-2xl font-black font-mono text-stone-900">{stats.active_machinery}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase">Schemes</p>
            <p className="text-2xl font-black font-mono text-emerald-800">{stats.total_schemes}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase">Bookings</p>
            <p className="text-2xl font-black font-mono text-amber-700">{stats.total_bookings}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase">Gross Booking (₹)</p>
            <p className="text-2xl font-black font-mono text-emerald-800">₹{stats.gross_booking_value?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'overview'
              ? 'bg-stone-900 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>Analytics & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'schemes'
              ? 'bg-stone-900 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>Manage Government Schemes</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-700 text-white font-bold">
            {schemes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'complaints'
              ? 'bg-stone-900 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>Grievance Tickets</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-400 text-stone-950 font-black">
            {complaints.filter((c) => c.status === 'open').length} Open
          </span>
        </button>
      </div>

      {/* Tab 1: Recharts Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <span>Available Farm Equipment Distribution by Category</span>
            </h3>

            <div className="h-72 w-full pt-4">
              {stats?.machinery_distribution ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.machinery_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fill: '#4b5563', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', color: '#fff', border: 'none' }}
                    />
                    <Bar dataKey="count" fill="#047857" radius={[8, 8, 0, 0]}>
                      {stats.machinery_distribution.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Government Schemes Management */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((s) => (
              <div 
                key={s.id}
                className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {s.scheme_code}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {s.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900 font-serif pt-1">
                    {s.scheme_name}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium">
                    {s.department}
                  </p>
                  <p className="text-xs text-emerald-900 font-bold">
                    Benefit: {s.financial_assistance}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    Category: <strong>{s.category}</strong>
                  </span>
                  <button
                    onClick={() => handleToggleScheme(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      s.is_active 
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {s.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Complaints Resolution */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">Zero Pending Grievances</h3>
              <p className="text-xs text-stone-500">
                All submitted farmer tickets and inquiries have been resolved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Ticket #{c.id}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-stone-900 font-serif">
                    {c.subject}
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200">
                    "{c.description}"
                  </p>

                  {c.admin_response ? (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950">
                      <strong>Resolution Note:</strong> {c.admin_response}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Type resolution reply to farmer..."
                        value={resolveText[c.id] || ''}
                        onChange={(e) => setResolveText({ ...resolveText, [c.id]: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <button
                        onClick={() => handleResolveComplaint(c.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                      >
                        Resolve Ticket
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
