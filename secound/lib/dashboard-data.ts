export type Role = "admin" | "teacher" | "student" | "parent";

export const roleLabels: Record<Role, string> = {
  admin: "مدير المنصة",
  teacher: "مدرس",
  student: "طالب",
  parent: "ولي أمر",
};

export const teacherNav = [
  { to: "/dashboard/teacher", label: "نظرة عامة", exact: true },
  { to: "/dashboard/teacher/lessons", label: "الدروس" },
  { to: "/dashboard/teacher/exams", label: "الامتحانات" },
  { to: "/dashboard/teacher/quizzes", label: "اختبارات فورية" },
  { to: "/dashboard/teacher/question-bank", label: "بنوك الأسئلة" },
  { to: "/dashboard/teacher/import", label: "استيراد بنك أسئلة" },
  { to: "/dashboard/teacher/grading", label: "تصحيح على PDF" },
  { to: "/dashboard/teacher/gradescope", label: "Gradescope" },
  { to: "/dashboard/teacher/live", label: "بث مباشر / Zoom" },
  { to: "/dashboard/teacher/chat", label: "المحادثات" },
  { to: "/dashboard/teacher/parents", label: "إحصائيات أولياء الأمور" },
] as const;

export const students = [
  { id: "s1", name: "يوسف عادل", grade: "الصف الثالث الثانوي", attendance: 96, avg: 88, late: 1 },
  { id: "s2", name: "مريم حسن", grade: "الصف الثالث الثانوي", attendance: 91, avg: 94, late: 0 },
  { id: "s3", name: "عمر طارق", grade: "الصف الثاني الثانوي", attendance: 78, avg: 67, late: 4 },
  { id: "s4", name: "سلمى محمود", grade: "الصف الثاني الثانوي", attendance: 88, avg: 79, late: 2 },
  { id: "s5", name: "خالد إبراهيم", grade: "الصف الأول الثانوي", attendance: 99, avg: 91, late: 0 },
];

export const lessons = [
  { id: "l1", title: "المشتقات - مقدمة", subject: "رياضيات", date: "2026-08-24", status: "منشور", students: 42 },
  { id: "l2", title: "التكامل بالتجزيء", subject: "رياضيات", date: "2026-08-26", status: "مسودة", students: 42 },
  { id: "l3", title: "قوانين نيوتن", subject: "فيزياء", date: "2026-08-27", status: "مجدول", students: 38 },
  { id: "l4", title: "الروابط الكيميائية", subject: "كيمياء", date: "2026-08-29", status: "منشور", students: 35 },
];

export const exams = [
  { id: "e1", title: "امتحان منتصف الفصل", subject: "رياضيات", date: "2026-08-30", questions: 25, submitted: 31, total: 42, graded: 20 },
  { id: "e2", title: "كويز الوحدة الثانية", subject: "فيزياء", date: "2026-08-25", questions: 10, submitted: 38, total: 38, graded: 38 },
  { id: "e3", title: "اختبار عملي", subject: "كيمياء", date: "2026-09-02", questions: 15, submitted: 0, total: 35, graded: 0 },
];

export const questionBanks = [
  { id: "b1", name: "بنك رياضيات - تفاضل وتكامل", questions: 340, tags: ["MCQ", "مقالي"], updated: "منذ يومين" },
  { id: "b2", name: "بنك فيزياء - ميكانيكا", questions: 210, tags: ["MCQ", "صح/خطأ"], updated: "منذ أسبوع" },
  { id: "b3", name: "بنك كيمياء عضوية", questions: 168, tags: ["MCQ"], updated: "منذ شهر" },
];

export const messages = [
  { id: "m1", from: "مريم حسن", role: "طالب", text: "أستاذ ممكن شرح إضافي لمسألة ٤؟", time: "10:12" },
  { id: "m2", from: "والد عمر طارق", role: "ولي أمر", text: "عايز أعرف مستوى عمر في آخر امتحان", time: "09:40" },
  { id: "m3", from: "مجموعة الصف الثالث", role: "مجموعة", text: "تم رفع ملخص الوحدة الثالثة", time: "أمس" },
];

export const adminNav = [
  { to: "/dashboard/admin", label: "نظرة عامة", exact: true },
  { to: "/dashboard/admin/courses", label: "الكورسات" },
  { to: "/dashboard/admin/teachers", label: "المدرسون" },
  { to: "/dashboard/admin/students", label: "الطلاب" },
  { to: "/dashboard/admin/reports", label: "التقارير" },
] as const;

export const studentNav = [
  { to: "/dashboard/student", label: "نظرة عامة", exact: true },
  { to: "/dashboard/student/courses", label: "كورساتي" },
  { to: "/dashboard/student/assignments", label: "الواجبات" },
  { to: "/dashboard/student/exams", label: "الامتحانات والدرجات" },
  { to: "/dashboard/student/attendance", label: "الحضور" },
  { to: "/dashboard/student/chat", label: "المحادثة مع المدرس" },
] as const;

