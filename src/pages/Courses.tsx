import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Header } from '../components/site/Header';
import { Footer } from '../components/site/Footer';
import { CourseCard } from '../components/site/CourseCard';
import { categories, courses } from '../lib/courses';

const levels = ['الكل', 'مبتدئ', 'متوسط', 'متقدم'] as const;

const Courses = () => {
  const [category, setCategory] = useState('الكل');
  const [level, setLevel] = useState<string>('الكل');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (category === 'الكل' || c.category === category) &&
          (level === 'الكل' || c.level === level) &&
          (query.trim() === '' ||
            c.title.includes(query.trim()) ||
            c.instructor.includes(query.trim())),
      ),
    [category, level, query],
  );

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />

      <section className="bg-muted/60 py-14">
        <div className="container-page text-center">
          <h1 className="text-4xl font-extrabold">كل الكورسات</h1>
          <p className="mt-3 text-muted-foreground">
            {courses.length} كورس متاح — اختر ما يناسب مستواك واهتمامك
          </p>
          <div className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-soft">
            <Search className="size-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم الكورس أو المدرب..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                level === l
                  ? 'border-primary text-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            لا توجد كورسات مطابقة لبحثك.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
