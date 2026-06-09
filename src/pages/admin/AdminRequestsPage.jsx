import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import AdminLayout from '@/components/layouts/AdminLayout.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const YEAR_COLORS = {
  1: 'bg-blue-500/10 text-blue-600',
  2: 'bg-emerald-500/10 text-emerald-600',
  3: 'bg-violet-500/10 text-violet-600',
  4: 'bg-amber-500/10 text-amber-600',
};

export default function AdminRequestsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers({ limit: 50 })
      .then(d => setUsers((d.users || []).filter(u => u.enrolledCourses?.length > 0)))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <Helmet><title>{isAr ? 'طلاب مشتركون | Admin' : 'Enrolled Students | Admin'}</title></Helmet>
      <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            {isAr ? 'الطلاب المشتركون في الكورسات' : 'Enrolled Students'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? 'قائمة الطلاب اللي اشتركوا في كورسات خارجية' : 'Students enrolled in external courses'}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border">
            <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              {isAr ? 'لا يوجد طلاب مشتركون بعد' : 'No enrolled students yet'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isAr ? 'text-right' : ''}>{isAr ? 'الطالب' : 'Student'}</TableHead>
                  <TableHead className={isAr ? 'text-right' : ''}>{isAr ? 'البريد' : 'Email'}</TableHead>
                  <TableHead className={isAr ? 'text-right' : ''}>{isAr ? 'السنة' : 'Year'}</TableHead>
                  <TableHead className={isAr ? 'text-right' : ''}>{isAr ? 'الكورسات' : 'Courses'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      {user.year ? (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', YEAR_COLORS[user.year] || 'bg-muted text-muted-foreground')}>
                          {isAr ? `السنة ${user.year}` : `Year ${user.year}`}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                        {user.enrolledCourses?.length ?? 0}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}