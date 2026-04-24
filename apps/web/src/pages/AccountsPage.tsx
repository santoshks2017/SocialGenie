import { useState, useEffect, useCallback } from 'react';
import { Globe, Trash2, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/ui/Toast';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

interface ConnectedAccount {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  tokenExpiry: string | null;
  createdAt: string;
}

const PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    gradient: 'from-[#1877F2] to-[#0C5DC7]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    authUrl: `${API_BASE}/auth/facebook`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    gradient: 'from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    authUrl: null, // Instagram is auto-connected via Facebook
  },
  {
    id: 'google',
    label: 'Google',
    color: '#4285F4',
    gradient: 'from-[#4285F4] to-[#34A853]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    authUrl: `${API_BASE}/auth/google`,
  },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { addToast } = useToast();

  // Check for OAuth result in URL params on mount
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
      // Clean URL without reload
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

  // Refetch when browser tab regains focus (after OAuth redirect back)
  useEffect(() => {
    window.addEventListener('focus', fetchAccounts);
    return () => window.removeEventListener('focus', fetchAccounts);
  }, [fetchAccounts]);

  const handleConnect = (authUrl: string | null) => {
    if (!authUrl) return;
    // Append access_token so the backend can associate the OAuth result with this dealer
    const token = localStorage.getItem('access_token');
    const url = token ? `${authUrl}?access_token=${encodeURIComponent(token)}` : authUrl;
    window.location.href = url;
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
    accounts.filter((a) => a.platform === platformId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-stone-900">Connected Accounts</h1>
        <p className="text-sm text-stone-500 mt-1">Link your social media accounts to publish posts directly from SocialGenie.</p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {PLATFORMS.map((p) => {
          const connected = getConnectedForPlatform(p.id);
          const isConnected = connected.length > 0;
          return (
            <div
              key={p.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${
                isConnected ? 'border-green-300' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${p.gradient} px-6 py-5 flex items-center gap-4`}>
                <div className="text-white">{p.icon}</div>
                <div>
                  <p className="text-white font-bold text-lg">{p.label}</p>
                  <p className="text-white/70 text-xs font-medium">
                    {isConnected ? `${connected.length} account(s)` : 'Not connected'}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                {isConnected ? (
                  <div className="space-y-2">
                    {connected.map((acc) => (
                      <div key={acc.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                        <span className="text-sm font-semibold text-stone-800 flex-1 truncate">{acc.accountName}</span>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={deleting === acc.id}
                          className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                          title="Disconnect"
                        >
                          {deleting === acc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleConnect(p.authUrl)}
                      disabled={!p.authUrl}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-700 py-2 rounded-lg border border-dashed border-stone-200 hover:border-stone-300 transition-colors disabled:opacity-40"
                    >
                      <ExternalLink className="w-3 h-3" /> Add another
                    </button>
                  </div>
                ) : p.id === 'instagram' ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm font-semibold text-stone-500">Auto-linked via Facebook</p>
                    <p className="text-xs text-stone-400 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Connect Facebook first to enable Instagram
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(p.authUrl)}
                    disabled={!p.authUrl}
                    className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-colors shadow-sm bg-stone-900 hover:bg-black text-white"
                  >
                    <Globe className="w-4 h-4" /> Connect {p.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connected accounts table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">All Connected Accounts</h2>
          <button
            onClick={fetchAccounts}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center">
            <RefreshCw className="w-5 h-5 text-stone-300 animate-spin mx-auto mb-2" />
            <p className="text-sm text-stone-400">Loading accounts…</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Globe className="w-8 h-8 text-stone-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-500">No accounts connected yet</p>
            <p className="text-xs text-stone-400 mt-1">Click "Connect" above to link your social platforms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left">
                  <th className="px-6 py-3 text-xs font-extrabold text-stone-400 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-xs font-extrabold text-stone-400 uppercase tracking-wider">Account Name</th>
                  <th className="px-6 py-3 text-xs font-extrabold text-stone-400 uppercase tracking-wider">Account ID</th>
                  <th className="px-6 py-3 text-xs font-extrabold text-stone-400 uppercase tracking-wider">Connected</th>
                  <th className="px-6 py-3 text-xs font-extrabold text-stone-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {accounts.map((acc) => {
                  const platformMeta = PLATFORMS.find((p) => p.id === acc.platform);
                  return (
                    <tr key={acc.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: `${platformMeta?.color ?? '#888'}18` }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: platformMeta?.color ?? '#888' }} />
                          </div>
                          <span className="font-semibold text-stone-800 capitalize">{acc.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-stone-700">{acc.accountName}</td>
                      <td className="px-6 py-3.5 text-stone-400 font-mono text-xs">{acc.accountId.slice(0, 16)}…</td>
                      <td className="px-6 py-3.5 text-stone-400 text-xs">
                        {new Date(acc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={deleting === acc.id}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          {deleting === acc.id ? 'Removing…' : 'Disconnect'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
