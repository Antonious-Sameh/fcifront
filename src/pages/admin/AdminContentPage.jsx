import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/layouts/AdminLayout.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Plus, MoreHorizontal, Trash2, Edit2, RefreshCw,
  BookOpen, Video, FileText, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI, subjectsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const YEAR_LABELS = { 1:'السنة الأولى', 2:'السنة الثانية', 3:'السنة الثالثة', 4:'السنة الرابعة' };
const TERM_LABELS = { 1:'الترم الأول', 2:'الترم الثاني' };

const emptySubjectForm = { slug:'', nameAr:'', nameEn:'', descAr:'', year:'1', term:'1', code:'', instructor:'', creditHours:'3', order:'0' };
// استخراج YouTube ID من رابط كامل أو ID مباشر
const extractYtId = (input) => {
  if (!input) return '';
  input = input.trim();
  if (!input.includes('/') && !input.includes('?')) return input;
  const m = input.match(/(?:v=|youtu\.be\/|embed\/)([^&?#\n]+)/);
  return m ? m[1] : '';
};
const emptyLectureForm = { titleAr:'', titleEn:'', type:'lecture', videoId:'', duration:'', order:'0' };

const FormField = ({ label, required, children, hint, error }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-foreground">
      {label}{required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{error}</p>}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

// ── Group subjects by year/term ────────────────────────────────────
const groupSubjects = (subjects) => {
  return subjects.reduce((acc, s) => {
    const key = `${s.year}-${s.term}`;
    if (!acc[key]) acc[key] = { year: s.year, term: s.term, subjects: [] };
    acc[key].subjects.push(s);
    return acc;
  }, {});
};

export default function AdminContentPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Subject modal
  const [subjectModal, setSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [subjectErrors, setSubjectErrors] = useState({});
  const [savingSubject, setSavingSubject] = useState(false);

  // Lecture modal
  const [lectureModal, setLectureModal] = useState(false);
  const [lectureSubject, setLectureSubject] = useState(null);
  const [lectureForm, setLectureForm] = useState(emptyLectureForm);
  const [lectureErrors, setLectureErrors] = useState({});
  const [savingLecture, setSavingLecture] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const d = await adminAPI.getAllSubjects();
      setSubjects(d.subjects || []);
    } catch(e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // ── Subject CRUD ────────────────────────────────────────────────
  const setS = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setSubjectForm(p => ({ ...p, [field]: val }));
    if (subjectErrors[field]) setSubjectErrors(p => ({ ...p, [field]: '' }));
  };

  const validateSubject = () => {
    const errs = {};
    if (!subjectForm.slug.trim()) errs.slug = 'Slug مطلوب';
    if (!subjectForm.nameAr.trim()) errs.nameAr = 'الاسم بالعربي مطلوب';
    return errs;
  };

  const openSubjectModal = (subject = null) => {
    setSubjectErrors({});
    if (subject) {
      setEditingSubject(subject);
      setSubjectForm({
        slug: subject.slug, nameAr: subject.name?.ar||'', nameEn: subject.name?.en||'',
        descAr: subject.description?.ar||'', year: String(subject.year||1), term: String(subject.term||1),
        code: subject.code||'', instructor: subject.instructor||'',
        creditHours: String(subject.creditHours||3), order: String(subject.order||0),
      });
    } else { setEditingSubject(null); setSubjectForm(emptySubjectForm); }
    setSubjectModal(true);
  };

  const handleSaveSubject = async () => {
    const errs = validateSubject();
    if (Object.keys(errs).length) { setSubjectErrors(errs); return; }
    setSavingSubject(true);
    const payload = {
      slug: subjectForm.slug.trim(), year: Number(subjectForm.year), term: Number(subjectForm.term),
      nameAr: subjectForm.nameAr.trim(), nameEn: subjectForm.nameEn.trim(),
      descAr: subjectForm.descAr.trim(), code: subjectForm.code.trim(),
      instructor: subjectForm.instructor.trim(), creditHours: Number(subjectForm.creditHours)||3,
      order: Number(subjectForm.order)||0,
    };
    try {
      if (editingSubject) { await subjectsAPI.update(editingSubject._id, payload); toast.success('تم تعديل المادة ✓'); }
      else { await subjectsAPI.create(payload); toast.success('تم إضافة المادة ✓'); }
      setSubjectModal(false); load();
    } catch(e) { toast.error(e.message); } finally { setSavingSubject(false); }
  };

  const handleDeleteSubject = async (subject) => {
    if (!window.confirm(`حذف مادة "${subject.name?.ar}"؟ هيتحذف كل محاضراتها أيضاً.`)) return;
    try { await subjectsAPI.delete(subject._id); setSubjects(p=>p.filter(s=>s._id!==subject._id)); toast.success('تم حذف المادة'); }
    catch(e) { toast.error(e.message); }
  };

  // ── Lecture CRUD ────────────────────────────────────────────────
  const setL = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setLectureForm(p => ({ ...p, [field]: val }));
    if (lectureErrors[field]) setLectureErrors(p => ({ ...p, [field]: '' }));
  };

  const openLectureModal = (subject) => {
    setLectureSubject(subject);
    setLectureForm(emptyLectureForm);
    setLectureErrors({});
    setPdfFile(null);
    setLectureModal(true);
  };

  const handleSaveLecture = async () => {
    if (!lectureForm.titleAr.trim()) { setLectureErrors({ titleAr: 'العنوان بالعربي مطلوب' }); return; }
    setSavingLecture(true);
    try {
      const formData = new FormData();
      formData.append('titleAr', lectureForm.titleAr.trim());
      formData.append('titleEn', lectureForm.titleEn.trim());
      formData.append('type', lectureForm.type);
      formData.append('videoId', lectureForm.videoId.trim());
      formData.append('duration', lectureForm.duration.trim());
      formData.append('order', lectureForm.order);
      if (pdfFile) formData.append('pdf', pdfFile);
      await subjectsAPI.addLecture(lectureSubject._id, formData);
      toast.success('تم إضافة المحاضرة ✓');
      setLectureModal(false); load();
    } catch(e) { toast.error(e.message); } finally { setSavingLecture(false); }
  };

  const handleDeleteLecture = async (subject, lectureId) => {
    if (!window.confirm('حذف هذه المحاضرة؟')) return;
    try { await subjectsAPI.deleteLecture(subject._id, lectureId); toast.success('تم حذف المحاضرة'); load(); }
    catch(e) { toast.error(e.message); }
  };

  // ── Group subjects ──────────────────────────────────────────────
  const grouped = groupSubjects(subjects);
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    const [ay, at] = a.split('-').map(Number);
    const [by, bt] = b.split('-').map(Number);
    return ay !== by ? ay - by : at - bt;
  });

  const toggleGroup = (key) => setExpandedGroups(p => ({ ...p, [key]: !p[key] }));

  return (
    <AdminLayout>
      <Helmet><title>إدارة المحتوى | Admin</title></Helmet>
      <div className="space-y-6" dir="rtl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">إدارة المحتوى الدراسي</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {subjects.length} مادة دراسية · {subjects.reduce((a,s)=>a+(s.lectureCount||0),0)} محاضرة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
            <Button onClick={() => openSubjectModal()} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة مادة
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array(3).fill(0).map((_,i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && subjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-muted/20 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium mb-2">لا توجد مواد دراسية</p>
            <p className="text-sm text-muted-foreground mb-4">لا توجد مواد بعد — أضف أول مادة</p>
            <Button onClick={() => openSubjectModal()} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> إضافة مادة
            </Button>
          </div>
        )}

        {/* Groups */}
        {!loading && groupKeys.map(key => {
          const { year, term, subjects: groupSubjects } = grouped[key];
          const isExpanded = expandedGroups[key] !== false; // default expanded
          const totalLectures = groupSubjects.reduce((a,s) => a + (s.lectureCount||0), 0);

          return (
            <div key={key} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(key)}
                className="w-full flex items-center justify-between px-5 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{YEAR_LABELS[year]} — {TERM_LABELS[term]}</p>
                    <p className="text-xs text-muted-foreground">
                      {groupSubjects.length} مادة · {totalLectures} محاضرة
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {/* Subjects Table */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right font-semibold">المادة</TableHead>
                        <TableHead className="text-right font-semibold">الكود</TableHead>
                        <TableHead className="text-right font-semibold">الدكتور</TableHead>
                        <TableHead className="text-right font-semibold">المحاضرات</TableHead>
                        <TableHead className="text-right font-semibold">الحالة</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupSubjects.map(subject => (
                        <TableRow key={subject._id}>
                          <TableCell>
                            <div className="text-right">
                              <p className="font-semibold text-sm">{subject.name?.ar}</p>
                              {subject.name?.en && <p className="text-xs text-muted-foreground">{subject.name.en}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {subject.code ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{subject.code}</code>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {subject.instructor ? `د. ${subject.instructor}` : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="font-normal gap-1">
                                <Video className="w-3 h-3" />{subject.lectureCount || 0}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={subject.isActive ? 'default' : 'outline'}
                              className={cn(!subject.isActive && 'text-muted-foreground', 'font-normal')}>
                              {subject.isActive ? '● نشط' : '○ مخفي'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => openSubjectModal(subject)}>
                                  <Edit2 className="w-4 h-4 ml-2" /> تعديل المادة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openLectureModal(subject)}>
                                  <Plus className="w-4 h-4 ml-2" /> إضافة محاضرة
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteSubject(subject)}
                                  className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-4 h-4 ml-2" /> حذف المادة
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Subject Modal ── */}
        <Dialog open={subjectModal} onOpenChange={setSubjectModal}>
          <DialogContent className="max-w-xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold">
                {editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {editingSubject ? 'عدّل بيانات المادة الدراسية' : 'أضف مادة جديدة للمنهج الدراسي'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="السنة" required>
                  <Select value={subjectForm.year} onValueChange={v => setSubjectForm(p=>({...p, year:v}))}>
                    <SelectTrigger className="h-10"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4].map(y => <SelectItem key={y} value={String(y)}>{YEAR_LABELS[y]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="الترم" required>
                  <Select value={subjectForm.term} onValueChange={v => setSubjectForm(p=>({...p, term:v}))}>
                    <SelectTrigger className="h-10"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">الترم الأول</SelectItem>
                      <SelectItem value="2">الترم الثاني</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Slug (رابط المادة)" required hint="مثال: math-101, data-structures"
                error={subjectErrors.slug}>
                <Input value={subjectForm.slug}
                  onChange={e => { setSubjectForm(p=>({...p, slug:e.target.value.toLowerCase().replace(/\s/g,'-')})); setSubjectErrors(p=>({...p,slug:''})); }}
                  placeholder="math-101" disabled={!!editingSubject}
                  className={cn('h-10', subjectErrors.slug && 'border-destructive')} dir="ltr"/>
              </FormField>

              <FormField label="الاسم بالعربي" required error={subjectErrors.nameAr}>
                <Input value={subjectForm.nameAr} onChange={e => { setSubjectForm(p=>({...p,nameAr:e.target.value})); setSubjectErrors(p=>({...p,nameAr:''})); }}
                  placeholder="الرياضيات ١" className={cn('h-10', subjectErrors.nameAr && 'border-destructive')}/>
              </FormField>

              <FormField label="الاسم بالإنجليزي">
                <Input value={subjectForm.nameEn} onChange={e=>setSubjectForm(p=>({...p,nameEn:e.target.value}))}
                  placeholder="Mathematics I" className="h-10" dir="ltr"/>
              </FormField>

              <FormField label="الوصف">
                <Input value={subjectForm.descAr} onChange={e=>setSubjectForm(p=>({...p,descAr:e.target.value}))}
                  placeholder="وصف مختصر للمادة" className="h-10"/>
              </FormField>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="الكود">
                  <Input value={subjectForm.code} onChange={e=>setSubjectForm(p=>({...p,code:e.target.value}))}
                    placeholder="CS101" className="h-10" dir="ltr"/>
                </FormField>
                <FormField label="الساعات">
                  <Input type="number" min="1" max="6" value={subjectForm.creditHours}
                    onChange={e=>setSubjectForm(p=>({...p,creditHours:e.target.value}))} className="h-10" dir="ltr"/>
                </FormField>
                <FormField label="الترتيب">
                  <Input type="number" min="0" value={subjectForm.order}
                    onChange={e=>setSubjectForm(p=>({...p,order:e.target.value}))} className="h-10" dir="ltr"/>
                </FormField>
              </div>

              <FormField label="الدكتور المسؤول">
                <Input value={subjectForm.instructor}
                  onChange={e=>setSubjectForm(p=>({...p,instructor:e.target.value}))}
                  placeholder="د. محمد أحمد" className="h-10"/>
              </FormField>
            </div>

            <DialogFooter className="flex-row-reverse gap-2 pt-2 border-t border-border">
              <Button onClick={handleSaveSubject} disabled={savingSubject} className="min-w-24">
                {savingSubject ? 'جاري الحفظ...' : (editingSubject ? 'حفظ التعديلات' : 'إضافة المادة')}
              </Button>
              <Button variant="outline" onClick={()=>setSubjectModal(false)} disabled={savingSubject}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Lecture Modal ── */}
        <Dialog open={lectureModal} onOpenChange={setLectureModal}>
          <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold">إضافة محاضرة</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                إضافة محاضرة أو سكشن لمادة: <strong>{lectureSubject?.name?.ar}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <FormField label="النوع">
                <Select value={lectureForm.type} onValueChange={v=>setLectureForm(p=>({...p,type:v}))}>
                  <SelectTrigger className="h-10"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">محاضرة</SelectItem>
                    <SelectItem value="section">سكشن</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="العنوان بالعربي" required error={lectureErrors.titleAr}>
                <Input value={lectureForm.titleAr}
                  onChange={e=>{setLectureForm(p=>({...p,titleAr:e.target.value}));setLectureErrors(p=>({...p,titleAr:''}));}}
                  placeholder="المحاضرة ١: مقدمة في..."
                  className={cn('h-10', lectureErrors.titleAr && 'border-destructive')}/>
              </FormField>

              <FormField label="العنوان بالإنجليزي">
                <Input value={lectureForm.titleEn} onChange={e=>setLectureForm(p=>({...p,titleEn:e.target.value}))}
                  placeholder="Lecture 1: Introduction to..." className="h-10" dir="ltr"/>
              </FormField>

              <FormField label="رابط YouTube أو Video ID" hint="الصق رابط YouTube كامل أو الـ ID مباشرة — مثال: https://youtube.com/watch?v=abc123 أو abc123">
                <Input value={lectureForm.videoId} onChange={e=>setLectureForm(p=>({...p,videoId:e.target.value.trim()}))}
                  placeholder="dQw4w9WgXcQ" className="h-10" dir="ltr"/>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                {extractYtId(lectureForm.videoId) && (
                <div className="rounded-xl overflow-hidden border border-border mt-1">
                  <img
                    src={`https://img.youtube.com/vi/${extractYtId(lectureForm.videoId)}/mqdefault.jpg`}
                    alt="thumbnail"
                    className="w-full object-cover max-h-32"
                    onError={e => e.target.style.display='none'}
                  />
                  <p className="text-xs text-emerald-600 font-semibold px-3 py-1.5 bg-emerald-500/5">
                    ✓ تم التعرف على الفيديو — ID: {extractYtId(lectureForm.videoId)}
                  </p>
                </div>
              )}
                <FormField label="المدة" hint="مثال: 45 دقيقة">
                  <Input value={lectureForm.duration} onChange={e=>setLectureForm(p=>({...p,duration:e.target.value}))}
                    placeholder="45 دقيقة" className="h-10"/>
                </FormField>
                <FormField label="الترتيب">
                  <Input type="number" min="0" value={lectureForm.order}
                    onChange={e=>setLectureForm(p=>({...p,order:e.target.value}))} className="h-10" dir="ltr"/>
                </FormField>
              </div>

              <FormField label="ملف PDF (اختياري)" hint="PDF فقط — حد أقصى 50MB">
                <div className="flex items-center gap-3">
                  <label className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border',
                    'hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-all text-sm',
                    pdfFile && 'border-emerald-500 bg-emerald-500/5 text-emerald-600'
                  )}>
                    <FileText className="w-4 h-4 shrink-0" />
                    {pdfFile ? pdfFile.name : 'اختر ملف PDF'}
                    <input type="file" accept=".pdf" className="hidden"
                      onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                  </label>
                  {pdfFile && (
                    <button onClick={() => setPdfFile(null)}
                      className="text-xs text-destructive hover:underline">إزالة</button>
                  )}
                </div>
              </FormField>
            </div>

            <DialogFooter className="flex-row-reverse gap-2 pt-2 border-t border-border">
              <Button onClick={handleSaveLecture} disabled={savingLecture} className="min-w-24">
                {savingLecture ? 'جاري الرفع...' : 'إضافة المحاضرة'}
              </Button>
              <Button variant="outline" onClick={()=>setLectureModal(false)} disabled={savingLecture}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}