import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { departmentsAPI } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Code2, Database, Globe, Cpu, ShieldAlert, Layers, AlertCircle, ChevronRight } from 'lucide-react';

const iconMap = {
  Code2: <Code2 className="w-8 h-8 text-blue-500" />,
  Database: <Database className="w-8 h-8 text-amber-500" />,
  Globe: <Globe className="w-8 h-8 text-indigo-500" />,
  Cpu: <Cpu className="w-8 h-8 text-purple-500" />,
  ShieldAlert: <ShieldAlert className="w-8 h-8 text-red-500" />,
  Layers: <Layers className="w-8 h-8 text-emerald-500" />,
};
const defaultIcon = <Code2 className="w-8 h-8 text-primary" />;

const DepartmentsPage = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await departmentsAPI.getAll();
        setDepartments(data.departments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getName = (obj) => isAr ? obj?.ar : (obj?.en || obj?.ar);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="relative mb-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-primary/5 overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-4 tracking-tight">{t('departments.title')}</h1>
            <p className="text-muted-foreground text-lg max-w-3xl font-medium leading-relaxed">{t('departments.subtitle')}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="h-48">
                <CardHeader><Skeleton className="h-10 w-10 rounded mb-2" /><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <Code2 className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-lg">لا توجد أقسام بعد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Link to={`/departments/${dept.slug}`} key={dept._id} className="block group">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <CardHeader>
                    <div className="mb-3">{iconMap[dept.icon] || defaultIcon}</div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {getName(dept.name)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">{getName(dept.description)}</p>
                    <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
                      <span>اعرف أكثر</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DepartmentsPage;