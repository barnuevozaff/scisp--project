// src/pages/AnnouncementsPage.jsx
import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Radio } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import PageHeader from '../components/common/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import AnnouncementForm from '../components/common/AnnouncementForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { announcementService } from '../services/portalService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const CATEGORIES = ['All', 'Academic', 'Student Affairs', 'Events', 'General Information'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const canManage = user?.role === 'administrator' || user?.role === 'faculty';

  const [announcements, setAnnouncements] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [justArrivedId, setJustArrivedId] = useState(null);

  const [formTarget, setFormTarget] = useState(null); // null = closed, {} = new, {...} = editing
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const category = activeCategory === 'All' ? undefined : activeCategory;
      const { data } = await announcementService.getAll(category);
      setAnnouncements(data);
      setError('');
    } catch {
      setError('We could not load announcements right now.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    load();
  }, [load]);

  // Bonus feature: live updates via Socket.io. When any admin/faculty
  // publishes a new announcement, everyone currently on this page sees it
  // appear immediately, without a manual refresh.
  useEffect(() => {
    if (!socket) return;

    function handleNewAnnouncement(announcement) {
      setAnnouncements((prev) => {
        // Avoid duplicating an announcement the current tab already has
        // (e.g. the author's own optimistic reload from handleFormSubmit).
        if (prev.some((a) => a.id === announcement.id)) return prev;
        const matchesFilter = activeCategory === 'All' || announcement.category === activeCategory;
        return matchesFilter ? [announcement, ...prev] : prev;
      });
      setJustArrivedId(announcement.id);
      setTimeout(() => setJustArrivedId((current) => (current === announcement.id ? null : current)), 4000);
    }

    socket.on('announcement:new', handleNewAnnouncement);
    return () => socket.off('announcement:new', handleNewAnnouncement);
  }, [socket, activeCategory]);

  function openNewForm() {
    setFormTarget(null);
    setFormOpen(true);
  }

  function openEditForm(announcement) {
    setFormTarget(announcement);
    setFormOpen(true);
  }

  async function handleFormSubmit(values) {
    setSaving(true);
    try {
      if (formTarget) {
        await announcementService.update(formTarget.id, values);
      } else {
        await announcementService.create(values);
      }
      setFormOpen(false);
      setFormTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await announcementService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setError('Could not delete this announcement. Please try again.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PortalLayout>
      <PageHeader
        eyebrow="Bulletin"
        title="University Announcements"
        description="Official notices from university offices and academic departments."
        action={
          <div className="flex items-center gap-3">
            {connected && (
              <span className="flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-wide text-emerald-700">
                <Radio size={12} className="animate-pulse" /> Live
              </span>
            )}
            {canManage && (
              <button
                type="button"
                onClick={openNewForm}
                className="flex items-center gap-2 bg-maroon-600 text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-maroon-700 transition-colors"
              >
                <Plus size={15} /> New announcement
              </button>
            )}
          </div>
        }
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
            <article
              key={a.id}
              className={`px-6 sm:px-8 py-8 border-b border-hairline last:border-b-0 transition-colors duration-1000 hover:bg-surface-subtle ${
                justArrivedId === a.id ? 'bg-maroon-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="border border-hairline px-2.5 py-1 text-[0.65rem] font-medium tracking-wide uppercase text-maroon-600">
                    {a.category}
                  </span>
                  <span className="text-sm text-ink-400">
                    {formatDate(a.published_at)} &middot; {a.posted_by}
                  </span>
                  {justArrivedId === a.id && (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-maroon-600">
                      Just posted
                    </span>
                  )}
                </div>

                {canManage && (
                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditForm(a)}
                      className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-maroon-600 hover:underline"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(a)}
                      className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-400 hover:text-maroon-600"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
              <h2 className="font-serif text-2xl text-ink-900 leading-snug mb-3">{a.title}</h2>
              <p className="text-ink-700 leading-relaxed max-w-3xl">{a.body}</p>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <AnnouncementForm
          initial={formTarget}
          submitting={saving}
          onCancel={() => {
            setFormOpen(false);
            setFormTarget(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this announcement?"
          message={`"${deleteTarget.title}" will be permanently removed from the bulletin.`}
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </PortalLayout>
  );
}
