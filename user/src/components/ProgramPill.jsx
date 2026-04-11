function ProgramPill({
  program,
  isActive,
  onSelect,
  className = '',
}) {
  const hasIcon = Boolean(program.iconUrl);

  return (
    <button
      type="button"
      onClick={() => onSelect(program)}
      className={`group flex w-full items-center gap-4 rounded-full border px-3 py-3 text-left shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300/60 ${
        isActive
          ? 'border-amber-300 bg-amber-100 text-slate-900 shadow-amber-200/30'
          : 'border-white/15 bg-[#f4efe4] text-slate-900 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-[#fbf6ea]'
      } ${className}`}
      aria-pressed={isActive}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 ${
          isActive
            ? 'border-amber-300 bg-[#0f3b35] text-amber-200'
            : 'border-[#d8cdb6] bg-white text-[#0f3b35] group-hover:border-amber-300'
        }`}
      >
        {hasIcon ? (
          <img
            src={program.iconUrl}
            alt=""
            className="h-8 w-8 object-contain"
          />
        ) : (
          <span className="text-lg leading-none">•</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5 sm:text-[15px]">{program.title}</p>
      </div>
    </button>
  );
}

export default ProgramPill;
