import { useState, useEffect, useRef } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { creativeService, postService } from '../services/creative';
import type { AIGenerationResponse, CaptionVariant } from '../services/creative';
import { useToast } from '../components/ui/Toast';
import { generateImage } from '../services/imageGeneration';
import {
  Tag, Sparkles, Heart, Gift, PenLine,
  ArrowLeft, RefreshCw, Check, ImagePlus, Video, X,
  ChevronUp, Send, Download, Zap, Globe,
} from 'lucide-react';

// ─── Platform SVG icons ───────────────────────────────────────────────────────
function FbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// ─── Post type definitions ────────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'offer',    icon: Tag,       label: "Today's Offer",      sub: 'Discounts & deals',      color: 'text-orange-600', bg: 'bg-orange-50',  category: 'Festival Offer', starter: 'Special weekend offer — ' },
  { id: 'arrival',  icon: Sparkles,  label: 'New Arrival',        sub: 'Showcase new stock',     color: 'text-teal-600',   bg: 'bg-teal-50',    category: 'New Arrival',   starter: 'New vehicle just arrived — ' },
  { id: 'delivery', icon: Heart,     label: 'Customer Delivery',  sub: 'Celebrate handovers',    color: 'text-pink-600',   bg: 'bg-pink-50',    category: 'Testimonial',   starter: 'Happy delivery to our valued customer — ' },
  { id: 'festival', icon: Gift,      label: 'Festival Post',      sub: 'Diwali, Holi & more',    color: 'text-purple-600', bg: 'bg-purple-50',  category: 'Festival Offer', starter: 'Celebrate this festival with us — ' },
  { id: 'custom',   icon: PenLine,   label: 'Custom Prompt',      sub: 'Type your own idea',     color: 'text-stone-600',  bg: 'bg-stone-100',  category: 'Engagement',    starter: '' },
] as const;

const PROMPT_CHIPS: Record<string, string[]> = {
  'New Arrival': [
    'New Maruti Brezza 2024 just arrived at our showroom. Limited stock!',
    'Introducing the all-new Hyundai Creta N Line — now available for booking',
    'New Tata Nexon EV Max now in stock. Book a test drive today!',
  ],
  'Festival Offer': [
    'Diwali special offer — ₹50,000 cash discount on all models this festive season',
    'Navratri celebration deal — zero down payment and free accessories worth ₹20,000',
    'Special weekend offer — Exchange bonus up to ₹75,000 on all models',
  ],
  'Testimonial': [
    'Our customer Ramesh ji just drove home his new Fortuner. Congratulations!',
    'Happy delivery of Baleno to the Singh family. Thank you for trusting us!',
    '5-star Google review from our valued customer Mrs. Patel. We are grateful!',
  ],
  'Engagement': [
    'Which colour do you prefer for your next car? Comment below!',
    'Petrol vs Diesel vs EV — what would you choose in 2024? Tell us!',
    'Quiz: What is the mileage of the new Maruti Swift? Win a free service voucher!',
  ],
};

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',           icon: FbIcon,  color: 'text-[#1877F2]', bg: 'bg-blue-50',  border: 'border-blue-200' },
  { id: 'instagram', label: 'Instagram',           icon: IgIcon,  color: 'text-pink-500',  bg: 'bg-pink-50',  border: 'border-pink-200' },
  { id: 'gmb',       label: 'Google My Business',  icon: Globe,   color: 'text-[#4285F4]', bg: 'bg-blue-50',  border: 'border-blue-100' },
] as const;

const TEMPLATE_THEMES = [
  { label: 'Bold Banner',       gradient: 'from-stone-900 to-stone-800',    accent: 'bg-orange-600',    sub: "TODAY'S OFFER" },
  { label: 'Mega Discount',     gradient: 'from-orange-600 to-orange-500',  accent: 'bg-white/20',      sub: 'SPECIAL DEAL' },
  { label: 'Best Price',        gradient: 'from-teal-700 to-teal-600',      accent: 'bg-white/20',      sub: 'LIMITED TIME' },
  { label: 'Golden Deal',       gradient: 'from-amber-600 to-amber-500',    accent: 'bg-white/20',      sub: 'PREMIUM' },
] as const;

