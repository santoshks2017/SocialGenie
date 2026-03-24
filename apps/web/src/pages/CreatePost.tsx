import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { creativeService, postService } from '../services/creative';
import type { AIGenerationResponse } from '../services/creative';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { MapPin, Zap, Download, RefreshCw, Edit3, Check } from 'lucide-react';

// Platform icon components (lucide-react doesn't include brand icons)
function FbIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}
function IgIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
}

const PROMPT_CHIPS = [
  { category: 'New Arrival', icon: '🚗', prompts: [
    'New Maruti Brezza 2024 just arrived at our showroom. Limited stock!',
    'Introducing the all-new Hyundai Creta N Line — now available for booking',
    'New Tata Nexon EV Max now in stock. Book a test drive today!',
    'Fresh arrival: Kia Sonet HTX+ in Pearl White. First come first served!',
  ]},
  { category: 'Festival Offer', icon: '🎉', prompts: [
    'Diwali special offer — ₹50,000 cash discount on all models this festive season',
    'Navratri celebration deal — zero down payment and free accessories worth ₹20,000',
    'Puja offer: Exchange your old car and get ₹30,000 extra exchange bonus',
    'Festive season is here! Flat 5% off on service packages and accessories',
  ]},
  { category: 'Service Camp', icon: '🔧', prompts: [
    'Free car health check-up camp this weekend at our service centre',
    'AC service special — 20% off on AC gas refill and service this summer',
    'Annual service reminder — book now and get free multi-point inspection',
    'Extended service camp: Bring your car in, leave worry-free. Free pickup!',
  ]},
  { category: 'Testimonial', icon: '⭐', prompts: [
    'Our customer Ramesh ji just drove home his new Fortuner. Congratulations!',
    'Happy delivery of Baleno to the Singh family. Thank you for trusting us!',
    '5-star Google review from our valued customer Mrs. Patel. We are grateful!',
    'Another happy family drives home in their dream car from our showroom.',
  ]},
  { category: 'Showcase', icon: '📸', prompts: [
    'Showcase of our top pre-owned cars this week — all under ₹8 lakhs!',
    'Our certified used car lot: Verified, Serviced, and Ready to drive home',
    'Inside look at our new car gallery — over 50 models on display this weekend',
    'Meet our full SUV lineup: Creta, Seltos, Nexon, Brezza — all in one place',
  ]},
  { category: 'Engagement', icon: '💬', prompts: [
    'Which colour do you prefer for your next car? Comment below!',
    'Petrol vs Diesel vs EV — what would you choose in 2024? Tell us!',
    'Quiz: What is the mileage of the new Maruti Swift? Win a free service voucher!',
    'This or that: Maruti Baleno vs Hyundai i20. Which would you pick?',
  ]},
];


const CATEGORY_ICONS: Record<string, string> = {
  'New Arrival': '🚗',
  'Festival Offer': '🎉',
  'Service Camp': '🔧',
  'Testimonial': '⭐',
  'Showcase': '📸',
  'Engagement': '💬',
};

const MOCK_VARIANTS = [
  {
    id: 1,
    template: 'Bold Banner',
    bg: 'from-blue-900 to-blue-700',
    caption: "Don't miss this! Drive home your dream car today with our exclusive weekend offer. Limited time deal — zero down payment + free insurance for the first year. Visit us now! \n\n#DreamCar #WeekendOffer #Cardeko #HyundaiCreta #CarDeals #AutoLoan #BookNow",
    hashtags: ['#DreamCar', '#WeekendOffer', '#HyundaiCreta', '#CarDeals'],
    charCount: { facebook: 312, instagram: 312, gmb: 210 },
  },
  {
    id: 2,
    template: 'Minimal Showcase',
    bg: 'from-gray-900 to-gray-700',
    caption: "The Hyundai Creta 2024 is here — and it's everything you wanted. Spacious, stylish, and loaded with features. Starting at just ₹10.99 Lakhs. Come in for a test drive this weekend and feel the difference.\n\nCall us: +91 98765 43210 | WhatsApp: +91 98765 43210\n\n#HyundaiCreta #NewCar #TestDrive #CarShowroom",
    hashtags: ['#HyundaiCreta', '#NewCar', '#TestDrive', '#CarShowroom'],
    charCount: { facebook: 405, instagram: 405, gmb: 310 },
  },
  {
    id: 3,
    template: 'Offer Card',
    bg: 'from-orange-600 to-red-600',
    caption: "Your dream. Our offer. \u2728\n\nThis weekend, we're making car ownership easier than ever. Exchange bonus up to ₹50,000. EMI starting ₹8,999/month. Walk in today — let's make it happen.\n\nBook your free test drive: +91 98765 43210\n\n#CarOffer #Exchange #EMI #WeekendDeal #Brezza",
    hashtags: ['#CarOffer', '#Exchange', '#EMI', '#WeekendDeal'],
    charCount: { facebook: 350, instagram: 350, gmb: 250 },
  },
];

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: FbIcon, color: 'text-[#1877F2]', bg: 'bg-blue-50 border-blue-200' },
  { id: 'instagram', label: 'Instagram', icon: IgIcon, color: 'text-pink-500', bg: 'bg-pink-50 border-pink-200' },
  { id: 'gmb', label: 'Google', icon: MapPin, color: 'text-[#4285F4]', bg: 'bg-blue-50 border-blue-100' },
];

