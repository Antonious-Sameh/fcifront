import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, BookOpen, CheckCircle2, Globe, DollarSign, Clock, AlertCircle, Search, X } from 'lucide-react';
import { coursesAPI } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLATFORM_COLORS = {
  YouTube: 'bg-red-500/10 text-red-600',
  Udemy: 'bg-orange-500/10 text-orange-600',
  Coursera: 'bg-blue-500/10 text-blue-600',
  edX: 'bg-indigo-500/10 text-indigo-600',
  LinkedIn: 'bg-sky-500/10 text-sky-600',
  Pluralsight: 'bg-fuchsia-500/10 text-fuchsia-600',
  Other: 'bg-gray-500/10 text-gray-600',
};

const LEVEL_LABELS = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

const LEVEL_BADGE_STYLES = {
  beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const LANGUAGE_LABELS = {
  ar: { ar: 'عربي', en: 'Arabic' },
  en: { ar: 'إنجليزي', en: 'English' },
  both: { ar: 'عربي/إنجليزي', en: 'Arabic/English' },
};

const getLevelLabel = (level, isAr) => {
  const labels = {
    beginner: { ar: 'مبتدئ', en: 'Beginner' },
    intermediate: { ar: 'متوسط', en: 'Intermediate' },
    advanced: { ar: 'متقدم', en: 'Advanced' },
  };
  return labels[level]?.[isAr ? 'ar' : 'en'] || level;
};

const QUICK_FILTERS = [
  { key: 'all', label: { ar: 'الكل', en: 'All' } },
  { key: 'free', label: { ar: 'مجاني', en: 'Free' } },
  { key: 'beginner', label: { ar: 'مبتدئ', en: 'Beginner' } },
  { key: 'arabic', label: { ar: 'عربي', en: 'Arabic' } },
  { key: 'frontend', label: { ar: 'Front-End', en: 'Front-End' } },
  { key: 'backend', label: { ar: 'Back-End', en: 'Back-End' } },
  { key: 'ai', label: { ar: 'AI', en: 'AI' } },
  { key: 'mobile', label: { ar: 'Mobile', en: 'Mobile' } },
];

const normalize = (value) => String(value || '').toLowerCase();

const matchesFilter = (course, filter) => {
  if (filter === 'all') return true;
  if (filter === 'free') return Number(course.price || 0) === 0;
  if (filter === 'beginner') return course.level === 'beginner';
  if (filter === 'arabic') return course.language === 'ar' || course.language === 'both';

  const category = normalize(course.category);
  const tags = (course.tags || []).map(normalize).join(' ');
  const title = `${normalize(course.title?.ar)} ${normalize(course.title?.en)}`;
  const haystack = `${category} ${tags} ${title}`;

  if (filter === 'ai') {
    return haystack.includes('ai') || haystack.includes('machine') || haystack.includes('data science');
  }

  return haystack.includes(filter);
};

const matchesSearch = (course, query) => {
  const q = normalize(query).trim();
  if (!q) return true;

  const haystack = [
    course.title?.ar,
    course.title?.en,
    course.description?.ar,
    course.description?.en,
    course.category,
    course.platform,
    course.instructor,
    ...(course.tags || []),
  ].map(normalize).join(' ');

  return haystack.includes(q);
};

export default function CoursesPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [allData, myData] = await Promise.all([
          coursesAPI.getAll(),
          coursesAPI.getMyCourses(),
        ]);
        setCourses(allData.courses || []);
        setMyCourses(myData.courses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEnroll = async (course) => {
    setEnrollingId(course._id);
    try {
      await coursesAPI.enroll(course._id);
      setMyCourses(prev => [...prev, course]);
      toast.success('تم الاشتراك في الكورس بنجاح!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (id) => myCourses.some(c => c._id === id);

  const getName = (obj) => language === 'ar' ? obj?.ar : (obj?.en || obj?.ar);

  const filterCourses = (list) =>
    list.filter(course => matchesFilter(course, activeFilter) && matchesSearch(course, searchQuery));

  const filteredCourses = filterCourses(courses);
  const filteredMyCourses = filterCourses(myCourses);
  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveFilter = activeFilter !== 'all';

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  const CourseCard = ({ course }) => {
    const enrolled = isEnrolled(course._id);
    return (
      <Card className="flex flex-col border-border hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Badge className={cn('border-0 text-xs', PLATFORM_COLORS[course.platform] || PLATFORM_COLORS.Other)}>
                {course.platform}
              </Badge>
              {course.language === 'ar' && <Badge variant="outline" className="text-xs">عربي</Badge>}
            </div>
          </div>
          <CardTitle className="mt-4 text-xl leading-snug">{getName(course.title)}</CardTitle>
          {course.instructor && (
            <p className="text-sm text-muted-foreground">{course.instructor}</p>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          <CardDescription className="text-base flex-1">{getName(course.description)}</CardDescription>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {course.duration && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
            )}
            {course.level && (
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{LEVEL_LABELS[course.level]}</span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {course.price === 0 ? 'مجاني' : `${course.price} جنيه`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2">
  {enrolled ? (
              course.courseUrl ? (
                <Button variant="secondary" className="flex-1 h-11" asChild>
                  <a href={course.courseUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> {isRTL ? 'ابدأ الكورس' : 'Start Course'}
                  </a>
                </Button>
              ) : (
                <Button variant="secondary" className="flex-1 h-11" onClick={() => navigate(`/my-courses/${course._id}`)}>
                  <ExternalLink className="w-4 h-4 mr-2" /> {isRTL ? 'ابدأ الكورس' : 'Start Course'}
                </Button>
              )
  ) : (
    <>
      <Button
        className="flex-1 h-11"
        onClick={() => handleEnroll(course)}
        disabled={enrollingId === course._id}
      >
        {enrollingId === course._id
          ? (isRTL ? 'جاري...' : 'Loading...')
          : (isRTL ? 'اشترك الآن' : 'Enroll Now')}
      </Button>

      <Button variant="outline" size="icon" className="h-11 w-11" asChild>
        <a href={course.courseUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4" />
        </a>
      </Button>
    </>
  )}
</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <Helmet><title>الكورسات | Student Core</title></Helmet>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-3xl font-bold">الكورسات والدورات التدريبية</h1>
          <p className="text-muted-foreground mt-1">اشترك في الكورسات واحتفظ بها في مكان واحد</p>
        </div>

        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-border bg-card/80">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'ابحث باسم الكورس أو المجال...' : 'Search by course name or category...'}
                className={cn(
                  'w-full h-11 rounded-xl border border-input bg-background text-sm outline-none transition-all',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
                  isRTL ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'
                )}
              />
              {hasActiveSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={cn('absolute top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted', isRTL ? 'left-3' : 'right-3')}
                  aria-label={isRTL ? 'مسح البحث' : 'Clear search'}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className={cn('flex flex-wrap gap-2', isRTL && 'flex-row-reverse')}>
              {QUICK_FILTERS.map(filter => {
                const isActive = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                    )}
                  >
                    {filter.label[isRTL ? 'ar' : 'en']}
                  </button>
                );
              })}
            </div>

            <div className={cn('flex items-center justify-between gap-3 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
              <span>
                {isRTL
                  ? `ظاهر ${filteredCourses.length} من ${courses.length} كورس`
                  : `Showing ${filteredCourses.length} of ${courses.length} courses`}
              </span>
              {(hasActiveFilter || hasActiveSearch) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-semibold text-primary hover:underline"
                >
                  {isRTL ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="h-11 mb-6">
            <TabsTrigger value="all">كل الكورسات ({courses.length})</TabsTrigger>
            <TabsTrigger value="mine" className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              كورساتي ({myCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="h-64">
                    <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
                    <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-10 w-full mt-6" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-lg">لا توجد كورسات بعد</p>
                </CardContent>
              </Card>
            ) : filteredCourses.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <Search className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {isRTL ? 'لا توجد كورسات مطابقة' : 'No matching courses'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'جرّب تغيير البحث أو مسح الفلاتر' : 'Try changing your search or clearing filters'}
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                    {isRTL ? 'مسح الفلاتر' : 'Clear filters'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => <CourseCard key={course._id} course={course} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine">
            {myCourses.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <CheckCircle2 className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-lg">لم تشترك في أي كورس بعد</p>
                </CardContent>
              </Card>
            ) : filteredMyCourses.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <Search className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {isRTL ? 'لا توجد كورسات مطابقة في كورساتك' : 'No matching enrolled courses'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'جرّب تغيير البحث أو مسح الفلاتر' : 'Try changing your search or clearing filters'}
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                    {isRTL ? 'مسح الفلاتر' : 'Clear filters'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyCourses.map(course => <CourseCard key={course._id} course={course} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
