import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import {
  LayoutDashboard, GraduationCap, BookOpen, Bookmark, Shield,
  Briefcase, Building2, ChevronLeft, ChevronRight,
  UserCircle, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isRTL = language === 'ar';

  const navigationItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/' },
    { icon: GraduationCap, label: t('sidebar.universities'), path: '/university' },
    { icon: BookOpen, label: t('sidebar.courses'), path: '/courses' },
    { icon: Bookmark, label: t('sidebar.my_courses'), path: '/my-courses' },
    { icon: Briefcase, label: t('sidebar.careers'), path: '/careers' },
    { icon: Building2, label: t('sidebar.departments'), path: '/departments' },
    { icon: UserCircle, label: t('sidebar.profile'), path: '/profile' },
    { icon: Sparkles, label: language === 'ar' ? t('sidebar.quiz') || 'اكتشف مسارك' : 'Career Quiz', path: '/career-quiz' },
    ...(isAdmin ? [{ icon: Shield, label: t('sidebar.admin'), path: '/admin' }] : [])
  ];

  const showLabels = isExpanded || isOpen;

  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 h-screen bg-card z-50 transition-all duration-300",
          isRTL ? "right-0 border-l" : "left-0 border-r",

          isExpanded ? "md:w-64 w-64" : "md:w-20 w-64",

          isOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full md:translate-x-0"
              : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div className={cn(
            "flex items-center justify-between p-6 border-b",
            !isExpanded && "md:justify-center"
          )}>

            {/* اللوجو / الاسم */}
            {showLabels && (
              <h1 className="text-xl font-bold">Road To Career</h1>
            )}

            {/* الأزرار */}
            <div className="flex items-center gap-2">

              {/* ✕ زر الإغلاق (موبايل فقط) */}
              {isOpen && (
                <button
                  onClick={onClose}
                  className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent"
                >
                  ✕
                </button>
              )}

              {/* زر تصغير/تكبير (ديسكتوب فقط) */}
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent"
              >
                {isExpanded
                  ? (isRTL ? <ChevronRight /> : <ChevronLeft />)
                  : (isRTL ? <ChevronLeft /> : <ChevronRight />)
                }
              </button>

            </div>
          </div>

          {/* NAV */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => window.innerWidth < 768 && onClose()}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent",
                        !showLabels && "justify-center",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <Icon className="w-5 h-5" />

                      {showLabels && (
                        <span>{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;