export const adminNav = [
  { to: '/admin', label: 'نظرة عامة', exact: true },
  { to: '/admin/courses', label: 'الكورسات' },
  { to: '/admin/teachers', label: 'المدرسون' },
  { to: '/admin/students', label: 'الطلاب' },
  { to: '/admin/reports', label: 'التقارير' },
] as const;

export const teacherNav = [
  { to: '/teacher', label: 'نظرة عامة', exact: true },
  { to: '/teacher/courses', label: 'الكورسات' },
  { to: '/teacher/lessons', label: 'الدروس' },
  { to: '/teacher/assignments', label: 'الواجبات' },
  { to: '/teacher/students', label: 'الطلاب' },
] as const;

export const teacherComingSoon = [
  { label: 'اختبارات فورية' },
  { label: 'بنوك الأسئلة' },
  { label: 'استيراد بنك أسئلة' },
  { label: 'تصحيح على PDF' },
  { label: 'Gradescope' },
  { label: 'بث مباشر / Zoom' },
  { label: 'المحادثات' },
  { label: 'إحصائيات أولياء الأمور' },
] as const;

export const studentNav = [
  { to: '/student', label: 'نظرة عامة', exact: true },
  { to: '/student/courses', label: 'كورساتي' },
  { to: '/student/lessons', label: 'الدروس' },
  { to: '/student/assignments', label: 'الواجبات' },
  { to: '/student/grades', label: 'الدرجات' },
] as const;

export const studentComingSoon = [
  { label: 'الجدول الدراسي' },
  { label: 'الحصص المباشرة' },
  { label: 'الشهادات' },
  { label: 'المحادثات' },
  { label: 'تقارير أولياء الأمور' },
] as const;

export const teachers = [
  { id: 't1', name: 'م. أحمد سمير', subject: 'رياضيات', courses: 6, students: 187, rating: 4.8, status: 'نشط' },
  { id: 't2', name: 'أ. منى خالد', subject: 'فيزياء', courses: 4, students: 121, rating: 4.6, status: 'نشط' },
  { id: 't3', name: 'د. طارق فؤاد', subject: 'كيمياء', courses: 3, students: 94, rating: 4.4, status: 'إجازة' },
  { id: 't4', name: 'أ. هبة سعيد', subject: 'لغة إنجليزية', courses: 5, students: 143, rating: 4.9, status: 'نشط' },
];

export const platformCourses = [
  { id: 'c1', title: 'تفاضل وتكامل - ثانوية عامة', teacher: 'م. أحمد سمير', subject: 'رياضيات', students: 82, price: 450, status: 'منشور', lessons: 24 },
  { id: 'c2', title: 'ميكانيكا كلاسيكية', teacher: 'أ. منى خالد', subject: 'فيزياء', students: 61, price: 400, status: 'منشور', lessons: 18 },
  { id: 'c3', title: 'كيمياء عضوية مكثف', teacher: 'د. طارق فؤاد', subject: 'كيمياء', students: 44, price: 380, status: 'مسودة', lessons: 15 },
  { id: 'c4', title: 'English Grammar Booster', teacher: 'أ. هبة سعيد', subject: 'لغة إنجليزية', students: 97, price: 300, status: 'منشور', lessons: 20 },
];

export const students = [
  { id: 's1', name: 'يوسف عادل', grade: 'الصف الثالث الثانوي', attendance: 96, avg: 88, late: 1 },
  { id: 's2', name: 'مريم حسن', grade: 'الصف الثالث الثانوي', attendance: 91, avg: 94, late: 0 },
  { id: 's3', name: 'عمر طارق', grade: 'الصف الثاني الثانوي', attendance: 78, avg: 67, late: 4 },
  { id: 's4', name: 'سلمى محمود', grade: 'الصف الثاني الثانوي', attendance: 88, avg: 79, late: 2 },
  { id: 's5', name: 'خالد إبراهيم', grade: 'الصف الأول الثانوي', attendance: 99, avg: 91, late: 0 },
];

export const exams = [
  { id: 'e1', title: 'امتحان منتصف الفصل', subject: 'رياضيات', date: '2026-08-30', questions: 25, submitted: 31, total: 42, graded: 20 },
  { id: 'e2', title: 'كويز الوحدة الثانية', subject: 'فيزياء', date: '2026-08-25', questions: 10, submitted: 38, total: 38, graded: 38 },
  { id: 'e3', title: 'اختبار عملي', subject: 'كيمياء', date: '2026-09-02', questions: 15, submitted: 0, total: 35, graded: 0 },
];

export const recentUsers = [
  { name: 'م. أحمد سمير', role: 'مدرس', status: 'نشط', classes: 6 },
  { name: 'أ. منى خالد', role: 'مدرس', status: 'نشط', classes: 4 },
  { name: 'يوسف عادل', role: 'طالب', status: 'نشط', classes: 7 },
  { name: 'والد عمر طارق', role: 'ولي أمر', status: 'بانتظار التفعيل', classes: 1 },
];

export const lessons = [
  { id: 'l1', title: 'المشتقات - مقدمة', subject: 'رياضيات', date: '2026-08-24', status: 'منشور', students: 42 },
  { id: 'l2', title: 'التكامل بالتجزيء', subject: 'رياضيات', date: '2026-08-26', status: 'مسودة', students: 42 },
  { id: 'l3', title: 'قوانين نيوتن', subject: 'فيزياء', date: '2026-08-27', status: 'مجدول', students: 38 },
  { id: 'l4', title: 'الروابط الكيميائية', subject: 'كيمياء', date: '2026-08-29', status: 'منشور', students: 35 },
];

export const messages = [
  { id: 'm1', from: 'مريم حسن', role: 'طالب', text: 'أستاذ ممكن شرح إضافي لمسألة ٤؟', time: '10:12' },
  { id: 'm2', from: 'والد عمر طارق', role: 'ولي أمر', text: 'عايز أعرف مستوى عمر في آخر امتحان', time: '09:40' },
  { id: 'm3', from: 'مجموعة الصف الثالث', role: 'مجموعة', text: 'تم رفع ملخص الوحدة الثالثة', time: 'أمس' },
];

export const questionBanks = [
  { id: 'b1', name: 'بنك رياضيات - تفاضل وتكامل', questions: 340, tags: ['MCQ', 'مقالي'], updated: 'منذ يومين' },
  { id: 'b2', name: 'بنك فيزياء - ميكانيكا', questions: 210, tags: ['MCQ', 'صح/خطأ'], updated: 'منذ أسبوع' },
  { id: 'b3', name: 'بنك كيمياء عضوية', questions: 168, tags: ['MCQ'], updated: 'منذ شهر' },
];
