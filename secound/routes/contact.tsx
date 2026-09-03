import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | إديوبورت" },
      {
        name: "description",
        content: "راسل فريق إديوبورت للاستفسار عن الكورسات أو الشراكات التعليمية.",
      },
      { property: "og:title", content: "تواصل معنا | إديوبورت" },
      { property: "og:description", content: "فريقنا جاهز للرد على استفساراتك." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold">تواصل معنا</h1>
          <p className="mt-4 leading-8 text-muted-foreground">
            عندك سؤال عن كورس معين أو عايز تنضم كمدرب؟ ابعتلنا وهنرد خلال ٢٤ ساعة.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="size-5 text-primary" /> support@eduport.example
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 text-primary" /> ٠١٠٠ ١٢٣ ٤٥٦٧
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-5 text-primary" /> القاهرة، مصر
            </li>
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rounded-2xl border border-border p-6 shadow-soft"
        >
          <div className="grid gap-4">
            <input
              required
              placeholder="الاسم"
              className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              required
              type="email"
              placeholder="البريد الإلكتروني"
              className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <textarea
              required
              rows={5}
              placeholder="رسالتك"
              className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button className="rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">
              إرسال الرسالة
            </button>
            {sent && (
              <p className="text-sm font-semibold text-success">
                تم إرسال رسالتك، هنتواصل معاك قريبًا.
              </p>
            )}
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}
