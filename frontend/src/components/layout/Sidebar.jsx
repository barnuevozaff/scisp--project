// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  CircleUserRound,
  IdCard,
  CalendarDays,
  Megaphone,
  BookOpen,
  Users,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BASE_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/schedule', label: 'Class Schedule', icon: CalendarDays },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/faculty', label: 'Faculty Directory', icon: Users },
  { to: '/events', label: 'Events', icon: Ticket },
];

const PROFILE_ITEM_BY_ROLE = {
  student: { to: '/profile', label: 'Student Profile', icon: CircleUserRound },
  faculty: { to: '/profile', label: 'My Profile', icon: IdCard },
  administrator: { to: '/profile', label: 'My Profile', icon: IdCard },
};

const SCHEDULE_LABEL_BY_ROLE = {
  student: 'Class Schedule',
  faculty: 'Teaching Schedule',
  administrator: 'Schedule of Classes',
};

export default function Sidebar({ open = false, onNavigate }) {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const navItems = [BASE_ITEMS[0], PROFILE_ITEM_BY_ROLE[role], ...BASE_ITEMS.slice(1)].map((item) =>
    item.to === '/schedule' ? { ...item, label: SCHEDULE_LABEL_BY_ROLE[role] } : item
  );

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
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-[0.92rem] border-l-2 transition-all duration-150 ${
                isActive
                  ? 'border-maroon-600 bg-surface-subtle text-ink-900 font-medium'
                  : 'border-transparent text-ink-700 hover:border-maroon-600/40 hover:bg-surface-subtle hover:text-ink-900'
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
