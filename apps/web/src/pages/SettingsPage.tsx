import { useState, useEffect } from 'react';
import { Check, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../services/api';

type PlatformStatus = 'connected' | 'disconnected' | 'expired';

interface PlatformInfo {
  id: string;
  name: string;
  accountName: string;
  status: PlatformStatus;
  expiresIn?: number;
  icon: React.ReactNode;
}

function FbIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}

function IgIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="50%" stopColor="#e6683c"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function GmbIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4285F4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
}

const INITIAL_PLATFORMS: PlatformInfo[] = [
  { id: 'facebook', name: 'Facebook Page', accountName: 'Cardeko Motors Bangalore', status: 'connected', expiresIn: 45, icon: <FbIcon /> },
  { id: 'instagram', name: 'Instagram Business', accountName: '@cardekomotors', status: 'connected', expiresIn: 45, icon: <IgIcon /> },
  { id: 'gmb', name: 'Google My Business', accountName: 'Cardeko Motors - Bangalore', status: 'expired', icon: <GmbIcon /> },
];

const LANGUAGES = [
  { code: 'en', label: 'English', script: 'Latin' },
  { code: 'hi', label: 'Hindi', script: 'Devanagari' },
  { code: 'ta', label: 'Tamil', script: 'Tamil' },
  { code: 'te', label: 'Telugu', script: 'Telugu' },
  { code: 'kn', label: 'Kannada', script: 'Kannada' },
  { code: 'ml', label: 'Malayalam', script: 'Malayalam' },
  { code: 'mr', label: 'Marathi', script: 'Devanagari' },
];

const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana', 'Gujarat', 'Punjab', 'Rajasthan'];

const BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Kia', 'Honda', 'Toyota', 'Mahindra', 'Renault', 'Nissan', 'MG', 'Skoda', 'Volkswagen', 'Jeep', 'Ford'];

const NOTIFICATION_KEYS = [
  { key: 'post_published', label: 'Post published successfully', defaultOn: true },
  { key: 'post_failed', label: 'Post failed to publish', defaultOn: true },
  { key: 'inbox_message', label: 'New inbox message received', defaultOn: true },
  { key: 'boost_update', label: 'Boost campaign update (every 4h)', defaultOn: false },
  { key: 'festival_suggestion', label: 'Festival campaign suggestions', defaultOn: true },
  { key: 'monthly_report', label: 'Monthly performance report', defaultOn: true },
];

