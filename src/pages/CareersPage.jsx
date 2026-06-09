import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { careersAPI } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle, ChevronRight, BrainCircuit, Layout, Server,
  Smartphone, ShieldCheck, Database, Bot, Layers, Code2,
  Globe, ArrowLeft, Sparkles, Users, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Icon map ─────────────────────────────────────────────────────
const ICONS = {
  BrainCircuit, Layout, Server, Layers, Smartphone,
  Database, Bot, ShieldCheck, Code2, Globe,
};

// ── Color system ─────────────────────────────────────────────────
const COLOR = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'hover:border-blue-500/40',   badge: 'bg-blue-500/10 text-blue-600'   },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-500',border: 'hover:border-emerald-500/40',badge: 'bg-emerald-500/10 text-emerald-600'},
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'hover:border-violet-500/40', badge: 'bg-violet-500/10 text-violet-600' },
  rose:   { bg: 'bg-rose-500/10',   text: 'text-rose-500',   border: 'hover:border-rose-500/40',   badge: 'bg-rose-500/10 text-rose-600'   },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'hover:border-amber-500/40',  badge: 'bg-amber-500/10 text-amber-600'  },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'hover:border-purple-500/40', badge: 'bg-purple-500/10 text-purple-600' },
  cyan:   { bg: 'bg-cyan-500/10',   text: 'text-cyan-500',   border: 'hover:border-cyan-500/40',   badge: 'bg-cyan-500/10 text-cyan-600'   },
  gray:   { bg: 'bg-gray-500/10',   text: 'text-gray-500',   border: 'hover:border-gray-500/40',   badge: 'bg-gray-500/10 text-gray-600'   },
  red:    { bg: 'bg-red-500/10',    text: 'text-red-500',    border: 'hover:border-red-500/40',    badge: 'bg-red-500/10 text-red-600'    },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'hover:border-indigo-500/40', badge: 'bg-indigo-500/10 text-indigo-600'},
};
const getColor = (c) => COLOR[c] || COLOR.blue;

// ── Career Card ───────────────────────────────────────────────────
const CareerCard = ({ career, language }) => {
  const isAr = language === 'ar';
  const getName = (o) => isAr ? o?.ar : (o?.en || o?.ar);
  const col = getColor(career.color);
  const Icon = ICONS[career.icon] || BrainCircuit;
  const totalSteps = career.levels?.reduce((acc, l) =>
    acc + (l.isChoice ? (l.choices?.[0]?.steps?.length || 0) : (l.items?.length || 0)), 0) || 0;

  return (
    <Link to={`/careers/${career.slug}`} className="block group">
      <div className={cn(
        'relative h-full rounded-2xl border border-border bg-card p-6',
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        col.border
      )}>
        {/* Icon */}
        <div className={cn('inline-flex p-3 rounded-xl mb-4', col.bg)}>
          <Icon className={cn('w-6 h-6', col.text)} />
        </div>

        {/* Title */}
        <h3 className={cn('text-lg font-bold mb-2 group-hover:text-primary transition-colors', isAr ? 'text-right' : 'text-left')}>
          {getName(career.name)}
        </h3>

        {/* Description */}
        <p className={cn('text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed', isAr ? 'text-right' : 'text-left')}>
          {getName(career.description)}
        </p>

        {/* Meta */}
        <div className={cn('flex items-center gap-2 mb-5 flex-wrap', isAr && 'flex-row-reverse')}>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', col.badge)}>
            {career.levels?.length || 0} {isAr ? 'مراحل' : 'Phases'}
          </span>
          {totalSteps > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
              {totalSteps}+ {isAr ? 'مهارة' : 'Skills'}
            </span>
          )}
        </div>

        {/* Preview steps */}
        {career.levels?.[0]?.items?.slice(0, 3).map((item, i) => (
          <div key={i} className={cn('flex items-center gap-2 text-xs text-muted-foreground mb-1', isAr && 'flex-row-reverse')}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', col.text.replace('text-', 'bg-'))} />
            <span className="truncate">{item.name}</span>
          </div>
        ))}

        {/* CTA */}
        <div className={cn(
          'flex items-center gap-1 mt-5 text-sm font-semibold text-primary',
          isAr ? 'flex-row-reverse' : ''
        )}>
          {isAr ? (
            <>
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>ابدأ المسار</span>
            </>
          ) : (
            <>
              <span>Start Track</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

// ── Main Page ────────────────────────────────────────────────────
const CareersPage = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    careersAPI.getAll()
      .then(d => setCareers(d.careers || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

 const filtered = filter === 'all' ? careers
    : careers.filter(c => {
      if (filter === 'beginner') return !c.difficulty || c.difficulty === 'beginner';
      if (filter === 'advanced') return c.difficulty === 'advanced';
      return true;
    });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" dir={isAr ? 'rtl' : 'ltr'}>

        {/* ── Hero ── */}
        <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 md:p-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {isAr ? 'خارطة طريقك' : 'Your Career Map'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              {t('careers.title')}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {t('careers.subtitle')}
            </p>
            <div className={cn('flex items-center gap-6 text-sm text-muted-foreground', isAr && 'flex-row-reverse')}>
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-primary" />
                {careers.length} {isAr ? 'مسار' : 'Tracks'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {isAr ? 'خطوة خطوة' : 'Step by Step'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                {isAr ? 'لكل المستويات' : 'All Levels'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Filter ── */}
        <div className={cn('flex items-center gap-2 mb-8 flex-wrap', isAr && 'flex-row-reverse')}>
          {[
            { key: 'all', label: isAr ? 'الكل' : 'All' },
            { key: 'beginner', label: isAr ? 'مبتدئ' : 'Beginner Friendly' },
            { key: 'advanced', label: isAr ? 'متقدم' : 'Advanced' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                filter === f.key
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-5 bg-muted rounded-full mb-4">
              <BrainCircuit className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-lg">
              {isAr ? 'لا توجد مسارات متاحة حالياً' : 'No career tracks available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(career => (
              <CareerCard key={career._id} career={career} language={language} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CareersPage;