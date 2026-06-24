// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    studentId: '',
    course: '',
    yearLevel: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ ...form, role: 'student' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="bg-maroon-600 text-white flex flex-col justify-between px-8 sm:px-16 py-12 lg:py-16 lg:w-1/2 min-h-[260px] lg:min-h-screen">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-white/40 text-white font-serif text-lg">
            S
          </div>
          <span className="text-xs tracking-widest2 uppercase text-white/85">University Portal</span>
        </div>
        <div className="mt-12 lg:mt-0">
          <p className="text-xs tracking-widest2 uppercase text-white/60 mb-5">Veritas in Academia</p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.08] mb-6">
            Join the
            <br />
            Smart Campus
            <br />
            Portal
          </h1>
          <p className="text-white/75 text-[0.95rem] leading-relaxed max-w-md">
            Create your SCISP account to access schedules, announcements, library resources,
            and campus events.
          </p>
        </div>
        <p className="text-white/50 text-xs mt-12 lg:mt-0">
          &copy; {new Date().getFullYear()} Office of the University Registrar.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 sm:px-16 py-16 bg-white">
        <div className="w-full max-w-sm">
          <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">
            Registration
          </p>
          <h2 className="font-serif text-3xl text-ink-900 mb-2">Create your account</h2>
          <div className="h-[3px] w-12 bg-maroon-600 mb-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" value={form.fullName} onChange={update('fullName')} required />
            <Field label="University Email" type="email" value={form.email} onChange={update('email')} required />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              required
              placeholder="At least 8 characters"
            />
            <Field label="Student ID" value={form.studentId} onChange={update('studentId')} placeholder="2026-00123" />
            <Field label="Course" value={form.course} onChange={update('course')} placeholder="BS Computer Science" />
            <Field label="Year Level" value={form.yearLevel} onChange={update('yearLevel')} placeholder="1st Year" />

            {error && <p className="text-sm text-maroon-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-maroon-600 text-white py-3.5 text-sm font-semibold tracking-wide uppercase hover:bg-maroon-700 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-maroon-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-[0.7rem] tracking-widest2 uppercase text-ink-500 mb-2">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-hairline px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-maroon-600 transition-colors"
      />
    </div>
  );
}
