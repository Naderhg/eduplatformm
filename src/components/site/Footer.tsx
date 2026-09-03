import { Link } from 'react-router-dom';
import { Facebook, GraduationCap, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 bg-navy text-navy-foreground" dir="rtl">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-xl font-extrabold">
              Dev <span className="text-primary">Community</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-navy-foreground/70">
            منصة تعليمية عربية تجمع أفضل المدربين وأحدث الكورسات في مكان واحد.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <span
                key={i}
                className="flex size-9 items-center justify-center rounded-lg bg-navy-foreground/10"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold">المنصة</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
            <li><Link to="/courses">كل الكورسات</Link></li>
            <li><Link to="/about">من نحن</Link></li>
            <li><Link to="/contact">تواصل معنا</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">التصنيفات</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
            <li>تطوير الويب</li>
            <li>التصميم</li>
            <li>التسويق</li>
            <li>البيانات والذكاء الاصطناعي</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">النشرة البريدية</h3>
          <p className="mt-4 text-sm text-navy-foreground/70">
            اشترك لتصلك أحدث الكورسات والعروض.
          </p>
          <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="بريدك الإلكتروني"
              className="w-full rounded-xl bg-navy-foreground/10 px-3 py-2 text-sm outline-none placeholder:text-navy-foreground/50"
            />
            <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              اشترك
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 py-5 text-center text-xs text-navy-foreground/60">
        © {new Date().getFullYear()} Dev Community. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
