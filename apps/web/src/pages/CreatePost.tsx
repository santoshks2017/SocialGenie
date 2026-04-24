import { useState, useEffect, useRef } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { creativeService, postService } from '../services/creative';
import type { AIGenerationResponse, CaptionVariant } from '../services/creative';
import { useToast } from '../components/ui/Toast';
import { generateBrandedCreative } from '../services/imageGeneration';
import {
  Tag, Sparkles, Heart, Gift, PenLine,
  ArrowLeft, RefreshCw, Check, ImagePlus, Video, X,
  Send, Download, Zap, Globe, Calendar, Film, Clock, Wand2,
} from 'lucide-react';
import api from '../services/api';

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

// ─── Data ─────────────────────────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'offer',    icon: Tag,     label: "Today's Offer",     color: 'text-orange-600', bg: 'bg-orange-50',  activeBg: 'bg-orange-600',  category: 'Festival Offer', starter: 'Special weekend offer — ' },
  { id: 'arrival',  icon: Sparkles,label: 'New Arrival',       color: 'text-teal-600',   bg: 'bg-teal-50',    activeBg: 'bg-teal-600',    category: 'New Arrival',   starter: 'New vehicle just arrived — ' },
  { id: 'delivery', icon: Heart,   label: 'Delivery Post',     color: 'text-pink-600',   bg: 'bg-pink-50',    activeBg: 'bg-pink-600',    category: 'Testimonial',   starter: 'Happy delivery to our valued customer — ' },
  { id: 'festival', icon: Gift,    label: 'Festival Post',     color: 'text-purple-600', bg: 'bg-purple-50',  activeBg: 'bg-purple-600',  category: 'Festival Offer', starter: 'Celebrate this festival with us — ' },
  { id: 'custom',   icon: PenLine, label: 'Custom',            color: 'text-stone-600',  bg: 'bg-stone-100',  activeBg: 'bg-stone-700',   category: 'Engagement',    starter: '' },
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
  { id: 'facebook',  label: 'Facebook',          icon: FbIcon,  color: 'text-[#1877F2]', dot: 'bg-[#1877F2]' },
  { id: 'instagram', label: 'Instagram',          icon: IgIcon,  color: 'text-pink-500',  dot: 'bg-pink-500' },
  { id: 'gmb',       label: 'Google My Business', icon: Globe,   color: 'text-[#4285F4]', dot: 'bg-[#4285F4]' },
] as const;

