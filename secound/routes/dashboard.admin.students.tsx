import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { students } from "@/lib/dashboard-data";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/admin/students")({
  head: () => ({
    meta: [
      { title: "الطلاب | مدير النظام" },
      { name: "description", content: "قائمة كل طلاب المنصة مع الحضور والمعدل والصف الدراسي." },
      { property: "og:title", content: "الطلاب | مدير النظام" },
      { property: "og:description", content: "بحث وفلترة على كل طلاب المنصة." },
    ],
  }),
  component: AdminStudents,
});

function AdminStudents() {
  const [q, setQ] = useState("");
  const list = students.filter((s) => s.name.includes(q) || s.grade.includes(q));

  return (
    <>
      <PageHeader title="الطلاب" description="كل الطلاب المسجلين على المنصة" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث باسم الطالب أو الصف..."
        className="mb-4 w-full max-w-sm rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
      />
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3">الطالب</th>
              <th className="px-4 py-3">الصف</th>
              <th className="px-4 py-3">الحضور</th>
              <th className="px-4 py-3">المعدل</th>
              <th className="px-4 py-3">تأخيرات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-bold">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.grade}</td>
                <td className="px-4 py-3">{s.attendance}%</td>
                <td className="px-4 py-3">{s.avg}%</td>
                <td className="px-4 py-3">{s.late}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
