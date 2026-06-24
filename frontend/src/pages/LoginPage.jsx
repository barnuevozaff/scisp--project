// src/pages/LoginPage.jsx
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/common/GoogleSignInButton';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  const handleGoogleCredential = useCallback(
    async (idToken) => {
      setError('');
      setGoogleSubmitting(true);
      try {
        await loginWithGoogle(idToken);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not sign in with Google. Please try again.');
      } finally {
        setGoogleSubmitting(false);
      }
    },
    [loginWithGoogle, navigate]
  );

  const handleGoogleError = useCallback((message) => setError(message), []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — maroon hero panel */}
      <div className="bg-maroon-600 text-white flex flex-col justify-between px-8 sm:px-16 py-12 lg:py-16 lg:w-1/2 min-h-[380px] lg:min-h-screen">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-white/40 text-white font-serif text-lg">
            S
          </div>
          <span className="text-xs tracking-widest2 uppercase text-white/85">University Portal</span>
        </div>

        <div className="mt-12 lg:mt-0">
          <p className="text-xs tracking-widest2 uppercase text-white/60 mb-5">Veritas in Academia</p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.08] mb-6">
            Smart Campus
            <br />
            Integrated
            <br />
            Services Portal
          </h1>
          <p className="text-white/75 text-[0.95rem] leading-relaxed max-w-md">
            A unified gateway to academic records, schedules, library resources, faculty consultation,
            and university-wide announcements.
          </p>
        </div>

        <p className="text-white/50 text-xs mt-12 lg:mt-0">
          &copy; {new Date().getFullYear()} Office of the University Registrar.
        </p>
      </div>

      {/* Right — sign-in form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-16 py-16 bg-white">
        <div className="w-full max-w-sm">
          <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">
            Authentication
          </p>
          <h2 className="font-serif text-3xl text-ink-900 mb-2">Sign in to your account</h2>
          <div className="h-[3px] w-12 bg-maroon-600 mb-6" />
          <p className="text-ink-500 text-sm mb-8 leading-relaxed">
            Use your SCISP-issued credentials to access portal services.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-[0.7rem] tracking-widest2 uppercase text-ink-500 mb-2">
                Student ID or University Email
              </label>
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="2026-00123 or you@scisp.edu.ph"
                className="w-full border border-hairline px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-maroon-600 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[0.7rem] tracking-widest2 uppercase text-ink-500 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-hairline px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-maroon-600 transition-colors"
              />
            </div>

            {error && <p className="text-sm text-maroon-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-maroon-600 text-white py-3.5 text-sm font-semibold tracking-wide uppercase hover:bg-maroon-700 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-xs uppercase tracking-widest2 text-ink-400">or</span>
            <span className="h-px flex-1 bg-hairline" />
          </div>

          {googleSubmitting ? (
            <p className="text-center text-sm text-ink-500">Signing in with Google…</p>
          ) : (
            <GoogleSignInButton onCredential={handleGoogleCredential} onError={handleGoogleError} />
          )}

          <p className="text-center text-sm text-ink-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-maroon-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