export const parentNav = [
  { to: "/dashboard/parent", label: "نظرة عامة", exact: true },
  { to: "/dashboard/parent/courses", label: "كورسات ودروس الابن" },
  { to: "/dashboard/parent/assignments", label: "الواجبات والامتحانات" },
  { to: "/dashboard/parent/grades", label: "الدرجات" },
  { to: "/dashboard/parent/attendance", label: "الحضور والغياب" },
  { to: "/dashboard/parent/chat", label: "التواصل مع المدرسين" },
] as const;

export const teachers = [
  { id: "t1", name: "م. أحمد سمير", subject: "رياضيات", courses: 6, students: 187, rating: 4.8, status: "نشط" },
  { id: "t2", name: "أ. منى خالد", subject: "فيزياء", courses: 4, students: 121, rating: 4.6, status: "نشط" },
  { id: "t3", name: "د. طارق فؤاد", subject: "كيمياء", courses: 3, students: 94, rating: 4.4, status: "إجازة" },
  { id: "t4", name: "أ. هبة سعيد", subject: "لغة إنجليزية", courses: 5, students: 143, rating: 4.9, status: "نشط" },
];

export const platformCourses = [
  { id: "c1", title: "تفاضل وتكامل - ثانوية عامة", teacher: "م. أحمد سمير", subject: "رياضيات", students: 82, price: 450, status: "منشور", lessons: 24 },
  { id: "c2", title: "ميكانيكا كلاسيكية", teacher: "أ. منى خالد", subject: "فيزياء", students: 61, price: 400, status: "منشور", lessons: 18 },
  { id: "c3", title: "كيمياء عضوية مكثف", teacher: "د. طارق فؤاد", subject: "كيمياء", students: 44, price: 380, status: "مسودة", lessons: 15 },
  { id: "c4", title: "English Grammar Booster", teacher: "أ. هبة سعيد", subject: "لغة إنجليزية", students: 97, price: 300, status: "منشور", lessons: 20 },
];

export const assignments = [
  { id: "a1", title: "ورقة عمل: قواعد الاشتقاق", subject: "رياضيات", due: "2026-09-04", status: "مطلوب", score: null as number | null, max: 20 },
  { id: "a2", title: "تقرير تجربة الاحتكاك", subject: "فيزياء", due: "2026-09-06", status: "مطلوب", score: null, max: 15 },
  { id: "a3", title: "حل مسائل التكامل", subject: "رياضيات", due: "2026-08-28", status: "تم التسليم", score: 18, max: 20 },
  { id: "a4", title: "ملخص الروابط الكيميائية", subject: "كيمياء", due: "2026-08-25", status: "متأخر", score: 9, max: 20 },
];

export const attendance = [
  { id: "at1", lesson: "المشتقات - مقدمة", subject: "رياضيات", date: "2026-08-24", present: true, minutes: 58 },
  { id: "at2", lesson: "التكامل بالتجزيء", subject: "رياضيات", date: "2026-08-26", present: true, minutes: 45 },
  { id: "at3", lesson: "قوانين نيوتن", subject: "فيزياء", date: "2026-08-27", present: false, minutes: 0 },
  { id: "at4", lesson: "الروابط الكيميائية", subject: "كيمياء", date: "2026-08-29", present: true, minutes: 52 },
  { id: "at5", lesson: "مراجعة عامة", subject: "رياضيات", date: "2026-08-31", present: false, minutes: 0 },
];

export const grades = [
  { id: "g1", item: "امتحان منتصف الفصل", subject: "رياضيات", score: 42, max: 50, date: "2026-08-30" },
  { id: "g2", item: "كويز الوحدة الثانية", subject: "فيزياء", score: 12, max: 20, date: "2026-08-25" },
  { id: "g3", item: "واجب التكامل", subject: "رياضيات", score: 18, max: 20, date: "2026-08-28" },
  { id: "g4", item: "اختبار قصير", subject: "كيمياء", score: 15, max: 20, date: "2026-08-22" },
];

export const myCourses = [
  { id: "mc1", title: "تفاضل وتكامل - ثانوية عامة", teacher: "م. أحمد سمير", progress: 72, nextLesson: "تطبيقات التكامل", lessons: 24, done: 17 },
  { id: "mc2", title: "ميكانيكا كلاسيكية", teacher: "أ. منى خالد", progress: 45, nextLesson: "قوانين نيوتن (3)", lessons: 18, done: 8 },
  { id: "mc3", title: "كيمياء عضوية مكثف", teacher: "د. طارق فؤاد", progress: 30, nextLesson: "الألكانات", lessons: 15, done: 5 },
];
