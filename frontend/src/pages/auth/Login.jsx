import i18n from "../../utils/i18n";
import { useState } from 'react';
import isgLogo from '../../assets/isg_logo.jpg';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Shield, Activity, Users, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/endpoints/auth';
import useAuthStore from '../../store/authStore';
const loginSchema = z.object({
  email: z.string().email(i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D")).min(1, i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0637\u0644\u0648\u0628")),
  password: z.string().min(6, i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"))
});
export default function Login() {
  const navigate = useNavigate();
  const {
    setAuth
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const onSubmit = async data => {
    setLoading(true);
    try {
      const response = await authAPI.login(data);
      if (response.data.success) {
        const {
          user,
          accessToken,
          refreshToken
        } = response.data.data;
        setAuth(user, accessToken, refreshToken);
        toast.success(i18n.t('مرحباً {{name}}!', { name: user.name }));
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex" dir="rtl">
      {/* الجانب الأيمن — النموذج */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative">
        {/* زخرفة خلفية خفيفة */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="w-full max-w-md relative z-10">
          {/* الشعار */}
          <div className="text-center mb-10">
            <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden border border-gray-100 shadow-sm">
              <img src={isgLogo} alt="ISG SPORTIX" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{i18n.t("\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629")}</h1>
            <p className="text-gray-500 text-sm">{i18n.t("\u0642\u0645 \u0628\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645")}</p>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* البريد الإلكتروني */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">{i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")}</label>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Mail className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <input id="email" type="email" autoComplete="email" placeholder="admin@sportix.com" className={`input-field pr-11 ${errors.email ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`} {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            {/* كلمة المرور */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">{i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}</label>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Lock className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className={`input-field pr-11 pl-11 ${errors.password ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}`} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            {/* تذكرني + نسيت كلمة المرور */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/25" />
                <span className="text-sm text-gray-600">{i18n.t("\u062A\u0630\u0643\u0631\u0646\u064A")}</span>
              </label>
              <button type="button" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">{i18n.t("\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F")}</button>
            </div>

            {/* زر الدخول */}
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base font-bold relative overflow-hidden group">
              {loading ? <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>{i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0642\u0642...")}</div> : i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644")}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-l from-transparent via-white/10 to-transparent transition-transform duration-700" />
            </button>
          </form>


        </div>
      </div>

      {/* الجانب الأيسر — الغرافيكي */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* خلفية متدرجة */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#064E3B]" />
        
        {/* أشكال زخرفية */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-32 left-16 w-48 h-48 bg-white/5 rounded-full blur-xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/5 rounded-full blur-lg" />

        {/* خطوط شبكة خفيفة */}
        <div className="absolute inset-0" style={{
        backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
        backgroundSize: '60px 60px'
      }} />

        {/* المحتوى */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* أيقونات متحركة */}
          <div className="flex items-center gap-6 mb-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse-soft">
              <Activity className="w-7 h-7 text-white/80" />
            </div>
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse-soft" style={{
            animationDelay: '0.5s'
          }}>
              <HeartPulse className="w-8 h-8 text-white/90" />
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse-soft" style={{
            animationDelay: '1s'
          }}>
              <Users className="w-7 h-7 text-white/80" />
            </div>
          </div>

          {/* النص */}
          <h2 className="text-4xl font-extrabold text-white text-center mb-4 leading-tight">{i18n.t("\u0646\u0638\u0627\u0645")}<span className="text-emerald-300">SMIS</span>
            <br />{i18n.t("\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629")}</h2>
          <p className="text-white/60 text-center text-base max-w-md leading-relaxed">{i18n.t("\u0646\u0638\u0627\u0645 \u0645\u062A\u0643\u0627\u0645\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0648\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0648\u0627\u0644\u062A\u0623\u0647\u064A\u0644 \u0648\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u062F\u0627\u0621 \u0641\u064A \u0627\u0644\u0623\u0646\u062F\u064A\u0629 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629 \u0627\u0644\u0645\u062D\u062A\u0631\u0641\u0629")}</p>

          {/* إحصائيات */}
          <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-sm">
            <StatItem value="+500" label={i18n.t("\u0646\u0627\u062F\u064A")} />
            <StatItem value="+10K" label={i18n.t("\u0644\u0627\u0639\u0628")} />
            <StatItem value="+50K" label={i18n.t("\u0633\u062C\u0644 \u0637\u0628\u064A")} />
          </div>


        </div>
      </div>
    </div>;
}

// مكون الإحصائية
function StatItem({
  value,
  label
}) {
  return <div className="text-center">
      <p className="text-2xl font-extrabold text-white font-inter">{value}</p>
      <p className="text-white/50 text-xs mt-0.5">{label}</p>
    </div>;
}