import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav, exams } from '../../lib/dashboard-data';

export const TeacherExams = () => {
  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav}>
      <PageHeader
        title="الامتحانات"
        description="إنشاء ومتابعة الامتحانات"
        action={
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            + امتحان جديد
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="امتحانات نشطة" value={exams.length} />
        <StatCard label="تسليمات اليوم" value="69" />
        <StatCard label="بانتظار التصحيح" value="11" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-bold">الامتحان</th>
              <th className="p-3 font-bold">المادة</th>
              <th className="p-3 font-bold">التاريخ</th>
              <th className="p-3 font-bold">التسليم</th>
              <th className="p-3 font-bold">التصحيح</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="p-3 font-bold">{e.title}</td>
                <td className="p-3 text-muted-foreground">{e.subject}</td>
                <td className="p-3 text-muted-foreground">{e.date}</td>
                <td className="p-3">{e.submitted}/{e.total}</td>
                <td className="p-3">
                  <div className="h-2 w-24 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-success"
                      style={{ width: `${e.submitted ? (e.graded / e.submitted) * 100 : 0}%` }}
                    />
                  </div>
                </td>
                <td className="p-3">
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">تصحيح</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
};
