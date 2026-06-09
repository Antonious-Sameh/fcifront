import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  Key,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  BrainCircuit,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminSidebar = ({ isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t, language } = useLanguage();
  const location = useLocation();
  const isRTL = language === 'ar';

  const navigationItems = [
    { icon: LayoutDashboard, label: t('admin_sidebar.overview'), path: '/admin' },
    { icon: Users, label: t('admin_sidebar.users'), path: '/admin/users' },
    { icon: FileText, label: t('admin_sidebar.content'), path: '/admin/content' },
    { icon: BookOpen, label: t('admin_sidebar.courses'), path: '/admin/courses' },
    { icon: BrainCircuit, label: language === 'ar' ? 'المسارات المهنية' : 'Career Tracks', path: '/admin/careers' },
    { icon: Building2, label: language === 'ar' ? 'الأقسام' : 'Departments', path: '/admin/departments' },
    { icon: Key, label: t('admin_sidebar.activation'), path: '/admin/activation' },
    { icon: MessageSquare, label: t('admin_sidebar.requests'), path: '/admin/requests' },
  ];

  useEffect(() => {
    const handleResize = () => setIsExpanded(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300" onClick={onClose} />}
      <aside className={cn(
        "fixed top-0 h-screen z-50 transition-all duration-300 ease-in-out",
        "bg-slate-950 text-slate-50 border-r border-slate-800",
        isRTL ? "right-0 border-l border-r-0" : "left-0",
        isExpanded ? "w-64" : "w-20",
        isOpen ? "translate-x-0" : isRTL ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className={cn("flex items-center justify-between p-6 border-b border-slate-800", !isExpanded && "justify-center")}>
            {isExpanded && <h1 className="text-xl font-bold tracking-wide">{t('admin_sidebar.panel')}</h1>}
            <button onClick={() => setIsExpanded(!isExpanded)} className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 transition-colors">
              {isExpanded ? (isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />) : (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
            </button>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link to={item.path} onClick={() => window.innerWidth < 768 && onClose()} className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive ? "bg-primary text-primary-foreground font-medium" : "text-slate-300 hover:bg-slate-800 hover:text-slate-50",
                      !isExpanded && "justify-center",
                      isRTL && "flex-row-reverse"
                    )}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {isExpanded && <span className={cn("transition-opacity duration-200", isRTL ? "text-right" : "text-left")}>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <Link to="/" className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors",
              !isExpanded && "justify-center",
              isRTL && "flex-row-reverse"
            )}>
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span>{t('admin_sidebar.back_to_app')}</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;