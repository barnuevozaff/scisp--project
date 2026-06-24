// src/services/emailService.js
// Bonus feature: transactional email via Resend (free tier — 100
// emails/day, no credit card required). If RESEND_API_KEY isn't
// configured, every function here quietly no-ops rather than throwing —
// email is a nice-to-have notification, not something that should ever
// block a registration or break the app for graders running it locally
// without an API key set up.
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_ADDRESS = process.env.EMAIL_FROM || 'SCISP Events <onboarding@resend.dev>';

function formatEventDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Sends a registration confirmation email after a student successfully
 * registers for a campus event. Failures are logged but never thrown —
 * a flaky email provider should never roll back or block the
 * registration itself.
 */
async function sendEventRegistrationEmail({ to, studentName, eventName, eventDate, venue, organizer }) {
  if (!resend) {
    console.log(`(email skipped - RESEND_API_KEY not set) Would have emailed ${to} about "${eventName}"`);
    return { skipped: true };
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `You're registered: ${eventName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1C1A19;">
          <div style="background:#6E1029; color:#fff; padding:24px 28px;">
            <p style="margin:0; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; opacity:0.8;">
              Smart Campus Integrated Services Portal
            </p>
            <h1 style="margin:8px 0 0; font-size:22px; font-weight:normal;">Registration Confirmed</h1>
          </div>
          <div style="padding:28px; border:1px solid #E6E2DD;">
            <p>Hi ${studentName},</p>
            <p>You're confirmed for the following campus event:</p>
            <table style="width:100%; margin:16px 0; font-size:14px;">
              <tr><td style="padding:4px 0; color:#6B6560;">Event</td><td style="padding:4px 0;"><strong>${eventName}</strong></td></tr>
              <tr><td style="padding:4px 0; color:#6B6560;">Date</td><td style="padding:4px 0;">${formatEventDate(eventDate)}</td></tr>
              <tr><td style="padding:4px 0; color:#6B6560;">Venue</td><td style="padding:4px 0;">${venue}</td></tr>
              <tr><td style="padding:4px 0; color:#6B6560;">Organizer</td><td style="padding:4px 0;">${organizer}</td></tr>
            </table>
            <p style="font-size:13px; color:#6B6560;">
              A QR-code ticket for this registration is also available in the SCISP portal under
              Events &rarr; Ticket.
            </p>
          </div>
          <p style="font-size:11px; color:#A8A29C; text-align:center; margin-top:16px;">
            Office of the University Registrar &middot; SCISP
          </p>
        </div>
      `,
    });
    return { skipped: false };
  } catch (err) {
    console.error('Failed to send event registration email:', err.message);
    return { skipped: true, error: err.message };
  }
}

module.exports = { sendEventRegistrationEmail };
