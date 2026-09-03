import { DashboardShell, PageHeader } from '../../components/dashboard/DashboardShell';
import { teacherNav, messages } from '../../lib/dashboard-data';
import { useState } from 'react';

export const TeacherChat = () => {
  const [active, setActive] = useState(messages[0]!.id);
  const [thread, setThread] = useState([
    { me: false, text: 'أستاذ ممكن شرح إضافي لمسألة ٤؟' },
    { me: true, text: 'أكيد، هرفع فيديو قصير النهاردة.' },
  ]);
  const [text, setText] = useState('');

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav}>
      <PageHeader title="المحادثات" description="تواصل فوري مع الطلاب وأولياء الأمور" />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Conversations sidebar */}
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`w-full rounded-xl px-3 py-2 text-right ${active === m.id ? 'bg-accent' : 'hover:bg-muted'}`}
            >
              <p className="text-sm font-bold">{m.from}</p>
              <p className="truncate text-xs text-muted-foreground">{m.text}</p>
            </button>
          ))}
        </aside>

        {/* Chat thread */}
        <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {thread.map((m, i) => (
              <div
                key={i}
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  m.me ? 'ms-auto bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              setThread((t) => [...t, { me: true, text }]);
              setText('');
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب رسالة..."
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
            <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              إرسال
            </button>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
};
