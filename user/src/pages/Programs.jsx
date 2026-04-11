import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { getPublicPrograms } from '../services/programService';

const fallbackIcon = (title = '') => (title.trim().charAt(0) || 'P').toUpperCase();

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSlug, setActiveSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        const data = await getPublicPrograms();
        const items = Array.isArray(data) ? data : [];
        setPrograms(items);
        setActiveSlug(items[0]?.slug || '');
      } catch (err) {
        setError(err.message || 'Unable to load programs');
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  const filteredPrograms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return programs;

    return programs.filter(
      (program) =>
        program.title.toLowerCase().includes(term) ||
        program.shortDescription.toLowerCase().includes(term),
    );
  }, [programs, searchTerm]);

  const activeProgram = useMemo(
    () => filteredPrograms.find((program) => program.slug === activeSlug) || filteredPrograms[0] || null,
    [activeSlug, filteredPrograms],
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f3b35,#14532d_55%,#854d0e)] px-6 py-20 text-white lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-200">Programs</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Programs that turn care, education, and advocacy into practical daily support.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/80">
            This page shows only active programs. Hover a card to preview it, then open the full detail page for the complete description.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Browse programs</h2>
                <p className="mt-2 text-sm text-slate-600">Search and highlight the work WCDF is actively running.</p>
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search programs..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
              />
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                Loading programs...
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
                {error}
              </div>
            ) : null}

            {!loading && !error && filteredPrograms.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                No matching active programs found.
              </div>
            ) : null}

            {!loading && !error && filteredPrograms.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {filteredPrograms.map((program) => {
                  const isActive = activeProgram?.slug === program.slug;

                  return (
                    <Link
                      key={program._id || program.slug}
                      to={`/programs/${program.slug}`}
                      onMouseEnter={() => setActiveSlug(program.slug)}
                      onFocus={() => setActiveSlug(program.slug)}
                      className={`rounded-[1.5rem] border p-5 transition ${
                        isActive
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-amber-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-amber-300">
                          {program.icon || fallbackIcon(program.title)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-slate-900">{program.title}</h3>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                              #{program.displayOrder}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            {program.shortDescription}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {activeProgram ? (
              <>
                <div className="overflow-hidden rounded-[1.75rem] bg-slate-100">
                  {activeProgram.image ? (
                    <img
                      src={activeProgram.image}
                      alt={activeProgram.title}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center bg-[linear-gradient(135deg,#0f3b35,#1d4ed8,#f59e0b)] text-6xl font-bold text-white">
                      {activeProgram.icon || fallbackIcon(activeProgram.title)}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                    Program Preview
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">{activeProgram.title}</h2>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {activeProgram.shortDescription}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {activeProgram.fullDescription || 'Open the full page to add a more detailed explanation for this program.'}
                  </p>

                  <Link
                    to={`/programs/${activeProgram.slug}`}
                    className="mt-8 inline-flex rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Open detail page
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
                Choose a program to preview it here.
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Programs;
