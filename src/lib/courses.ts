export type Course = {
  id: string;
  title: string;
  category: string;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  students: number;
  hours: number;
  lectures: number;
  instructor: string;
  image: string;
  description: string;
  curriculum: { title: string; duration: string }[];
};

export const categories = [
  'الكل',
  'تطوير الويب',
  'التصميم',
  'التسويق',
  'الأعمال',
  'البيانات والذكاء الاصطناعي',
];

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=60`;

export const courses: Course[] = [
  {
    id: 'web-fullstack',
    title: 'تطوير الويب المتكامل من الصفر للاحتراف',
    category: 'تطوير الويب',
    level: 'مبتدئ',
    price: 499,
    oldPrice: 899,
    rating: 4.8,
    reviews: 1240,
    students: 12800,
    hours: 42,
    lectures: 186,
    instructor: 'م. أحمد سمير',
    image: img('1517180102446-f3ece451e9d8'),
    description:
      'دورة شاملة تأخذك من أساسيات HTML وCSS حتى بناء تطبيقات كاملة باستخدام React وقواعد البيانات، مع مشاريع عملية في كل مرحلة.',
    curriculum: [
      { title: 'مقدمة وأساسيات الويب', duration: '3 ساعات' },
      { title: 'HTML و CSS الحديث', duration: '8 ساعات' },
      { title: 'JavaScript من الصفر', duration: '12 ساعة' },
      { title: 'React وبناء الواجهات', duration: '11 ساعة' },
      { title: 'الباك اند وقواعد البيانات', duration: '8 ساعات' },
    ],
  },
  {
    id: 'ui-ux',
    title: 'تصميم واجهات وتجربة المستخدم UI/UX',
    category: 'التصميم',
    level: 'متوسط',
    price: 399,
    oldPrice: 650,
    rating: 4.7,
    reviews: 860,
    students: 7400,
    hours: 28,
    lectures: 120,
    instructor: 'أ. منى خالد',
    image: img('1561070791-2526d30994b5'),
    description:
      'تعلّم أسس التصميم البصري وبناء أنظمة تصميم متكاملة في Figma مع دراسات حالة واقعية.',
    curriculum: [
      { title: 'أساسيات التصميم البصري', duration: '5 ساعات' },
      { title: 'بحث المستخدم والـ Wireframes', duration: '6 ساعات' },
      { title: 'Figma بشكل احترافي', duration: '9 ساعات' },
      { title: 'أنظمة التصميم والبروتوتايب', duration: '8 ساعات' },
    ],
  },
  {
    id: 'digital-marketing',
    title: 'التسويق الرقمي وإدارة الحملات الإعلانية',
    category: 'التسويق',
    level: 'مبتدئ',
    price: 349,
    rating: 4.6,
    reviews: 540,
    students: 5100,
    hours: 22,
    lectures: 96,
    instructor: 'أ. كريم فؤاد',
    image: img('1460925895917-afdab827c52f'),
    description:
      'خطط تسويقية عملية، إعلانات ميتا وجوجل، تحليل النتائج وتحسين العائد على الإنفاق.',
    curriculum: [
      { title: 'بناء الاستراتيجية التسويقية', duration: '4 ساعات' },
      { title: 'إعلانات فيسبوك وإنستجرام', duration: '7 ساعات' },
      { title: 'إعلانات جوجل والسيو', duration: '6 ساعات' },
      { title: 'التحليلات والتقارير', duration: '5 ساعات' },
    ],
  },
  {
    id: 'data-science',
    title: 'علم البيانات والتعلم الآلي بلغة بايثون',
    category: 'البيانات والذكاء الاصطناعي',
    level: 'متقدم',
    price: 599,
    oldPrice: 999,
    rating: 4.9,
    reviews: 980,
    students: 6300,
    hours: 38,
    lectures: 154,
    instructor: 'د. ياسمين عبد الله',
    image: img('1551288049-bebda4e38f71'),
    description:
      'من تحليل البيانات بـ Pandas إلى بناء نماذج تعلم آلي ونشرها في بيئة حقيقية.',
    curriculum: [
      { title: 'بايثون لتحليل البيانات', duration: '9 ساعات' },
      { title: 'التصور البياني', duration: '6 ساعات' },
      { title: 'التعلم الآلي التطبيقي', duration: '14 ساعة' },
      { title: 'نشر النماذج', duration: '9 ساعات' },
    ],
  },
  {
    id: 'business-management',
    title: 'إدارة الأعمال وريادة المشاريع الناشئة',
    category: 'الأعمال',
    level: 'متوسط',
    price: 299,
    rating: 4.5,
    reviews: 410,
    students: 3900,
    hours: 18,
    lectures: 74,
    instructor: 'أ. طارق منصور',
    image: img('1454165804606-c3d57bc86b40'),
    description: 'من فكرة المشروع حتى بناء نموذج عمل مربح وجذب الاستثمار.',
    curriculum: [
      { title: 'نموذج العمل التجاري', duration: '4 ساعات' },
      { title: 'دراسة السوق والمنافسين', duration: '5 ساعات' },
      { title: 'التمويل والاستثمار', duration: '5 ساعات' },
      { title: 'بناء الفريق والتوسع', duration: '4 ساعات' },
    ],
  },
  {
    id: 'mobile-apps',
    title: 'بناء تطبيقات الموبايل بـ React Native',
    category: 'تطوير الويب',
    level: 'متوسط',
    price: 449,
    oldPrice: 700,
    rating: 4.7,
    reviews: 620,
    students: 4600,
    hours: 30,
    lectures: 132,
    instructor: 'م. عمر حسن',
    image: img('1512941937669-90a1b58e7e9c'),
    description: 'تطبيقات iOS وأندرويد من كود واحد مع نشر حقيقي على المتاجر.',
    curriculum: [
      { title: 'أساسيات React Native', duration: '7 ساعات' },
      { title: 'التنقل والحالة', duration: '8 ساعات' },
      { title: 'ربط الـ APIs', duration: '7 ساعات' },
      { title: 'النشر على المتاجر', duration: '8 ساعات' },
    ],
  },
];

export const getCourse = (id: string) => courses.find((c) => c.id === id);
