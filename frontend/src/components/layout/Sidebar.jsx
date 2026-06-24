// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  CircleUserRound,
  CalendarDays,
  Megaphone,
  BookOpen,
  Users,
  Ticket,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/profile', label: 'Student Profile', icon: CircleUserRound },
  { to: '/schedule', label: 'Class Schedule', icon: CalendarDays },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/faculty', label: 'Faculty Directory', icon: Users },
  { to: '/events', label: 'Events', icon: Ticket },
];

export default function Sidebar({ open = false, onNavigate }) {
  return (
    <aside
      className={`
        border-r border-hairline bg-surface-sidebar w-64 shrink-0
        fixed sm:static inset-y-0 left-0 z-30 pt-6
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}
    >
      <p className="px-6 text-[0.65rem] tracking-widest2 uppercase text-ink-400 mb-3">
        Portal Services
      </p>
      <nav className="flex flex-col">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-[0.92rem] border-l-2 transition-colors ${
                isActive
                  ? 'border-maroon-600 bg-surface-subtle text-ink-900 font-medium'
                  : 'border-transparent text-ink-700 hover:bg-surface-subtle/70'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
