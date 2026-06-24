// src/components/common/AnnouncementForm.jsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const CATEGORY_OPTIONS = ['Academic', 'Student Affairs', 'Events', 'General Information'];

export default function AnnouncementForm({ initial, onCancel, onSubmit, submitting }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    body: initial?.body || '',
    category: initial?.category || CATEGORY_OPTIONS[0],
    postedBy: initial?.posted_by || '',
  });
  const [error, setError] = useState('');

  // Re-seed the form if a different announcement is opened for editing.
  useEffect(() => {
    setForm({
      title: initial?.title || '',
      body: initial?.body || '',
      category: initial?.category || CATEGORY_OPTIONS[0],
      postedBy: initial?.posted_by || '',
    });
  }, [initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are both required.');
      return;
    }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this announcement. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg bg-white border border-hairline max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <h2 className="font-serif text-xl text-ink-900">
            {initial ? 'Edit announcement' : 'New announcement'}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="text-ink-400 hover:text-ink-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-[0.7rem] tracking-widest2 uppercase text-ink-500 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-hairline px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-maroon-600"
              required
            />
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-widest2 uppercase text-ink-500 mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-hairline px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-maroon-600 bg-white"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-widest2 uppercase text-ink-500 mb-2">
              Posting office (optional)
            </label>
            <input
              type="text"
              value={form.postedBy}
              onChange={(e) => setForm((f) => ({ ...f, postedBy: e.target.value }))}
              placeholder="e.g. Office of the University Registrar"
              className="w-full border border-hairline px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-maroon-600"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-widest2 uppercase text-ink-500 mb-2">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={5}
              className="w-full border border-hairline px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-maroon-600 resize-none"
              required
            />
          </div>

          {error && <p className="text-sm text-maroon-600">{error}</p>}

          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-ink-500 hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-maroon-600 text-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-maroon-700 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving…' : initial ? 'Save changes' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
