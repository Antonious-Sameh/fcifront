import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileDown, Video, BookOpen, AlertCircle, ExternalLink,
  ChevronLeft, ChevronRight, PlayCircle, FileText,
  User, Clock, Hash, List, Play
} from 'lucide-react';
import { subjectsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────
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
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-600',    border: 'border-blue-500/25',    solid: 'bg-blue-500',    ring: 'ring-blue-500/30'    },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/25', solid: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-600',  border: 'border-violet-500/25',  solid: 'bg-violet-500',  ring: 'ring-violet-500/30'  },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-600',   border: 'border-amber-500/25',   solid: 'bg-amber-500',   ring: 'ring-amber-500/30'   },
};

const extractVideoId = (url) => {
  if (!url) return '';
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/\n]+)/);
  return m ? m[1] : '';
};

// ── Lecture Row ───────────────────────────────────────────────────
const LectureRow = ({ lecture, idx, isActive, onSelect, isAr, col }) => {
  const title = isAr ? lecture.title?.ar : (lecture.title?.en || lecture.title?.ar);
  const hasVideo = !!(lecture.videoId || lecture.videoUrl);
  const hasPDF = !!lecture.pdfUrl;
  const vidId = lecture.videoId || extractVideoId(lecture.videoUrl);
  const thumb = vidId ? `https://img.youtube.com/vi/${vidId}/default.jpg` : null;

  return (
    <button
      onClick={() => onSelect(idx)}
      className={cn(
        'w-full group flex gap-3 p-3 rounded-xl border transition-all duration-200',
        isAr ? 'flex-row-reverse text-right' : 'text-left',
        isActive
          ? cn('border-transparent ring-2', col.ring, col.bg)
          : 'border-transparent hover:bg-muted/50 hover:border-border/50'
      )}
    >
      {/* Thumbnail / Number */}
      <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className={cn('w-full h-full flex items-center justify-center', isActive ? col.bg : 'bg-muted')}>
            <span className={cn('text-sm font-black', isActive ? col.text : 'text-muted-foreground')}>
              {idx + 1}
            </span>
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', col.solid)}>
              <Play className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          </div>
        )}
        {!isActive && thumb && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
            <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold leading-snug line-clamp-2', isActive ? col.text : 'text-foreground')}>
          {title}
        </p>
        <div className={cn('flex items-center gap-2 mt-1', isAr && 'flex-row-reverse')}>
          {hasVideo && <Video className="w-3 h-3 text-muted-foreground/60" />}
          {hasPDF && <FileText className="w-3 h-3 text-muted-foreground/60" />}
          {lecture.duration && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />{lecture.duration}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ── PDF Card ──────────────────────────────────────────────────────
const PDFCard = ({ lecture, isAr, col }) => {
  if (!lecture) return null;

  return (
    <div className={cn(
      'rounded-2xl border-2 p-5 transition-all',
      lecture.pdfUrl ? cn(col.border, col.bg) : 'border-dashed border-border bg-muted/20'
    )}>
      {lecture.pdfUrl ? (
        <div className={cn('flex flex-col sm:flex-row items-start sm:items-center gap-4', isAr && 'flex-row-reverse')}>
          {/* Icon */}
          <div className={cn('p-3.5 rounded-2xl bg-background/80 shadow-sm shrink-0', col.text)}>
            <FileText className="w-7 h-7" />
          </div>
          {/* Text */}
          <div className={cn('flex-1 min-w-0', isAr && 'text-right')}>
            <p className={cn('font-bold text-sm', col.text)}>
              {isAr ? 'ملف PDF المحاضرة' : 'Lecture PDF'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {lecture.pdfName || (isAr ? 'ملف PDF' : 'PDF file')}
            </p>
          </div>
          {/* Buttons */}
          <div className={cn('flex gap-2 shrink-0', isAr && 'flex-row-reverse')}>
            <a
              href={`https://docs.google.com/viewer?url=${encodeURIComponent(lecture.pdfUrl)}&embedded=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-background hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {isAr ? 'فتح' : 'Open'}
            </a>
            <a
              href={lecture.pdfUrl}
              download
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-md',
                col.solid
              )}
            >
              <FileDown className="w-3.5 h-3.5" />
              {isAr ? 'تحميل' : 'Download'}
            </a>
          </div>
        </div>
      ) : (
        <div className={cn('flex items-center gap-3 text-muted-foreground', isAr && 'flex-row-reverse')}>
          <FileText className="w-5 h-5 opacity-25 shrink-0" />
          <p className="text-sm">{isAr ? 'لا يوجد PDF لهذه المحاضرة' : 'No PDF available for this lecture'}</p>
        </div>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────
const SubjectDetailPage = () => {
  const { year, term, subject: slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lectures');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [playerKey, setPlayerKey] = useState(0);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    subjectsAPI.getBySlug(slug)
      .then(d => setSubject(d.subject))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const getName = (o) => isAr ? o?.ar : (o?.en || o?.ar);
  const meta = YEAR_META[year] || YEAR_META[1];
  const col = COLOR[meta.color] || COLOR.blue;

  const lectures = subject?.lectures?.filter(l => l.type === 'lecture' && l.isVisible !== false).sort((a, b) => a.order - b.order) || [];
  const sections = subject?.lectures?.filter(l => l.type === 'section' && l.isVisible !== false).sort((a, b) => a.order - b.order) || [];
  const currentList = activeTab === 'lectures' ? lectures : sections;
  const active = currentList[selectedIdx];

  const handleSelect = (idx) => {
    if (idx === selectedIdx) return;
    setSelectedIdx(idx);
    setPlayerKey(k => k + 1);
    const el = sidebarRef.current?.querySelector(`[data-si="${idx}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const switchTab = (tab) => { setActiveTab(tab); setSelectedIdx(0); setPlayerKey(k => k + 1); };

  // ── Loading ──
  if (loading) return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className="space-y-2">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  // ── Error ──
  if (error || !subject) return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 p-5 bg-destructive/8 rounded-2xl border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-destructive text-sm font-medium">{error || 'المادة غير موجودة'}</p>
        </div>
      </div>
    </DashboardLayout>
  );

  const vidId = active?.videoId || extractVideoId(active?.videoUrl || '');

  return (
    <>
      <Helmet><title>{getName(subject.name)} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6" dir={isAr ? 'rtl' : 'ltr'}>

          {/* Back */}
          <button
            onClick={() => navigate(`/university/${year}/${term}`)}
            className={cn('flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors', isAr && 'flex-row-reverse')}
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isAr ? (TERM_META[term]?.ar || 'الترم') : (TERM_META[term]?.en || 'Term')}
          </button>

          {/* Subject Header */}
          <div className={cn('flex items-start gap-4 mb-7', isAr && 'flex-row-reverse')}>
            <div className={cn('p-3.5 rounded-2xl shadow-sm shrink-0', col.bg)}>
              <BookOpen className={cn('w-7 h-7', col.text)} />
            </div>
            <div className={cn('flex-1', isAr && 'text-right')}>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 leading-tight">
                {getName(subject.name)}
              </h1>
              <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground', isAr && 'flex-row-reverse')}>
                {subject.code && (
                  <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider">
                    <Hash className="w-3.5 h-3.5" />{subject.code}
                  </span>
                )}
                {subject.instructor && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {isAr ? `د. ${subject.instructor}` : `Dr. ${subject.instructor}`}
                  </span>
                )}
                {subject.creditHours && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {subject.creditHours} {isAr ? 'ساعات' : 'cr. hrs'}
                  </span>
                )}
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', col.bg, col.text)}>
                  {isAr ? meta.ar : meta.en}
                </span>
              </div>
              {subject.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                  {getName(subject.description)}
                </p>
              )}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className={cn('flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl w-fit', isAr && 'flex-row-reverse')}>
            {[
              { key: 'lectures', label: isAr ? `المحاضرات` : 'Lectures', count: lectures.length, icon: Video },
              { key: 'sections', label: isAr ? `السكاشن` : 'Sections', count: sections.length, icon: List },
            ].map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  activeTab === key
                    ? cn('bg-background shadow-sm', col.text)
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-bold',
                  activeTab === key ? cn(col.bg, col.text) : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          {currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className={cn('p-5 rounded-2xl mb-4', col.bg)}>
                <Video className={cn('w-10 h-10', col.text)} />
              </div>
              <p className="text-muted-foreground text-sm">
                {isAr
                  ? `لا يوجد ${activeTab === 'lectures' ? 'محاضرات' : 'سكاشن'} متاحة بعد`
                  : `No ${activeTab} available yet`}
              </p>
            </div>
          ) : (
            <div className={cn('grid gap-5', 'grid-cols-1 lg:grid-cols-3')}>

              {/* ── Main Panel ── */}
              <div className="lg:col-span-2 space-y-4">

                {/* Active label */}
                {active && (
                  <div className={cn('flex items-center gap-2.5', isAr && 'flex-row-reverse')}>
                    <span className={cn('text-xs px-3 py-1 rounded-full font-bold', col.bg, col.text)}>
                      {isAr
                        ? `${activeTab === 'lectures' ? 'محاضرة' : 'سكشن'} ${selectedIdx + 1}`
                        : `${activeTab === 'lectures' ? 'Lecture' : 'Section'} ${selectedIdx + 1}`}
                    </span>
                    {active.duration && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{active.duration}
                      </span>
                    )}
                    <h2 className={cn('font-bold text-base flex-1 truncate leading-snug', isAr && 'text-right')}>
                      {getName(active.title)}
                    </h2>
                  </div>
                )}

                {/* Video Player */}
                {vidId ? (
                  <div className="rounded-2xl overflow-hidden shadow-xl bg-black">
                    <div className="aspect-video">
                      <iframe
                        key={playerKey}
                        src={`https://www.youtube.com/embed/${vidId}?rel=0`}
                        title={active ? getName(active.title) : ''}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={cn('aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3', col.border, col.bg)}>
                    <PlayCircle className={cn('w-14 h-14 opacity-25', col.text)} />
                    <p className="text-sm text-muted-foreground">
                      {isAr ? 'لا يوجد فيديو لهذه المحاضرة' : 'No video available'}
                    </p>
                  </div>
                )}

                {/* PDF Card */}
                {active && <PDFCard lecture={active} isAr={isAr} col={col} />}

                {/* Prev / Next */}
                {active && (
                  <div className={cn('flex items-center gap-3', isAr && 'flex-row-reverse')}>
                    <button
                      onClick={() => handleSelect(Math.max(0, selectedIdx - 1))}
                      disabled={selectedIdx === 0}
                      className="flex items-center gap-1.5 text-xs px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                      {isAr ? 'السابق' : 'Previous'}
                    </button>
                    <span className="text-xs text-muted-foreground mx-auto font-medium">
                      {selectedIdx + 1} / {currentList.length}
                    </span>
                    <button
                      onClick={() => handleSelect(Math.min(currentList.length - 1, selectedIdx + 1))}
                      disabled={selectedIdx === currentList.length - 1}
                      className={cn(
                        'flex items-center gap-1.5 text-xs px-5 py-2.5 rounded-xl font-semibold transition-all text-white',
                        selectedIdx === currentList.length - 1
                          ? 'bg-muted text-muted-foreground opacity-30 cursor-not-allowed'
                          : cn(col.solid, 'hover:opacity-90 hover:shadow-md')
                      )}
                    >
                      {isAr ? 'التالي' : 'Next'}
                      {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Sidebar ── */}
              <div className="space-y-3">
                {/* Header */}
                <div className={cn('flex items-center justify-between', isAr && 'flex-row-reverse')}>
                  <h3 className="text-sm font-bold">
                    {isAr ? (activeTab === 'lectures' ? 'المحاضرات' : 'السكاشن') : (activeTab === 'lectures' ? 'Lectures' : 'Sections')}
                  </h3>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold', col.bg, col.text)}>
                    {currentList.length}
                  </span>
                </div>

                {/* Progress */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', col.solid)}
                    style={{ width: `${((selectedIdx + 1) / currentList.length) * 100}%` }}
                  />
                </div>

                {/* List */}
                <div
                  ref={sidebarRef}
                  className="rounded-2xl border border-border bg-card/50 overflow-hidden"
                >
                  <div className="p-2 space-y-0.5 max-h-[520px] overflow-y-auto">
                    {currentList.map((lec, i) => (
                      <div key={lec._id || i} data-si={i}>
                        <LectureRow
                          lecture={lec}
                          idx={i}
                          isActive={selectedIdx === i}
                          onSelect={handleSelect}
                          isAr={isAr}
                          col={col}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default SubjectDetailPage;