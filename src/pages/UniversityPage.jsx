import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { GraduationCap, BookOpen, Code2, BrainCircuit, Rocket, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const YEARS = [
  {
    id: '1', key: 'year_1',
    icon: BookOpen,
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    border: 'border-blue-500/30 hover:border-blue-500/60',
    iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500',
    badge: 'bg-blue-500/10 text-blue-600',
    subjects: 8,
    description: { ar: 'الأساسيات والرياضيات وأول خطواتك في البرمجة', en: 'Fundamentals, Mathematics and your first programming steps' },
    topics: ['الرياضيات', 'فيزياء', 'مقدمة CS', 'رياضيات متقطعة'],
    level: { ar: 'مبتدئ', en: 'Beginner' },
  },
  {
    id: '2', key: 'year_2',
    icon: Code2,
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600',
    subjects: 6,
    description: { ar: 'هياكل البيانات والخوارزميات وقواعد البيانات', en: 'Data Structures, Algorithms and Databases' },
    topics: ['هياكل بيانات', 'قواعد بيانات', 'شبكات', 'نظم تشغيل'],
    level: { ar: 'متوسط', en: 'Intermediate' },
  },
  {
    id: '3', key: 'year_3',
    icon: BrainCircuit,
    gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
    border: 'border-violet-500/30 hover:border-violet-500/60',
    iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500',
    badge: 'bg-violet-500/10 text-violet-600',
    subjects: 6,
    description: { ar: 'هندسة البرمجيات والتخصصات المتقدمة', en: 'Software Engineering and Advanced Specializations' },
    topics: ['هندسة برمجيات', 'تطوير ويب', 'ذكاء اصطناعي', 'أمن'],
    level: { ar: 'متقدم', en: 'Advanced' },
  },
  {
    id: '4', key: 'year_4',
    icon: Rocket,
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-600',
    subjects: 4,
    description: { ar: 'مشروع التخرج والتخصص النهائي وسوق العمل', en: 'Graduation Project, Final Specialization and Job Market' },
    topics: ['مشروع تخرج', 'تدريب عملي', 'تخصص متقدم'],
    level: { ar: 'احتراف', en: 'Professional' },
  },
];

const UniversityPage = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const getName = (o) => isAr ? o?.ar : (o?.en || o?.ar);

  return (
    <>
      <Helmet><title>{t('university.title')} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-6" dir={isAr ? 'rtl' : 'ltr'}>

          {/* ── Header ── */}
          <div className="mb-10">
            <div className={cn('flex items-center gap-2 mb-3', isAr && 'flex-row-reverse')}>
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {isAr ? 'الرحلة الأكاديمية' : 'Academic Journey'}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3">{t('university.select_year')}</h1>
            <p className="text-muted-foreground text-lg">
              {isAr ? '٤ سنوات دراسية — ٨ ترمات — مئات المحاضرات والملفات' : '4 Academic Years — 8 Terms — Hundreds of Lectures & Files'}
            </p>
          </div>

          {/* ── Year Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {YEARS.map((yr, idx) => {
              const Icon = yr.icon;
              return (
                <Link to={`/university/${yr.id}`} key={yr.id} className="block group">
                  <div className={cn(
                    'relative h-full rounded-2xl border-2 bg-card overflow-hidden transition-all duration-300',
                    'hover:shadow-xl hover:-translate-y-1',
                    yr.border
                  )}>
                    {/* BG gradient */}
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', yr.gradient)} />

                    {/* Year number watermark */}
                    <div className={cn('absolute text-[120px] font-black opacity-[0.04] leading-none select-none', isAr ? 'left-4 bottom-2' : 'right-4 bottom-2')}>
                      {yr.id}
                    </div>

                    <div className="relative z-10 p-6">
                      {/* Top row */}
                      <div className={cn('flex items-start justify-between mb-5', isAr && 'flex-row-reverse')}>
                        <div className={cn('p-3 rounded-xl', yr.iconBg)}>
                          <Icon className={cn('w-7 h-7', yr.iconColor)} />
                        </div>
                        <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', yr.badge)}>
                          {getName(yr.level)}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-black mb-2">{t(`university.${yr.key}`)}</h2>
                      <p className={cn('text-sm text-muted-foreground mb-5 leading-relaxed', isAr && 'text-right')}>
                        {getName(yr.description)}
                      </p>

                      {/* Topics pills */}
                      <div className={cn('flex flex-wrap gap-2 mb-5', isAr && 'flex-row-reverse')}>
                        {yr.topics.map((t, i) => (
                          <span key={i} className="text-xs bg-background/70 border border-border px-2.5 py-1 rounded-full text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className={cn('flex items-center justify-between pt-4 border-t border-border/50', isAr && 'flex-row-reverse')}>
                        <span className="text-sm text-muted-foreground">
                          {yr.subjects}+ {isAr ? 'مادة دراسية' : 'Subjects'}
                        </span>
                        <span className={cn('flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2', isAr && 'flex-row-reverse')}>
                          {isAr ? 'ابدأ' : 'Start'}
                          <ChevronRight className={cn('w-4 h-4', isAr && 'rotate-180')} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Journey timeline ── */}
          <div className="mt-12 p-6 rounded-2xl bg-muted/30 border border-border">
            <h3 className={cn('font-bold text-base mb-5', isAr && 'text-right')}>
              {isAr ? '📍 مسار رحلتك الدراسية' : '📍 Your Academic Journey'}
            </h3>
            <div className={cn('flex items-center gap-0', isAr && 'flex-row-reverse')}>
              {YEARS.map((yr, idx) => {
                const Icon = yr.icon;
                return (
                  <React.Fragment key={yr.id}>
                    <Link to={`/university/${yr.id}`}
                      className={cn('flex flex-col items-center gap-2 px-3 py-2 rounded-xl hover:bg-background transition-colors group flex-1', isAr && 'items-center')}>
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', yr.iconBg)}>
                        <Icon className={cn('w-5 h-5', yr.iconColor)} />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">{t(`university.${yr.key}`)}</span>
                    </Link>
                    {idx < YEARS.length - 1 && (
                      <div className="flex-shrink-0 w-8 h-0.5 bg-border" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default UniversityPage;