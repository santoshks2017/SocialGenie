import { useState, useEffect } from 'react';
import { Search, Send, Edit3, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { inboxService, leadService } from '../services/inbox';

type Tag = 'lead' | 'complaint' | 'general' | 'spam';
type Platform = 'facebook' | 'instagram' | 'google';
type Sentiment = 'positive' | 'neutral' | 'negative';

interface Message {
  id: string;
  platform: Platform;
  type: 'comment' | 'dm' | 'review';
  customerName: string;
  customerInitials: string;
  text: string;
  timestamp: string;
  sentiment: Sentiment;
  tag: Tag;
  isRead: boolean;
  postContext?: string;
  suggestedReply: string;
  rating?: number;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1', platform: 'facebook', type: 'dm', customerName: 'Ramesh Kumar', customerInitials: 'RK',
    text: 'Hello, what is the on-road price of Hyundai Creta in Delhi? I am looking to buy next month.',
    timestamp: '10 min ago', sentiment: 'positive', tag: 'lead', isRead: false,
    suggestedReply: 'Hello Ramesh ji! Thank you for your interest in the Hyundai Creta. The on-road price in Delhi starts from ₹13.5 Lakhs (ex-showroom ₹10.99L + insurance + registration). I would love to share the exact breakdown for your preferred variant. Could you visit our showroom this weekend for a test drive? Call us: +91 98765 43210.',
  },
  {
    id: '2', platform: 'google', type: 'review', customerName: 'Priya Sharma', customerInitials: 'PS',
    text: 'Pathetic service! My car has been in service for 15 days and no one is giving proper updates. Very disappointed with Cardeko.',
    timestamp: '1 hour ago', sentiment: 'negative', tag: 'complaint', isRead: false, rating: 1,
    suggestedReply: 'Dear Priya ji, we sincerely apologise for your experience. This is not the standard of service we hold ourselves to. Our service manager will personally call you within the next 30 minutes to provide a full update and resolution. We value your trust in us and will make this right.',
  },
  {
    id: '3', platform: 'instagram', type: 'comment', customerName: 'Aakash Patel', customerInitials: 'AP',
    text: 'Wow beautiful car! Is the red color available in the top variant? What is the EMI for 5 years?',
    timestamp: '3 hours ago', sentiment: 'positive', tag: 'lead', isRead: true,
    postContext: 'Maruti Brezza Weekend Offer post',
    suggestedReply: 'Hi Aakash! Yes, the Brezza is absolutely stunning in red! The top variant (Alpha) is available. For a 5-year EMI at 9.5% interest, you would pay approximately ₹16,500/month with zero down payment. DM us or call +91 98765 43210 to book a test drive this weekend!',
  },
  {
    id: '4', platform: 'facebook', type: 'comment', customerName: 'Sunita Verma', customerInitials: 'SV',
    text: 'Great showroom! Very helpful staff. Bought my Nexon EV last month and loving every drive.',
    timestamp: '5 hours ago', sentiment: 'positive', tag: 'general', isRead: true,
    postContext: 'Customer Testimonial post',
    suggestedReply: 'Thank you so much Sunita ji! We are thrilled to hear you are loving your Nexon EV! Your trust means the world to us. We hope every drive brings you joy. Do not hesitate to reach out for any service needs. Happy driving!',
  },
  {
    id: '5', platform: 'google', type: 'review', customerName: 'Mohammed Iqbal', customerInitials: 'MI',
    text: 'Average experience. Sales team was helpful but delivery took longer than promised. Car is good though.',
    timestamp: '1 day ago', sentiment: 'neutral', tag: 'general', isRead: true, rating: 3,
    suggestedReply: 'Thank you for your honest feedback, Mohammed ji. We apologise for the delay in delivery — we understand how frustrating that can be. We are working to improve our delivery timelines. We are glad you are enjoying the car. Please do not hesitate to call us for any after-sales support.',
  },
  {
    id: '6', platform: 'instagram', type: 'comment', customerName: 'Win iPhone 15 FREE!!!', customerInitials: 'SP',
    text: 'CLICK HERE to WIN FREE iPhone 15! Limited offer! t.me/scam_link visit now!!!',
    timestamp: '2 days ago', sentiment: 'neutral', tag: 'spam', isRead: true,
    suggestedReply: '',
  },
];

