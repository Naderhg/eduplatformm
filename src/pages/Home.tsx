import { Link } from 'react-router-dom';
import {
  Award,
  BadgeCheck,
  BookOpen,
  Check,
  GraduationCap,
  Users,
  PlayCircle,
  Quote,
  Star,
  Laptop,
} from 'lucide-react';
import heroStudent from '../assets/hero-student.png';
import { Header } from '../components/site/Header';
import { Footer } from '../components/site/Footer';
import { CourseCard } from '../components/site/CourseCard';
import { courses } from '../lib/courses';

const stats = [
  { icon: Laptop, value: '٤ آلاف', label: 'كورس أونلاين', bg: 'bg-soft-yellow' },
  { icon: Users, value: '+٨٠', label: 'مدرب خبير', bg: 'bg-muted' },
  { icon: GraduationCap, value: '+٢٤ ألف', label: 'طالب', bg: 'bg-soft-purple' },
  { icon: BadgeCheck, value: '+٢٠٠٠', label: 'شهادة معتمدة', bg: 'bg-soft-blue' },
];

const features = [
  {
    icon: BookOpen,
    title: 'محتوى عملي محدَّث',
    text: 'كل كورس مبني على مشاريع حقيقية ويتم تحديثه باستمرار.',
  },
  {
    icon: Users,
    title: 'مدربون خبراء',
    text: 'نخبة من المحترفين بخبرة عملية في السوق العربي والعالمي.',
  },
  {
    icon: Award,
    title: 'شهادة معتمدة',
    text: 'احصل على شهادة إتمام تدعم سيرتك الذاتية بعد كل مسار.',
  },
  {
    icon: PlayCircle,
    title: 'تعلّم في أي وقت',
    text: 'وصول مدى الحياة للدروس على الموبايل والكمبيوتر.',
  },
];

const testimonials = [
  {
    name: 'سارة إبراهيم',
    role: 'مطوّرة واجهات',
    text: 'غيّرت مساري المهني بالكامل، أول شغل فريلانس بعد شهرين من الكورس.',
  },
  {
    name: 'محمود العشري',
    role: 'مسوّق رقمي',
    text: 'المحتوى منظم جدًا والمدربين بيردوا على كل الأسئلة بسرعة.',
  },
  {
    name: 'نورهان سعيد',
    role: 'مصممة UI/UX',
    text: 'أفضل استثمار عملته في نفسي، البورتفوليو اتغير ١٨٠ درجة.',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">
              <Star className="size-4" /> منصة التعلم الأولى عربيًا
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.25] sm:text-5xl lg:text-6xl">
              تعلُّم بلا حدود بين <span className="marker-underline">إيديك</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
              منصة تعليم وتدريب أونلاين تضم أكثر من ٥ آلاف كورس و١٠ ملايين طالب،
              بإشراف خبراء يساعدونك على اكتساب مهارات حقيقية.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              {['تعلّم مع الخبراء', 'احصل على شهادة', 'عضوية مفتوحة'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-success" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/courses"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
              >
                ابدأ التعلم الآن
              </Link>
              <span className="flex items-center gap-3 text-sm font-bold">
                <span className="flex size-11 items-center justify-center rounded-full bg-info text-info-foreground">
                  <PlayCircle className="size-6" />
                </span>
                شاهد الفيديو التعريفي
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-6 bottom-0 top-8 rounded-[3rem] bg-navy" />
            <img
              src={heroStudent}
              alt="طالب يحمل كتبه ويبتسم"
              width={1024}
              height={1024}
              className="relative mx-auto w-full max-w-md"
            />
            <div className="absolute bottom-6 start-0 hidden rounded-2xl bg-card p-4 shadow-card sm:block">
              <p className="text-sm font-bold">مبروك 🎉</p>
              <p className="text-xs text-muted-foreground">تم تأكيد التحاقك بالكورس</p>
            </div>
            <div className="absolute top-10 end-0 hidden rounded-2xl bg-success px-4 py-3 text-success-foreground shadow-card sm:block">
              <p className="text-xs">طلاب جدد اليوم</p>
              <p className="text-lg font-extrabold">+١٢٠٠</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`flex items-center gap-4 rounded-2xl p-6 ${s.bg}`}>
            <s.icon className="size-9 text-primary" />
            <div>
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Popular courses */}
      <section className="container-page mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">الكورسات الأكثر رواجًا</h2>
          <p className="mt-3 text-muted-foreground">
            اختر من بين أفضل الكورسات تقييمًا من طلابنا
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/courses"
            className="inline-flex rounded-xl border border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-accent"
          >
            تصفح كل الكورسات
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 bg-muted/60 py-20">
        <div className="container-page">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">ليه تختار Dev Community؟</h2>
            <p className="mt-3 text-muted-foreground">
              تجربة تعلم متكاملة من أول درس لحد الشهادة
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-card p-6 shadow-soft">
                <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">آراء طلابنا</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border p-6 shadow-soft">
              <Quote className="size-8 text-primary" />
              <p className="mt-4 leading-8 text-muted-foreground">{t.text}</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-24">
        <div className="rounded-3xl bg-navy px-8 py-14 text-center text-navy-foreground">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            جاهز تبدأ رحلتك التعليمية؟
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-navy-foreground/70">
            انضم لآلاف الطلاب وابدأ أول كورس مجانًا اليوم.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex rounded-xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground"
          >
            سجّل مجانًا
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
