// src/components/common/SearchAutocomplete.jsx
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * A search input that shows a live dropdown of matching suggestions as the
 * user types. Used on Library, Faculty Directory, and Class Schedule so
 * results preview before the full filtered list re-renders below.
 *
 * - `suggestions`: the already-filtered array of items to show (caller
 *   decides the matching logic, since each page searches different fields).
 * - `getKey`: returns a unique key for a suggestion item.
 * - `renderSuggestion`: returns the JSX for one dropdown row.
 * - `onSelect`: called with the chosen item when a suggestion is clicked;
 *   the caller decides what "selecting" means (e.g. fill the search box
 *   with that title, or jump straight to a filtered view).
 */
export default function SearchAutocomplete({
  value,
  onChange,
  suggestions = [],
  getKey,
  renderSuggestion,
  onSelect,
  placeholder,
  className = '',
  maxSuggestions = 6,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleSuggestions = suggestions.slice(0, maxSuggestions);
  const showDropdown = open && value.trim().length > 0 && visibleSuggestions.length > 0;

  function handleSelect(item) {
    onSelect?.(item);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 z-10" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="relative w-full sm:w-[340px] border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-maroon-600 transition-colors"
      />

      {showDropdown && (
        <div className="absolute z-20 mt-1 w-full sm:w-[340px] border border-hairline bg-white shadow-md max-h-72 overflow-y-auto">
          {visibleSuggestions.map((item) => (
            <button
              key={getKey(item)}
              type="button"
              onClick={() => handleSelect(item)}
              className="block w-full text-left px-4 py-2.5 text-sm hover:bg-surface-subtle transition-colors border-b border-hairline last:border-b-0"
            >
              {renderSuggestion(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
