import { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { postService } from '../services/creative';
import type { Post } from '../services/creative';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';

type PostStatus = 'published' | 'scheduled' | 'draft' | 'failed';

interface CalendarPost {
  id: string;
  title: string;
  platforms: string[];
  time: string;
  status: PostStatus;
  thumbnail: string;
}

const STATUS_STYLES: Record<PostStatus, string> = {
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-500',
  failed: 'bg-red-100 text-red-600',
};

/* const MOCK_POSTS: Record<number, CalendarPost[]> = {
  0: [
    { id: '1', title: 'Brezza Weekend Offer', platforms: ['FB', 'IG'], time: '9:00 AM', status: 'published', thumbnail: 'from-blue-800 to-blue-600' },
  ],
  1: [
    { id: '2', title: 'Service Camp Reminder', platforms: ['GMB'], time: '10:30 AM', status: 'published', thumbnail: 'from-gray-700 to-gray-500' },
    { id: '3', title: 'New Nexon EV Arrival', platforms: ['FB', 'IG', 'GMB'], time: '6:00 PM', status: 'published', thumbnail: 'from-teal-700 to-teal-500' },
  ],
  2: [],
  3: [
    { id: '4', title: 'Customer Testimonial', platforms: ['IG'], time: '11:00 AM', status: 'scheduled', thumbnail: 'from-purple-700 to-purple-500' },
  ],
  4: [
    { id: '5', title: 'Navratri Special Deals', platforms: ['FB', 'IG', 'GMB'], time: '8:00 AM', status: 'scheduled', thumbnail: 'from-orange-600 to-red-500' },
    { id: '6', title: 'Inventory Showcase', platforms: ['FB'], time: '5:00 PM', status: 'draft', thumbnail: 'from-indigo-700 to-indigo-500' },
  ],
  5: [
    { id: '7', title: 'Weekend Engagement Post', platforms: ['FB', 'IG'], time: '10:00 AM', status: 'scheduled', thumbnail: 'from-pink-600 to-rose-500' },
  ],
  6: []
}; */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function PlatformBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    FB: 'bg-blue-100 text-blue-700',
    IG: 'bg-pink-100 text-pink-700',
    GMB: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${colors[label] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

function PostCard({ post }: { post: CalendarPost }) {
  return (
    <div className="group rounded-lg border bg-white overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className={`h-12 bg-gradient-to-br ${post.thumbnail} flex items-center justify-center`}>
        <div className="w-8 h-3 bg-white/30 rounded" />
      </div>
      <div className="p-2 space-y-1">
        <p className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-1">{post.title}</p>
        <div className="flex items-center gap-1 flex-wrap">
          {post.platforms.map((p) => <PlatformBadge key={p} label={p} />)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{post.time}</span>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[post.status]}`}>
            {post.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [apiPosts, setApiPosts] = useState<Post[]>([]);

  const weekStart = new Date(today);
  weekStart.setHours(0,0,0,0);
  // Mon is day 1, Sun is 0 -> adjust appropriately (1-7)
  const day = today.getDay() || 7; 
  weekStart.setDate(today.getDate() - day + 1 + weekOffset * 7);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  useEffect(() => {
    const start = new Date(weekStart);
    if (view === 'month') {
        start.setDate(1);
    }
    const end = new Date(start);
    end.setDate(start.getDate() + (view === 'week' ? 7 : 31));
    
    postService.getCalendar(start.toISOString(), end.toISOString())
      .then((res) => setApiPosts((res as any).data || []))
      .catch(console.error);
  }, [weekOffset, view]);

  const mappedPosts: CalendarPost[] = useMemo(() => {
    return apiPosts.map(p => {
      const d = new Date(p.scheduled_at || p.created_at);
      return {
        id: p.id,
        title: p.prompt_text || 'Untitled Post',
        platforms: p.platforms.map(plat => plat === 'facebook' ? 'FB' : plat === 'instagram' ? 'IG' : 'GMB'),
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: p.status as PostStatus,
        thumbnail: 'from-blue-800 to-blue-600',
        _date: d // internal use field
      } as CalendarPost & { _date: Date };
    });
  }, [apiPosts]);

  const getPostsForDate = (date: Date) => {
    return mappedPosts.filter((p: any) => 
      p._date.getDate() === date.getDate() && 
      p._date.getMonth() === date.getMonth()
    );
  };

  const totalScheduled = mappedPosts.filter((p) => p.status === 'scheduled').length;
  const totalPublished = mappedPosts.filter((p) => p.status === 'published').length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalPublished} published · {totalScheduled} scheduled this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden text-sm">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 font-medium transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 font-medium transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Month
            </button>
          </div>
          <NavLink to="/create" className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Post
          </NavLink>
        </div>
      </div>

      {view === 'week' ? (
        <>
          {/* Week navigation */}
          <div className="flex items-center gap-3">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {weekDates[0].getDate()} {MONTHS[weekDates[0].getMonth()]} — {weekDates[6].getDate()} {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getFullYear()}
            </span>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Today
              </button>
            )}
          </div>

          {/* Week grid */}
          <div className="grid grid-cols-7 gap-2 overflow-x-auto">
            {weekDates.map((date, i) => {
              const posts = getPostsForDate(date);
              const todayCol = isToday(date);
              return (
                <div key={i} className={`min-h-[280px] rounded-xl border ${todayCol ? 'border-blue-300 bg-blue-50/50' : 'bg-white border-gray-100'}`}>
                  {/* Day header */}
                  <div className={`px-2 py-2 text-center border-b ${todayCol ? 'border-blue-200' : 'border-gray-100'}`}>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{DAYS[i]}</p>
                    <p className={`text-lg font-bold mt-0.5 ${todayCol ? 'text-blue-600' : 'text-gray-800'}`}>
                      {date.getDate()}
                    </p>
                  </div>

                  {/* Posts */}
                  <div className="p-1.5 space-y-1.5">
                    {posts.map((post) => <PostCard key={post.id} post={post} />)}
                    <NavLink to="/create" className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </NavLink>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bulk schedule bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">AI Weekly Suggestions Ready</p>
              <p className="text-sm text-gray-500 mt-0.5">7 posts suggested for next week based on your inventory and upcoming festivals</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="text-sm">Review</Button>
              <Button className="text-sm">Schedule All</Button>
            </div>
          </div>
        </>
      ) : (
        /* Month view */
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3">
            <button onClick={() => setWeekOffset((o) => o - 4)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-800">{MONTHS[today.getMonth()]} {today.getFullYear()}</span>
            <button onClick={() => setWeekOffset((o) => o + 4)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-2 border-r last:border-r-0">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - 2;
              const inMonth = dayNum >= 0 && dayNum < 31;
              const cellDate = new Date(today.getFullYear(), today.getMonth(), dayNum + 1);
              const posts = inMonth ? getPostsForDate(cellDate) : [];
              const todayCell = dayNum === today.getDate() - 1;
              return (
                <div
                  key={i}
                  onClick={() => inMonth && setSelectedDay(dayNum)}
                  className={`min-h-[80px] p-1.5 border-r border-b last-of-type:border-r-0 cursor-pointer transition-colors ${
                    !inMonth ? 'bg-gray-50' : todayCell ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {inMonth && (
                    <>
                      <p className={`text-xs font-semibold mb-1 ${todayCell ? 'text-blue-600' : 'text-gray-700'}`}>
                        {dayNum + 1}
                      </p>
                      <div className="flex flex-wrap gap-0.5">
                        {posts.slice(0, 2).map((p) => (
                          <span key={p.id} className={`w-2 h-2 rounded-full ${
                            p.status === 'published' ? 'bg-green-500' :
                            p.status === 'scheduled' ? 'bg-yellow-400' :
                            p.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                        ))}
                        {posts.length > 2 && <span className="text-[9px] text-gray-400">+{posts.length - 2}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day detail sheet for month view */}
      {selectedDay !== null && view === 'month' && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Day {selectedDay + 1} Posts</h3>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            {getPostsForDate(new Date(today.getFullYear(), today.getMonth(), selectedDay + 1)).length > 0 ? (
              getPostsForDate(new Date(today.getFullYear(), today.getMonth(), selectedDay + 1)).map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <div className="text-center py-6 text-gray-400">
                <MoreHorizontal className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No posts for this day</p>
              </div>
            )}
            <Button className="w-full text-sm flex items-center gap-1.5 justify-center">
              <Plus className="w-4 h-4" /> Add Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
