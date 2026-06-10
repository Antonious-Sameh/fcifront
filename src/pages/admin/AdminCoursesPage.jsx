import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/layouts/AdminLayout.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Trash2, Edit2, RefreshCw, BookOpen, ExternalLink, AlertCircle, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { coursesAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const PLATFORMS = ['YouTube', 'Udemy', 'Coursera', 'edX', 'LinkedIn', 'Pluralsight', 'Other'];
const LEVELS = [{ value: 'beginner', label: 'مبتدئ' }, { value: 'intermediate', label: 'متوسط' }, { value: 'advanced', label: 'متقدم' }];
const LANGUAGES = [{ value: 'ar', label: 'عربي' }, { value: 'en', label: 'إنجليزي' }, { value: 'both', label: 'الاثنين' }];

const emptyForm = { titleAr: '', titleEn: '', descAr: '', courseUrl: '', platform: 'YouTube', price: '0', category: '', level: 'beginner', language: 'ar', duration: '', order: '0' };
const emptyVideo = { title: '', youtubeUrl: '', duration: '' };

const FormField = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}{required && <span className="text-destructive"> *</span>}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const PLATFORM_BADGE = {
  YouTube: 'bg-red-500/10 text-red-600', Udemy: 'bg-orange-500/10 text-orange-600',
  Coursera: 'bg-blue-500/10 text-blue-600', edX: 'bg-indigo-500/10 text-indigo-600',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Videos modal
  const [videosModal, setVideosModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videoForm, setVideoForm] = useState(emptyVideo);
  const [addingVideo, setAddingVideo] = useState(false);

  const load = async () => {
    try { setLoading(true); const d = await coursesAPI.getAll(); setCourses(d.courses || []); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.titleAr.trim()) errs.titleAr = 'الاسم بالعربي مطلوب';
    if (form.courseUrl && !/^https?:\/\//.test(form.courseUrl)) errs.courseUrl = 'رابط غير صالح';
    return errs;
  };

  const openModal = (course = null) => {
    setErrors({});
    if (course) {
      setEditing(course);
      setForm({
        titleAr: course.title?.ar || '', titleEn: course.title?.en || '',
        descAr: course.description?.ar || '',
        courseUrl: course.courseUrl || course.url || '',
        platform: course.platform || 'YouTube', price: String(course.price ?? 0),
        category: course.category || '', level: course.level || 'beginner',
        language: course.language || 'ar', duration: course.duration || '',
        order: String(course.order || 0),
      });
    } else { setEditing(null); setForm(emptyForm); }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const payload = {
      title: { ar: form.titleAr.trim(), en: form.titleEn.trim() },
      description: { ar: form.descAr.trim() },
      courseUrl: form.courseUrl.trim(),
      url: form.courseUrl.trim(),
      platform: form.platform,
      price: Number(form.price) || 0,
      category: form.category.trim(),
      level: form.level, language: form.language,
      duration: form.duration.trim(), order: Number(form.order) || 0,
    };
    try {
      if (editing) { await coursesAPI.update(editing._id, payload); toast.success('تم تعديل الكورس ✓'); }
      else { await coursesAPI.create(payload); toast.success('تم إضافة الكورس ✓'); }
      setIsModalOpen(false); load();
    } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`حذف كورس "${course.title?.ar}"؟`)) return;
    try { await coursesAPI.delete(course._id); setCourses(p => p.filter(c => c._id !== course._id)); toast.success('تم الحذف'); }
    catch (e) { toast.error(e.message); }
  };

  // ── Videos ────────────────────────────────────────────────────
  const openVideos = (course) => { setSelectedCourse(course); setVideoForm(emptyVideo); setVideosModal(true); };

  const handleAddVideo = async () => {
    if (!videoForm.title.trim()) return toast.error('عنوان الفيديو مطلوب');
    if (!videoForm.youtubeUrl.trim()) return toast.error('رابط اليوتيوب مطلوب');
    setAddingVideo(true);
    try {
      const data = await coursesAPI.addVideo(selectedCourse._id, videoForm);
      setSelectedCourse(p => ({ ...p, videos: data.videos }));
      setCourses(p => p.map(c => c._id === selectedCourse._id ? { ...c, videos: data.videos } : c));
      setVideoForm(emptyVideo);
      toast.success('تم إضافة الفيديو ✓');
    } catch (e) { toast.error(e.message); } finally { setAddingVideo(false); }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      const data = await coursesAPI.deleteVideo(selectedCourse._id, videoId);
      setSelectedCourse(p => ({ ...p, videos: data.videos }));
      setCourses(p => p.map(c => c._id === selectedCourse._id ? { ...c, videos: data.videos } : c));
      toast.success('تم حذف الفيديو');
    } catch (e) { toast.error(e.message); }
  };

  return (
    <AdminLayout>
      <Helmet><title>إدارة الكورسات | Admin</title></Helmet>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">الكورسات الخارجية</h1>
            <p className="text-sm text-muted-foreground mt-1">{courses.length} كورس مسجّل</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
            <Button onClick={() => openModal()} className="gap-2"><Plus className="w-4 h-4" />إضافة كورس</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-right font-semibold">الكورس</TableHead>
                  <TableHead className="text-right font-semibold">المنصة</TableHead>
                  <TableHead className="text-right font-semibold">السعر</TableHead>
                  <TableHead className="text-right font-semibold">الفيديوهات</TableHead>
                  <TableHead className="text-right font-semibold">المستوى</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array(4).fill(0).map((_, i) => (
                  <TableRow key={i}>{Array(6).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full rounded" /></TableCell>)}</TableRow>
                )) : courses.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>لا توجد كورسات — أضف أول كورس</p>
                  </TableCell></TableRow>
                ) : courses.map(course => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{course.title?.ar}</p>
                          {course.instructor && <p className="text-xs text-muted-foreground">{course.instructor}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('border-0 font-normal text-xs', PLATFORM_BADGE[course.platform] || 'bg-gray-500/10 text-gray-600')}>
                        {course.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {course.price === 0 ? <span className="text-emerald-600">مجاني</span> : `${course.price} جنيه`}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => openVideos(course)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Video className="w-3.5 h-3.5" />
                        <span className="font-medium">{course.videos?.length || 0}</span> فيديو
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {course.level === 'beginner' ? 'مبتدئ' : course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openModal(course)}><Edit2 className="w-4 h-4 ml-2" />تعديل</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openVideos(course)}><Video className="w-4 h-4 ml-2" />الفيديوهات</DropdownMenuItem>
                          {(course.courseUrl || course.url) && (
                            <DropdownMenuItem asChild>
                              <a href={course.courseUrl || course.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 ml-2" />فتح الرابط
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(course)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 ml-2" />حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold">{editing ? 'تعديل الكورس' : 'إضافة كورس جديد'}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">أضف كورسات من منصات مثل YouTube وUdemy وCoursera</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FormField label="اسم الكورس بالعربي" required>
                <Input value={form.titleAr} onChange={set('titleAr')} placeholder="كورس React.js الشامل"
                  className={cn('h-10', errors.titleAr && 'border-destructive')} />
                {errors.titleAr && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.titleAr}</p>}
              </FormField>
              <FormField label="اسم الكورس بالإنجليزي">
                <Input value={form.titleEn} onChange={set('titleEn')} placeholder="Complete React.js Course" className="h-10" dir="ltr" />
              </FormField>
              <FormField label="رابط الكورس" hint="رابط Playlist أو الكورس على المنصة (اختياري لو هتضيف فيديوهات داخلياً)">
                <Input value={form.courseUrl} onChange={set('courseUrl')} placeholder="https://youtube.com/playlist?list=..."
                  className={cn('h-10', errors.courseUrl && 'border-destructive')} dir="ltr" />
                {errors.courseUrl && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.courseUrl}</p>}
              </FormField>
              <FormField label="وصف الكورس">
                <Textarea value={form.descAr} onChange={set('descAr')} placeholder="ماذا سيتعلم الطالب..." rows={2} className="resize-none" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="المنصة">
                  <Select value={form.platform} onValueChange={v => setForm(p => ({ ...p, platform: v }))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{PLATFORMS.map(pl => <SelectItem key={pl} value={pl}>{pl}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="السعر (0 = مجاني)">
                  <Input type="number" min="0" value={form.price} onChange={set('price')} className="h-10" dir="ltr" />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="المستوى">
                  <Select value={form.level} onValueChange={v => setForm(p => ({ ...p, level: v }))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="اللغة">
                  <Select value={form.language} onValueChange={v => setForm(p => ({ ...p, language: v }))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="المدة">
                  <Input value={form.duration} onChange={set('duration')} placeholder="8 ساعات" className="h-10" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="الفئة" hint="مثال: Web Dev, AI">
                  <Input value={form.category} onChange={set('category')} placeholder="Web Development" className="h-10" />
                </FormField>
                <FormField label="الترتيب">
                  <Input type="number" min="0" value={form.order} onChange={set('order')} className="h-10" dir="ltr" />
                </FormField>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2 pt-2 border-t border-border">
              <Button onClick={handleSave} disabled={saving} className="min-w-24">
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة الكورس')}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Videos Modal */}
        <Dialog open={videosModal} onOpenChange={setVideosModal}>
          <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                فيديوهات: {selectedCourse?.title?.ar}
              </DialogTitle>
              <DialogDescription>أضف فيديوهات اليوتيوب للكورس — هتظهر للطالب مرتبة داخل الموقع</DialogDescription>
            </DialogHeader>

            {/* Add Video Form */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border">
              <p className="text-sm font-semibold">إضافة فيديو جديد</p>
              <div className="grid grid-cols-1 gap-3">
                <Input value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="عنوان الفيديو — مثال: شرح React Hooks" className="h-10" />
                <Input value={videoForm.youtubeUrl} onChange={e => setVideoForm(p => ({ ...p, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..." className="h-10" dir="ltr" />
                <div className="flex gap-2">
                  <Input value={videoForm.duration} onChange={e => setVideoForm(p => ({ ...p, duration: e.target.value }))}
                    placeholder="المدة — مثال: 25 دقيقة" className="h-10 flex-1" />
                  <Button onClick={handleAddVideo} disabled={addingVideo} className="h-10 gap-2 shrink-0">
                    <Plus className="w-4 h-4" />{addingVideo ? 'جاري...' : 'إضافة'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Videos List */}
            <div className="space-y-2 mt-2">
              {!selectedCourse?.videos?.length ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا يوجد فيديوهات بعد — أضف أول فيديو</p>
              ) : (
                selectedCourse.videos.map((v, i) => (
                  <div key={v._id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{v.title}</p>
                      {v.duration && <p className="text-xs text-muted-foreground">{v.duration}</p>}
                    </div>
                    {v.youtubeUrl && (
                      <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => handleDeleteVideo(v._id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}