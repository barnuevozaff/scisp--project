// src/components/common/EventTicketModal.jsx
import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { eventService } from '../../services/portalService';
import { LoadingState, ErrorState } from './States';

function formatEventDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function EventTicketModal({ registrationId, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    eventService
      .getQrCode(registrationId)
      .then(({ data }) => {
        if (isMounted) setTicket(data);
      })
      .catch(() => {
        if (isMounted) setError('We could not generate your event ticket right now.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [registrationId]);

  function handleDownload() {
    if (!ticket?.qrCode) return;
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `scisp-ticket-${registrationId}.png`;
    link.click();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm bg-white border border-hairline">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <h2 className="font-serif text-xl text-ink-900">Event Ticket</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-400 hover:text-ink-700">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <>
              <div className="flex justify-center mb-5">
                <img
                  src={ticket.qrCode}
                  alt="Event registration QR code"
                  className="h-56 w-56 border border-hairline"
                />
              </div>
              <p className="font-serif text-lg text-ink-900 text-center leading-snug mb-1">
                {ticket.registration.eventName}
              </p>
              <p className="text-sm text-ink-500 text-center mb-5">
                {formatEventDate(ticket.registration.eventDate)} &middot; {ticket.registration.venue}
              </p>

              <div className="border-t border-hairline pt-4 space-y-2">
                <p className="text-xs text-ink-400 uppercase tracking-widest2">Registered to</p>
                <p className="text-sm text-ink-900">
                  {ticket.registration.studentName} &middot; {ticket.registration.studentId}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-maroon-600 text-white py-3 text-sm font-semibold uppercase tracking-wide hover:bg-maroon-700 transition-colors"
              >
                <Download size={15} /> Save Ticket
              </button>
              <p className="text-xs text-ink-400 text-center mt-3">
                Present this QR code at the venue entrance for verification.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
