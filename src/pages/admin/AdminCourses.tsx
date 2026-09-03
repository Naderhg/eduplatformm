import { DashboardShell, PageHeader } from '../../components/dashboard/DashboardShell';
import { adminNav, platformCourses, teachers } from '../../lib/dashboard-data';
import { useState } from 'react';

type Course = (typeof platformCourses)[number];

export const AdminCourses = () => {
  const [list, setList] = useState<Course[]>(platformCourses);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    teacher: teachers[0]!.name,
    subject: 'رياضيات',
    price: '400',
    lessons: '12',
    status: 'مسودة',
  });

  return (
    <DashboardShell roleLabel="مدير المنصة" nav={adminNav}>
      <PageHeader
        title="الكورسات"
        description="كل كورسات المنصة مع إمكانية إنشاء كورس جديد"
        action={
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            {open ? 'إغلاق النموذج' : '+ إنشاء كورس'}
          </button>
        }
      />

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim()) return;
            setList((l) => [
              {
                id: `c${Date.now()}`,
                title: form.title,
                teacher: form.teacher,
                subject: form.subject,
                students: 0,
                price: Number(form.price),
                status: form.status,
                lessons: Number(form.lessons),
              },
              ...l,
            ]);
            setForm({ ...form, title: '' });
            setOpen(false);
          }}
          className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:grid-cols-2"
        >
          <label className="text-sm font-bold md:col-span-2">
            عنوان الكورس
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: تفاضل وتكامل - ثانوية عامة"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal outline-none"
            />
          </label>
          <label className="text-sm font-bold">
            المدرس
            <select
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal"
            >
              {teachers.map((t) => (
                <option key={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            المادة
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal"
            >
              {['رياضيات', 'فيزياء', 'كيمياء', 'لغة إنجليزية'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold">
            السعر (ج.م)
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-sm font-bold">
            عدد الدروس
            <input
              type="number"
              value={form.lessons}
              onChange={(e) => setForm({ ...form, lessons: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-sm font-bold">
            الحالة
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal"
            >
              <option>مسودة</option>
              <option>منشور</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <button className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              حفظ الكورس
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3">الكورس</th>
              <th className="px-4 py-3">المدرس</th>
              <th className="px-4 py-3">المادة</th>
              <th className="px-4 py-3">الدروس</th>
              <th className="px-4 py-3">الطلاب</th>
              <th className="px-4 py-3">السعر</th>
              <th className="px-4 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-bold">{c.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.teacher}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.subject}</td>
                <td className="px-4 py-3">{c.lessons}</td>
                <td className="px-4 py-3">{c.students}</td>
                <td className="px-4 py-3">{c.price} ج.م</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
};
