import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/layouts/AdminLayout.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { profileAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext.jsx';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const FormField = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}</Label>
    {children}
  </div>
);

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuth();

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) return toast.error('الاسم مطلوب');
    setSavingProfile(true);
    try {
      await profileAPI.update({ name: name.trim() });
      updateUser({ name: name.trim() });
      toast.success('تم تحديث الاسم ✓');
    } catch (e) { toast.error(e.message); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass)
      return toast.error('جميع الحقول مطلوبة');
    if (newPass !== confirmPass)
      return toast.error('كلمة المرور الجديدة غير متطابقة');
    if (newPass.length < 6)
      return toast.error('كلمة المرور لا تقل عن 6 أحرف');
    setSavingPass(true);
    try {
      await profileAPI.changePassword(currentPass, newPass);
      toast.success('تم تغيير كلمة المرور ✓');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (e) { toast.error(e.message || 'كلمة المرور الحالية غلط'); }
    finally { setSavingPass(false); }
  };

  return (
    <AdminLayout>
      <Helmet><title>الإعدادات | Admin</title></Helmet>
      <div className="space-y-8 max-w-xl" dir="rtl">
        <div>
          <h1 className="text-2xl font-black tracking-tight">إعدادات الحساب</h1>
          <p className="text-muted-foreground text-sm mt-1">تعديل بيانات حسابك الشخصي</p>
        </div>

        {/* Profile Section */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg"><User className="w-5 h-5 text-primary" /></div>
            <h2 className="font-bold">البيانات الشخصية</h2>
          </div>
          <FormField label="الاسم">
            <Input value={name} onChange={e => setName(e.target.value)} className="h-11" placeholder="اسمك الكامل" />
          </FormField>
          <FormField label="البريد الإلكتروني">
            <Input value={user?.email || ''} disabled className="h-11 opacity-60" dir="ltr" />
          </FormField>
          <Button onClick={handleSaveName} disabled={savingProfile} className="w-full h-11">
            {savingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>

        {/* Password Section */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg"><Lock className="w-5 h-5 text-amber-600" /></div>
            <h2 className="font-bold">تغيير كلمة المرور</h2>
          </div>
          <FormField label="كلمة المرور الحالية">
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} value={currentPass}
                onChange={e => setCurrentPass(e.target.value)} className="h-11 pr-10" placeholder="••••••••" />
              <button onClick={() => setShowCurrent(p => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>
          <FormField label="كلمة المرور الجديدة">
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={newPass}
                onChange={e => setNewPass(e.target.value)} className="h-11 pr-10" placeholder="6 أحرف على الأقل" />
              <button onClick={() => setShowNew(p => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>
          <FormField label="تأكيد كلمة المرور الجديدة">
            <Input type="password" value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)} className="h-11" placeholder="••••••••" />
          </FormField>
          <Button onClick={handleChangePassword} disabled={savingPass} variant="outline" className="w-full h-11">
            {savingPass ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}