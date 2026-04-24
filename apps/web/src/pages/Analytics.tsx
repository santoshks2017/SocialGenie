import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { postService, type Post } from '../services/creative';
import { boostService } from '../services/boost';


interface DashboardStats {
  postsThisMonth: number;
  postsChange: number;
  totalReach: number;
  leadsGenerated: number;
  leadsThisWeek: number;
}

function formatReach(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function platformLabel(p: string) {
  if (p === 'facebook') return 'FB';
  if (p === 'instagram') return 'IG';
  if (p === 'google_my_business') return 'GMB';
  return p.toUpperCase();
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    api.get<{ success: boolean } & { stats: DashboardStats }>('/dealer/dashboard')
      .then((res) => setStats(res.stats))
      .catch(console.error);
    postService.list({ pageSize: 20, status: 'published' })
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => (b.metrics?.reach ?? 0) - (a.metrics?.reach ?? 0));
        setTopPosts(sorted.slice(0, 5));
      })
      .catch(console.error);
    boostService.list({ pageSize: 50 })
      .then((res) => setTotalSpent(res.items.reduce((s, i) => s + i.totalSpent, 0)))
      .catch(console.error);
  }, []);

  const costPerLead = stats && stats.leadsGenerated > 0 ? Math.round(totalSpent / stats.leadsGenerated) : 0;
  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Attribution</h2>
          <p className="text-sm text-gray-500 mt-0.5">{monthLabel} · All platforms</p>
        </div>
        <div className="flex gap-2">
          <select className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>This month</option>
            <option>Last 3 months</option>
          </select>
          <Button variant="secondary" className="text-sm flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats ? String(stats.leadsGenerated) : '—', change: `+${stats?.leadsThisWeek ?? 0} this week`, up: true, sub: 'this month' },
          { label: 'Posts Published', value: stats ? String(stats.postsThisMonth) : '—', change: `${stats && stats.postsChange >= 0 ? '+' : ''}${stats?.postsChange ?? 0}`, up: (stats?.postsChange ?? 0) >= 0, sub: 'vs last month' },
          { label: 'Total Reach', value: stats ? formatReach(stats.totalReach) : '—', change: '', up: true, sub: 'across all platforms' },
          { label: 'Cost per Lead', value: costPerLead > 0 ? `₹${costPerLead}` : '—', change: '', up: true, sub: 'from boosted campaigns' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.change && (kpi.up ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />)}
              {kpi.change && <span className={`text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>{kpi.change}</span>}
              <span className="text-xs text-gray-400">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Weekly trend */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center min-h-[160px]">
          <h3 className="font-semibold text-gray-800 mb-3 w-full">Weekly Lead Trend</h3>
          <p className="text-sm text-gray-400 text-center">Weekly trend data will appear here as your posts generate leads over time.</p>
        </div>

        {/* Leads by source */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center min-h-[160px]">
          <h3 className="font-semibold text-gray-800 mb-3 w-full">Leads by Source</h3>
          <p className="text-sm text-gray-400 text-center">Platform breakdown will populate once leads are attributed to your connected accounts.</p>
        </div>
      </div>

      {/* Top performing posts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Top Performing Posts</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ranked by reach across all platforms</p>
        </div>
        <div className="divide-y divide-gray-50">
          {topPosts.length === 0 && (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">No published posts yet.</p>
          )}
          {topPosts.map((post, i) => {
            const reach = post.metrics?.reach ?? 0;
            const platforms = post.platforms.map(platformLabel).join(' + ');
            return (
              <div key={post.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-blue-900 to-blue-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.prompt_text}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{platforms}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{reach.toLocaleString('en-IN')} reach</p>
                  <p className="text-xs text-gray-400">{post.metrics?.likes ?? 0} likes</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly summary card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">Monthly Performance Summary</p>
            <h3 className="text-2xl font-bold mt-1">{monthLabel}</h3>
          </div>
          <Button className="bg-white text-blue-700 hover:bg-blue-50 text-sm flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Share Report
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Posts', value: stats ? String(stats.postsThisMonth) : '—' },
            { label: 'Total Reach', value: stats ? formatReach(stats.totalReach) : '—' },
            { label: 'Leads', value: stats ? String(stats.leadsGenerated) : '—' },
            { label: 'Ad Spend', value: totalSpent > 0 ? `₹${totalSpent.toLocaleString('en-IN')}` : '—' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-blue-200 text-xs mt-4">
          This report is auto-generated by Cardeko Social AI. Share this with your OEM or management team.
        </p>
      </div>
    </div>
  );
}