const TEMPLATE_THEMES = [
  { label: 'Bold Banner',   gradient: 'from-stone-900 to-stone-800',   accent: 'bg-orange-600',  sub: "TODAY'S OFFER" },
  { label: 'Minimal',       gradient: 'from-orange-600 to-orange-500', accent: 'bg-white/20',     sub: 'SPECIAL DEAL' },
  { label: 'Offer Card',    gradient: 'from-teal-700 to-teal-600',     accent: 'bg-white/20',     sub: 'LIMITED TIME' },
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
  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([false, false, false]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // AI Video mode
  const isVideoMode = searchParams.get('mode') === 'video';
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState(15);
  const [videoAspect, setVideoAspect] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [_videoStyle, _setVideoStyle] = useState<'cinematic' | 'dynamic' | 'minimal'>('cinematic');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoImageId, setVideoImageId] = useState<string | null>(null);
  const [videoImageUrl, setVideoImageUrl] = useState<string | null>(null);
  const [uploadingVideoImage, setUploadingVideoImage] = useState(false);
  const videoImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => { creativeService.getPrompts().catch(console.error); }, []);
  useEffect(() => { const p = searchParams.get('prompt'); if (p) setPrompt(p); }, [searchParams]);

  const handleTypeSelect = (type: (typeof POST_TYPES)[number]) => {
    setSelectedPostType(type.id);
    setActiveCategory(type.category);
    if (type.starter && !prompt.trim()) setPrompt(type.starter);
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

  const clearMedia = () => { setUploadedImageId(null); setUploadedImageUrl(null); setUploadedVideoName(null); };

  const generateImagesForVariants = (captions: CaptionVariant[], currentPrompt: string) => {
    const slots = captions.slice(0, 3);
    setAiImageUrls([null, null, null]);
    setImageLoadingStates([true, true, true]);
    setIsGeneratingImages(true);
    let pending = slots.length;
    slots.forEach((v, i) => {
      generateBrandedCreative(v.caption_text, currentPrompt, i)
        .then((url) => { setAiImageUrls((prev) => { const n = [...prev]; n[i] = url; return n; }); })
        .catch(() => {})
        .finally(() => {
          setImageLoadingStates((prev) => { const n = [...prev]; n[i] = false; return n; });
          pending -= 1;
          if (pending === 0) setIsGeneratingImages(false);
        });
    });
  };

  const handleGenerate = async (force = false) => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    if (!force) {
      setVariants(null);
      setPublished(false);
      setAiImageUrls([null, null, null]);
      setImageLoadingStates([false, false, false]);
    }
    try {
      const res = await creativeService.generateCaptions(prompt, selectedPlatforms, uploadedImageId ?? undefined, force);
      setVariants(res);
      setSelectedVariant(0);
      setCaption(res.captions[0]?.caption_text ?? '');
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
    setSelectedPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handlePublishNow = async () => {
    if (!variants) return;
    setIsPublishing(true);
    try {
      const cap = variants.captions[selectedVariant];
      const cre = variants.creatives[selectedVariant];
      const res = await postService.create({
        promptText: prompt,
        captionText: caption,
        captionHashtags: cap?.hashtags ?? [],
        creativeUrls: (cre?.platform_urls as Record<string, string>) ?? {},
        platforms: selectedPlatforms,
      });
      await postService.publish(res.item.id, selectedPlatforms);
      setPublished(true);
      addToast({ type: 'success', title: 'Post published!', message: 'Your post is live on selected platforms.' });
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
      const cap = variants.captions[selectedVariant];
      const cre = variants.creatives[selectedVariant];
      const res = await postService.create({
        promptText: prompt,
        captionText: caption,
        captionHashtags: cap?.hashtags ?? [],
        creativeUrls: (cre?.platform_urls as Record<string, string>) ?? {},
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

  const handleVideoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideoImage(true);
    try {
      const res = await creativeService.uploadImage(file);
      setVideoImageId(res.id);
      setVideoImageUrl(res.url);
    } catch {
      addToast({ type: 'error', title: 'Upload failed', message: 'Could not upload image. Try again.' });
    } finally {
      setUploadingVideoImage(false);
      e.target.value = '';
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setGeneratingVideo(true);
    setVideoJobId(null);
    setVideoUrl(null);
    try {
      const res = await api.post<{ success: boolean; video_url?: string; job_id?: string; status?: string; message?: string }>('/creatives/generate-video', {
        prompt: videoPrompt,
        image_id: videoImageId ?? undefined,
        duration_seconds: videoDuration,
        aspect_ratio: videoAspect,
      });
      if (res.video_url) {
        setVideoUrl(res.video_url);
        addToast({ type: 'success', title: 'Video ready!', message: `Your ${videoDuration}s video has been generated.` });
      } else if (res.job_id) {
        setVideoJobId(res.job_id);
        addToast({ type: 'success', title: 'Video queued', message: res.message ?? 'Video is being processed.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Video generation failed', message: 'Could not generate video. Please try again.' });
    } finally {
      setGeneratingVideo(false);
    }
  };

  const currentVariant = variants ? variants.captions[selectedVariant] : null;
  const charLimitMap: Record<string, number> = { google: 1500, facebook: 63206, instagram: 2200 };
  const charLimit = charLimitMap[activePlatformPreview] ?? 2200;
  const activeChips = PROMPT_CHIPS[activeCategory] ?? [];

  // ─── Published success screen ─────────────────────────────────────────────
  if (published) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F0EA]">
        <div className="text-center bg-white rounded-2xl border border-stone-200 p-10 shadow-sm max-w-sm w-full mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-extrabold text-stone-900">Post Published!</h3>
          <p className="text-stone-500 text-sm mt-2">Queued to {selectedPlatforms.join(', ')}</p>
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => { setVariants(null); setPrompt(''); setPublished(false); setSelectedPostType(null); }}
              className="px-4 py-2.5 text-sm font-semibold text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Create Another
            </button>
            <NavLink to="/calendar" className="px-4 py-2.5 text-sm font-semibold bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors">
              View Calendar
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  // ─── AI Video Mode ────────────────────────────────────────────────────────
  if (isVideoMode) {
    return (
      <div className="h-full flex flex-col overflow-y-auto bg-[#f1f5f9]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 shrink-0">
          <NavLink to="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-gray-400 text-sm">Create</span>
          <span className="text-gray-300 text-sm">/</span>
          <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
            <Film className="w-4 h-4 text-orange-500" /> AI Video
          </span>
          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 uppercase tracking-wide">Coming Soon</span>
        </div>

        <div className="flex-1 p-5 md:p-7 max-w-2xl mx-auto w-full space-y-5">
          {/* Intro card */}
          <div className="bg-gradient-to-br from-[#0f1117] to-[#1a1f2e] rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI Video Generation</h2>
                <p className="text-gray-400 text-sm mt-1">Create short-form videos for Reels and Stories directly from a text description. Our AI turns your concept into a ready-to-post automotive video.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Instagram Reels', 'Facebook Stories', 'YouTube Shorts'].map((p) => (
                    <span key={p} className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-gray-300">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Video Concept</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Diwali offer — new Hyundai Creta, ₹50,000 discount, limited period"
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {/* Optional image upload */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Base Image (optional)</label>
              <input ref={videoImageRef} type="file" accept="image/*" className="hidden" onChange={handleVideoImageUpload} />
              {videoImageUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <img src={videoImageUrl} alt="Base" className="w-14 h-14 rounded-lg object-cover border" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Image uploaded</p>
                    <p className="text-xs text-gray-400">Will be used as the video background</p>
                  </div>
                  <button onClick={() => { setVideoImageId(null); setVideoImageUrl(null); }} className="p-1.5 text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => videoImageRef.current?.click()}
                  disabled={uploadingVideoImage}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-400 hover:text-orange-600 text-sm font-medium transition-colors disabled:opacity-50 w-full justify-center"
                >
                  <ImagePlus className="w-4 h-4" />
                  {uploadingVideoImage ? 'Uploading…' : 'Upload car photo (or we\'ll generate a background)'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duration</label>
                <div className="flex gap-2">
                  {[15, 30, 60].map((s) => (
                    <button key={s} onClick={() => setVideoDuration(s)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${videoDuration === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                    >{s}s</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Format</label>
                <div className="flex gap-2">
                  {(['9:16', '1:1', '16:9'] as const).map((r) => (
                    <button key={r} onClick={() => setVideoAspect(r)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${videoAspect === r ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                    >{r}</button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={!videoPrompt.trim() || generatingVideo}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingVideo ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Generating video… ({videoDuration}s)</>
              ) : (
                <><Wand2 className="w-4 h-4" /> Generate Video</>
              )}
            </button>
            {generatingVideo && (
              <p className="text-xs text-center text-gray-400">
                FFmpeg is rendering your video — usually takes {Math.round(videoDuration * 1.5)}–{Math.round(videoDuration * 3)}s
              </p>
            )}
          </div>

          {/* Generated video player */}
          {videoUrl && (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-gray-800">Video Ready — {videoDuration}s · {videoAspect}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={videoUrl}
                    download={`socialgenie-video-${Date.now()}.mp4`}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button
                    onClick={() => { setVideoUrl(null); setVideoJobId(null); }}
                    className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    New Video
                  </button>
                </div>
              </div>
              <div className="flex justify-center bg-black p-4">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className={`max-h-[480px] rounded-lg ${videoAspect === '9:16' ? 'max-w-[270px]' : videoAspect === '1:1' ? 'max-w-[480px]' : 'w-full'}`}
                />
              </div>
              <div className="px-5 py-4 bg-gray-50 border-t">
                <p className="text-xs text-gray-500 font-medium mb-2">Share to</p>
                <div className="flex gap-2">
                  {[
                    { label: 'Instagram Reels', color: 'bg-pink-500' },
                    { label: 'Facebook Story', color: 'bg-blue-600' },
                    { label: 'WhatsApp Status', color: 'bg-green-500' },
                  ].map((p) => (
                    <button key={p.label} className={`${p.color} text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity`}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Connect Facebook/Instagram in Settings → Platforms to publish directly</p>
              </div>
            </div>
          )}

          {/* Queued state (fallback if no video_url returned) */}
          {videoJobId && !videoUrl && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-800">Video queued</h3>
              <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg">Job ID: {videoJobId}</p>
              <button onClick={() => setVideoJobId(null)} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                Generate another
              </button>
            </div>
          )}

          {/* Inspiration chips */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Video Ideas for Indian Dealers</p>
            <div className="space-y-2">
              {[
                'Festive Diwali offer video — new Creta with fireworks + ₹50,000 discount in 15 seconds',
                'Customer delivery celebration — handover moment, family joy, showroom branding',
                'New model arrival teaser — cinematic reveal of Nexon EV in showroom with dramatic lighting',
                'Comparison video — Petrol vs EV for Indian family, dynamic cuts between both cars',
              ].map((idea) => (
                <button
                  key={idea}
                  onClick={() => setVideoPrompt(idea)}
                  className="w-full text-left text-sm text-gray-600 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-700 transition-colors border border-transparent hover:border-orange-200"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F0EA]">

      {/* ── Top breadcrumb bar ── */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-stone-200 shrink-0">
        <NavLink to="/" className="text-stone-400 hover:text-stone-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </NavLink>
        <span className="text-stone-300 text-sm">/</span>
        <span className="text-stone-900 text-sm font-semibold">Create Post</span>
        {variants && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-stone-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Auto-saved
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT PANEL — inputs + generated post content (scrollable)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="w-[520px] shrink-0 bg-white border-r border-stone-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* 1 ── Post Type */}
            <section>
              <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-3">Post type</p>
              <div className="grid grid-cols-5 gap-2">
                {POST_TYPES.map((type) => {
                  const active = selectedPostType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                        active ? 'border-orange-300 bg-orange-50 shadow-sm' : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-orange-100' : type.bg}`}>
                        <type.icon className={`w-4 h-4 ${active ? 'text-orange-600' : type.color}`} />
                      </div>
                      <p className={`text-[10px] font-semibold leading-tight text-center ${active ? 'text-orange-700' : 'text-stone-600'}`}>
                        {type.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2 ── Prompt + suggestions */}
            <section>
              <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-3">Describe your post</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Diwali special — ₹50,000 discount on all Hyundai models this festive season…"
                className="w-full h-24 p-4 text-sm border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 bg-stone-50 placeholder:text-stone-400 leading-relaxed"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-stone-400">{prompt.length} / 500</span>
                {prompt.trim() && (
                  <button onClick={() => setPrompt('')} className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors">Clear</button>
                )}
              </div>
              {activeChips.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Quick suggestions</p>
                  {activeChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setPrompt(chip)}
                      className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-stone-100 bg-stone-50 hover:bg-orange-50 hover:border-orange-200 transition-colors text-stone-600 truncate"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* 3 ── Media */}
            <section>
              <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-3">
                Add media <span className="normal-case font-normal">(optional)</span>
              </p>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              {uploadedImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-stone-200 group">
                  <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-32 object-cover" />
                  <button onClick={clearMedia} className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-[10px] text-white/80 font-semibold bg-black/40 px-2 py-0.5 rounded-full">Photo attached</span>
                </div>
              ) : uploadedVideoName ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
                  <Video className="w-5 h-5 text-teal-500 shrink-0" />
                  <p className="text-xs text-stone-600 truncate flex-1">{uploadedVideoName}</p>
                  <button onClick={clearMedia}><X className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => imageInputRef.current?.click()} disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-stone-400 hover:text-orange-600 disabled:opacity-40 text-sm font-medium">
                    <ImagePlus className="w-4 h-4" /> {isUploading ? 'Uploading…' : 'Photo'}
                  </button>
                  <button onClick={() => videoInputRef.current?.click()} disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-stone-400 hover:text-orange-600 disabled:opacity-40 text-sm font-medium">
                    <Video className="w-4 h-4" /> {isUploading ? 'Uploading…' : 'Video'}
                  </button>
                </div>
              )}
            </section>

            {/* 4 ── Platforms */}
            <section>
              <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-3">Publish to</p>
              <div className="flex gap-2">
                {PLATFORMS.map(({ id, label, icon: Icon, color, dot }) => (
                  <button key={id} onClick={() => togglePlatform(id)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all ${
                      selectedPlatforms.includes(id) ? 'border-stone-300 bg-stone-50' : 'border-stone-100 opacity-40 hover:opacity-70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                    <div className="flex items-center gap-1">
                      {selectedPlatforms.includes(id) && <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                      <span className="text-[10px] font-semibold text-stone-600">{id === 'gmb' ? 'Google' : label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Generated content — shown after AI generation ── */}
            {(variants || isGenerating) && (
              <div className="border-t border-stone-100 pt-5 space-y-4">

                {/* Caption variant tabs */}
                {isGenerating ? (
                  <div className="space-y-3">
                    <div className="h-3 w-28 bg-stone-100 rounded animate-pulse" />
                    <div className="h-28 bg-stone-100 rounded-xl animate-pulse" />
                    <div className="flex gap-2">
                      {[0,1,2,3].map(i => <div key={i} className="h-6 w-20 bg-stone-100 rounded-full animate-pulse" />)}
                    </div>
                  </div>
                ) : variants && (
                  <>
                    {/* Style tabs */}
                    <div>
                      <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-2">Caption style</p>
                      <div className="flex gap-1.5">
                        {variants.captions.map((v, i) => (
                          <button key={i} onClick={() => handleVariantSelect(i)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                              selectedVariant === i
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'
                            }`}
                          >
                            {v.style ? v.style.charAt(0).toUpperCase() + v.style.slice(1) : `Style ${i + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Caption editor */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest">Caption</p>
                          <span className="text-[10px] bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                        </div>
                        <div className="flex gap-1 bg-stone-100 p-0.5 rounded-lg">
                          {(['hinglish', 'english', 'hindi'] as const).map((tone) => (
                            <button key={tone} onClick={() => setToneActive(tone)}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors capitalize ${
                                toneActive === tone ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                              }`}>
                              {tone === 'hinglish' ? 'Hinglish' : tone === 'english' ? 'EN' : 'हिं'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full h-32 p-3.5 border border-stone-200 rounded-xl text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 leading-relaxed"
                        maxLength={charLimit}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[11px] text-stone-400">{caption.length} / {charLimit}</span>
                        <span className="text-[11px] text-stone-400 capitalize">{activePlatformPreview} limit</span>
                      </div>
                    </div>

                    {/* Hashtags */}
                    {currentVariant && (
                      <div>
                        <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest mb-2">Hashtags</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {currentVariant.hashtags.map((h) => (
                            <span key={h} className="bg-stone-100 text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-full">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Design thumbnails */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest">Design</p>
                        <button onClick={() => handleGenerate(true)}
                          className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-orange-600 font-semibold transition-colors">
                          <RefreshCw className={`w-3 h-3 ${isGeneratingImages ? 'animate-spin' : ''}`} /> Regenerate
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {TEMPLATE_THEMES.map((theme, i) => {
                          const aiImg = aiImageUrls[i] ?? null;
                          const loading = imageLoadingStates[i] ?? false;
                          return (
                            <button key={i} onClick={() => handleVariantSelect(i)}
                              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                                selectedVariant === i ? 'border-orange-500 shadow-md shadow-orange-100' : 'border-transparent hover:border-stone-300'
                              }`}
                            >
                              {aiImg ? (
                                <img src={aiImg} alt={theme.label} className="w-full aspect-square object-cover" />
                              ) : loading ? (
                                <div className={`aspect-square bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                                  <Sparkles className="w-4 h-4 text-white/70 animate-pulse" />
                                </div>
                              ) : (
                                <div className={`aspect-square bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                                  <div className={`${theme.accent} rounded px-1.5 py-0.5`}>
                                    <p className="text-white text-[8px] font-bold">{theme.label}</p>
                                  </div>
                                </div>
                              )}
                              {selectedVariant === i && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                                <p className="text-white text-[9px] font-semibold">{theme.label}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Publish actions */}
                    <div className="space-y-2 pb-2">
                      <button onClick={handlePublishNow} disabled={isPublishing || selectedPlatforms.length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-sm shadow-orange-200">
                        {isPublishing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Publishing…</> : <><Send className="w-4 h-4" /> Post Everywhere</>}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => setShowScheduleModal(true)} disabled={selectedPlatforms.length === 0}
                          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-stone-700 border border-stone-200 rounded-xl py-2.5 hover:bg-stone-50 disabled:opacity-50 transition-colors">
                          <Calendar className="w-3.5 h-3.5" /> Schedule
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-stone-700 border border-stone-200 rounded-xl py-2.5 hover:bg-stone-50 transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button className="flex items-center justify-center gap-1.5 px-3 text-sm font-semibold text-yellow-600 border border-yellow-200 bg-yellow-50 rounded-xl py-2.5 hover:bg-yellow-100 transition-colors">
                          <Zap className="w-3.5 h-3.5" /> Boost
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

          {/* Generate button — sticky at bottom */}
          {!variants && (
            <div className="p-4 border-t border-stone-100 bg-white shrink-0">
              <button onClick={() => handleGenerate(false)} disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-sm shadow-orange-200">
                {isGenerating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating with AI…</> : <><Sparkles className="w-4 h-4" /> Generate with AI</>}
              </button>
              {!prompt.trim() && (
                <p className="text-center text-[11px] text-stone-400 mt-2">Pick a post type and describe your post above</p>
              )}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT PANEL — live platform preview (fixed, non-scrolling)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F0EA]">

          {/* Platform tab switcher */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
            <p className="text-sm font-bold text-stone-700">Live Preview</p>
            <div className="flex gap-1 bg-white border border-stone-200 p-1 rounded-xl shadow-sm">
              {(['google', 'facebook', 'instagram'] as const).map((p) => (
                <button key={p} onClick={() => setActivePlatformPreview(p)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    activePlatformPreview === p ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
                  }`}>
                  {p === 'google' ? 'Google' : p === 'facebook' ? 'Facebook' : 'Instagram'}
                </button>
              ))}
            </div>
          </div>

          {/* Mockup card — centered */}
          <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 pb-6">
            <div className="w-full max-w-sm">
              {/* Social post card */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">

                {/* Post header */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-stone-100">
                  <div className="w-9 h-9 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">RM</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-stone-900 leading-none">Rajesh Motors</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Just now ·&nbsp;
                      {activePlatformPreview === 'google' ? 'Google My Business' : activePlatformPreview === 'facebook' ? 'Facebook' : 'Instagram'}
                    </p>
                  </div>
                  {activePlatformPreview === 'facebook' && (
                    <button className="text-[11px] font-bold text-[#1877F2] bg-[#e7f0fd] px-3 py-1 rounded-full">+ Follow</button>
                  )}
                </div>

                {/* Creative image */}
                <div className="relative bg-stone-100">
                  {aiImageUrls[selectedVariant] ? (
                    <>
                      <img src={aiImageUrls[selectedVariant]!} alt="Creative" className="w-full aspect-square object-cover" />
                      <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" /> AI Generated
                      </span>
                    </>
                  ) : imageLoadingStates[selectedVariant] ? (
                    <div className={`aspect-square bg-gradient-to-br ${TEMPLATE_THEMES[Math.min(selectedVariant, 2)]?.gradient ?? 'from-stone-900 to-stone-800'} flex flex-col items-center justify-center gap-2`}>
                      <Sparkles className="w-7 h-7 text-white/70 animate-pulse" />
                      <p className="text-sm text-white/60 font-semibold">Generating creative…</p>
                    </div>
                  ) : isGenerating ? (
                    <div className="aspect-square bg-stone-200 animate-pulse flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-stone-400 animate-pulse" />
                    </div>
                  ) : prompt ? (
                    <div className={`aspect-square bg-gradient-to-br ${TEMPLATE_THEMES[Math.min(selectedVariant, 2)]?.gradient ?? 'from-stone-900 to-stone-800'} flex flex-col items-center justify-center p-6`}>
                      <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
                        {POST_TYPES.find((t) => t.id === selectedPostType)?.label ?? 'Your Post'}
                      </p>
                      <p className="text-white text-sm font-bold text-center leading-snug max-w-[180px]">
                        {prompt.slice(0, 60)}{prompt.length > 60 ? '…' : ''}
                      </p>
                      <div className="mt-4 bg-orange-600 rounded-full px-4 py-1.5">
                        <p className="text-white text-xs font-bold">Rajesh Motors</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-stone-100 flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-stone-200 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-stone-400" />
                      </div>
                      <p className="text-sm text-stone-400 font-medium">Preview appears here</p>
                    </div>
                  )}
                </div>

                {/* Caption area */}
                <div className="px-4 py-3 border-t border-stone-100">
                  {caption ? (
                    <>
                      <p className="text-[13px] text-stone-800 leading-relaxed line-clamp-3">{caption}</p>
                      {currentVariant && currentVariant.hashtags.length > 0 && (
                        <p className="mt-1.5 text-[12px] text-orange-600 font-medium line-clamp-1">
                          {currentVariant.hashtags.slice(0, 4).join(' ')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[13px] text-stone-400 italic">Your caption will appear here…</p>
                  )}
                </div>

                {/* Platform action bar */}
                <div className="px-4 py-2.5 border-t border-stone-100 bg-stone-50">
                  {activePlatformPreview === 'instagram' ? (
                    <div className="flex items-center gap-4">
                      <span className="text-stone-500 text-lg">♡</span>
                      <span className="text-stone-500 text-lg">💬</span>
                      <span className="text-stone-500 text-lg">↗</span>
                      <span className="ml-auto text-stone-500 text-lg">⊡</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] text-stone-500 font-medium">👍 Like</span>
                      <span className="text-[12px] text-stone-500 font-medium">💬 Comment</span>
                      <span className="text-[12px] text-stone-500 font-medium">↗ Share</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Helper hint when no content yet */}
              {!variants && !isGenerating && (
                <div className="mt-5 flex flex-col gap-2 items-center text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-[10px]">1</span>
                    Pick a post type
                  </div>
                  <div className="w-px h-3 bg-stone-200" />
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-[10px]">2</span>
                    Describe your offer
                  </div>
                  <div className="w-px h-3 bg-stone-200" />
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-[10px]">3</span>
                    Generate with AI
                  </div>
                </div>
              )}
            </div>
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
              <input type="datetime-local"
                className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
              <strong>Best time:</strong> Tomorrow, 9:00 AM — based on your audience engagement patterns
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmSchedule} disabled={isPublishing || !scheduleTime}
                className="flex-1 py-2.5 text-sm font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition-colors">
                {isPublishing ? 'Scheduling…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
