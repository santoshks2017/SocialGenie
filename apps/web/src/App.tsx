import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  Car, Plus, MessageSquare, Bell, Menu, X,
  Calendar, BarChart2, Package, Zap, Settings,
  ChevronRight, Send, RefreshCw, Star, Check, Sparkles,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from './services/api';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Onboarding from './pages/Onboarding';
import CreatePost from './pages/CreatePost';
import CalendarPage from './pages/Calendar';
import InboxPage from './pages/InboxPage';
import InventoryPage from './pages/Inventory';
import BoostPage from './pages/Boost';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';

// ─── TopNav ──────────────────────────────────────────────────────────────────
function TopNav({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 h-14 flex items-center px-5 gap-1 shrink-0">
      <NavLink to="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
        <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center">
          <Car className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold text-stone-900 tracking-tight text-sm">
          Cardeko<span className="text-orange-600">Social</span>
        </span>
      </NavLink>

      {/* Desktop inline nav */}
      <nav className="hidden md:flex items-center gap-0.5">
        {[
          { to: '/', label: 'Dashboard', exact: true },
          { to: '/calendar', label: 'Calendar' },
          { to: '/analytics', label: 'Analytics' },
          { to: '/inventory', label: 'Inventory' },
          { to: '/boost', label: 'Boost' },
        ].map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <NavLink
        to="/create"
        className="hidden md:flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 h-9 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" /> Create Post
      </NavLink>

      <NavLink
        to="/inbox"
        className="hidden md:flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 h-9 px-3 rounded-lg hover:bg-stone-100 transition-colors ml-1"
      >
        <MessageSquare className="w-4 h-4" /> Reviews
      </NavLink>

      <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors ml-1">
        <Bell className="w-5 h-5 text-stone-500" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          3
        </span>
      </button>

      <NavLink to="/settings">
        <div className="w-9 h-9 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1.5 hover:bg-orange-700 transition-colors cursor-pointer">
          {initials}
        </div>
      </NavLink>

      <button
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors ml-1"
        onClick={onMenuToggle}
      >
        <Menu className="w-5 h-5 text-stone-600" />
      </button>
    </header>
  );
}

// ─── MobileDrawer ─────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <span className="font-extrabold text-stone-900 text-sm">
            Cardeko<span className="text-orange-600">Social</span>
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {[
            { to: '/', icon: BarChart2, label: 'Dashboard', exact: true },
            { to: '/create', icon: Plus, label: 'Create Post' },
            { to: '/calendar', icon: Calendar, label: 'Calendar' },
            { to: '/inbox', icon: MessageSquare, label: 'Reviews', badge: 4 },
            { to: '/inventory', icon: Package, label: 'Inventory' },
            { to: '/analytics', icon: BarChart2, label: 'Analytics' },
            { to: '/boost', icon: Zap, label: 'Boost' },
            { to: '/settings', icon: Settings, label: 'Settings' },
          ].map(({ to, icon: Icon, label, exact, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {badge && (
                <span className="ml-auto bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="px-4 pb-5 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
                <p className="text-xs text-stone-400 capitalize">{user.role}</p>
              </div>
              <button onClick={logout} className="text-xs text-red-400 hover:text-red-600 font-medium">
                Sign out
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
interface DashboardData {
  stats: {
    postsThisMonth: number;
    postsChange: number;
    totalReach: number;
    leadsGenerated: number;
    leadsThisWeek: number;
    inboxPending: number;
    negativeReviews: number;
  };
  recentPosts: Array<{
    id: string;
    prompt_text: string;
    platforms: string[];
    status: string;
    scheduled_at: string | null;
    published_at: string | null;
    created_at: string;
  }>;
  upcomingFestivals: Array<{ id: string; name_en: string; date: string; category: string | null }>;
  activeBoosts: Array<{
    id: string;
    daily_budget: number;
    duration_days: number;
    total_spent: number;
    end_date: string | null;
    metrics: unknown;
    post_id: string;
  }>;
}

// ─── Dashboard sub-components ─────────────────────────────────────────────────
function SuggestedPostCard({ data }: { data: DashboardData | null }) {
  const festival = data?.upcomingFestivals?.[0];
  const recentPost = data?.recentPosts?.[0];

  const title = festival
    ? `${festival.name_en} Special Offer`
    : recentPost
    ? recentPost.prompt_text.slice(0, 50)
    : 'Weekend Test Drive Special';

  const caption = festival
    ? `Celebrate ${festival.name_en} with exclusive dealership offers! Visit our showroom for special discounts on all models. Limited period offer — walk in today.`
    : 'Saturday ho ya Sunday, aapki dream car ka test drive sirf ek call door hai! 🚗✨ Visit our showroom for exclusive weekend offers. Walk in today!';

  const hashtags = festival
    ? [`#${festival.name_en.replace(/\s+/g, '')}`, '#FestivalOffer', '#CarDeal', '#AutoIndia']
    : ['#WeekendOffer', '#TestDrive', '#MarutiSuzuki', '#CarDeal'];

  const badgeLabel = festival?.category ?? 'Weekend Offer';
  const dateStr = festival
    ? new Date(festival.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
    : new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 flex items-center justify-between border-b border-stone-100">
        <span className="text-[11px] font-extrabold text-orange-600 tracking-widest uppercase">
          Today's Suggested Post
        </span>
        <span className="text-xs text-stone-400">{dateStr}</span>
      </div>

      <div className="flex gap-5 p-5">
        {/* Template preview */}
        <div className="w-44 flex-shrink-0 bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden aspect-[4/3]">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
            <Car className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-stone-400 text-[9px] font-bold uppercase tracking-widest mb-2">
            {badgeLabel.toUpperCase().slice(0, 14)}
          </p>
          <p className="text-white text-xs font-bold text-center leading-snug mb-3 px-1">
            {title.slice(0, 28)}
          </p>
          <div className="bg-orange-600 rounded-full px-3 py-1 mb-1">
            <p className="text-white text-[9px] font-bold">Rajesh Motors</p>
          </div>
          <p className="text-stone-400 text-[8px]">Maruti Suzuki Authorized Dealer</p>
          <div className="absolute top-2 right-2 bg-stone-700/60 rounded px-1.5 py-0.5">
            <p className="text-stone-300 text-[9px] font-medium">Template</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {badgeLabel}
            </span>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Auto-Suggested
            </span>
          </div>

          <h3 className="font-bold text-stone-900 text-[15px] leading-tight mb-2">{title}</h3>

          <div className="bg-stone-50 rounded-xl px-3 py-2.5 mb-2.5 border border-stone-100">
            <p className="text-[10px] text-stone-400 font-semibold mb-0.5">Caption:</p>
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{caption}</p>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-3">
            {hashtags.slice(0, 4).map((h) => (
              <span key={h} className="text-[11px] text-orange-600 font-semibold">{h}</span>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-stone-400 mr-0.5">Posting to:</span>
            {[
              { label: 'GMB', color: 'bg-[#4285F4]' },
              { label: 'Facebook', color: 'bg-[#1877F2]' },
              { label: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1 border border-stone-200 rounded-full px-2 py-0.5 text-[10px] font-medium text-stone-600">
                <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/create"
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <Send className="w-3 h-3" /> Post Everywhere
            </NavLink>
            <NavLink
              to="/create"
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 px-3 py-2 rounded-lg border border-stone-200 hover:border-stone-300 bg-white transition-colors"
            >
              Edit First
            </NavLink>
            <button className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 px-2 py-2 transition-colors">
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxPreview({ stats }: { stats?: DashboardData['stats'] }) {
  const pendingCount = stats?.inboxPending ?? 4;
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-stone-900">Review & Comment Inbox</h3>
          {pendingCount > 0 && (
            <span className="bg-orange-100 text-orange-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {pendingCount} Pending
            </span>
          )}
        </div>
        <NavLink
          to="/inbox"
          className="text-xs text-orange-600 font-bold hover:text-orange-700 flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            PS
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-stone-900">Priya Sharma</span>
              <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium">
                Google Review
              </span>
              <span className="text-[10px] text-stone-400 ml-auto">2h ago</span>
            </div>
            <div className="flex gap-0.5 mb-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-stone-600 mb-2 leading-relaxed line-clamp-2">
              "Excellent service at Rajesh Motors! Got my new Brezza delivered on time. Amit from the sales team was very helpful throughout the process."
            </p>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-2.5 mb-2">
              <p className="text-[10px] font-bold text-teal-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Suggested Reply
              </p>
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                Thank you so much, Priya! We're thrilled to hear about your experience. Amit and the entire team appreciate your kind words. Enjoy your new Brezza! 🚗
              </p>
            </div>
            <div className="flex gap-2">
              <NavLink
                to="/inbox"
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Check className="w-3 h-3" /> Approve &amp; Send
              </NavLink>
              <NavLink
                to="/inbox"
                className="text-xs text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 font-medium hover:bg-stone-50 transition-colors"
              >
                Edit
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThisWeekPanel({ stats }: { stats?: DashboardData['stats'] }) {
  const posts = stats?.postsThisMonth ?? 4;
  const goal = 5;
  const pct = Math.min(100, Math.round((posts / goal) * 100));

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <h3 className="font-bold text-stone-900 mb-4">This Week</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-stone-500 font-medium mb-0.5">Posts Published</p>
              <p className="text-2xl font-extrabold text-stone-900 leading-none">
                {posts}{' '}
                <span className="text-sm font-semibold text-stone-400">of {goal} goal</span>
              </p>
            </div>
            <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-teal-500" />
            </div>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-stone-500 font-medium mb-0.5">Reviews Received</p>
              <p className="text-2xl font-extrabold text-stone-900">7</p>
              <p className="text-xs text-stone-400">across platforms</p>
            </div>
            <div className="w-8 h-8 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-stone-500 font-medium mb-0.5">Pending Replies</p>
              <p className="text-2xl font-extrabold text-stone-900">{stats?.inboxPending ?? 4}</p>
              <p className="text-xs text-orange-600 font-semibold">need attention</p>
            </div>
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingUpPanel({ festivals }: { festivals?: DashboardData['upcomingFestivals'] }) {
  const iconMap = [Calendar, Zap, Car];
  const defaults = [
    { label: 'Republic Day', dateStr: 'Jan 26', sub: 'Festival post ready' },
    { label: 'Month-End Offer', dateStr: 'Jan 31', sub: 'Suggest closing deals' },
    { label: 'New Arrival Post', dateStr: 'Upcoming', sub: 'Swift 2026 stock arriving soon' },
  ];

  const items =
    festivals && festivals.length > 0
      ? festivals.slice(0, 3).map((f) => ({
          label: f.name_en,
          dateStr: new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          sub: f.category ?? 'Festival',
        }))
      : defaults;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <h3 className="font-bold text-stone-900 mb-3.5">Coming Up</h3>
      <div className="space-y-2.5">
        {items.map(({ label, dateStr, sub }, i) => {
          const Icon = iconMap[i % iconMap.length]!;
          return (
            <div key={label} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
              <div className="w-8 h-8 bg-white rounded-xl border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="w-3.5 h-3.5 text-stone-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">{label}</p>
                <p className="text-xs text-stone-400">
                  {dateStr} — {sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConnectedPanel() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <h3 className="font-bold text-stone-900 mb-3.5">Connected</h3>
      <div className="space-y-3">
        {[
          { name: 'Google My Business', handle: 'Rajesh Motors — GMB', color: '#4285F4' },
          { name: 'Facebook Page', handle: 'Rajesh Motors Official', color: '#1877F2' },
          { name: 'Instagram Business', handle: '@rajeshmotors_official', color: '#E1306C' },
        ].map((p) => (
          <div key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${p.color}20` }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-800">{p.handle}</p>
                <p className="text-[10px] text-stone-400">{p.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[10px] text-green-600 font-semibold">Ready</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    api
      .get<{ success: boolean } & DashboardData>('/dealer/dashboard')
      .then((res) => setData(res))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Your dealership social presence at a glance —{' '}
              <span className="text-orange-600 font-semibold cursor-pointer hover:underline">
                5 min routine
              </span>
            </p>
          </div>

          <SuggestedPostCard data={data} />
          <InboxPreview stats={data?.stats} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <ThisWeekPanel stats={data?.stats} />
          <ComingUpPanel festivals={data?.upcomingFestivals} />
          <ConnectedPanel />
        </div>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function DashboardLayout({
  children,
  fullBleed,
}: {
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0EA]">
      <TopNav onMenuToggle={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main
        className={`flex-1 ${
          fullBleed ? 'overflow-hidden flex flex-col' : 'p-4 md:p-6 lg:p-8 overflow-y-auto'
        }`}
      >
        {children}
      </main>
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
            <Route
              path="/"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/create"
              element={
                <RequireAuth>
                  <DashboardLayout fullBleed>
                    <CreatePost />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/calendar"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <CalendarPage />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/inbox"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <InboxPage />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/inventory"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <InventoryPage />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/analytics"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <AnalyticsPage />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/boost"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <BoostPage />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
