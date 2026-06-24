// src/pages/AnnouncementsPage.jsx
import { useEffect, useState } from 'react';
import PortalLayout from '../components/layout/PortalLayout';
import PageHeader from '../components/common/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import { announcementService } from '../services/portalService';

const CATEGORIES = ['All', 'Academic', 'Student Affairs', 'Events', 'General Information'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const category = activeCategory === 'All' ? undefined : activeCategory;
        const { data } = await announcementService.getAll(category);
        if (isMounted) setAnnouncements(data);
      } catch {
        if (isMounted) setError('We could not load announcements right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  return (
    <PortalLayout>
      <PageHeader
        eyebrow="Bulletin"
        title="University Announcements"
        description="Official notices from university offices and academic departments."
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide border transition-colors ${
              activeCategory === cat
                ? 'bg-maroon-600 text-white border-maroon-600'
                : 'border-hairline text-ink-500 hover:border-ink-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : announcements.length === 0 ? (
        <EmptyState message="No announcements in this category." />
      ) : (
        <div className="border border-hairline">
          {announcements.map((a) => (
            <article key={a.id} className="px-6 sm:px-8 py-8 border-b border-hairline last:border-b-0">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="border border-hairline px-2.5 py-1 text-[0.65rem] font-medium tracking-wide uppercase text-maroon-600">
                  {a.category}
                </span>
                <span className="text-sm text-ink-400">
                  {formatDate(a.published_at)} &middot; {a.posted_by}
                </span>
              </div>
              <h2 className="font-serif text-2xl text-ink-900 leading-snug mb-3">{a.title}</h2>
              <p className="text-ink-700 leading-relaxed max-w-3xl">{a.body}</p>
            </article>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
