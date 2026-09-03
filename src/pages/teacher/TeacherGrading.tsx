import { DashboardShell, PageHeader } from '../../components/dashboard/DashboardShell';
import { teacherNav } from '../../lib/dashboard-data';
import { useRef, useState } from 'react';

type Mark = { id: number; x: number; y: number; type: 'correct' | 'wrong' | 'note'; text?: string };

const papers = [
  { id: 'p1', student: 'يوسف عادل', exam: 'امتحان منتصف الفصل', pages: 3, status: 'بانتظار التصحيح' },
  { id: 'p2', student: 'مريم حسن', exam: 'امتحان منتصف الفصل', pages: 3, status: 'بانتظار التصحيح' },
  { id: 'p3', student: 'عمر طارق', exam: 'امتحان منتصف الفصل', pages: 3, status: 'تم التصحيح' },
];

export const TeacherGrading = () => {
  const [active, setActive] = useState(papers[0]!.id);
  const [tool, setTool] = useState<Mark['type']>('correct');
  const [marks, setMarks] = useState<Mark[]>([]);
  const [score, setScore] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);

  const addMark = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = areaRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const text = tool === 'note' ? window.prompt('اكتب الملاحظة') ?? '' : undefined;
    if (tool === 'note' && !text) return;
    setMarks((m) => [...m, { id: Date.now(), x, y, type: tool, text }]);
  };

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav}>
      <PageHeader
        title="تصحيح يدوي على PDF"
        description="اكتب وصحّح فوق ورقة الطالب داخل التطبيق بدون تحميل الملف"
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Papers sidebar */}
        <aside className="h-max rounded-2xl border border-border bg-card p-3 shadow-soft">
          <p className="mb-2 px-1 text-xs font-bold text-muted-foreground">أوراق الطلاب</p>
          {papers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActive(p.id);
                setMarks([]);
              }}
              className={`mb-1 w-full rounded-xl px-3 py-2 text-right ${active === p.id ? 'bg-accent' : 'hover:bg-muted'}`}
            >
              <p className="text-sm font-bold">{p.student}</p>
              <p className="text-xs text-muted-foreground">
                {p.pages} صفحات · {p.status}
              </p>
            </button>
          ))}
        </aside>

        {/* Grading area */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {([
              { t: 'correct' as const, l: '✓ صح' },
              { t: 'wrong' as const, l: '✗ خطأ' },
              { t: 'note' as const, l: '✎ ملاحظة' },
            ]).map((b) => (
              <button
                key={b.t}
                onClick={() => setTool(b.t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                  tool === b.t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {b.l}
              </button>
            ))}
            <button
              onClick={() => setMarks([])}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-bold"
            >
              مسح الكل
            </button>
            <div className="ms-auto flex items-center gap-2 text-sm">
              <span className="font-bold">الدرجة</span>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-20 rounded-lg border border-border bg-background px-2 py-1"
              />
              <span className="text-muted-foreground">/ 50</span>
            </div>
          </div>

          <div
            ref={areaRef}
            onClick={addMark}
            className="relative aspect-[1/1.35] w-full cursor-crosshair overflow-hidden rounded-xl border border-border bg-background p-8"
          >
            <div className="space-y-3 opacity-60">
              <p className="text-center text-sm font-bold">ورقة إجابة — امتحان منتصف الفصل</p>
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="h-3 rounded bg-muted" style={{ width: `${60 + ((i * 13) % 40)}%` }} />
              ))}
            </div>
            {marks.map((m) => (
              <span
                key={m.id}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 text-lg font-extrabold ${
                  m.type === 'correct' ? 'text-primary' : m.type === 'wrong' ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {m.type === 'correct' ? '✓' : m.type === 'wrong' ? '✗' : (
                  <span className="rounded bg-soft-yellow px-2 py-0.5 text-xs">{m.text}</span>
                )}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">عدد التعليمات: {marks.length}</span>
            <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              حفظ التصحيح وإرسال للطالب
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};
