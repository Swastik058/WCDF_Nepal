import { useEffect, useMemo, useState } from 'react';
import ProgramDetailsCard from './ProgramDetailsCard';
import ProgramPill from './ProgramPill';
import { getFeaturedPrograms } from '../services/programService';

const positions = [
  {
    id: 'top-left',
    pillClassName: 'left-0 top-2',
    lineClassName: 'left-[15.5rem] top-[6.4rem] w-40 origin-left -rotate-[19deg]',
  },
  {
    id: 'top-right',
    pillClassName: 'right-0 top-2',
    lineClassName: 'right-[15.5rem] top-[6.4rem] w-40 origin-right rotate-[19deg]',
  },
  {
    id: 'middle-left',
    pillClassName: 'left-0 top-1/2 -translate-y-1/2',
    lineClassName: 'left-[15.6rem] top-1/2 w-44 origin-left',
  },
  {
    id: 'middle-right',
    pillClassName: 'right-0 top-1/2 -translate-y-1/2',
    lineClassName: 'right-[15.6rem] top-1/2 w-44 origin-right',
  },
  {
    id: 'bottom-left',
    pillClassName: 'bottom-2 left-0',
    lineClassName: 'left-[15.5rem] top-[24.3rem] w-40 origin-left rotate-[19deg]',
  },
  {
    id: 'bottom-right',
    pillClassName: 'bottom-2 right-0',
    lineClassName: 'right-[15.5rem] top-[24.3rem] w-40 origin-right -rotate-[19deg]',
  },
];

const logoRings = [
  'h-40 w-40 border-white/10',
  'h-56 w-56 border-white/5',
  'h-72 w-72 border-white/[0.04]',
];

const toUiProgram = (program = {}) => ({
  _id: program._id || program.id || program.slug || '',
  title: program.title || 'Untitled Program',
  slug: program.slug || '',
  shortDescription: program.shortDescription || '',
  fullDescription: program.fullDescription || '',
  iconUrl: program.iconUrl || program.icon || program.image || '',
  isPublished: typeof program.isPublished === 'boolean' ? program.isPublished : program.isActive !== false,
  isFeatured: typeof program.isFeatured === 'boolean' ? program.isFeatured : true,
  order: Number.isFinite(Number(program.order)) ? Number(program.order) : Number(program.displayOrder) || 0,
});

const withMockDelay = async (callback, delay = 350) => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return callback();
};

function ProgramsHubSection() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      setLoading(true);
      setError('');

      try {
        // Replace only this loader call later if you want to connect a different API client.
        const data = await withMockDelay(() => getFeaturedPrograms());
        const visiblePrograms = (Array.isArray(data) ? data : [])
          .map(toUiProgram)
          .filter((program) => program.isPublished && program.isFeatured)
          .sort((a, b) => a.order - b.order)
          .slice(0, 6);

        if (!isMounted) return;

        setPrograms(visiblePrograms);
        setSelectedProgramId((currentId) =>
          visiblePrograms.some((program) => program._id === currentId)
            ? currentId
            : visiblePrograms[0]?._id || '',
        );
      } catch (err) {
        if (!isMounted) return;
        setPrograms([]);
        setError(err.message || 'Unable to load programs right now.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, []);

  const positionedPrograms = useMemo(
    () =>
      positions.map((position, index) => ({
        ...position,
        program: programs[index] || null,
      })),
    [programs],
  );

  const selectedProgram = useMemo(
    () => programs.find((program) => program._id === selectedProgramId) || programs[0] || null,
    [programs, selectedProgramId],
  );

  return (
    <section id="programs" className="overflow-hidden bg-[#0f3b35] px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-200">Programs</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Programs connected around one shared mission.
          </h2>
          <p className="mt-5 text-base leading-8 text-white/75">
            This section is ready for admin-managed program data. Pills only appear when published featured programs are returned by the API.
          </p>
        </div>

        <div className="mt-14 hidden lg:block">
          <div className="relative mx-auto h-[34rem] max-w-[72rem] rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.16),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-8 py-8 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%)]" />

            {positionedPrograms.map(
              (item) =>
                item.program && (
                  <div
                    key={`line-${item.program._id}`}
                    className={`absolute z-10 h-px bg-gradient-to-r from-white/0 via-white/35 to-white/0 ${item.lineClassName}`}
                  />
                ),
            )}

            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-44 w-44 items-center justify-center">
                {logoRings.map((ringClass) => (
                  <div
                    key={ringClass}
                    className={`absolute rounded-full border ${ringClass}`}
                  />
                ))}
                <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-amber-300/35 bg-[#113f38] px-4 text-center shadow-[0_0_40px_rgba(251,191,36,0.18)]">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded-full bg-emerald-300" />
                    <div className="h-4 w-4 rounded-full bg-amber-300" />
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/65">WCDF</p>
                  <p className="mt-1 text-lg font-bold text-white">Paya Ghar</p>
                </div>
              </div>
            </div>

            {positionedPrograms.map(
              (item) =>
                item.program && (
                  <div
                    key={item.program._id}
                    className={`absolute z-30 w-[15rem] ${item.pillClassName}`}
                  >
                    <ProgramPill
                      program={item.program}
                      isActive={selectedProgram?._id === item.program._id}
                      onSelect={(program) => setSelectedProgramId(program._id)}
                    />
                  </div>
                ),
            )}

            {!loading && !error && programs.length === 0 ? (
              <div className="absolute inset-0 z-30 flex items-end justify-center pb-12">
                <p className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">
                  Programs will appear here soon.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 lg:hidden">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-xl">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-amber-300/35 bg-[#113f38] px-4 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 rounded-full bg-emerald-300" />
                  <div className="h-4 w-4 rounded-full bg-amber-300" />
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/65">WCDF</p>
                <p className="mt-1 text-base font-bold text-white">Paya Ghar</p>
              </div>
              {!loading && !error && programs.length === 0 ? (
                <p className="mt-6 text-sm text-white/70">Programs will appear here soon.</p>
              ) : null}
            </div>

            {!loading && !error && programs.length > 0 ? (
              <div className="mt-8 grid gap-4">
                {programs.map((program) => (
                  <ProgramPill
                    key={program._id}
                    program={program}
                    isActive={selectedProgram?._id === program._id}
                    onSelect={(item) => setSelectedProgramId(item._id)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
            <div className="mt-5 h-8 w-3/5 animate-pulse rounded bg-white/10" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[2rem] border border-rose-300/25 bg-rose-400/10 p-6 text-center text-rose-100 shadow-xl">
            {error}
          </div>
        ) : null}

        {!loading && !error && selectedProgram ? (
          <div className="mt-8">
            <ProgramDetailsCard program={selectedProgram} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ProgramsHubSection;
