// src/components/common/SearchInput.jsx
import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-[340px] border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-maroon-600 transition-colors"
      />
    </div>
  );
}
