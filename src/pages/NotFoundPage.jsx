import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFoundPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center" dir={isAr ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        {/* 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] font-black text-muted/30 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black mb-3">
          {isAr ? 'الصفحة مش موجودة!' : 'Page Not Found!'}
        </h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          {isAr
            ? 'الصفحة اللي بتدور عليها مش موجودة أو اتنقلت لمكان تاني'
            : 'The page you are looking for does not exist or has been moved'}
        </p>

        <div className={cn('flex flex-wrap gap-3 justify-center', isAr && 'flex-row-reverse')}>
          <Link to="/"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            <Home className="w-4 h-4" />
            {isAr ? 'الصفحة الرئيسية' : 'Go Home'}
          </Link>
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-colors">
            <ArrowLeft className={cn('w-4 h-4', isAr && 'rotate-180')} />
            {isAr ? 'ارجع للخلف' : 'Go Back'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}