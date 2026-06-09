import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { careersAPI, careerProgressAPI } from '@/lib/api';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Circle, ChevronLeft, ChevronRight, AlertCircle,
  ExternalLink, BrainCircuit, Layout, Server, Smartphone,
  ShieldCheck, Database, Bot, Layers, Code2, Globe,
  ArrowRight, ArrowLeft, GitBranch, BookOpen, Target,
  Lightbulb, Sparkles, Save, CloudOff, Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────
const ICONS = { BrainCircuit, Layout, Server, Layers, Smartphone, Database, Bot, ShieldCheck, Code2, Globe };
const COLOR = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-blue-500/30',   ring: 'ring-blue-500/20',   dot: 'bg-blue-500',   solid: 'bg-blue-500'  },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-500',border: 'border-emerald-500/30',ring: 'ring-emerald-500/20',dot: 'bg-emerald-500',solid: 'bg-emerald-500'},
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30', ring: 'ring-violet-500/20', dot: 'bg-violet-500', solid: 'bg-violet-500' },
  rose:   { bg: 'bg-rose-500/10',   text: 'text-rose-500',   border: 'border-rose-500/30',   ring: 'ring-rose-500/20',   dot: 'bg-rose-500',   solid: 'bg-rose-500'  },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-500',  border: 'border-amber-500/30',  ring: 'ring-amber-500/20',  dot: 'bg-amber-500',  solid: 'bg-amber-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30', ring: 'ring-purple-500/20', dot: 'bg-purple-500', solid: 'bg-purple-500'},
  cyan:   { bg: 'bg-cyan-500/10',   text: 'text-cyan-500',   border: 'border-cyan-500/30',   ring: 'ring-cyan-500/20',   dot: 'bg-cyan-500',   solid: 'bg-cyan-500'  },
  gray:   { bg: 'bg-gray-500/10',   text: 'text-gray-500',   border: 'border-gray-500/30',   ring: 'ring-gray-500/20',   dot: 'bg-gray-500',   solid: 'bg-gray-500'  },
  red:    { bg: 'bg-red-500/10',    text: 'text-red-500',    border: 'border-red-500/30',    ring: 'ring-red-500/20',    dot: 'bg-red-500',    solid: 'bg-red-500'   },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30', ring: 'ring-indigo-500/20', dot: 'bg-indigo-500', solid: 'bg-indigo-500'},
};
const getCol = (c) => COLOR[c] || COLOR.blue;

const JUNIOR_SALARY = {
  frontend: {
    role: { ar: 'Junior Front-End Developer', en: 'Junior Front-End Developer' },
    range: '5K - 16K EGP',
    average: '8K - 11K EGP',
    note: { ar: 'شهريا في مصر، حسب الشركة ومستوى المشاريع.', en: 'per month in Egypt, depending on company and portfolio strength.' },
  },
  backend: {
    role: { ar: 'Junior Back-End Developer', en: 'Junior Back-End Developer' },
    range: '5K - 11K EGP',
    average: '6K - 8K EGP',
    note: { ar: 'شهريا في مصر، وقد يزيد مع Node.js/Databases/Cloud.', en: 'per month in Egypt, with upside for Node.js, databases, and cloud skills.' },
  },
  fullstack: {
    role: { ar: 'Junior Full Stack Developer', en: 'Junior Full Stack Developer' },
    range: '5K - 12K EGP',
    average: '7K - 10K EGP',
    note: { ar: 'شهريا في مصر، لأن الدور يجمع Front-End وBack-End.', en: 'per month in Egypt because the role combines front-end and back-end work.' },
  },
  mobile: {
    role: { ar: 'Junior Mobile Developer', en: 'Junior Mobile Developer' },
    range: '7K - 16K EGP',
    average: '9K - 12K EGP',
    note: { ar: 'شهريا في مصر، ويتغير حسب Flutter/React Native/Native.', en: 'per month in Egypt, varying by Flutter, React Native, or native stack.' },
  },
  'data-analysis': {
    role: { ar: 'Junior Data Analyst', en: 'Junior Data Analyst' },
    range: '7K - 16K EGP',
    average: '10K - 12K EGP',
    note: { ar: 'شهريا في مصر، مع تأثير قوي لمستوى SQL وPower BI.', en: 'per month in Egypt, strongly affected by SQL and Power BI skills.' },
  },
  'ai-ml': {
    role: { ar: 'Junior AI / ML Engineer', en: 'Junior AI / ML Engineer' },
    range: '10K - 22K EGP',
    average: '12K - 16K EGP',
    note: { ar: 'شهريا في مصر، والتقدير أعلى لكنه أكثر تفاوتا لقلة أدوار الجونيور.', en: 'per month in Egypt; higher but more variable because junior roles are fewer.' },
  },
  'cyber-security': {
    role: { ar: 'Junior Cyber Security Analyst', en: 'Junior Cyber Security Analyst' },
    range: '9K - 25K EGP',
    average: '12K - 18K EGP',
    note: { ar: 'شهريا في مصر، ويتأثر بالشهادات والتدريب العملي.', en: 'per month in Egypt, affected by certifications and hands-on labs.' },
  },
  'cs-foundation': {
    role: { ar: 'Junior Software Developer', en: 'Junior Software Developer' },
    range: '6K - 16K EGP',
    average: '9K - 12K EGP',
    note: { ar: 'شهريا في مصر كمسار عام بعد أساسيات علوم الحاسب.', en: 'per month in Egypt as a general CS/software foundation path.' },
  },
  default: {
    role: { ar: 'Junior Software Developer', en: 'Junior Software Developer' },
    range: '6K - 16K EGP',
    average: '9K - 12K EGP',
    note: { ar: 'شهريا في مصر، كتقدير عام لأدوار الجونيور التقنية.', en: 'per month in Egypt as a general estimate for junior tech roles.' },
  },
};

