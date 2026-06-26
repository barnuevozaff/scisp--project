// src/pages/SchedulePage.jsx
import { useEffect, useState } from 'react';
import PortalLayout from '../components/layout/PortalLayout';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import { scheduleService } from '../services/portalService';
import { useAuth } from '../context/AuthContext';

const VIEW_COPY = {
  student: {
    subtitle: (meta) =>
      `${meta.semester || 'First Semester'} \u00B7 Academic Year ${meta.academicYear || '—'} \u00B7 ${meta.totalUnits ?? 0} units enrolled`,
    columns: ['Subject Code', 'Description', 'Schedule', 'Room', 'Instructor'],
  },
  faculty: {
    subtitle: (meta) =>
      `${meta.semester || 'First Semester'} \u00B7 Academic Year ${meta.academicYear || '—'} \u00B7 ${meta.subjectCount ?? 0} sections assigned`,
    columns: ['Subject Code', 'Description', 'Schedule', 'Room', 'Enrolled'],
  },
  administrator: {
    subtitle: (meta) =>
      `${meta.semester || 'First Semester'} \u00B7 Academic Year ${meta.academicYear || '—'} \u00B7 ${meta.subjectCount ?? 0} sections offered`,
    columns: ['Subject Code', 'Description', 'Schedule', 'Room', 'Instructor'],
  },
};

export default function SchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]); // unfiltered, for instant suggestions
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    scheduleService
      .getAll()
      .then((res) => setAllSchedules(res.data))
      .catch(() => setAllSchedules([]));
  }, []);

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
        if (isMounted) setError('We could not load the class schedule right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250); // debounce search
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search]);

  const role = user?.role || 'student';
  const copy = VIEW_COPY[role] || VIEW_COPY.student;

  const query = search.trim().toLowerCase();
  const suggestions = query
    ? allSchedules.filter(
        (s) => s.subject_code.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
      )
    : [];

  return (
    <PortalLayout>
      <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">Academics</p>
      <h1 className="font-serif text-display-md sm:text-display-lg text-ink-900">
        {role === 'faculty' ? 'Teaching Schedule' : role === 'administrator' ? 'Schedule of Classes' : 'Class Schedule'}
      </h1>
      <div className="h-[3px] w-12 bg-maroon-600 mt-4 mb-6" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <p className="text-ink-500 text-[0.95rem]">{copy.subtitle(meta)}</p>
        <SearchAutocomplete
          value={search}
          onChange={setSearch}
          placeholder="Search subject code or title"
          suggestions={suggestions}
          getKey={(s) => s.id}
          onSelect={(s) => setSearch(s.subject_code)}
          renderSuggestion={(s) => (
            <>
              <span className="block font-medium text-ink-900">{s.subject_code}</span>
              <span className="block text-xs text-ink-400">{s.description}</span>
            </>
          )}
        />
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
                {copy.columns.map((h) => (
                  <th key={h} className="px-6 py-3.5 text-[0.68rem] tracking-widest2 uppercase text-ink-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map((row) => (
                <tr key={row.id} className="border-b border-hairline last:border-b-0 transition-colors duration-150 hover:bg-surface-subtle">
                  <td className="px-6 py-4 font-medium text-ink-900">{row.subject_code}</td>
                  <td className="px-6 py-4 text-ink-700">{row.description}</td>
                  <td className="px-6 py-4 text-ink-700">
                    {row.day_pattern} &middot; {formatTimeRange(row.start_time, row.end_time)}
                  </td>
                  <td className="px-6 py-4 text-ink-700">{row.room}</td>
                  <td className="px-6 py-4 text-ink-700">
                    {role === 'faculty'
                      ? `${row.enrolled_count ?? 0} student${row.enrolled_count === 1 ? '' : 's'}`
                      : row.instructor_name
                        ? toAbbrevName(row.instructor_name)
                        : '—'}
                  </td>
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
  const fmt = (t) => {
    if (!t) return '';
    const [hourStr, minuteStr] = t.split(':');
    const hour24 = parseInt(hourStr, 10);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${minuteStr} ${period}`;
  };
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
