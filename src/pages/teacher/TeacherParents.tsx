import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav, students } from '../../lib/dashboard-data';

export const TeacherParents = () => {
  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav}>
      <PageHeader
        title="إحصائيات لأولياء الأمور"
        description="تقارير جاهزة للإرسال"
        action={
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            إرسال التقرير الأسبوعي
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="تقارير مرسلة" value="128" hint="هذا الشهر" />
        <StatCard label="نسبة الاطلاع" value="74%" />
        <StatCard label="طلاب يحتاجون متابعة" value="6" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-bold">الطالب</th>
              <th className="p-3 font-bold">الصف</th>
              <th className="p-3 font-bold">المعدل</th>
              <th className="p-3 font-bold">الحضور</th>
              <th className="p-3 font-bold">تأخيرات</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-bold">{s.name}</td>
                <td className="p-3 text-muted-foreground">{s.grade}</td>
                <td className="p-3">{s.avg}%</td>
                <td className="p-3">{s.attendance}%</td>
                <td className="p-3">{s.late}</td>
                <td className="p-3">
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">
                    إرسال لولي الأمر
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
};
