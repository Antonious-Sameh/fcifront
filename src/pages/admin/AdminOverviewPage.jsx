import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import AdminLayout from '@/components/layouts/AdminLayout.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, GraduationCap, UserCheck,
  Video, TrendingUp, AlertCircle, RefreshCw,
  BrainCircuit, Building2, ChevronRight
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const STAT_CARDS = (stats, isAr) => [
  { title: isAr ? 'إجمالي الطلاب' : 'Total Students', value: stats.totalStudents, icon: Users, color: { bg: 'bg-blue-500/10', text: 'text-blue-500', solid: 'bg-blue-500' }, link: '/admin/users' },
  { title: isAr ? 'طلاب نشطون' : 'Active Students', value: stats.activeStudents, icon: UserCheck, color: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', solid: 'bg-emerald-500' }, link: '/admin/users' },
  { title: isAr ? 'المواد الدراسية' : 'Subjects', value: stats.totalSubjects, icon: BookOpen, color: { bg: 'bg-violet-500/10', text: 'text-violet-500', solid: 'bg-violet-500' }, link: '/admin/content' },
  { title: isAr ? 'إجمالي المحاضرات' : 'Total Lectures', value: stats.totalLectures, icon: Video, color: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', solid: 'bg-indigo-500' }, link: '/admin/content' },
  { title: isAr ? 'الكورسات الخارجية' : 'External Courses', value: stats.totalCourses, icon: GraduationCap, color: { bg: 'bg-amber-500/10', text: 'text-amber-500', solid: 'bg-amber-500' }, link: '/admin/courses' },
  { title: isAr ? 'تسجيل هذا الشهر' : 'This Month', value: stats.newStudentsThisMonth, icon: TrendingUp, color: { bg: 'bg-rose-500/10', text: 'text-rose-500', solid: 'bg-rose-500' }, link: '/admin/users' },
];

const StatCard = ({ card, idx, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.07 }}
  >
    <Link to={card.link}
      className="block group rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className={cn('inline-flex p-2.5 rounded-xl mb-4', card.color.bg)}>
        <card.icon className={cn('w-5 h-5', card.color.text)} />
      </div>
      {loading
        ? <Skeleton className="h-9 w-16 mb-1" />
        : <p className="text-3xl font-black mb-1">{card.value?.toLocaleString('ar-EG') ?? '—'}</p>
      }
      <p className="text-sm text-muted-foreground">{card.title}</p>

      {/* Progress bar decoration */}
      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-1000 w-0 group-hover:w-full', card.color.solid)} />
      </div>
    </Link>
  </motion.div>
);

export default function AdminOverviewPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true); setError('');
      const [s, r] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRecentRegistrations(6),
      ]);
      setStats(s.stats);
      setRecentUsers(r.users);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = stats ? STAT_CARDS(stats, isAr) : Array(6).fill({ title: '', value: 0, icon: Users, color: { bg: 'bg-muted', text: 'text-muted-foreground', solid: 'bg-muted' }, link: '#' });

  return (
    <AdminLayout>
      <Helmet><title>{isAr ? 'لوحة التحكم' : 'Dashboard'} | Admin</title></Helmet>
      <div className="space-y-8" dir={isAr ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className={cn('flex items-center justify-between', isAr && 'flex-row-reverse')}>
          <div className={isAr ? 'text-right' : ''}>
            <h1 className="text-3xl font-black tracking-tight">{isAr ? 'لوحة التحكم' : 'Dashboard'}</h1>
            <p className="text-muted-foreground mt-1">{isAr ? 'نظرة عامة على المنصة' : 'Platform overview'}</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <RefreshCw className={cn('w-4 h-4 text-muted-foreground', loading && 'animate-spin')} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={cn('flex items-center gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20', isAr && 'flex-row-reverse')}>
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <StatCard key={i} card={card} idx={i} loading={loading} />
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className={cn('font-bold text-base mb-4', isAr && 'text-right')}>{isAr ? '⚡ إجراءات سريعة' : '⚡ Quick Actions'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Users, label: isAr ? 'إدارة الطلاب' : 'Manage Students', path: '/admin/users', color: 'text-blue-500 bg-blue-500/10' },
              { icon: BookOpen, label: isAr ? 'إدارة المحتوى' : 'Manage Content', path: '/admin/content', color: 'text-violet-500 bg-violet-500/10' },
              { icon: BrainCircuit, label: isAr ? 'المسارات المهنية' : 'Career Tracks', path: '/admin/careers', color: 'text-amber-500 bg-amber-500/10' },
              { icon: Building2, label: isAr ? 'الأقسام' : 'Departments', path: '/admin/departments', color: 'text-emerald-500 bg-emerald-500/10' },
            ].map((action, i) => (
              <Link key={i} to={action.path}
                className={cn('flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all group', isAr && 'flex-row-reverse')}>
                <div className={cn('p-2 rounded-lg', action.color.split(' ')[1])}>
                  <action.icon className={cn('w-4 h-4', action.color.split(' ')[0])} />
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{action.label}</span>
                <ChevronRight className={cn('w-3.5 h-3.5 text-muted-foreground ml-auto', isAr && 'rotate-180 mr-auto ml-0')} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border', isAr && 'flex-row-reverse')}>
            <h2 className="font-bold text-base">{isAr ? '🕐 آخر الطلاب المسجلين' : '🕐 Recent Registrations'}</h2>
            <Link to="/admin/users" className={cn('text-xs text-primary hover:underline flex items-center gap-1', isAr && 'flex-row-reverse')}>
              {isAr ? 'الكل' : 'View all'}
              <ChevronRight className={cn('w-3.5 h-3.5', isAr && 'rotate-180')} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            )) : recentUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">
                {isAr ? 'لا يوجد طلاب مسجلين بعد' : 'No students registered yet'}
              </p>
            ) : recentUsers.map((user) => (
              <div key={user._id} className={cn('flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors', isAr && 'flex-row-reverse')}>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className={cn('flex-1 min-w-0', isAr && 'text-right')}>
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className={cn('flex items-center gap-2 shrink-0', isAr && 'flex-row-reverse')}>
                  {user.year && <Badge variant="outline" className="text-xs">{isAr ? `سنة ${user.year}` : `Y${user.year}`}</Badge>}
                  <Badge variant={user.isActive ? 'default' : 'destructive'} className="text-xs">
                    {user.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'موقوف' : 'Inactive')}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}