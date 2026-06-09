import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import DashboardLayout from "@/components/layouts/DashboardLayout.jsx";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Building2,
  Bookmark,
  TrendingUp,
  Users,
  Library,
  Sparkles,
  ChevronRight,
  Clock,
  Star,
  ArrowLeft,
} from "lucide-react";
import { adminAPI, coursesAPI, careersAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const YEAR_COLORS = {
  1: {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    border: "border-blue-500/20",
  },
  2: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    border: "border-emerald-500/20",
  },
  3: {
    bg: "bg-violet-500/10",
    text: "text-violet-600",
    border: "border-violet-500/20",
  },
  4: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/20",
  },
};

const QuickCard = ({ to, icon: Icon, title, desc, color, bg, className }) => (
  <Link to={to} className={cn("block group", className)}>
    <div
      className={cn(
        "h-full rounded-2xl border border-border bg-card p-5",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20",
      )}
    >
      <div className={cn("inline-flex p-3 rounded-xl mb-4", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span>اذهب الآن</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  </Link>
);

const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className={cn("inline-flex p-2.5 rounded-xl mb-3", color.bg)}>
      <Icon className={cn("w-5 h-5", color.text)} />
    </div>
    {loading ? (
      <Skeleton className="h-8 w-16 mb-1" />
    ) : (
      <p className="text-3xl font-black mb-1">{value}</p>
    )}
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const HomePage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [stats, setStats] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [careers, setCareers] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const yearColor = YEAR_COLORS[user?.year] || YEAR_COLORS[1];

  useEffect(() => {
    // جيب إحصائيات بسيطة
    Promise.all([
      coursesAPI.getMyCourses().catch(() => ({ courses: [] })),
      careersAPI.getAll().catch(() => ({ careers: [] })),
    ])
      .then(([coursesRes, careersRes]) => {
        setMyCourses(coursesRes.courses || []);
        setCareers((careersRes.careers || []).slice(0, 3));
      })
      .finally(() => setStatsLoading(false));
  }, []);

  const quickLinks = [
    {
      to: "/university",
      icon: GraduationCap,
      title: isAr ? "المواد الدراسية" : "Study Materials",
      desc: isAr
        ? "محاضرات وملفات لكل السنوات والترمات"
        : "Lectures and files for all years",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      className: "md:col-span-2",
    },
    {
      to: "/careers",
      icon: Briefcase,
      title: isAr ? "المسارات المهنية" : "Career Tracks",
      desc: isAr
        ? "Roadmaps احترافية لكل تخصص"
        : "Professional roadmaps for each track",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      to: "/courses",
      icon: BookOpen,
      title: isAr ? "الكورسات" : "Courses",
      desc: isAr
        ? "كورسات خارجية من أفضل المنصات"
        : "External courses from top platforms",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      to: "/departments",
      icon: Building2,
      title: isAr ? "الأقسام" : "Departments",
      desc: isAr
        ? "تعرف على أقسام الكلية واختر تخصصك"
        : "Explore departments and choose your major",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      to: "/my-courses",
      icon: Bookmark,
      title: isAr ? "كورساتي" : "My Courses",
      desc: isAr ? "الكورسات اللي اشتركت فيها" : "Courses you enrolled in",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  const statCards = [
    {
      label: isAr ? "سنتك الدراسية" : "Academic Year",
      value: user?.year ? `${isAr ? "السنة" : "Year"} ${user.year}` : "—",
      icon: GraduationCap,
      color: yearColor,
    },
    {
      label: isAr ? "الكورسات المسجّلة" : "Enrolled Courses",
      value: statsLoading ? "..." : myCourses.length,
      icon: BookOpen,
      color: { bg: "bg-indigo-500/10", text: "text-indigo-500" },
    },
    {
      label: isAr ? "المسارات المتاحة" : "Available Tracks",
      value: statsLoading ? "..." : careers.length + "+",
      icon: TrendingUp,
      color: { bg: "bg-orange-500/10", text: "text-orange-500" },
    },
    {
      label: isAr ? "سنوات دراسية" : "Academic Years",
      value: 4,
      icon: Library,
      color: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t("sidebar.dashboard")} | Student Core</title>
      </Helmet>
      <DashboardLayout>
        <div
          className="max-w-6xl mx-auto px-2 md:px-4 py-6 space-y-8"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* ── Welcome Hero ── */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-7 md:p-10">
            <div
              className={cn(
                "absolute text-[140px] font-black opacity-[0.03] leading-none select-none pointer-events-none",
                isAr ? "left-4 bottom-0" : "right-4 bottom-0",
              )}
            >
              FCI
            </div>
            <div className="relative z-10">
              <div
                className={cn(
                  "flex items-center gap-2 mb-3",
                  isAr && "flex-row-reverse",
                )}
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {isAr
                    ? "مرحباً بك في منصة الكلية"
                    : "Welcome to FCI Platform"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                {isAr
                  ? `أهلاً، ${user?.name?.split(" ")[0] || "طالب"} 👋`
                  : `Hello, ${user?.name?.split(" ")[0] || "Student"} 👋`}
              </h1>
              <p className="text-muted-foreground text-base mb-5 max-w-xl">
                {isAr
                  ? "منصتك الشاملة للدراسة والتطور المهني — كل حاجة محتاجها في مكان واحد"
                  : "Your complete platform for studying and career growth — everything you need in one place"}
              </p>

              {/* Quick CTA */}
              <div
                className={cn(
                  "flex flex-wrap gap-3",
                  isAr && "flex-row-reverse",
                )}
              >
                <Link
                  to="/university"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  {isAr ? "ابدأ الدراسة" : "Start Studying"}
                </Link>
                <Link
                  to="/careers"
                  className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  {isAr ? "اختار تخصصك" : "Choose Your Specialty"}
                </Link>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div>
            <h2 className={cn("text-lg font-bold mb-4", isAr && "text-right")}>
              {isAr ? "📊 نظرة سريعة" : "📊 Quick Stats"}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <StatCard key={i} {...s} loading={statsLoading && i > 0} />
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h2 className={cn("text-lg font-bold mb-4", isAr && "text-right")}>
              {isAr ? "🚀 الوصول السريع" : "🚀 Quick Access"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickLinks.map((card, i) => (
                <QuickCard key={i} {...card} />
              ))}
            </div>
          </div>

          {/* ── My Courses + Careers row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Courses */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div
                className={cn(
                  "flex items-center justify-between mb-4",
                  isAr && "flex-row-reverse",
                )}
              >
                <h3 className="font-bold text-base">
                  {isAr ? "📚 كورساتي" : "📚 My Courses"}
                </h3>
                <Link
                  to="/my-courses"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {isAr ? "الكل" : "View All"}{" "}
                  <ChevronRight
                    className={cn("w-3.5 h-3.5", isAr && "rotate-180")}
                  />
                </Link>
              </div>
              {statsLoading ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-12 rounded-xl" />
                    ))}
                </div>
              ) : myCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bookmark className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isAr
                      ? "لم تشترك في كورسات بعد"
                      : "No enrolled courses yet"}
                  </p>
                  <Link
                    to="/courses"
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    {isAr ? "تصفح الكورسات" : "Browse courses"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {myCourses.slice(0, 4).map((course) => (
                    <div
                      key={course._id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50",
                        isAr && "flex-row-reverse",
                      )}
                    >
                      <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div
                        className={cn("flex-1 min-w-0", isAr && "text-right")}
                      >
                        <p className="text-sm font-medium truncate">
                          {isAr
                            ? course.title?.ar
                            : course.title?.en || course.title?.ar}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.platform}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Careers */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div
                className={cn(
                  "flex items-center justify-between mb-4",
                  isAr && "flex-row-reverse",
                )}
              >
                <h3 className="font-bold text-base">
                  {isAr ? "🧭 مسارات مميزة" : "🧭 Featured Tracks"}
                </h3>
                <Link
                  to="/careers"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {isAr ? "الكل" : "View All"}{" "}
                  <ChevronRight
                    className={cn("w-3.5 h-3.5", isAr && "rotate-180")}
                  />
                </Link>
              </div>
              {statsLoading ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-xl" />
                    ))}
                </div>
              ) : careers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isAr
                      ? "لا توجد مسارات متاحة حالياً"
                      : "No career tracks available yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {careers.map((career) => (
                    <Link
                      key={career._id}
                      to={`/careers/${career.slug}`}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group",
                        isAr && "flex-row-reverse",
                      )}
                    >
                      <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                        <Briefcase className="w-4 h-4 text-orange-500" />
                      </div>
                      <div
                        className={cn("flex-1 min-w-0", isAr && "text-right")}
                      >
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {isAr
                            ? career.name?.ar
                            : career.name?.en || career.name?.ar}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {career.levels?.length || 0}{" "}
                          {isAr ? "مراحل" : "phases"}
                        </p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0",
                          isAr && "rotate-180",
                        )}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Year shortcut ── */}
          {user?.year && (
            <div
              className={cn(
                "rounded-2xl border-2 p-5 flex items-center gap-4",
                yearColor.border,
                yearColor.bg,
                isAr && "flex-row-reverse",
              )}
            >
              <div className={cn("p-3 bg-background/70 rounded-xl")}>
                <Star className={cn("w-6 h-6", yearColor.text)} />
              </div>
              <div className={cn("flex-1", isAr && "text-right")}>
                <p className="font-bold text-sm">
                  {isAr
                    ? `أنت في ${["السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة"][user.year - 1]}`
                    : `You are in Year ${user.year}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr
                    ? "انتقل مباشرة لمواد سنتك"
                    : "Jump directly to your year subjects"}
                </p>
              </div>
              <Link
                to={`/university/${user.year}`}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 bg-background border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors shrink-0",
                  yearColor.text,
                  isAr && "flex-row-reverse",
                )}
              >
                {isAr ? "اذهب" : "Go"}{" "}
                <ChevronRight className={cn("w-4 h-4", isAr && "rotate-180")} />
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default HomePage;