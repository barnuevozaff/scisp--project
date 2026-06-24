// src/pages/ProfilePage.jsx
import { useEffect, useRef, useState } from 'react';
import { Pencil, Upload } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import PageHeader from '../components/common/PageHeader';
import { LoadingState, ErrorState } from '../components/common/States';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/portalService';

function initialsOf(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ course: '', yearLevel: '', contactNumber: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const { data } = await studentService.getMe();
        if (!isMounted) return;
        setProfile(data);
        setForm({
          course: data.course,
          yearLevel: data.year_level,
          contactNumber: data.contact_number || '',
        });
      } catch {
        if (isMounted) setError('We could not load your profile right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      const { data } = await studentService.update(profile.id, form);
      setProfile(data);
      setEditing(false);
    } catch {
      setError('Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const { data } = await studentService.uploadAvatar(profile.id, file);
      setProfile((p) => ({ ...p, avatar_url: data.avatarUrl }));
    } catch {
      setError('Could not upload the image. Please try a PNG or JPG under 5MB.');
    }
  }

  return (
    <PortalLayout>
      <PageHeader eyebrow="Account" title="Student Profile" />

      {loading ? (
        <LoadingState />
      ) : error && !profile ? (
        <ErrorState message={error} />
      ) : !profile ? (
        <ErrorState message="No student record is linked to this account." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left card */}
          <div className="border border-hairline px-8 py-8 text-center">
            <div className="relative inline-block">
              <div className="h-28 w-28 rounded-full bg-surface-subtle border border-hairline flex items-center justify-center mx-auto overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-3xl text-ink-700">{initialsOf(profile.full_name)}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-maroon-600 text-white hover:bg-maroon-700 transition-colors"
                aria-label="Upload profile picture"
              >
                <Upload size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <p className="font-serif text-2xl text-ink-900 mt-5">{profile.full_name}</p>
            <p className="text-ink-400 text-sm mt-1">{profile.student_id}</p>

            <span className="inline-flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-[0.7rem] font-medium tracking-wide uppercase text-ink-700 mt-4">
              <span className="h-1.5 w-1.5 rounded-full bg-maroon-600" />
              Student
            </span>

            <div className="mt-6 text-left space-y-5">
              <Field label="Course" value={profile.course} />
              <Field label="Year Level" value={profile.year_level} />
              <Field label="Email" value={profile.email} />
              <Field label="Contact" value={profile.contact_number || '—'} />
            </div>
          </div>

          {/* Right: Personal Information */}
          <div className="border border-hairline">
            <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
              <h2 className="font-serif text-xl text-ink-900">Personal Information</h2>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-maroon-600 hover:underline"
                >
                  <Pencil size={13} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-xs font-medium tracking-wide uppercase text-ink-400 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="text-xs font-medium tracking-wide uppercase text-maroon-600 hover:underline disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {error && <p className="px-6 pt-4 text-sm text-maroon-600">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <ReadOrEditField
                label="Full Name"
                value={profile.full_name}
                editing={false} // name change isn't part of this module's scope
              />
              <ReadOrEditField label="Student ID" value={profile.student_id} editing={false} />

              <ReadOrEditField
                label="Course"
                value={editing ? form.course : profile.course}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, course: v }))}
              />
              <ReadOrEditField
                label="Year Level"
                value={editing ? form.yearLevel : profile.year_level}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, yearLevel: v }))}
              />

              <ReadOrEditField label="Email Address" value={profile.email} editing={false} />
              <ReadOrEditField
                label="Contact Number"
                value={editing ? form.contactNumber : profile.contact_number || ''}
                editing={editing}
                onChange={(v) => setForm((f) => ({ ...f, contactNumber: v }))}
              />
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

function Field({ label, value }) {
  return (
    <div className="border-t border-hairline pt-3 first:border-t-0 first:pt-0">
      <p className="text-[0.65rem] tracking-widest2 uppercase text-ink-400 mb-1">{label}</p>
      <p className="text-sm text-ink-900">{value}</p>
    </div>
  );
}

function ReadOrEditField({ label, value, editing, onChange }) {
  return (
    <div className="px-6 py-5 border-b border-hairline [&:nth-last-child(-n+2)]:border-b-0">
      <p className="text-[0.65rem] tracking-widest2 uppercase text-ink-400 mb-1.5">{label}</p>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full border border-hairline px-3 py-1.5 text-sm text-ink-900 focus:outline-none focus:border-maroon-600"
        />
      ) : (
        <p className="text-sm text-ink-900">{value}</p>
      )}
    </div>
  );
}
