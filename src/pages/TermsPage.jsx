import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { Library, BookOpen, ChevronRight, ChevronLeft, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const YEAR_META = {
  1: { label: { ar: 'السنة الأولى', en: 'Year 1' }, color: 'blue' },
  2: { label: { ar: 'السنة الثانية', en: 'Year 2' }, color: 'emerald' },
  3: { label: { ar: 'السنة الثالثة', en: 'Year 3' }, color: 'violet' },
  4: { label: { ar: 'السنة الرابعة', en: 'Year 4' }, color: 'amber' },
};

const COLOR = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-blue-500/30 hover:border-blue-500/60',   gradient: 'from-blue-500/15 to-transparent' },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-500',border: 'border-emerald-500/30 hover:border-emerald-500/60',gradient: 'from-emerald-500/15 to-transparent' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30 hover:border-violet-500/60', gradient: 'from-violet-500/15 to-transparent' },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'border-amber-500/30 hover:border-amber-500/60',  gradient: 'from-amber-500/15 to-transparent' },
};

const TERMS = [
  {
    id: '1',
    label: { ar: 'الترم الأول', en: 'First Term' },
    months: { ar: 'سبتمبر — يناير', en: 'September — January' },
    desc: { ar: 'الفصل الدراسي الأول من العام الأكاديمي', en: 'First semester of the academic year' },
    icon: '🍂',
  },
  {
    id: '2',
    label: { ar: 'الترم الثاني', en: 'Second Term' },
    months: { ar: 'فبراير — يونيو', en: 'February — June' },
    desc: { ar: 'الفصل الدراسي الثاني والامتحانات النهائية', en: 'Second semester and final exams' },
    icon: '🌸',
  },
];

const TermsPage = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const meta = YEAR_META[year] || YEAR_META[1];
  const col = COLOR[meta.color] || COLOR.blue;
  const yearLabel = isAr ? meta.label.ar : meta.label.en;
  const getName = (o) => isAr ? o?.ar : (o?.en || o?.ar);

  return (
    <>
      <Helmet><title>{yearLabel} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-2 md:px-4 py-6" dir={isAr ? 'rtl' : 'ltr'}>

          {/* Back */}
          <button
            onClick={() => navigate('/university')}
            className={cn('flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors', isAr && 'flex-row-reverse')}
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isAr ? 'السنوات الدراسية' : 'Academic Years'}
          </button>

          {/* Header */}
          <div className={cn('mb-10', isAr && 'text-right')}>
            <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4', col.bg, col.text)}>
              <GraduationCap className="w-3.5 h-3.5" />
              {yearLabel}
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">{t('university.select_term')}</h1>
            <p className="text-muted-foreground">{isAr ? 'اختر الترم الدراسي للوصول للمواد والمحاضرات' : 'Choose a term to access subjects and lectures'}</p>
          </div>

          {/* Term Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TERMS.map((term) => (
              <Link to={`/university/${year}/${term.id}`} key={term.id} className="block group">
                <div className={cn(
                  'relative h-full rounded-2xl border-2 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                  col.border
                )}>
                  {/* BG */}
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', col.gradient)} />
                  {/* Watermark */}
                  <div className={cn('absolute text-[100px] leading-none opacity-[0.04] select-none', isAr ? 'left-2 bottom-0' : 'right-2 bottom-0')}>
                    {term.icon}
                  </div>

                  <div className="relative z-10 p-8">
                    <div className="text-5xl mb-5">{term.icon}</div>
                    <h2 className="text-2xl font-black mb-2">{getName(term.label)}</h2>
                    <p className={cn('text-sm text-muted-foreground mb-2', isAr && 'text-right')}>
                      {getName(term.desc)}
                    </p>
                    <p className={cn('text-xs text-muted-foreground/60 mb-6', isAr && 'text-right')}>
                      📅 {getName(term.months)}
                    </p>

                    <div className={cn('flex items-center gap-2 text-sm font-semibold', col.text, isAr && 'flex-row-reverse')}>
                      {isAr ? 'عرض المواد' : 'View Subjects'}
                      <ChevronRight className={cn('w-4 h-4 transition-transform group-hover:translate-x-1', isAr && 'rotate-180 group-hover:-translate-x-1')} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TermsPage;