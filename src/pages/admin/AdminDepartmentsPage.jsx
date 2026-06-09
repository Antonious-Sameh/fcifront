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
import { Plus, MoreHorizontal, Trash2, Edit2, RefreshCw, Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { departmentsAPI, adminAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

const ICON_OPTIONS = ['Code2','Database','Globe','Cpu','ShieldAlert','Layers','BookOpen','BrainCircuit'];
const COLOR_OPTIONS = ['blue','indigo','emerald','purple','red','amber','cyan','gray'];
const TYPE_OPTIONS = [{ value:'general', label:'قسم عام' }, { value:'special', label:'تخصص' }];

const emptyForm = {
  slug:'', nameAr:'', nameEn:'', descAr:'', descEn:'',
  prosAr:'', consAr:'', suitableAr:'', icon:'Code2', color:'blue', type:'general', order:'0',
};

const FormField = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-foreground">
      {label}{required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const load = async () => {
    try { setLoading(true); const d = await adminAPI.getAllDepartments(); setDepartments(d.departments||[]); }
    catch(e) { toast.error(e.message); } finally { setLoading(false); }
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

  const openModal = (dept = null) => {
    setErrors({});
    if (dept) {
      setEditing(dept);
      setForm({
        slug: dept.slug, nameAr: dept.name?.ar||'', nameEn: dept.name?.en||'',
        descAr: dept.description?.ar||'', descEn: dept.description?.en||'',
        prosAr: dept.pros?.ar||'', consAr: dept.cons?.ar||'',
        suitableAr: dept.suitableFor?.ar||'', icon: dept.icon||'Code2',
        color: dept.color||'blue', type: dept.type||'general', order: String(dept.order||0),
      });
    } else { setEditing(null); setForm(emptyForm); }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const payload = {
      slug: form.slug.trim(), order: Number(form.order)||0, type: form.type,
      name: { ar: form.nameAr.trim(), en: form.nameEn.trim() },
      description: { ar: form.descAr.trim(), en: form.descEn.trim() },
      pros: { ar: form.prosAr.trim() }, cons: { ar: form.consAr.trim() },
      suitableFor: { ar: form.suitableAr.trim() }, icon: form.icon, color: form.color,
    };
    try {
      if (editing) { await departmentsAPI.update(editing._id, payload); toast.success('تم تعديل القسم ✓'); }
      else { await departmentsAPI.create(payload); toast.success('تم إضافة القسم ✓'); }
      setIsModalOpen(false); load();
    } catch(e) { toast.error(e.message); } finally { setSaving(false); }
  };

  const handleToggle = async (dept) => {
    try {
      await departmentsAPI.update(dept._id, { isActive: !dept.isActive });
      setDepartments(prev => prev.map(d => d._id===dept._id ? {...d, isActive:!d.isActive} : d));
      toast.success(dept.isActive ? 'تم إخفاء القسم' : 'تم إظهار القسم');
    } catch(e) { toast.error(e.message); }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`حذف قسم "${dept.name?.ar}"؟`)) return;
    try { await departmentsAPI.delete(dept._id); setDepartments(p=>p.filter(d=>d._id!==dept._id)); toast.success('تم الحذف'); }
    catch(e) { toast.error(e.message); }
  };

  return (
    <AdminLayout>
      <Helmet><title>إدارة الأقسام | Admin</title></Helmet>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">أقسام الكلية</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {departments.length} قسم · {departments.filter(d=>d.isActive).length} ظاهر
              {departments.filter(d=>!d.isActive).length > 0 && ` · ${departments.filter(d=>!d.isActive).length} مخفي`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
            <Button onClick={() => openModal()} className="gap-2">
              <Plus className="w-4 h-4" /> إضافة قسم
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-right font-semibold">القسم</TableHead>
                  <TableHead className="text-right font-semibold">Slug</TableHead>
                  <TableHead className="text-right font-semibold">النوع</TableHead>
                  <TableHead className="text-right font-semibold">الترتيب</TableHead>
                  <TableHead className="text-right font-semibold">الحالة</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array(4).fill(0).map((_,i) => (
                  <TableRow key={i}>{Array(6).fill(0).map((_,j)=><TableCell key={j}><Skeleton className="h-5 w-full rounded"/></TableCell>)}</TableRow>
                )) : departments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>لا توجد أقسام بعد — أضف قسماً جديداً</p>
                  </TableCell></TableRow>
                ) : departments.map(dept => (
                  <TableRow key={dept._id} className={cn(!dept.isActive && 'opacity-60')}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{dept.name?.ar}</p>
                          {dept.name?.en && <p className="text-xs text-muted-foreground">{dept.name.en}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded font-mono">{dept.slug}</code></TableCell>
                    <TableCell><Badge variant="outline" className="font-normal text-xs">{dept.type==='general'?'عام':'تخصص'}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{dept.order}</TableCell>
                    <TableCell>
                      <Badge variant={dept.isActive ? 'default' : 'outline'} className={cn(!dept.isActive && 'text-muted-foreground')}>
                        {dept.isActive ? '● ظاهر' : '○ مخفي'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={()=>openModal(dept)}><Edit2 className="w-4 h-4 ml-2"/>تعديل</DropdownMenuItem>
                          <DropdownMenuItem onClick={()=>handleToggle(dept)}>
                            {dept.isActive?<><EyeOff className="w-4 h-4 ml-2"/>إخفاء</>:<><Eye className="w-4 h-4 ml-2"/>إظهار</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={()=>handleDelete(dept)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 ml-2"/>حذف
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
              <DialogTitle className="text-xl font-bold">{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {editing ? 'عدّل بيانات القسم ثم اضغط حفظ' : 'أدخل بيانات القسم الجديد'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Slug" required hint="مثال: cs, is, ai">
                  <Input value={form.slug}
                    onChange={e=>set('slug')({target:{value:e.target.value.toLowerCase().replace(/\s/g,'-')}})}
                    placeholder="cs" disabled={!!editing}
                    className={cn('h-10', errors.slug && 'border-destructive')} dir="ltr"/>
                  {errors.slug && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.slug}</p>}
                </FormField>
                <FormField label="نوع القسم">
                  <Select value={form.type} onValueChange={v=>setForm(p=>({...p,type:v}))}>
                    <SelectTrigger className="h-10"><SelectValue/></SelectTrigger>
                    <SelectContent>{TYPE_OPTIONS.map(t=><SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="الاسم بالعربي" required>
                <Input value={form.nameAr} onChange={set('nameAr')} placeholder="علوم الحاسب"
                  className={cn('h-10', errors.nameAr && 'border-destructive')}/>
                {errors.nameAr && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.nameAr}</p>}
              </FormField>

              <FormField label="الاسم بالإنجليزي">
                <Input value={form.nameEn} onChange={set('nameEn')} placeholder="Computer Science" className="h-10" dir="ltr"/>
              </FormField>

              <FormField label="الوصف التفصيلي" hint="اشرح القسم وطبيعة الدراسة فيه">
                <Textarea value={form.descAr} onChange={set('descAr')} placeholder="القسم ده بيركز على..." rows={3} className="resize-none"/>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="المميزات">
                  <Textarea value={form.prosAr} onChange={set('prosAr')} placeholder="مرتبات عالية · مطلوب في السوق..." rows={2} className="resize-none text-sm"/>
                </FormField>
                <FormField label="العيوب">
                  <Textarea value={form.consAr} onChange={set('consAr')} placeholder="دراسته تقيلة · محتاج مجهود..." rows={2} className="resize-none text-sm"/>
                </FormField>
              </div>

              <FormField label="مناسب لمين؟">
                <Textarea value={form.suitableAr} onChange={set('suitableAr')} placeholder="اللي بيحب البرمجة ومش بيزهق منها..." rows={2} className="resize-none"/>
              </FormField>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="الأيقونة">
                  <Select value={form.icon} onValueChange={v=>setForm(p=>({...p,icon:v}))}>
                    <SelectTrigger className="h-10"><SelectValue/></SelectTrigger>
                    <SelectContent>{ICON_OPTIONS.map(i=><SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="اللون">
                  <Select value={form.color} onValueChange={v=>setForm(p=>({...p,color:v}))}>
                    <SelectTrigger className="h-10"><SelectValue/></SelectTrigger>
                    <SelectContent>{COLOR_OPTIONS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="الترتيب">
                  <Input type="number" min="0" value={form.order} onChange={set('order')} className="h-10" dir="ltr"/>
                </FormField>
              </div>
            </div>

            <DialogFooter className="flex-row-reverse gap-2 pt-2 border-t border-border">
              <Button onClick={handleSave} disabled={saving} className="min-w-24">
                {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة القسم')}
              </Button>
              <Button variant="outline" onClick={()=>setIsModalOpen(false)} disabled={saving}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}