import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext.jsx';
import AdminSidebar from '@/components/layouts/AdminSidebar.jsx';
import Topbar from '@/components/layouts/Topbar.jsx';
import { cn } from '@/lib/utils';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isRTL ? "md:mr-64" : "md:ml-64")}>
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;