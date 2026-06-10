import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileDown, Video, BookOpen, AlertCircle, ExternalLink,
  ChevronLeft, ChevronRight, PlayCircle, FileText,
  User, Clock, Hash, List, ChevronDown, ChevronUp
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
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-blue-500/20',   solid: 'bg-blue-500' },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-500',border: 'border-emerald-500/20',solid: 'bg-emerald-500'},
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20', solid: 'bg-violet-500' },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'border-amber-500/20',  solid: 'bg-amber-500' },
};

const extractVideoId = (url) => {
  if (!url) return '';
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
  return m ? m[1] : '';
};

// ── Lecture Row ───────────────────────────────────────────────────
const LectureRow = ({ lecture, idx, isActive, onSelect, isAr, col }) => {
  const title = isAr ? lecture.title?.ar : (lecture.title?.en || lecture.title?.ar);
  const hasVideo = !!(lecture.videoId || lecture.videoUrl);
  const hasPDF = !!lecture.pdfUrl;

  return (
    <button
      onClick={() => onSelect(idx)}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-start',
        isActive
          ? cn('border-transparent ring-2 ring-offset-0', col.bg, col.text.replace('text-', 'ring-') )
          : 'border-border hover:bg-muted/40',
        isAr && 'flex-row-reverse text-right'
      )}
    >
      {/* Number */}
      <span className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
        isActive ? cn(col.solid, 'text-white') : 'bg-muted text-muted-foreground'
      )}>
        {idx + 1}
      </span>

      {/* Title */}
      <span className={cn('flex-1 text-sm font-medium leading-snug truncate', isActive && col.text)}>
        {title}
      </span>

      {/* Badges */}
      <div className={cn('flex items-center gap-1.5 shrink-0', isAr && 'flex-row-reverse')}>
        {hasVideo && <Video className={cn('w-3.5 h-3.5', isActive ? col.text : 'text-muted-foreground/50')} />}
        {hasPDF && <FileText className={cn('w-3.5 h-3.5', isActive ? col.text : 'text-muted-foreground/50')} />}
        {lecture.duration && (
          <span className="text-xs text-muted-foreground">{lecture.duration}</span>
        )}
      </div>
    </button>
  );
};

