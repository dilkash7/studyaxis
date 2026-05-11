'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import Loader from '@/components/ui/Loader';
import { Activity, Users, MousePointerClick, Smartphone, Globe } from 'lucide-react';

interface AnalyticsData {
  totalPageviews: number;
  activeSessions: number;
  topPages: { _id: string; views: number }[];
  topClicks: { _id: string; clicks: number; path: string }[];
  devices: { _id: string; count: number }[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/analytics/dashboard')
      .then(res => setData(res.data.stats))
      .catch(err => setError(err.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Analytics & Tracking"><Loader /></AdminLayout>;
  if (error) return <AdminLayout title="Analytics & Tracking"><div className="text-red-500 p-6">{error}</div></AdminLayout>;
  if (!data) return null;

  return (
    <AdminLayout title="Behavioral Analytics & Funnel Tracking">
      <div className="space-y-6">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pageviews (7d)</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.totalPageviews}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Sessions (24h)</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.activeSessions}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <MousePointerClick size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tracked Clicks (7d)</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.topClicks.reduce((acc, curr) => acc + curr.clicks, 0)}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Top Device</p>
              <h3 className="text-xl font-bold text-gray-900 capitalize">{data.devices[0]?._id || 'N/A'}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Globe className="text-gray-400" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Top Visited Pages</h2>
            </div>
            <div className="space-y-4">
              {data.topPages.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                    <a href={page._id} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-700 hover:text-blue-600 truncate">
                      {page._id === '/' ? '/ (Homepage)' : page._id}
                    </a>
                  </div>
                  <span className="text-sm font-bold bg-gray-50 px-3 py-1 rounded-lg text-gray-600">{page.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clicks / Heatmap Data */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <MousePointerClick className="text-gray-400" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Highest Engagement Clicks</h2>
            </div>
            <div className="space-y-4">
              {data.topClicks.map((click, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex flex-col overflow-hidden pr-4">
                    <span className="text-sm font-bold text-gray-800 truncate">{click._id}</span>
                    <span className="text-[10px] text-gray-400 truncate">Path: {click.path}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{click.clicks} Clicks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Device Breakdown</h2>
          <div className="flex gap-4">
            {data.devices.map(d => (
              <div key={d._id} className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{d._id}</p>
                <p className="text-2xl font-black text-gray-900">{d.count}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
