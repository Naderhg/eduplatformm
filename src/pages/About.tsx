import { Header } from '../components/site/Header';
import { Footer } from '../components/site/Footer';

const About = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <section className="container-page py-16">
        <h1 className="text-4xl font-extrabold">من نحن</h1>
        <p className="mt-5 max-w-2xl leading-9 text-muted-foreground">
          Dev Community منصة تعليمية عربية بدأت بفكرة بسيطة: إتاحة تعليم عملي عالي
          الجودة لأي شخص يتكلم العربية. نعمل مع مدربين محترفين لبناء مسارات
          تعليمية تركز على المهارات المطلوبة فعليًا في سوق العمل.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { t: 'رسالتنا', d: 'تعليم يفتح فرص عمل حقيقية، مش شهادات على الورق.' },
            { t: 'منهجنا', d: 'مشاريع عملية ومراجعات مباشرة من المدربين.' },
            { t: 'مجتمعنا', d: 'أكثر من ٢٤ ألف طالب يتعلمون ويتشاركون يوميًا.' },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border p-6 shadow-soft">
              <h2 className="text-lg font-bold">{c.t}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
