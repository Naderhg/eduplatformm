import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, Award, Star, MapPin, Mail, Phone, Calendar, Clock } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dev Community
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                إنشاء حساب
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Teacher Profile Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    أ. محمد أحمد
                  </h1>
                  <p className="text-xl text-gray-600 mb-2">
                    مدرس الرياضيات والفيزياء
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>القاهرة، مصر</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>4.9 (125 تقييم)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    تواصل معي
                  </button>
                  <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">
                    مشاركة الملف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Teacher Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">نبذة عني</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  مدرس رياضيات وفيزياء ذو خبرة تزيد عن 10 سنوات في تدريس المرحلة الثانوية. حاصل على ماجستير في تعليم الرياضيات من جامعة القاهرة. شغوف بتبسيط المفاهيم العلمية وجعلها ممتعة ومفهومة للطلاب.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  أسلوبي في التدريس يعتمد على التفاعل المستمر مع الطلاب واستخدام الوسائل الحديثة لتوضيح المفاهيم. أساعد الطلاب على بناء أساس قوي في الرياضيات والفيزياء يخدمهم في دراستهم الجامعية ومستقبلهم المهني.
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-4">المؤهلات</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span>ماجستير في تعليم الرياضيات - جامعة القاهرة (2018)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span>بكالوريوس في الرياضيات والفيزياء - جامعة عين شمس (2012)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span>شهادة تدريس متقدمة من وزارة التربية والتعليم (2013)</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الاتصال</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>teacher@example.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>+20 123 456 7890</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>القاهرة، مصر</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">أوقات العمل</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>السبت - الخميس</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>9:00 صباحاً - 9:00 مساءً</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">السعر</h3>
                <div className="text-3xl font-bold mb-2">150 جنيه/ساعة</div>
                <p className="text-sm opacity-90">يشمل جميع المواد والأدوات</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              الدورات المتاحة
            </h2>
            <p className="text-xl text-gray-600">
              استكشف الدورات التعليمية التي أقدمها
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">الرياضيات للثانوية</h3>
                <p className="text-gray-600 mb-4">دورة شاملة في الرياضيات للصف الثالث الثانوي تشمل جميع المناهج</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">200 جنيه</span>
                  <span className="text-gray-500">40 ساعة</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 h-32 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">الفيزياء للمبتدئين</h3>
                <p className="text-gray-600 mb-4">مقدمة في الفيزياء الأساسية للطلاب الجدد</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">180 جنيه</span>
                  <span className="text-gray-500">35 ساعة</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-green-600 h-32 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">الرياضيات المتقدمة</h3>
                <p className="text-gray-600 mb-4">دورة متقدمة في الرياضيات للطلاب المتميزين</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">250 جنيه</span>
                  <span className="text-gray-500">50 ساعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">طالب</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">15</div>
              <div className="text-gray-600">دورة</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">4.9</div>
              <div className="text-gray-600">تقييم</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10+</div>
              <div className="text-gray-600">سنوات خبرة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              آراء الطلاب
            </h2>
            <p className="text-xl text-gray-600">
              ماذا يقول الطلاب عن تجربتهم معي
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "أستاذ محمد معلم ممتاز جداً. شرحه واضح ومبسط، وساعدني كثيراً في فهم الرياضيات. أنصح به بشدة!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">أ</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">أحمد علي</div>
                  <div className="text-sm text-gray-500">طالب ثانوي</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "تجربة رائعة مع أستاذ محمد. الدورة منظمة جداً والمحتوى شامل. حصلت على درجة ممتازة في الامتحان."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">س</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">سارة محمد</div>
                  <div className="text-sm text-gray-500">طالبة ثانوي</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "أفضل معلم رياضيات تعاملت معه. صبور ومتعاون، ويشرح بطريقة ممتعة. شكراً جزيلاً!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">م</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">محمود حسن</div>
                  <div className="text-sm text-gray-500">طالب جامعي</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            هل أنت مستعد لبدء رحلتك التعليمية؟
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            سجل الآن وابدأ في تعلم الرياضيات والفيزياء بطريقة ممتعة وفعالة
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all text-xl font-medium"
          >
            سجل الآن
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Dev Community</span>
              </div>
              <p className="text-gray-400">
                منصة تعليمية متكاملة للمعلمين والطلاب
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">الرئيسية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الدورات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">عن المعلم</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تواصل معنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">قانوني</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Dev Community. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