type Tab = 'profile' | 'platforms' | 'preferences';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [platforms, setPlatforms] = useState<PlatformInfo[]>(INITIAL_PLATFORMS);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['en', 'hi']);
  const [selectedRegion, setSelectedRegion] = useState('South India');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Hyundai', 'Kia']);
  const [dealerName, setDealerName] = useState('Cardeko Motors Pvt. Ltd.');
  const [city, setCity] = useState('Bangalore');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [whatsapp, setWhatsapp] = useState('+91 98765 43210');
  const [primaryColor, setPrimaryColor] = useState('#1877F2');
  const [defaultRadius, setDefaultRadius] = useState(25);
  const [notifications, setNotifications] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('sg_notifications');
    if (saved) return new Set(JSON.parse(saved) as string[]);
    return new Set(NOTIFICATION_KEYS.filter((n) => n.defaultOn).map((n) => n.key));
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<{ success: boolean; profile: {
      name: string; city: string; contact_phone?: string; whatsapp_number?: string;
      primary_color?: string; brands?: string[]; language_preferences?: string[]; region?: string;
      platform_connections?: Array<{ platform: string; platform_account_name?: string; is_connected: boolean; token_expires_at?: string }>;
    } }>('/dealer/profile').then((res) => {
      const p = res.profile;
      setDealerName(p.name);
      setCity(p.city);
      if (p.contact_phone) setPhone(p.contact_phone);
      if (p.whatsapp_number) setWhatsapp(p.whatsapp_number);
      if (p.primary_color) setPrimaryColor(p.primary_color);
      if (p.brands?.length) setSelectedBrands(p.brands as string[]);
      if (p.language_preferences?.length) setSelectedLangs(p.language_preferences);
      if (p.region) setSelectedRegion(p.region);
      if (p.platform_connections?.length) {
        const ICON_MAP: Record<string, React.ReactNode> = { facebook: <FbIcon />, instagram: <IgIcon />, gmb: <GmbIcon /> };
        const NAME_MAP: Record<string, string> = { facebook: 'Facebook Page', instagram: 'Instagram Business', gmb: 'Google My Business' };
        const mapped: PlatformInfo[] = p.platform_connections.map((conn) => {
          const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at) : null;
          const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : undefined;
          return {
            id: conn.platform,
            name: NAME_MAP[conn.platform] ?? conn.platform,
            accountName: conn.platform_account_name ?? 'Not connected',
            status: conn.is_connected ? (daysLeft !== undefined && daysLeft < 0 ? 'expired' : 'connected') : 'disconnected',
            expiresIn: daysLeft !== undefined && daysLeft > 0 ? daysLeft : undefined,
            icon: ICON_MAP[conn.platform] ?? null,
          };
        });
        if (mapped.length > 0) setPlatforms(mapped);
      }
    }).catch(console.error);
  }, []);

  const handleConnect = (id: string) => {
    api.get<{ success: boolean; redirect_url: string }>(`/platforms/connect/${id}`)
      .then((res) => { window.location.href = res.redirect_url; })
      .catch(() => setPlatforms((prev) => prev.map((p) => p.id === id ? { ...p, status: 'connected', expiresIn: 60, accountName: 'Reconnected Account' } : p)));
  };

  const handleDisconnect = (id: string) => {
    api.delete<{ success: boolean }>(`/platforms/${id}`).catch(console.error);
    setPlatforms((prev) => prev.map((p) => p.id === id ? { ...p, status: 'disconnected', accountName: 'Not connected' } : p));
  };

  const toggleLang = (code: string) => {
    if (code === 'en') return; // English always required
    setSelectedLangs((prev) => prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };

  const handleSave = () => {
    api.put('/dealer/profile', {
      name: dealerName, city, contact_phone: phone, whatsapp_number: whatsapp,
      primary_color: primaryColor, brands: selectedBrands,
      language_preferences: selectedLangs, region: selectedRegion,
    }).catch(console.error);
    localStorage.setItem('sg_notifications', JSON.stringify([...notifications]));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Dealer Profile' },
    { id: 'platforms', label: 'Platform Connections' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your dealership profile and connected platforms</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-gray-800">Dealership Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dealership Name</label>
                <input value={dealerName} onChange={(e) => setDealerName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp Number</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Brands Sold</label>
              <div className="flex flex-wrap gap-2">
                {BRANDS.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedBrands.includes(b) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Dealer Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">Logo</div>
                <Button variant="secondary" className="text-sm">Upload Logo</Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Brand Colors</label>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Primary</p>
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 rounded-lg border cursor-pointer" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Secondary</p>
                  <input type="color" defaultValue="#1A1A2E" className="w-12 h-10 rounded-lg border cursor-pointer" />
                </div>
                <p className="text-xs text-gray-400">Used on all generated creatives and templates</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Saved successfully
              </div>
            )}
            <Button onClick={handleSave} className="text-sm">Save Changes</Button>
          </div>
        </div>
      )}

      {/* --- PLATFORMS TAB --- */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Connect your social accounts so Cardeko can publish posts, manage your inbox, and run boost campaigns on your behalf.
          </div>

          {platforms.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === 'connected' ? 'bg-green-100 text-green-700' :
                      p.status === 'expired' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status === 'connected' ? 'Connected' : p.status === 'expired' ? 'Token Expired' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{p.accountName}</p>
                  {p.status === 'connected' && p.expiresIn && (
                    <p className="text-xs text-gray-400 mt-0.5">Token expires in {p.expiresIn} days</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {p.status === 'connected' && (
                    <>
                      <button
                        onClick={() => handleConnect(p.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                      <button
                        onClick={() => handleDisconnect(p.id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    </>
                  )}
                  {(p.status === 'disconnected' || p.status === 'expired') && (
                    <Button className="text-sm flex items-center gap-1.5" onClick={() => handleConnect(p.id)}>
                      {p.status === 'expired' ? <><AlertCircle className="w-3.5 h-3.5" /> Reconnect</> : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>

              {p.status === 'expired' && (
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <p className="text-xs text-orange-700">Your access token has expired. Reconnect to continue publishing and managing your inbox for this platform.</p>
                </div>
              )}
            </div>
          ))}

          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-5 text-center text-gray-400">
            <p className="text-sm">More integrations coming soon — WhatsApp Business, YouTube, LinkedIn</p>
          </div>
        </div>
      )}

      {/* --- PREFERENCES TAB --- */}
      {activeTab === 'preferences' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Caption Languages</h3>
              <p className="text-xs text-gray-500 mb-3">Select languages for AI caption generation. English is always included.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    disabled={lang.code === 'en'}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      selectedLangs.includes(lang.code)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <span className="font-medium">{lang.label}</span>
                    <span className="text-[10px] text-gray-400">{lang.script}</span>
                    {selectedLangs.includes(lang.code) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Region</h3>
              <p className="text-xs text-gray-500 mb-3">Controls which festival templates and regional campaigns are shown.</p>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Default Boost Radius</h3>
              <p className="text-xs text-gray-500 mb-3">How far from your dealership boost campaigns target by default.</p>
              <div className="space-y-2">
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={defaultRadius}
                  onChange={(e) => setDefaultRadius(+e.target.value)}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>5 km</span>
                  <span className="font-medium text-blue-600">{defaultRadius} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Notifications</h3>
              <div className="space-y-2">
                {NOTIFICATION_KEYS.map((n) => (
                  <label key={n.key} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer">
                    <span className="text-sm text-gray-700">{n.label}</span>
                    <input
                      type="checkbox"
                      checked={notifications.has(n.key)}
                      onChange={() => setNotifications((prev) => {
                        const next = new Set(prev);
                        next.has(n.key) ? next.delete(n.key) : next.add(n.key);
                        return next;
                      })}
                      className="w-4 h-4 accent-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Subscription Plan</h3>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Growth Plan</p>
                    <p className="text-blue-200 text-sm">Unlimited posts · 3 platforms · Boost campaigns</p>
                  </div>
                  <span className="bg-white text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">Active</span>
                </div>
                <p className="text-blue-200 text-xs mt-2">Renews on 15 October 2026</p>
                <Button className="mt-3 bg-white text-blue-700 hover:bg-blue-50 text-xs">Upgrade to Enterprise</Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Saved
              </div>
            )}
            <Button onClick={handleSave} className="text-sm">Save Preferences</Button>
          </div>
        </div>
      )}
    </div>
  );
}
