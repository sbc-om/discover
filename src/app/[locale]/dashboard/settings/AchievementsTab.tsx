'use client';

import { useEffect, useState } from 'react';
import { Award, ImagePlus, Loader2, Plus } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';

interface Achievement {
  id: string;
  title: string;
  title_ar?: string | null;
  description?: string | null;
  icon_url?: string | null;
}

export default function AchievementsTab() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [roleName, setRoleName] = useState<string>('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    title_ar: '',
    description: '',
    icon_url: '',
  });

  const canManage = roleName === 'admin' || roleName === 'academy_manager';

  const fetchRole = async () => {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    if (response.ok) {
      setRoleName(data.roleName || '');
    }
  };

  const fetchAchievements = async () => {
    const response = await fetch('/api/achievements');
    const data = await response.json();
    if (response.ok) {
      setAchievements(data.achievements || []);
    }
  };

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      await fetchRole();
      await fetchAchievements();
      setLoading(false);
    };
    boot();
  }, []);

  const handleUploadIcon = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', isAr ? 'حجم الملف كبير جداً' : 'File too large');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('type', 'achievement');
      formData.append('file', file);
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload');
      }
      setForm((prev) => ({ ...prev, icon_url: data.url }));
      showToast('success', isAr ? 'تم رفع الأيقونة' : 'Icon uploaded');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر الرفع' : 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      showToast('error', isAr ? 'اكتب اسم الإنجاز' : 'Enter a title');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          title_ar: form.title_ar.trim() || null,
          description: form.description.trim() || null,
          icon_url: form.icon_url || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create achievement');
      }
      setForm({ title: '', title_ar: '', description: '', icon_url: '' });
      await fetchAchievements();
      showToast('success', isAr ? 'تم إنشاء الإنجاز' : 'Achievement created');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر الإنشاء' : 'Failed to create'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            <Award className="h-4 w-4" />
            {isAr ? 'إنجاز جديد' : 'New achievement'}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'الاسم' : 'Title'}</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'الاسم بالعربية' : 'Arabic title'}</label>
              <input
                value={form.title_ar}
                onChange={(e) => setForm((prev) => ({ ...prev, title_ar: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'الوصف' : 'Description'}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {isAr ? 'رفع أيقونة' : 'Upload icon'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadIcon(file);
                  e.target.value = '';
                }}
                disabled={uploading}
              />
            </label>
            {form.icon_url && (
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img src={form.icon_url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isAr ? 'إضافة الإنجاز' : 'Create achievement'}
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {isAr ? 'الإنجازات' : 'Achievements'}
        </div>
        {achievements.length === 0 ? (
          <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
            {isAr ? 'لا توجد إنجازات بعد.' : 'No achievements yet.'}
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                  {achievement.icon_url ? (
                    <img src={achievement.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Award className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {isAr ? achievement.title_ar || achievement.title : achievement.title}
                  </p>
                  {achievement.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {achievement.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
