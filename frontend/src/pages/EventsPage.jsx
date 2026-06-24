// src/pages/EventsPage.jsx
import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users, Ticket } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import PageHeader from '../components/common/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import EventTicketModal from '../components/common/EventTicketModal';
import { eventService } from '../services/portalService';
import { useAuth } from '../context/AuthContext';

function formatEventDate(dateStr) {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${datePart} \u00B7 ${timePart}`;
}

export default function EventsPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const [events, setEvents] = useState([]);
  // Map of eventId -> registrationId, so a registered student can pull up
  // the QR ticket for the specific registration (not just the event).
  const [registrationByEvent, setRegistrationByEvent] = useState(new Map());
  const [pendingId, setPendingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketRegistrationId, setTicketRegistrationId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        // Registration status only applies to students; faculty/admin just browse the list.
        const eventsRes = await eventService.getAll();
        if (!isMounted) return;
        setEvents(eventsRes.data);

        if (isStudent) {
          const mineRes = await eventService.myRegistrations();
          if (isMounted) {
            setRegistrationByEvent(new Map(mineRes.data.map((r) => [r.id, r.registration_id])));
          }
        }
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
  }, [isStudent]);

  async function handleRegister(eventId) {
    setPendingId(eventId);
    try {
      const { data } = await eventService.register(eventId);
      setRegistrationByEvent((prev) => {
        const next = new Map(prev);
        next.set(eventId, data?.registrationId ?? null);
        return next;
      });
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
        description={
          isStudent
            ? 'Register for academic, cultural, and student affairs events hosted across the university.'
            : 'Academic, cultural, and student affairs events hosted across the university.'
        }
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
              const registrationId = registrationByEvent.get(event.id);
              const isRegistered = registrationByEvent.has(event.id);
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

                  {isStudent && (
                    <>
                      {!isRegistered ? (
                        <button
                          type="button"
                          onClick={() => handleRegister(event.id)}
                          disabled={pendingId === event.id}
                          className="mt-auto w-full py-3 text-sm font-semibold tracking-wide uppercase transition-colors bg-maroon-600 text-white hover:bg-maroon-700 disabled:opacity-60"
                        >
                          {pendingId === event.id ? 'Registering…' : 'Register for Event'}
                        </button>
                      ) : (
                        <div className="mt-auto flex gap-2">
                          <span className="flex-1 flex items-center justify-center py-3 text-sm font-semibold tracking-wide uppercase bg-surface-subtle text-ink-400">
                            Registered
                          </span>
                          {registrationId && (
                            <button
                              type="button"
                              onClick={() => setTicketRegistrationId(registrationId)}
                              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide uppercase border border-maroon-600 text-maroon-600 hover:bg-maroon-50 transition-colors"
                            >
                              <Ticket size={15} /> Ticket
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {ticketRegistrationId && (
        <EventTicketModal
          registrationId={ticketRegistrationId}
          onClose={() => setTicketRegistrationId(null)}
        />
      )}
    </PortalLayout>
  );
}
