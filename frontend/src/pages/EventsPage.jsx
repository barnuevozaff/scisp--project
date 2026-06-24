// src/pages/EventsPage.jsx
import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import PageHeader from '../components/common/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import { eventService } from '../services/portalService';

function formatEventDate(dateStr) {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${datePart} \u00B7 ${timePart}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [pendingId, setPendingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [eventsRes, mineRes] = await Promise.all([eventService.getAll(), eventService.myRegistrations()]);
        if (!isMounted) return;
        setEvents(eventsRes.data);
        setRegisteredIds(new Set(mineRes.data.map((r) => r.id)));
      } catch {
        if (isMounted) setError('We could not load upcoming events right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRegister(eventId) {
    setPendingId(eventId);
    try {
      await eventService.register(eventId);
      setRegisteredIds((prev) => new Set(prev).add(eventId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete registration. Please try again.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <PortalLayout>
      <PageHeader
        eyebrow="Campus Life"
        title="Upcoming University Events"
        description="Register for academic, cultural, and student affairs events hosted across the university."
      />

      {loading ? (
        <LoadingState />
      ) : error && events.length === 0 ? (
        <ErrorState message={error} />
      ) : events.length === 0 ? (
        <EmptyState message="No upcoming events at this time." />
      ) : (
        <>
          {error && <p className="text-sm text-maroon-600 mb-4">{error}</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-hairline border border-hairline">
            {events.map((event) => {
              const isRegistered = registeredIds.has(event.id);
              return (
                <div key={event.id} className="bg-white px-7 py-7 flex flex-col">
                  <h2 className="font-serif text-2xl text-ink-900 leading-snug mb-3">{event.event_name}</h2>
                  <p className="text-ink-700 leading-relaxed mb-5">{event.description}</p>

                  <div className="h-px bg-hairline mb-5" />

                  <div className="space-y-2.5 mb-6">
                    <p className="flex items-center gap-2.5 text-sm text-ink-700">
                      <CalendarDays size={15} className="text-maroon-600 shrink-0" />
                      {formatEventDate(event.event_date)}
                    </p>
                    <p className="flex items-center gap-2.5 text-sm text-ink-700">
                      <MapPin size={15} className="text-maroon-600 shrink-0" />
                      {event.venue}
                    </p>
                    <p className="flex items-center gap-2.5 text-sm text-ink-700">
                      <Users size={15} className="text-maroon-600 shrink-0" />
                      {event.organizer}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRegister(event.id)}
                    disabled={isRegistered || pendingId === event.id}
                    className={`mt-auto w-full py-3 text-sm font-semibold tracking-wide uppercase transition-colors ${
                      isRegistered
                        ? 'bg-surface-subtle text-ink-400 cursor-default'
                        : 'bg-maroon-600 text-white hover:bg-maroon-700 disabled:opacity-60'
                    }`}
                  >
                    {isRegistered ? 'Registered' : pendingId === event.id ? 'Registering…' : 'Register for Event'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PortalLayout>
  );
}
