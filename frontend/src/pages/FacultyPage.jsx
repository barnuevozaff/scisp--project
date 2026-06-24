// src/pages/FacultyPage.jsx
import { useEffect, useState } from 'react';
import { Mail, Clock } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import SearchInput from '../components/common/SearchInput';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import { facultyService } from '../services/portalService';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const { data } = await facultyService.getAll(search || undefined);
        if (isMounted) {
          setFaculty(data);
          setError('');
        }
      } catch {
        if (isMounted) setError('We could not load the faculty directory right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <PortalLayout>
      <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">Directory</p>
      <h1 className="font-serif text-display-md sm:text-display-lg text-ink-900">Faculty Directory</h1>
      <div className="h-[3px] w-12 bg-maroon-600 mt-4 mb-6" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <p className="text-ink-500 text-[0.95rem] max-w-xl">
          Browse academic personnel and their consultation hours by name.
        </p>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by faculty name" />
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : faculty.length === 0 ? (
        <EmptyState message="No faculty matched your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border border-hairline">
          {faculty.map((f) => (
            <div key={f.id} className="bg-white px-6 py-7">
              <div className="h-14 w-14 rounded-full border border-hairline bg-surface-subtle flex items-center justify-center font-serif text-base text-ink-700 mb-5">
                {f.faculty_code}
              </div>
              <p className="font-serif text-lg text-ink-900 leading-snug">{f.full_name}</p>
              <p className="text-xs font-medium tracking-wide uppercase text-maroon-600 mt-1.5">{f.rank_title}</p>
              <p className="text-sm text-ink-500 mt-0.5">{f.department}</p>

              <div className="h-px bg-hairline my-4" />

              <p className="flex items-center gap-2 text-sm text-ink-700 mb-2">
                <Mail size={14} className="text-ink-400 shrink-0" />
                <span className="truncate">{f.email}</span>
              </p>
              <p className="flex items-center gap-2 text-sm text-ink-700">
                <Clock size={14} className="text-ink-400 shrink-0" />
                {f.consultation_hours || 'By appointment'}
              </p>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
