// src/components/layout/TopBar.jsx
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function initialsOf(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = user?.role || 'student';
  const roleLabel = role.toUpperCase();
  const idLabel = user?.studentId || user?.email || '';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-hairline bg-white px-6 sm:px-10 py-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center bg-maroon-600 text-white font-serif text-lg shrink-0">
          S
        </div>
        <div className="leading-tight">
          <p className="font-serif text-[1.05rem] sm:text-[1.15rem] text-ink-900 whitespace-nowrap">
            Smart Campus Integrated Services
          </p>
          <p className="text-[0.65rem] tracking-widest2 uppercase text-ink-400 mt-0.5">
            University Portal &middot; SCISP
          </p>
        </div>
      </div>

      {/* Right: role badge + user */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden sm:inline-flex items-center gap-1.5 border border-hairline px-3 py-1.5 text-[0.7rem] font-medium tracking-wide uppercase text-ink-700">
          <span className="h-1.5 w-1.5 rounded-full bg-maroon-600" />
          {roleLabel}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 hover:bg-surface-subtle px-1.5 py-1 transition-colors"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle border border-hairline text-xs font-semibold text-ink-700">
              {initialsOf(user?.fullName)}
            </span>
            <span className="hidden sm:block text-left">
              <span className="block text-sm font-medium text-ink-900 leading-tight">{user?.fullName}</span>
              <span className="block text-xs text-ink-400 leading-tight">{idLabel}</span>
            </span>
            <ChevronDown size={16} className="text-ink-400" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 border border-hairline bg-white shadow-sm z-20"
            >
              <button
                role="menuitem"
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-subtle"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