export default function CreatePost() {
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState(() => searchParams.get('prompt') ?? '');
  const [activeCategory, setActiveCategory] = useState('New Arrival');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<AIGenerationResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [activePlatformPreview, setActivePlatformPreview] = useState<'facebook' | 'instagram' | 'gmb'>('facebook');
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [published, setPublished] = useState(false);
  const [promptChips, setPromptChips] = useState(PROMPT_CHIPS);
  const [isPublishing, setIsPublishing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    creativeService.getPrompts().then((response) => {
      const grouped = response.data.reduce((acc: any, p: any) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p.text_en);
        return acc;
      }, {} as Record<string, string[]>);
      const chips = Object.entries(grouped).map(([category, prompts]) => ({
        category,
        icon: CATEGORY_ICONS[category] || '✨',
        prompts,
      }));
      if (chips.length > 0) setPromptChips(chips);
    }).catch(console.error);
  }, []);

  const handleChipClick = (p: string) => setPrompt(p);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setVariants(null);
    setPublished(false);
    try {
      const res = await creativeService.generateCaptions(prompt, selectedPlatforms);
      setVariants(res);
      setSelectedVariant(0);
      setCaption(res.captions[0]?.caption_text || '');
    } catch (error) {
      console.error(error);
      addToast({ type: 'error', title: 'Generation failed', message: 'Could not generate creatives. Check API logs.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariantSelect = (idx: number) => {
    setSelectedVariant(idx);
    setCaption(variants?.captions[idx]?.caption_text || '');
    setEditingCaption(false);
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePublishNow = async () => {
    if (!variants) return;
    setIsPublishing(true);
    try {
      const currentCaptionObj = variants.captions[selectedVariant];
      const currentCreative = variants.creatives[selectedVariant];
      const res = await postService.create({
        promptText: prompt,
        captionText: caption,
        captionHashtags: currentCaptionObj?.hashtags || [],
        creativeUrls: (currentCreative?.platform_urls as Record<string, string>) ?? {},
        platforms: selectedPlatforms,
      });
      await postService.publish(res.item.id, selectedPlatforms);
      setPublished(true);
      addToast({ type: 'success', title: 'Post published!', message: 'Your post is live on the selected platforms.' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Publish failed', message: 'Could not publish your post. Please try again.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const confirmSchedule = async () => {
    if (!variants || !scheduleTime) return;
    setIsPublishing(true);
    try {
      const currentCaptionObj = variants.captions[selectedVariant];
      const currentCreative = variants.creatives[selectedVariant];
      const res = await postService.create({
        promptText: prompt,
        captionText: caption,
        captionHashtags: currentCaptionObj?.hashtags || [],
        creativeUrls: (currentCreative?.platform_urls as Record<string, string>) ?? {},
        platforms: selectedPlatforms,
      });
      await postService.schedule(res.item.id, selectedPlatforms, new Date(scheduleTime).toISOString());
      setShowScheduleModal(false);
      setPublished(true);
      addToast({ type: 'success', title: 'Post scheduled!', message: 'Your post will be published at the selected time.' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Schedule failed', message: 'Could not schedule your post. Please try again.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const activeChips = promptChips.find((c) => c.category === activeCategory)?.prompts ?? [];
  const currentVariant = variants ? variants.captions[selectedVariant] : null;
  const currentCreative = variants ? variants.creatives[selectedVariant] : null;
  const platformChar = caption.length;

  const platformCharLimit: Record<string, number> = { facebook: 63206, instagram: 2200, gmb: 1500 };
  const charLimit = platformCharLimit[activePlatformPreview];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
        <Button variant="secondary" className="text-sm">Saved Drafts</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Prompt & Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prompt input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What do you want to post?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="w-full h-28 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="E.g. Weekend offer on Maruti Brezza with ₹30,000 exchange bonus..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{prompt.length}/500</span>
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  disabled={!prompt.trim()}
                  className="text-sm px-5"
                >
                  Generate ✨
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prompt chips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Quick prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Category tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {promptChips.map((c) => (
                  <button
                    key={c.category}
                    onClick={() => setActiveCategory(c.category)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      activeCategory === c.category
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {c.icon} {c.category}
                  </button>
                ))}
              </div>
              {/* Chip prompts */}
              <div className="space-y-1.5">
                {activeChips.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleChipClick(p)}
                    className="w-full text-left text-xs p-2.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors line-clamp-2"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform selection */}
          {variants && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Post to platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PLATFORMS.map(({ id, label, icon: Icon, color, bg }) => (
                  <button
                    key={id}
                    onClick={() => togglePlatform(id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedPlatforms.includes(id) ? bg : 'bg-white border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    {selectedPlatforms.includes(id) && <Check className="w-4 h-4 text-green-500" />}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Variants + Caption */}
        <div className="lg:col-span-3 space-y-4">
          {published ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Post Published!</h3>
              <p className="text-gray-500 text-sm mt-2">Your post has been queued to {selectedPlatforms.join(', ')}</p>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => { setVariants(null); setPrompt(''); setPublished(false); }}>Create Another</Button>
                <Button onClick={() => window.location.href = '/calendar'}>View Calendar</Button>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Generating your creatives...</p>
              <p className="text-gray-400 text-sm mt-1">AI is crafting 3 variants for you</p>
            </div>
          ) : variants ? (
            <>
              {/* Variant carousel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Select a Creative</h3>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {variants.creatives.slice(0, 3).map((v, i) => (
                    <button
                      key={v.id ?? i}
                      onClick={() => handleVariantSelect(i)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        selectedVariant === i ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      {/* Creative preview */}
                      <div className={`aspect-square bg-gradient-to-br ${['from-blue-900 to-blue-700', 'from-gray-900 to-gray-700', 'from-orange-600 to-red-600'][i % 3]} flex flex-col items-center justify-center p-3`}>
                        <div className="w-12 h-8 bg-white/20 rounded mb-2" />
                        <div className="w-16 h-2 bg-white/60 rounded mb-1" />
                        <div className="w-10 h-2 bg-white/40 rounded" />
                        <div className="absolute bottom-2 left-2 w-6 h-2 bg-white/30 rounded" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-[10px] font-medium">{v.template_name}</p>
                      </div>
                      {selectedVariant === i && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform preview toggle */}
              {currentVariant && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-gray-600">Caption</CardTitle>
                      <div className="flex gap-1">
                        {(['facebook', 'instagram', 'gmb'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setActivePlatformPreview(p)}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                              activePlatformPreview === p
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-500 border-gray-200'
                            }`}
                          >
                            {p === 'facebook' ? 'FB' : p === 'instagram' ? 'IG' : 'GMB'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editingCaption ? (
                      <textarea
                        className="w-full h-32 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        maxLength={charLimit}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line line-clamp-4">{caption}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${platformChar > charLimit * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {platformChar}/{charLimit} chars
                      </span>
                      <button
                        onClick={() => setEditingCaption((v) => !v)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Edit3 className="w-3 h-3" /> {editingCaption ? 'Done' : 'Edit'}
                      </button>
                    </div>

                    {/* Hashtags */}
                    <div className="flex gap-1.5 flex-wrap">
                      {(currentVariant?.hashtags || []).map((h) => (
                        <span key={h} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{h}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 text-sm"
                        onClick={handlePublishNow}
                        isLoading={isPublishing}
                        disabled={selectedPlatforms.length === 0}
                      >
                        Publish Now
                      </Button>
                      <Button
                        className="flex-1 text-sm"
                        variant="secondary"
                        onClick={() => setShowScheduleModal(true)}
                        disabled={selectedPlatforms.length === 0}
                      >
                        Schedule
                      </Button>
                      <Button variant="ghost" className="px-3" title="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" className="px-3" title="Boost">
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-gray-200 text-gray-400 py-20 gap-3">
              <div className="text-4xl">✨</div>
              <p className="font-medium text-gray-500">Enter a prompt to generate AI creatives</p>
              <p className="text-sm text-gray-400">Or pick a quick prompt from the library</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Schedule Post</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <strong>Best time suggestion:</strong> Tomorrow, 9:00 AM — based on your audience engagement patterns
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={confirmSchedule}
                isLoading={isPublishing}
                disabled={!scheduleTime}
              >
                Confirm Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
