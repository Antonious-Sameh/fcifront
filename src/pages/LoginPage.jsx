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
  GraduationCap, Eye, EyeOff, Loader2,
  BookOpen, Briefcase, BrainCircuit, ShieldCheck, AlertCircle, ArrowRight, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: GraduationCap, ar: 'نظام المواد والمحاضرات',  en: 'Subjects & Lectures System' },
  { icon: Briefcase,     ar: 'مسارات مهنية احترافية',   en: 'Professional Career Tracks' },
  { icon: BrainCircuit,  ar: 'مساعد ذكاء اصطناعي',      en: 'AI-Powered Assistant'       },
  { icon: ShieldCheck,   ar: 'نظام آمن ومحمي',          en: 'Secure & Protected System'  },
];

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError(t('login.error_empty')); return; }
    setLoading(true); setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.error || t('login.error_invalid'));
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet><title>{t('login.title')} | Student Core</title></Helmet>

      {/* ── Left panel (Modern Dark Side) ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0F172A]">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />

        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-center gap-4', isAr && 'flex-row-reverse')}
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Road To Career
            </span>
          </motion.div>

          {/* Hero Content */}
          <div className={cn("max-w-md", isAr ? 'text-right' : 'text-left')}>
            <motion.h2 
              initial={{ opacity: 0, x: isAr ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-black mb-6 leading-[1.1] tracking-tight"
            >
              {isAr ? 'ارتقِ بتجربتك الجامعية' : 'Level up your Uni life'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg mb-12 leading-relaxed"
            >
              {isAr
                ? 'منصة ذكية تجمع لك كل ما تحتاجه في مكان واحد لتصل إلى أهدافك الأكاديمية والمهنية.'
                : 'A smart platform that gathers everything you need in one place to reach your academic and professional goals.'}
            </motion.p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.4 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group',
                    isAr && 'flex-row-reverse'
                  )}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-slate-200 font-medium">{isAr ? f.ar : f.en}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-sm font-medium">© 2026 FCI Platform — Crafting Future Leaders</p>
        </div>
      </div>

      {/* ── Right panel (Clean Form) ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px] mx-auto"
        >
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex justify-center mb-10">
             <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
          </div>

          <div className={cn('mb-10', isAr && 'text-right')}>
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{t('login.title')}</h1>
            <p className="text-slate-500 font-medium">{t('login.subtitle')}</p>
          </div>

          {/* Info Card */}
          {/* <div className={cn(
            'group relative p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-8 transition-all hover:border-primary/30',
            isAr && 'text-right'
          )}>
            <div className={cn('flex items-center gap-2 mb-2', isAr && 'flex-row-reverse')}>
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <BrainCircuit className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-sm text-slate-700">{isAr ? 'بيانات الوصول السريع:' : 'Quick Access:'}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-mono">Admin: admin@fci.edu / admin123456</p>
              <p className="text-xs text-slate-500 font-mono">Student: student@fci.edu / student123</p>
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className={cn("text-slate-700 font-bold", isAr && 'block')}>{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="name@university.edu"
                className="h-12 border-slate-200 focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <div>
                <Label htmlFor="password" className="text-slate-700 font-bold">{t('login.password')}</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className={cn('h-12 border-slate-200 focus:ring-4 focus:ring-primary/10 rounded-xl transition-all', isAr ? 'pl-12' : 'pr-12')}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className={cn('absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2', isAr ? 'left-2' : 'right-2')}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn('flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium', isAr && 'flex-row-reverse')}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isAr ? 'جاري التحقق...' : 'Verifying...'}</span>
                </div>
              ) : (
                <div className={cn("flex items-center gap-2", isAr && "flex-row-reverse")}>
                  <span>{t('login.submit')}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
             <p className="text-slate-500 font-medium">
                {isAr ? 'عضو جديد هنا؟' : "New student here?"}{' '}
                <Link to="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                  {isAr ? 'إنشاء حساب طالب' : 'Create account'}
                </Link>
              </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}