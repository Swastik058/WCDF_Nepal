import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { getPublicProgramBySlug, getPublicPrograms } from '../services/programService';

const fallbackIcon = (title = '') => (title.trim().charAt(0) || 'P').toUpperCase();

function ProgramDetail() {
  const { slug } = useParams();
  const [program, setProgram] = useState(null);
  const [relatedPrograms, setRelatedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProgram = async () => {
      try {
        setLoading(true);
        setError('');

        const [programData, programsData] = await Promise.all([
          getPublicProgramBySlug(slug),
          getPublicPrograms(),
        ]);

        setProgram(programData);
        setRelatedPrograms(
          (Array.isArray(programsData) ? programsData : []).filter((item) => item.slug !== slug).slice(0, 3),
        );
      } catch (err) {
        setError(err.message || 'Program not found');
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/programs"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to programs
        </Link>

        {loading ? (
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-700 shadow-sm">
            Loading program details...
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50 p-12 text-center text-rose-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {program ? (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden bg-slate-100">
                {program.image ? (
                  <img src={program.image} alt={program.title} className="h-full min-h-[24rem] w-full object-cover" />
                ) : (
                  <div className="flex min-h-[24rem] items-center justify-center bg-[linear-gradient(135deg,#0f3b35,#1d4ed8,#f59e0b)] text-8xl font-bold text-white">
                    {program.icon || fallbackIcon(program.title)}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center bg-[linear-gradient(180deg,#0f3b35,#14532d)] p-8 text-white lg:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-200">Program Detail</p>
                <h1 className="mt-4 text-4xl font-bold">{program.title}</h1>
                <p className="mt-5 text-base leading-8 text-white/80">{program.shortDescription}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85">
                    Slug: {program.slug}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85">
                    Public status: Active
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900">About this program</h2>
                <div className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
                  {program.fullDescription || 'A full description has not been added yet. You can update this from the admin dashboard.'}
                </div>
              </section>

              <aside className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-semibold text-slate-900">More programs</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Explore other active programs from the public listing.
                </p>

                <div className="mt-5 space-y-3">
                  {relatedPrograms.length > 0 ? (
                    relatedPrograms.map((item) => (
                      <Link
                        key={item._id || item.slug}
                        to={`/programs/${item.slug}`}
                        className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-emerald-300"
                      >
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.shortDescription}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      No additional active programs to show yet.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export default ProgramDetail;
