import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Film,
  Globe,
  Image,
  MessageCircle,
  Music2,
  Pin,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import api, { ApiError } from '../services/api';
import { useToast } from '../components/ui/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConnectedAccount {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  tokenExpiry: string | null;
  createdAt: string;
}

type PlatformStatus = 'live' | 'via-facebook' | 'at-protocol';

interface PlatformDef {
  id: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  status: PlatformStatus;
  note?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

// ── Platform catalogue ────────────────────────────────────────────────────────
const PLATFORMS: PlatformDef[] = [
  {
    id: 'facebook', label: 'Facebook', color: '#1877F2', bgColor: '#1877F214',
    description: 'Connect a Facebook Page to publish posts, manage reviews, and run boosted campaigns.',
    status: 'live', icon: MessageCircle,
  },
  {
    id: 'instagram', label: 'Instagram', color: '#E1306C', bgColor: '#E1306C14',
    description: 'Instagram Business accounts are auto-linked when you connect your Facebook Page.',
    status: 'via-facebook', note: 'Auto-linked via Facebook', icon: Image,
  },
  {
    id: 'gmb', label: 'Google Business', color: '#4285F4', bgColor: '#4285F414',
    description: 'Publish local updates, respond to reviews, and manage Business Profile locations.',
    status: 'live', icon: Globe,
  },
  {
    id: 'youtube', label: 'YouTube', color: '#FF0000', bgColor: '#FF000014',
    description: 'Manage vehicle walkaround videos, shorts, and dealership channel analytics.',
    status: 'live', icon: Film,
  },
  {
    id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', bgColor: '#0A66C214',
    description: 'Share employer brand updates, hiring posts, events, and leadership content.',
    status: 'live', icon: Briefcase,
  },
  {
    id: 'twitter', label: 'X / Twitter', color: '#111827', bgColor: '#11182714',
    description: 'Track conversations, trends, and post quick showroom announcements.',
    status: 'live', icon: MessageCircle,
  },
  {
    id: 'tiktok', label: 'TikTok', color: '#111827', bgColor: '#11182714',
    description: 'Schedule short-form videos and repurpose inventory clips for discovery.',
    status: 'live', icon: Music2,
  },
  {
    id: 'threads', label: 'Threads', color: '#111827', bgColor: '#11182714',
    description: 'Queue lightweight updates and community-style posts for your audience.',
    status: 'live', icon: Send,
  },
  {
    id: 'pinterest', label: 'Pinterest', color: '#E60023', bgColor: '#E6002314',
    description: 'Organise visual inspiration boards and evergreen vehicle model pins.',
    status: 'live', icon: Pin,
  },
  {
    id: 'bluesky', label: 'Bluesky', color: '#0285FF', bgColor: '#0285FF14',
    description: 'Connect via AT Protocol with your handle and an App Password — no redirect needed.',
    status: 'at-protocol', icon: Globe,
  },
];

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  facebook:  { label: 'Facebook',        color: '#1877F2' },
  instagram: { label: 'Instagram',       color: '#E1306C' },
  gmb:       { label: 'Google Business', color: '#4285F4' },
  google:    { label: 'Google Business', color: '#4285F4' },
  youtube:   { label: 'YouTube',         color: '#FF0000' },
  linkedin:  { label: 'LinkedIn',        color: '#0A66C2' },
  twitter:   { label: 'X / Twitter',     color: '#111827' },
  tiktok:    { label: 'TikTok',          color: '#111827' },
  threads:   { label: 'Threads',         color: '#111827' },
  pinterest: { label: 'Pinterest',       color: '#E60023' },
  bluesky:   { label: 'Bluesky',         color: '#0285FF' },
};

function tokenExpiryStatus(expiry: string | null): 'ok' | 'warn' | 'expired' {
  if (!expiry) return 'ok';
  const msLeft = new Date(expiry).getTime() - Date.now();
  if (msLeft < 0) return 'expired';
  if (msLeft < 7 * 24 * 60 * 60 * 1000) return 'warn';
  return 'ok';
}

