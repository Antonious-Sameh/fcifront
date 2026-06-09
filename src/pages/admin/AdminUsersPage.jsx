import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import AdminLayout from '@/components/layouts/AdminLayout.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Ban, Trash2, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const data = await adminAPI.getUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(1, searchTerm); }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => loadUsers(1, searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleActive = async (user) => {
    setActionLoading(user._id);
    try {
      const data = await adminAPI.toggleUserActive(user._id);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`هل أنت متأكد من حذف "${user.name}"؟`)) return;
    setActionLoading(user._id);
    try {
      await adminAPI.deleteUser(user._id);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      toast.success('تم حذف المستخدم');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <Helmet><title>إدارة الطلاب | Admin</title></Helmet>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">إدارة الطلاب</h1>
            <p className="text-muted-foreground mt-1">
              إجمالي {pagination.total.toLocaleString('ar-EG')} طالب مسجل
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => loadUsers(pagination.page, searchTerm)}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
          <Input
            placeholder="ابحث بالاسم أو الإيميل أو رقم القيد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn('h-11', isRTL ? 'pr-9' : 'pl-9')}
          />
        </div>

        {/* Table */}
        <div className="border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(isRTL && 'text-right')}>الاسم</TableHead>
                  <TableHead className={cn(isRTL && 'text-right')}>الإيميل</TableHead>
                  <TableHead className={cn(isRTL && 'text-right')}>السنة</TableHead>
                  <TableHead className={cn(isRTL && 'text-right')}>تاريخ التسجيل</TableHead>
                  <TableHead className={cn(isRTL && 'text-right')}>الحالة</TableHead>
                  <TableHead className={cn(isRTL && 'text-right')}>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(6).fill(0).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      لا يوجد طلاب مطابقون للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} className={cn(actionLoading === user._id && 'opacity-50')}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{user.year ? `السنة ${user.year}` : '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? 'نشط' : 'موقوف'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={actionLoading === user._id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                              {user.isActive
                                ? <><Ban className="mr-2 h-4 w-4" /> تعطيل الحساب</>
                                : <><CheckCircle className="mr-2 h-4 w-4" /> تفعيل الحساب</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> حذف المستخدم
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                صفحة {pagination.page} من {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadUsers(pagination.page - 1, searchTerm)}
                >السابق</Button>
                <Button
                  variant="outline" size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadUsers(pagination.page + 1, searchTerm)}
                >التالي</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
