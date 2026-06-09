import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, BookOpen, AlertCircle } from 'lucide-react';
import { coursesAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const PLATFORM_COLORS = {
  YouTube: 'bg-red-500/10 text-red-600',
  Udemy: 'bg-orange-500/10 text-orange-600',
  Coursera: 'bg-blue-500/10 text-blue-600',
  edX: 'bg-indigo-500/10 text-indigo-600',
  Other: 'bg-gray-500/10 text-gray-600',
};

export default function MyCoursesPage() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await coursesAPI.getMyCourses();
        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getName = (obj) => language === 'ar' ? obj?.ar : (obj?.en || obj?.ar);

  return (
    <DashboardLayout>
      {/* تم تعديل اسم البراند هنا لـ Road To Career */}
      <Helmet><title>{t('courses.my_courses')} | Road To Career</title></Helmet>
      
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold tracking-tight">{t('courses.my_courses')}</h1>

        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="h-48">
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-10 w-full mt-4" /></CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <BookOpen className="w-16 h-16 text-muted-foreground/40" />
              <p className="text-muted-foreground text-lg">{t('courses.no_enrolled')}</p>
              <Button asChild variant="outline">
                <Link to="/courses">{t('courses.browse')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <Badge className={cn('border-0 text-xs', PLATFORM_COLORS[course.platform] || PLATFORM_COLORS.Other)}>
                      {course.platform}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-lg leading-snug">{getName(course.title)}</CardTitle>
                  {course.instructor && (
                    <p className="text-sm text-muted-foreground">{course.instructor}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <CardDescription className="flex-1">{getName(course.description)}</CardDescription>
                  
                  {/* التعديل الذكي لزرار الكورس لمنع التعطيل في حال غياب اللينك الخارجي */}
                  {course.courseUrl ? (
                    <Button className="w-full h-11" asChild>
                      <a href={course.courseUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {isRTL ? 'ابدأ الكورس' : 'Start Course'}
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full h-11" onClick={() => navigate(`/my-courses/${course._id}`)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isRTL ? 'ابدأ الكورس' : 'Start Course'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}