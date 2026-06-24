// src/components/layout/PortalLayout.jsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function PortalLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar />

      {/* Mobile nav toggle, shown only below sm breakpoint */}
      <div className="sm:hidden border-b border-hairline px-4 py-2.5 flex items-center justify-between bg-white">
        <button
          type="button"
          onClick={() => setMobileNavOpen((o) => !o)}
          className="flex items-center gap-2 text-sm text-ink-700"
        >
          {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          Portal services
        </button>
      </div>

      <div className="flex flex-1 relative">
        <Sidebar open={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />

        {/* backdrop on mobile when menu is open */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 sm:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 px-5 sm:px-10 py-10 sm:py-14">
          <div className="max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