// ── Phase Header ──────────────────────────────────────────────────
const LINKEDIN_JOB_QUERIES = {
  frontend: 'Front-End Developer',
  backend: 'Back-End Developer',
  fullstack: 'Full Stack Developer',
  mobile: 'Mobile Developer',
  'data-analysis': 'Data Analyst',
  'ai-ml': 'Machine Learning Engineer',
  'cyber-security': 'Cyber Security Analyst',
  'cs-foundation': 'Junior Software Developer',
  default: 'Junior Software Developer',
};

const getLinkedInJobsUrl = (careerSlug) => {
  const keywords = LINKEDIN_JOB_QUERIES[careerSlug] || LINKEDIN_JOB_QUERIES.default;
  const params = new URLSearchParams({
    keywords,
    location: 'Egypt',
    f_E: '1,2',
  });

  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
};

const PhaseHeader = ({ number, title, isChoice, col, isAr }) => (
  <div className={cn('flex items-center gap-3 mb-5', isAr && 'flex-row-reverse')}>
    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0', col.solid)}>
      {number}
    </div>
    <div className={cn(isAr ? 'text-right' : '')}>
      <h3 className="font-bold text-base text-foreground">{title}</h3>
      {isChoice && (
        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <GitBranch className="w-3 h-3" />
          {isAr ? 'اختر المسار المناسب لك' : 'Choose your path'}
        </span>
      )}
    </div>
  </div>
);

