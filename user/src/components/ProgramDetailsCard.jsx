import { Link } from 'react-router-dom';

function ProgramDetailsCard({ program }) {
  if (!program) return null;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0f3b35] text-xl font-semibold text-amber-200">
            {program.iconUrl ? (
              <img src={program.iconUrl} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span>•</span>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Selected Program
            </p>
            <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{program.title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {program.shortDescription || 'Program summary will appear here once it is added from the admin side.'}
            </p>
          </div>
        </div>

        {program.slug ? (
          <Link
            to={`/programs/${program.slug}`}
            className="inline-flex rounded-full bg-[#0f3b35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#145048]"
          >
            Read More
          </Link>
        ) : null}
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm leading-7 text-slate-600">
          {program.fullDescription || 'Full program details can be connected here once richer content is available from the programs API.'}
        </p>
      </div>
    </div>
  );
}

export default ProgramDetailsCard;
