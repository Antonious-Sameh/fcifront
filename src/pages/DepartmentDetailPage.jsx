import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { departmentsAPI } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronLeft, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

const DepartmentDetailPage = () => {
  const { departmentId: slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await departmentsAPI.getBySlug(slug);
        setDept(data.department);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const getName = (obj) => isAr ? obj?.ar : (obj?.en || obj?.ar);

  if (loading) return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    </DashboardLayout>
  );

  if (error || !dept) return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error || 'القسم غير موجود'}</p>
          </CardContent>
        </Card>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/departments')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> العودة
        </Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <Button variant="ghost" className="mb-6 gap-1" onClick={() => navigate('/departments')}>
          <ChevronLeft className="w-4 h-4" /> العودة للأقسام
        </Button>

        <div className="mb-10">
          <h1 className="text-4xl font-black mb-3">{getName(dept.name)}</h1>
          <p className="text-muted-foreground text-lg">{getName(dept.description)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getName(dept.pros) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" /> المميزات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{getName(dept.pros)}</p>
              </CardContent>
            </Card>
          )}

          {getName(dept.cons) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-5 h-5" /> العيوب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{getName(dept.cons)}</p>
              </CardContent>
            </Card>
          )}

          {getName(dept.suitableFor) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <UserCheck className="w-5 h-5" /> القسم ده مناسب لمين؟
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{getName(dept.suitableFor)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DepartmentDetailPage;