// src/components/common/ConfirmDialog.jsx
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm bg-white border border-hairline px-6 py-6">
        <h2 className="font-serif text-lg text-ink-900 mb-2">{title}</h2>
        <p className="text-sm text-ink-500 mb-6">{message}</p>
        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-500 hover:underline">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="bg-maroon-600 text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-maroon-700 transition-colors disabled:opacity-60"
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
