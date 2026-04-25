import { useState, useEffect, useCallback } from 'react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  Cloud,
  Database,
  ExternalLink,
  Filter,
  Film,
  Globe,
  Image,
  Link2,
  MessageCircle,
  Music2,
  Pin,
  RefreshCw,
  Repeat2,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)
  ?? (import.meta.env.DEV ? 'http://127.0.0.1:3001/v1' : '');

interface ConnectedAccount {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  tokenExpiry: string | null;
  createdAt: string;
}

type IntegrationStatus = 'live' | 'via-facebook' | 'planned' | 'external';

interface PlatformIntegration {
  id: string;
  label: string;
  description: string;
  color: string;
  status: IntegrationStatus;
  authUrl: string | null;
  capabilities: string[];
  icon: ComponentType<{ className?: string }>;
}

interface WorkflowIntegration {
  id: string;
  label: string;
  description: string;
  action: string;
  status: IntegrationStatus;
  icon: ComponentType<{ className?: string }>;
  href?: string;
}

const SOCIAL_PLATFORMS: PlatformIntegration[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    description: 'Publish posts, manage pages, and support boosted campaigns.',
    color: '#1877F2',
    status: 'live',
    authUrl: `${API_BASE}/auth/facebook`,
    capabilities: ['Posts', 'Pages', 'Inbox', 'Reviews'],
    icon: MessageCircle,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Plan feed posts, reels, and carousel-style campaigns.',
    color: '#E1306C',
    status: 'via-facebook',
    authUrl: null,
    capabilities: ['Posts', 'Reels', 'Carousels'],
    icon: Image,
  },
  {
    id: 'google',
    label: 'Google Business',
    description: 'Publish local updates and respond to dealership reviews.',
    color: '#4285F4',
    status: 'live',
    authUrl: `${API_BASE}/auth/google`,
    capabilities: ['Updates', 'Reviews', 'Locations'],
    icon: Globe,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    description: 'Schedule short-form videos and repurpose inventory clips.',
    color: '#111827',
    status: 'planned',
    authUrl: null,
    capabilities: ['Videos', 'Growth tracking'],
    icon: Music2,
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    description: 'Track conversations, trends, and quick showroom announcements.',
    color: '#0F172A',
    status: 'planned',
    authUrl: null,
    capabilities: ['Posts', 'Mentions', 'Threads'],
    icon: MessageCircle,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Share employer brand updates, events, and leadership posts.',
    color: '#0A66C2',
    status: 'planned',
    authUrl: null,
    capabilities: ['Pages', 'Posts', 'Reports'],
    icon: Briefcase,
  },
  {
    id: 'threads',
    label: 'Threads',
    description: 'Queue lightweight updates for community-style conversations.',
    color: '#111827',
    status: 'planned',
    authUrl: null,
    capabilities: ['Posts', 'Replies'],
    icon: Repeat2,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    description: 'Manage videos, shorts, and dealership walkaround campaigns.',
    color: '#FF0000',
    status: 'planned',
    authUrl: null,
    capabilities: ['Videos', 'Shorts', 'Analytics'],
    icon: Film,
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    description: 'Organize visual inspiration and evergreen model boards.',
    color: '#E60023',
    status: 'planned',
    authUrl: null,
    capabilities: ['Pins', 'Boards'],
    icon: Pin,
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    description: 'Prepare for emerging community channels from one calendar.',
    color: '#0285FF',
    status: 'planned',
    authUrl: null,
    capabilities: ['Posts', 'Community'],
    icon: Send,
  },
];

