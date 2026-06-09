import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import AdminLayout from '@/components/layouts/AdminLayout.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { BookOpen, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminActivationPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getCourses?.()
      .then(d => setCourses(d.courses || []))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <Helmet><title>{isAr ? 'الكورسات النشطة | Admin' : 'Active Courses | Admin'}</title></Helmet>
      <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            {isAr ? 'الكورسات والاشتراكات' : 'Courses & Enrollments'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? 'نظرة عامة على الكورسات الخارجية واشتراكات الطلاب' : 'Overview of external courses and student enrollments'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{isAr ? 'لا توجد كورسات بعد' : 'No courses yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course._id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-snug line-clamp-2">
                      {isAr ? course.title?.ar : (course.title?.en || course.title?.ar)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{course.platform}</p>
                  </div>
                  {course.courseUrl && (
                    <a href={course.courseUrl} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold text-foreground">{course.enrolledUsers?.length ?? 0}</span>
                    {isAr ? ' مشترك' : ' enrolled'}
                  </span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    course.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                  )}>
                    {course.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'موقوف' : 'Inactive')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}