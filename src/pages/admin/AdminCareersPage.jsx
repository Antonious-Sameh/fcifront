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
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Plus, MoreHorizontal, Trash2, Edit2,
  RefreshCw, BrainCircuit, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { careersAPI, adminAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const ICON_OPTIONS = ['Layout','Server','Layers','Smartphone','Database','Bot','ShieldCheck','BrainCircuit','Code2','Globe'];
const COLOR_OPTIONS = ['blue','emerald','violet','rose','amber','purple','cyan','gray','red','indigo'];

const emptyForm = { slug:'', nameAr:'', nameEn:'', descAr:'', descEn:'', whyAr:'', icon:'BrainCircuit', color:'blue', order:'0' };

// ── Reusable form field ────────────────────────────────────────────
const FormField = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default function AdminCareersPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const load = async () => {
    try { setLoading(true); const d = await adminAPI.getAllCareers(); setCareers(d.careers||[]); }
    catch(e){ toast.error(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.slug.trim()) errs.slug = 'Slug مطلوب';
    if (!form.nameAr.trim()) errs.nameAr = 'الاسم بالعربي مطلوب';
    return errs;
  };

  const openModal = (career = null) => {
    setErrors({});
    if (career) {
      setEditing(career);
      setForm({
        slug: career.slug, nameAr: career.name?.ar||'', nameEn: career.name?.en||'',
        descAr: career.description?.ar||'', descEn: career.description?.en||'',
        whyAr: career.why?.ar||'', icon: career.icon||'BrainCircuit',
        color: career.color||'blue', order: String(career.order||0),
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const payload = {
      slug: form.slug.trim(), order: Number(form.order)||0,
      name: { ar: form.nameAr.trim(), en: form.nameEn.trim() },
      description: { ar: form.descAr.trim(), en: form.descEn.trim() },
      why: { ar: form.whyAr.trim() },
      icon: form.icon, color: form.color,
    };
    try {
      if (editing) { await careersAPI.update(editing._id, payload); toast.success('تم تعديل المسار ✓'); }
      else { await careersAPI.create(payload); toast.success('تم إضافة المسار ✓'); }
      setIsModalOpen(false); load();
    } catch(e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (career) => {
    try {
      await careersAPI.update(career._id, { isActive: !career.isActive });
      setCareers(prev => prev.map(c => c._id===career._id ? {...c, isActive:!c.isActive} : c));
      toast.success(career.isActive ? 'تم إخفاء المسار' : 'تم إظهار المسار');
    } catch(e) { toast.error(e.message); }
  };

  const handleDelete = async (career) => {
    if (!window.confirm(`حذف مسار "${career.name?.ar}"؟ لا يمكن التراجع.`)) return;
    try { await careersAPI.delete(career._id); setCareers(prev=>prev.filter(c=>c._id!==career._id)); toast.success('تم الحذف'); }
    catch(e) { toast.error(e.message); }
  };

  const visibleCount = careers.filter(c => c.isActive).length;
  const hiddenCount = careers.filter(c => !c.isActive).length;

  return (
    <AdminLayout>
      <Helmet><title>إدارة المسارات المهنية | Admin</title></Helmet>
      <div className="space-y-6" dir="rtl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">المسارات المهنية</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{careers.length} مسار إجمالي</span>
              <span>·</span>
              <span className="text-emerald-600">{visibleCount} ظاهر</span>
              {hiddenCount > 0 && <><span>·</span><span className="text-amber-600">{hiddenCount} مخفي</span></>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
            <Button onClick={() => openModal()} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة مسار
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-right font-semibold">المسار</TableHead>
                  <TableHead className="text-right font-semibold">Slug</TableHead>
                  <TableHead className="text-right font-semibold">المراحل</TableHead>
                  <TableHead className="text-right font-semibold">الترتيب</TableHead>
                  <TableHead className="text-right font-semibold">الحالة</TableHead>
                  <TableHead className="text-right font-semibold w-12">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array(4).fill(0).map((_,i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((_,j) => <TableCell key={j}><Skeleton className="h-5 w-full rounded" /></TableCell>)}
                  </TableRow>
                )) : careers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <BrainCircuit className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>لا توجد مسارات بعد — أضف أول مسار</p>
                  </TableCell></TableRow>
                ) : careers.map(career => (
                  <TableRow key={career._id} className={cn(!career.isActive && 'opacity-60')}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BrainCircuit className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{career.name?.ar}</p>
                          {career.name?.en && <p className="text-xs text-muted-foreground">{career.name.en}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{career.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {career.levels?.length || 0} مراحل
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{career.order}</TableCell>
                    <TableCell>
                      <Badge variant={career.isActive ? 'default' : 'outline'}
                        className={cn(!career.isActive && 'text-muted-foreground')}>
                        {career.isActive ? '● ظاهر' : '○ مخفي'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openModal(career)}>
                            <Edit2 className="w-4 h-4 ml-2" /> تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(career)}>
                            {career.isActive
                              ? <><EyeOff className="w-4 h-4 ml-2" /> إخفاء</>
                              : <><Eye className="w-4 h-4 ml-2" /> إظهار</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(career)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 ml-2" /> حذف
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

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold">
                {editing ? 'تعديل المسار المهني' : 'إضافة مسار جديد'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {editing ? 'عدّل بيانات المسار ثم اضغط حفظ' : 'أدخل بيانات المسار الجديد'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Row: Slug + Order */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Slug (رابط المسار)" required hint="مثال: frontend, backend">
                  <Input
                    value={form.slug}
                    onChange={e => set('slug')({ target: { value: e.target.value.toLowerCase().replace(/\s/g, '-') } })}
                    placeholder="frontend"
                    disabled={!!editing}
                    className={cn('h-10', errors.slug && 'border-destructive focus-visible:ring-destructive')}
                    dir="ltr"
                  />
                  {errors.slug && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.slug}</p>}
                </FormField>
                <FormField label="الترتيب" hint="الأصغر يظهر أولاً">
                  <Input type="number" min="0" value={form.order} onChange={set('order')} className="h-10" dir="ltr" />
                </FormField>
              </div>

              {/* Names */}
              <FormField label="الاسم بالعربي" required>
                <Input value={form.nameAr} onChange={set('nameAr')} placeholder="تطوير الواجهات"
                  className={cn('h-10', errors.nameAr && 'border-destructive')} />
                {errors.nameAr && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nameAr}</p>}
              </FormField>
              <FormField label="الاسم بالإنجليزي">
                <Input value={form.nameEn} onChange={set('nameEn')} placeholder="Frontend Development" className="h-10" dir="ltr" />
              </FormField>

              {/* Description */}
              <FormField label="الوصف بالعربي" hint="اشرح المسار ده بالتفصيل">
                <Textarea value={form.descAr} onChange={set('descAr')} placeholder="وصف تفصيلي للمسار وإيه اللي هيتعلمه الطالب..."
                  rows={3} className="resize-none" />
              </FormField>

              {/* Why */}
              <FormField label="ليه تختار المسار ده؟" hint="اشرح السبب الرئيسي لاختيار المسار">
                <Textarea value={form.whyAr} onChange={set('whyAr')} placeholder="لو بتحب... ده مجالك..."
                  rows={2} className="resize-none" />
              </FormField>

              {/* Icon + Color */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="الأيقونة">
                  <Select value={form.icon} onValueChange={v => setForm(p => ({...p, icon: v}))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="اللون">
                  <Select value={form.color} onValueChange={v => setForm(p => ({...p, color: v}))}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            <DialogFooter className="flex-row-reverse gap-2 pt-2 border-t border-border">
              <Button onClick={handleSave} disabled={saving} className="min-w-24">
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة المسار')}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}