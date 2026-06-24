// src/pages/SchedulePage.jsx
import { useEffect, useState } from 'react';
import PortalLayout from '../components/layout/PortalLayout';
import SearchInput from '../components/common/SearchInput';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import { scheduleService } from '../services/portalService';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await scheduleService.getAll(search || undefined);
        if (!isMounted) return;
        setSchedules(res.data);
        setMeta(res.meta || {});
        setError('');
      } catch {
        if (isMounted) setError('We could not load your class schedule right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250); // debounce search
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <PortalLayout>
      <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">Academics</p>
      <h1 className="font-serif text-display-md sm:text-display-lg text-ink-900">Class Schedule</h1>
      <div className="h-[3px] w-12 bg-maroon-600 mt-4 mb-6" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <p className="text-ink-500 text-[0.95rem]">
          {meta.semester || 'First Semester'} &middot; Academic Year {meta.academicYear || '—'} &middot;{' '}
          {meta.totalUnits ?? 0} units enrolled
        </p>
        <SearchInput value={search} onChange={setSearch} placeholder="Search subject code or title" />
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : schedules.length === 0 ? (
        <EmptyState message="No subjects matched your search." />
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead>
              <tr className="bg-surface-subtle border-b border-hairline">
                {['Subject Code', 'Description', 'Schedule', 'Room', 'Instructor'].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-[0.68rem] tracking-widest2 uppercase text-ink-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map((row) => (
                <tr key={row.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-6 py-4 font-medium text-ink-900">{row.subject_code}</td>
                  <td className="px-6 py-4 text-ink-700">{row.description}</td>
                  <td className="px-6 py-4 text-ink-700">
                    {row.day_pattern} &middot; {formatTimeRange(row.start_time, row.end_time)}
                  </td>
                  <td className="px-6 py-4 text-ink-700">{row.room}</td>
                  <td className="px-6 py-4 text-ink-700">{row.instructor_name ? toAbbrevName(row.instructor_name) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink-400 mt-10">
        &copy; {new Date().getFullYear()} Smart Campus Integrated Services Portal &middot; Office of the University Registrar
      </p>
    </PortalLayout>
  );
}

function formatTimeRange(start, end) {
  const fmt = (t) => t?.slice(0, 5);
  return `${fmt(start)}–${fmt(end)}`;
}

function toAbbrevName(fullName) {
  // "Dr. Jonathan A. Reyes" -> "Dr. J. Reyes" style abbreviation, matching screenshot
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  const titleOrFirst = parts[0];
  const last = parts[parts.length - 1];
  const isTitle = /\.$/.test(titleOrFirst) || ['Dr', 'Prof', 'Mr', 'Ms', 'Mrs', 'Coach'].includes(titleOrFirst.replace('.', ''));
  if (isTitle) {
    const firstInitial = parts[1]?.[0];
    return `${titleOrFirst} ${firstInitial}. ${last}`;
  }
  return `${titleOrFirst[0]}. ${last}`;
}
