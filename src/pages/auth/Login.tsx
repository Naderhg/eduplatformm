import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../hooks/useToast';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './Auth.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const dest =
          user.role === 'ADMIN' ? '/admin' :
          user.role === 'TEACHER' ? '/teacher' : '/student';
        navigate(dest, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('من فضلك أدخل البريد الإلكتروني وكلمة المرور');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });
      showToast('تم تسجيل الدخول بنجاح', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل تسجيل الدخول. تحقق من بياناتك.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-split">
        {/* Brand panel */}
        <div className="auth-brand-panel">
          <Link to="/" className="auth-brand-logo">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </span>
            <span className="text-2xl font-extrabold">
              Dev <span className="text-primary">Community</span>
            </span>
          </Link>

          <h2 className="auth-brand-title">
            تعلُّم بلا حدود<br />
            <span className="marker-underline">بين إيديك</span>
          </h2>
          <p className="auth-brand-text">
            منصة تعليم وتدريب أونلاين تضم أكثر من ٥ آلاف كورس و١٠ ملايين طالب،
            بإشراف خبراء يساعدونك على اكتساب مهارات حقيقية.
          </p>

          <ul className="auth-brand-features">
            {['تعلّم مع الخبراء', 'احصل على شهادة معتمدة', 'وصول مدى الحياة'].map((t) => (
              <li key={t}>
                <CheckCircle2 className="size-5 text-primary" /> {t}
              </li>
            ))}
          </ul>

          <div className="auth-brand-stats">
            <div><span className="text-2xl font-extrabold">+٢٤ ألف</span><span>طالب</span></div>
            <div><span className="text-2xl font-extrabold">+٨٠</span><span>مدرب</span></div>
            <div><span className="text-2xl font-extrabold">+٢٠٠٠</span><span>شهادة</span></div>
          </div>
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <Link to="/" className="auth-back-link">
            <ArrowLeft className="size-4" /> العودة للرئيسية
          </Link>

          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">أهلاً بعودتك 👋</h1>
              <p className="auth-subtitle">سجّل دخولك للمتابعة إلى لوحة التحكم</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">البريد الإلكتروني</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="password">كلمة المرور</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-input-action"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div className="auth-actions">
                <label className="auth-remember">
                  <input type="checkbox" />
                  <span>تذكّرني</span>
                </label>
                <a href="#" className="auth-forgot">نسيت كلمة المرور؟</a>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading || isSubmitting}
              >
                {(isLoading || isSubmitting) ? <Loader size="small" /> : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="auth-info">
              <p>ليس لديك حساب؟ <Link to="/register">أنشئ حساب الآن</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
