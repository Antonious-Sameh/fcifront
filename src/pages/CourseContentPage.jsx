import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { coursesAPI } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext.jsx';
import {
  ExternalLink, BookOpen, ArrowLeft, ArrowRight,
  AlertCircle, Play, Clock, CheckCircle, PlayCircle,
  ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/);
  return m?.[1] || null;
};

// ── Video Card في القائمة الجانبية ────────────────────────────────
const VideoCard = ({ video, index, isActive, onClick, isAr }) => {
  const ytId = getYoutubeId(video.youtubeUrl);
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full group flex gap-3 p-3 rounded-xl transition-all duration-200 text-right border',
        isAr ? 'flex-row-reverse text-right' : 'text-left',
        isActive
          ? 'bg-primary/10 border-primary/30 shadow-sm'
          : 'bg-card border-transparent hover:bg-muted/60 hover:border-border'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-5 h-5 text-muted-foreground/40" />
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
        )}
        {!isActive && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
            <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        {/* رقم الفيديو */}
        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {index + 1}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <p className={cn(
          'text-sm font-semibold line-clamp-2 leading-snug',
          isActive ? 'text-primary' : 'text-foreground'
        )}>
          {video.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {video.duration && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />{video.duration}
            </span>
          )}
          {isActive && (
            <span className="text-[11px] font-semibold text-primary">
              ▶ {isAr ? 'يعرض الآن' : 'Playing'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
export default function CourseContentPage() {
  const { courseId } = useParams();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [playerKey, setPlayerKey] = useState(0);
  const sidebarRef = useRef(null);

  const sortedVideos = course?.videos
    ? [...course.videos].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  const activeVideo = sortedVideos[activeIdx] || null;

  useEffect(() => {
    coursesAPI.getOne(courseId)
      .then((d) => setCourse(d.course))
      .catch(() => setError(isAr ? 'تعذر تحميل الكورس' : 'Failed to load course'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSelect = (idx) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setPlayerKey(k => k + 1);
    // scroll للعنصر المحدد في القائمة
    const el = sidebarRef.current?.querySelector(`[data-idx="${idx}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const getName = (obj) => (isAr ? obj?.ar : (obj?.en || obj?.ar)) || '';
  const ytId = getYoutubeId(activeVideo?.youtubeUrl);

  // ── Loading ──
  if (loading) return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-96" />
        <div className="flex gap-6">
          <div className="flex-1"><Skeleton className="aspect-video rounded-2xl" /></div>
          <div className="w-80 space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  // ── Error ──
  if (error) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive/40 mx-auto" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" asChild><Link to="/my-courses">{isAr ? 'رجوع' : 'Go Back'}</Link></Button>
      </div>
    </DashboardLayout>
  );

  return (
    <>
      <Helmet><title>{course ? getName(course.title) : 'كورس'} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6" dir={isAr ? 'rtl' : 'ltr'}>

          {/* Back */}
          <Link to="/my-courses" className={cn(
            'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-5 transition-colors',
            isAr && 'flex-row-reverse'
          )}>
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isAr ? 'كورساتي' : 'My Courses'}
          </Link>

          {/* Course Header */}
          <div className={cn('mb-6', isAr && 'text-right')}>
            <div className={cn('flex items-center gap-2 mb-2', isAr && 'flex-row-reverse')}>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {course?.platform}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{course?.level}</span>
              {sortedVideos.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Layers className="w-3.5 h-3.5" />
                  {sortedVideos.length} {isAr ? 'فيديو' : 'videos'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-1">{getName(course?.title)}</h1>
            {getName(course?.description) && (
              <p className="text-sm text-muted-foreground max-w-2xl">{getName(course?.description)}</p>
            )}
          </div>

          {/* ── حالة 1: فيديوهات داخلية ─────────────────────────── */}
          {sortedVideos.length > 0 ? (
            <div className={cn(
              'flex gap-5',
              isAr ? 'flex-col lg:flex-row-reverse' : 'flex-col lg:flex-row'
            )}>

              {/* ── Player Side ── */}
              <div className="flex-1 min-w-0 space-y-4">

                {/* Player */}
                <div className="rounded-2xl overflow-hidden bg-black shadow-xl">
                  {ytId ? (
                    <div className="aspect-video">
                      <iframe
                        key={playerKey}
                        src={`https://www.youtube.com/embed/${ytId}?rel=0&autoplay=0`}
                        title={activeVideo?.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-900">
                      <PlayCircle className="w-16 h-16 text-white/20" />
                      <p className="text-white/40 text-sm">{isAr ? 'اختر فيديو من القائمة' : 'Select a video from the list'}</p>
                    </div>
                  )}
                </div>

                {/* Active Video Info */}
                {activeVideo && (
                  <div className={cn(
                    'rounded-xl bg-card border border-border p-4 space-y-2',
                    isAr && 'text-right'
                  )}>
                    <div className={cn('flex items-start justify-between gap-3', isAr && 'flex-row-reverse')}>
                      <div className="flex-1 min-w-0">
                        <div className={cn('flex items-center gap-2 mb-1.5', isAr && 'flex-row-reverse')}>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {isAr ? `فيديو ${activeIdx + 1}` : `Video ${activeIdx + 1}`}
                          </span>
                          {activeVideo.duration && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />{activeVideo.duration}
                            </span>
                          )}
                        </div>
                        <h2 className="font-bold text-base leading-snug">{activeVideo.title}</h2>
                        {activeVideo.description && (
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{activeVideo.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Prev / Next */}
                    <div className={cn('flex items-center gap-2 pt-1', isAr && 'flex-row-reverse')}>
                      <button
                        onClick={() => handleSelect(Math.max(0, activeIdx - 1))}
                        disabled={activeIdx === 0}
                        className={cn(
                          'flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-semibold transition-all',
                          'bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed'
                        )}
                      >
                        {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                        {isAr ? 'السابق' : 'Prev'}
                      </button>
                      <span className="text-xs text-muted-foreground mx-auto font-medium">
                        {activeIdx + 1} / {sortedVideos.length}
                      </span>
                      <button
                        onClick={() => handleSelect(Math.min(sortedVideos.length - 1, activeIdx + 1))}
                        disabled={activeIdx === sortedVideos.length - 1}
                        className={cn(
                          'flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-semibold transition-all text-white',
                          activeIdx === sortedVideos.length - 1
                            ? 'bg-muted text-muted-foreground opacity-30 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90'
                        )}
                      >
                        {isAr ? 'التالي' : 'Next'}
                        {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Playlist Side ── */}
              <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3">
                {/* Header */}
                <div className={cn(
                  'flex items-center justify-between px-1',
                  isAr && 'flex-row-reverse'
                )}>
                  <h3 className="text-sm font-bold">
                    {isAr ? 'قائمة الفيديوهات' : 'Course Videos'}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {activeIdx + 1}/{sortedVideos.length} {isAr ? 'مكتمل' : 'completed'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mx-1">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((activeIdx + 1) / sortedVideos.length) * 100}%` }}
                  />
                </div>

                {/* List */}
                <div
                  ref={sidebarRef}
                  className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin"
                >
                  {sortedVideos.map((v, i) => (
                    <div key={v._id} data-idx={i}>
                      <VideoCard
                        video={v}
                        index={i}
                        isActive={activeIdx === i}
                        onClick={() => handleSelect(i)}
                        isAr={isAr}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : (
            /* ── حالة 2: رابط خارجي فقط ── */
            <div className="max-w-lg mx-auto">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Hero */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-lg mb-1">{getName(course?.title)}</p>
                    <p className="text-sm text-muted-foreground">
                      {isAr ? `متاح على منصة ${course?.platform}` : `Available on ${course?.platform}`}
                    </p>
                  </div>
                  {(course?.courseUrl || course?.url) ? (
                    <a
                      href={course.courseUrl || course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isAr ? 'ابدأ الكورس' : 'Start Course'}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{isAr ? 'الرابط غير متاح حالياً' : 'Link not available'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {course?.tags?.length > 0 && (
            <div className={cn('flex flex-wrap gap-2 mt-6', isAr && 'flex-row-reverse')}>
              {course.tags.map((tag, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}