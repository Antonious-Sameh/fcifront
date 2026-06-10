import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { coursesAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext.jsx";
import {
  ExternalLink,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Play,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/);
  return m?.[1] || null;
};

export default function CourseContentPage() {
  const { courseId } = useParams();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    coursesAPI
      .getOne(courseId)
      .then((d) => {
        setCourse(d.course);
        if (d.course?.videos?.length) setActiveVideo(d.course.videos[0]);
      })
      .catch(() =>
        setError(isAr ? "تعذر تحميل الكورس" : "Failed to load course"),
      )
      .finally(() => setLoading(false));
  }, [courseId]);

  const getName = (obj) => (isAr ? obj?.ar : obj?.en || obj?.ar) || "";

  return (
    <>
      <Helmet>
        <title>{course ? getName(course.title) : "كورس"} | Student Core</title>
      </Helmet>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 py-6" dir={isAr ? "rtl" : "ltr"}>
          <Link
            to="/my-courses"
            className={cn(
              "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors",
              isAr && "flex-row-reverse",
            )}
          >
            {isAr ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            {isAr ? "العودة لكورساتي" : "Back to My Courses"}
          </Link>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 text-center gap-3">
              <AlertCircle className="w-10 h-10 text-destructive/50" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" asChild>
                <Link to="/my-courses">{isAr ? "رجوع" : "Go Back"}</Link>
              </Button>
            </div>
          ) : course ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {course.platform}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {course.level}
                  </span>
                </div>
                <h1 className="text-2xl font-black mb-1">
                  {getName(course.title)}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {getName(course.description)}
                </p>
              </div>

              {/* حالة 1: فيديوهات داخلية */}
              {course.videos?.length > 0 ? (
                <div
                  className={cn(
                    "flex gap-6",
                    isAr ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  {/* Player */}
                  <div className="flex-1 space-y-4">
                    {activeVideo && (
                      <>
                        {getYoutubeId(activeVideo.youtubeUrl) ? (
                          <div className="rounded-2xl overflow-hidden aspect-video bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.youtubeUrl)}?rel=0`}
                              title={activeVideo.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-muted aspect-video flex items-center justify-center">
                            <Play className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div>
                          <h2 className="font-bold text-base">
                            {activeVideo.title}
                          </h2>
                          {activeVideo.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {activeVideo.description}
                            </p>
                          )}
                          {activeVideo.duration && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3.5 h-3.5" />
                              {activeVideo.duration}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Playlist */}
                  <div className="w-72 shrink-0 space-y-2">
                    <p className="font-bold text-sm mb-3">
                      {isAr
                        ? `قائمة التشغيل (${course.videos.length} فيديو)`
                        : `Playlist (${course.videos.length} videos)`}
                    </p>
                    {course.videos.map((v, i) => (
                      <button
                        key={v._id}
                        onClick={() => setActiveVideo(v)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all",
                          isAr && "text-right",
                          activeVideo?._id === v._id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card hover:bg-muted/50 text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0",
                            activeVideo?._id === v._id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-sm font-medium truncate">
                            {v.title}
                          </p>
                          {v.duration && (
                            <p className="text-xs text-muted-foreground">
                              {v.duration}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* حالة 2: رابط خارجي فقط */
                <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4 text-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-base mb-1">
                      {isAr
                        ? "هذا الكورس على منصة خارجية"
                        : "This course is on an external platform"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isAr
                        ? `انتقل إلى ${course.platform} لمتابعة الكورس`
                        : `Go to ${course.platform} to continue`}
                    </p>
                  </div>
                  {course.courseUrl || course.url ? (
                    <a
                      href={course.courseUrl || course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {isAr ? "ابدأ الكورس" : "Start Course"}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isAr
                        ? "رابط الكورس غير متاح حالياً"
                        : "Course link not available"}
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {course.tags?.length > 0 && (
                <div
                  className={cn(
                    "flex flex-wrap gap-2",
                    isAr && "flex-row-reverse",
                  )}
                >
                  {course.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    </>
  );
}
