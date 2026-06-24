// src/components/common/PageHeader.jsx
export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-10">
      <p className="text-[0.7rem] tracking-widest2 uppercase text-maroon-600 font-medium mb-3">
        {eyebrow}
      </p>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <h1 className="font-serif text-display-md sm:text-display-lg text-ink-900">{title}</h1>
        {action}
      </div>
      <div className="h-[3px] w-12 bg-maroon-600 mt-4 mb-6" />
      {description && (
        <p className="text-ink-500 text-[0.95rem] max-w-2xl leading-relaxed">{description}</p>
      )}
    </div>
  );
}
