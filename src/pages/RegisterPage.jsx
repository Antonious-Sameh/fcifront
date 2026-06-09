import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  BookOpen, Eye, EyeOff, Loader2,
  CheckCircle2, AlertCircle, User, Mail, GraduationCap, Lock, ArrowRight, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BENEFITS = [
  { ar: 'وصول لكل المحاضرات والملفات', en: 'Access all lectures and files' },
  { ar: 'مسارات مهنية خطوة بخطوة', en: 'Step-by-step career roadmaps' },
  { ar: 'مساعد ذكاء اصطناعي مخصص', en: 'Dedicated AI assistant' },
  { ar: 'كورسات من أفضل المنصات', en: 'Courses from top platforms' },
];

export default function RegisterPage() {
  const { t, language } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', year: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); setError(''); };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { level: 1, label: isAr ? 'ضعيفة' : 'Weak', color: 'bg-red-500' };
    if (p.length < 10) return { level: 2, label: isAr ? 'متوسطة' : 'Medium', color: 'bg-amber-500' };
    return { level: 3, label: isAr ? 'قوية' : 'Strong', color: 'bg-emerald-500' };
  };
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError(isAr ? 'كلمة المرور لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setLoading(true); setError('');
    const result = await register(form.name, form.email, form.password, form.year ? Number(form.year) : undefined);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || (isAr ? 'فشل التسجيل' : 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen flex bg-white" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet><title>{t('register.title') || 'Register'} | Road To Career</title></Helmet>

      {/* ── Left panel (Consistent with Login) ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0F172A]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
            className={cn('flex items-center gap-4', isAr && 'flex-row-reverse')}>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Road To Career</span>
          </motion.div>

          <div className={cn("max-w-md", isAr ? 'text-right' : 'text-left')}>
            <motion.h2 initial={{ opacity: 0, x: isAr ? 30 : -30 }} animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-black mb-6 leading-tight tracking-tight">
              {isAr ? 'ابدأ رحلة نجاحك\nالآن مجاناً' : 'Start your success\njourney for free'}
            </motion.h2>
            <div className="space-y-5">
              {BENEFITS.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3 }}
                  className={cn('flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group', isAr && 'flex-row-reverse')}>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-slate-200 font-medium">{isAr ? b.ar : b.en}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">© 2026 FCI Platform — The Hub for Excellence</p>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white overflow-y-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="w-full max-w-[440px] mx-auto">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
             <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
          </div>

          <div className={cn('mb-8', isAr && 'text-right')}>
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{t('register.title') || (isAr ? 'إنشاء حساب' : 'Create Account')}</h1>
            <p className="text-slate-500 font-medium">{isAr ? 'انضم لمجتمع طلاب FCI المتميز' : 'Join the elite FCI student community'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className={cn("text-slate-700 font-bold", isAr && 'block')}>{isAr ? 'الاسم الكامل' : 'Full Name'}</Label>
              <div className="relative">
                <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isAr ? "right-4" : "left-4")} />
                <Input value={form.name} onChange={update('name')} placeholder={isAr ? 'مثال: محمد أحمد' : 'e.g. John Doe'} 
                  className={cn("h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all", isAr ? "pr-11" : "pl-11")} dir={isAr ? 'rtl' : 'ltr'} />
              </div>
            </div>

            {/* Email & Year Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={cn("text-slate-700 font-bold", isAr && 'block')}>{t('login.email')}</Label>
                <Input type="email" value={form.email} onChange={update('email')} placeholder="mail@fci.edu" 
                  className="h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className={cn("text-slate-700 font-bold", isAr && 'block')}>{isAr ? 'السنة الدراسية' : 'Academic Year'}</Label>
                <select value={form.year} onChange={update('year')}
                  className={cn("w-full h-12 rounded-xl border border-slate-200 bg-background px-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none", isAr && "text-right")}
                  dir={isAr ? 'rtl' : 'ltr'}>
                  <option value="">{isAr ? 'اختر السنة' : 'Select year'}</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>{isAr ? `السنة ${y}` : `Year ${y}`}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className={cn("text-slate-700 font-bold", isAr && 'block')}>{t('login.password')}</Label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')}
                  placeholder="••••••••" dir="ltr" className={cn('h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all', isAr ? 'pl-12' : 'pr-12')} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className={cn('absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2', isAr ? 'left-2' : 'right-2')}>
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Modern Strength Indicator */}
              {strength && (
                <div className="px-1 pt-1">
                  <div className="flex gap-1.5 mb-1">
                    {[1,2,3].map(l => (
                      <div key={l} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', l <= strength.level ? strength.color : 'bg-slate-100')} />
                    ))}
                  </div>
                  <p className={cn('text-[10px] font-bold uppercase tracking-wider', isAr ? 'text-right' : 'text-left', strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-amber-500' : 'text-emerald-500')}>
                    {strength.label} {isAr ? 'كلمة مرور' : 'Password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className={cn("text-slate-700 font-bold", isAr && 'block')}>{isAr ? 'تأكيد الباسورد' : 'Confirm Password'}</Label>
              <Input type="password" value={form.confirmPassword} onChange={update('confirmPassword')}
                placeholder="••••••••" dir="ltr" 
                className={cn('h-12 border-slate-200 rounded-xl focus:ring-4 transition-all',
                  form.confirmPassword && (form.confirmPassword === form.password ? 'border-emerald-500 focus:ring-emerald-500/10' : 'border-red-500 focus:ring-red-500/10')
                )} />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className={cn('flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium', isAr && 'flex-row-reverse')}>
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] mt-4">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {isAr ? 'جاري التجهيز...' : 'Setting up...'}</>
                : (isAr ? 'إنشاء حسابي الآن' : 'Create My Account')}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 font-medium mt-8">
            {isAr ? 'عضو في مجتمعنا بالفعل؟' : 'Already part of our community?'}{' '}
            <Link to="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
              {isAr ? 'سجّل دخول' : 'Sign in'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}