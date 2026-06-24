// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Megaphone, BookOpen, Ticket } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import { useAuth } from '../context/AuthContext';
import { scheduleService, announcementService, bookService, eventService } from '../services/portalService';
import { LoadingState } from '../components/common/States';

function firstName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || fullName;
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ subjects: 0, announcements: 0, loans: 0, events: 0 });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [scheduleRes, announcementsRes, booksRes, eventsRes] = await Promise.all([
          scheduleService.getAll(),
          announcementService.getAll(),
          bookService.getAll(),
          eventService.getAll(),
        ]);
        if (!isMounted) return;

        const announcements = announcementsRes.data || [];
        const books = booksRes.data || [];
        const events = eventsRes.data || [];

        setStats({
          subjects: scheduleRes.meta?.subjectCount ?? scheduleRes.data?.length ?? 0,
          announcements: announcements.length,
          loans: books.filter((b) => b.availability === 'ON LOAN').length,
          events: events.length,
        });
        setRecentAnnouncements(announcements.slice(0, 3));
      } catch {
        // Stat cards quietly fall back to zero state on failure; page stays usable.
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    { label: 'Enrolled Subjects', value: stats.subjects },
    { label: 'Pending Announcements', value: stats.announcements },
    { label: 'Library Loans', value: stats.loans },
    { label: 'Upcoming Events', value: stats.events },
  ];

  const quickLinks = [
    { label: 'View class schedule', to: '/schedule', icon: CalendarDays },
    { label: 'Read announcements', to: '/announcements', icon: Megaphone },
    { label: 'Search library catalog', to: '/library', icon: BookOpen },
    { label: 'Browse upcoming events', to: '/events', icon: Ticket },
  ];

  return (
    <PortalLayout>
      <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">
        Welcome, {(user?.role || 'student').toUpperCase()}
      </p>
      <h1 className="font-serif text-display-md sm:text-display-lg text-ink-900">
        Good day, {firstName(user?.fullName)}.
      </h1>
      <div className="h-[3px] w-12 bg-maroon-600 mt-4 mb-6" />
      <p className="text-ink-500 text-[0.95rem] max-w-2xl leading-relaxed mb-10">
        This is your centralized portal for academic and student services. Review the latest
        information from your departments, manage your schedule, and access university resources.
      </p>

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline border border-hairline mb-10">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white px-6 py-7">
                <p className="text-[0.68rem] tracking-widest2 uppercase text-ink-400 mb-3">{card.label}</p>
                <p className="font-serif text-4xl text-ink-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="border border-hairline">
              <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
                <h2 className="font-serif text-xl text-ink-900">Recent announcements</h2>
                <Link
                  to="/announcements"
                  className="flex items-center gap-1 text-xs font-medium tracking-wide uppercase text-maroon-600 hover:underline"
                >
                  View all <ArrowUpRight size={14} />
                </Link>
              </div>
              {recentAnnouncements.length === 0 ? (
                <p className="px-6 py-8 text-sm text-ink-400">No announcements yet.</p>
              ) : (
                recentAnnouncements.map((a) => (
                  <div key={a.id} className="px-6 py-5 border-b border-hairline last:border-b-0">
                    <span className="inline-block border border-hairline px-2.5 py-0.5 text-[0.65rem] tracking-wide uppercase text-ink-500 mb-2.5">
                      {a.category}
                    </span>
                    <p className="font-serif text-[1.05rem] text-ink-900 leading-snug mb-1.5">{a.title}</p>
                    <p className="text-xs text-ink-400">{timeAgo(a.published_at)}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border border-hairline">
              <div className="px-6 py-5 border-b border-hairline">
                <h2 className="font-serif text-xl text-ink-900">Quick access</h2>
              </div>
              {quickLinks.map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between gap-3 px-6 py-4 border-b border-hairline last:border-b-0 hover:bg-surface-subtle transition-colors"
                >
                  <span className="flex items-center gap-3 text-sm text-ink-700">
                    <Icon size={16} className="text-maroon-600" />
                    {label}
                  </span>
                  <ArrowUpRight size={14} className="text-ink-400" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
