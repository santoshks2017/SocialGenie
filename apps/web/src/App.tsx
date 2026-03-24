import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home, Calendar, Inbox, Car, BarChart2, Zap, Settings, PlusSquare, Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from './services/api';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ROLE_LABELS } from './lib/permissions';

import Onboarding from './pages/Onboarding';
import CreatePost from './pages/CreatePost';
import CalendarPage from './pages/Calendar';
import InboxPage from './pages/InboxPage';
import InventoryPage from './pages/Inventory';
import BoostPage from './pages/Boost';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard', exact: true },
  { to: '/create', icon: PlusSquare, label: 'Create Post' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/inbox', icon: Inbox, label: 'Inbox', badge: 3 },
  { to: '/inventory', icon: Car, label: 'Inventory' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/boost', icon: Zap, label: 'Boost' },
];

function SidebarUserBadge() {
  const { user, logout } = useAuth();
  return (
    <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
      <p className="text-xs font-semibold text-gray-800 truncate">{user?.name ?? 'Loading...'}</p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xs text-gray-500">{user ? ROLE_LABELS[user.role] : ''}</p>
        {!import.meta.env.DEV && (
          <button onClick={logout} className="text-[10px] text-red-400 hover:text-red-600 font-medium">Sign out</button>
        )}
      </div>
    </div>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-5 pb-6">
        <div>
          <h1 className="text-base font-bold text-[#1A1A2E]">Cardeko Social AI</h1>
          <p className="text-xs text-gray-400 mt-0.5">Dealer Growth Engine</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, badge, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {badge && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t mt-4 pt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
        <SidebarUserBadge />
      </div>
    </div>
  );
}

interface DashboardData {
  stats: { postsThisMonth: number; postsChange: number; totalReach: number; leadsGenerated: number; leadsThisWeek: number; inboxPending: number; negativeReviews: number };
  recentPosts: Array<{ id: string; prompt_text: string; platforms: string[]; status: string; scheduled_at: string | null; published_at: string | null; created_at: string }>;
  upcomingFestivals: Array<{ id: string; name_en: string; date: string; category: string | null }>;
  activeBoosts: Array<{ id: string; daily_budget: number; duration_days: number; total_spent: number; end_date: string | null; metrics: unknown; post_id: string }>;
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<{ success: boolean } & DashboardData>('/dealer/dashboard')
      .then((res) => setData(res))
      .catch(console.error);
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: 'Posts This Month', value: stats ? String(stats.postsThisMonth) : '—', sub: stats ? `${stats.postsChange >= 0 ? '+' : ''}${stats.postsChange} vs last month` : 'loading...', color: 'text-gray-900' },
    { label: 'Total Reach', value: stats ? stats.totalReach.toLocaleString('en-IN') : '—', sub: 'across all platforms', color: 'text-gray-900' },
    { label: 'Leads Generated', value: stats ? String(stats.leadsGenerated) : '—', sub: stats ? `+${stats.leadsThisWeek} this week` : 'loading...', color: 'text-green-600' },
    { label: 'Inbox Pending', value: stats ? String(stats.inboxPending) : '—', sub: stats ? `${stats.negativeReviews} negative review${stats.negativeReviews !== 1 ? 's' : ''}` : 'loading...', color: stats && stats.inboxPending > 0 ? 'text-red-500' : 'text-gray-900' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
          <p className="text-sm text-gray-500 mt-1">Here's your dealership activity overview</p>
        </div>
        <NavLink
          to="/create"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusSquare className="w-4 h-4" /> Create Post
        </NavLink>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Posts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Recent Posts</h3>
          <div className="space-y-2">
            {data?.recentPosts.length === 0 && (
              <p className="text-sm text-gray-400">No posts yet. <NavLink to="/create" className="text-blue-600">Create one!</NavLink></p>
            )}
            {(data?.recentPosts ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.prompt_text}</p>
                  <p className="text-xs text-gray-400">{p.platforms.map(pl => pl === 'facebook' ? 'FB' : pl === 'instagram' ? 'IG' : 'GMB').join(' + ')} · {formatRelativeTime(p.created_at)}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  p.status === 'published' ? 'bg-green-50 text-green-700' :
                  p.status === 'scheduled' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{p.status}</span>
              </div>
            ))}
            {!data && [1,2,3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Upcoming Festivals */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Upcoming Festivals</h3>
          <div className="space-y-2">
            {data?.upcomingFestivals.length === 0 && (
              <p className="text-sm text-gray-400">No upcoming festivals in the calendar.</p>
            )}
            {(data?.upcomingFestivals ?? []).map((f) => {
              const d = new Date(f.date);
              const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
              return (
                <div key={f.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.name_en}</p>
                    <p className="text-xs text-gray-400">{d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {days} days away</p>
                  </div>
                  <span className="text-xs bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full">{f.category ?? 'festival'}</span>
                </div>
              );
            })}
            {!data && [1,2,3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Active Boosts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Active Boosts</h3>
          <div className="space-y-3">
            {data?.activeBoosts.length === 0 && (
              <p className="text-sm text-gray-400">No active boosts. <NavLink to="/boost" className="text-blue-600">Start one!</NavLink></p>
            )}
            {(data?.activeBoosts ?? []).map((b) => {
              const totalBudget = b.daily_budget * b.duration_days;
              const pct = totalBudget > 0 ? Math.min(100, Math.round((b.total_spent / totalBudget) * 100)) : 0;
              const endDate = b.end_date ? new Date(b.end_date) : null;
              const daysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000)) : 0;
              return (
                <div key={b.id} className="border-b last:border-0 pb-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">Boost #{b.id.slice(0, 6)}</p>
                    <span className="text-xs text-blue-600 font-medium">{daysLeft}d left</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">₹{b.total_spent.toLocaleString('en-IN')} / ₹{totalBudget.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {!data && [1,2].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <aside className="w-60 border-r bg-white hidden md:block flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-1 rounded hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-bold text-[#1A1A2E] text-sm">Cardeko Social AI</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-40">
          {[
            { to: '/', icon: Home, label: 'Home', exact: true },
            { to: '/create', icon: PlusSquare, label: 'Create' },
            { to: '/calendar', icon: Calendar, label: 'Plan' },
            { to: '/inbox', icon: Inbox, label: 'Inbox' },
            { to: '/boost', icon: Zap, label: 'Boost' },
          ].map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (import.meta.env.DEV) return <>{children}</>;
  if (!token) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<RequireAuth><DashboardLayout><Dashboard /></DashboardLayout></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><DashboardLayout><CreatePost /></DashboardLayout></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><DashboardLayout><CalendarPage /></DashboardLayout></RequireAuth>} />
        <Route path="/inbox" element={<RequireAuth><DashboardLayout><InboxPage /></DashboardLayout></RequireAuth>} />
        <Route path="/inventory" element={<RequireAuth><DashboardLayout><InventoryPage /></DashboardLayout></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><DashboardLayout><AnalyticsPage /></DashboardLayout></RequireAuth>} />
        <Route path="/boost" element={<RequireAuth><DashboardLayout><BoostPage /></DashboardLayout></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><DashboardLayout><SettingsPage /></DashboardLayout></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </AuthProvider>
    </ToastProvider>
  );
}
