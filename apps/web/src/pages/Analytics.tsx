import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { postService, type Post } from '../services/creative';
import { boostService } from '../services/boost';

const WEEKLY_LEADS = [12, 18, 14, 22, 19, 31, 28];
const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7 (now)'];

const LEAD_SOURCES = [
  { source: 'Facebook', leads: 63, color: 'bg-blue-500', pct: 38 },
  { source: 'Instagram', leads: 41, color: 'bg-pink-500', pct: 25 },
  { source: 'Google', leads: 28, color: 'bg-green-500', pct: 17 },
  { source: 'WhatsApp', leads: 22, color: 'bg-emerald-500', pct: 13 },
  { source: 'Organic', leads: 12, color: 'bg-gray-400', pct: 7 },
];


const maxLeads = Math.max(...WEEKLY_LEADS);

function MiniBarChart() {
  return (
    <div className="flex items-end gap-1.5 h-24">
      {WEEKLY_LEADS.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t transition-all ${i === WEEKLY_LEADS.length - 1 ? 'bg-blue-600' : 'bg-blue-200'}`}
            style={{ height: `${(val / maxLeads) * 80}px` }}
          />
          <span className="text-[9px] text-gray-400 writing-mode-vertical">{val}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart() {
  let cumulative = 0;
  const r = 40;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={112} height={112} viewBox="0 0 112 112">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={16} />
      {LEAD_SOURCES.map((src, i) => {
        const colors = ['#3b82f6','#ec4899','#22c55e','#10b981','#9ca3af'];
        const strokeDasharray = (src.pct / 100) * circumference;
        const strokeDashoffset = -cumulative * circumference / 100;
        cumulative += src.pct;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={colors[i]}
            strokeWidth={16}
            strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
            strokeDashoffset={circumference / 4 + strokeDashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-xs font-bold" fill="#111827" fontSize={14} fontWeight="bold">166</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={8}>leads</text>
    </svg>
  );
}

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
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Weekly Lead Trend</h3>
          <MiniBarChart />
          <div className="flex justify-between mt-2">
            {WEEK_LABELS.map((l, i) => (
              <span key={i} className="text-[9px] text-gray-400 flex-1 text-center">{l.replace('Week ', 'Wk')}</span>
            ))}
          </div>
        </div>

        {/* Leads by source */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Leads by Source</h3>
          <div className="flex items-center gap-4">
            <DonutChart />
            <div className="space-y-2 flex-1">
              {LEAD_SOURCES.map((s) => (
                <div key={s.source} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm ${s.color} flex-shrink-0`} />
                  <span className="text-xs text-gray-600 flex-1">{s.source}</span>
                  <span className="text-xs font-semibold text-gray-800">{s.leads}</span>
                </div>
              ))}
            </div>
          </div>
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