const WORKFLOW_INTEGRATIONS: WorkflowIntegration[] = [
  { id: 'slack', label: 'Slack', description: 'Send approval, publishing, and review alerts to team channels.', action: 'Notify team', status: 'planned', icon: Send },
  { id: 'unsplash', label: 'Unsplash', description: 'Find high-quality stock images for dealership creatives.', action: 'Browse images', status: 'planned', icon: Image },
  { id: 'google-drive', label: 'Google Drive', description: 'Import campaign assets directly from shared drive folders.', action: 'Connect storage', status: 'planned', icon: Cloud },
  { id: 'giphy', label: 'Giphy', description: 'Add GIFs and stickers to engagement posts.', action: 'Add GIFs', status: 'planned', icon: Film },
  { id: 'dropbox', label: 'Dropbox', description: 'Centralize media assets and client-approved creative files.', action: 'Connect storage', status: 'planned', icon: Cloud },
  { id: 'zapier', label: 'Zapier', description: 'Automate leads, content approvals, and reporting handoffs.', action: 'Create automation', status: 'planned', icon: Zap },
  { id: 'sniply', label: 'Sniply', description: 'Attach conversion prompts to links shared from the app.', action: 'Add snippet', status: 'planned', icon: Link2 },
  { id: 'rebrandly', label: 'Rebrandly', description: 'Create branded short links for OEM and dealer campaigns.', action: 'Brand links', status: 'planned', icon: Link2 },
  { id: 'bitly', label: 'Bitly', description: 'Shorten links and track campaign clicks.', action: 'Shorten links', status: 'planned', icon: Link2 },
  { id: 'feedly', label: 'Feedly', description: 'Pull story ideas from industry feeds into the content queue.', action: 'Share feeds', status: 'planned', icon: Database },
  { id: 'canva', label: 'Canva', description: 'Create on-brand designs and bring finished assets into posts.', action: 'Create design', status: 'external', icon: Image, href: 'https://www.canva.com/' },
  { id: 'box', label: 'Box', description: 'Use enterprise file storage for creative and compliance assets.', action: 'Connect storage', status: 'planned', icon: Cloud },
  { id: 'wordpress', label: 'WordPress', description: 'Promote blog posts and dealership announcements automatically.', action: 'Share posts', status: 'planned', icon: Globe },
  { id: 'zillow', label: 'Zillow', description: 'Repurpose listing-style content into AI-crafted social posts.', action: 'Try workflow', status: 'planned', icon: Search },
  { id: 'chatgpt', label: 'ChatGPT', description: 'Save AI-generated content ideas as drafts in SocialGenie.', action: 'Draft with AI', status: 'planned', icon: Bot },
  { id: 'shopify', label: 'Shopify', description: 'Share products, accessories, and merchandise across channels.', action: 'Connect store', status: 'planned', icon: ShoppingBag },
];

const FEATURE_GROUPS = [
  {
    title: 'Publishing',
    items: ['Content calendar', 'AI post ideas', 'Bulk scheduling', 'Media import', 'Platform previews'],
  },
  {
    title: 'Collaboration',
    items: ['Approval workflow', 'Content library', 'Team notifications', 'Client-ready review queue'],
  },
  {
    title: 'Analytics',
    items: ['Social analytics', 'Advanced reports', 'Automated PDF reports', 'Lead attribution'],
  },
  {
    title: 'Engagement',
    items: ['Unified inbox', 'Review management', 'AI suggested replies', 'Sentiment triage'],
  },
];

const getStatusLabel = (status: IntegrationStatus) => {
  if (status === 'live') return 'Live';
  if (status === 'via-facebook') return 'Via Facebook';
  if (status === 'external') return 'External';
  return 'Pipeline';
};