// ── Bluesky Modal ─────────────────────────────────────────────────────────────
function BlueskyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (name: string) => void }) {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!handle.trim() || !password.trim()) { setError('Handle and App Password are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; account: { handle: string } }>('/platforms/connect/bluesky', {
        handle: handle.trim().replace(/^@/, ''),
        appPassword: password.trim(),
      });
      addToast({ type: 'success', title: 'Bluesky connected!', message: `@${res.account.handle} linked successfully.` });
      onSuccess(`@${res.account.handle}`);
      onClose();
    } catch (err) {
      const data = err instanceof ApiError ? (err.data as { error?: { message?: string } } | undefined) : undefined;
      setError(data?.error?.message ?? 'Connection failed. Check your handle and App Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0285FF14] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#0285FF]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Connect Bluesky</h2>
              <p className="text-xs text-slate-400">Uses the AT Protocol — no redirect required</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Use an <strong>App Password</strong>, not your main Bluesky password.
            Create one at: <span className="font-mono">bsky.app → Settings → App Passwords</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Bluesky Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourname.bsky.social"
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">App Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                className="w-full h-10 rounded-lg border border-slate-200 px-3 pr-10 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-[#0285FF] hover:bg-blue-600 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Connecting...' : 'Connect Bluesky'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Instagram Info Modal ──────────────────────────────────────────────────────
function InstagramModal({ onClose, onConnectFacebook }: { onClose: () => void; onConnectFacebook: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E1306C14] flex items-center justify-center">
              <Image className="w-5 h-5 text-[#E1306C]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Connect Instagram</h2>
              <p className="text-xs text-slate-400">Business &amp; Creator accounts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-bold text-green-800 mb-1">Business or Creator Account</p>
            <p className="text-xs text-green-700">Connect your Facebook Page and SocialGenie will automatically link any Instagram Business or Creator account connected to that Page — all in one step.</p>
            <button
              onClick={() => { onConnectFacebook(); onClose(); }}
              className="mt-3 w-full h-9 rounded-lg bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Connect via Facebook
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-700 mb-1">Personal Profile</p>
            <p className="text-xs text-slate-500">Instagram's API does not allow direct publishing to personal profiles. Publishing requires the SocialGenie mobile app, which sends a push notification when it's time to post.</p>
            <p className="text-xs text-slate-400 mt-2 italic">Mobile app coming soon.</p>
          </div>
        </div>

        <button onClick={onClose} className="w-full h-9 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showBluesky, setShowBluesky] = useState(false);
  const [showInstagram, setShowInstagram] = useState(false);
  const { addToast } = useToast();

  // Handle OAuth redirect-back from backend (?oauth_success=... or ?oauth_error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('oauth_success');
    const error   = params.get('oauth_error');
    const name    = params.get('page_name') ?? '';

    if (success) {
      const platforms = success.split(',').map((p) => PLATFORM_META[p]?.label ?? p).join(' + ');
      addToast({ type: 'success', title: 'Connected!', message: `${platforms}${name ? ` — ${name}` : ''} linked successfully.` });
      window.history.replaceState({}, '', '/accounts');
    } else if (error) {
      addToast({ type: 'error', title: 'Connection failed', message: error });
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

  const initiateOAuth = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const res = await api.get<{ success: boolean; redirect_url: string }>(`/platforms/connect/${platformId}`);
      window.location.href = res.redirect_url;
    } catch (err) {
      let message = 'Could not start the connection. Please try again.';
      if (err instanceof ApiError) {
        const data = err.data as { error?: { message?: string; code?: string } } | undefined;
        if (data?.error?.code === 'CONFIG_ERROR') {
          message = 'OAuth credentials are not yet configured for this platform. Contact your administrator.';
        } else if (data?.error?.message) {
          message = data.error.message;
        }
      }
      addToast({ type: 'error', title: 'Connection failed', message });
      setConnecting(null);
    }
  };

  const handleConnect = (platform: PlatformDef) => {
    if (platform.status === 'via-facebook') { setShowInstagram(true); return; }
    if (platform.status === 'at-protocol')  { setShowBluesky(true);   return; }
    initiateOAuth(platform.id);
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

  const getConnected = (platformId: string) =>
    accounts.filter((a) => a.platform === platformId || (platformId === 'gmb' && a.platform === 'google'));

  const facebookConnected = getConnected('facebook').length > 0;

  return (
    <>
      {showBluesky   && <BlueskyModal onClose={() => setShowBluesky(false)}   onSuccess={() => { fetchAccounts(); }} />}
      {showInstagram && <InstagramModal onClose={() => setShowInstagram(false)} onConnectFacebook={() => initiateOAuth('facebook')} />}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Social Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect your social media accounts to publish posts directly from SocialGenie.{' '}
            <span className="font-semibold text-slate-700">{accounts.length} connected.</span>
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORMS.map((platform) => {
            const connected  = getConnected(platform.id);
            const isConnected = connected.length > 0;
            const Icon        = platform.icon;
            const isLoading   = connecting === platform.id;

            return (
              <div
                key={platform.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-colors ${isConnected ? 'border-green-300' : 'border-slate-200'}`}
              >
                {/* Platform header row */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: platform.bgColor, color: platform.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{platform.label}</span>
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      )}
                      {platform.status === 'via-facebook' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          Via Facebook
                        </span>
                      )}
                      {platform.status === 'at-protocol' && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                          App Password
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{platform.description}</p>
                  </div>
                </div>

                {/* Connected account chips */}
                {isConnected && (
                  <div className="mt-3 space-y-1.5 pl-[52px]">
                    {connected.map((acc) => {
                      const expiry = tokenExpiryStatus(acc.tokenExpiry);
                      return (
                        <div
                          key={acc.id}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-xs ${
                            expiry === 'expired' ? 'bg-red-50 border-red-200' :
                            expiry === 'warn'    ? 'bg-amber-50 border-amber-200' :
                                                  'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            expiry === 'expired' ? 'bg-red-500' :
                            expiry === 'warn'    ? 'bg-amber-400' : 'bg-green-500'
                          }`} />
                          <span className="font-semibold text-slate-800 flex-1 truncate">{acc.accountName}</span>
                          {expiry === 'expired' && <span className="font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full shrink-0">Reconnect</span>}
                          {expiry === 'warn'    && <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">Expiring</span>}
                          <button
                            onClick={() => handleDelete(acc.id)}
                            disabled={deleting === acc.id}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            title="Disconnect"
                          >
                            {deleting === acc.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Instagram not connected + Facebook not connected warning */}
                {platform.id === 'instagram' && !isConnected && !facebookConnected && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 ml-[52px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">Connect Facebook first to auto-link Instagram Business.</p>
                  </div>
                )}
                {platform.id === 'instagram' && !isConnected && facebookConnected && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 ml-[52px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">No Instagram Business account found on your Facebook Page. Make sure your IG account is linked in Facebook Business Settings.</p>
                  </div>
                )}

                {/* Connect / Reconnect button */}
                <div className="mt-4 pl-[52px]">
                  {platform.status === 'via-facebook' ? (
                    <button
                      onClick={() => setShowInstagram(true)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
                    >
                      How to connect Instagram →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-60 bg-slate-900 hover:bg-black text-white"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                      {isConnected ? 'Reconnect' : `Connect ${platform.label}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Connected accounts table (only when accounts exist) */}
        {!loading && accounts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">All Connected Accounts</h2>
              <button
                onClick={fetchAccounts}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {accounts.map((acc) => {
                const meta   = PLATFORM_META[acc.platform] ?? { label: acc.platform, color: '#64748b' };
                const expiry = tokenExpiryStatus(acc.tokenExpiry);
                return (
                  <div key={acc.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                    <span className="text-xs font-bold text-slate-500 w-32 shrink-0">{meta.label}</span>
                    <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{acc.accountName}</span>
                    {expiry === 'expired' && <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0">Reconnect</span>}
                    {expiry === 'warn'    && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">Expiring</span>}
                    <button
                      onClick={() => handleDelete(acc.id)}
                      disabled={deleting === acc.id}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                      title="Disconnect"
                    >
                      {deleting === acc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="w-5 h-5 text-slate-300 animate-spin" />
          </div>
        )}
      </div>
    </>
  );
}
