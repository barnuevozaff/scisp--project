// src/components/common/GoogleSignInButton.jsx
import { useEffect, useRef } from 'react';

/**
 * Renders Google's own "Sign in with Google" button via the Google
 * Identity Services script (loaded globally in index.html). On a
 * successful sign-in, Google calls back with a signed ID token, which we
 * hand off to onCredential for the backend to verify.
 *
 * Quietly does nothing if VITE_GOOGLE_CLIENT_ID isn't configured, so the
 * rest of the login page still works during local development without it.
 */
export default function GoogleSignInButton({ onCredential, onError }) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    function render() {
      if (cancelled || !buttonRef.current) return;
      if (!window.google?.accounts?.id) {
        // The GIS script loads async/defer; it may not be ready on the
        // very first render. Retry briefly rather than failing silently.
        setTimeout(render, 150);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onCredential(response.credential);
          } else {
            onError?.('Google did not return a sign-in credential.');
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, onError]);

  if (!clientId) return null;

  return <div ref={buttonRef} className="flex justify-center" />;
}
