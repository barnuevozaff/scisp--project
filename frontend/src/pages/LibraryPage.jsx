// src/pages/LibraryPage.jsx
import { useEffect, useState } from 'react';
import PortalLayout from '../components/layout/PortalLayout';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import { bookService } from '../services/portalService';

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // unfiltered catalog, for instant suggestions
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetched once — powers the type-ahead dropdown without waiting on the
  // debounced server search below.
  useEffect(() => {
    bookService
      .getAll()
      .then(({ data }) => setAllBooks(data))
      .catch(() => setAllBooks([]));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const { data } = await bookService.getAll(search || undefined);
        if (isMounted) {
          setBooks(data);
          setError('');
        }
      } catch {
        if (isMounted) setError('We could not load the library catalog right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search]);

  const query = search.trim().toLowerCase();
  const suggestions = query
    ? allBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
      )
    : [];

  return (
    <PortalLayout>
      <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">Resources</p>
      <h1 className="font-serif text-display-md sm:text-display-lg text-ink-900">University Library Catalog</h1>
      <div className="h-[3px] w-12 bg-maroon-600 mt-4 mb-6" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <p className="text-ink-500 text-[0.95rem] max-w-xl">
          Search the general collection. Materials may be requested at the main circulation desk.
        </p>
        <SearchAutocomplete
          value={search}
          onChange={setSearch}
          placeholder="Search by title, author, or category"
          suggestions={suggestions}
          getKey={(book) => book.id}
          onSelect={(book) => setSearch(book.title)}
          renderSuggestion={(book) => (
            <>
              <span className="block font-medium text-ink-900">{book.title}</span>
              <span className="block text-xs text-ink-400">
                {book.author} &middot; {book.category}
              </span>
            </>
          )}
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : books.length === 0 ? (
        <EmptyState message="No titles matched your search." />
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead>
              <tr className="bg-surface-subtle border-b border-hairline">
                {['Title', 'Author', 'Category', 'Availability'].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-[0.68rem] tracking-widest2 uppercase text-ink-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-b border-hairline last:border-b-0 transition-colors duration-150 hover:bg-surface-subtle">
                  <td className="px-6 py-4 font-medium text-ink-900">{book.title}</td>
                  <td className="px-6 py-4 text-ink-700">{book.author}</td>
                  <td className="px-6 py-4 text-ink-700">{book.category}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase ${
                        book.availability === 'AVAILABLE' ? 'text-emerald-700' : 'text-ink-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          book.availability === 'AVAILABLE' ? 'bg-emerald-600' : 'bg-ink-400'
                        }`}
                      />
                      {book.availability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PortalLayout>
  );
}
