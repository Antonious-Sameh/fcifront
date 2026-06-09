import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Mail, Hash, GraduationCap, Lock,
  Save, Eye, EyeOff, CheckCircle2, AlertCircle, Shield
} from 'lucide-react';
import { profileAPI } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const YEAR_COLORS = {
  1: { bg: 'bg-blue-500/10',   text: 'text-blue-600',   solid: 'bg-blue-500'   },
  2: { bg: 'bg-emerald-500/10',text: 'text-emerald-600',solid: 'bg-emerald-500' },
  3: { bg: 'bg-violet-500/10', text: 'text-violet-600', solid: 'bg-violet-500'  },
  4: { bg: 'bg-amber-500/10',  text: 'text-amber-600',  solid: 'bg-amber-500'   },
};

const InfoField = ({ icon: Icon, label, value, isAr }) => (
  <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50', isAr && 'flex-row-reverse')}>
    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
    <div className={cn('min-w-0', isAr && 'text-right')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || '—'}</p>
    </div>
  </div>
);

const ProfilePage = () => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useAuth();
  const isAr = language === 'ar';

  // Edit form
  const [name, setName] = useState(user?.name || '');
  const [year, setYear] = useState(user?.year || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [saving, setSaving] = useState(false);

  // Password form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const yearCol = YEAR_COLORS[user?.year] || YEAR_COLORS[1];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error(isAr ? 'الاسم مطلوب' : 'Name is required');
    setSaving(true);
    try {
      await profileAPI.updateProfile({ name, year: year ? Number(year) : undefined, studentId });
      updateUser({ name, year: year ? Number(year) : user?.year, studentId });
      toast.success(isAr ? 'تم حفظ البيانات ✓' : 'Profile saved ✓');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) return toast.error(isAr ? 'جميع الحقول مطلوبة' : 'All fields required');
    if (newPass !== confirmPass) return toast.error(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
    if (newPass.length < 6) return toast.error(isAr ? 'كلمة المرور لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
    setChangingPass(true);
    try {
      await profileAPI.changePassword(currentPass, newPass);
      toast.success(isAr ? 'تم تغيير كلمة المرور ✓' : 'Password changed ✓');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <>
      <Helmet><title>{isAr ? 'الملف الشخصي' : 'Profile'} | Student Core</title></Helmet>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-2 md:px-4 py-6" dir={isAr ? 'rtl' : 'ltr'}>

          {/* ── Header ── */}
          <div className={cn('flex items-center gap-5 mb-8', isAr && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0', yearCol.solid)}>
              {initials}
            </div>
            <div className={isAr ? 'text-right' : ''}>
              <h1 className="text-3xl font-black tracking-tight mb-1">{user?.name}</h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <div className={cn('flex items-center gap-2 mt-2', isAr && 'flex-row-reverse')}>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', yearCol.bg, yearCol.text)}>
                  {user?.year ? (isAr ? `السنة ${user.year}` : `Year ${user.year}`) : (isAr ? 'طالب' : 'Student')}
                </span>
                {user?.role === 'admin' && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-500/10 text-red-600 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" dir={isAr ? 'rtl' : 'ltr'}>
            <TabsList className="mb-6 h-10">
              <TabsTrigger value="info" className="gap-1.5">
                <User className="w-3.5 h-3.5" />
                {isAr ? 'البيانات الشخصية' : 'Personal Info'}
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {isAr ? 'الأمان' : 'Security'}
              </TabsTrigger>
            </TabsList>

            {/* ── Info Tab ── */}
            <TabsContent value="info" className="space-y-6">
              {/* Read-only info */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className={cn('font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4', isAr && 'text-right')}>
                  {isAr ? 'معلومات الحساب' : 'Account Info'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoField icon={Mail} label={isAr ? 'الإيميل' : 'Email'} value={user?.email} isAr={isAr} />
                  <InfoField icon={Shield} label={isAr ? 'نوع الحساب' : 'Role'} value={user?.role === 'admin' ? 'Admin' : (isAr ? 'طالب' : 'Student')} isAr={isAr} />
                </div>
              </div>

              {/* Editable info */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className={cn('font-bold text-sm text-muted-foreground uppercase tracking-wider mb-5', isAr && 'text-right')}>
                  {isAr ? 'تعديل البيانات' : 'Edit Info'}
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className={isAr ? 'block text-right' : ''}>{isAr ? 'الاسم الكامل' : 'Full Name'}</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      dir={isAr ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className={isAr ? 'block text-right' : ''}>{isAr ? 'السنة الدراسية' : 'Academic Year'}</Label>
                      <select
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                        dir={isAr ? 'rtl' : 'ltr'}
                      >
                        <option value="">{isAr ? '— اختر السنة —' : '— Select Year —'}</option>
                        {[1,2,3,4].map(y => (
                          <option key={y} value={y}>{isAr ? `السنة ${y}` : `Year ${y}`}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className={isAr ? 'block text-right' : ''}>{isAr ? 'رقم القيد (اختياري)' : 'Student ID (optional)'}</Label>
                      <Input
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        placeholder="2021XXXX"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className={cn('flex justify-end pt-2', isAr && 'justify-start')}>
                    <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                      {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (
                        <><Save className="w-4 h-4" />{isAr ? 'حفظ التعديلات' : 'Save Changes'}</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Security Tab ── */}
            <TabsContent value="security">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className={cn('font-bold text-sm text-muted-foreground uppercase tracking-wider mb-5', isAr && 'text-right')}>
                  {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
                </h2>
                <div className="space-y-4 max-w-sm">
                  {/* Current */}
                  <div className="space-y-1.5">
                    <Label className={isAr ? 'block text-right' : ''}>{isAr ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPass}
                        onChange={e => setCurrentPass(e.target.value)}
                        dir="ltr"
                        className={isAr ? 'pr-3 pl-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(p => !p)}
                        className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground', isAr ? 'left-3' : 'right-3')}
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New */}
                  <div className="space-y-1.5">
                    <Label className={isAr ? 'block text-right' : ''}>{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        dir="ltr"
                        className={isAr ? 'pr-3 pl-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(p => !p)}
                        className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground', isAr ? 'left-3' : 'right-3')}
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1.5">
                    <Label className={isAr ? 'block text-right' : ''}>{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                    <Input
                      type="password"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      dir="ltr"
                      className={cn(
                        confirmPass && (confirmPass === newPass ? 'border-emerald-500 focus-visible:ring-emerald-500' : 'border-destructive focus-visible:ring-destructive')
                      )}
                    />
                    {confirmPass && confirmPass !== newPass && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                      </p>
                    )}
                    {confirmPass && confirmPass === newPass && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPass}
                    variant="destructive"
                    className="gap-2 w-full mt-2"
                  >
                    {changingPass ? (isAr ? 'جاري التغيير...' : 'Changing...') : (
                      <><Lock className="w-4 h-4" />{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ProfilePage;