const PLATFORM_STYLES: Record<Platform, { label: string; color: string; bg: string }> = {
  facebook: { label: 'Facebook', color: 'text-blue-700', bg: 'bg-blue-100' },
  instagram: { label: 'Instagram', color: 'text-pink-700', bg: 'bg-pink-100' },
  google: { label: 'Google', color: 'text-green-700', bg: 'bg-green-100' },
};

const TAG_STYLES: Record<Tag, string> = {
  lead: 'bg-green-100 text-green-700',
  complaint: 'bg-red-100 text-red-700',
  general: 'bg-blue-100 text-blue-700',
  spam: 'bg-gray-100 text-gray-500',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </div>
  );
}

export default function InboxPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selected, setSelected] = useState<Message | null>(messages[0] ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | Platform | Tag>('all');
  const [editingReply, setEditingReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [leadCreatedIds, setLeadCreatedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  useEffect(() => {
    inboxService.list({ pageSize: 50 }).then((res) => {
      if (res.items.length === 0) return;
      const mapped: Message[] = res.items.map((item) => ({
        id: item.id,
        platform: item.platform as Platform,
        type: item.messageType,
        customerName: item.customerName,
        customerInitials: item.customerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
        text: item.messageText,
        timestamp: new Date(item.receivedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        sentiment: (item.sentiment ?? 'neutral') as Sentiment,
        tag: (item.tag ?? 'general') as Tag,
        isRead: item.isRead,
        suggestedReply: item.aiSuggestedReply ?? '',
      }));
      setMessages(mapped);
      setSelected(mapped[0] ?? null);
    }).catch(console.error);
  }, []);

  const filtered = messages.filter((m) => {
    const matchSearch = !searchQuery || m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || m.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !m.isRead;
    if (['facebook','instagram','google'].includes(activeFilter)) return m.platform === activeFilter;
    return m.tag === activeFilter;
  });

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    setEditingReply(false);
    setReplyText(msg.suggestedReply);
    if (!msg.isRead) inboxService.markRead(msg.id).catch(console.error);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
  };

  const handleSend = () => {
    if (!selected) return;
    const text = editingReply ? replyText : selected.suggestedReply;
    inboxService.sendReply(selected.id, text).catch(console.error);
    setSentIds((prev) => new Set(prev).add(selected.id));
    setEditingReply(false);
  };

  const handleCreateLead = async () => {
    if (!selected) return;
    try {
      await leadService.create({
        customerName: selected.customerName,
        sourcePlatform: selected.platform as 'facebook' | 'instagram' | 'gmb',
        sourceMessageId: selected.id,
      });
      setLeadCreatedIds((prev) => new Set(prev).add(selected.id));
      addToast({ type: 'success', title: 'Lead created', message: `${selected.customerName} added to your leads.` });
    } catch {
      addToast({ type: 'error', title: 'Failed to create lead', message: 'Please try again.' });
    }
  };

  const handleMarkNotSpam = (id: string) => {
    inboxService.updateTag(id, 'general').catch(() => {
      addToast({ type: 'error', title: 'Failed to update tag' });
    });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, tag: 'general' } : m));
    if (selected?.id === id) setSelected((s) => s ? { ...s, tag: 'general' } : s);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Left panel — message list */}
      <div className="w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
        {/* Search + filters */}
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 flex-1">Inbox</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all','unread','facebook','instagram','google'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                  activeFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(['lead','complaint','general','spam'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                  activeFilter === t ? 'bg-blue-600 text-white border-blue-600' : `${TAG_STYLES[t]} border-transparent`
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No messages found</div>
          ) : filtered.map((msg) => {
            const ps = PLATFORM_STYLES[msg.platform];
            return (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${selected?.id === msg.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {msg.customerInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {msg.customerName}
                      </p>
                      {!msg.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{msg.text}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${ps.bg} ${ps.color}`}>
                        {ps.label}
                      </span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${TAG_STYLES[msg.tag]}`}>
                        {msg.tag}
                      </span>
                      <span className="text-[9px] text-gray-400 ml-auto">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — message thread */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Thread header */}
          <div className="px-5 py-3 border-b flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
              {selected.customerInitials}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{selected.customerName}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium ${PLATFORM_STYLES[selected.platform].color}`}>
                  via {PLATFORM_STYLES[selected.platform].label} {selected.type}
                </span>
                {selected.postContext && <span className="text-[10px] text-gray-400">· on "{selected.postContext}"</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {(['lead','complaint','general','spam'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { inboxService.updateTag(selected.id, t).catch(console.error); setMessages((prev) => prev.map((m) => m.id === selected.id ? { ...m, tag: t } : m)); }}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                    selected.tag === t ? `${TAG_STYLES[t]} border-transparent` : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Customer message */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {selected.customerInitials}
              </div>
              <div className="flex-1">
                <div className={`bg-gray-50 rounded-2xl rounded-tl-sm p-4 max-w-lg border ${
                  selected.sentiment === 'negative' ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}>
                  {selected.rating && <StarRating rating={selected.rating} />}
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">{selected.text}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">{selected.timestamp}</p>
              </div>
            </div>

            {/* Negative sentiment warning */}
            {selected.sentiment === 'negative' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">Negative sentiment detected. Review suggested response carefully before sending.</p>
              </div>
            )}

            {/* Lead CTA */}
            {selected.tag === 'lead' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <p className="text-xs text-green-700 font-medium">This looks like a sales lead! Create a lead record.</p>
                {leadCreatedIds.has(selected.id) ? (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Lead created</span>
                ) : (
                  <Button variant="secondary" className="text-xs py-1 px-3 h-auto" onClick={handleCreateLead}>Create Lead</Button>
                )}
              </div>
            )}

            {/* Sent confirmation */}
            {sentIds.has(selected.id) && (
              <div className="flex justify-end">
                <div className="bg-blue-600 rounded-2xl rounded-br-sm p-4 max-w-lg">
                  <p className="text-sm text-white leading-relaxed">{selected.suggestedReply}</p>
                  <div className="flex items-center gap-1 mt-1.5 justify-end">
                    <Check className="w-3 h-3 text-blue-200" />
                    <p className="text-[10px] text-blue-200">Sent just now</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI reply section */}
          {!sentIds.has(selected.id) && selected.tag !== 'spam' && (
            <div className={`border-t p-4 space-y-3 ${selected.sentiment === 'negative' ? 'border-red-200 bg-red-50/30' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">AI Suggested Reply</p>
                <button
                  onClick={() => { setEditingReply((v) => !v); setReplyText(selected.suggestedReply); }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>

              {editingReply ? (
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full h-24 text-sm p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <div className={`rounded-lg p-3 border text-sm text-gray-700 leading-relaxed line-clamp-3 ${
                  selected.sentiment === 'negative' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'
                }`}>
                  {selected.suggestedReply}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 flex items-center gap-1.5 justify-center text-sm"
                  onClick={handleSend}
                  variant={selected.sentiment === 'negative' ? 'danger' : 'primary'}
                >
                  <Send className="w-3.5 h-3.5" />
                  {selected.sentiment === 'negative' ? 'Approve & Send' : 'Send Reply'}
                </Button>
                <Button variant="secondary" className="text-sm">Dismiss</Button>
              </div>
            </div>
          )}

          {selected.tag === 'spam' && (
            <div className="border-t p-4 text-center">
              <p className="text-sm text-gray-400">Spam messages are hidden from responses.</p>
              <Button variant="secondary" className="text-xs mt-2" onClick={() => handleMarkNotSpam(selected.id)}>Mark as Not Spam</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-sm">Select a message to view the thread</p>
        </div>
      )}
    </div>
  );
}
