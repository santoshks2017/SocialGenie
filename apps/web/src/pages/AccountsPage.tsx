import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  MessageCircle,
  Image,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import api, { ApiError } from '../services/api';
import { useToast } from '../components/ui/Toast';

interface ConnectedAccount {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  tokenExpiry: string | null;
  createdAt: string;
}

function tokenExpiryStatus(expiry: string | null): 'ok' | 'warn' | 'expired' {
  if (!expiry) return 'ok';
  const msLeft = new Date(expiry).getTime() - Date.now();
  if (msLeft < 0) return 'expired';
  if (msLeft < 7 * 24 * 60 * 60 * 1000) return 'warn';
  return 'ok';
}

const PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook',
    description: 'Connect a Facebook Page to publish posts and manage reviews.',
    color: '#1877F2',
    bgColor: '#1877F214',
    icon: MessageCircle,
    canConnect: true,
    note: null,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Instagram Business accounts are auto-linked when you connect Facebook.',
    color: '#E1306C',
    bgColor: '#E1306C14',
    icon: Image,
    canConnect: false,
    note: 'Auto-linked via Facebook',
  },
  {
    id: 'gmb',
    label: 'Google Business',
    description: 'Connect Google Business Profile to publish local updates and respond to reviews.',
    color: '#4285F4',
    bgColor: '#4285F414',
    icon: Globe,
    canConnect: true,
    note: null,
  },
] as const;

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  facebook:  { label: 'Facebook',        color: '#1877F2' },
  instagram: { label: 'Instagram',       color: '#E1306C' },
  gmb:       { label: 'Google Business', color: '#4285F4' },
  google:    { label: 'Google Business', color: '#4285F4' },
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    if (success === 'true') {
      const parts: string[] = [];
      const fb = params.get('fb');
      const ig = params.get('ig');
      const google = params.get('google');
      if (fb && fb !== '0') parts.push(`${fb} Facebook page(s)`);
      if (ig && ig !== '0') parts.push(`${ig} Instagram account(s)`);
      if (google && google !== '0') parts.push(`${google} Google Business location(s)`);
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

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const res = await api.get<{ success: boolean; redirect_url: string }>(`/platforms/connect/${platformId}`);
      window.location.href = res.redirect_url;
    } catch (err) {
      let message = 'Could not start the connection. Please try again.';
      if (err instanceof ApiError) {
        const data = err.data as { error?: { message?: string; code?: string }; message?: string } | undefined;
        const apiMsg = data?.error?.message ?? data?.message;
        if (data?.error?.code === 'CONFIG_ERROR') {
          message = 'OAuth credentials are not configured on the server. Contact your administrator.';
        } else if (apiMsg) {
          message = apiMsg;
        }
      }
      addToast({ type: 'error', title: 'Connection failed', message });
    } finally {
      setConnecting(null);
    }
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
    accounts.filter((a) => a.platform === platformId || (platformId === 'gmb' && a.platform === 'google'));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-950">Social Accounts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect your social media accounts to publish posts directly from SocialGenie.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="space-y-3">
        {PLATFORMS.map((platform) => {
          const connected = getConnectedForPlatform(platform.id);
          const isConnected = connected.length > 0;
          const Icon = platform.icon;
          const isLoading = connecting === platform.id;

          return (
            <div
              key={platform.id}
              className={`bg-white border rounded-xl p-5 shadow-sm transition-colors ${isConnected ? 'border-green-300' : 'border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: platform.bgColor, color: platform.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{platform.label}</h3>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{platform.description}</p>
                </div>

                <div className="shrink-0">
                  {platform.canConnect ? (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-60 bg-slate-900 hover:bg-black text-white"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                      {isConnected ? 'Add another' : 'Connect'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">{platform.note}</span>
                  )}
                </div>
              </div>

              {/* Connected accounts list */}
              {isConnected && (
                <div className="mt-4 space-y-2 pl-[60px]">
                  {connected.map((acc) => {
                    const expiry = tokenExpiryStatus(acc.tokenExpiry);
                    return (
                      <div
                        key={acc.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-sm ${
                          expiry === 'expired' ? 'bg-red-50 border-red-200' :
                          expiry === 'warn'    ? 'bg-amber-50 border-amber-200' :
                                                'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          expiry === 'expired' ? 'bg-red-500' :
                          expiry === 'warn'    ? 'bg-amber-400' :
                                                'bg-green-500'
                        }`} />
                        <span className="font-semibold text-slate-800 flex-1 truncate">{acc.accountName}</span>
                        {expiry === 'expired' && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">Reconnect</span>
                        )}
                        {expiry === 'warn' && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Expiring soon</span>
                        )}
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={deleting === acc.id}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Disconnect"
                        >
                          {deleting === acc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Instagram note when Facebook not connected */}
              {platform.id === 'instagram' && !isConnected && getConnectedForPlatform('facebook').length === 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 ml-[60px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">Connect Facebook first to auto-link eligible Instagram accounts.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All connected accounts summary (only when connected) */}
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
              const meta = PLATFORM_META[acc.platform] ?? { label: acc.platform, color: '#64748b' };
              const expiry = tokenExpiryStatus(acc.tokenExpiry);
              return (
                <div key={acc.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                  <span className="text-xs font-bold text-slate-500 w-28 shrink-0">{meta.label}</span>
                  <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{acc.accountName}</span>
                  {expiry === 'expired' && (
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0">Reconnect</span>
                  )}
                  {expiry === 'warn' && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">Expiring</span>
                  )}
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
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 text-slate-300 animate-spin" />
        </div>
      )}
    </div>
  );
}