// ─── CreatePost ───────────────────────────────────────────────────────────────
export default function CreatePost() {
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState(() => searchParams.get('prompt') ?? '');
  const [selectedPostType, setSelectedPostType] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Festival Offer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<AIGenerationResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram', 'gmb']);
  const [activePlatformPreview, setActivePlatformPreview] = useState<'google' | 'facebook' | 'instagram'>('google');
  const [caption, setCaption] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [published, setPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toneActive, setToneActive] = useState<'hinglish' | 'english' | 'hindi'>('hinglish');
  const [aiImageUrls, setAiImageUrls] = useState<(string | null)[]>([null, null, null]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Load prompts from API
  useEffect(() => {
    creativeService.getPrompts().catch(console.error);
  }, []);

  // Pre-fill prompt from URL param
  useEffect(() => {
    const p = searchParams.get('prompt');
    if (p) setPrompt(p);
  }, [searchParams]);

  const handleTypeSelect = (type: (typeof POST_TYPES)[number]) => {
    setSelectedPostType(type.id);
    setActiveCategory(type.category);
    if (type.starter && !prompt.trim()) {
      setPrompt(type.starter);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await creativeService.uploadImage(file);
      setUploadedImageId(res.id);
      setUploadedImageUrl(res.url);
      setUploadedVideoName(null);
    } catch {
      addToast({ type: 'error', title: 'Upload failed', message: 'Image upload failed. Try again.' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await creativeService.uploadVideo(file);
      setUploadedVideoName(file.name);
      setUploadedImageId(null);
      setUploadedImageUrl(null);
    } catch {
      addToast({ type: 'error', title: 'Upload failed', message: 'Video upload failed. Try again.' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const clearMedia = () => {
    setUploadedImageId(null);
    setUploadedImageUrl(null);
    setUploadedVideoName(null);
  };

  const generateImagesForVariants = (captions: CaptionVariant[], currentPrompt: string) => {
    setIsGeneratingImages(true);
    setAiImageUrls([null, null, null]);
    const slots = captions.slice(0, 3);
    Promise.allSettled(
      slots.map((v) => generateImage(v.caption_text, currentPrompt)),
    ).then((results) => {
      setAiImageUrls(results.map((r) => (r.status === 'fulfilled' ? r.value : null)));
      setIsGeneratingImages(false);
    });
  };

  const handleGenerate = async (force = false) => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    if (!force) { setVariants(null); setPublished(false); setAiImageUrls([null, null, null]); }
    try {
      const res = await creativeService.generateCaptions(
        prompt, selectedPlatforms, uploadedImageId ?? undefined, force,
      );
      setVariants(res);
      setSelectedVariant(0);
      setCaption(res.captions[0]?.caption_text ?? '');
      // Fire image generation in parallel — images sync with captions
      generateImagesForVariants(res.captions, prompt);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Generation failed', message: 'Could not generate captions. Check API logs.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariantSelect = (idx: number) => {
    setSelectedVariant(idx);
    setCaption(variants?.captions[idx]?.caption_text ?? '');
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
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
        captionHashtags: currentCaptionObj?.hashtags ?? [],
        creativeUrls: (currentCreative?.platform_urls as Record<string, string>) ?? {},
        platforms: selectedPlatforms,
      });
      await postService.publish(res.item.id, selectedPlatforms);
      setPublished(true);
      addToast({ type: 'success', title: 'Post published!', message: 'Your post is live on the selected platforms.' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Publish failed', message: 'Could not publish. Please try again.' });
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
        captionHashtags: currentCaptionObj?.hashtags ?? [],
        creativeUrls: (currentCreative?.platform_urls as Record<string, string>) ?? {},
        platforms: selectedPlatforms,
      });
      await postService.schedule(res.item.id, selectedPlatforms, new Date(scheduleTime).toISOString());
      setShowScheduleModal(false);
      setPublished(true);
      addToast({ type: 'success', title: 'Post scheduled!', message: 'Your post will be published at the selected time.' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Schedule failed', message: 'Could not schedule. Please try again.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const currentVariant = variants ? variants.captions[selectedVariant] : null;
  const currentCreative = variants ? variants.creatives[selectedVariant] : null;
  const charLimitMap: Record<string, number> = { google: 1500, facebook: 63206, instagram: 2200 };
  const charLimit = charLimitMap[activePlatformPreview] ?? 2200;
  const activeChips = PROMPT_CHIPS[activeCategory] ?? [];

  if (published) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-extrabold text-stone-900">Post Published!</h3>
          <p className="text-stone-500 text-sm mt-2">Your post has been queued to {selectedPlatforms.join(', ')}</p>
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => { setVariants(null); setPrompt(''); setPublished(false); setSelectedPostType(null); }}
              className="px-4 py-2 text-sm font-semibold text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Create Another
            </button>
            <NavLink to="/calendar" className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors">
              View Calendar
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-stone-200 shrink-0">
        <NavLink to="/" className="text-stone-400 hover:text-stone-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </NavLink>
        <span className="text-stone-300 text-sm">/</span>
        <span className="text-stone-400 text-sm">Create Post</span>
        <span className="text-stone-300 text-sm">/</span>
        <span className="font-semibold text-stone-900 text-sm">
          {selectedPostType ? POST_TYPES.find((t) => t.id === selectedPostType)?.label ?? 'Edit Post' : 'New Post'}
        </span>
        {variants && (
          <span className="ml-auto flex items-center gap-1 text-xs text-stone-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Auto-saved
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Post Type Sidebar ── */}
        <div className="w-60 border-r border-stone-200 bg-white flex flex-col overflow-y-auto shrink-0">
          <div className="p-4">
            <p className="text-[11px] font-extrabold text-stone-500 uppercase tracking-widest mb-1">Post Type</p>
            <p className="text-[11px] text-stone-400 mb-3">Choose what you want to share</p>
            <div className="space-y-1.5">
              {POST_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedPostType === type.id
                      ? 'border-orange-200 bg-orange-50 shadow-sm'
                      : 'border-transparent hover:bg-stone-50 hover:border-stone-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${type.bg}`}>
                    <type.icon className={`w-4 h-4 ${type.color}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${selectedPostType === type.id ? 'text-orange-700' : 'text-stone-800'}`}>
                      {type.label}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{type.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea + generate */}
          <div className="px-4 py-3 border-t border-stone-100">
            <p className="text-[11px] font-semibold text-stone-500 mb-2">Or describe your post</p>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Weekend discount on Baleno..."
                className="w-full h-20 p-3 pr-11 text-xs border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 bg-stone-50 placeholder:text-stone-400"
                maxLength={500}
              />
              <button
                onClick={() => handleGenerate(false)}
                disabled={!prompt.trim() || isGenerating}
                className="absolute bottom-2.5 right-2.5 w-7 h-7 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
            {/* Quick chip prompts */}
            {activeChips.length > 0 && (
              <div className="mt-2 space-y-1">
                {activeChips.slice(0, 2).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="w-full text-left text-[10px] px-2.5 py-2 rounded-lg border border-stone-100 bg-stone-50 hover:bg-orange-50 hover:border-orange-200 transition-colors line-clamp-2 text-stone-500"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Media upload */}
          <div className="px-4 py-3 border-t border-stone-100">
            <p className="text-[11px] font-semibold text-stone-500 mb-2">Add Photo / Video</p>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            {uploadedImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-stone-200">
                <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-24 object-cover" />
                <button onClick={clearMedia} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : uploadedVideoName ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50">
                <Video className="w-5 h-5 text-teal-500 flex-shrink-0" />
                <p className="text-xs text-stone-600 truncate flex-1">{uploadedVideoName}</p>
                <button onClick={clearMedia}><X className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-stone-400 hover:text-orange-600 disabled:opacity-40"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{isUploading ? 'Uploading...' : 'Photo'}</span>
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-stone-400 hover:text-orange-600 disabled:opacity-40"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{isUploading ? 'Uploading...' : 'Video'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Upcoming event chip */}
          <div className="px-4 py-3 border-t border-stone-100 mt-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest mb-1.5">UPCOMING</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Republic Day — Jan 26</p>
                  <p className="text-[10px] text-stone-400">Festival post ready</p>
                </div>
              </div>
              <button
                onClick={() => { setPrompt('Republic Day special offer — Celebrate Republic Day with exclusive patriotic discounts and deals at our showroom.'); setSelectedPostType('festival'); }}
                className="text-[11px] text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Use this template →
              </button>
            </div>
          </div>
        </div>

        {/* ── Center: Editor ── */}
        <div className="flex-1 overflow-y-auto bg-[#F5F0EA] p-5 space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">Create Post</h2>
            <p className="text-sm text-stone-400 mt-0.5">Design your post and publish in one click</p>
          </div>

          {/* Choose Template */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-stone-900">Choose Template</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Pick a design for your{' '}
                  {selectedPostType
                    ? `"${POST_TYPES.find((t) => t.id === selectedPostType)?.label}"`
                    : ''}{' '}
                  post
                </p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold hover:text-orange-700">
                <ChevronUp className="w-3.5 h-3.5" /> Upload Custom
              </button>
            </div>

            {isGenerating ? (
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-stone-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {TEMPLATE_THEMES.map((theme, i) => {
                  const creative = variants?.creatives[i];
                  const aiImg = i < 3 ? aiImageUrls[i] : null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleVariantSelect(i)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        selectedVariant === i
                          ? 'border-orange-500 shadow-lg shadow-orange-100'
                          : 'border-transparent hover:border-stone-300'
                      }`}
                    >
                      {aiImg ? (
                        <img src={aiImg} alt={theme.label} className="w-full aspect-square object-cover" />
                      ) : isGeneratingImages && i < 3 ? (
                        <div className={`aspect-square bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                          <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
                        </div>
                      ) : creative?.thumbnail_url ? (
                        <img src={creative.thumbnail_url} alt={theme.label} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className={`aspect-square bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center p-2.5`}>
                          <p className="text-white/50 text-[7px] font-bold uppercase tracking-widest mb-1.5">{theme.sub}</p>
                          <div className={`${theme.accent} rounded px-2 py-1 mb-1.5`}>
                            <p className="text-white text-[9px] font-bold">{theme.label}</p>
                          </div>
                          <div className="w-full h-0.5 bg-white/20 rounded mb-1.5" />
                          <div className="w-3/4 h-0.5 bg-white/10 rounded" />
                        </div>
                      )}
                      {selectedVariant === i && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                        <p className="text-white text-[9px] font-semibold">{theme.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Caption & Hashtags — shows after generation */}
          {currentVariant ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-stone-900">Caption &amp; Hashtags</h3>
                  <p className="text-xs text-stone-400 mt-0.5">AI-generated in Hinglish tone — edit as needed</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] bg-teal-100 text-teal-700 font-bold px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> AI Generated
                  </span>
                  <button
                    onClick={() => handleGenerate(true)}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-semibold transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
                  </button>
                </div>
              </div>

              {/* Tone selector */}
              <div className="flex gap-2 mb-3">
                {(['hinglish', 'english', 'hindi'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setToneActive(tone)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors capitalize ${
                      toneActive === tone
                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : 'text-stone-500 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {tone === 'hinglish' ? 'Hinglish 🇮🇳' : tone === 'english' ? 'English' : 'Hindi'}
                  </button>
                ))}
              </div>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full h-28 p-3.5 border border-stone-200 rounded-xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 leading-relaxed"
                maxLength={charLimit}
              />
              <div className="flex items-center justify-between mt-1.5 mb-4">
                <div className="flex items-center gap-2 text-stone-400">
                  <button className="hover:text-stone-600 transition-colors">😊</button>
                  <button className="text-xs hover:text-stone-600 transition-colors font-medium">A→</button>
                </div>
                <span className="text-xs text-stone-400">{caption.length} / {charLimit}</span>
                <span className="text-xs text-teal-600 font-semibold">✓ Hinglish Tone</span>
              </div>

              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-extrabold text-stone-500 uppercase tracking-widest">Hashtags</p>
                <button className="text-xs text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Suggest More
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(currentVariant.hashtags ?? []).map((h) => (
                  <span key={h} className="flex items-center gap-1 bg-stone-100 text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-stone-200 transition-colors cursor-default">
                    {h}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors" onClick={() => {}} />
                  </span>
                ))}
              </div>
            </div>
          ) : !isGenerating && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-10 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <p className="font-semibold text-stone-700">Enter a prompt to generate AI captions</p>
              <p className="text-sm text-stone-400 mt-1">Pick a post type or type your idea in the sidebar</p>
            </div>
          )}

          {/* Publish to */}
          {currentVariant && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-3">Publish To</h3>
              <div className="space-y-2">
                {PLATFORMS.map(({ id, label, icon: Icon, color, bg, border }) => (
                  <button
                    key={id}
                    onClick={() => togglePlatform(id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      selectedPlatforms.includes(id)
                        ? `${bg} ${border}`
                        : 'bg-white border-stone-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-semibold text-stone-700">{label}</span>
                    </div>
                    {selectedPlatforms.includes(id) && <Check className="w-4 h-4 text-teal-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="w-72 border-l border-stone-200 bg-white flex flex-col overflow-hidden shrink-0">
          {/* Preview header */}
          <div className="px-4 py-3.5 border-b border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-stone-900">Live Preview</p>
            </div>
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
              {(['google', 'facebook', 'instagram'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePlatformPreview(p)}
                  className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all capitalize ${
                    activePlatformPreview === p
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {p === 'google' ? 'Google' : p === 'facebook' ? 'Facebook' : 'Instagram'}
                </button>
              ))}
            </div>
          </div>

          {/* Post preview mockup */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
              {/* Platform header */}
              <div className="flex items-center gap-2.5 p-3 border-b border-stone-100 bg-white">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  RM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900">Rajesh Motors</p>
                  <p className="text-[10px] text-stone-400">
                    Just now •{' '}
                    {activePlatformPreview === 'google'
                      ? 'Google My Business'
                      : activePlatformPreview === 'facebook'
                      ? 'Facebook'
                      : 'Instagram Business'}
                  </p>
                </div>
              </div>

              {/* Creative preview — AI image takes priority over template thumbnail */}
              {aiImageUrls[selectedVariant] ? (
                <div className="relative">
                  <img src={aiImageUrls[selectedVariant]!} alt="AI Generated" className="w-full aspect-square object-cover" />
                  <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                </div>
              ) : isGeneratingImages ? (
                <div className="w-full aspect-square bg-stone-100 flex flex-col items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
                  <p className="text-[10px] text-stone-400 font-semibold">Generating image...</p>
                </div>
              ) : currentCreative?.thumbnail_url ? (
                <img src={currentCreative.thumbnail_url} alt="Creative" className="w-full aspect-square object-cover" />
              ) : (
                <div
                  className={`w-full aspect-square bg-gradient-to-br ${
                    TEMPLATE_THEMES[selectedVariant]?.gradient ?? 'from-stone-900 to-stone-800'
                  } flex flex-col items-center justify-center p-4`}
                >
                  <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-2">
                    {POST_TYPES.find((t) => t.id === selectedPostType)?.label ?? 'Post Preview'}
                  </p>
                  <p className="text-white text-sm font-bold text-center leading-snug mb-3 px-2">
                    {prompt.slice(0, 40) || 'Your post will appear here'}
                  </p>
                  <div className="bg-orange-600 rounded-full px-3 py-1">
                    <p className="text-white text-[10px] font-bold">Rajesh Motors</p>
                  </div>
                </div>
              )}

              {/* Caption preview */}
              {caption && (
                <div className="p-3">
                  <p className="text-xs text-stone-700 line-clamp-3 leading-relaxed">{caption}</p>
                  {currentVariant && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {currentVariant.hashtags.slice(0, 3).map((h) => (
                        <span key={h} className="text-[10px] text-orange-600 font-semibold">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Platform actions bar */}
              <div className="px-3 py-2 border-t border-stone-100 flex items-center gap-3">
                {activePlatformPreview === 'instagram' ? (
                  <>
                    <span className="text-stone-400 text-sm">♡</span>
                    <span className="text-stone-400 text-sm">○</span>
                    <span className="text-stone-400 text-sm">↗</span>
                    <span className="ml-auto text-stone-400 text-sm">⊡</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-stone-400">👍 Like</span>
                    <span className="text-[10px] text-stone-400">💬 Comment</span>
                    <span className="text-[10px] text-stone-400">↗ Share</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="p-4 border-t border-stone-100">
            <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-3">Connected Accounts</p>
            <div className="space-y-2.5">
              {[
                { name: 'Rajesh Motors — GMB', sub: 'Google My Business', color: '#4285F4' },
                { name: 'Rajesh Motors Official', sub: 'Facebook Page', color: '#1877F2' },
                { name: '@rajeshmotors_official', sub: 'Instagram Business', color: '#E1306C' },
              ].map((acc) => (
                <div key={acc.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${acc.color}20` }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: acc.color }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-stone-800 leading-tight">{acc.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[10px] text-green-600 font-semibold">Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-stone-100 space-y-2">
            {currentVariant ? (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={handlePublishNow}
                    disabled={isPublishing || selectedPlatforms.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    {isPublishing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Send className="w-3.5 h-3.5" /> Post Everywhere</>
                    )}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    disabled={selectedPlatforms.length === 0}
                    className="flex-1 text-sm font-semibold text-stone-700 border border-stone-200 rounded-xl py-2 hover:bg-stone-50 disabled:opacity-50 transition-colors"
                  >
                    Save Draft
                  </button>
                  <button className="w-10 h-10 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-center text-stone-500 transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-center transition-colors" title="Boost">
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleGenerate(false)}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
              >
                {isGenerating ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate with AI</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-stone-900">Schedule Post</h3>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Date &amp; Time</label>
              <input
                type="datetime-local"
                className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
              <strong>Best time:</strong> Tomorrow, 9:00 AM — based on your audience engagement patterns
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSchedule}
                disabled={isPublishing || !scheduleTime}
                className="flex-1 py-2.5 text-sm font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                {isPublishing ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
