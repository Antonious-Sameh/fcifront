import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen, FolderOpen, AlertCircle, ChevronRight,
  ChevronLeft, Video, FileText, Clock, User
} from 'lucide-react';
import { subjectsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const YEAR_META = {
  1: { ar: 'السنة الأولى', en: 'Year 1', color: 'blue' },
  2: { ar: 'السنة الثانية', en: 'Year 2', color: 'emerald' },
  3: { ar: 'السنة الثالثة', en: 'Year 3', color: 'violet' },
  4: { ar: 'السنة الرابعة', en: 'Year 4', color: 'amber' },
};
const TERM_META = {
  1: { ar: 'الترم الأول', en: 'First Term' },
  2: { ar: 'الترم الثاني', en: 'Second Term' },
};
const COLOR = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'hover:border-blue-500/40',   badge: 'bg-blue-500/10 text-blue-600'   },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-500',border: 'hover:border-emerald-500/40',badge: 'bg-emerald-500/10 text-emerald-600'},
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'hover:border-violet-500/40', badge: 'bg-violet-500/10 text-violet-600' },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'hover:border-amber-500/40',  badge: 'bg-amber-500/10 text-amber-600'  },
};

const SubjectCard = ({ subject, year, term, language, col }) => {
  const isAr = language === 'ar';
  const getName = (o) => isAr ? o?.ar : (o?.en || o?.ar);
  const lectureCount = subject.lectures?.length || 0;
  const videoCount = subject.lectures?.filter(l => l.videoId || l.videoUrl).length || 0;
  const pdfCount = subject.lectures?.filter(l => l.pdfUrl).length || 0;

  return (
    <Link to={`/university/${year}/${term}/${subject.slug}`} className="block group">
      <div className={cn(
        'h-full rounded-2xl border border-border bg-card p-5',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        col.border
      )}>
        {/* Icon + Code */}
        <div className={cn('flex items-start justify-between mb-4', isAr && 'flex-row-reverse')}>
          <div className={cn('p-2.5 rounded-xl', col.bg)}>
            <BookOpen className={cn('w-5 h-5', col.text)} />
          </div>
          {subject.code && (
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
              {subject.code}
            </code>
          )}
        </div>

        {/* Name */}
        <h3 className={cn('font-bold text-base mb-1.5 group-hover:text-primary transition-colors leading-snug', isAr && 'text-right')}>
          {getName(subject.name)}
        </h3>

        {/* Description */}
        {subject.description && (
          <p className={cn('text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed', isAr && 'text-right')}>
            {getName(subject.description)}
          </p>
        )}

        {/* Meta row */}
        <div className={cn('flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap', isAr && 'flex-row-reverse')}>
          {subject.instructor && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> د. {subject.instructor}
            </span>
          )}
          {subject.creditHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {subject.creditHours} {isAr ? 'ساعات' : 'hrs'}
            </span>
          )}
        </div>

        {/* Content badges */}
        <div className={cn('flex items-center gap-2 flex-wrap', isAr && 'flex-row-reverse')}>
          {lectureCount > 0 ? (
            <>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', col.badge)}>
                {lectureCount} {isAr ? 'محاضرة' : 'Lectures'}
              </span>
              {videoCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                  <Video className="w-2.5 h-2.5" /> {videoCount}
                </span>
              )}
              {pdfCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5" /> {pdfCount}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">
              {isAr ? 'لا يوجد محتوى بعد' : 'No content yet'}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className={cn('flex items-center gap-1 mt-4 pt-4 border-t border-border text-xs font-semibold', col.text, isAr && 'flex-row-reverse')}>
          {isAr ? 'عرض المحاضرات' : 'View Lectures'}
          <ChevronRight className={cn('w-3.5 h-3.5', isAr && 'rotate-180')} />
        </div>
      </div>
    </Link>
  );
};

const SubjectsListPage = () => {
  const { year, term } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    subjectsAPI.getByYearTerm(year, term)
      .then(d => setSubjects(d.subjects || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [year, term]);

  const meta = YEAR_META[year] || YEAR_META[1];
  const col = COLOR[meta.color] || COLOR.blue;
  const yearLabel = isAr ? meta.ar : meta.en;
  const termLabel = isAr ? TERM_META[term]?.ar : TERM_META[term]?.en;

  return (
    <>
      <Helmet><title>{termLabel} — {yearLabel} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-6" dir={isAr ? 'rtl' : 'ltr'}>

          {/* Back */}
          <button
            onClick={() => navigate(`/university/${year}`)}
            className={cn('flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors', isAr && 'flex-row-reverse')}
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {yearLabel}
          </button>

          {/* Header */}
          <div className={cn('mb-8', isAr && 'text-right')}>
            <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3', col.bg, col.text)}>
              {yearLabel} — {termLabel}
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              {isAr ? 'المواد الدراسية' : 'Subjects'}
            </h1>
            <p className="text-muted-foreground">
              {loading ? '...' : `${subjects.length} ${isAr ? 'مادة دراسية' : 'subjects'}`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20 mb-6">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && subjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-5 bg-muted rounded-full mb-4">
                <FolderOpen className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">
                {isAr ? 'لا توجد مواد لهذا الترم بعد' : 'No subjects for this term yet'}
              </p>
              <p className="text-muted-foreground/60 text-sm">
                {isAr ? 'يمكن للأدمن إضافة مواد من لوحة التحكم' : 'Admin can add subjects from the dashboard'}
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map(subject => (
                <SubjectCard
                  key={subject._id}
                  subject={subject}
                  year={year}
                  term={term}
                  language={language}
                  col={col}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default SubjectsListPage;