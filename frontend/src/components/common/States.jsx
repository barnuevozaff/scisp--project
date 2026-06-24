// src/components/common/States.jsx

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-12 text-ink-400 text-sm">
      <span className="h-4 w-4 border-2 border-hairline border-t-maroon-600 rounded-full animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="border border-hairline bg-surface-subtle px-6 py-8 text-center">
      <p className="text-sm text-ink-700">{message}</p>
    </div>
  );
}

export function EmptyState({ message = 'Nothing to show yet.' }) {
  return (
    <div className="border border-dashed border-hairline px-6 py-12 text-center">
      <p className="text-sm text-ink-400">{message}</p>
    </div>
  );
}