// ── Skill Item ────────────────────────────────────────────────────
const SkillItem = ({ item, col, isAr, checked, onToggle }) => (
  <div
    className={cn(
      'flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group',
      checked
        ? cn('border-transparent', col.bg, 'ring-1', col.ring)
        : 'border-border bg-background hover:bg-muted/40',
      isAr && 'flex-row-reverse'
    )}
    onClick={onToggle}
  >
    <button className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
      {checked
        ? <CheckCircle2 className={cn('w-5 h-5', col.text)} />
        : <Circle className="w-5 h-5 text-muted-foreground/40" />
      }
    </button>
    <div className={cn('flex-1 min-w-0', isAr && 'text-right')}>
      <p className={cn('font-semibold text-sm', checked && col.text)}>{item.name}</p>
      {item.detail && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p>}
      {item.resourceUrl && (
        <a
          href={item.resourceUrl} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className={cn('inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5 font-medium', isAr && 'flex-row-reverse')}
        >
          <BookOpen className="w-3 h-3" />
          {isAr ? 'مصدر تعليمي' : 'Learning Resource'}
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  </div>
);

// ── Choice Card ───────────────────────────────────────────────────
const ChoiceCard = ({ choice, col, isAr, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={cn(
      'p-5 rounded-xl border-2 cursor-pointer transition-all',
      isSelected
        ? cn('border-transparent ring-2', col.ring, col.bg)
        : 'border-border hover:border-primary/30 hover:bg-muted/30'
    )}
  >
    <div className={cn('flex items-center gap-2 mb-3', isAr && 'flex-row-reverse')}>
      <div className={cn('w-2 h-2 rounded-full', isSelected ? col.dot : 'bg-muted-foreground/30')} />
      <p className={cn('font-bold text-sm', isSelected ? col.text : 'text-foreground')}>{choice.path}</p>
    </div>
    <ul className="space-y-1.5">
      {choice.steps?.map((step, si) => (
        <li key={si} className={cn('flex items-center gap-2 text-xs text-muted-foreground', isAr && 'flex-row-reverse')}>
          <ArrowRight className={cn('w-3 h-3 shrink-0', isAr && 'rotate-180')} />
          <span>{step}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SalaryCard = ({ salary, col, isAr }) => {
  const getText = (o) => isAr ? o?.ar : (o?.en || o?.ar);

  return (
    <div className={cn('rounded-2xl border p-5 shadow-sm bg-card', col.border)}>
      <div className={cn('flex items-start justify-between gap-4 mb-4', isAr && 'flex-row-reverse')}>
        <div className={cn('flex items-start gap-3', isAr && 'flex-row-reverse text-right')}>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', col.bg)}>
            <Banknote className={cn('w-5 h-5', col.text)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              {isAr ? 'متوسط راتب الجونيور' : 'Junior salary average'}
            </p>
            <h3 className="font-bold text-base mt-1">{getText(salary.role)}</h3>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Egypt 2026
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={cn('rounded-xl border border-border bg-muted/30 p-4', isAr && 'text-right')}>
          <p className="text-xs text-muted-foreground mb-1">{isAr ? 'النطاق المتوقع' : 'Expected range'}</p>
          <p className={cn('text-2xl font-black', col.text)}>{salary.range}</p>
          <p className="text-xs text-muted-foreground mt-1">{isAr ? 'شهريا' : 'monthly'}</p>
        </div>
        <div className={cn('rounded-xl border border-border bg-muted/30 p-4', isAr && 'text-right')}>
          <p className="text-xs text-muted-foreground mb-1">{isAr ? 'الأكثر شيوعا' : 'Most common'}</p>
          <p className="text-2xl font-black">{salary.average}</p>
          <p className="text-xs text-muted-foreground mt-1">{isAr ? 'شهريا' : 'monthly'}</p>
        </div>
      </div>

      <p className={cn('text-xs text-muted-foreground mt-3 leading-relaxed', isAr && 'text-right')}>
        {getText(salary.note)} {isAr ? 'الأرقام تقديرية وتتغير حسب الخبرة، المدينة، ونوع الشركة.' : 'Figures are estimates and vary by experience, city, and company type.'}
      </p>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const CareerDetailPage = () => {
  const { careerPath: slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState({});
  const [selectedChoices, setSelectedChoices] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const saveTimerRef = useRef(null);
  const isFirstLoad = useRef(true);

  // ── جلب بيانات المسار + التقدم المحفوظ ─────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [careerRes, progressRes] = await Promise.all([
          careersAPI.getBySlug(slug),
          careerProgressAPI.get(slug).catch(() => ({ progress: null })),
        ]);
        setCareer(careerRes.career);

        // استرجاع التقدم المحفوظ لو موجود
        if (progressRes.progress) {
          const savedChecked = {};
          (progressRes.progress.checkedItems || []).forEach(key => {
            savedChecked[key] = true;
          });
          setChecked(savedChecked);
          setSelectedChoices(progressRes.progress.selectedChoices || {});
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    };
    loadData();
  }, [slug]);

  // ── حفظ تلقائي بعد كل تغيير (debounced 1.5 ثانية) ───────────────
  useEffect(() => {
    if (isFirstLoad.current || loading) return;

    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const checkedItems = Object.entries(checked)
          .filter(([, val]) => val)
          .map(([key]) => key);

        await careerProgressAPI.save(slug, checkedItems, selectedChoices);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1500);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [checked, selectedChoices, slug, loading]);

  // ── Progress Calculation — المنطق الصح ───────────────────────────
  // كل level له نوعين:
  //   - items: عدد المهارات = عدد الـ checkboxes
  //   - isChoice: اختيار framework واحد = يُعد كـ 1 item
  const { totalItems, doneItems } = React.useMemo(() => {
    if (!career?.levels) return { totalItems: 0, doneItems: 0 };

    let total = 0;
    let done = 0;

    career.levels.forEach((level, levelIdx) => {
      if (level.isChoice) {
        // الـ choice كله = item واحد — لو اتاختار يبقى done
        total += 1;
        if (selectedChoices[String(levelIdx)] !== undefined) done += 1;
      } else {
        const items = level.items || [];
        total += items.length;
        items.forEach((_, itemIdx) => {
          if (checked[`${levelIdx}-${itemIdx}`]) done += 1;
        });
      }
    });

    return { totalItems: total, doneItems: done };
  }, [career, checked, selectedChoices]);

  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const toggleItem = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));

  const selectChoice = (levelIdx, choiceIdx) => {
    setSelectedChoices(p => ({ ...p, [String(levelIdx)]: choiceIdx }));
  };

  const getName = (o) => isAr ? o?.ar : (o?.en || o?.ar);

  // ── Loading ──
  if (loading) return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
      </div>
    </DashboardLayout>
  );

  // ── Error ──
  if (error || !career) return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 p-5 bg-destructive/10 rounded-xl border border-destructive/20 mb-4">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{error || (isAr ? 'المسار غير موجود' : 'Track not found')}</p>
        </div>
        <button onClick={() => navigate('/careers')} className="text-sm text-primary hover:underline flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> {isAr ? 'العودة' : 'Back'}
        </button>
      </div>
    </DashboardLayout>
  );

  const col = getCol(career.color);
  const Icon = ICONS[career.icon] || BrainCircuit;
  const levels = (career.levels || []).slice().sort((a, b) => a.order - b.order);
  const salary = JUNIOR_SALARY[slug] || JUNIOR_SALARY.default;
  const linkedInJobsUrl = getLinkedInJobsUrl(slug);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8" dir={isAr ? 'rtl' : 'ltr'}>

        {/* ── Back ── */}
        <button
          onClick={() => navigate('/careers')}
          className={cn('flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors', isAr && 'flex-row-reverse')}
        >
          {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {isAr ? 'المسارات المهنية' : 'Career Tracks'}
        </button>

        {/* ── Hero card ── */}
        <div className={cn('rounded-2xl border p-8 mb-8 relative overflow-hidden', col.border, col.bg)}>
          <div className="relative z-10">
            <div className={cn('inline-flex p-3.5 rounded-2xl mb-5', 'bg-background/60 backdrop-blur')}>
              <Icon className={cn('w-8 h-8', col.text)} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
              {getName(career.name)}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed mb-4 max-w-2xl">
              {getName(career.description)}
            </p>
            {career.why && getName(career.why) && (
              <div className={cn('flex items-start gap-2 p-3 bg-background/50 rounded-xl border border-border/50', isAr && 'flex-row-reverse')}>
                <Lightbulb className={cn('w-4 h-4 mt-0.5 shrink-0', col.text)} />
                <p className="text-sm text-muted-foreground leading-relaxed">{getName(career.why)}</p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className={cn('flex items-center gap-6 mt-6 flex-wrap', isAr && 'flex-row-reverse')}>
            <div className={cn('text-center', isAr && 'text-right')}>
              <p className="text-2xl font-black">{levels.length}</p>
              <p className="text-xs text-muted-foreground">{isAr ? 'مراحل' : 'Phases'}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className={cn('text-center', isAr && 'text-right')}>
              <p className="text-2xl font-black">{totalItems}</p>
              <p className="text-xs text-muted-foreground">{isAr ? 'مهارة' : 'Skills'}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className={cn('flex-1 min-w-32')}>
              <div className={cn('flex items-center justify-between text-xs mb-1.5', isAr && 'flex-row-reverse')}>
                <span className="text-muted-foreground">{isAr ? 'تقدمك' : 'Progress'}</span>
                <span className={cn('font-bold', col.text)}>{progress}%</span>
              </div>
              <div className="w-full bg-background/60 rounded-full h-2 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', col.solid)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {/* Save Status */}
            <div className="shrink-0">
              {saveStatus === 'saving' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Save className="w-3 h-3 animate-pulse" />
                  {isAr ? 'جاري الحفظ...' : 'Saving...'}
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className={cn('text-xs flex items-center gap-1', col.text)}>
                  <CheckCircle2 className="w-3 h-3" />
                  {isAr ? 'تم الحفظ ✓' : 'Saved ✓'}
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <CloudOff className="w-3 h-3" />
                  {isAr ? 'لم يُحفظ' : 'Not saved'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Roadmap ── */}
        <div className="relative">
          {/* Vertical line */}
          <div className={cn(
            'absolute top-0 bottom-0 w-0.5 bg-border',
            isAr ? 'right-[18px]' : 'left-[18px]'
          )} />

          <div className="space-y-6">
            {levels.map((level, idx) => (
              <div key={idx} className={cn('relative flex gap-5', isAr && 'flex-row-reverse')}>
                {/* Timeline dot */}
                <div className={cn(
                  'w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white z-10 mt-4',
                  col.solid
                )}>
                  {idx + 1}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <PhaseHeader
                      number={idx + 1}
                      title={level.title}
                      isChoice={level.isChoice}
                      col={col}
                      isAr={isAr}
                    />

                    {level.isChoice ? (
                      // ── Choice layout ──
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {level.choices?.map((choice, ci) => (
                          <ChoiceCard
                            key={ci}
                            choice={choice}
                            col={col}
                            isAr={isAr}
                            isSelected={selectedChoices[String(idx)] === ci}
                            onSelect={() => selectChoice(idx, ci)}
                          />
                        ))}
                      </div>
                    ) : (
                      // ── Items layout ──
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {level.items?.map((item, ii) => (
                          <SkillItem
                            key={ii}
                            item={item}
                            col={col}
                            isAr={isAr}
                            checked={!!checked[`${idx}-${ii}`]}
                            onToggle={() => toggleItem(`${idx}-${ii}`)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connector arrow */}
                  {idx < levels.length - 1 && (
                    <div className={cn('flex mt-3 mb-1', isAr ? 'justify-end pr-2' : 'justify-start pl-2')}>
                      <div className="text-muted-foreground/40">
                        <ArrowRight className={cn('w-4 h-4 rotate-90')} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Junior Salary */}
            {levels.length > 0 && (
              <div className={cn('relative flex gap-5', isAr && 'flex-row-reverse')}>
                <div className={cn('w-9 h-9 rounded-full shrink-0 flex items-center justify-center z-10 mt-4', col.bg, 'border-2', col.border)}>
                  <Banknote className={cn('w-4 h-4', col.text)} />
                </div>
                <div className="flex-1 pb-2">
                  <SalaryCard salary={salary} col={col} isAr={isAr} />
                  <div className={cn('flex mt-3 mb-1', isAr ? 'justify-end pr-2' : 'justify-start pl-2')}>
                    <div className="text-muted-foreground/40">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Finish ── */}
            {levels.length > 0 && (
              <div className={cn('relative flex gap-5', isAr && 'flex-row-reverse')}>
                <div className={cn('w-9 h-9 rounded-full shrink-0 flex items-center justify-center z-10 mt-1', col.bg, 'border-2', col.border)}>
                  <Sparkles className={cn('w-4 h-4', col.text)} />
                </div>
                <div className="flex-1">
                  <div className={cn('rounded-2xl border-2 p-5', col.border, col.bg)}>
                    <p className={cn('font-bold text-base mb-1', col.text)}>
                      {isAr ? '🎉 أنت الآن جاهز لسوق العمل!' : '🎉 You are now job-ready!'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isAr
                        ? 'ابنِ Portfolio قوي، ابحث عن وظائف على LinkedIn وإيهاب، وابدأ رحلتك المهنية!'
                        : 'Build a strong portfolio, open direct LinkedIn job results, and start your professional journey!'}
                    </p>
                    <div className={cn('flex gap-3 mt-4', isAr && 'flex-row-reverse')}>
                      <a href={linkedInJobsUrl} target="_blank" rel="noopener noreferrer"
                        className={cn('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors', col.bg, col.text, 'hover:opacity-80 border', col.border)}>
                        {isAr ? 'وظائف LinkedIn' : 'LinkedIn Jobs'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Progress Summary ── */}
        {totalItems > 0 && (
          <div className="mt-10 p-5 bg-muted/30 rounded-2xl border border-border">
            <div className={cn('flex items-center justify-between mb-3', isAr && 'flex-row-reverse')}>
              <p className="font-semibold text-sm">
                {isAr ? 'ملخص تقدمك في هذا المسار' : 'Your progress in this track'}
              </p>
              <span className={cn('text-lg font-black', col.text)}>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700', col.solid)} style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isAr ? `${doneItems} من ${totalItems} مهارة أتقنتها ✓` : `${doneItems} of ${totalItems} skills mastered ✓`}
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CareerDetailPage;
