import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { coursesAPI } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { ExternalLink, BookOpen, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CourseContentPage = () => {
  const { courseId } = useParams();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    coursesAPI.getOne(courseId)
      .then((data) => setCourse(data.course))
      .catch(() => setError(isAr ? 'تعذر تحميل الكورس' : 'Failed to load course'))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <>
      <Helmet><title>{course ? (isAr ? course.title?.ar : course.title?.en) : 'كورس'} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8" dir={isAr ? 'rtl' : 'ltr'}>
          {/* Back Button */}
          <Link
            to="/my-courses"
            className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors', isAr && 'flex-row-reverse')}
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isAr ? 'العودة لكورساتي' : 'Back to My Courses'}
          </Link>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <AlertCircle className="w-10 h-10 text-destructive/50" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" asChild><Link to="/my-courses">{isAr ? 'رجوع' : 'Go Back'}</Link></Button>
            </div>
          ) : course ? (
            <div className="space-y-6">
              {/* Course Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {course.platform}
                  </span>
                  <span className="text-xs text-muted-foreground">{course.level}</span>
                </div>
                <h1 className="text-2xl font-black mb-1">
                  {isAr ? course.title?.ar : course.title?.en || course.title?.ar}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isAr ? course.description?.ar : course.description?.en || course.description?.ar}
                </p>
              </div>

              {/* Thumbnail */}
              {course.thumbnail && (
                <div className="rounded-2xl overflow-hidden border border-border">
                  <img src={course.thumbnail} alt="" className="w-full object-cover max-h-64" />
                </div>
              )}

              {/* Go to Course CTA */}
              <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-base mb-1">
                    {isAr ? 'هذا الكورس على منصة خارجية' : 'This course is on an external platform'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isAr
                      ? `انتقل إلى ${course.platform} لمتابعة الكورس`
                      : `Go to ${course.platform} to continue learning`}
                  </p>
                </div>
                {course.courseUrl ? (
                  <a
                    href={course.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {isAr ? 'ابدأ الكورس' : 'Start Course'}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'رابط الكورس غير متاح حالياً' : 'Course link not available'}
                  </p>
                )}
              </div>

              {/* Tags */}
              {course.tags?.length > 0 && (
                <div className={cn('flex flex-wrap gap-2', isAr && 'flex-row-reverse')}>
                  {course.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    </>
  );
};

export default CourseContentPage;