// ── Video Player ──────────────────────────────────────────────────
const VideoPlayer = ({ videoId, videoUrl, title }) => {
  const id = videoId || extractVideoId(videoUrl);
  if (!id) return (
    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
      <div className="text-center text-muted-foreground">
        <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">لا يوجد فيديو لهذه المحاضرة</p>
      </div>
    </div>
  );
  return (
    <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-lg bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${id}?rel=0`}
        title={title}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const lectures = subject?.lectures?.filter(l => l.type === 'lecture' && l.isVisible !== false).sort((a,b) => a.order - b.order) || [];
  const sections = subject?.lectures?.filter(l => l.type === 'section' && l.isVisible !== false).sort((a,b) => a.order - b.order) || [];
  const currentList = activeTab === 'lectures' ? lectures : sections;
  const activeLecture = currentList[selectedIdx];

  // ── Loading ──
  if (loading) return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Skeleton className="aspect-video rounded-xl" /></div>
          <div className="space-y-3">{Array(5).fill(0).map((_,i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        </div>
      </div>
    </DashboardLayout>
  );

  // ── Error ──
  if (error || !subject) return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{error || 'المادة غير موجودة'}</p>
        </div>
      </div>
    </DashboardLayout>
  );

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
          <div className={cn('flex flex-wrap items-start gap-4 mb-6', isAr && 'flex-row-reverse')}>
            <div className={cn('p-3 rounded-xl', col.bg)}>
              <BookOpen className={cn('w-6 h-6', col.text)} />
            </div>
            <div className={cn('flex-1', isAr && 'text-right')}>
              <h1 className="text-3xl font-black tracking-tight mb-1">{getName(subject.name)}</h1>
              <div className={cn('flex flex-wrap items-center gap-3 text-sm text-muted-foreground', isAr && 'flex-row-reverse')}>
                {subject.code && <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" />{subject.code}</span>}
                {subject.instructor && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />د. {subject.instructor}</span>}
                {subject.creditHours && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{subject.creditHours} {isAr ? 'ساعات' : 'Credits'}</span>}
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', col.bg, col.text)}>
                  {isAr ? meta.ar : meta.en}
                </span>
              </div>
              {subject.description && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  {getName(subject.description)}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedIdx(0); }} dir={isAr ? 'rtl' : 'ltr'}>
            <TabsList className="mb-5 h-10">
              <TabsTrigger value="lectures" className="gap-1.5">
                <Video className="w-3.5 h-3.5" />
                {isAr ? `المحاضرات (${lectures.length})` : `Lectures (${lectures.length})`}
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-1.5">
                <List className="w-3.5 h-3.5" />
                {isAr ? `السكاشن (${sections.length})` : `Sections (${sections.length})`}
              </TabsTrigger>
            </TabsList>

            {['lectures', 'sections'].map(tabKey => {
              const list = tabKey === 'lectures' ? lectures : sections;
              const active = list[selectedIdx];
              const activeTitle = active ? getName(active.title) : '';

              return (
                <TabsContent key={tabKey} value={tabKey}>
                  {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="p-4 bg-muted rounded-full mb-4">
                        <Video className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <p className="text-muted-foreground">
                        {isAr ? `لا يوجد ${tabKey === 'lectures' ? 'محاضرات' : 'سكاشن'} بعد` : `No ${tabKey} yet`}
                      </p>
                    </div>
                  ) : (
                    <div className={cn('grid gap-5', sidebarOpen ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1')}>

                      {/* ── Main Content Panel ── */}
                      <div className={cn('space-y-4', sidebarOpen ? 'lg:col-span-2' : '')}>

                        {/* Lecture title + meta */}
                        {active && (
                          <div className={cn('flex items-center gap-3', isAr && 'flex-row-reverse')}>
                            <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', col.bg, col.text)}>
                              {isAr ? `${tabKey === 'lectures' ? 'محاضرة' : 'سكشن'} ${selectedIdx + 1}` : `${tabKey === 'lectures' ? 'Lecture' : 'Section'} ${selectedIdx + 1}`}
                            </span>
                            {active.duration && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />{active.duration}
                              </span>
                            )}
                            <h2 className={cn('font-bold text-base flex-1 truncate', isAr && 'text-right')}>
                              {activeTitle}
                            </h2>
                          </div>
                        )}

                        {/* ── Video ── */}
                        <VideoPlayer videoId={active?.videoId} videoUrl={active?.videoUrl} title={activeTitle} />

                        {/* ── PDF Section — مهم جداً ── */}
                        {active && (
                          <div className={cn(
                            'rounded-2xl border-2 p-5',
                            active.pdfUrl
                              ? cn(col.border, col.bg)
                              : 'border-dashed border-border bg-muted/20'
                          )}>
                            {active.pdfUrl ? (
                              /* ✅ PDF موجود */
                              <div className={cn('flex flex-col sm:flex-row items-start sm:items-center gap-4', isAr && 'flex-row-reverse')}>
                                <div className={cn('p-3 rounded-xl bg-background/80 shrink-0', col.text)}>
                                  <FileText className="w-8 h-8" />
                                </div>
                                <div className={cn('flex-1 min-w-0', isAr && 'text-right')}>
                                  <p className={cn('font-bold text-base mb-0.5', col.text)}>
                                    {isAr ? 'ملف المحاضرة (PDF)' : 'Lecture File (PDF)'}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {active.pdfName || (isAr ? 'ملف PDF للمحاضرة' : 'Lecture PDF file')}
                                  </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <a
                                    href={active.pdfUrl}
                                    download
                                    className={cn(
                                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg',
                                      col.solid
                                    )}
                                  >
                                    <FileDown className="w-4 h-4" />
                                    {isAr ? 'تحميل PDF' : 'Download PDF'}
                                  </a>
                                  <a
                                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(active.pdfUrl)}&embedded=true`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-background hover:bg-muted transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    {isAr ? 'فتح' : 'Open'}
                                  </a>
                                </div>
                              </div>
                            ) : (
                              /* ❌ PDF مش موجود */
                              <div className={cn('flex items-center gap-3 text-muted-foreground', isAr && 'flex-row-reverse')}>
                                <FileText className="w-6 h-6 opacity-30 shrink-0" />
                                <p className="text-sm">
                                  {isAr ? 'لا يوجد PDF لهذه المحاضرة بعد' : 'No PDF available for this lecture yet'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Nav buttons */}
                        {active && (
                          <div className={cn('flex items-center gap-2', isAr && 'flex-row-reverse')}>
                            <button
                              onClick={() => setSelectedIdx(i => Math.max(0, i - 1))}
                              disabled={selectedIdx === 0}
                              className="flex items-center gap-1 text-xs px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                              {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                              {isAr ? 'السابق' : 'Previous'}
                            </button>
                            <span className="text-sm text-muted-foreground mx-auto font-medium">
                              {selectedIdx + 1} / {list.length}
                            </span>
                            <button
                              onClick={() => setSelectedIdx(i => Math.min(list.length - 1, i + 1))}
                              disabled={selectedIdx === list.length - 1}
                              className={cn(
                                'flex items-center gap-1 text-xs px-4 py-2 rounded-xl text-white transition-all font-medium',
                                selectedIdx === list.length - 1
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
                                  : cn(col.solid, 'hover:opacity-90')
                              )}
                            >
                              {isAr ? 'التالي' : 'Next'}
                              {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ── Sidebar playlist ── */}
                      <div className="space-y-2">
                        {/* Sidebar toggle */}
                        <button
                          onClick={() => setSidebarOpen(p => !p)}
                          className={cn('hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2', isAr && 'flex-row-reverse')}
                        >
                          {sidebarOpen
                            ? <><ChevronUp className="w-3.5 h-3.5" />{isAr ? 'إخفاء القائمة' : 'Hide List'}</>
                            : <><ChevronDown className="w-3.5 h-3.5" />{isAr ? 'عرض القائمة' : 'Show List'}</>
                          }
                        </button>

                        <div className={cn('rounded-xl border border-border bg-card overflow-hidden', !sidebarOpen && 'hidden lg:hidden')}>
                          <div className={cn('flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30', isAr && 'flex-row-reverse')}>
                            <h3 className="text-sm font-semibold">
                              {isAr ? 'قائمة المحاضرات' : 'Playlist'}
                            </h3>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', col.bg, col.text)}>
                              {list.length}
                            </span>
                          </div>
                          <div className="p-2 space-y-1 max-h-[480px] overflow-y-auto">
                            {list.map((lec, i) => (
                              <LectureRow
                                key={lec._id || i}
                                lecture={lec}
                                idx={i}
                                isActive={selectedIdx === i}
                                onSelect={setSelectedIdx}
                                isAr={isAr}
                                col={col}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default SubjectDetailPage;