const getStatusClasses = (status: IntegrationStatus) => {
  if (status === 'live') return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'via-facebook') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'external') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState<'all' | 'facebook' | 'instagram' | 'google'>('all');
  const { addToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    if (success === 'true') {
      const fbCount = params.get('fb');
      const igCount = params.get('ig');
      const googleCount = params.get('google');
      const parts: string[] = [];
      if (fbCount && fbCount !== '0') parts.push(`${fbCount} Facebook page(s)`);
      if (igCount && igCount !== '0') parts.push(`${igCount} Instagram account(s)`);
      if (googleCount && googleCount !== '0') parts.push(`${googleCount} Google Business location(s)`);
      addToast({ type: 'success', title: 'Connected!', message: parts.length ? `Linked: ${parts.join(', ')}` : 'Account connected successfully.' });
      window.history.replaceState({}, '', '/accounts');
    } else if (error) {
      const messages: Record<string, string> = {
        server_config: 'OAuth is not configured on the server. Contact support.',
        token_exchange_failed: 'Token exchange failed. Please try again.',
        no_code: 'Authorization was cancelled.',
      };
      addToast({ type: 'error', title: 'Connection failed', message: messages[error] ?? `OAuth error: ${error}` });
      window.history.replaceState({}, '', '/accounts');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; accounts: ConnectedAccount[] }>('/platform-accounts');
      setAccounts(res.accounts ?? []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  useEffect(() => {
    window.addEventListener('focus', fetchAccounts);
    return () => window.removeEventListener('focus', fetchAccounts);
  }, [fetchAccounts]);

  const handleConnect = (platform: PlatformIntegration) => {
    if (!platform.authUrl) {
      addToast({
        type: 'info',
        title: `${platform.label} is in the integration pipeline`,
        message: platform.status === 'via-facebook'
          ? 'Connect Facebook to auto-link eligible Instagram accounts.'
          : 'This connector has been added to the hub and is ready for backend OAuth work.',
      });
      return;
    }
    const token = localStorage.getItem('access_token');
    const url = token ? `${platform.authUrl}?access_token=${encodeURIComponent(token)}` : platform.authUrl;
    window.location.href = url;
  };

  const handleWorkflowAction = (integration: WorkflowIntegration) => {
    if (integration.href) {
      window.open(integration.href, '_blank', 'noopener,noreferrer');
      return;
    }
    addToast({
      type: 'info',
      title: `${integration.label} workflow queued`,
      message: 'The integration card is now available in the hub; backend setup can be added next.',
    });
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/platform-accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      addToast({ type: 'success', title: 'Disconnected', message: 'Account removed successfully.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Could not remove account. Please try again.' });
    }
    setDeleting(null);
  };

  const getConnectedForPlatform = (platformId: string) =>
    accounts.filter((a) => a.platform === platformId || (platformId === 'google' && a.platform === 'gmb'));

  const filteredWorkflowIntegrations = WORKFLOW_INTEGRATIONS.filter((item) => {
    const haystack = `${item.label} ${item.description}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const filteredAccounts = accounts.filter((account) => {
    const normalizedPlatform = account.platform === 'gmb' ? 'google' : account.platform;
    const matchesPlatform = accountFilter === 'all' || normalizedPlatform === accountFilter;
    const matchesQuery = `${account.accountName} ${account.accountId} ${account.platform}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesPlatform && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 border border-orange-100 mb-3">
            <Globe className="w-3.5 h-3.5" />
            SocialPilot-style integration hub
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950">Accounts & Integrations</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Connect live publishing accounts, review planned channels, and keep content workflow tools in one place.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 min-w-[280px]">
          <div className="rounded-xl bg-white border border-slate-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">Connected</p>
            <p className="text-lg font-extrabold text-slate-900">{accounts.length}/30</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">Channels</p>
            <p className="text-lg font-extrabold text-slate-900">{SOCIAL_PLATFORMS.length}</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">Tools</p>
            <p className="text-lg font-extrabold text-slate-900">{WORKFLOW_INTEGRATIONS.length}</p>
          </div>
          <NavLink
            to="/accounts/create"
            className="col-span-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            <Globe className="h-4 w-4" />
            Connect Account
          </NavLink>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {FEATURE_GROUPS.map((group) => (
          <div key={group.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900 mb-3">{group.title}</h2>
            <div className="space-y-2">
              {group.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Social Platforms</h2>
            <p className="text-sm text-slate-500">Live connectors remain actionable; upcoming channels show the product roadmap inside the app.</p>
          </div>
          <NavLink to="/accounts/create" className="hidden md:inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-black">
            <Globe className="h-4 w-4" />
            Connect Account
          </NavLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const connected = getConnectedForPlatform(platform.id);
            const isConnected = connected.length > 0;
            const Icon = platform.icon;
            return (
              <div key={platform.id} className={`bg-white border rounded-xl p-4 shadow-sm ${isConnected ? 'border-green-300' : 'border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${platform.color}16`, color: platform.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 leading-tight">{platform.label}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{platform.description}</p>
                      </div>
                      <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 whitespace-nowrap ${getStatusClasses(platform.status)}`}>
                        {getStatusLabel(platform.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {platform.capabilities.map((capability) => (
                        <span key={capability} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {isConnected && (
                  <div className="mt-3 space-y-2">
                    {connected.map((acc) => (
                      <div key={acc.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 flex-1 truncate">{acc.accountName}</span>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={deleting === acc.id}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Disconnect"
                        >
                          {deleting === acc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {platform.status === 'via-facebook' && !isConnected && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">Connect Facebook first to auto-link eligible Instagram assets.</p>
                  </div>
                )}

                <button
                  onClick={() => handleConnect(platform)}
                  className={`w-full mt-4 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition-colors ${
                    platform.status === 'live'
                      ? 'bg-slate-900 hover:bg-black text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {platform.status === 'live' ? (
                    <>
                      <Globe className="w-4 h-4" />
                      {isConnected ? 'Add another' : `Connect ${platform.label}`}
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      View connector
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Productivity & Content Tools</h2>
            <p className="text-sm text-slate-500">A SocialPilot-inspired library for creative sourcing, automation, storage, and link workflows.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search integrations"
              className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {filteredWorkflowIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div key={integration.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 ${getStatusClasses(integration.status)}`}>
                    {getStatusLabel(integration.status)}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 mt-3">{integration.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[48px]">{integration.description}</p>
                <button
                  onClick={() => handleWorkflowAction(integration)}
                  className="w-full mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition-colors"
                >
                  {integration.action}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Connected Account Library</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {accounts.length}/30 accounts connected. Search, filter, and manage channel access from one table.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search an account"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={accountFilter}
                onChange={(event) => setAccountFilter(event.target.value as typeof accountFilter)}
                className="h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-sm font-semibold text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google Business</option>
              </select>
            </div>
            <button
              onClick={fetchAccounts}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center">
            <RefreshCw className="w-5 h-5 text-slate-300 animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Globe className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No accounts connected yet</p>
            <p className="text-xs text-slate-400 mt-1">Connect Facebook or Google Business above to start publishing from SocialGenie.</p>
            <NavLink to="/accounts/create" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
              Connect Account
            </NavLink>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No accounts match this filter</p>
            <p className="text-xs text-slate-400 mt-1">Clear the search or switch back to all platforms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-extrabold text-slate-400 uppercase">Platform</th>
                  <th className="px-5 py-3 text-xs font-extrabold text-slate-400 uppercase">Account Name</th>
                  <th className="px-5 py-3 text-xs font-extrabold text-slate-400 uppercase">Team Members</th>
                  <th className="px-5 py-3 text-xs font-extrabold text-slate-400 uppercase">Clients</th>
                  <th className="px-5 py-3 text-xs font-extrabold text-slate-400 uppercase">Account ID</th>
                  <th className="px-5 py-3 text-xs font-extrabold text-slate-400 uppercase">Last Connected By</th>
                  <th className="px-5 py-3 text-xs font-extrabold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => {
                  const platformMeta = SOCIAL_PLATFORMS.find((p) => p.id === acc.platform || (p.id === 'google' && acc.platform === 'gmb'));
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: `${platformMeta?.color ?? '#64748b'}18` }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: platformMeta?.color ?? '#64748b' }} />
                          </div>
                          <span className="font-semibold text-slate-800 capitalize">{platformMeta?.label ?? acc.platform}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">{acc.accountName}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex min-w-10 justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-blue-600">0</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex min-w-10 justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-blue-600">0</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{acc.accountId.slice(0, 16)}...</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        <span className="block font-semibold text-slate-600">Current user</span>
                        <span>{new Date(acc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={deleting === acc.id}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          {deleting === acc.id ? 'Removing...' : 'Disconnect'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
