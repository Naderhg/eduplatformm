import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Clock, PlayCircle, Star, Users } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getCourse } from "@/lib/courses";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }) => {
    const course = getCourse(params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "الكورس غير متاح | إديوبورت" }, { name: "robots", content: "noindex" }],
      };
    }
    const { course } = loaderData;
    return {
      meta: [
        { title: `${course.title} | إديوبورت` },
        { name: "description", content: course.description.slice(0, 155) },
        { property: "og:title", content: course.title },
        { property: "og:description", content: course.description.slice(0, 155) },
        { property: "og:image", content: course.image },
        { name: "twitter:image", content: course.image },
      ],
    };
  },
  notFoundComponent: CourseNotFound,
  component: CourseDetail,
});

function CourseNotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-extrabold">الكورس غير موجود</h1>
        <Link to="/courses" className="mt-6 inline-flex text-primary underline">
          العودة لكل الكورسات
        </Link>
      </div>
      <Footer />
    </div>
  );
}

function CourseDetail() {
  const { course } = Route.useLoaderData();

  return (
    <div className="min-h-screen">
      <Header />

      <section className="bg-navy py-14 text-navy-foreground">
        <div className="container-page">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            {course.category}
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-[1.4] sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-navy-foreground/75">
            {course.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
            <span className="flex items-center gap-1 font-bold">
              <Star className="size-4 fill-warm text-warm" /> {course.rating} (
              {course.reviews} تقييم)
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" /> {course.students.toLocaleString("ar-EG")} طالب
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" /> {course.hours} ساعة
            </span>
            <span>المدرب: {course.instructor}</span>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold">محتوى الكورس</h2>
          <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {course.curriculum.map((m, i) => (
              <div key={m.title} className="flex items-center justify-between p-4">
                <span className="flex items-center gap-3 font-semibold">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-sm text-accent-foreground">
                    {i + 1}
                  </span>
                  {m.title}
                </span>
                <span className="text-sm text-muted-foreground">{m.duration}</span>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-extrabold">هتتعلم إيه؟</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "أساسيات قوية من الصفر",
              "مشاريع عملية للبورتفوليو",
              "أفضل الممارسات في السوق",
              "دعم مباشر من المدرب",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-2xl border border-border p-5 shadow-card lg:sticky lg:top-24">
          <img
            src={course.image}
            alt={course.title}
            loading="lazy"
            className="aspect-video w-full rounded-xl object-cover"
          />
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-primary">
              {course.price} ج.م
            </span>
            {course.oldPrice && (
              <span className="text-muted-foreground line-through">
                {course.oldPrice} ج.م
              </span>
            )}
          </div>
          <button className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">
            التحق بالكورس
          </button>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <PlayCircle className="size-4" /> {course.lectures} درس فيديو
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4" /> وصول مدى الحياة
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4" /> شهادة إتمام معتمدة
            </li>
          </ul>
        </aside>
      </section>

      <Footer />
    </div>
  );
}
